// Ultrasound DVT Examination Vessel Matrix View Component

import React from 'react';
import {
  VesselFinding,
  VesselStatus,
  Side,
  NON_VISUALIZATION_REASON_LABELS,
  DopplerAssessment,
  ContralateralCFVAssessment,
  PhasicityOption,
  AugmentationOption
} from '../types/dvt';
import { CheckCircle2, AlertTriangle, HelpCircle, Edit3, Zap, ShieldCheck, EyeOff } from 'lucide-react';

interface VesselMatrixViewProps {
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselId: string | null;
  selectedVesselIds?: string[];
  doppler?: DopplerAssessment;
  contralateralCFVAssessment?: ContralateralCFVAssessment;
  isUnilateralStudy?: boolean;
  onSelectVessel: (vesselId: string) => void;
  onToggleSelectVessel?: (vesselId: string) => void;
  onUpdateStatus: (vesselId: string, status: VesselStatus) => void;
  onMarkRoutineRightNormal: () => void;
  onMarkRoutineLeftNormal: () => void;
  onMarkRoutineBilateralNormal: () => void;
  onOpenDetailModal?: (vesselId: string) => void;
  onContextMenu?: (vesselId: string, e: React.MouseEvent) => void;
  onChangeDoppler?: (updatedDoppler: DopplerAssessment) => void;
  onChangeContralateralCFV?: (cCFV: ContralateralCFVAssessment) => void;
  onUpdateVesselDoppler?: (
    vesselId: string,
    dopplerData: { phasicity?: PhasicityOption; augmentation?: AugmentationOption }
  ) => void;
}

export interface MatrixRowConfig {
  rowId: string;
  label: string;
  shortLabel: string;
  category: 'pelvis' | 'thigh' | 'popliteal' | 'calf_deep' | 'muscular' | 'superficial';
  vesselKeyRight: string;
  vesselKeyLeft: string;
  isRoutine: boolean;
  isCentral?: boolean;
  centralKey?: string;
  note?: string;
}

export const MATRIX_ROWS: MatrixRowConfig[] = [
  // PELVIS / CENTRAL (Optional)
  {
    rowId: 'ivc',
    label: 'Inferior Vena Cava (IVC)',
    shortLabel: 'IVC',
    category: 'pelvis',
    vesselKeyRight: 'pelvis_IVC',
    vesselKeyLeft: 'pelvis_IVC',
    isCentral: true,
    centralKey: 'pelvis_IVC',
    isRoutine: false,
    note: 'Central pelvic vein (Optional)'
  },
  {
    rowId: 'civ',
    label: 'Common Iliac Vein',
    shortLabel: 'Common iliac',
    category: 'pelvis',
    vesselKeyRight: 'right_CIV',
    vesselKeyLeft: 'left_CIV',
    isRoutine: false,
    note: 'Pelvic vein (Optional)'
  },
  {
    rowId: 'eiv',
    label: 'External Iliac Vein',
    shortLabel: 'External iliac',
    category: 'pelvis',
    vesselKeyRight: 'right_EIV',
    vesselKeyLeft: 'left_EIV',
    isRoutine: false,
    note: 'Pelvic vein (Optional)'
  },
  {
    rowId: 'iiv',
    label: 'Internal Iliac Vein',
    shortLabel: 'Internal iliac',
    category: 'pelvis',
    vesselKeyRight: 'right_IIV',
    vesselKeyLeft: 'left_IIV',
    isRoutine: false,
    note: 'Pelvic vein (Optional)'
  },

  // THIGH (Routine Deep)
  {
    rowId: 'cfv',
    label: 'Common Femoral Vein (CFV)',
    shortLabel: 'CFV',
    category: 'thigh',
    vesselKeyRight: 'right_CFV',
    vesselKeyLeft: 'left_CFV',
    isRoutine: true
  },
  {
    rowId: 'pfv',
    label: 'Profunda Femoris Vein (PFV)',
    shortLabel: 'PFV',
    category: 'thigh',
    vesselKeyRight: 'right_PFV',
    vesselKeyLeft: 'left_PFV',
    isRoutine: true
  },
  {
    rowId: 'fv_prox',
    label: 'Femoral Vein — Proximal',
    shortLabel: 'Proximal FV',
    category: 'thigh',
    vesselKeyRight: 'right_FV_PROX',
    vesselKeyLeft: 'left_FV_PROX',
    isRoutine: true
  },
  {
    rowId: 'fv_mid',
    label: 'Femoral Vein — Mid',
    shortLabel: 'Mid FV',
    category: 'thigh',
    vesselKeyRight: 'right_FV_MID',
    vesselKeyLeft: 'left_FV_MID',
    isRoutine: true
  },
  {
    rowId: 'fv_dist',
    label: 'Femoral Vein — Distal (Adductor Canal)',
    shortLabel: 'Distal FV',
    category: 'thigh',
    vesselKeyRight: 'right_FV_DIST',
    vesselKeyLeft: 'left_FV_DIST',
    isRoutine: true
  },

  // POPLITEAL (Routine Deep)
  {
    rowId: 'popliteal',
    label: 'Popliteal Vein',
    shortLabel: 'Popliteal',
    category: 'popliteal',
    vesselKeyRight: 'right_POPV',
    vesselKeyLeft: 'left_POPV',
    isRoutine: true
  },

  // CALF DEEP
  {
    rowId: 'tptv',
    label: 'Tibioperoneal Trunk (TPTV)',
    shortLabel: 'TPTV',
    category: 'calf_deep',
    vesselKeyRight: 'right_TPTV',
    vesselKeyLeft: 'left_TPTV',
    isRoutine: true
  },
  {
    rowId: 'ptv',
    label: 'Posterior Tibial Veins (PTV)',
    shortLabel: 'Posterior tibial',
    category: 'calf_deep',
    vesselKeyRight: 'right_PTV',
    vesselKeyLeft: 'left_PTV',
    isRoutine: true
  },
  {
    rowId: 'perv',
    label: 'Peroneal Veins (PerV)',
    shortLabel: 'Peroneal',
    category: 'calf_deep',
    vesselKeyRight: 'right_PERV',
    vesselKeyLeft: 'left_PERV',
    isRoutine: true
  },
  {
    rowId: 'atv',
    label: 'Anterior Tibial Veins (ATV)',
    shortLabel: 'Anterior tibial',
    category: 'calf_deep',
    vesselKeyRight: 'right_ATV',
    vesselKeyLeft: 'left_ATV',
    isRoutine: false,
    note: 'Non-routine deep calf (Optional)'
  },

  // MUSCULAR CALF
  {
    rowId: 'gastroc',
    label: 'Gastrocnemius Veins (Medial / Lateral)',
    shortLabel: 'Gastrocnemius',
    category: 'muscular',
    vesselKeyRight: 'right_MGV',
    vesselKeyLeft: 'left_MGV',
    isRoutine: true
  },
  {
    rowId: 'soleal',
    label: 'Soleal Veins',
    shortLabel: 'Soleal',
    category: 'muscular',
    vesselKeyRight: 'right_SV',
    vesselKeyLeft: 'left_SV',
    isRoutine: true
  },

  // SUPERFICIAL (Optional)
  {
    rowId: 'gsv',
    label: 'Great Saphenous Vein (GSV / SFJ)',
    shortLabel: 'GSV',
    category: 'superficial',
    vesselKeyRight: 'right_GSV_PROX',
    vesselKeyLeft: 'left_GSV_PROX',
    isRoutine: false,
    note: 'Superficial vein (Optional)'
  },
  {
    rowId: 'ssv',
    label: 'Small Saphenous Vein (SSV / SPJ)',
    shortLabel: 'SSV',
    category: 'superficial',
    vesselKeyRight: 'right_SSV',
    vesselKeyLeft: 'left_SSV',
    isRoutine: false,
    note: 'Superficial vein (Optional)'
  }
];

export const VesselMatrixView: React.FC<VesselMatrixViewProps> = ({
  vesselFindings,
  selectedVesselId,
  selectedVesselIds = [],
  doppler,
  contralateralCFVAssessment,
  isUnilateralStudy = false,
  onSelectVessel,
  onToggleSelectVessel,
  onUpdateStatus,
  onMarkRoutineRightNormal,
  onMarkRoutineLeftNormal,
  onMarkRoutineBilateralNormal,
  onOpenDetailModal,
  onContextMenu,
  onChangeDoppler,
  onChangeContralateralCFV,
  onUpdateVesselDoppler
}) => {

  const getCategoryBadge = (category: MatrixRowConfig['category']) => {
    switch (category) {
      case 'pelvis':
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">Pelvic</span>;
      case 'thigh':
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">Thigh Deep</span>;
      case 'popliteal':
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">Popliteal</span>;
      case 'calf_deep':
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-bold uppercase">Calf Deep</span>;
      case 'muscular':
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">Calf Muscular</span>;
      case 'superficial':
        return <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold uppercase">Superficial</span>;
      default:
        return null;
    }
  };

  const renderVesselCell = (vesselId: string, sideLabel: string) => {
    const finding = vesselFindings[vesselId];
    if (!finding) {
      return (
        <td className="p-2 border-b border-slate-800 bg-slate-950/40 text-slate-600 text-[11px] italic text-center">
          Not configured
        </td>
      );
    }

    const isSelected = selectedVesselId === vesselId || (selectedVesselIds && selectedVesselIds.includes(vesselId));
    const status = finding.status;

    return (
      <td
        className={`p-2 border-b border-slate-800 transition-colors cursor-pointer ${
          status === 'abnormal'
            ? 'bg-rose-950/40'
            : status === 'normal'
            ? 'bg-slate-900/40'
            : 'bg-slate-950/50'
        } ${isSelected ? 'ring-2 ring-teal-500 inset-0 z-10 relative' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleSelectVessel) {
            onToggleSelectVessel(vesselId);
          } else {
            onSelectVessel(vesselId);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onToggleSelectVessel && !isSelected) {
            onToggleSelectVessel(vesselId);
          } else {
            onSelectVessel(vesselId);
          }
          if (onOpenDetailModal) {
            onOpenDetailModal(vesselId);
          }
        }}
        onContextMenu={(e) => {
          if (onContextMenu) {
            onContextMenu(vesselId, e);
          }
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5 select-none">
          {/* Status Indicator Pill */}
          <div className="flex items-center gap-1.5 min-w-0">
            {status === 'normal' && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Normal</span>
              </span>
            )}
            {status === 'abnormal' && (
              <span className="flex items-center gap-1 text-rose-400 font-bold text-xs animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Abnormal</span>
              </span>
            )}
            {status === 'not_visualised' && (
              <span className="flex items-center gap-1 text-amber-400 font-medium text-xs">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Not Visualised</span>
              </span>
            )}
            {status === 'not_assessed' && (
              <span className="text-slate-500 font-medium text-xs italic">Not Examined</span>
            )}

            {/* Quick Thrombus Tag if Abnormal */}
            {status === 'abnormal' && (
              <span className="text-[10px] text-rose-300 font-mono truncate max-w-[120px] hidden lg:inline">
                ({finding.patency?.replace(/_/g, ' ') || 'thrombus'})
              </span>
            )}
            {status === 'not_visualised' && (
              <span className="text-[10px] text-amber-300/90 truncate max-w-[150px] hidden lg:inline font-medium">
                ({NON_VISUALIZATION_REASON_LABELS[finding.nonVisualizationReason || 'body_habitus']})
              </span>
            )}
          </div>

          {/* Quick Action Toggle Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(vesselId, 'normal');
                if (onToggleSelectVessel && !isSelected) {
                  onToggleSelectVessel(vesselId);
                } else {
                  onSelectVessel(vesselId);
                }
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                status === 'normal'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 border border-slate-700'
              }`}
              title="Click to mark vessel Normal"
            >
              Normal
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateStatus(vesselId, 'abnormal');
                if (onToggleSelectVessel && !isSelected) {
                  onToggleSelectVessel(vesselId);
                } else {
                  onSelectVessel(vesselId);
                }
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                status === 'abnormal'
                  ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                  : 'bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700'
              }`}
              title="Click to mark Abnormal"
            >
              Abnormal
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateStatus(vesselId, 'not_visualised');
                if (onToggleSelectVessel && !isSelected) {
                  onToggleSelectVessel(vesselId);
                } else {
                  onSelectVessel(vesselId);
                }
              }}
              className={`px-1.5 py-1 rounded text-[10px] font-semibold transition-all ${
                status === 'not_visualised'
                  ? 'bg-amber-800 text-amber-100 border border-amber-600'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
              }`}
              title="Not Visualised"
            >
              N/V
            </button>

            <button
              type="button"
              onClick={() => {
                if (onToggleSelectVessel && !isSelected) {
                  onToggleSelectVessel(vesselId);
                } else {
                  onSelectVessel(vesselId);
                }
                if (onOpenDetailModal) {
                  onOpenDetailModal(vesselId);
                }
              }}
              className={`p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors ${
                status === 'abnormal' ? 'text-rose-300' : ''
              }`}
              title="Edit detailed landmarks, extent & notes"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Integrated Doppler Controls for Matrix Cells */}
        {vesselId.endsWith('_CFV') && (() => {
          const isRight = vesselId.startsWith('right_');
          const cfvPhasicity =
            finding.doppler?.phasicity ||
            (isRight ? doppler?.rightCFVPhasicity : doppler?.leftCFVPhasicity) ||
            'phasic';

          return (
            <div
              className="mt-1.5 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-300 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-slate-400 font-medium">Phasicity:</span>
              <select
                value={cfvPhasicity}
                onChange={(e) => {
                  const val = e.target.value as PhasicityOption;
                  if (onUpdateVesselDoppler) onUpdateVesselDoppler(vesselId, { phasicity: val });
                  if (doppler && onChangeDoppler) {
                    onChangeDoppler({
                      ...doppler,
                      [isRight ? 'rightCFVPhasicity' : 'leftCFVPhasicity']: val
                    });
                  }
                }}
                className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-teal-300 font-medium focus:outline-none"
              >
                <option value="phasic">Phasic / normal</option>
                <option value="reduced_phasicity">Reduced phasicity</option>
                <option value="continuous_non_phasic">Continuous / non-phasic</option>
                <option value="pulsatile">Pulsatile</option>
                <option value="absent_flow">Absent flow</option>
                <option value="not_assessed">Not assessed</option>
                <option value="not_visualised">Not visualised</option>
              </select>
            </div>
          );
        })()}

        {vesselId.endsWith('_POPV') && (() => {
          const isRight = vesselId.startsWith('right_');
          const popFlow =
            finding.doppler?.phasicity ||
            (isRight ? doppler?.rightPopPhasicity : doppler?.leftPopPhasicity) ||
            'phasic';

          const popAug =
            finding.doppler?.augmentation ||
            (isRight ? doppler?.rightAugmentation : doppler?.leftAugmentation) ||
            'not_assessed';

          return (
            <div
              className="mt-1.5 pt-1 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-300 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Flow:</span>
                <select
                  value={popFlow}
                  onChange={(e) => {
                    const val = e.target.value as PhasicityOption;
                    if (onUpdateVesselDoppler) onUpdateVesselDoppler(vesselId, { phasicity: val, augmentation: popAug });
                    if (doppler && onChangeDoppler) {
                      onChangeDoppler({
                        ...doppler,
                        [isRight ? 'rightPopPhasicity' : 'leftPopPhasicity']: val
                      });
                    }
                  }}
                  className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-teal-300 font-medium focus:outline-none"
                >
                  <option value="phasic">Phasic / normal</option>
                  <option value="reduced_phasicity">Reduced phasicity</option>
                  <option value="continuous_non_phasic">Continuous / non-phasic</option>
                  <option value="pulsatile">Pulsatile</option>
                  <option value="absent_flow">Absent flow</option>
                  <option value="not_assessed">Not assessed</option>
                  <option value="not_visualised">Not visualised</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Aug:</span>
                <select
                  value={popAug}
                  onChange={(e) => {
                    const val = e.target.value as AugmentationOption;
                    if (onUpdateVesselDoppler) onUpdateVesselDoppler(vesselId, { phasicity: popFlow, augmentation: val });
                    if (doppler && onChangeDoppler) {
                      onChangeDoppler({
                        ...doppler,
                        [isRight ? 'rightAugmentation' : 'leftAugmentation']: val
                      });
                    }
                  }}
                  className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-teal-300 font-medium focus:outline-none"
                >
                  <option value="normal_augmentation">Normal augmentation</option>
                  <option value="reduced_augmentation">Reduced augmentation</option>
                  <option value="absent_augmentation">Absent augmentation</option>
                  <option value="performed_prior_to_dvt">Performed before DVT identified</option>
                  <option value="not_performed_positive_dvt">Not performed due to positive DVT</option>
                  <option value="not_performed">Not performed</option>
                  <option value="not_assessed">Not assessed</option>
                </select>
              </div>
            </div>
          );
        })()}
      </td>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100 space-y-3">
      {/* Smart Quick Action Presets Bar */}
      <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-2">
              RAPID SONOGRAPHER PRESETS
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-normal normal-case">
                Normal by Default Paradigm
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              One-click baseline documentation for routine deep veins. Optional pelvic, ATV, & superficial veins remain unflagged unless assessed.
            </p>
          </div>
        </div>

        {/* 1-Click Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onMarkRoutineRightNormal}
            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Mark all routine right deep veins normal (leaves IVC, IIV, ATV, GSV, SSV unchanged)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            All Routine Right Deep Veins Normal
          </button>

          <button
            type="button"
            onClick={onMarkRoutineLeftNormal}
            className="bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-700/80 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Mark all routine left deep veins normal (leaves IVC, IIV, ATV, GSV, SSV unchanged)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            All Routine Left Deep Veins Normal
          </button>

          <button
            type="button"
            onClick={onMarkRoutineBilateralNormal}
            className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Mark all routine deep veins on both legs normal (leaves IVC, IIV, ATV, GSV, SSV unchanged)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            All Assessed Bilateral Deep Veins Normal
          </button>
        </div>
      </div>

      {/* Main Vessel Matrix Table */}
      <div className="overflow-x-auto p-1">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <th className="p-3 font-bold w-1/3">Anatomical Vessel Segment</th>
              <th className="p-3 font-bold text-teal-300 w-1/3 bg-teal-950/30 border-l border-slate-800">
                RIGHT LIMB FINDINGS
              </th>
              <th className="p-3 font-bold text-sky-300 w-1/3 bg-sky-950/30 border-l border-slate-800">
                LEFT LIMB FINDINGS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {MATRIX_ROWS.map((row) => {
              if (row.isCentral && row.centralKey) {
                // Central vessel like IVC spanning both columns
                const finding = vesselFindings[row.centralKey];
                const status = finding?.status || 'not_assessed';
                const isSelected = selectedVesselId === row.centralKey;

                return (
                  <tr key={row.rowId} className="bg-slate-950/80 hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{row.shortLabel}</span>
                        {getCategoryBadge(row.category)}
                      </div>
                      {row.note && <div className="text-[10px] text-slate-400 italic mt-0.5">{row.note}</div>}
                    </td>

                    <td
                      colSpan={2}
                      className={`p-2 border-l border-slate-800 ${
                        status === 'abnormal' ? 'bg-rose-950/40' : 'bg-slate-950/60'
                      } ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            MIDLINE / CENTRAL IVC:
                          </span>
                          {status === 'normal' && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                            </span>
                          )}
                          {status === 'abnormal' && (
                            <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" /> Abnormal Thrombus Present
                            </span>
                          )}
                          {status === 'not_visualised' && (
                            <span className="text-amber-400 font-medium flex items-center gap-1">
                              <EyeOff className="w-3.5 h-3.5" />
                              Not Visualised ({NON_VISUALIZATION_REASON_LABELS[finding?.nonVisualizationReason || 'body_habitus']})
                            </span>
                          )}
                          {status === 'not_assessed' && <span className="text-slate-500 italic">Not Examined</span>}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(row.centralKey!, 'normal')}
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              status === 'normal' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateStatus(row.centralKey!, 'abnormal');
                              onSelectVessel(row.centralKey!);
                              if (onOpenDetailModal) {
                                onOpenDetailModal(row.centralKey!);
                              }
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              status === 'abnormal' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Abnormal
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(row.centralKey!, 'not_visualised')}
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              status === 'not_visualised' ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            N/V
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectVessel(row.centralKey!)}
                            className="p-1 text-slate-400 hover:text-teal-300"
                            title="Edit IVC details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={row.rowId} className="hover:bg-slate-900/60 transition-colors">
                  {/* Vessel Row Label */}
                  <td className="p-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs">{row.shortLabel}</span>
                      {getCategoryBadge(row.category)}
                      {row.isRoutine ? (
                        <span className="text-[9px] text-teal-400/90 bg-teal-950/60 px-1 rounded font-medium">Routine</span>
                      ) : (
                        <span className="text-[9px] text-slate-500 bg-slate-950 px-1 rounded">Optional</span>
                      )}
                    </div>
                    {row.note && <div className="text-[10px] text-slate-400 italic mt-0.5">{row.note}</div>}
                  </td>

                  {/* Right Column Cell */}
                  {renderVesselCell(row.vesselKeyRight, 'Right')}

                  {/* Left Column Cell */}
                  {renderVesselCell(row.vesselKeyLeft, 'Left')}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
