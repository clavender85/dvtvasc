// Prior Study Comparison Engine - Clinical Calculation, Logic & Rule Verification

import {
  ExamState,
  VesselFinding,
  PriorVesselFinding,
  VesselComparison,
  ComparisonOutcome,
  ThrombusGroup,
  ValidationAlert,
  ComparisonState,
  ExtentLandmark
} from '../types/dvt';
import { ANATOMICAL_VESSELS, LANDMARK_LABELS } from '../data/anatomyData';

/**
 * Calculates anatomical distance difference if same landmark is used
 */
export function calculateExtentDifference(
  prior?: ExtentLandmark,
  current?: ExtentLandmark
): { canCalculate: boolean; message: string; diffCm?: number; direction?: 'proximal_extension' | 'retraction' | 'stable' } {
  if (!prior || !current) {
    return { canCalculate: false, message: 'Incomplete extent boundary documentation.' };
  }

  // Handle 'at' relation where distance is 0 or null
  const priorDist = prior.relation === 'at' ? 0 : prior.distance;
  const currentDist = current.relation === 'at' ? 0 : current.distance;

  if (priorDist === null || currentDist === null) {
    return { canCalculate: false, message: 'Incomplete extent boundary documentation.' };
  }

  if (prior.landmark !== current.landmark) {
    const priorLmLabel = LANDMARK_LABELS[prior.landmark] || prior.landmark;
    const currentLmLabel = LANDMARK_LABELS[current.landmark] || current.landmark;
    return {
      canCalculate: false,
      message: `Different anatomical landmarks used (${priorLmLabel} vs ${currentLmLabel}) – manual comparison required.`
    };
  }

  // Convert distances to mm with directional polarity:
  // Negative = proximal to landmark ('above', 'superior_to', 'proximal_to')
  // Positive = distal to landmark ('below', 'inferior_to', 'distal_to')
  const getSignedMm = (ext: ExtentLandmark, val: number) => {
    const mm = ext.unit === 'cm' ? val * 10 : val;
    const rel = ext.relation || '';
    if (['above', 'superior_to', 'proximal_to'].includes(rel)) return -mm;
    if (['below', 'inferior_to', 'distal_to'].includes(rel)) return mm;
    if (rel === 'at') return 0;
    return mm;
  };

  const priorSigned = getSignedMm(prior, priorDist);
  const currentSigned = getSignedMm(current, currentDist);

  // Signed change: (currentSigned - priorSigned)
  // More negative = extended more proximally
  // More positive = retracted distally
  const changeMm = currentSigned - priorSigned;
  const absDiffCm = parseFloat((Math.abs(changeMm) / 10).toFixed(1));

  if (Math.abs(changeMm) < 5) {
    return { canCalculate: true, message: 'Stable thrombus boundary extent.', diffCm: 0, direction: 'stable' };
  }

  if (changeMm < 0) {
    return {
      canCalculate: true,
      message: `Interval proximal extension by approximately ${absDiffCm} cm.`,
      diffCm: absDiffCm,
      direction: 'proximal_extension'
    };
  } else {
    return {
      canCalculate: true,
      message: `Proximal thrombus boundary has retracted by approximately ${absDiffCm} cm.`,
      diffCm: absDiffCm,
      direction: 'retraction'
    };
  }
}

/**
 * Evaluates Patency / Occlusion scale rank (Higher = more occlusive)
 */
function getPatencyRank(patency?: string): number {
  switch (patency) {
    case 'completely_occluded':
      return 5;
    case 'mostly_occluded':
      return 4;
    case 'partially_occluded':
      return 3;
    case 'mostly_patent':
      return 2;
    case 'recanalised':
      return 1.5;
    case 'patent':
    case 'chronic_post_thrombotic_no_acute':
      return 1;
    default:
      return 0;
  }
}

/**
 * Suggests comparison outcome and statement for a single vessel segment
 */
export function evaluateVesselComparison(
  vesselId: string,
  vesselName: string,
  priorHeader?: ComparisonState['header'],
  priorFinding?: PriorVesselFinding,
  currentFinding?: VesselFinding
): {
  suggestedOutcome: ComparisonOutcome;
  suggestedStatement: string;
  priorSummaryStr: string;
  currentSummaryStr: string;
} {
  const hasPriorData = Boolean(priorHeader?.hasPriorExam && priorFinding);

  // 1. Current Summary Text
  let currentSummaryStr = 'Not assessed';
  if (currentFinding) {
    if (currentFinding.status === 'normal') {
      currentSummaryStr = 'Fully compressible & patent (Normal)';
    } else if (currentFinding.status === 'not_visualised') {
      currentSummaryStr = 'Inadequately visualised / Not visualised';
    } else if (currentFinding.status === 'not_assessed') {
      currentSummaryStr = 'Not assessed';
    } else if (currentFinding.status === 'abnormal') {
      const parts: string[] = [];
      if (currentFinding.patency) parts.push(currentFinding.patency.replace(/_/g, ' '));
      if (currentFinding.chronicity) parts.push(currentFinding.chronicity.replace(/_/g, ' '));
      if (currentFinding.compressibility) parts.push(currentFinding.compressibility.replace(/_/g, ' '));
      currentSummaryStr = parts.join(', ') || 'Abnormal finding';
    }
  }

  // 2. Prior Summary Text
  let priorSummaryStr = 'Not documented on prior exam';
  if (hasPriorData && priorFinding) {
    if (priorFinding.status === 'normal') {
      priorSummaryStr = 'Normal / Patent / Compressible';
    } else if (priorFinding.status === 'not_visualised') {
      priorSummaryStr = 'Not visualised on prior study';
    } else if (priorFinding.status === 'not_assessed') {
      priorSummaryStr = 'Not assessed on prior study';
    } else if (priorFinding.status === 'abnormal') {
      const parts: string[] = [];
      if (priorFinding.patency && priorFinding.patency !== 'not_documented') parts.push(priorFinding.patency.replace(/_/g, ' '));
      if (priorFinding.chronicity && priorFinding.chronicity !== 'not_documented') parts.push(priorFinding.chronicity.replace(/_/g, ' '));
      if (priorFinding.compressibility && priorFinding.compressibility !== 'not_documented') parts.push(priorFinding.compressibility.replace(/_/g, ' '));
      priorSummaryStr = parts.join(', ') || 'Abnormal finding documented';
    }
  }

  // 3. SPECIAL RULE 6: Suggest "NEW" only if strict clinical criteria are met
  if (currentFinding?.status === 'abnormal') {
    if (!hasPriorData || !priorFinding || priorFinding.status === 'not_assessed' || priorFinding.status === 'not_visualised') {
      return {
        suggestedOutcome: 'INDETERMINATE CHANGE',
        suggestedStatement: 'Not demonstrated on available prior examination – unable to confirm whether new.',
        priorSummaryStr,
        currentSummaryStr
      };
    }

    if (priorFinding.status === 'normal') {
      return {
        suggestedOutcome: 'NEW',
        suggestedStatement: `New thrombus identified in ${vesselName} compared to documented normal prior examination.`,
        priorSummaryStr,
        currentSummaryStr
      };
    }
  }

  // 4. SPECIAL RULE 7: Suggest "RESOLVED" or "RESIDUAL POST-THROMBOTIC CHANGE"
  if (priorFinding?.status === 'abnormal') {
    if (!currentFinding || currentFinding.status === 'not_visualised') {
      return {
        suggestedOutcome: 'UNABLE TO COMPARE',
        suggestedStatement: `Unable to assess interval status of previously demonstrated ${vesselName} thrombus due to limited current visualisation.`,
        priorSummaryStr,
        currentSummaryStr
      };
    }

    if (currentFinding.status === 'normal') {
      return {
        suggestedOutcome: 'RESOLVED',
        suggestedStatement: `Previously demonstrated ${vesselName} thrombus has resolved. Vessel is fully compressible and patent.`,
        priorSummaryStr,
        currentSummaryStr
      };
    }

    if (currentFinding.thrombusPresence === 'residual_post_thrombotic' || currentFinding.patency === 'chronic_post_thrombotic_no_acute') {
      return {
        suggestedOutcome: 'RESIDUAL POST-THROMBOTIC CHANGE',
        suggestedStatement: `Residual chronic post-thrombotic wall thickening/synechiae demonstrated in ${vesselName} without acute non-compressible occlusion.`,
        priorSummaryStr,
        currentSummaryStr
      };
    }
  }

  // 5. Both Prior and Current are Abnormal: Compare Extent, Patency, Chronicity
  if (priorFinding?.status === 'abnormal' && currentFinding?.status === 'abnormal') {
    // Check superficial junction proximity for GSV/SSV
    if (
      currentFinding.category === 'superficial' &&
      currentFinding.distanceToJunction?.distanceMm !== undefined &&
      priorFinding.distanceToJunctionMm !== undefined
    ) {
      const priorDist = priorFinding.distanceToJunctionMm;
      const currDist = currentFinding.distanceToJunction?.distanceMm;
      const jn = currentFinding.distanceToJunction.junction;
      if (currDist < priorDist) {
        return {
          suggestedOutcome: 'EXTENDED PROXIMALLY',
          suggestedStatement: `Interval proximal extension of superficial venous thrombus, now extending to within ${currDist} mm of the ${jn} (previously ${priorDist} mm).`,
          priorSummaryStr,
          currentSummaryStr
        };
      } else if (currDist > priorDist) {
        return {
          suggestedOutcome: 'REDUCED EXTENT',
          suggestedStatement: `Superficial thrombus head has retracted away from the ${jn} to ${currDist} mm (previously ${priorDist} mm).`,
          priorSummaryStr,
          currentSummaryStr
        };
      }
    }

    // Check Extent Calculations
    const extentCalc = calculateExtentDifference(priorFinding.proximalExtent, currentFinding.proximalExtent);
    if (extentCalc.canCalculate) {
      if (extentCalc.direction === 'proximal_extension') {
        return {
          suggestedOutcome: 'EXTENDED PROXIMALLY',
          suggestedStatement: `Interval proximal extension of ${vesselName} thrombus by approximately ${extentCalc.diffCm} cm.`,
          priorSummaryStr,
          currentSummaryStr
        };
      } else if (extentCalc.direction === 'retraction') {
        return {
          suggestedOutcome: 'REDUCED EXTENT',
          suggestedStatement: `Interval reduction in proximal extent of ${vesselName} thrombus by approximately ${extentCalc.diffCm} cm.`,
          priorSummaryStr,
          currentSummaryStr
        };
      }
    }

    // Check Patency / Recanalisation Change
    const priorRank = getPatencyRank(priorFinding.patency);
    const currRank = getPatencyRank(currentFinding.patency);

    if (currentFinding.patency === 'recanalised' || (currRank < priorRank && currRank > 0)) {
      return {
        suggestedOutcome: 'IMPROVED RECANALISATION',
        suggestedStatement: `Persistent ${vesselName} thrombus with improved recanalisation and reduced luminal occlusion.`,
        priorSummaryStr,
        currentSummaryStr
      };
    } else if (currRank > priorRank) {
      return {
        suggestedOutcome: 'INCREASED OCCLUSION',
        suggestedStatement: `Increased occlusion of ${vesselName} compared to prior examination.`,
        priorSummaryStr,
        currentSummaryStr
      };
    }

    // Check Acute-on-Chronic
    if (priorFinding.chronicity === 'chronic_post_thrombotic' && currentFinding.chronicity === 'acute_appearing') {
      return {
        suggestedOutcome: 'ACUTE-APPEARING THROMBUS ON CHRONIC CHANGE',
        suggestedStatement: `New acute-appearing hypoechoic thrombus may be superimposed on chronic post-thrombotic change in ${vesselName}.`,
        priorSummaryStr,
        currentSummaryStr
      };
    }

    // Default to Stable / Persistent
    return {
      suggestedOutcome: 'PERSISTENT',
      suggestedStatement: `Persistent ${vesselName} thrombus without significant interval change in extent or patency.`,
      priorSummaryStr,
      currentSummaryStr
    };
  }

  // Fallback for normal-to-normal or unassessed
  return {
    suggestedOutcome: 'STABLE',
    suggestedStatement: 'No significant interval change.',
    priorSummaryStr,
    currentSummaryStr
  };
}

/**
 * Builds or refreshes the full vessel comparisons list
 */
export function buildVesselComparisons(state: ExamState): VesselComparison[] {
  const cState = state.comparisonState;
  const priorHeader = cState?.header;
  const priorFindings = cState?.priorFindings || {};
  const currentFindings = state.vesselFindings;

  // Gather all vessel keys from current and prior
  const allVesselKeys = new Set<string>();
  Object.keys(currentFindings).forEach((k) => allVesselKeys.add(k));
  Object.keys(priorFindings).forEach((k) => allVesselKeys.add(k));

  const comparisons: VesselComparison[] = [];

  allVesselKeys.forEach((vId) => {
    const curr = currentFindings[vId];
    const prior = priorFindings[vId];

    // Determine if vessel should be evaluated
    const vesselName = curr?.vesselName || prior?.vesselName || vId;
    const side = curr?.side || prior?.side || 'right';
    const category = curr?.category || prior?.category || 'thigh';

    const { suggestedOutcome, suggestedStatement, priorSummaryStr, currentSummaryStr } = evaluateVesselComparison(
      vId,
      vesselName,
      priorHeader,
      prior,
      curr
    );

    // See if existing confirmed comparison exists
    const existingComp = state.comparisons.find((c) => c.vesselId === vId);

    const confirmedOutcome = existingComp ? existingComp.confirmedOutcome : suggestedOutcome;
    const confirmedStatement = existingComp?.confirmedStatement || suggestedStatement;
    const confirmed = existingComp ? existingComp.confirmed : true; // Default auto-confirm suggested

    const priorExtentStr = prior?.proximalExtent?.distance ? `${prior.proximalExtent.distance} ${prior.proximalExtent.unit}` : 'Not documented';
    const currentExtentStr = curr?.proximalExtent?.distance ? `${curr.proximalExtent.distance} ${curr.proximalExtent.unit}` : 'Not documented';

    comparisons.push({
      vesselId: vId,
      vesselName,
      side,
      category,
      priorStatus: priorSummaryStr,
      priorExtent: priorExtentStr,
      priorFinding: prior,
      currentStatus: currentSummaryStr,
      currentExtent: currentExtentStr,
      currentFinding: curr,
      suggestedOutcome,
      confirmedOutcome,
      suggestedStatement,
      confirmedStatement,
      confirmed,
      notes: existingComp?.notes || ''
    });
  });

  return comparisons;
}

/**
 * Groups continuous vessel findings into Thrombus Groups (e.g., Femoropopliteal Group)
 */
export function generateThrombusGroups(state: ExamState): ThrombusGroup[] {
  const groups: ThrombusGroup[] = [];
  const vesselFindings = state.vesselFindings;

  // Group continuous left and right femoropopliteal thrombi
  ['right', 'left'].forEach((s) => {
    const side = s as 'right' | 'left';
    const sideLabel = side === 'right' ? 'Right' : 'Left';

    const fvDist = vesselFindings[`${side}_FV_DIST`];
    const pop = vesselFindings[`${side}_POPV`];
    const tpt = vesselFindings[`${side}_TPT`];

    const isFemoropopliteal =
      (fvDist && fvDist.status === 'abnormal') ||
      (pop && pop.status === 'abnormal') ||
      (tpt && tpt.status === 'abnormal');

    if (isFemoropopliteal) {
      const vIds: string[] = [];
      if (fvDist?.status === 'abnormal') vIds.push(`${side}_FV_DIST`);
      if (pop?.status === 'abnormal') vIds.push(`${side}_POPV`);
      if (tpt?.status === 'abnormal') vIds.push(`${side}_TPT`);

      groups.push({
        id: `group-${side}-femoropopliteal`,
        name: `${sideLabel} Femoropopliteal Thrombus Segment`,
        side,
        vesselIds: vIds,
        isContinuous: true,
        summary: `${sideLabel} continuous femoropopliteal DVT involving ${vIds.length} connected segment(s).`
      });
    }
  });

  return groups;
}

/**
 * Generates automated interval comparison summary statements for reports
 */
export function generateIntervalComparisonSummary(state: ExamState): string {
  const cHeader = state.comparisonState?.header;
  if (!cHeader?.hasPriorExam) return '';

  const lines: string[] = [];
  lines.push(`COMPARISON WITH PRIOR EXAMINATION:`);
  lines.push(`Prior Exam Date: ${cHeader.examDate || 'Not specified'} (${cHeader.location}, Source: ${cHeader.comparisonSource}).`);
  lines.push(`Comparison Confidence: ${cHeader.confidence}.`);

  const confirmedComps = state.comparisons.filter((c) => c.confirmed);

  if (confirmedComps.length === 0) {
    lines.push('No significant interval change demonstrated across assessed segments.');
  } else {
    confirmedComps.forEach((comp) => {
      const stmt = comp.confirmedStatement || comp.suggestedStatement || `${comp.vesselName}: ${comp.confirmedOutcome}`;
      lines.push(`• ${comp.vesselName}: ${comp.confirmedOutcome} - ${stmt}`);
    });
  }

  return lines.join('\n');
}

/**
 * Generates single-sentence key finding for impression section
 */
export function generateKeyComparisonFinding(state: ExamState): string {
  const cHeader = state.comparisonState?.header;
  if (!cHeader?.hasPriorExam) return '';

  const confirmedComps = state.comparisons.filter((c) => c.confirmed);

  const newDvt = confirmedComps.filter((c) => c.confirmedOutcome === 'NEW' || c.confirmedOutcome === 'New thrombus');
  const extended = confirmedComps.filter((c) => c.confirmedOutcome === 'EXTENDED PROXIMALLY' || c.confirmedOutcome === 'Interval extension');
  const improved = confirmedComps.filter((c) => c.confirmedOutcome === 'IMPROVED RECANALISATION' || c.confirmedOutcome === 'Improved recanalisation' || c.confirmedOutcome === 'REDUCED EXTENT');
  const resolved = confirmedComps.filter((c) => c.confirmedOutcome === 'RESOLVED' || c.confirmedOutcome === 'Resolved');

  if (newDvt.length > 0) {
    return `New ${newDvt.map((c) => c.vesselName).join(', ')} thrombosis compared with prior study on ${cHeader.examDate}.`;
  }

  if (extended.length > 0) {
    return `Interval proximal extension of DVT in ${extended.map((c) => c.vesselName).join(', ')} compared with prior study on ${cHeader.examDate}.`;
  }

  if (resolved.length > 0 && improved.length === 0) {
    return `Previously demonstrated thrombus in ${resolved.map((c) => c.vesselName).join(', ')} has resolved.`;
  }

  if (improved.length > 0) {
    return `Persistent DVT in ${improved.map((c) => c.vesselName).join(', ')} with interval recanalisation / reduced extent since ${cHeader.examDate}.`;
  }

  return `Persistent lower limb DVT without significant interval change compared with ${cHeader.examDate}.`;
}

/**
 * Non-blocking clinical comparison safety alerts generator (Rule 30)
 */
export function getComparisonValidationWarnings(state: ExamState): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const cHeader = state.comparisonState?.header;
  if (!cHeader?.hasPriorExam) return alerts;

  const priorFindings = state.comparisonState?.priorFindings || {};

  state.comparisons.forEach((comp) => {
    const vId = comp.vesselId;
    const prior = priorFindings[vId];
    const curr = state.vesselFindings[vId];

    // Warning 1: NEW labeled when prior was not assessed
    if (
      (comp.confirmedOutcome === 'NEW' || comp.confirmedOutcome === 'New thrombus') &&
      (!prior || prior.status === 'not_assessed' || prior.status === 'not_visualised')
    ) {
      alerts.push({
        id: `alert-new-unassessed-${vId}`,
        severity: 'warning',
        title: 'UNCONFIRMED "NEW" DVT LABEL',
        message: `${comp.vesselName} is labeled NEW, but this segment was NOT adequately assessed on the prior examination. Rule: Only call NEW if prior was documented normal.`,
        vesselId: vId
      });
    }

    // Warning 2: Prior DVT missing currently, but marked Not Visualised today
    if (prior?.status === 'abnormal' && curr?.status === 'not_visualised' && comp.confirmedOutcome === 'RESOLVED') {
      alerts.push({
        id: `alert-false-resolved-${vId}`,
        severity: 'warning',
        title: 'INVALID "RESOLVED" DVT LABEL',
        message: `${comp.vesselName} had prior DVT but is unvisualised today. Resolution CANNOT be confirmed if the vessel is not visualised.`,
        vesselId: vId
      });
    }

    // Warning 3: Different landmarks used
    if (prior?.proximalExtent?.landmark && curr?.proximalExtent?.landmark && prior.proximalExtent.landmark !== curr.proximalExtent.landmark) {
      alerts.push({
        id: `alert-diff-landmarks-${vId}`,
        severity: 'info',
        title: 'DIFFERENT LANDMARKS USED',
        message: `${comp.vesselName}: Prior extent used ${LANDMARK_LABELS[prior.proximalExtent.landmark]} while current extent uses ${LANDMARK_LABELS[curr.proximalExtent.landmark]}. Numerical extent comparison is limited.`,
        vesselId: vId
      });
    }

    // Warning 4: Proximal extent increased but marked stable
    if (curr?.proximalExtent && prior?.proximalExtent) {
      const calc = calculateExtentDifference(prior.proximalExtent, curr.proximalExtent);
      if (calc.direction === 'proximal_extension' && (comp.confirmedOutcome === 'STABLE' || comp.confirmedOutcome === 'Stable/no significant change')) {
        alerts.push({
          id: `alert-prox-ext-stable-mismatch-${vId}`,
          severity: 'warning',
          title: 'PROXIMAL EXTENSION MISMATCH',
          message: `${comp.vesselName} current measurement shows proximal extension by ${calc.diffCm} cm, but outcome is marked STABLE. Please verify.`,
          vesselId: vId
        });
      }
    }
  });

  return alerts;
}
