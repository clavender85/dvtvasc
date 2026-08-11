// Validation engine for smart anatomical consistency checks

import { ExamState, ValidationAlert } from '../types/dvt';

export function runValidationChecks(state: ExamState): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];

  // Check 1: Abnormal CFV phasicity
  if (state.doppler.rightCFVPhasicity === 'reduced_phasicity' || state.doppler.rightCFVPhasicity === 'continuous_non_phasic') {
    alerts.push({
      id: 'alert-doppler-rcfv',
      severity: 'info',
      title: 'Reduced Right CFV Respiratory Phasicity',
      message: 'Reduced respiratory phasicity at Right CFV may warrant assessment for more proximal pelvic venous obstruction where clinically appropriate.'
    });
  }
  if (state.doppler.leftCFVPhasicity === 'reduced_phasicity' || state.doppler.leftCFVPhasicity === 'continuous_non_phasic') {
    alerts.push({
      id: 'alert-doppler-lcfv',
      severity: 'info',
      title: 'Reduced Left CFV Respiratory Phasicity',
      message: 'Reduced respiratory phasicity at Left CFV may warrant assessment for more proximal pelvic venous obstruction where clinically appropriate.'
    });
  }

  // Check 2: Superficial GSV proximity to SFJ
  ['right_GSV_PROX', 'left_GSV_PROX'].forEach((id) => {
    const finding = state.vesselFindings[id];
    if (finding && finding.status === 'abnormal' && finding.thrombusPresence === 'thrombus_present') {
      if (!finding.distanceToJunction || finding.distanceToJunction.distanceMm === undefined || finding.distanceToJunction.distanceMm === null) {
        alerts.push({
          id: `alert-gsv-sfj-${id}`,
          severity: 'warning',
          title: 'Missing Distance to SFJ',
          message: `${finding.vesselName}: Thrombus documented without specifying distance (mm) to Saphenofemoral Junction (SFJ).`,
          vesselId: id
        });
      }
    }
  });

  // Check 3: Superficial SSV proximity to SPJ
  ['right_SSV', 'left_SSV'].forEach((id) => {
    const finding = state.vesselFindings[id];
    if (finding && finding.status === 'abnormal' && finding.thrombusPresence === 'thrombus_present') {
      if (!finding.distanceToJunction || finding.distanceToJunction.distanceMm === undefined || finding.distanceToJunction.distanceMm === null) {
        alerts.push({
          id: `alert-ssv-spj-${id}`,
          severity: 'warning',
          title: 'Missing Distance to SPJ',
          message: `${finding.vesselName}: Thrombus documented without specifying distance (mm) to Saphenopopliteal Junction (SPJ).`,
          vesselId: id
        });
      }
    }
  });

  // Check 4: Unvisualised vessels marked in limitations
  if (state.limitations.hasLimitations && state.limitations.affectedVesselIds.length > 0) {
    alerts.push({
      id: 'alert-limitations-active',
      severity: 'info',
      title: 'Technical Limitations Recorded',
      message: `${state.limitations.affectedVesselIds.length} vessel segment(s) documented as incomplete/not visualised due to ${state.limitations.factors.join(', ') || 'technical factors'}. Generated summary will exclude unvisualised vessels from normal statements.`
    });
  }

  // Check 5: Continuity prompt if popliteal & calf deep both abnormal
  ['right', 'left'].forEach((side) => {
    const pop = state.vesselFindings[`${side}_POPV`];
    const ptv = state.vesselFindings[`${side}_PTV`];
    const per = state.vesselFindings[`${side}_PERV`];

    if (pop && pop.status === 'abnormal' && ((ptv && ptv.status === 'abnormal') || (per && per.status === 'abnormal'))) {
      if (!pop.continuity) {
        alerts.push({
          id: `alert-continuity-${side}`,
          severity: 'info',
          title: 'Thrombus Continuity Unspecified',
          message: `${side.toUpperCase()} Popliteal and calf deep vein thrombi are both documented. Please specify whether these findings are continuous across segments.`,
          vesselId: `${side}_POPV`
        });
      }
    }
  });

  // Check 6: Unilateral exam safeguard
  if (state.header.examType === 'Right lower limb' || state.header.examType === 'Left lower limb') {
    const unexaminedSide = state.header.examType === 'Right lower limb' ? 'left' : 'right';
    alerts.push({
      id: 'alert-unilateral-safeguard',
      severity: 'info',
      title: 'Unilateral Examination Scope',
      message: `Study is specified as ${state.header.examType}. Unexamined ${unexaminedSide} lower limb will be explicitly noted as not assessed.`
    });
  }

  // Check 7: Superficial thrombus within 20mm (2cm) of SFJ or SPJ (High Risk of Propagation)
  ['right_GSV_PROX', 'left_GSV_PROX', 'right_SSV', 'left_SSV'].forEach((id) => {
    const finding = state.vesselFindings[id];
    if (finding && finding.status === 'abnormal' && finding.distanceToJunction?.distanceMm !== undefined && finding.distanceToJunction.distanceMm !== null) {
      const dist = finding.distanceToJunction.distanceMm;
      if (dist <= 20) {
        alerts.push({
          id: `alert-junction-proximity-${id}`,
          severity: 'warning',
          title: 'High-Risk Superficial Thrombus Near Deep Junction',
          message: `${finding.vesselName}: Thrombus extends within ${dist} mm (≤ 2.0 cm) of ${finding.distanceToJunction.junction || 'deep junction'}. High clinical risk of propagation into deep venous system.`,
          vesselId: id
        });
      }
    }
  });

  // Check 8: Summary Text Contradiction Guard
  if (state.generatedSummary) {
    const summaryLower = state.generatedSummary.toLowerCase();
    const allFindings = Object.values(state.vesselFindings);
    const hasDeepDvt = allFindings.some(f => f.status === 'abnormal' && (f.category === 'thigh' || f.category === 'popliteal' || f.category === 'pelvis' || f.category === 'calf_deep' || f.category === 'muscular_calf'));
    
    if (hasDeepDvt && (summaryLower.includes('no deep venous thrombosis is identified') || summaryLower.includes('no dvt is identified'))) {
      alerts.push({
        id: 'alert-contradiction-dvt',
        severity: 'warning',
        title: 'CRITICAL REPORT CONTRADICTION',
        message: 'Report summary contains "No deep venous thrombosis identified", but abnormal deep or calf vein thrombus is documented in the worksheet. Please regenerate or correct report text.'
      });
    }
  }

  // Check 9: Routine segment completion check in examined scope
  const { rightLowerLimb, leftLowerLimb } = state.header.scope?.regionsExamined || { rightLowerLimb: true, leftLowerLimb: true };
  const unassessedRoutine: string[] = [];
  
  Object.values(state.vesselFindings).forEach((vf) => {
    const isExaminedLeg = (vf.side === 'right' && rightLowerLimb) || (vf.side === 'left' && leftLowerLimb);
    if (isExaminedLeg && vf.status === 'not_assessed') {
      unassessedRoutine.push(vf.vesselName);
    }
  });

  if (unassessedRoutine.length > 0) {
    alerts.push({
      id: 'alert-unassessed-routine',
      severity: 'info',
      title: 'Incomplete Segment Assessment',
      message: `${unassessedRoutine.length} vessel segment(s) in examined leg scope remain unassessed (e.g., ${unassessedRoutine.slice(0, 3).join(', ')}). Consider completing or documenting technical limitation.`
    });
  }

  // Check 10: Positive DVT Direct Communication Prompt
  const hasDvt = Object.values(state.vesselFindings).some(vf => vf.status === 'abnormal');
  if (hasDvt && state.clinicalCommunication?.contacted === 'No') {
    alerts.push({
      id: 'alert-comm-pending',
      severity: 'warning',
      title: 'Positive DVT — Direct Communication Pending',
      message: 'Positive DVT documented with clinical direct contact recorded as "No (Urgent alert pending)". Please complete clinical communication details.'
    });
  }

  // Check 11: Common Femoral Vein Thrombus without Iliocaval Assessment
  const hasCFVThrombus =
    state.vesselFindings['right_CFV']?.status === 'abnormal' ||
    state.vesselFindings['left_CFV']?.status === 'abnormal';
  const iliocavalAssessed = state.header.scope?.regionsExamined.iliocaval || state.pelvic?.ivcVisualised !== 'not_visualised';

  if (hasCFVThrombus && !iliocavalAssessed) {
    alerts.push({
      id: 'alert-cfv-iliocaval-prompt',
      severity: 'warning',
      title: 'CFV Thrombus — Iliocaval Extent Unassessed',
      message: 'Common Femoral Vein thrombus documented without iliocaval venous scope. Consider extending assessment to pelvic/iliocaval veins to evaluate proximal thrombus extent.'
    });
  }

  // Check 12: Stale Manual Summary Edit Alert
  if (state.userSummaryEdited) {
    alerts.push({
      id: 'alert-stale-manual-report',
      severity: 'info',
      title: 'Manual Report Edits Active',
      message: 'Report text contains manual sonographer modifications. Verify report consistency if worksheet findings were updated.'
    });
  }

  return alerts;
}
