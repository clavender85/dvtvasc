// Grouped Vessel Tree List Component for Lower Limb DVT Worksheet

import React from 'react';
import {
  VesselFinding,
  VesselCategory,
  Side,
  VesselStatus,
  NON_VISUALIZATION_REASON_LABELS,
  DopplerAssessment,
  ContralateralCFVAssessment,
  PhasicityOption,
  AugmentationOption
} from '../types/dvt';
import { ANATOMICAL_VESSELS } from '../data/anatomyData';
import { CheckCircle, AlertTriangle, HelpCircle, Edit3, ChevronRight, EyeOff } from 'lucide-react';
import { RegionStatusHeader } from './RegionStatusHeader';

interface VesselTreeListProps {
  side: Side;
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselId: string | null;
  selectedVesselIds?: string[];
  includePelvic?: boolean;
  doppler?: DopplerAssessment;
  contralateralCFVAssessment?: ContralateralCFVAssessment;
  isUnilateralStudy?: boolean;
  onSelectVessel: (vesselId: string) => void;
  onToggleSelectVessel?: (vesselId: string) => void;
  onUpdateStatus: (vesselId: string, status: VesselStatus) => void;
  onBatchUpdateFindings?: (updatedFindings: Record<string, VesselFinding>) => void;
  onOpenDetailModal?: (vesselId: string) => void;
  onContextMenu?: (vesselId: string, e: React.MouseEvent) => void;
  onChangeDoppler?: (updatedDoppler: DopplerAssessment) => void;
  onChangeContralateralCFV?: (cCFV: ContralateralCFVAssessment) => void;
  onUpdateVesselDoppler?: (
    vesselId: string,
    dopplerData: { phasicity?: PhasicityOption; augmentation?: AugmentationOption }
  ) => void;
}

const CATEGORY_LABELS: Record<VesselCategory, string> = {
  pelvis: 'Pelvic & Iliac Veins (IVC, CIV, EIV, IIV)',
  thigh: 'Thigh Deep Veins',
  popliteal: 'Popliteal Fossa',
  calf_deep: 'Deep Calf Veins (Paired)',
  muscular_calf: 'Muscular Calf Veins',
  superficial: 'Superficial Venous System'
};

export const VesselTreeList: React.FC<VesselTreeListProps> = ({
  side,
  vesselFindings,
  selectedVesselId,
  selectedVesselIds = [],
  includePelvic = false,
  doppler,
  contralateralCFVAssessment,
  isUnilateralStudy = false,
  onSelectVessel,
  onToggleSelectVessel,
  onUpdateStatus,
  onBatchUpdateFindings,
  onOpenDetailModal,
  onContextMenu,
  onChangeDoppler,
  onChangeContralateralCFV,
  onUpdateVesselDoppler
}) => {
  const [showPelvicLocal, setShowPelvicLocal] = React.useState<boolean>(includePelvic);

  React.useEffect(() => {
    if (includePelvic) {
      setShowPelvicLocal(true);
    }
  }, [includePelvic]);

  const regionType = side === 'right' ? 'right_lower_limb' : 'left_lower_limb';
  const sideTitle = side === 'right' ? 'RIGHT LOWER LIMB' : 'LEFT LOWER LIMB';
  const themeColor = side === 'right' ? 'text-teal-400' : 'text-sky-400';

  const activeCategoryOrder: VesselCategory[] = showPelvicLocal
    ? ['pelvis', 'thigh', 'popliteal', 'calf_deep', 'muscular_calf', 'superficial']
    : ['thigh', 'popliteal', 'calf_deep', 'muscular_calf', 'superficial'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Interactive Region Status Header */}
      <RegionStatusHeader
        region={regionType}
        title={sideTitle}
        themeColor={themeColor}
        vesselFindings={vesselFindings}
        onBatchUpdateFindings={(updated) => {
          if (onBatchUpdateFindings) {
            onBatchUpdateFindings(updated);
          }
        }}
        extraHeaderActions={
          <button
            type="button"
            onClick={() => setShowPelvicLocal(!showPelvicLocal)}
            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border transition-colors ${
              showPelvicLocal
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Pelvic / Iliac Veins & IVC"
          >
            {showPelvicLocal ? 'Pelvic: ON' : '+ Iliac/IVC'}
          </button>
        }
      />

      {/* Category Groups Container */}
      <div className="p-2 space-y-3 overflow-y-auto flex-1 max-h-[700px] text-xs">
        {activeCategoryOrder.map((category) => {
          const vesselsInCategory = ANATOMICAL_VESSELS.filter((v) => v.category === category);

          return (
            <div key={category} className="bg-slate-950/70 border border-slate-800/80 rounded-lg overflow-hidden">
              {/* Category Subheader */}
              <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
                <span className="font-semibold text-[11px] text-slate-300 uppercase tracking-wide">
                  {CATEGORY_LABELS[category]}
                </span>
              </div>

              {/* Vessels List */}
              <div className="divide-y divide-slate-800/60">
                {vesselsInCategory.map((vDef) => {
                  const vesselId =
                    vDef.category === 'pelvis' && vDef.vesselKey === 'IVC'
                      ? 'pelvis_IVC'
                      : `${side}_${vDef.vesselKey}`;
                  const finding = vesselFindings[vesselId];
                  const isSelected = selectedVesselId === vesselId || (selectedVesselIds && selectedVesselIds.includes(vesselId));

                  if (!finding) return null;

                  const displayName =
                    vDef.category === 'pelvis'
                      ? vDef.vesselKey === 'IVC'
                        ? 'Inferior Vena Cava (IVC)'
                        : `${side === 'right' ? 'Right' : 'Left'} ${vDef.shortName}`
                      : vDef.shortName;

                  return (
                    <div
                      key={vesselId}
                      className={`p-2 transition-colors flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-l-4 border-teal-500'
                          : finding.status === 'abnormal'
                          ? 'bg-rose-950/30'
                          : 'hover:bg-slate-900/80'
                      }`}
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
                        if (selectedVesselIds && selectedVesselIds.length > 1 && selectedVesselIds.includes(vesselId)) {
                          if (onOpenDetailModal) {
                            onOpenDetailModal(vesselId);
                          }
                        } else {
                          if (onToggleSelectVessel && !isSelected) {
                            onToggleSelectVessel(vesselId);
                          } else {
                            onSelectVessel(vesselId);
                          }
                          if (onOpenDetailModal) {
                            onOpenDetailModal(vesselId);
                          }
                        }
                      }}
                      onContextMenu={(e) => {
                        if (onContextMenu) {
                          onContextMenu(vesselId, e);
                        }
                      }}
                    >
                      {/* Top Row: Vessel Name, Status & Action Pills */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        {/* Vessel Info & Quick Status Icon */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 select-none">
                          {finding.status === 'normal' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                          {finding.status === 'abnormal' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-pulse" />}
                          {finding.status === 'not_visualised' && <EyeOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                          {finding.status === 'not_assessed' && <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}

                          <div className="truncate">
                            <span className={`font-semibold text-xs ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                              {displayName}
                            </span>
                            {finding.status === 'abnormal' && (
                              <div className="text-[10px] text-rose-300 truncate">
                                {finding.patency?.replace(/_/g, ' ')} • {finding.chronicity?.replace(/_/g, ' ')}
                              </div>
                            )}
                            {finding.status === 'not_visualised' && (
                              <div className="text-[10px] text-amber-300/90 truncate font-medium">
                                NV: {NON_VISUALIZATION_REASON_LABELS[finding.nonVisualizationReason || 'body_habitus']}
                              </div>
                            )}
                            {finding.status === 'not_assessed' && (
                              <div className="text-[10px] text-slate-500 italic truncate">
                                Not Examined
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Toggle Pills */}
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
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              finding.status === 'normal'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Mark Normal"
                          >
                            Nml
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
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              finding.status === 'abnormal'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Mark Abnormal"
                          >
                            Abn
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
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              finding.status === 'not_visualised'
                                ? 'bg-amber-800 text-amber-100 ring-1 ring-amber-500'
                                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
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
                            className="p-1 text-slate-400 hover:text-teal-300"
                            title="Edit Detailed Vessel Card"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Integrated Doppler Controls for CFV */}
                      {vDef.vesselKey === 'CFV' && (() => {
                        const cfvPhasicity =
                          finding.doppler?.phasicity ||
                          (side === 'right' ? doppler?.rightCFVPhasicity : doppler?.leftCFVPhasicity) ||
                          'phasic';

                        return (
                          <div
                            className="mt-1 pt-1 border-t border-slate-800/60 flex flex-col gap-1 text-[11px] text-slate-300 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-400 font-medium text-[10px]">Phasicity:</span>
                              <select
                                value={cfvPhasicity}
                                onChange={(e) => {
                                  const val = e.target.value as PhasicityOption;
                                  if (onUpdateVesselDoppler) onUpdateVesselDoppler(vesselId, { phasicity: val });
                                  if (doppler && onChangeDoppler) {
                                    onChangeDoppler({
                                      ...doppler,
                                      [side === 'right' ? 'rightCFVPhasicity' : 'leftCFVPhasicity']: val
                                    });
                                  }
                                }}
                                className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-teal-300 text-[10px] font-medium focus:outline-none hover:border-teal-500/50"
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

                            {isUnilateralStudy && (
                              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mt-0.5 pt-0.5 border-t border-slate-800/40">
                                <span className="truncate">Contralateral {side === 'left' ? 'Right' : 'Left'} CFV:</span>
                                <select
                                  value={contralateralCFVAssessment?.phasicity || 'phasic_preserved'}
                                  onChange={(e) => {
                                    if (onChangeContralateralCFV) {
                                      onChangeContralateralCFV({
                                        side: side === 'left' ? 'right' : 'left',
                                        phasicity: e.target.value as any
                                      });
                                    }
                                  }}
                                  className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-sky-300 text-[10px] font-medium focus:outline-none"
                                >
                                  <option value="phasic_preserved">Phasic / normal</option>
                                  <option value="reduced_phasicity">Reduced phasicity</option>
                                  <option value="continuous_non_phasic">Continuous / non-phasic</option>
                                  <option value="pulsatile">Pulsatile</option>
                                  <option value="not_assessed">Not assessed</option>
                                  <option value="not_visualised">Not visualised</option>
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Integrated Doppler Controls for Popliteal */}
                      {vDef.vesselKey === 'POPV' && (() => {
                        const popFlow =
                          finding.doppler?.phasicity ||
                          (side === 'right' ? doppler?.rightPopPhasicity : doppler?.leftPopPhasicity) ||
                          'phasic';

                        const popAug =
                          finding.doppler?.augmentation ||
                          (side === 'right' ? doppler?.rightAugmentation : doppler?.leftAugmentation) ||
                          'not_assessed';

                        return (
                          <div
                            className="mt-1 pt-1 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-300 w-full"
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
                                      [side === 'right' ? 'rightPopPhasicity' : 'leftPopPhasicity']: val
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
                                      [side === 'right' ? 'rightAugmentation' : 'leftAugmentation']: val
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
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
