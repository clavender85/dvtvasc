// Grouped Vessel Tree List Component for Iliocaval & Pelvic Venous System
import React from 'react';
import { VesselFinding, VesselStatus, NON_VISUALIZATION_REASON_LABELS } from '../types/dvt';
import { CheckCircle, AlertTriangle, HelpCircle, Edit3, EyeOff, Activity } from 'lucide-react';
import { RegionStatusHeader } from './RegionStatusHeader';

interface PelvicVesselTreeListProps {
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselId: string | null;
  selectedVesselIds?: string[];
  onSelectVessel: (vesselId: string) => void;
  onToggleSelectVessel?: (vesselId: string) => void;
  onUpdateStatus: (vesselId: string, status: VesselStatus) => void;
  onBatchUpdateFindings?: (updatedFindings: Record<string, VesselFinding>) => void;
  onOpenDetailModal?: (vesselId: string) => void;
  onContextMenu?: (vesselId: string, e: React.MouseEvent) => void;
}

interface PelvicGroup {
  groupKey: string;
  title: string;
  vessels: {
    vesselId: string;
    label: string;
    shortLabel: string;
  }[];
}

const PELVIC_GROUPS: PelvicGroup[] = [
  {
    groupKey: 'central',
    title: 'CENTRAL PELVIC VEINS',
    vessels: [
      { vesselId: 'pelvis_IVC', label: 'Inferior Vena Cava (IVC)', shortLabel: 'IVC' }
    ]
  },
  {
    groupKey: 'right_iliac',
    title: 'RIGHT ILIAC SYSTEM',
    vessels: [
      { vesselId: 'right_CIV', label: 'Right Common Iliac Vein (CIV)', shortLabel: 'Right CIV' },
      { vesselId: 'right_EIV', label: 'Right External Iliac Vein (EIV)', shortLabel: 'Right EIV' },
      { vesselId: 'right_IIV', label: 'Right Internal Iliac Vein (IIV)', shortLabel: 'Right IIV' }
    ]
  },
  {
    groupKey: 'left_iliac',
    title: 'LEFT ILIAC SYSTEM',
    vessels: [
      { vesselId: 'left_CIV', label: 'Left Common Iliac Vein (CIV)', shortLabel: 'Left CIV' },
      { vesselId: 'left_EIV', label: 'Left External Iliac Vein (EIV)', shortLabel: 'Left EIV' },
      { vesselId: 'left_IIV', label: 'Left Internal Iliac Vein (IIV)', shortLabel: 'Left IIV' }
    ]
  }
];

export const PelvicVesselTreeList: React.FC<PelvicVesselTreeListProps> = ({
  vesselFindings,
  selectedVesselId,
  selectedVesselIds = [],
  onSelectVessel,
  onToggleSelectVessel,
  onUpdateStatus,
  onBatchUpdateFindings,
  onOpenDetailModal,
  onContextMenu
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Interactive Region Status Header */}
      <RegionStatusHeader
        region="iliocaval"
        title="ILIOCAVAL / PELVIC VEINS"
        themeColor="text-amber-300"
        vesselFindings={vesselFindings}
        onBatchUpdateFindings={(updated) => {
          if (onBatchUpdateFindings) {
            onBatchUpdateFindings(updated);
          }
        }}
      />

      {/* Category Groups Container */}
      <div className="p-2 space-y-3 overflow-y-auto flex-1 max-h-[700px] text-xs">
        {PELVIC_GROUPS.map((group) => (
          <div key={group.groupKey} className="bg-slate-950/70 border border-slate-800/80 rounded-lg overflow-hidden">
            {/* Category Subheader */}
            <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
              <span className="font-semibold text-[11px] text-slate-300 uppercase tracking-wide">
                {group.title}
              </span>
            </div>

            {/* Vessels List */}
            <div className="divide-y divide-slate-800/60">
              {group.vessels.map((vDef) => {
                const vesselId = vDef.vesselId;
                const finding = vesselFindings[vesselId];
                const isSelected = selectedVesselId === vesselId || selectedVesselIds.includes(vesselId);

                if (!finding) return null;

                return (
                  <div
                    key={vesselId}
                    className={`p-2 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-4 border-amber-500'
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
                    {/* Vessel Info & Quick Status Icon */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 select-none">
                      {finding.status === 'normal' && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                      {finding.status === 'abnormal' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-pulse" />
                      )}
                      {finding.status === 'not_visualised' && (
                        <EyeOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      )}
                      {finding.status === 'not_assessed' && (
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      )}

                      <div className="truncate">
                        <span
                          className={`font-semibold text-xs ${
                            isSelected ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {vDef.shortLabel}
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
                        className="p-1 text-slate-400 hover:text-amber-300"
                        title="Edit Detailed Vessel Card"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
