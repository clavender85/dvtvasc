// Persistent Abnormal Findings Summary Panel Component

import React from 'react';
import { VesselFinding, Side } from '../types/dvt';
import { AlertTriangle, Edit3, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AbnormalFindingsPanelProps {
  vesselFindings: Record<string, VesselFinding>;
  onSelectVessel: (vesselId: string) => void;
}

export const AbnormalFindingsPanel: React.FC<AbnormalFindingsPanelProps> = ({
  vesselFindings,
  onSelectVessel
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

  return (
    <div className="bg-slate-900 border-2 border-rose-800/80 rounded-xl overflow-hidden shadow-lg text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-slate-900 px-4 py-2.5 border-b border-rose-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-200">
              ABNORMAL FINDINGS SUMMARY
            </h3>
            <p className="text-[10px] text-slate-400">
              Click any documented abnormality below to immediately open detailed thrombus editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-rose-900/90 text-rose-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-700">
            {abnormalList.length} Abnormal {abnormalList.length === 1 ? 'Vessel' : 'Vessels'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 bg-slate-950/90 text-xs">
        {abnormalList.length === 0 ? (
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>No deep or superficial venous thrombus documented. All assessed segments normal.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Pelvis Abnormals if any */}
            {pelvisAbnormals.length > 0 && (
              <div className="bg-slate-900 border border-rose-900/80 rounded-lg p-2.5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block border-b border-slate-800 pb-1">
                  PELVIC / IVC PATHOLOGY ({pelvisAbnormals.length})
                </span>
                <div className="space-y-1.5">
                  {pelvisAbnormals.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onSelectVessel(f.id)}
                      className="w-full text-left p-2 bg-slate-950 hover:bg-rose-950/40 border border-rose-800/50 hover:border-rose-600 rounded flex items-start justify-between gap-2 transition-all group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          {f.vesselName}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight capitalize">
                          {formatFindingSummary(f)}
                        </p>
                      </div>
                      <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
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
                  {rightAbnormals.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onSelectVessel(f.id)}
                      className="w-full text-left p-2 bg-slate-950 hover:bg-rose-950/40 border border-rose-800/50 hover:border-rose-600 rounded flex items-start justify-between gap-2 transition-all group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          {f.vesselName}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight capitalize">
                          {formatFindingSummary(f)}
                        </p>
                      </div>
                      <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
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
                  {leftAbnormals.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onSelectVessel(f.id)}
                      className="w-full text-left p-2 bg-slate-950 hover:bg-rose-950/40 border border-rose-800/50 hover:border-rose-600 rounded flex items-start justify-between gap-2 transition-all group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          {f.vesselName}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight capitalize">
                          {formatFindingSummary(f)}
                        </p>
                      </div>
                      <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
