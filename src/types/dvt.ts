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

export type NonVisualizationReason =
  | 'body_habitus'
  | 'severe_edema'
  | 'dressing_bandage_cast'
  | 'bowel_gas'
  | 'deep_location'
  | 'vessel_spasm_hypoplasia'
  | 'acoustic_shadowing_calcification'
  | 'overlying_wound_ulcer'
  | 'patient_pain_movement'
  | 'technical_limitation_other';

export const NON_VISUALIZATION_REASON_LABELS: Record<NonVisualizationReason, string> = {
  body_habitus: 'Body Habitus / Deep Tissue Depth',
  severe_edema: 'Severe Subcutaneous Edema',
  dressing_bandage_cast: 'Bandage / Cast / Surgical Dressing',
  bowel_gas: 'Overlying Bowel Gas Shadowing',
  deep_location: 'Deep Anatomical Location / Technical Limitation',
  vessel_spasm_hypoplasia: 'Vessel Spasm / Small Calibre',
  acoustic_shadowing_calcification: 'Heavy Calcification / Acoustic Shadowing',
  overlying_wound_ulcer: 'Overlying Wound / Open Ulceration',
  patient_pain_movement: 'Patient Pain / Movement',
  technical_limitation_other: 'Other Technical Limitation'
};

export type Continuity = 'continuous' | 'discontinuous_segmental' | 'multiple_separate';

export interface VesselFinding {
  id: string; // e.g., 'right_CFV', 'left_popliteal'
  side: Side;
  vesselKey: string;
  vesselName: string;
  category: VesselCategory;
  pairedSubtype?: 'both' | 'medial_member1' | 'lateral_member2';
  
  status: VesselStatus;

  // Non-visualization details
  nonVisualizationReason?: NonVisualizationReason;
  customNonVisualizationReason?: string;
  
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
export type AugmentationOption =
  | 'normal_augmentation'
  | 'reduced_augmentation'
  | 'absent_augmentation'
  | 'performed_prior_to_dvt'
  | 'not_performed_positive_dvt'
  | 'not_performed'
  | 'not_assessed';

export type ContralateralPhasicity =
  | 'phasic_preserved'
  | 'reduced_phasicity'
  | 'continuous_non_phasic'
  | 'pulsatile'
  | 'not_assessed'
  | 'not_visualised';

export interface ContralateralCFVAssessment {
  side: 'right' | 'left';
  phasicity: ContralateralPhasicity;
  comments?: string;
}

export type SymptomSide = 'Right' | 'Left' | 'Bilateral' | 'Central';
export type SymptomRegion =
  | 'Groin'
  | 'Thigh'
  | 'Popliteal fossa'
  | 'Calf'
  | 'Ankle'
  | 'Generalised leg'
  | 'Other';

export type SymptomFocalFinding =
  | 'No focal abnormality'
  | 'Corresponds to DVT'
  | 'Superficial thrombosis'
  | "Baker's cyst"
  | 'Haematoma'
  | 'Collection'
  | 'Oedema'
  | 'Varicosity'
  | 'Other';

export interface SymptomSiteAssessment {
  side: SymptomSide;
  regions: SymptomRegion[];
  focalAreaAssessed: boolean;
  focalFinding?: SymptomFocalFinding;
  comments?: string;
}

export type UpperExtent = 'IVC' | 'Common iliac' | 'External iliac' | 'CFV / groin' | 'Other';
export type LowerExtent = 'Knee' | 'Proximal calf' | 'Mid calf' | 'Ankle' | 'Other';

export interface LegExamExtent {
  upperExtent: UpperExtent;
  lowerExtent: LowerExtent;
  customUpperExtent?: string;
  customLowerExtent?: string;
}

export interface ExamExtentState {
  right?: LegExamExtent;
  left?: LegExamExtent;
}

export interface ClinicalCommunication {
  contacted: 'Yes' | 'No' | 'Not required under local protocol';
  contactNameRole?: string;
  dateTime?: string;
  method?: 'Phone' | 'In person' | 'Electronic message' | 'Other';
  outcomeInstructions?: string;
  patientDisposition?: string;
}

export type VariantType =
  | 'Duplicated femoral vein'
  | 'Duplicated popliteal vein'
  | 'Variant calf venous anatomy'
  | 'Absent / hypoplastic vein'
  | 'Other';

export interface AnatomicalVariantItem {
  id: string;
  side: 'Right' | 'Left' | 'Bilateral';
  variantType: VariantType;
  vesselKey: string;
  channel1Status: VesselStatus;
  channel1Finding?: Partial<VesselFinding>;
  channel2Status?: VesselStatus;
  channel2Finding?: Partial<VesselFinding>;
  comments?: string;
}

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

export type StudyType =
  | 'Routine DVT study'
  | 'Follow-up known DVT'
  | 'Limited DVT study'
  | 'Targeted / Problem-solving'
  | 'Other';

export interface RegionsExamined {
  rightLowerLimb: boolean;
  leftLowerLimb: boolean;
  iliocaval: boolean;
}

export interface ExaminationScope {
  studyType: StudyType;
  regionsExamined: RegionsExamined;
}

export interface PatientHeader {
  patientId: string;
  patientName: string;
  dob: string;
  examDate: string;
  sonographer: string;
  examType: ExamType;
  scope?: ExaminationScope;
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
    | "Baker's / popliteal cyst"
    | "Suspected ruptured Baker's cyst"
    | 'Haematoma'
    | 'Collection'
    | 'Oedema'
    | 'Enlarged lymph node'
    | 'Collateral veins'
    | 'Superficial varicosities'
    | 'Superficial thrombosis'
    | 'Venous aneurysmal dilatation'
    | 'Other';
  side: 'Right' | 'Left' | 'Bilateral' | 'Pelvis';
  location: string;
  dimensionsLengthMm?: number | null;
  dimensionsWidthMm?: number | null;
  dimensionsDepthMm?: number | null;
  dimensionsText?: string;
  comments: string;
}

export type ComparisonOutcome =
  | 'NEW'
  | 'PERSISTENT'
  | 'STABLE'
  | 'EXTENDED PROXIMALLY'
  | 'EXTENDED DISTALLY'
  | 'INCREASED EXTENT'
  | 'REDUCED EXTENT'
  | 'IMPROVED RECANALISATION'
  | 'REDUCED RECANALISATION'
  | 'INCREASED OCCLUSION'
  | 'REDUCED OCCLUSION'
  | 'RESOLVED'
  | 'RESIDUAL POST-THROMBOTIC CHANGE'
  | 'ACUTE-APPEARING THROMBUS ON CHRONIC CHANGE'
  | 'INDETERMINATE CHANGE'
  | 'UNABLE TO COMPARE'
  // Legacy aliases for backward compatibility
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

export type PriorExamLocation = 'Same institution' | 'External institution' | 'Unknown';

export type ComparisonSource =
  | 'Images and report reviewed'
  | 'Images reviewed'
  | 'Report reviewed only'
  | 'Previous worksheet data available'
  | 'Patient history only'
  | 'Other';

export type PriorStudyQuality =
  | 'Adequate for comparison'
  | 'Partially adequate'
  | 'Limited'
  | 'Unable to reliably compare';

export type ComparisonConfidence = 'HIGH' | 'MODERATE' | 'LIMITED';

export interface PriorExamHeader {
  hasPriorExam: boolean;
  examDate: string;
  location: PriorExamLocation;
  imagesAvailable: 'Yes' | 'No' | 'Report only';
  comparisonSource: ComparisonSource;
  quality: PriorStudyQuality;
  confidence: ComparisonConfidence;
  anticoagulationStatus: string;
  comments?: string;
}

export interface PriorVesselFinding {
  vesselId: string;
  vesselName: string;
  side: Side;
  category: VesselCategory;
  status: VesselStatus; // 'normal' | 'abnormal' | 'not_visualised' | 'not_assessed'
  thrombusPresence?: ThrombusPresence | 'not_documented';
  compressibility?: Compressibility | 'not_documented';
  patency?: Patency | 'not_documented';
  echogenicity?: ThrombusEchogenicity | 'not_documented';
  chronicity?: SonographicChronicity | 'not_documented';
  proximalExtent?: ExtentLandmark;
  distalExtent?: ExtentLandmark;
  distanceToJunctionMm?: number;
  comments?: string;
}

export interface ThrombusGroup {
  id: string;
  name: string;
  side: Side;
  vesselIds: string[];
  overallProximalExtent?: ExtentLandmark;
  overallDistalExtent?: ExtentLandmark;
  isContinuous: boolean;
  suggestedOutcome?: ComparisonOutcome;
  confirmedOutcome?: ComparisonOutcome;
  summary: string;
}

export interface PriorExamRecord {
  id: string;
  examDate: string;
  patientId: string;
  location?: string;
  summaryText: string;
  vesselFindings: Record<string, PriorVesselFinding>;
}

export interface ComparisonState {
  header: PriorExamHeader;
  priorFindings: Record<string, PriorVesselFinding>;
  thrombusGroups: ThrombusGroup[];
  priorTimeline: PriorExamRecord[];
  activePriorExamId?: string;
  viewMode: '3column' | 'diagram_side_by_side' | 'diagram_overlay' | 'change_map';
  filterMode: 'abnormal_or_changed_only' | 'all_assessed';
  includeDiagramInPrint: boolean;
}

export interface VesselComparison {
  vesselId: string;
  vesselName: string;
  side?: Side;
  category?: VesselCategory;
  
  priorStatus: string;
  priorExtent: string;
  priorFinding?: PriorVesselFinding;
  
  currentStatus: string;
  currentExtent: string;
  currentFinding?: VesselFinding;
  
  suggestedOutcome: ComparisonOutcome;
  confirmedOutcome: ComparisonOutcome;
  suggestedStatement?: string;
  confirmedStatement?: string;
  
  confirmed: boolean;
  notes: string;
  
  isThrombusGroupMember?: boolean;
  groupId?: string;
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
  symptomSite?: SymptomSiteAssessment;
  examExtent?: ExamExtentState;
  limitations: ExaminationLimitations;
  vesselFindings: Record<string, VesselFinding>; // keyed by vesselId e.g. 'right_CFV'
  doppler: DopplerAssessment;
  contralateralCFVAssessment?: ContralateralCFVAssessment;
  pelvic: PelvicAssessment;
  clinicalCommunication?: ClinicalCommunication;
  otherFindings: OtherFindingItem[];
  anatomicalVariants?: AnatomicalVariantItem[];
  comparisons: VesselComparison[];
  comparisonState?: ComparisonState;
  generatedSummary: string;
  userSummaryEdited: boolean;
  sonographerSignOff: boolean;
  savedAt?: string;
}
