// Types for Ultrasound Lower Limb DVT Clinical Worksheet

export type Side = 'right' | 'left' | 'pelvis';

export type ExamType =
  | 'Right lower limb'
  | 'Left lower limb'
  | 'Bilateral lower limbs'
  | 'Pelvic/iliocaval assessment'
  | 'Limited DVT study'
  | 'Follow-up known DVT'
  | 'Other';

export type VesselCategory =
  | 'pelvis'
  | 'thigh'
  | 'popliteal'
  | 'calf_deep'
  | 'muscular_calf'
  | 'superficial';

export type VesselStatus = 'normal' | 'abnormal' | 'not_visualised' | 'not_assessed';

export type ThrombusPresence =
  | 'thrombus_present'
  | 'suspected_thrombus'
  | 'residual_post_thrombotic'
  | 'other_abnormality';

export type Compressibility =
  | 'fully_compressible'
  | 'partially_compressible'
  | 'non_compressible'
  | 'compression_not_possible'
  | 'not_applicable'
  | 'not_assessed';

export type Patency =
  | 'patent'
  | 'mostly_patent'
  | 'partially_occluded'
  | 'mostly_occluded'
  | 'completely_occluded'
  | 'recanalised'
  | 'chronic_post_thrombotic_no_acute'
  | 'indeterminate';

export type ThrombusEchogenicity =
  | 'anechoic_hypoechoic'
  | 'hypoechoic'
  | 'mixed_echogenicity'
  | 'intermediate_echogenicity'
  | 'echogenic'
  | 'highly_echogenic'
  | 'calcified'
  | 'heterogeneous'
  | 'indeterminate';

export type MorphologyOption =
  | 'vein_expanded'
  | 'normal_calibre'
  | 'vein_contracted'
  | 'adherent_to_wall'
  | 'mobile_component'
  | 'free_floating'
  | 'synechiae_webs'
  | 'recanalisation'
  | 'collateralisation'
  | 'wall_thickening'
  | 'calcification';

export type SonographicChronicity =
  | 'acute_appearing'
  | 'subacute_appearing'
  | 'chronic_post_thrombotic'
  | 'acute_on_chronic'
  | 'indeterminate_age';

export type Landmark =
  | 'SFJ'
  | 'groin_crease'
  | 'inguinal_ligament'
  | 'profunda_fv_junction'
  | 'adductor_canal'
  | 'knee_crease'
  | 'SPJ'
  | 'fibular_head'
  | 'proximal_calf'
  | 'mid_calf'
  | 'ankle_crease'
  | 'medial_malleolus'
  | 'lateral_malleolus'
  | 'common_iliac_junction'
  | 'custom';

export interface ExtentLandmark {
  distance: number | null; // in mm or cm
  unit: 'mm' | 'cm';
  relation: 'above' | 'below' | 'superior_to' | 'inferior_to' | 'at';
  landmark: Landmark;
  customLandmark?: string;
}

export type Continuity = 'continuous' | 'discontinuous_segmental' | 'multiple_separate';

export interface VesselFinding {
  id: string; // e.g., 'right_CFV', 'left_popliteal'
  side: Side;
  vesselKey: string;
  vesselName: string;
  category: VesselCategory;
  pairedSubtype?: 'both' | 'medial_member1' | 'lateral_member2';
  
  status: VesselStatus;
  
  // Abnormal details
  thrombusPresence?: ThrombusPresence;
  compressibility?: Compressibility;
  patency?: Patency;
  echogenicity?: ThrombusEchogenicity;
  morphology?: MorphologyOption[];
  chronicity?: SonographicChronicity;
  
  proximalExtent?: ExtentLandmark;
  distalExtent?: ExtentLandmark;
  
  // Distance to junction for superficial
  distanceToJunction?: {
    junction: 'SFJ' | 'SPJ';
    distanceMm: number;
    extensionIntoDeep: 'no_extension' | 'extension' | 'unable_to_determine';
  };
  
  continuity?: Continuity;
  continuousWithVesselIds?: string[];
  locationDetails?: string;
  comments?: string;
}

export type PhasicityOption = 'phasic' | 'reduced_phasicity' | 'continuous_non_phasic' | 'pulsatile' | 'not_assessed';
export type AugmentationOption = 'normal_augmentation' | 'reduced_augmentation' | 'absent_augmentation' | 'not_performed' | 'not_assessed';

export interface DopplerAssessment {
  rightCFVPhasicity: PhasicityOption;
  leftCFVPhasicity: PhasicityOption;
  rightPopPhasicity: PhasicityOption;
  leftPopPhasicity: PhasicityOption;
  rightAugmentation: AugmentationOption;
  leftAugmentation: AugmentationOption;
  dopplerComments: string;
}

export type LimitationSeverity = 'minor' | 'moderate' | 'significant';

export interface ExaminationLimitations {
  hasLimitations: boolean;
  factors: string[]; // 'body_habitus', 'oedema', etc.
  severity: LimitationSeverity;
  affectedVesselIds: string[];
  customDetails: string;
}

export interface PatientHeader {
  patientId: string;
  patientName: string;
  dob: string;
  examDate: string;
  sonographer: string;
  examType: ExamType;
  indications: string[];
  clinicalHistory: string;
}

export interface PreviousHistory {
  hasPreviousDvt: 'No' | 'Yes' | 'Unknown';
  previousDvtSide?: 'Right' | 'Left' | 'Bilateral';
  previousDvtDate?: string;
  previouslyInvolvedVessels?: string;
  previousThrombusExtent?: string;
  previousChronicity?: string;
  previousReportSummary?: string;
  previousStudyDate?: string;
  
  anticoagulation: 'None' | 'Current anticoagulation' | 'Recently ceased' | 'Unknown';
  anticoagulationDetails?: string;
  
  previousVenousProcedures: Array<{
    id: string;
    side: 'Right' | 'Left' | 'Bilateral' | 'Central';
    procedure: string;
    dateApprox?: string;
    vesselInvolved?: string;
    details?: string;
  }>;
  
  previousArterialSurgery: string[];
  previousArterialDetails?: string;
}

export interface PelvicAssessment {
  ivcVisualised: 'visualised' | 'partially_visualised' | 'not_visualised';
  ivcStatus: 'patent' | 'thrombus_present' | 'not_assessed';
  ivcDetails: string;
  filterPresent: boolean;
  stentPresent: boolean;
  civRightStatus: 'patent' | 'thrombus_present' | 'not_visualised';
  civLeftStatus: 'patent' | 'thrombus_present' | 'not_visualised';
  eivRightStatus: 'patent' | 'thrombus_present' | 'not_visualised';
  eivLeftStatus: 'patent' | 'thrombus_present' | 'not_visualised';
  pelvicComments: string;
}

export interface OtherFindingItem {
  id: string;
  type:
    | "Baker's cyst"
    | "Ruptured Baker's cyst appearance"
    | 'Oedema'
    | 'Haematoma'
    | 'Collection'
    | 'Lymph node'
    | 'Superficial thrombophlebitis'
    | 'Varicose veins'
    | 'Venous aneurysm'
    | 'Duplicated femoral vein'
    | 'Duplicated popliteal vein'
    | 'Anatomical variant'
    | 'Absent/hypoplastic vessel'
    | 'Collateral veins'
    | 'Pulsatile venous flow'
    | 'Other';
  side: 'Right' | 'Left' | 'Bilateral';
  location: string;
  dimensions?: string;
  comments: string;
}

export type ComparisonOutcome =
  | 'New thrombus'
  | 'Interval extension'
  | 'Interval reduction'
  | 'Stable/no significant change'
  | 'Improved recanalisation'
  | 'Increased occlusion'
  | 'Resolved'
  | 'Residual chronic/post-thrombotic change'
  | 'Unable to compare'
  | 'Indeterminate';

export interface VesselComparison {
  vesselId: string;
  vesselName: string;
  priorStatus: string;
  priorExtent: string;
  currentStatus: string;
  currentExtent: string;
  suggestedOutcome: ComparisonOutcome;
  confirmedOutcome: ComparisonOutcome;
  confirmed: boolean;
  notes: string;
}

export interface ValidationAlert {
  id: string;
  severity: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  vesselId?: string;
}

export interface ExamState {
  header: PatientHeader;
  history: PreviousHistory;
  limitations: ExaminationLimitations;
  vesselFindings: Record<string, VesselFinding>; // keyed by vesselId e.g. 'right_CFV'
  doppler: DopplerAssessment;
  pelvic: PelvicAssessment;
  otherFindings: OtherFindingItem[];
  comparisons: VesselComparison[];
  generatedSummary: string;
  userSummaryEdited: boolean;
  sonographerSignOff: boolean;
  savedAt?: string;
}
