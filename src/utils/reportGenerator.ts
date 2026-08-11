// Structured Sonographer Findings Summary Generator with Source Traceability & Region Mapping

import {
  ExamState,
  VesselFinding,
  Side,
  SonographicChronicity,
  Patency,
  Compressibility,
  NON_VISUALIZATION_REASON_LABELS,
  ReportBlock,
  InteractiveSentence,
  ConcisePreviewData,
  OtherFindingItem,
  ExtentLandmark,
  ExtentRelation
} from '../types/dvt';
import { ANATOMICAL_VESSELS, LANDMARK_LABELS } from '../data/anatomyData';
import { generateIntervalComparisonSummary, generateKeyComparisonFinding } from './comparisonEngine';
import { getNormalizedScope } from './scopeUtils';

export function formatRelationPhrase(relation?: string): string {
  if (!relation) return '';
  switch (relation) {
    case 'above':
      return 'above';
    case 'below':
      return 'below';
    case 'at':
      return 'at';
    case 'proximal_to':
      return 'proximal to';
    case 'distal_to':
      return 'distal to';
    case 'extending_to':
      return 'extending to';
    case 'extending_through':
      return 'extending through';
    case 'superior_to':
      return 'superior to';
    case 'inferior_to':
      return 'inferior to';
    default:
      return relation.replace(/_/g, ' ');
  }
}

export function getLandmarkText(ext: ExtentLandmark): string {
  if (ext.landmark === 'custom' && ext.customLandmark) {
    return ext.customLandmark;
  }
  const label = LANDMARK_LABELS[ext.landmark] || ext.landmark;
  // Clean up common label suffixes for fluent sentence integration if needed
  return label.replace(' (SFJ)', '').replace(' (SPJ)', '').replace(' / Popliteal Fossa', '');
}

export function formatSingleBoundText(ext: ExtentLandmark, options?: { omitLandmarkName?: boolean }): string {
  const lmRaw = getLandmarkText(ext);
  const isAcronym = ['SFJ', 'SPJ', 'IVC'].includes(ext.landmark);
  const lm = isAcronym ? lmRaw : lmRaw.toLowerCase();
  const rel = formatRelationPhrase(ext.relation);

  if (ext.relation === 'at') {
    return options?.omitLandmarkName ? 'at' : `at the ${lm}`;
  }
  if (ext.relation === 'extending_to') {
    return options?.omitLandmarkName ? 'extending to' : `extending to the ${lm}`;
  }
  if (ext.relation === 'extending_through') {
    return options?.omitLandmarkName ? 'extending through' : `extending through the ${lm}`;
  }

  if (ext.distance !== null && ext.distance !== undefined) {
    const distStr = `${ext.distance} ${ext.unit}`;
    if (rel) {
      return options?.omitLandmarkName ? `${distStr} ${rel}` : `${distStr} ${rel} the ${lm}`;
    }
    return options?.omitLandmarkName ? distStr : `${distStr} from the ${lm}`;
  }

  if (rel) {
    return options?.omitLandmarkName ? rel : `${rel} the ${lm}`;
  }

  return options?.omitLandmarkName ? '' : `at the ${lm}`;
}

export function formatExtent(f: VesselFinding): string {
  const prox = f.proximalExtent;
  const dist = f.distalExtent;

  const hasProx = Boolean(prox && (prox.distance !== null || prox.relation));
  const hasDist = Boolean(dist && (dist.distance !== null || dist.relation));

  if (!hasProx && !hasDist) return '';

  if (hasProx && hasDist && prox && dist) {
    const isSameLandmark = prox.landmark === dist.landmark;
    const isSameUnit = prox.unit === dist.unit;
    const isSameRelation = prox.relation === dist.relation;

    // Case A: Same landmark + Same relation + Same unit + both have distances
    // e.g. "extending from approximately 20 to 90 mm below the knee crease"
    if (
      isSameLandmark &&
      isSameRelation &&
      isSameUnit &&
      prox.distance !== null &&
      dist.distance !== null &&
      prox.relation &&
      !['at', 'extending_to', 'extending_through'].includes(prox.relation)
    ) {
      const lmRaw = getLandmarkText(prox);
      const isAcronym = ['SFJ', 'SPJ', 'IVC'].includes(prox.landmark);
      const lm = isAcronym ? lmRaw : lmRaw.toLowerCase();
      const rel = formatRelationPhrase(prox.relation);
      return `extending from approximately ${prox.distance} to ${dist.distance} ${prox.unit} ${rel} the ${lm}`;
    }

    // Case B: Same landmark + Same unit + both have distances, but different relations
    // e.g. "extending from approximately 40 mm above to 30 mm below the knee crease"
    if (
      isSameLandmark &&
      isSameUnit &&
      prox.distance !== null &&
      dist.distance !== null &&
      prox.relation &&
      dist.relation &&
      !['at', 'extending_to', 'extending_through'].includes(prox.relation) &&
      !['at', 'extending_to', 'extending_through'].includes(dist.relation)
    ) {
      const lmRaw = getLandmarkText(prox);
      const isAcronym = ['SFJ', 'SPJ', 'IVC'].includes(prox.landmark);
      const lm = isAcronym ? lmRaw : lmRaw.toLowerCase();
      const proxText = formatSingleBoundText(prox, { omitLandmarkName: true });
      const distText = formatSingleBoundText(dist, { omitLandmarkName: true });
      return `extending from approximately ${proxText} to ${distText} the ${lm}`;
    }

    // Case C: Different landmarks or distinct relations
    const pStr = formatSingleBoundText(prox);
    const dStr = formatSingleBoundText(dist);
    return `extending from approximately ${pStr} to ${dStr}`;
  }

  if (hasProx && prox) {
    const pStr = formatSingleBoundText(prox);
    return `extending from approximately ${pStr}`;
  }

  if (hasDist && dist) {
    const dStr = formatSingleBoundText(dist);
    return `extending to approximately ${dStr}`;
  }

  return '';
}

export function formatOtherFindingDimensions(item: OtherFindingItem): string {
  if (item.dimensionsText && item.dimensionsText.trim().length > 0) {
    return item.dimensionsText.trim();
  }
  const dims: (number | string)[] = [];
  if (item.dimensionsLengthMm !== undefined && item.dimensionsLengthMm !== null && !isNaN(item.dimensionsLengthMm)) {
    dims.push(item.dimensionsLengthMm);
  }
  if (item.dimensionsWidthMm !== undefined && item.dimensionsWidthMm !== null && !isNaN(item.dimensionsWidthMm)) {
    dims.push(item.dimensionsWidthMm);
  }
  if (item.dimensionsDepthMm !== undefined && item.dimensionsDepthMm !== null && !isNaN(item.dimensionsDepthMm)) {
    dims.push(item.dimensionsDepthMm);
  }
  if (dims.length === 0) return '';
  return `${dims.join(' × ')} mm`;
}

export function formatOtherFindingText(item: OtherFindingItem): string {
  const dimStr = formatOtherFindingDimensions(item);
  const measuringText = dimStr ? ` measuring ${dimStr}` : '';

  const sideText = item.side && item.side !== 'Bilateral' && item.side !== 'Pelvis'
    ? item.side.toLowerCase()
    : item.side === 'Bilateral' ? 'bilateral' : '';

  let locationText = item.location ? item.location.trim() : '';

  let formattedSideInMain = sideText;
  if (locationText && sideText && locationText.toLowerCase().includes(sideText)) {
    formattedSideInMain = '';
  }

  let locationPhrase = '';
  if (locationText) {
    if (/^(in|at|within)\s/i.test(locationText)) {
      locationPhrase = ` ${locationText}`;
    } else {
      locationPhrase = ` in the ${locationText}`;
    }
  }

  const findingTitle = item.type;
  
  let text = `A ${formattedSideInMain ? formattedSideInMain + ' ' : ''}${findingTitle}${measuringText} is demonstrated${locationPhrase}.`;
  text = text.replace(/\s+/g, ' ').replace(' .', '.');

  if (item.comments && item.comments.trim().length > 0) {
    const cleanComments = item.comments.trim();
    const finalComments = cleanComments.endsWith('.') ? cleanComments : `${cleanComments}.`;
    text = `${text} ${finalComments}`;
  }

  return text;
}

function formatChronicity(c?: SonographicChronicity): string {
  switch (c) {
    case 'acute_appearing':
      return 'acute-appearing';
    case 'subacute_appearing':
      return 'subacute-appearing';
    case 'chronic_post_thrombotic':
      return 'chronic post-thrombotic';
    case 'acute_on_chronic':
      return 'acute-on-chronic';
    default:
      return 'indeterminate age';
  }
}

function formatPatency(p?: Patency): string {
  switch (p) {
    case 'patent':
      return 'patent';
    case 'mostly_patent':
      return 'mostly patent';
    case 'partially_occluded':
      return 'partially occlusive';
    case 'mostly_occluded':
      return 'mostly occlusive';
    case 'completely_occluded':
      return 'completely occlusive';
    case 'recanalised':
      return 'partially recanalised';
    case 'chronic_post_thrombotic_no_acute':
      return 'chronic post-thrombotic change';
    default:
      return '';
  }
}

function formatCompressibility(c?: Compressibility): string {
  switch (c) {
    case 'fully_compressible':
      return 'fully compressible';
    case 'partially_compressible':
      return 'partially compressible';
    case 'non_compressible':
      return 'non-compressible';
    default:
      return '';
  }
}

export function generateStructuredReportBlocks(state: ExamState): ReportBlock[] {
  const blocks: ReportBlock[] = [];
  const { header, history, limitations, vesselFindings, doppler, pelvic, otherFindings, comparisons, comparisonState } = state;
  const hasPrior = comparisonState?.header?.hasPriorExam || comparisons.length > 0;
  const scope = getNormalizedScope(header);

  // 1. Examination & Clinical Details Header
  const examLines: string[] = [];
  examLines.push(`EXAMINATION: Venous Duplex Ultrasound - ${header.examType.toUpperCase()}`);
  if (header.indications.length > 0) {
    examLines.push(`CLINICAL INDICATION: ${header.indications.join(', ')}.`);
  }
  if (header.clinicalHistory) {
    examLines.push(`CLINICAL HISTORY: ${header.clinicalHistory}`);
  }
  if (state.symptomSite) {
    const ss = state.symptomSite;
    let sStr = `SITE OF SYMPTOMS: ${ss.side} lower limb`;
    if (ss.regions && ss.regions.length > 0) {
      sStr += ` (${ss.regions.join(', ')})`;
    }
    if (ss.focalAreaAssessed) {
      sStr += `. Focal symptomatic area assessed: ${ss.focalFinding}`;
    }
    if (ss.comments) sStr += `. ${ss.comments}`;
    examLines.push(sStr);
  }

  blocks.push({
    id: 'block-exam-details',
    section: 'EXAMINATION DETAILS',
    text: examLines.join('\n'),
    sourceType: 'symptom',
    region: 'global',
    category: 'header'
  });

  // 2. Prior Study Comparison Protocol Header
  if (hasPrior && comparisonState?.header) {
    const pHead = comparisonState.header;
    const priorLines = [
      '=== PRIOR EXAMINATION COMPARISON PROTOCOL ===',
      `Previous Examination Available: YES (Date: ${pHead.examDate || 'Not specified'}, Location: ${pHead.location}).`,
      `Comparison Source: ${pHead.comparisonSource} (Images Available: ${pHead.imagesAvailable}).`,
      `Prior Study Quality: ${pHead.quality} | Confidence: ${pHead.confidence}.`
    ];
    if (pHead.anticoagulationStatus) priorLines.push(`Prior Anticoagulation: ${pHead.anticoagulationStatus}.`);

    blocks.push({
      id: 'block-prior-protocol',
      section: 'PRIOR COMPARISON PROTOCOL',
      text: priorLines.join('\n'),
      sourceType: 'comparison',
      region: 'global',
      category: 'comparison'
    });
  }

  // 3. Technical Limitations
  if (limitations.hasLimitations) {
    const factorsText = limitations.factors.map((f) => f.replace(/_/g, ' ')).join(', ');
    const limText = `EXAMINATION LIMITATIONS: ${limitations.severity.toUpperCase()} limitations due to ${factorsText}. ${limitations.customDetails}\nUnvisualised vessel segments are explicitly excluded from normal statements.`;
    blocks.push({
      id: 'block-limitations',
      section: 'TECHNICAL LIMITATIONS',
      text: limText,
      sourceType: 'limitation',
      sourceVesselIds: limitations.affectedVesselIds,
      region: 'global',
      category: 'limitation'
    });
  }

  // Helper for Limb Sections
  const processLimbBlocks = (side: Side, sideLabel: string) => {
    const regionKey = side === 'right' ? 'right_lower_limb' : 'left_lower_limb';
    const isExamined = side === 'right' ? scope.regionsExamined.rightLowerLimb : scope.regionsExamined.leftLowerLimb;

    if (!isExamined) {
      // Unexamined side is simply omitted from report unless explicitly examined
      return;
    }

    const deepVessels = ANATOMICAL_VESSELS.filter(
      (v) => v.category === 'thigh' || v.category === 'popliteal' || v.category === 'calf_deep'
    );

    const abnormalDeep: VesselFinding[] = [];
    const normalDeep: VesselFinding[] = [];
    const unvisualisedDeep: VesselFinding[] = [];

    deepVessels.forEach((vDef) => {
      const vId = `${side}_${vDef.vesselKey}`;
      const finding = vesselFindings[vId];
      if (!finding) return;

      if (finding.status === 'abnormal') abnormalDeep.push(finding);
      else if (finding.status === 'normal') normalDeep.push(finding);
      else if (finding.status === 'not_visualised') unvisualisedDeep.push(finding);
    });

    const deepLines: string[] = [`=== ${sideLabel.toUpperCase()} LOWER LIMB ===`];

    if (abnormalDeep.length === 0) {
      if (normalDeep.length === 0 && unvisualisedDeep.length === 0) {
        deepLines.push(`${sideLabel} lower limb deep venous assessment is pending / not yet documented.`);
        blocks.push({
          id: `block-${side}-deep-unassessed`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          text: deepLines.join('\n'),
          sourceType: 'normal',
          sourceVesselIds: deepVessels.map((v) => `${side}_${v.vesselKey}`),
          region: regionKey,
          category: 'normal'
        });
      } else if (unvisualisedDeep.length > 0) {
        const unvisList = unvisualisedDeep.map((v) => {
          const reasonKey = v.nonVisualizationReason || 'body_habitus';
          const reasonLabel = NON_VISUALIZATION_REASON_LABELS[reasonKey] || 'technical limitation';
          const custom = v.customNonVisualizationReason ? ` - ${v.customNonVisualizationReason}` : '';
          return `${v.vesselName} (${reasonLabel}${custom})`;
        }).join(', ');
        deepLines.push(
          `Deep veins assessed from CFV to calf show normal compressibility and patency. Note: The following vessel(s) could not be adequately visualised: ${unvisList}.`
        );
        blocks.push({
          id: `block-${side}-deep-normal`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          text: deepLines.join('\n'),
          sourceType: 'normal',
          sourceVesselIds: deepVessels.map((v) => `${side}_${v.vesselKey}`),
          region: regionKey,
          category: 'normal'
        });
      } else {
        deepLines.push(
          `The deep veins demonstrate normal compressibility, patency, and wall features from the common femoral vein through to the distal calf veins. No deep venous thrombosis identified.`
        );
        blocks.push({
          id: `block-${side}-deep-normal`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          text: deepLines.join('\n'),
          sourceType: 'normal',
          sourceVesselIds: deepVessels.map((v) => `${side}_${v.vesselKey}`),
          region: regionKey,
          category: 'normal'
        });
      }
    } else {
      deepLines.push(`Deep Venous Abnormalities Identified:`);
      
      blocks.push({
        id: `block-${side}-deep-header`,
        section: `${sideLabel.toUpperCase()} LOWER LIMB`,
        text: deepLines.join('\n'),
        sourceType: 'vessel',
        sourceVesselIds: abnormalDeep.map((f) => f.id),
        region: regionKey,
        category: 'dvt'
      });

      // Detect contiguous deep thrombus groups
      const contiguousOrderKeys = ['CFV', 'FV_PROX', 'FV_MID', 'FV_DIST', 'POPV', 'TPTV', 'PTV', 'PERV'];
      const abnormalDeepOrdered = abnormalDeep.filter((f) =>
        contiguousOrderKeys.some((k) => f.id.endsWith(k))
      );

      // Check if Popliteal + TPT + Peroneal or similar contiguous sequence is present
      const hasContiguousGroup =
        abnormalDeepOrdered.length >= 2 &&
        abnormalDeepOrdered.some((f) => f.id.includes('POPV')) &&
        abnormalDeepOrdered.some((f) => f.id.includes('TPTV') || f.id.includes('PERV') || f.id.includes('PTV'));

      if (hasContiguousGroup) {
        const groupVesselNames = abnormalDeepOrdered.map((f) => f.vesselName).join(', ');
        const groupVesselIds = abnormalDeepOrdered.map((f) => f.id);
        const firstChron = formatChronicity(abnormalDeepOrdered[0].chronicity);
        const firstPat = formatPatency(abnormalDeepOrdered[0].patency);

        blocks.push({
          id: `block-${side}-contiguous-group`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          title: `Continuous ${sideLabel} Deep Venous Thrombus Group`,
          text: `• Continuous ${firstChron}, ${firstPat} thrombus extends through the ${sideLabel.toLowerCase()} ${groupVesselNames}.`,
          sourceType: 'thrombusGroup',
          sourceVesselIds: groupVesselIds,
          region: regionKey,
          category: 'dvt'
        });
      }

      // Individual Vessel Findings
      abnormalDeep.forEach((f) => {
        const chron = formatChronicity(f.chronicity);
        const pat = formatPatency(f.patency);
        const comp = formatCompressibility(f.compressibility);
        const ext = formatExtent(f);
        const echog = f.echogenicity ? f.echogenicity.replace('_', ' ') : 'hypoechoic';

        let line = `• ${f.vesselName}: Sonographic appearances are consistent with ${chron}, ${pat} (${comp}) ${f.thrombusPresence === 'thrombus_present' ? 'thrombus' : 'change'}`;
        if (echog) line += ` with ${echog} echogenicity`;
        if (ext) line += ` ${ext}`;
        line += '.';
        if (f.comments) line += ` Note: ${f.comments}`;

        blocks.push({
          id: `block-vessel-${f.id}`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          title: f.vesselName,
          text: line,
          sourceType: 'vessel',
          sourceVesselIds: [f.id],
          region: regionKey,
          category: 'dvt'
        });
      });

      if (unvisualisedDeep.length > 0) {
        const unvisList = unvisualisedDeep.map((v) => {
          const reasonKey = v.nonVisualizationReason || 'body_habitus';
          const reasonLabel = NON_VISUALIZATION_REASON_LABELS[reasonKey] || 'technical limitation';
          const custom = v.customNonVisualizationReason ? ` - ${v.customNonVisualizationReason}` : '';
          return `${v.vesselName} (${reasonLabel}${custom})`;
        }).join(', ');

        blocks.push({
          id: `block-${side}-deep-unvis`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          text: `Note: The following additional deep vessel(s) could not be adequately visualised: ${unvisList}.`,
          sourceType: 'limitation',
          sourceVesselIds: unvisualisedDeep.map((f) => f.id),
          region: regionKey,
          category: 'limitation'
        });
      }
    }

    // Muscular Calf Veins
    const muscularVessels = ANATOMICAL_VESSELS.filter((v) => v.category === 'muscular_calf');
    const abnormalMuscular = muscularVessels
      .map((v) => vesselFindings[`${side}_${v.vesselKey}`])
      .filter((f) => f && f.status === 'abnormal');

    if (abnormalMuscular.length > 0) {
      abnormalMuscular.forEach((f) => {
        const chron = formatChronicity(f.chronicity);
        const ext = formatExtent(f);
        blocks.push({
          id: `block-${side}-muscular-${f.id}`,
          section: `${sideLabel.toUpperCase()} LOWER LIMB`,
          title: `${f.vesselName} (Muscular Calf)`,
          text: `• Separate ${f.vesselName}: ${chron} thrombus identified (${formatPatency(f.patency)}, ${formatCompressibility(f.compressibility)}) ${ext}. ${f.comments}`,
          sourceType: 'vessel',
          sourceVesselIds: [f.id],
          region: regionKey,
          category: 'dvt'
        });
      });
    }

    // Spectral Doppler
    const cfvFinding = state.vesselFindings[`${side}_CFV`];
    const popFinding = state.vesselFindings[`${side}_POPV`];

    const cfvPhasicity =
      cfvFinding?.doppler?.phasicity ||
      (side === 'right' ? doppler.rightCFVPhasicity : doppler.leftCFVPhasicity) ||
      'phasic';

    const popPhasicity =
      popFinding?.doppler?.phasicity ||
      (side === 'right' ? doppler.rightPopPhasicity : doppler.leftPopPhasicity) ||
      'phasic';

    const aug =
      popFinding?.doppler?.augmentation ||
      (side === 'right' ? doppler.rightAugmentation : doppler.leftAugmentation) ||
      'not_assessed';

    const formatPhasicityText = (p: string) => {
      if (p === 'phasic') return 'phasic';
      if (p === 'reduced_phasicity') return 'reduced';
      if (p === 'continuous_non_phasic') return 'continuous (non-phasic)';
      if (p === 'pulsatile') return 'pulsatile';
      if (p === 'absent_flow') return 'absent';
      if (p === 'not_visualised') return 'not visualised';
      if (p === 'not_assessed') return 'not assessed';
      return p.replace(/_/g, ' ');
    };

    const formatAugText = (a: string) => {
      if (a === 'normal_augmentation') return 'normal distal augmentation';
      if (a === 'reduced_augmentation') return 'reduced distal augmentation';
      if (a === 'absent_augmentation') return 'absent distal augmentation';
      if (a === 'performed_prior_to_dvt') return 'distal augmentation performed prior to DVT identification';
      if (a === 'not_performed_positive_dvt') return 'distal augmentation not performed due to positive DVT';
      if (a === 'not_performed') return 'distal augmentation not performed';
      if (a === 'not_assessed') return 'distal augmentation not assessed';
      return a.replace(/_/g, ' ');
    };

    const dopplerText = `Spectral Doppler: Common femoral vein flow is ${formatPhasicityText(
      cfvPhasicity
    )}. Popliteal vein flow is ${formatPhasicityText(popPhasicity)} with ${formatAugText(aug)}.`;

    blocks.push({
      id: `block-${side}-doppler`,
      section: `${sideLabel.toUpperCase()} LOWER LIMB`,
      text: dopplerText,
      sourceType: 'doppler',
      sourceVesselIds: [`${side}_CFV`, `${side}_POPV`],
      region: regionKey,
      category: 'doppler'
    });
  };

  processLimbBlocks('right', 'Right');
  processLimbBlocks('left', 'Left');

  // Contralateral CFV Assessment in Unilateral Study
  if (state.contralateralCFVAssessment) {
    const cCFV = state.contralateralCFVAssessment;
    const cLines = [
      `=== CONTRALATERAL (${cCFV.side.toUpperCase()}) CFV ASSESSMENT ===`,
      `Contralateral ${cCFV.side} Common Femoral Vein Doppler: ${cCFV.phasicity.replace(/_/g, ' ')}.`,
      ...(cCFV.comments ? [`Comments: ${cCFV.comments}`] : []),
      'Note: This spot Doppler assessment does NOT represent a complete contralateral lower limb examination.'
    ];

    blocks.push({
      id: 'block-contralateral-cfv',
      section: 'CONTRALATERAL CFV ASSESSMENT',
      text: cLines.join('\n'),
      sourceType: 'doppler',
      sourceVesselIds: [`${cCFV.side}_CFV`],
      region: cCFV.side === 'right' ? 'right_lower_limb' : 'left_lower_limb',
      category: 'doppler'
    });
  }

  // Anatomical Variants
  if (state.anatomicalVariants && state.anatomicalVariants.length > 0) {
    const varLines = ['=== ANATOMICAL VARIANTS & DUPLICATED VEINS ==='];
    state.anatomicalVariants.forEach((v) => {
      let vStr = `• ${v.side} ${v.variantType}`;
      if (v.variantType.includes('Duplicated')) {
        vStr += `: Channel 1 status = ${v.channel1Status.replace(/_/g, ' ')}, Channel 2 status = ${(v.channel2Status || 'normal').replace(/_/g, ' ')}`;
      }
      if (v.comments) vStr += `. ${v.comments}`;
      varLines.push(vStr);
    });

    blocks.push({
      id: 'block-anatomical-variants',
      section: 'ANATOMICAL VARIANTS',
      text: varLines.join('\n'),
      sourceType: 'variant',
      region: 'global',
      category: 'other'
    });
  }

  // Pelvic / Iliocaval Assessment
  if (
    scope.regionsExamined.iliocaval ||
    pelvic.ivcVisualised !== 'not_visualised' ||
    pelvic.civRightStatus !== 'not_visualised' ||
    pelvic.civLeftStatus !== 'not_visualised'
  ) {
    const pelvLines = [
      '=== PELVIC / ILIOCAVAL ASSESSMENT ===',
      `IVC: ${pelvic.ivcVisualised.replace('_', ' ').toUpperCase()} - ${pelvic.ivcStatus.toUpperCase()}. ${pelvic.ivcDetails}`,
      ...(pelvic.filterPresent ? ['• IVC filter noted in situ.'] : []),
      ...(pelvic.stentPresent ? ['• Iliac venous stent noted in situ.'] : []),
      `• Right Common / External Iliac Veins: ${pelvic.civRightStatus.replace('_', ' ')}.`,
      `• Left Common / External Iliac Veins: ${pelvic.civLeftStatus.replace('_', ' ')}.`,
      ...(pelvic.pelvicComments ? [`Comments: ${pelvic.pelvicComments}`] : [])
    ];

    blocks.push({
      id: 'block-pelvic-iliocaval',
      section: 'PELVIC / ILIOCAVAL ASSESSMENT',
      text: pelvLines.join('\n'),
      sourceType: 'vessel',
      sourceVesselIds: ['pelvis_IVC', 'pelvis_CIV_R', 'pelvis_CIV_L', 'pelvis_EIV_R', 'pelvis_EIV_L'],
      region: 'iliocaval',
      category: 'dvt'
    });
  }

  // Superficial Veins
  const superficialVessels = ANATOMICAL_VESSELS.filter((v) => v.category === 'superficial');
  const abnormalSuperficial: VesselFinding[] = [];

  ['right', 'left'].forEach((side) => {
    superficialVessels.forEach((v) => {
      const f = vesselFindings[`${side}_${v.vesselKey}`];
      if (f && f.status === 'abnormal') abnormalSuperficial.push(f);
    });
  });

  const supLines = ['=== SUPERFICIAL VENOUS SYSTEM ==='];
  if (abnormalSuperficial.length === 0) {
    supLines.push(
      'Great Saphenous Veins (GSV) and Small Saphenous Veins (SSV) assessed demonstrate normal compressibility without superficial venous thrombosis.'
    );
  } else {
    abnormalSuperficial.forEach((f) => {
      let msg = `• ${f.vesselName} (${f.side.toUpperCase()}): Superficial venous thrombosis identified (${formatPatency(f.patency)}).`;
      if (f.distanceToJunction && f.distanceToJunction.distanceMm !== undefined) {
        msg += ` Thrombus terminates ${f.distanceToJunction.distanceMm} mm inferior to the ${f.distanceToJunction.junction}. Extension into deep system: ${f.distanceToJunction.extensionIntoDeep.replace(/_/g, ' ')}.`;
      }
      if (f.comments) msg += ` ${f.comments}`;
      supLines.push(msg);
    });
  }

  blocks.push({
    id: 'block-superficial',
    section: 'SUPERFICIAL VENOUS SYSTEM',
    text: supLines.join('\n'),
    sourceType: 'vessel',
    sourceVesselIds: abnormalSuperficial.map((f) => f.id),
    region: 'global',
    category: 'superficial'
  });

  // Other / Non-venous Findings
  if (otherFindings.length > 0) {
    const othLines = ['=== OTHER / NON-VENOUS FINDINGS ==='];
    otherFindings.forEach((of) => {
      othLines.push(`• ${formatOtherFindingText(of)}`);
    });

    blocks.push({
      id: 'block-other-findings',
      section: 'OTHER FINDINGS',
      text: othLines.join('\n'),
      sourceType: 'other_finding',
      sourceVesselIds: otherFindings.map((f) => f.id),
      region: 'global',
      category: 'other'
    });
  }

  // Clinical Communication
  if (state.clinicalCommunication && state.clinicalCommunication.contacted !== 'Not required under local protocol') {
    const cc = state.clinicalCommunication;
    const commLines = [
      '=== CLINICAL COMMUNICATION ===',
      `Direct Contact Completed: ${cc.contacted}. Contact: ${cc.contactNameRole || 'Not specified'} (${cc.method || 'Phone'}, ${cc.dateTime}).`,
      ...(cc.outcomeInstructions ? [`Instructions / Outcome: ${cc.outcomeInstructions}`] : []),
      ...(cc.patientDisposition ? [`Patient Disposition: ${cc.patientDisposition}`] : [])
    ];

    blocks.push({
      id: 'block-communication',
      section: 'CLINICAL COMMUNICATION',
      text: commLines.join('\n'),
      sourceType: 'communication',
      region: 'global',
      category: 'header'
    });
  }

  // Confirmed Interval Comparison Summary
  if (hasPrior && comparisons.length > 0) {
    const compText = `=== INTERVAL COMPARISON SUMMARY ===\n${generateIntervalComparisonSummary(state)}`;
    blocks.push({
      id: 'block-interval-comparison',
      section: 'INTERVAL COMPARISON',
      text: compText,
      sourceType: 'comparison',
      region: 'global',
      category: 'comparison'
    });
  }

  // Impression / Key Findings
  const impLines = ['=== SONOGRAPHER IMPRESSION / KEY FINDINGS ==='];
  const keyCompFinding = generateKeyComparisonFinding(state);
  if (keyCompFinding) {
    impLines.push(`KEY COMPARISON FINDING: ${keyCompFinding}`);
    impLines.push('');
  }

  const abnormalDeepCount = (Object.values(vesselFindings) as VesselFinding[]).filter(
    (f) => f.category !== 'superficial' && f.status === 'abnormal' && f.thrombusPresence === 'thrombus_present'
  ).length;

  const abnormalVesselIds: string[] = [];

  if (abnormalDeepCount > 0) {
    impLines.push('1. DEEP VENOUS THROMBOSIS IDENTIFIED:');
    (Object.values(vesselFindings) as VesselFinding[])
      .filter((f) => f.category !== 'superficial' && f.status === 'abnormal')
      .forEach((f) => {
        abnormalVesselIds.push(f.id);
        const sideUpper = f.side.toUpperCase();
        impLines.push(`   - ${sideUpper} ${f.vesselName}: ${formatChronicity(f.chronicity)}, ${formatPatency(f.patency)} thrombus (${formatExtent(f)}).`);
      });
  } else if (abnormalSuperficial.length > 0) {
    impLines.push('1. NO DEEP VENOUS THROMBOSIS IDENTIFIED.');
    impLines.push('2. SUPERFICIAL VENOUS THROMBOSIS DOCUMENTED (see details above).');
  } else {
    impLines.push('1. NO DEEP OR SUPERFICIAL VENOUS THROMBOSIS IDENTIFIED WITHIN THE ASSESSED VESSEL SEGMENTS.');
  }

  if (doppler.rightCFVPhasicity === 'reduced_phasicity' || doppler.leftCFVPhasicity === 'reduced_phasicity') {
    impLines.push('2. Reduced common femoral vein respiratory phasicity noted. Recommend correlation for proximal pelvic compression if clinically warranted.');
  }

  impLines.push('');
  impLines.push('--------------------------------------------------------------------------------');
  impLines.push('SONOGRAPHER WORKSHEET / PRELIMINARY FINDINGS DOCUMENTATION — NOT THE FINAL DIAGNOSTIC REPORT.');
  impLines.push('--------------------------------------------------------------------------------');

  blocks.push({
    id: 'block-impression',
    section: 'SONOGRAPHER IMPRESSION',
    text: impLines.join('\n'),
    sourceType: 'vessel',
    sourceVesselIds: abnormalVesselIds,
    region: 'global',
    category: 'dvt'
  });

  return blocks;
}

export function generateSonographerSummary(state: ExamState): string {
  const blocks = generateStructuredReportBlocks(state);
  return blocks.map((b) => b.text).join('\n\n');
}

export function generateConcisePreviewData(state: ExamState): ConcisePreviewData {
  const { header, vesselFindings, doppler, otherFindings, limitations, comparisons, comparisonState } = state;
  const scope = getNormalizedScope(header);
  const sentences: InteractiveSentence[] = [];

  const isRightExamined = scope.regionsExamined.rightLowerLimb;
  const isLeftExamined = scope.regionsExamined.leftLowerLimb;
  const isBilateral = isRightExamined && isLeftExamined;

  let sideText = 'bilateral lower limbs';
  if (!isBilateral) {
    if (isRightExamined) sideText = 'right lower limb';
    else if (isLeftExamined) sideText = 'left lower limb';
  }

  // Indications text
  const indicationStr =
    header.indications && header.indications.length > 0
      ? ` for ${header.indications.join(' and ')}`
      : '';

  // Deep & Superficial Findings
  const allVesselFindingsList = Object.values(vesselFindings) as VesselFinding[];
  const deepAbnormalList = allVesselFindingsList.filter(
    (f) => f.category !== 'superficial' && f.status === 'abnormal'
  );

  const superficialAbnormal = allVesselFindingsList.filter(
    (f) => f.category === 'superficial' && f.status === 'abnormal'
  );

  const hasDeepDvt = deepAbnormalList.length > 0;
  const hasPathology = hasDeepDvt || superficialAbnormal.length > 0;

  // --- 1. DEEP VENOUS FINDINGS ---
  if (!hasDeepDvt) {
    if (isBilateral) {
      sentences.push({
        id: 'sent-deep-normal',
        text: `Venous duplex ultrasound of the bilateral lower limbs was performed${indicationStr}. The assessed deep veins demonstrate normal compressibility, patency and wall features from the common femoral veins to the distal calf veins bilaterally, with no deep venous thrombosis identified.`,
        sourceVesselIds: [
          'right_CFV', 'right_FV', 'right_POPV', 'right_PTV', 'right_PERV',
          'left_CFV', 'left_FV', 'left_POPV', 'left_PTV', 'left_PERV'
        ],
        region: 'global',
        category: 'normal'
      });
    } else {
      const sideVesselPrefix = isRightExamined ? 'right_' : 'left_';
      sentences.push({
        id: 'sent-deep-normal',
        text: `Venous duplex ultrasound of the ${sideText} demonstrates normal compressibility, patency and wall features throughout the assessed deep veins, with no deep venous thrombosis identified.`,
        sourceVesselIds: [
          `${sideVesselPrefix}CFV`, `${sideVesselPrefix}FV`, `${sideVesselPrefix}POPV`,
          `${sideVesselPrefix}PTV`, `${sideVesselPrefix}PERV`
        ],
        region: isRightExamined ? 'right_lower_limb' : 'left_lower_limb',
        category: 'normal'
      });
    }
  } else {
    // Deep DVT Present
    const abnormalDescs: string[] = [];
    const dvtVesselIds: string[] = [];

    ['right', 'left'].forEach((side) => {
      const sideAbnormals = deepAbnormalList.filter((f) => f.side === side);
      if (sideAbnormals.length > 0) {
        sideAbnormals.forEach((f) => dvtVesselIds.push(f.id));
        const names = sideAbnormals.map((f) => f.vesselName).join(', ');
        const mainChronicity = sideAbnormals[0].chronicity
          ? formatChronicity(sideAbnormals[0].chronicity)
          : 'acute-appearing';
        const mainPatency = sideAbnormals[0].patency
          ? formatPatency(sideAbnormals[0].patency)
          : 'occlusive';
        const extentStr = formatExtent(sideAbnormals[0]);

        abnormalDescs.push(
          `${mainPatency} ${mainChronicity} thrombus within the ${side} ${names}${extentStr ? ' ' + extentStr : ''}`
        );
      }
    });

    const dvtDetailText = abnormalDescs.join('; and ');

    sentences.push({
      id: 'sent-dvt-pathology',
      text: `Venous duplex ultrasound of the ${sideText} demonstrates ${dvtDetailText}.`,
      sourceVesselIds: dvtVesselIds,
      region: isBilateral ? 'global' : isRightExamined ? 'right_lower_limb' : 'left_lower_limb',
      category: 'dvt'
    });

    // Remaining deep veins
    sentences.push({
      id: 'sent-dvt-remaining',
      text: `The remaining assessed deep veins are patent and compressible.`,
      sourceVesselIds: dvtVesselIds,
      region: 'global',
      category: 'normal'
    });
  }

  // --- 2. SPECTRAL DOPPLER ---
  const rCFV = vesselFindings['right_CFV']?.doppler?.phasicity || doppler.rightCFVPhasicity || 'phasic';
  const lCFV = vesselFindings['left_CFV']?.doppler?.phasicity || doppler.leftCFVPhasicity || 'phasic';
  const rPop = vesselFindings['right_POPV']?.doppler?.phasicity || doppler.rightPopPhasicity || 'phasic';
  const lPop = vesselFindings['left_POPV']?.doppler?.phasicity || doppler.leftPopPhasicity || 'phasic';

  const rAug = vesselFindings['right_POPV']?.doppler?.augmentation || doppler.rightAugmentation || 'not_assessed';
  const lAug = vesselFindings['left_POPV']?.doppler?.augmentation || doppler.leftAugmentation || 'not_assessed';

  let dopplerSentenceText = '';
  const dopplerVesselIds: string[] = [];

  if (isBilateral) {
    dopplerVesselIds.push('right_CFV', 'left_CFV', 'right_POPV', 'left_POPV');

    if (rCFV === 'phasic' && lCFV === 'phasic' && rPop === 'phasic' && lPop === 'phasic') {
      if (rAug === 'normal_augmentation' && lAug === 'normal_augmentation') {
        dopplerSentenceText = 'Venous flow is phasic in the common femoral and popliteal veins bilaterally, with normal distal augmentation.';
      } else if (rAug === 'normal_augmentation' || lAug === 'normal_augmentation') {
        dopplerSentenceText = 'Venous flow is phasic in the common femoral and popliteal veins bilaterally, with distal augmentation demonstrated.';
      } else {
        dopplerSentenceText = 'Venous flow is phasic in the common femoral and popliteal veins bilaterally.';
      }
    } else {
      const dopplerParts: string[] = [];
      if (rCFV === 'phasic') dopplerParts.push('Right CFV flow is phasic');
      else dopplerParts.push(`Right CFV flow is ${rCFV.replace(/_/g, ' ')}`);

      if (lCFV === 'phasic') dopplerParts.push('left CFV flow is phasic');
      else dopplerParts.push(`left CFV flow is ${lCFV.replace(/_/g, ' ')}`);

      dopplerSentenceText = `${dopplerParts.join(', ')}.`;
    }
  } else {
    // Unilateral
    const sidePrefix = isRightExamined ? 'right_' : 'left_';
    dopplerVesselIds.push(`${sidePrefix}CFV`, `${sidePrefix}POPV`);

    const sideCFV = isRightExamined ? rCFV : lCFV;
    const sidePop = isRightExamined ? rPop : lPop;
    const sideAug = isRightExamined ? rAug : lAug;

    if (sideCFV === 'phasic' && sidePop === 'phasic') {
      if (sideAug === 'normal_augmentation') {
        dopplerSentenceText = 'Common femoral and popliteal venous flow is phasic with normal distal augmentation.';
      } else {
        dopplerSentenceText = 'Common femoral and popliteal venous flow is phasic.';
      }
    } else if (sideCFV === 'phasic') {
      dopplerSentenceText = `Common femoral venous phasicity is preserved. Popliteal vein flow is ${sidePop.replace(/_/g, ' ')}.`;
    } else {
      dopplerSentenceText = `Common femoral vein flow is ${sideCFV.replace(/_/g, ' ')}. Popliteal vein flow is ${sidePop.replace(/_/g, ' ')}.`;
    }
  }

  if (dopplerSentenceText) {
    sentences.push({
      id: 'sent-doppler',
      text: dopplerSentenceText,
      sourceVesselIds: dopplerVesselIds,
      region: isBilateral ? 'global' : isRightExamined ? 'right_lower_limb' : 'left_lower_limb',
      category: 'doppler'
    });
  }

  // --- 3. SUPERFICIAL THROMBOSIS ---
  if (superficialAbnormal.length > 0) {
    superficialAbnormal.forEach((f) => {
      let supMsg = `Superficial venous thrombosis is identified in the ${f.side} ${f.vesselName}`;
      if (f.distanceToJunction && f.distanceToJunction.distanceMm !== undefined) {
        supMsg += `, terminating ${f.distanceToJunction.distanceMm} mm inferior to the ${f.distanceToJunction.junction}`;
      }
      supMsg += '.';
      sentences.push({
        id: `sent-superficial-${f.id}`,
        text: supMsg,
        sourceVesselIds: [f.id],
        region: f.side === 'right' ? 'right_lower_limb' : 'left_lower_limb',
        category: 'superficial'
      });
    });
  }

  // --- 4. OTHER FINDINGS CONCISE SENTENCE ---
  if (otherFindings && otherFindings.length > 0) {
    otherFindings.forEach((of) => {
      sentences.push({
        id: `sent-other-${of.id}`,
        text: formatOtherFindingText(of),
        sourceVesselIds: [of.id],
        region: 'global',
        category: 'other'
      });
    });
  }

  // --- 5. LIMITATIONS CONCISE SENTENCE ---
  if (limitations && limitations.hasLimitations && limitations.factors && limitations.factors.length > 0) {
    const limStr = limitations.factors.map((l) => l.replace(/_/g, ' ')).join(', ');
    sentences.push({
      id: 'sent-limitations',
      text: `Assessment was limited by ${limStr}.`,
      sourceVesselIds: ['global'],
      region: 'global',
      category: 'limitation'
    });
  }

  // --- 6. COMPARISON CONCISE SENTENCE ---
  if ((comparisonState?.header?.hasPriorExam || comparisons.length > 0) && comparisons.length > 0) {
    const keyComp = generateKeyComparisonFinding(state);
    if (keyComp) {
      sentences.push({
        id: 'sent-comparison',
        text: `Compared to prior study: ${keyComp}`,
        sourceVesselIds: ['global'],
        region: 'global',
        category: 'comparison'
      });
    }
  }

  // --- 7. KEY IMPRESSION LINE ---
  const keyImpData = generateKeyImpression(state);

  return {
    summarySentences: sentences,
    keyImpression: keyImpData.text,
    impressionVesselIds: keyImpData.sourceVesselIds,
    hasPathology
  };
}

export interface KeyImpressionResult {
  text: string;
  sourceVesselIds: string[];
}

function capitalizeStr(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateKeyImpression(state: ExamState): KeyImpressionResult {
  const { header, vesselFindings, limitations, otherFindings, pelvic, comparisons, comparisonState } = state;
  const scope = getNormalizedScope(header);

  const isRightExamined = scope.regionsExamined.rightLowerLimb;
  const isLeftExamined = scope.regionsExamined.leftLowerLimb;
  const isBilateral = isRightExamined && isLeftExamined;

  let sideText = 'bilateral lower limb';
  if (!isBilateral) {
    if (isRightExamined) sideText = 'right lower limb';
    else if (isLeftExamined) sideText = 'left lower limb';
  }

  const allFindings = Object.values(vesselFindings || {}) as VesselFinding[];

  // 1. Check for Empty / Incomplete Case
  const assessedCount = allFindings.filter((f) => f.status !== 'not_assessed').length;
  if (assessedCount === 0 && Object.keys(vesselFindings || {}).length === 0) {
    return { text: 'Examination findings incomplete.', sourceVesselIds: [] };
  }

  // Collect Deep & Superficial Abnormalities
  const deepAbnormal = allFindings.filter((f) => f.category !== 'superficial' && f.status === 'abnormal');
  const superficialAbnormal = allFindings.filter((f) => f.category === 'superficial' && f.status === 'abnormal');

  // Check if pelvic/iliac status is abnormal
  const isIliocavalAbnormal =
    pelvic?.ivcStatus === 'thrombus_present' ||
    pelvic?.civRightStatus === 'thrombus_present' ||
    pelvic?.civLeftStatus === 'thrombus_present' ||
    vesselFindings?.['right_CIV']?.status === 'abnormal' ||
    vesselFindings?.['left_CIV']?.status === 'abnormal' ||
    vesselFindings?.['right_EIV']?.status === 'abnormal' ||
    vesselFindings?.['left_EIV']?.status === 'abnormal';

  // Check for Follow-Up / Interval Comparison
  const isFollowUp = Boolean(comparisonState?.header?.hasPriorExam || (comparisons && comparisons.length > 0));
  const priorExamDate = comparisonState?.header?.examDate;
  const priorDateStr = priorExamDate ? ` compared with ${priorExamDate}` : '';

  let keyImpressionText = '';
  const impressionVesselIds: string[] = [];

  // --- CASE A: DEEP DVT PRESENT ---
  if (deepAbnormal.length > 0) {
    deepAbnormal.forEach((f) => impressionVesselIds.push(f.id));

    const rightDeep = deepAbnormal.filter((f) => f.side === 'right');
    const leftDeep = deepAbnormal.filter((f) => f.side === 'left');

    const sideSummaries: string[] = [];

    ['right', 'left'].forEach((sideKey) => {
      const sideAbnormals = sideKey === 'right' ? rightDeep : leftDeep;
      if (sideAbnormals.length === 0) return;

      const sideLabel = sideKey; // 'left' or 'right'
      const vesselKeys = sideAbnormals.map((f) => f.vesselKey);
      const vesselNames = sideAbnormals.map((f) => f.vesselName);

      const mainChronicity = sideAbnormals[0].chronicity || 'acute_appearing';
      const mainPatency = sideAbnormals[0].patency || 'completely_occluded';
      const chronicityLabel = formatChronicity(mainChronicity);
      const patencyLabel = formatPatency(mainPatency);

      const isAcuteOnChronic = sideAbnormals.some((f) => f.chronicity === 'acute_on_chronic');
      const isPureChronic = sideAbnormals.every((f) => f.chronicity === 'chronic_post_thrombotic');

      const hasCFV = vesselKeys.includes('CFV');
      const hasFV = vesselKeys.some((k) => k.startsWith('FV'));
      const hasPOPV = vesselKeys.includes('POPV');
      const hasTPTV = vesselKeys.includes('TPTV');
      const hasCalfDeep = vesselKeys.some((k) => ['PTV', 'PERV', 'ATV'].includes(k));
      const hasMuscular = vesselKeys.some((k) => ['MGV', 'LGV', 'SV'].includes(k));

      const isDeepMainAndMuscular = (hasPOPV || hasTPTV || hasCalfDeep) && hasMuscular;

      // 1. Iliofemoral / Extensive Proximal DVT
      if (hasCFV && hasFV && hasPOPV) {
        if (isIliocavalAbnormal) {
          sideSummaries.push(`Extensive ${sideLabel} iliofemoral DVT extending into the CFV and femoral vein`);
        } else {
          sideSummaries.push(`Extensive ${chronicityLabel} ${patencyLabel} DVT involving the ${sideLabel} CFV, FV and popliteal vein`);
        }
      }
      // 2. Multi-vessel continuous DVT (Popliteal/TPT/Peroneal)
      else if (hasPOPV && (hasTPTV || hasCalfDeep) && !hasCFV) {
        const deepNames: string[] = [];
        if (hasPOPV) deepNames.push('popliteal');
        if (hasTPTV) deepNames.push('TPT');
        if (vesselKeys.includes('PERV')) deepNames.push('peroneal');
        if (vesselKeys.includes('PTV')) deepNames.push('posterior tibial');

        const deepStr = deepNames.join('/');

        if (isDeepMainAndMuscular) {
          const muscNames = sideAbnormals
            .filter((f) => ['MGV', 'LGV', 'SV'].includes(f.vesselKey))
            .map((f) => f.vesselName.toLowerCase())
            .join(' and ');
          sideSummaries.push(`${capitalizeStr(sideLabel)} ${deepStr} DVT with separate ${muscNames} vein thrombosis`);
        } else if (vesselKeys.includes('TPTV') && vesselKeys.includes('PERV')) {
          sideSummaries.push(`${capitalizeStr(chronicityLabel)} ${patencyLabel} ${sideLabel} popliteal DVT extending through the TPT into the peroneal veins`);
        } else {
          sideSummaries.push(`${capitalizeStr(chronicityLabel)} ${patencyLabel} ${sideLabel} ${deepStr} DVT, without femoral extension`);
        }
      }
      // 3. Single vessel or specific chronic / acute on chronic
      else if (sideAbnormals.length === 1) {
        const singleF = sideAbnormals[0];
        const extentStr = formatExtent(singleF);

        if (isAcuteOnChronic) {
          sideSummaries.push(`Acute-appearing ${sideLabel} ${singleF.vesselName} DVT superimposed on chronic post-thrombotic change`);
        } else if (singleF.chronicity === 'chronic_post_thrombotic') {
          if (singleF.patency === 'recanalised') {
            sideSummaries.push(`Chronic post-thrombotic change within the ${sideLabel} ${singleF.vesselName} with partial recanalisation`);
          } else if ((singleF.morphology as any)?.includes('synechiae')) {
            sideSummaries.push(`Chronic ${sideLabel} ${singleF.vesselName} post-thrombotic change with recanalisation and residual intraluminal synechiae`);
          } else {
            sideSummaries.push(`Chronic post-thrombotic change within the ${sideLabel} ${singleF.vesselName}`);
          }
        } else {
          const extPhrase = extentStr ? ` ${extentStr}` : '';
          sideSummaries.push(`${capitalizeStr(chronicityLabel)} ${patencyLabel} ${sideLabel} ${singleF.vesselName} DVT${extPhrase}`);
        }
      }
      // 4. General multi-vessel fallback
      else {
        const nameList = vesselNames.join(', ');
        if (isAcuteOnChronic) {
          sideSummaries.push(`Acute-appearing ${sideLabel} ${nameList} DVT superimposed on chronic post-thrombotic change`);
        } else if (isPureChronic) {
          sideSummaries.push(`Chronic post-thrombotic change within the ${sideLabel} ${nameList}`);
        } else {
          sideSummaries.push(`${capitalizeStr(chronicityLabel)} ${patencyLabel} ${sideLabel} ${nameList} DVT`);
        }
      }
    });

    keyImpressionText = sideSummaries.join('; ') + '.';

    // If follow-up, incorporate comparison terms
    if (isFollowUp) {
      const keyComp = generateKeyComparisonFinding(state);
      if (keyComp) {
        keyImpressionText = `${keyComp}${priorDateStr}.`;
      }
    }
  }
  // --- CASE B: NO DEEP DVT, BUT SUPERFICIAL THROMBOSIS PRESENT ---
  else if (superficialAbnormal.length > 0) {
    superficialAbnormal.forEach((f) => impressionVesselIds.push(f.id));

    const supDescs = superficialAbnormal.map((f) => {
      let termStr = '';
      if (f.distanceToJunction && f.distanceToJunction.distanceMm !== undefined) {
        termStr = ` terminating ${f.distanceToJunction.distanceMm} mm distal to the ${f.distanceToJunction.junction}`;
      }
      return `Superficial thrombosis of the ${f.side} ${f.vesselName}${termStr}`;
    });

    keyImpressionText = `No DVT identified. ${supDescs.join('; ')}.`;
  }
  // --- CASE C: NO DVT & NO SUPERFICIAL THROMBOSIS (NORMAL / LIMITED) ---
  else {
    if (limitations?.hasLimitations && limitations.factors?.length > 0) {
      const isCalfLimitation = limitations.factors.some(
        (f) => f.toLowerCase().includes('calf') || f.toLowerCase().includes('edema') || f.toLowerCase().includes('oedema')
      );
      if (isCalfLimitation) {
        keyImpressionText = `No DVT identified within the visualised ${sideText} deep veins; calf assessment limited.`;
      } else {
        const factorStr = limitations.factors.map((f) => f.replace(/_/g, ' ')).join(', ');
        keyImpressionText = `No DVT identified within the assessed ${sideText} veins; assessment limited by ${factorStr}.`;
      }
    } else {
      if (isBilateral) {
        keyImpressionText = 'No DVT identified within the assessed bilateral lower limb deep veins.';
      } else {
        keyImpressionText = `No DVT identified within the assessed ${sideText} deep veins.`;
      }
    }

    if (otherFindings && otherFindings.length > 0) {
      const othSummaries = otherFindings
        .map((of) => {
          const dimStr = formatOtherFindingDimensions(of);
          return `${capitalizeStr(of.side)} ${of.type}${dimStr ? ' measuring ' + dimStr : ''}`;
        })
        .join('; ');

      if (keyImpressionText.endsWith('.')) {
        keyImpressionText = keyImpressionText.slice(0, -1) + `. ${othSummaries}.`;
      } else {
        keyImpressionText += ` ${othSummaries}.`;
      }
    }
  }

  return {
    text: keyImpressionText,
    sourceVesselIds: impressionVesselIds
  };
}
