// Persistent Abnormal Findings Summary Panel Component

import React from 'react';
import { VesselFinding, Side } from '../types/dvt';
import { AlertTriangle, Edit3, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AbnormalFindingsPanelProps {
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselId?: string | null;
  selectedVesselIds?: string[];
  onSelectVessel: (vesselId: string) => void;
  onToggleSelectVessel?: (vesselId: string) => void;
  onOpenDetailModal?: (vesselId: string) => void;
  onContextMenu?: (vesselId: string, e: React.MouseEvent) => void;
}

export const AbnormalFindingsPanel: React.FC<AbnormalFindingsPanelProps> = ({
  vesselFindings,
  selectedVesselId,
  selectedVesselIds = [],
  onSelectVessel,
  onToggleSelectVessel,
  onOpenDetailModal,
  onContextMenu
}) => {
  const abnormalList = (Object.values(vesselFindings) as VesselFinding[]).filter(
    (f) => f.status === 'abnormal'
  );

  const rightAbnormals = abnormalList.filter((f) => f.side === 'right');
  const leftAbnormals = abnormalList.filter((f) => f.side === 'left');
  const pelvisAbnormals = abnormalList.filter((f) => f.side === 'pelvis');

  const formatFindingSummary = (f: VesselFinding): string => {
    const parts: string[] = [];

    if (f.patency) {
      parts.push(f.patency.replace(/_/g, ' '));
    } else if (f.thrombusPresence) {
      parts.push(f.thrombusPresence.replace(/_/g, ' '));
    } else {
      parts.push('thrombus present');
    }

    if (f.chronicity) {
      parts.push(`(${f.chronicity.replace(/_/g, ' ')})`);
    }

    if (f.compressibility && f.compressibility !== 'fully_compressible') {
      parts.push(`• ${f.compressibility.replace(/_/g, ' ')}`);
    }

    if (f.proximalExtent?.distance) {
      parts.push(`• Extent: ${f.proximalExtent.distance}${f.proximalExtent.unit} to ${f.distalExtent?.distance || ''}${f.distalExtent?.unit || ''}`);
    }

    if (f.comments) {
      parts.push(`• ${f.comments}`);
    }

    return parts.join(' ');
  };

  if (abnormalList.length === 0) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3 text-slate-100 flex items-center justify-between gap-3 shadow-sm transition-all">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              ✓ No abnormal venous findings documented
            </h3>
            <p className="text-[11px] text-slate-400">
              All currently assessed vessel segments are recorded as normal.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full">
          0 Abnormal Segments
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-2 border-rose-800/80 rounded-xl overflow-hidden shadow-lg text-slate-100 transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-slate-900 px-4 py-2.5 border-b border-rose-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-200">
              ABNORMAL FINDINGS
            </h3>
            <p className="text-[10px] text-slate-400">
              Click any documented abnormality below to open detailed thrombus editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-rose-900/90 text-rose-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-700">
            {abnormalList.length} Abnormal {abnormalList.length === 1 ? 'Vessel Segment' : 'Vessel Segments'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 bg-slate-950/90 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Pelvis Abnormals if any */}
          {pelvisAbnormals.length > 0 && (
            <div className="bg-slate-900 border border-rose-900/80 rounded-lg p-2.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block border-b border-slate-800 pb-1">
                PELVIC / IVC PATHOLOGY ({pelvisAbnormals.length})
              </span>
              <div className="space-y-1.5">
                {pelvisAbnormals.map((f) => {
                  const isSelected = selectedVesselId === f.id || selectedVesselIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSelectVessel) {
                          onToggleSelectVessel(f.id);
                        } else {
                          onSelectVessel(f.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSelectVessel && !isSelected) {
                          onToggleSelectVessel(f.id);
                        } else {
                          onSelectVessel(f.id);
                        }
                        if (onOpenDetailModal) {
                          onOpenDetailModal(f.id);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (onContextMenu) {
                          onContextMenu(f.id, e);
                        }
                      }}
                      className={`w-full text-left p-2 rounded flex items-start justify-between gap-2 transition-all group cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/70 border-2 border-teal-500'
                          : 'bg-slate-950 hover:bg-rose-950/40 border border-rose-800/50 hover:border-rose-600'
                      }`}
                    >
                      <div className="space-y-0.5 select-none">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          {f.vesselName}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight capitalize">
                          {formatFindingSummary(f)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSelectVessel && !isSelected) {
                            onToggleSelectVessel(f.id);
                          } else {
                            onSelectVessel(f.id);
                          }
                          if (onOpenDetailModal) {
                            onOpenDetailModal(f.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-300 rounded bg-slate-900"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Limb Abnormals */}
          {rightAbnormals.length > 0 && (
            <div className="bg-slate-900 border border-rose-900/80 rounded-lg p-2.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block border-b border-slate-800 pb-1">
                RIGHT LIMB PATHOLOGY ({rightAbnormals.length})
              </span>
              <div className="space-y-1.5">
                {rightAbnormals.map((f) => {
                  const isSelected = selectedVesselId === f.id || selectedVesselIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSelectVessel) {
                          onToggleSelectVessel(f.id);
                        } else {
                          onSelectVessel(f.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSelectVessel && !isSelected) {
                          onToggleSelectVessel(f.id);
                        } else {
                          onSelectVessel(f.id);
                        }
                        if (onOpenDetailModal) {
                          onOpenDetailModal(f.id);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (onContextMenu) {
                          onContextMenu(f.id, e);
                        }
                      }}
                      className={`w-full text-left p-2 rounded flex items-start justify-between gap-2 transition-all group cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/70 border-2 border-teal-500'
                          : 'bg-slate-950 hover:bg-rose-950/40 border border-rose-800/50 hover:border-rose-600'
                      }`}
                    >
                      <div className="space-y-0.5 select-none">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          {f.vesselName}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight capitalize">
                          {formatFindingSummary(f)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSelectVessel && !isSelected) {
                            onToggleSelectVessel(f.id);
                          } else {
                            onSelectVessel(f.id);
                          }
                          if (onOpenDetailModal) {
                            onOpenDetailModal(f.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-300 rounded bg-slate-900"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Left Limb Abnormals */}
          {leftAbnormals.length > 0 && (
            <div className="bg-slate-900 border border-rose-900/80 rounded-lg p-2.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block border-b border-slate-800 pb-1">
                LEFT LIMB PATHOLOGY ({leftAbnormals.length})
              </span>
              <div className="space-y-1.5">
                {leftAbnormals.map((f) => {
                  const isSelected = selectedVesselId === f.id || selectedVesselIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSelectVessel) {
                          onToggleSelectVessel(f.id);
                        } else {
                          onSelectVessel(f.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSelectVessel && !isSelected) {
                          onToggleSelectVessel(f.id);
                        } else {
                          onSelectVessel(f.id);
                        }
                        if (onOpenDetailModal) {
                          onOpenDetailModal(f.id);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (onContextMenu) {
                          onContextMenu(f.id, e);
                        }
                      }}
                      className={`w-full text-left p-2 rounded flex items-start justify-between gap-2 transition-all group cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/70 border-2 border-teal-500'
                          : 'bg-slate-950 hover:bg-rose-950/40 border border-rose-800/50 hover:border-rose-600'
                      }`}
                    >
                      <div className="space-y-0.5 select-none">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          {f.vesselName}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight capitalize">
                          {formatFindingSummary(f)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSelectVessel && !isSelected) {
                            onToggleSelectVessel(f.id);
                          } else {
                            onSelectVessel(f.id);
                          }
                          if (onOpenDetailModal) {
                            onOpenDetailModal(f.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-300 rounded bg-slate-900"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
