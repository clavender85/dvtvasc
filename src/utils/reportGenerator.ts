// Structured Sonographer Findings Summary Generator

import { ExamState, VesselFinding, Side, SonographicChronicity, Patency, Compressibility } from '../types/dvt';
import { ANATOMICAL_VESSELS, LANDMARK_LABELS } from '../data/anatomyData';
import { generateIntervalComparisonSummary, generateKeyComparisonFinding } from './comparisonEngine';

function formatExtent(f: VesselFinding): string {
  if (!f.proximalExtent?.distance && !f.distalExtent?.distance) return '';

  let str = '';
  if (f.proximalExtent && f.proximalExtent.distance !== null) {
    const lm = LANDMARK_LABELS[f.proximalExtent.landmark] || f.proximalExtent.landmark;
    const rel = f.proximalExtent.relation.replace('_', ' ');
    str += `${f.proximalExtent.distance} ${f.proximalExtent.unit} ${rel} the ${lm.toLowerCase()}`;
  }

  if (f.distalExtent && f.distalExtent.distance !== null) {
    const lm = LANDMARK_LABELS[f.distalExtent.landmark] || f.distalExtent.landmark;
    const rel = f.distalExtent.relation.replace('_', ' ');
    if (str) str += ' to ';
    str += `${f.distalExtent.distance} ${f.distalExtent.unit} ${rel} the ${lm.toLowerCase()}`;
  }

  return str ? `extending from ${str}` : '';
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

export function generateSonographerSummary(state: ExamState): string {
  const lines: string[] = [];
  const { header, history, limitations, vesselFindings, doppler, pelvic, otherFindings, comparisons, comparisonState } = state;
  const hasPrior = comparisonState?.header?.hasPriorExam || comparisons.length > 0;

  // 1. Clinical Indication & Scope
  lines.push(`EXAMINATION: Venous Duplex Ultrasound - ${header.examType.toUpperCase()}`);
  if (header.indications.length > 0) {
    lines.push(`CLINICAL INDICATION: ${header.indications.join(', ')}.`);
  }
  if (header.clinicalHistory) {
    lines.push(`CLINICAL HISTORY: ${header.clinicalHistory}`);
  }
  lines.push('');

  // 2. Prior Study Header if present
  if (hasPrior && comparisonState?.header) {
    const pHead = comparisonState.header;
    lines.push('=== PRIOR EXAMINATION COMPARISON PROTOCOL ===');
    lines.push(`Previous Examination Available: YES (Date: ${pHead.examDate || 'Not specified'}, Location: ${pHead.location}).`);
    lines.push(`Comparison Source: ${pHead.comparisonSource} (Images Available: ${pHead.imagesAvailable}).`);
    lines.push(`Prior Study Quality: ${pHead.quality} | Confidence: ${pHead.confidence}.`);
    if (pHead.anticoagulationStatus) lines.push(`Prior Anticoagulation: ${pHead.anticoagulationStatus}.`);
    lines.push('');
  }

  // 3. Limitations
  if (limitations.hasLimitations) {
    const factorsText = limitations.factors.map((f) => f.replace(/_/g, ' ')).join(', ');
    lines.push(`EXAMINATION LIMITATIONS: ${limitations.severity.toUpperCase()} limitations due to ${factorsText}. ${limitations.customDetails}`);
    lines.push('Unvisualised vessel segments are explicitly excluded from normal statements.');
    lines.push('');
  }

  // Helper to compile findings for a specific side
  const processLimb = (side: Side, sideLabel: string) => {
    // Check if this limb was part of the examination scope
    const isExamined =
      header.examType === 'Bilateral lower limbs' ||
      (header.examType === 'Right lower limb' && side === 'right') ||
      (header.examType === 'Left lower limb' && side === 'left') ||
      header.examType === 'Follow-up known DVT' ||
      header.examType === 'Limited DVT study';

    lines.push(`=== ${sideLabel.toUpperCase()} LOWER LIMB ===`);

    if (!isExamined) {
      lines.push(`${sideLabel} lower limb was not included in this exam request and was NOT assessed.`);
      lines.push('');
      return;
    }

    // Filter deep vessels for this side
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

    // Deep Vein Summary Statement
    if (abnormalDeep.length === 0) {
      if (unvisualisedDeep.length > 0) {
        const unvisNames = unvisualisedDeep.map((v) => v.vesselName).join(', ');
        lines.push(
          `Deep veins assessed from CFV to calf show normal compressibility and patency. Note: The following vessel(s) could not be adequately visualised: ${unvisNames}.`
        );
      } else {
        lines.push(
          `The deep veins demonstrate normal compressibility, patency, and wall features from the common femoral vein through to the distal calf veins. No deep venous thrombosis identified.`
        );
      }
    } else {
      lines.push(`Deep Venous Abnormalities Identified:`);
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
        lines.push(line);
      });
    }

    // Muscular Calf Veins
    const muscularVessels = ANATOMICAL_VESSELS.filter((v) => v.category === 'muscular_calf');
    const abnormalMuscular = muscularVessels
      .map((v) => vesselFindings[`${side}_${v.vesselKey}`])
      .filter((f) => f && f.status === 'abnormal');

    if (abnormalMuscular.length > 0) {
      lines.push('');
      lines.push('Muscular Calf Vein Findings:');
      abnormalMuscular.forEach((f) => {
        const chron = formatChronicity(f.chronicity);
        const ext = formatExtent(f);
        lines.push(
          `• ${f.vesselName}: ${chron} thrombus identified (${formatPatency(f.patency)}, ${formatCompressibility(f.compressibility)}) ${ext}. ${f.comments}`
        );
      });
    }

    // Doppler
    const cfvPhasicity = side === 'right' ? doppler.rightCFVPhasicity : doppler.leftCFVPhasicity;
    const popPhasicity = side === 'right' ? doppler.rightPopPhasicity : doppler.leftPopPhasicity;
    const aug = side === 'right' ? doppler.rightAugmentation : doppler.leftAugmentation;

    lines.push('');
    lines.push(
      `Spectral Doppler: Respiratory phasicity at Common Femoral Vein is ${cfvPhasicity.replace(/_/g, ' ')}. Popliteal vein flow is ${popPhasicity.replace(/_/g, ' ')}. Distal augmentation: ${aug.replace(/_/g, ' ')}.`
    );
    lines.push('');
  };

  processLimb('right', 'Right');
  processLimb('left', 'Left');

  // 4. Pelvic Assessment
  if (
    header.examType === 'Pelvic/iliocaval assessment' ||
    pelvic.ivcVisualised !== 'not_visualised' ||
    pelvic.civRightStatus !== 'not_visualised' ||
    pelvic.civLeftStatus !== 'not_visualised'
  ) {
    lines.push('=== PELVIC / ILIOCAVAL ASSESSMENT ===');
    lines.push(`IVC: ${pelvic.ivcVisualised.replace('_', ' ').toUpperCase()} - ${pelvic.ivcStatus.toUpperCase()}. ${pelvic.ivcDetails}`);
    if (pelvic.filterPresent) lines.push('• IVC filter noted in situ.');
    if (pelvic.stentPresent) lines.push('• Iliac venous stent noted in situ.');
    lines.push(`• Right Common / External Iliac Veins: ${pelvic.civRightStatus.replace('_', ' ')}.`);
    lines.push(`• Left Common / External Iliac Veins: ${pelvic.civLeftStatus.replace('_', ' ')}.`);
    if (pelvic.pelvicComments) lines.push(`Comments: ${pelvic.pelvicComments}`);
    lines.push('');
  }

  // 5. Superficial Veins
  const superficialVessels = ANATOMICAL_VESSELS.filter((v) => v.category === 'superficial');
  const abnormalSuperficial: VesselFinding[] = [];

  ['right', 'left'].forEach((side) => {
    superficialVessels.forEach((v) => {
      const f = vesselFindings[`${side}_${v.vesselKey}`];
      if (f && f.status === 'abnormal') abnormalSuperficial.push(f);
    });
  });

  lines.push('=== SUPERFICIAL VENOUS SYSTEM ===');
  if (abnormalSuperficial.length === 0) {
    lines.push('Great Saphenous Veins (GSV) and Small Saphenous Veins (SSV) assessed demonstrate normal compressibility without superficial venous thrombosis.');
  } else {
    abnormalSuperficial.forEach((f) => {
      let msg = `• ${f.vesselName} (${f.side.toUpperCase()}): Superficial venous thrombosis identified (${formatPatency(f.patency)}).`;
      if (f.distanceToJunction && f.distanceToJunction.distanceMm !== undefined) {
        msg += ` Thrombus terminates ${f.distanceToJunction.distanceMm} mm inferior to the ${f.distanceToJunction.junction}. Extension into deep system: ${f.distanceToJunction.extensionIntoDeep.replace(/_/g, ' ')}.`;
      }
      if (f.comments) msg += ` ${f.comments}`;
      lines.push(msg);
    });
  }
  lines.push('');

  // 6. Other / Non-venous Findings
  if (otherFindings.length > 0) {
    lines.push('=== OTHER / NON-VENOUS FINDINGS ===');
    otherFindings.forEach((of) => {
      lines.push(`• ${of.side} ${of.type}: Located at ${of.location}.${of.dimensions ? ` Dimensions: ${of.dimensions}.` : ''} ${of.comments}`);
    });
    lines.push('');
  }

  // 7. Confirmed Interval Comparison Summary
  if (hasPrior && comparisons.length > 0) {
    lines.push('=== INTERVAL COMPARISON SUMMARY ===');
    lines.push(generateIntervalComparisonSummary(state));
    lines.push('');
  }

  // 8. Impression / Key Findings
  lines.push('=== SONOGRAPHER IMPRESSION / KEY FINDINGS ===');
  const keyCompFinding = generateKeyComparisonFinding(state);
  if (keyCompFinding) {
    lines.push(`KEY COMPARISON FINDING: ${keyCompFinding}`);
    lines.push('');
  }

  const abnormalDeepCount = (Object.values(vesselFindings) as VesselFinding[]).filter(
    (f) => f.category !== 'superficial' && f.status === 'abnormal' && f.thrombusPresence === 'thrombus_present'
  ).length;

  if (abnormalDeepCount > 0) {
    lines.push('1. DEEP VENOUS THROMBOSIS IDENTIFIED:');
    (Object.values(vesselFindings) as VesselFinding[])
      .filter((f) => f.category !== 'superficial' && f.status === 'abnormal')
      .forEach((f) => {
        const sideUpper = f.side.toUpperCase();
        lines.push(`   - ${sideUpper} ${f.vesselName}: ${formatChronicity(f.chronicity)}, ${formatPatency(f.patency)} thrombus (${formatExtent(f)}).`);
      });
  } else if (abnormalSuperficial.length > 0) {
    lines.push('1. NO DEEP VENOUS THROMBOSIS IDENTIFIED.');
    lines.push('2. SUPERFICIAL VENOUS THROMBOSIS DOCUMENTED (see details above).');
  } else {
    lines.push('1. NO DEEP OR SUPERFICIAL VENOUS THROMBOSIS IDENTIFIED WITHIN THE ASSESSED VESSEL SEGMENTS.');
  }

  if (doppler.rightCFVPhasicity === 'reduced_phasicity' || doppler.leftCFVPhasicity === 'reduced_phasicity') {
    lines.push('2. Reduced common femoral vein respiratory phasicity noted. Recommend correlation for proximal pelvic compression if clinically warranted.');
  }

  return lines.join('\n');
}

