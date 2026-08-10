// Demonstration cases for live ultrasound worksheet testing

import { ExamState } from '../types/dvt';
import { createInitialVesselFindings } from './anatomyData';

const baseExamState: ExamState = {
  header: {
    patientId: 'PAT-884920',
    patientName: 'Jane Smith',
    dob: '1968-05-14',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: 'Sarah Jenkins, AMS (Vascular)',
    examType: 'Bilateral lower limbs',
    indications: ['Leg swelling', 'Suspected DVT'],
    clinicalHistory: '58-year-old female 5 days post right total knee replacement with progressive left leg swelling and calf tenderness. On prophylactic Enoxaparin.'
  },
  history: {
    hasPreviousDvt: 'No',
    anticoagulation: 'Current anticoagulation',
    anticoagulationDetails: 'Enoxaparin 40mg SC daily (prophylactic)',
    previousVenousProcedures: [],
    previousArterialSurgery: []
  },
  limitations: {
    hasLimitations: false,
    factors: [],
    severity: 'minor',
    affectedVesselIds: [],
    customDetails: ''
  },
  vesselFindings: createInitialVesselFindings(),
  doppler: {
    rightCFVPhasicity: 'phasic',
    leftCFVPhasicity: 'phasic',
    rightPopPhasicity: 'phasic',
    leftPopPhasicity: 'phasic',
    rightAugmentation: 'normal_augmentation',
    leftAugmentation: 'normal_augmentation',
    dopplerComments: 'Spontaneous phasic flow with good manual distal augmentation bilaterally.'
  },
  pelvic: {
    ivcVisualised: 'visualised',
    ivcStatus: 'patent',
    ivcDetails: 'Patent with normal respiratory variations.',
    filterPresent: false,
    stentPresent: false,
    civRightStatus: 'patent',
    civLeftStatus: 'patent',
    eivRightStatus: 'patent',
    eivLeftStatus: 'patent',
    pelvicComments: 'Iliocaval segment demonstrates colour fill and patent non-occluded lumen.'
  },
  otherFindings: [],
  comparisons: [],
  generatedSummary: '',
  userSummaryEdited: false,
  sonographerSignOff: false
};

// Demo 1: Normal Bilateral Study
export const DEMO_CASE_1_NORMAL: ExamState = {
  ...baseExamState,
  header: {
    ...baseExamState.header,
    patientId: 'NOR-10023',
    patientName: 'Robert Vance',
    dob: '1975-09-21',
    examType: 'Bilateral lower limbs',
    indications: ['Leg swelling', 'Elevated D-dimer'],
    clinicalHistory: 'Bilateral mild pedal oedema following long haul flight. Elevated D-dimer 0.65 mg/L.'
  }
};

// Demo 2: Acute-appearing occlusive left popliteal DVT extending into PTV and PerV
export const DEMO_CASE_2_ACUTE_POPLITEAL: ExamState = {
  ...baseExamState,
  header: {
    patientId: 'DVT-90211',
    patientName: 'Margaret Lawson',
    dob: '1959-11-03',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: 'David Miller, RVT',
    examType: 'Left lower limb',
    indications: ['Leg swelling', 'Leg pain', 'Suspected DVT'],
    clinicalHistory: 'Sudden onset painful left calf swelling following recent 12-hour car trip. No prior DVT.'
  },
  vesselFindings: (() => {
    const vf = createInitialVesselFindings();
    
    // Left Popliteal
    vf['left_POPV'] = {
      ...vf['left_POPV'],
      status: 'abnormal',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'completely_occluded',
      echogenicity: 'hypoechoic',
      morphology: ['vein_expanded', 'adherent_to_wall'],
      chronicity: 'acute_appearing',
      proximalExtent: {
        distance: 50,
        unit: 'mm',
        relation: 'above',
        landmark: 'knee_crease'
      },
      distalExtent: {
        distance: 50,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      continuity: 'continuous',
      continuousWithVesselIds: ['left_PTV', 'left_PERV'],
      comments: 'Expanded non-compressible popliteal vein filled with hypoechoic acute thrombus.'
    };

    // Left PTV
    vf['left_PTV'] = {
      ...vf['left_PTV'],
      status: 'abnormal',
      pairedSubtype: 'both',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'completely_occluded',
      echogenicity: 'hypoechoic',
      morphology: ['vein_expanded'],
      chronicity: 'acute_appearing',
      proximalExtent: {
        distance: 50,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      distalExtent: {
        distance: 120,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      continuity: 'continuous',
      comments: 'Occlusive acute thrombus involving paired posterior tibial veins.'
    };

    // Left Peroneal
    vf['left_PERV'] = {
      ...vf['left_PERV'],
      status: 'abnormal',
      pairedSubtype: 'both',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'completely_occluded',
      echogenicity: 'hypoechoic',
      chronicity: 'acute_appearing',
      proximalExtent: {
        distance: 50,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      distalExtent: {
        distance: 100,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      comments: 'Occlusive acute thrombus involving peroneal veins.'
    };

    return vf;
  })(),
  doppler: {
    ...baseExamState.doppler,
    leftCFVPhasicity: 'reduced_phasicity',
    leftPopPhasicity: 'continuous_non_phasic',
    leftAugmentation: 'absent_augmentation',
    dopplerComments: 'Continuous non-phasic flow at left CFV with absent distal augmentation due to occlusive distal outflow obstruction.'
  }
};

// Demo 3: Follow-up DVT with partially recanalised popliteal & PTV thrombus
export const DEMO_CASE_3_FOLLOWUP_RECANALISED: ExamState = {
  ...baseExamState,
  header: {
    patientId: 'FU-40281',
    patientName: 'Arthur Pendelton',
    dob: '1962-02-18',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: 'Sarah Jenkins, AMS',
    examType: 'Follow-up known DVT',
    indications: ['Known DVT – follow-up', 'Anticoagulation', 'Query progression/extension of known DVT'],
    clinicalHistory: '3 months follow-up of extensive left popliteal/calf DVT. Currently on Rivaroxaban 20mg.'
  },
  history: {
    hasPreviousDvt: 'Yes',
    previousDvtSide: 'Left',
    previousDvtDate: '3 months ago',
    previouslyInvolvedVessels: 'Left popliteal, PTV and Peroneal veins',
    previousThrombusExtent: 'Completely occlusive acute popliteal DVT extending into upper calf',
    previousChronicity: 'acute_appearing',
    previousReportSummary: 'Extensive occlusive acute left popliteal and calf deep vein thrombosis.',
    previousStudyDate: '2026-05-10',
    anticoagulation: 'Current anticoagulation',
    anticoagulationDetails: 'Rivaroxaban 20mg OD',
    previousVenousProcedures: [],
    previousArterialSurgery: []
  },
  vesselFindings: (() => {
    const vf = createInitialVesselFindings();

    vf['left_POPV'] = {
      ...vf['left_POPV'],
      status: 'abnormal',
      thrombusPresence: 'residual_post_thrombotic',
      compressibility: 'partially_compressible',
      patency: 'recanalised',
      echogenicity: 'mixed_echogenicity',
      morphology: ['recanalisation', 'wall_thickening', 'synechiae_webs'],
      chronicity: 'chronic_post_thrombotic',
      proximalExtent: {
        distance: 40,
        unit: 'mm',
        relation: 'above',
        landmark: 'knee_crease'
      },
      distalExtent: {
        distance: 30,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      comments: 'Partially compressible wall-adherent chronic thrombus with central channel recanalisation.'
    };

    vf['left_PTV'] = {
      ...vf['left_PTV'],
      status: 'abnormal',
      pairedSubtype: 'both',
      thrombusPresence: 'residual_post_thrombotic',
      compressibility: 'partially_compressible',
      patency: 'recanalised',
      echogenicity: 'echogenic',
      chronicity: 'chronic_post_thrombotic',
      comments: 'Residual linear chronic web-like changes with partial luminal restoration.'
    };

    return vf;
  })(),
  comparisonState: {
    header: {
      hasPriorExam: true,
      examDate: '2026-05-10',
      location: 'Same institution',
      imagesAvailable: 'Yes',
      comparisonSource: 'Previous worksheet data available',
      quality: 'Adequate for comparison',
      confidence: 'HIGH',
      anticoagulationStatus: 'Rivaroxaban 20mg OD'
    },
    priorFindings: {
      left_POPV: {
        vesselId: 'left_POPV',
        vesselName: 'Left Popliteal Vein',
        side: 'left',
        category: 'popliteal',
        status: 'abnormal',
        thrombusPresence: 'thrombus_present',
        compressibility: 'non_compressible',
        patency: 'completely_occluded',
        chronicity: 'acute_appearing',
        proximalExtent: {
          distance: 50,
          unit: 'mm',
          relation: 'above',
          landmark: 'knee_crease'
        },
        comments: 'Completely occluded acute hypoechoic popliteal thrombus extending 50mm above knee crease.'
      }
    },
    thrombusGroups: [],
    priorTimeline: [],
    viewMode: '3column',
    filterMode: 'abnormal_or_changed_only',
    includeDiagramInPrint: true
  },
  comparisons: [
    {
      vesselId: 'left_POPV',
      vesselName: 'Left Popliteal Vein',
      side: 'left',
      category: 'popliteal',
      priorStatus: 'Completely occluded acute thrombus extending 50mm above knee crease',
      priorExtent: '50 mm above knee crease',
      currentStatus: 'Partially compressible, recanalised chronic thrombus 40mm above knee crease',
      currentExtent: '40 mm above knee crease',
      suggestedOutcome: 'IMPROVED RECANALISATION',
      confirmedOutcome: 'IMPROVED RECANALISATION',
      suggestedStatement: 'Persistent left popliteal thrombus with improved recanalisation and interval reduction in proximal extent.',
      confirmedStatement: 'Substantial improvement in luminal flow and partial recanalisation compared with 3-month prior study.',
      confirmed: true,
      notes: 'Substantial improvement in luminal flow and partial recanalisation compared with 3-month prior study.'
    }
  ]
};

// Demo 4: New Muscular Calf DVT (Comparison)
export const DEMO_CASE_4_NEW_MUSCULAR_DVT: ExamState = {
  ...baseExamState,
  header: {
    patientId: 'MUS-77319',
    patientName: 'Helen Brooks',
    dob: '1981-08-12',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: 'Elena Rostova, BS RVT',
    examType: 'Left lower limb',
    indications: ['Leg pain', 'Query recurrent DVT', 'Previous DVT'],
    clinicalHistory: 'Recurrent left focal medial calf pain 1 week after returning to gym. Prior calf DVT 2 years ago resolved.'
  },
  history: {
    hasPreviousDvt: 'Yes',
    previousDvtSide: 'Left',
    previousDvtDate: '2 years ago',
    previouslyInvolvedVessels: 'Left posterior tibial vein',
    previousThrombusExtent: 'Focal distal PTV thrombus - completely resolved on 6-month check',
    previousChronicity: 'resolved',
    previousReportSummary: 'Resolved prior PTV thrombus with normal deep venous compressibility.',
    previousStudyDate: '2024-10-15',
    anticoagulation: 'None',
    previousVenousProcedures: [],
    previousArterialSurgery: []
  },
  vesselFindings: (() => {
    const vf = createInitialVesselFindings();

    // Soleal vein
    vf['left_SV'] = {
      ...vf['left_SV'],
      status: 'abnormal',
      pairedSubtype: 'both',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'completely_occluded',
      echogenicity: 'hypoechoic',
      morphology: ['vein_expanded'],
      chronicity: 'acute_appearing',
      proximalExtent: {
        distance: 80,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      distalExtent: {
        distance: 140,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      comments: 'Expanded non-compressible medial soleal sinus with acute hypoechoic thrombus.'
    };

    // Medial Gastrocnemius
    vf['left_MGV'] = {
      ...vf['left_MGV'],
      status: 'abnormal',
      pairedSubtype: 'medial_member1',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'mostly_occluded',
      echogenicity: 'hypoechoic',
      chronicity: 'acute_appearing',
      proximalExtent: {
        distance: 60,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      distalExtent: {
        distance: 100,
        unit: 'mm',
        relation: 'below',
        landmark: 'knee_crease'
      },
      comments: 'Thrombus in medial gastrocnemius vein segment.'
    };

    return vf;
  })(),
  comparisons: [
    {
      vesselId: 'left_SV',
      vesselName: 'Left Soleal Vein',
      priorStatus: 'Normal / clear',
      priorExtent: 'None',
      currentStatus: 'Acute occlusive thrombus',
      currentExtent: '80mm - 140mm below knee crease',
      suggestedOutcome: 'New thrombus',
      confirmedOutcome: 'New thrombus',
      confirmed: true,
      notes: 'New muscular calf venous thrombosis identified in left soleal and gastrocnemius veins compared to normal prior study.'
    }
  ]
};

// Demo 5: Superficial GSV Thrombosis (18 mm from SFJ)
export const DEMO_CASE_5_SUPERFICIAL_GSV: ExamState = {
  ...baseExamState,
  header: {
    patientId: 'SVT-33019',
    patientName: 'Gareth Edwards',
    dob: '1971-04-30',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: 'David Miller, RVT',
    examType: 'Right lower limb',
    indications: ['Erythema', 'Leg pain', 'Suspected DVT'],
    clinicalHistory: 'Painful cord-like erythema along medial right thigh over varicosities. Rule out DVT and proximity to SFJ.'
  },
  vesselFindings: (() => {
    const vf = createInitialVesselFindings();

    vf['right_GSV_PROX'] = {
      ...vf['right_GSV_PROX'],
      status: 'abnormal',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'completely_occluded',
      echogenicity: 'hypoechoic',
      morphology: ['vein_expanded', 'adherent_to_wall'],
      chronicity: 'acute_appearing',
      distanceToJunction: {
        junction: 'SFJ',
        distanceMm: 18,
        extensionIntoDeep: 'no_extension'
      },
      proximalExtent: {
        distance: 18,
        unit: 'mm',
        relation: 'inferior_to',
        landmark: 'SFJ'
      },
      distalExtent: {
        distance: 150,
        unit: 'mm',
        relation: 'below',
        landmark: 'groin_crease'
      },
      comments: 'Occlusive acute superficial venous thrombosis terminating 18 mm inferior to the saphenofemoral junction (SFJ). No extension into CFV.'
    };

    return vf;
  })(),
  otherFindings: [
    {
      id: 'of-1',
      type: 'Superficial thrombophlebitis',
      side: 'Right',
      location: 'Medial thigh along proximal GSV',
      dimensions: '15 cm segment',
      comments: 'Associated cutaneous thickening and non-compressible superficial varix.'
    }
  ]
};

// Demo 6: Technically Limited Examination
export const DEMO_CASE_6_LIMITED: ExamState = {
  ...baseExamState,
  header: {
    patientId: 'LIM-55920',
    patientName: 'Clara Oswald',
    dob: '1948-12-05',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: 'Sarah Jenkins, AMS',
    examType: 'Limited DVT study',
    indications: ['Leg swelling', 'Post-operative', 'Reduced mobility'],
    clinicalHistory: 'Day 3 post pelvic fracture fixation. Severe bilateral lower limb swelling, severe tenderness and heavy bandaging.'
  },
  limitations: {
    hasLimitations: true,
    factors: ['body_habitus', 'oedema', 'tenderness', 'compression_garment', 'calf_poorly_visualised'],
    severity: 'significant',
    affectedVesselIds: [
      'right_PTV', 'right_PERV', 'right_ATV', 'right_MGV', 'right_LGV', 'right_SV',
      'left_PTV', 'left_PERV', 'left_ATV', 'left_MGV', 'left_LGV', 'left_SV'
    ],
    customDetails: 'Severe non-pitting subcutaneous oedema and post-surgical dressings severely degrade ultrasound penetration in calf bilaterally.'
  },
  vesselFindings: (() => {
    const vf = createInitialVesselFindings();

    // Mark calf deep & muscular as not_visualised
    const calfVesselKeys = ['PTV', 'PERV', 'ATV', 'MGV', 'LGV', 'SV'];
    ['right', 'left'].forEach((side) => {
      calfVesselKeys.forEach((key) => {
        const id = `${side}_${key}`;
        if (vf[id]) {
          vf[id] = {
            ...vf[id],
            status: 'not_visualised',
            comments: 'Inadequately visualised due to severe subcutaneous oedema and bandage artifact.'
          };
        }
      });
    });

    return vf;
  })()
};

export const DEMO_CASES = [
  { id: 'demo1', title: '1. Normal Bilateral DVT Exam', data: DEMO_CASE_1_NORMAL },
  { id: 'demo2', title: '2. Acute Occlusive Popliteal DVT (L)', data: DEMO_CASE_2_ACUTE_POPLITEAL },
  { id: 'demo3', title: '3. Follow-up Recanalised DVT (L)', data: DEMO_CASE_3_FOLLOWUP_RECANALISED },
  { id: 'demo4', title: '4. New Muscular Calf DVT (L)', data: DEMO_CASE_4_NEW_MUSCULAR_DVT },
  { id: 'demo5', title: '5. GSV Superficial Thrombosis (18mm to SFJ)', data: DEMO_CASE_5_SUPERFICIAL_GSV },
  { id: 'demo6', title: '6. Technically Limited Exam (Calf Unvisualised)', data: DEMO_CASE_6_LIMITED }
];
