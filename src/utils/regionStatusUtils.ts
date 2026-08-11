// Commercial-Grade Region Status Utility Engine for DVT Clinical Worksheet
// Provides derived 3-state region statuses (NOT_SET / NORMAL / LIMITED / ABNORMAL)
// and safe bulk update utilities that NEVER overwrite abnormal or non-visualized findings.

import { VesselFinding, VesselStatus } from '../types/dvt';

export type RegionType = 'right_lower_limb' | 'left_lower_limb' | 'iliocaval';

export type RegionStatus = 'NOT_SET' | 'NORMAL' | 'LIMITED' | 'ABNORMAL';

// Routine Vessel Keys for each anatomical region
export const ROUTINE_RIGHT_VESSEL_IDS = [
  'right_CFV',
  'right_PFV',
  'right_FV_PROX',
  'right_FV_MID',
  'right_FV_DIST',
  'right_POPV',
  'right_TPTV',
  'right_PTV',
  'right_PERV',
  'right_MGV',
  'right_LGV',
  'right_SV'
];

export const ROUTINE_LEFT_VESSEL_IDS = [
  'left_CFV',
  'left_PFV',
  'left_FV_PROX',
  'left_FV_MID',
  'left_FV_DIST',
  'left_POPV',
  'left_TPTV',
  'left_PTV',
  'left_PERV',
  'left_MGV',
  'left_LGV',
  'left_SV'
];

export const ROUTINE_ILIOCAVAL_VESSEL_IDS = [
  'pelvis_IVC',
  'right_CIV',
  'left_CIV',
  'right_EIV',
  'left_EIV',
  'right_IIV',
  'left_IIV'
];

/**
 * Calculates derived region status directly from the vessel findings dataset.
 * Logic:
 * 1. IF any vessel in region is 'abnormal' -> 'ABNORMAL'
 * 2. ELSE IF all routine required vessels in region are documented ('normal' or 'not_visualised'):
 *      - if at least 1 vessel is 'not_visualised' -> 'LIMITED'
 *      - else -> 'NORMAL'
 * 3. ELSE -> 'NOT_SET' / 'INCOMPLETE'
 */
export function getRegionStatus(
  region: RegionType,
  vesselFindings: Record<string, VesselFinding>
): RegionStatus {
  const routineKeys =
    region === 'right_lower_limb'
      ? ROUTINE_RIGHT_VESSEL_IDS
      : region === 'left_lower_limb'
      ? ROUTINE_LEFT_VESSEL_IDS
      : ROUTINE_ILIOCAVAL_VESSEL_IDS;

  let hasAbnormal = false;
  let countNormal = 0;
  let countNotVisualised = 0;
  let countUnset = 0;

  // Check routine required vessels
  for (const vId of routineKeys) {
    const f = vesselFindings[vId];
    if (!f || f.status === 'not_assessed') {
      countUnset++;
    } else if (f.status === 'abnormal') {
      hasAbnormal = true;
    } else if (f.status === 'normal') {
      countNormal++;
    } else if (f.status === 'not_visualised') {
      countNotVisualised++;
    }
  }

  // Also check non-routine / optional vessels in this region for any abnormalities
  Object.values(vesselFindings).forEach((f) => {
    if (f.status === 'abnormal') {
      if (region === 'right_lower_limb' && f.side === 'right') hasAbnormal = true;
      if (region === 'left_lower_limb' && f.side === 'left') hasAbnormal = true;
      if (region === 'iliocaval' && (f.side === 'pelvis' || f.category === 'pelvis')) hasAbnormal = true;
    }
  });

  if (hasAbnormal) return 'ABNORMAL';

  if (countUnset > 0) return 'NOT_SET';

  if (countNotVisualised > 0) return 'LIMITED';

  return 'NORMAL';
}

/**
 * Returns routine vessels for a region that are currently UNSET (not_assessed).
 */
export function getUnsetRoutineVesselsForRegion(
  region: RegionType,
  vesselFindings: Record<string, VesselFinding>
): string[] {
  const routineKeys =
    region === 'right_lower_limb'
      ? ROUTINE_RIGHT_VESSEL_IDS
      : region === 'left_lower_limb'
      ? ROUTINE_LEFT_VESSEL_IDS
      : ROUTINE_ILIOCAVAL_VESSEL_IDS;

  return routineKeys.filter((vId) => {
    const f = vesselFindings[vId];
    return !f || f.status === 'not_assessed';
  });
}

/**
 * Returns abnormal vessel findings for a region.
 */
export function getAbnormalVesselsForRegion(
  region: RegionType,
  vesselFindings: Record<string, VesselFinding>
): VesselFinding[] {
  const abns: VesselFinding[] = [];
  Object.values(vesselFindings).forEach((f) => {
    if (f.status === 'abnormal') {
      if (region === 'right_lower_limb' && f.side === 'right') abns.push(f);
      if (region === 'left_lower_limb' && f.side === 'left') abns.push(f);
      if (region === 'iliocaval' && (f.side === 'pelvis' || f.category === 'pelvis')) abns.push(f);
    }
  });
  return abns;
}

/**
 * Marks routine UNSET vessels in a region as NORMAL.
 * CRITICAL SAFETY RULE:
 * NEVER overwrites abnormal, not_visualised, or manually entered findings.
 */
export function markRegionRoutineNormal(
  region: RegionType,
  vesselFindings: Record<string, VesselFinding>
): Record<string, VesselFinding> {
  const routineKeys =
    region === 'right_lower_limb'
      ? ROUTINE_RIGHT_VESSEL_IDS
      : region === 'left_lower_limb'
      ? ROUTINE_LEFT_VESSEL_IDS
      : ROUTINE_ILIOCAVAL_VESSEL_IDS;

  const next = { ...vesselFindings };

  routineKeys.forEach((vId) => {
    const f = next[vId];
    // Populate ONLY if currently unset / not_assessed
    if (f && f.status === 'not_assessed') {
      if (region === 'iliocaval') {
        next[vId] = {
          ...f,
          status: 'normal',
          patency: 'patent',
          compressibility: 'not_applicable' // Avoid inappropriate limb compression findings on pelvic veins
        };
      } else {
        next[vId] = {
          ...f,
          status: 'normal',
          compressibility: 'fully_compressible',
          patency: 'patent'
        };
      }
    }
  });

  return next;
}
