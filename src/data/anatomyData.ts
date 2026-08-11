// Anatomy metadata and baseline data builder for DVT examination

import { VesselFinding, VesselCategory, Side, Landmark } from '../types/dvt';

export interface VesselDefinition {
  vesselKey: string;
  name: string;
  shortName: string;
  category: VesselCategory;
  defaultLandmarks: {
    proximal: Landmark;
    distal: Landmark;
  };
  isSuperficial?: boolean;
  isMuscular?: boolean;
  supportsPaired?: boolean;
}

export const ANATOMICAL_VESSELS: VesselDefinition[] = [
  // PELVIS / PROXIMAL
  {
    vesselKey: 'IVC',
    name: 'Inferior Vena Cava (IVC)',
    shortName: 'IVC',
    category: 'pelvis',
    defaultLandmarks: { proximal: 'common_iliac_junction', distal: 'common_iliac_junction' }
  },
  {
    vesselKey: 'CIV',
    name: 'Common Iliac Vein',
    shortName: 'CIV',
    category: 'pelvis',
    defaultLandmarks: { proximal: 'common_iliac_junction', distal: 'inguinal_ligament' }
  },
  {
    vesselKey: 'EIV',
    name: 'External Iliac Vein',
    shortName: 'EIV',
    category: 'pelvis',
    defaultLandmarks: { proximal: 'inguinal_ligament', distal: 'groin_crease' }
  },
  {
    vesselKey: 'IIV',
    name: 'Internal Iliac Vein',
    shortName: 'IIV',
    category: 'pelvis',
    defaultLandmarks: { proximal: 'common_iliac_junction', distal: 'inguinal_ligament' }
  },

  // THIGH
  {
    vesselKey: 'CFV',
    name: 'Common Femoral Vein (CFV)',
    shortName: 'CFV',
    category: 'thigh',
    defaultLandmarks: { proximal: 'groin_crease', distal: 'profunda_fv_junction' }
  },
  {
    vesselKey: 'PFV',
    name: 'Profunda Femoris Vein (PFV)',
    shortName: 'PFV',
    category: 'thigh',
    defaultLandmarks: { proximal: 'profunda_fv_junction', distal: 'mid_calf' }
  },
  {
    vesselKey: 'FV_PROX',
    name: 'Femoral Vein (Proximal)',
    shortName: 'Proximal FV',
    category: 'thigh',
    defaultLandmarks: { proximal: 'profunda_fv_junction', distal: 'adductor_canal' }
  },
  {
    vesselKey: 'FV_MID',
    name: 'Femoral Vein (Mid)',
    shortName: 'Mid FV',
    category: 'thigh',
    defaultLandmarks: { proximal: 'profunda_fv_junction', distal: 'adductor_canal' }
  },
  {
    vesselKey: 'FV_DIST',
    name: 'Femoral Vein (Distal / Adductor Canal)',
    shortName: 'Distal FV',
    category: 'thigh',
    defaultLandmarks: { proximal: 'adductor_canal', distal: 'knee_crease' }
  },

  // POPLITEAL
  {
    vesselKey: 'POPV',
    name: 'Popliteal Vein',
    shortName: 'Popliteal V',
    category: 'popliteal',
    defaultLandmarks: { proximal: 'knee_crease', distal: 'knee_crease' }
  },

  // CALF DEEP
  {
    vesselKey: 'TPTV',
    name: 'Tibioperoneal Trunk (TPTV)',
    shortName: 'TP Trunk',
    category: 'calf_deep',
    defaultLandmarks: { proximal: 'knee_crease', distal: 'proximal_calf' }
  },
  {
    vesselKey: 'PTV',
    name: 'Posterior Tibial Veins (PTV)',
    shortName: 'PTV',
    category: 'calf_deep',
    supportsPaired: true,
    defaultLandmarks: { proximal: 'proximal_calf', distal: 'medial_malleolus' }
  },
  {
    vesselKey: 'PERV',
    name: 'Peroneal Veins (PerV)',
    shortName: 'Peroneal V',
    category: 'calf_deep',
    supportsPaired: true,
    defaultLandmarks: { proximal: 'proximal_calf', distal: 'lateral_malleolus' }
  },
  {
    vesselKey: 'ATV',
    name: 'Anterior Tibial Veins (ATV)',
    shortName: 'ATV',
    category: 'calf_deep',
    supportsPaired: true,
    defaultLandmarks: { proximal: 'proximal_calf', distal: 'ankle_crease' }
  },

  // MUSCULAR CALF
  {
    vesselKey: 'MGV',
    name: 'Medial Gastrocnemius Veins',
    shortName: 'Med Gastroc V',
    category: 'muscular_calf',
    isMuscular: true,
    supportsPaired: true,
    defaultLandmarks: { proximal: 'knee_crease', distal: 'mid_calf' }
  },
  {
    vesselKey: 'LGV',
    name: 'Lateral Gastrocnemius Veins',
    shortName: 'Lat Gastroc V',
    category: 'muscular_calf',
    isMuscular: true,
    supportsPaired: true,
    defaultLandmarks: { proximal: 'knee_crease', distal: 'mid_calf' }
  },
  {
    vesselKey: 'SV',
    name: 'Soleal Veins',
    shortName: 'Soleal V',
    category: 'muscular_calf',
    isMuscular: true,
    supportsPaired: true,
    defaultLandmarks: { proximal: 'mid_calf', distal: 'ankle_crease' }
  },

  // SUPERFICIAL
  {
    vesselKey: 'GSV_PROX',
    name: 'Great Saphenous Vein (GSV - Thigh / SFJ)',
    shortName: 'Prox GSV / SFJ',
    category: 'superficial',
    isSuperficial: true,
    defaultLandmarks: { proximal: 'SFJ', distal: 'knee_crease' }
  },
  {
    vesselKey: 'GSV_CALF',
    name: 'Great Saphenous Vein (GSV - Calf)',
    shortName: 'Calf GSV',
    category: 'superficial',
    isSuperficial: true,
    defaultLandmarks: { proximal: 'knee_crease', distal: 'medial_malleolus' }
  },
  {
    vesselKey: 'SSV',
    name: 'Small Saphenous Vein (SSV / SPJ)',
    shortName: 'SSV / SPJ',
    category: 'superficial',
    isSuperficial: true,
    defaultLandmarks: { proximal: 'SPJ', distal: 'mid_calf' }
  },
  {
    vesselKey: 'SUPERFICIAL_VARIX',
    name: 'Superficial Tributary / Varix',
    shortName: 'Superficial Varix',
    category: 'superficial',
    isSuperficial: true,
    defaultLandmarks: { proximal: 'groin_crease', distal: 'ankle_crease' }
  }
];

export const LANDMARK_LABELS: Record<Landmark, string> = {
  SFJ: 'Saphenofemoral Junction (SFJ)',
  groin_crease: 'Groin Crease',
  inguinal_ligament: 'Inguinal Ligament',
  profunda_fv_junction: 'Profunda / Femoral Vein Junction',
  adductor_canal: 'Adductor Canal',
  knee_crease: 'Knee Crease / Popliteal Fossa',
  SPJ: 'Saphenopopliteal Junction (SPJ)',
  fibular_head: 'Fibular Head',
  proximal_calf: 'Proximal Calf',
  mid_calf: 'Mid Calf',
  ankle_crease: 'Ankle Crease',
  medial_malleolus: 'Medial Malleolus',
  lateral_malleolus: 'Lateral Malleolus',
  common_iliac_junction: 'IVC / Common Iliac Junction',
  custom: 'Custom Landmark'
};

export const CLINICAL_INDICATIONS = [
  'Leg swelling',
  'Leg pain',
  'Erythema',
  'Suspected DVT',
  'Known DVT – follow-up',
  'Previous DVT',
  'Pulmonary embolism',
  'Elevated D-dimer',
  'Post-operative',
  'Trauma',
  'Pregnancy/postpartum',
  'Malignancy',
  'Reduced mobility',
  'Anticoagulation',
  'Query progression/extension of known DVT',
  'Query recurrent DVT'
];

export const LIMITATION_FACTORS = [
  { id: 'body_habitus', label: 'Body habitus' },
  { id: 'oedema', label: 'Subcutaneous oedema' },
  { id: 'tenderness', label: 'Severe tenderness' },
  { id: 'wound_dressing', label: 'Surgical wound / dressing' },
  { id: 'compression_garment', label: 'Bandaging / compression garments' },
  { id: 'recent_surgery', label: 'Recent surgery' },
  { id: 'unable_to_tolerate_compression', label: 'Patient unable to tolerate transducer compression' },
  { id: 'reduced_mobility', label: 'Reduced patient mobility' },
  { id: 'unable_to_position', label: 'Unable to position limb appropriately' },
  { id: 'cast_splint', label: 'Cast / orthopedic splint' },
  { id: 'medical_equipment', label: 'Overlying medical equipment / lines' },
  { id: 'bowel_gas', label: 'Bowel gas limiting pelvic veins' },
  { id: 'vessel_too_deep', label: 'Vessels too deep for high-frequency ultrasound' },
  { id: 'calf_poorly_visualised', label: 'Calf veins poorly visualised' },
  { id: 'iliac_poorly_visualised', label: 'Iliac veins poorly visualised' },
  { id: 'ivc_poorly_visualised', label: 'IVC poorly visualised' }
];

export const ROUTINE_VESSEL_KEYS = [
  'CFV',
  'PFV',
  'FV_PROX',
  'FV_MID',
  'FV_DIST',
  'POPV',
  'TPTV',
  'PTV',
  'PERV',
  'MGV',
  'LGV',
  'SV'
];

export const OPTIONAL_VESSEL_KEYS = [
  'IVC',
  'CIV',
  'EIV',
  'IIV',
  'ATV',
  'GSV_PROX',
  'GSV_CALF',
  'SSV',
  'SUPERFICIAL_VARIX'
];

export function createInitialVesselFindings(): Record<string, VesselFinding> {
  const findings: Record<string, VesselFinding> = {};

  const sides: Side[] = ['right', 'left'];

  sides.forEach((side) => {
    ANATOMICAL_VESSELS.forEach((vDef) => {
      // Pelvic central IVC handled separately or side='pelvis'
      if (vDef.vesselKey === 'IVC' && side === 'left') return; // single IVC key 'pelvis_IVC'
      
      const targetSide = vDef.category === 'pelvis' && vDef.vesselKey === 'IVC' ? 'pelvis' : side;
      const vesselId = `${targetSide}_${vDef.vesselKey}`;
      const isRoutine = ROUTINE_VESSEL_KEYS.includes(vDef.vesselKey);

      if (!findings[vesselId]) {
        findings[vesselId] = {
          id: vesselId,
          side: targetSide,
          vesselKey: vDef.vesselKey,
          vesselName: vDef.name,
          category: vDef.category,
          status: 'not_assessed',
          pairedSubtype: vDef.supportsPaired ? 'both' : undefined,
          proximalExtent: {
            distance: null,
            unit: 'mm',
            relation: 'below',
            landmark: vDef.defaultLandmarks.proximal
          },
          distalExtent: {
            distance: null,
            unit: 'mm',
            relation: 'below',
            landmark: vDef.defaultLandmarks.distal
          }
        };
      }
    });
  });

  return findings;
}

export const VESSEL_NAME_MAP: Record<string, string> = ANATOMICAL_VESSELS.reduce((acc, vessel) => {
  acc[vessel.vesselKey] = vessel.shortName || vessel.name;
  return acc;
}, {} as Record<string, string>);
