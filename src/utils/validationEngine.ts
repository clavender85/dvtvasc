// Validation engine for smart anatomical consistency checks

import { ExamState, ValidationAlert, VesselFinding } from '../types/dvt';
import { ROUTINE_VESSEL_KEYS } from '../data/anatomyData';

export function runValidationChecks(state: ExamState): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const scope = state.header.scope?.regionsExamined || { rightLowerLimb: true, leftLowerLimb: true, iliocaval: false };

  // ==========================================
  // LEVEL 1: ERRORS (Red - Genuine Contradictions)
  // ==========================================

  // Error 1: Report text vs Worksheet DVT Contradiction
  if (state.generatedSummary) {
    const summaryLower = (state.generatedSummary || '').toLowerCase();
    const allFindings = Object.values(state.vesselFindings);
    const hasDeepDvt = allFindings.some(
      (f) => f.status === 'abnormal' && (f.category === 'thigh' || f.category === 'popliteal' || f.category === 'pelvis' || f.category === 'calf_deep' || f.category === 'muscular_calf')
    );

    if (hasDeepDvt && (summaryLower.includes('no deep venous thrombosis is identified') || summaryLower.includes('no dvt is identified'))) {
      alerts.push({
        id: 'alert-contradiction-dvt',
        severity: 'error',
        title: 'Report Text Contradiction',
        message: 'Report text states "No DVT identified", but deep venous thrombosis is documented in worksheet. Please regenerate report.'
      });
    }
  }

  // Error 2: Vessel state contradictions (e.g. Not Visualised or Occluded marked Fully Compressible)
  Object.entries(state.vesselFindings).forEach(([vId, f]) => {
    if (f.status === 'not_visualised' && f.compressibility === 'fully_compressible') {
      alerts.push({
        id: `alert-err-nv-comp-${vId}`,
        severity: 'error',
        title: 'Anatomical Data Contradiction',
        message: `${f.vesselName}: Marked as "Not Visualised" but recorded as "Fully Compressible".`,
        vesselId: vId,
        actionVesselId: vId
      });
    }

    if (f.patency === 'completely_occluded' && f.compressibility === 'fully_compressible') {
      alerts.push({
        id: `alert-err-occl-comp-${vId}`,
        severity: 'error',
        title: 'Patency vs Compression Contradiction',
        message: `${f.vesselName}: Marked as "Completely Occluded" but recorded as "Fully Compressible".`,
        vesselId: vId,
        actionVesselId: vId
      });
    }
  });


  // ==========================================
  // LEVEL 2: REVIEW (Amber - Potentially Incomplete Clinical Data)
  // ==========================================

  // Review 1: Incomplete required routine segments in examined leg scope
  const unassessedRoutine: { name: string; id: string; side: string }[] = [];

  Object.values(state.vesselFindings).forEach((vf) => {
    const isExaminedLeg =
      (vf.side === 'right' && scope.rightLowerLimb) ||
      (vf.side === 'left' && scope.leftLowerLimb);

    // Only required routine vessels that are UNSET (not_assessed)
    // Note: 'not_visualised' is DOCUMENTED, NOT unset!
    // Optional vessels (like ATV) are excluded.
    if (isExaminedLeg && vf.status === 'not_assessed' && ROUTINE_VESSEL_KEYS.includes(vf.vesselKey)) {
      unassessedRoutine.push({ name: vf.vesselName, id: vf.id, side: vf.side });
    }
  });

  if (unassessedRoutine.length > 0) {
    alerts.push({
      id: 'alert-unassessed-routine',
      severity: 'warning',
      title: 'Incomplete Routine Segments',
      message: `${unassessedRoutine.length} required routine segment(s) remain unassessed (e.g. ${unassessedRoutine.slice(0, 3).map((u) => u.name).join(', ')}).`,
      actionVesselId: unassessedRoutine[0].id
    });
  }

  // Review 2: Iliocaval Assessment Check (ONLY if Iliocaval is explicitly selected)
  if (scope.iliocaval) {
    const pelvicUnassessed: string[] = [];
    ['pelvis_IVC', 'pelvis_CIV_R', 'pelvis_CIV_L', 'pelvis_EIV_R', 'pelvis_EIV_L'].forEach((id) => {
      const f = state.vesselFindings[id];
      if (f && f.status === 'not_assessed') {
        pelvicUnassessed.push(f.vesselName);
      }
    });

    if (pelvicUnassessed.length > 0) {
      alerts.push({
        id: 'alert-iliocaval-incomplete',
        severity: 'warning',
        title: 'Iliocaval Assessment Incomplete',
        message: `${pelvicUnassessed.length} vessel segment(s) in selected iliocaval scope remain unset (e.g. ${pelvicUnassessed.slice(0, 2).join(', ')}).`,
        region: 'iliocaval'
      });
    }
  }

  // Review 3: CFV Thrombus documented without Iliocaval Assessment
  const hasCFVThrombus =
    state.vesselFindings['right_CFV']?.status === 'abnormal' ||
    state.vesselFindings['left_CFV']?.status === 'abnormal';

  if (hasCFVThrombus && !scope.iliocaval && state.pelvic?.ivcVisualised === 'not_visualised') {
    alerts.push({
      id: 'alert-cfv-iliocaval-prompt',
      severity: 'warning',
      title: 'CFV Thrombus — Proximal Extent Unassessed',
      message: 'Common Femoral Vein thrombus documented without iliocaval scope. Consider extending assessment to pelvic/iliocaval veins.',
      region: 'iliocaval'
    });
  }

  // Review 4: GSV proximity to SFJ missing distance
  ['right_GSV_PROX', 'left_GSV_PROX'].forEach((id) => {
    const f = state.vesselFindings[id];
    if (f && f.status === 'abnormal' && f.thrombusPresence === 'thrombus_present') {
      if (!f.distanceToJunction || f.distanceToJunction.distanceMm === undefined || f.distanceToJunction.distanceMm === null) {
        alerts.push({
          id: `alert-gsv-sfj-${id}`,
          severity: 'warning',
          title: 'Missing SFJ Distance',
          message: `${f.vesselName}: Thrombus documented without specifying distance (mm) to Saphenofemoral Junction (SFJ).`,
          vesselId: id,
          actionVesselId: id
        });
      }
    }
  });

  // Review 5: SSV proximity to SPJ missing distance
  ['right_SSV', 'left_SSV'].forEach((id) => {
    const f = state.vesselFindings[id];
    if (f && f.status === 'abnormal' && f.thrombusPresence === 'thrombus_present') {
      if (!f.distanceToJunction || f.distanceToJunction.distanceMm === undefined || f.distanceToJunction.distanceMm === null) {
        alerts.push({
          id: `alert-ssv-spj-${id}`,
          severity: 'warning',
          title: 'Missing SPJ Distance',
          message: `${f.vesselName}: Thrombus documented without specifying distance (mm) to Saphenopopliteal Junction (SPJ).`,
          vesselId: id,
          actionVesselId: id
        });
      }
    }
  });

  // Review 6: High-risk superficial thrombus within 20mm of deep junction
  ['right_GSV_PROX', 'left_GSV_PROX', 'right_SSV', 'left_SSV'].forEach((id) => {
    const f = state.vesselFindings[id];
    if (f && f.status === 'abnormal' && f.distanceToJunction?.distanceMm !== undefined && f.distanceToJunction.distanceMm !== null) {
      const dist = f.distanceToJunction.distanceMm;
      if (dist <= 20) {
        alerts.push({
          id: `alert-junction-proximity-${id}`,
          severity: 'warning',
          title: 'Superficial Thrombus Near Deep Junction',
          message: `${f.vesselName}: Thrombus extends within ${dist} mm (≤ 2.0 cm) of ${f.distanceToJunction.junction || 'deep junction'}. High risk of propagation.`,
          vesselId: id,
          actionVesselId: id
        });
      }
    }
  });

  // Review 7: Popliteal & calf deep continuity
  ['right', 'left'].forEach((side) => {
    const pop = state.vesselFindings[`${side}_POPV`];
    const ptv = state.vesselFindings[`${side}_PTV`];
    const per = state.vesselFindings[`${side}_PERV`];

    if (pop && pop.status === 'abnormal' && ((ptv && ptv.status === 'abnormal') || (per && per.status === 'abnormal'))) {
      if (!pop.continuity) {
        alerts.push({
          id: `alert-continuity-${side}`,
          severity: 'warning',
          title: 'Thrombus Continuity Unspecified',
          message: `${side.toUpperCase()} Popliteal and calf deep vein thrombi both documented. Please specify continuity across segments.`,
          vesselId: `${side}_POPV`,
          actionVesselId: `${side}_POPV`
        });
      }
    }
  });

  // Review 8: Positive DVT Direct Communication Prompt
  const hasDvt = Object.values(state.vesselFindings).some((vf) => vf.status === 'abnormal');
  if (hasDvt && state.clinicalCommunication?.contacted === 'No') {
    alerts.push({
      id: 'alert-comm-pending',
      severity: 'warning',
      title: 'Urgent Clinical Communication Pending',
      message: 'Positive DVT documented with direct clinical contact recorded as "No (Alert pending)". Please finalize communication.'
    });
  }


  // ==========================================
  // LEVEL 3: INFORMATION (Blue/Grey - Neutral Info)
  // ==========================================

  // Info 1: Technical Limitations Recorded
  if (state.limitations.hasLimitations && state.limitations.affectedVesselIds.length > 0) {
    alerts.push({
      id: 'alert-limitations-active',
      severity: 'info',
      title: 'Technical Limitations Documented',
      message: `${state.limitations.affectedVesselIds.length} segment(s) documented with technical limitations (${state.limitations.factors.join(', ') || 'technical factors'}).`,
      dismissable: true
    });
  }

  // Info 2: Reduced CFV Phasicity
  if (state.doppler.rightCFVPhasicity === 'reduced_phasicity' || state.doppler.rightCFVPhasicity === 'continuous_non_phasic') {
    alerts.push({
      id: 'alert-doppler-rcfv',
      severity: 'info',
      title: 'Reduced Right CFV Respiratory Phasicity',
      message: 'Reduced respiratory phasicity at Right CFV noted.',
      dismissable: true
    });
  }
  if (state.doppler.leftCFVPhasicity === 'reduced_phasicity' || state.doppler.leftCFVPhasicity === 'continuous_non_phasic') {
    alerts.push({
      id: 'alert-doppler-lcfv',
      severity: 'info',
      title: 'Reduced Left CFV Respiratory Phasicity',
      message: 'Reduced respiratory phasicity at Left CFV noted.',
      dismissable: true
    });
  }

  // Info 3: Manual Report Edits Active
  if (state.userSummaryEdited) {
    alerts.push({
      id: 'alert-stale-manual-report',
      severity: 'info',
      title: 'Manual Report Edits Active',
      message: 'Report text contains manual sonographer modifications. Verify report consistency if worksheet was updated.',
      dismissable: true
    });
  }

  return alerts;
}

