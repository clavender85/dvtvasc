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

  return alerts;
}
