// Grouped Vessel Tree List Component for Lower Limb DVT Worksheet

import React from 'react';
import { VesselFinding, VesselCategory, Side, VesselStatus } from '../types/dvt';
import { ANATOMICAL_VESSELS } from '../data/anatomyData';
import { CheckCircle, AlertTriangle, HelpCircle, Edit3, ChevronRight } from 'lucide-react';

interface VesselTreeListProps {
  side: Side;
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselId: string | null;
  onSelectVessel: (vesselId: string) => void;
  onUpdateStatus: (vesselId: string, status: VesselStatus) => void;
  onOpenDetailModal?: (vesselId: string) => void;
}

const CATEGORY_LABELS: Record<VesselCategory, string> = {
  pelvis: 'Pelvic / Proximal Veins',
  thigh: 'Thigh Deep Veins',
  popliteal: 'Popliteal Fossa',
  calf_deep: 'Deep Calf Veins (Paired)',
  muscular_calf: 'Muscular Calf Veins',
  superficial: 'Superficial Venous System'
};

const CATEGORY_ORDER: VesselCategory[] = ['thigh', 'popliteal', 'calf_deep', 'muscular_calf', 'superficial'];

export const VesselTreeList: React.FC<VesselTreeListProps> = ({
  side,
  vesselFindings,
  selectedVesselId,
  onSelectVessel,
  onUpdateStatus,
  onOpenDetailModal
}) => {
  const sideTitle = side === 'right' ? 'RIGHT LOWER LIMB' : 'LEFT LOWER LIMB';
  const themeColor = side === 'right' ? 'text-teal-400' : 'text-sky-400';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Limb Header */}
      <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-xs uppercase tracking-wider ${themeColor}`}>{sideTitle}</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Vessel Findings</span>
      </div>

      {/* Category Groups Container */}
      <div className="p-2 space-y-3 overflow-y-auto flex-1 max-h-[700px] text-xs">
        {CATEGORY_ORDER.map((category) => {
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
                  const vesselId = `${side}_${vDef.vesselKey}`;
                  const finding = vesselFindings[vesselId];
                  const isSelected = selectedVesselId === vesselId;

                  if (!finding) return null;

                  return (
                    <div
                      key={vesselId}
                      className={`p-2 transition-colors flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-l-4 border-teal-500'
                          : finding.status === 'abnormal'
                          ? 'bg-rose-950/30'
                          : 'hover:bg-slate-900/80'
                      }`}
                    >
                      {/* Vessel Info & Quick Status Icon */}
                      <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => onSelectVessel(vesselId)}>
                        {finding.status === 'normal' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        {finding.status === 'abnormal' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-pulse" />}
                        {(finding.status === 'not_visualised' || finding.status === 'not_assessed') && (
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        )}

                        <div className="truncate">
                          <span className={`font-semibold text-xs ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                            {vDef.shortName}
                          </span>
                          {finding.status === 'abnormal' && (
                            <div className="text-[10px] text-rose-300 truncate">
                              {finding.patency?.replace(/_/g, ' ')} • {finding.chronicity?.replace(/_/g, ' ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Toggle Pills */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(vesselId, 'normal')}
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
                            if (finding.status !== 'abnormal') {
                              onUpdateStatus(vesselId, 'abnormal');
                            }
                            onSelectVessel(vesselId);
                            if (onOpenDetailModal) {
                              onOpenDetailModal(vesselId);
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            finding.status === 'abnormal'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Mark Abnormal & Describe Thrombus"
                        >
                          Abn
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateStatus(vesselId, 'not_visualised')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            finding.status === 'not_visualised'
                              ? 'bg-slate-700 text-slate-200'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                          title="Not Visualised"
                        >
                          N/V
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectVessel(vesselId)}
                          className="p-1 text-slate-400 hover:text-teal-300"
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
          );
        })}
      </div>
    </div>
  );
};
