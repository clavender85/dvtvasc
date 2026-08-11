// Interactive SVG Anatomical Map for Iliocaval / Pelvic Venous System
import React, { useState, useRef } from 'react';
import {
  VesselFinding,
  VesselStatus,
  Compressibility,
  Patency,
  SonographicChronicity,
  ThrombusEchogenicity,
  NON_VISUALIZATION_REASON_LABELS
} from '../types/dvt';
import { ShieldAlert, CheckCircle2, EyeOff, HelpCircle, Edit3, Sliders, X, Sparkles, Filter, Activity } from 'lucide-react';

interface IliocavalDiagramProps {
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselIds: string[];
  onToggleSelectVessel: (vesselId: string) => void;
  onSelectGroup?: (vesselIds: string[]) => void;
  onClearSelection?: () => void;
  onBatchUpdateFindings?: (updatedFindings: Record<string, VesselFinding>) => void;
  onOpenDetailModal?: (vesselId: string) => void;
  onContextMenu?: (vesselId: string, e: React.MouseEvent) => void;
  filterPresent?: boolean;
  stentPresent?: boolean;
  isLowerLimbIncluded?: { right: boolean; left: boolean };
}

export const IliocavalDiagram: React.FC<IliocavalDiagramProps> = ({
  vesselFindings,
  selectedVesselIds,
  onToggleSelectVessel,
  onSelectGroup,
  onClearSelection,
  onBatchUpdateFindings,
  onOpenDetailModal,
  onContextMenu,
  filterPresent = false,
  stentPresent = false,
  isLowerLimbIncluded = { right: true, left: true }
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showBatchDrawer, setShowBatchDrawer] = useState<boolean>(false);

  // Double click / tap tracker
  const lastClickRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  // Batch property form state
  const [batchStatus, setBatchStatus] = useState<VesselStatus | ''>('');
  const [batchCompressibility, setBatchCompressibility] = useState<Compressibility | ''>('');
  const [batchPatency, setBatchPatency] = useState<Patency | ''>('');
  const [batchChronicity, setBatchChronicity] = useState<SonographicChronicity | ''>('');
  const [batchEchogenicity, setBatchEchogenicity] = useState<ThrombusEchogenicity | ''>('');

  const iliocavalVesselIds = [
    'pelvis_IVC',
    'right_CIV',
    'left_CIV',
    'right_EIV',
    'left_EIV',
    'right_IIV',
    'left_IIV'
  ];

  const handleVesselClick = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const now = Date.now();
    const timeDiff = now - lastClickRef.current.time;
    const isDoubleTap = lastClickRef.current.id === id && timeDiff < 400;
    lastClickRef.current = { id, time: now };

    if (isDoubleTap) {
      if (selectedVesselIds.length > 1) {
        setShowBatchDrawer(true);
      } else if (onOpenDetailModal) {
        onOpenDetailModal(id);
      }
      return;
    }

    onToggleSelectVessel(id);
  };

  const handleSelectAllIliocaval = () => {
    if (onSelectGroup) {
      onSelectGroup(iliocavalVesselIds);
    }
  };

  const handleApplyBatchEdit = () => {
    if (selectedVesselIds.length === 0 || !onBatchUpdateFindings) return;
    const updatedMap: Record<string, VesselFinding> = {};

    selectedVesselIds.forEach((vId) => {
      const existing = vesselFindings[vId];
      if (!existing) return;
      const next: VesselFinding = { ...existing };

      if (batchStatus) {
        next.status = batchStatus;
        if (batchStatus === 'normal') {
          next.compressibility = 'fully_compressible';
          next.patency = 'patent';
          next.chronicity = undefined;
        } else if (batchStatus === 'abnormal') {
          next.compressibility = 'non_compressible';
          next.patency = 'completely_occluded';
          next.chronicity = 'acute_appearing';
        }
      }
      if (batchCompressibility) next.compressibility = batchCompressibility;
      if (batchPatency) next.patency = batchPatency;
      if (batchChronicity) next.chronicity = batchChronicity;
      if (batchEchogenicity) next.echogenicity = batchEchogenicity;

      updatedMap[vId] = next;
    });

    onBatchUpdateFindings(updatedMap);
    setShowBatchDrawer(false);
  };

  // Visual style calculation
  const getVesselVisuals = (id: string) => {
    const finding = vesselFindings[id];
    const isSelected = selectedVesselIds.includes(id);
    const isHovered = hoveredId === id;

    const baseWidth = id === 'pelvis_IVC' ? 22 : id.includes('CIV') ? 17 : 14;
    const calculatedWidth = isSelected ? baseWidth + 5 : isHovered ? baseWidth + 3 : baseWidth;

    if (!finding || finding.status === 'not_assessed') {
      return {
        wallColor: '#334155',
        wallDashArray: '5 4',
        wallWidth: calculatedWidth * 0.75,
        fillColor: 'transparent',
        lumenColor: 'transparent',
        statusText: 'Not Examined (NA)',
        opacity: 0.5
      };
    }

    if (finding.status === 'not_visualised') {
      const reasonKey = finding.nonVisualizationReason || 'body_habitus';
      const reasonLabel = NON_VISUALIZATION_REASON_LABELS[reasonKey] || 'Technical Limitation';
      return {
        wallColor: '#94a3b8',
        wallDashArray: '2 3',
        wallWidth: calculatedWidth * 0.85,
        fillColor: 'transparent',
        lumenColor: 'transparent',
        statusText: `Not Visualised (NV): ${reasonLabel}`,
        opacity: 0.85
      };
    }

    if (finding.status === 'normal') {
      return {
        wallColor: '#059669',
        wallWidth: calculatedWidth,
        fillColor: '#059669',
        lumenColor: '#34d399',
        statusText: 'Normal Patent',
        opacity: 0.95
      };
    }

    // Abnormal status
    return {
      wallColor: '#d97706',
      wallWidth: calculatedWidth + 2,
      fillColor: '#b45309',
      lumenColor: finding.patency === 'partially_occluded' ? '#38bdf8' : 'transparent',
      statusText: `Abnormal: ${finding.patency?.replace(/_/g, ' ') || 'Thrombus'}`,
      opacity: 1
    };
  };

  const hoveredFinding = hoveredId ? vesselFindings[hoveredId] : null;

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-xl select-none">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-950/80 border border-amber-800/80 rounded-lg text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm tracking-wide">
              ILIOCAVAL / PELVIC VENOUS SYSTEM MAP
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive pelvic venous mapping (IVC, CIV, EIV, IIV)
            </p>
          </div>
        </div>

        {/* Selection Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-bold text-teal-300">
            SELECTED: {selectedVesselIds.length}
          </span>

          <button
            type="button"
            onClick={handleSelectAllIliocaval}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
          >
            Select All Iliocaval
          </button>

          {selectedVesselIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowBatchDrawer(true)}
                className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                BATCH EDIT ({selectedVesselIds.length})
              </button>

              {onClearSelection && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main SVG Map Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-2 min-h-[420px]">
        <svg
          viewBox="0 0 600 520"
          className="w-full h-full max-h-[500px] filter drop-shadow-md"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glow Filter for Selection */}
            <filter id="iliocaval-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Inguinal Ligament Pattern */}
            <pattern id="inguinal-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="10" y2="0" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
            </pattern>
          </defs>

          {/* Inguinal Ligament Landmark Line */}
          <g>
            <line x1="40" y1="380" x2="560" y2="380" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="300" y="375" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1">
              INGUINAL LIGAMENTS (PELVIC / LOWER LIMB BOUNDARY)
            </text>
          </g>

          {/* IVC / Iliac Junction Landmark Line */}
          <g>
            <line x1="120" y1="150" x2="480" y2="150" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
            <text x="520" y="154" textAnchor="start" fill="#64748b" fontSize="9" fontWeight="medium">
              IVC Bifurcation
            </text>
          </g>

          {/* Vessel 1: IVC (pelvis_IVC) */}
          {(() => {
            const vId = 'pelvis_IVC';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                {/* Click target hit area */}
                <path d="M 300 40 L 300 150" stroke="transparent" strokeWidth="40" strokeLinecap="round" />
                {/* Selection Halo */}
                {isSel && (
                  <path
                    d="M 300 40 L 300 150"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                {/* Wall */}
                <path
                  d="M 300 40 L 300 150"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {/* Lumen */}
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 300 40 L 300 150"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 6}
                    strokeLinecap="round"
                  />
                )}

                {/* IVC Filter Icon Overlay if Present */}
                {filterPresent && (
                  <g transform="translate(300, 95)">
                    <circle r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      F
                    </text>
                  </g>
                )}

                {/* Label */}
                <rect x="235" y="80" width="130" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="300" y="94" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
                  Inferior Vena Cava (IVC)
                </text>
              </g>
            );
          })()}

          {/* Vessel 2: Right Common Iliac Vein (right_CIV) */}
          {(() => {
            const vId = 'right_CIV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 300 150 Q 250 200 200 250" stroke="transparent" strokeWidth="36" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 300 150 Q 250 200 200 250"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 300 150 Q 250 200 200 250"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 300 150 Q 250 200 200 250"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 5}
                    strokeLinecap="round"
                  />
                )}
                <rect x="180" y="185" width="85" height="18" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="222.5" y="198" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  Right CIV
                </text>
              </g>
            );
          })()}

          {/* Vessel 3: Left Common Iliac Vein (left_CIV) */}
          {(() => {
            const vId = 'left_CIV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 300 150 Q 350 200 400 250" stroke="transparent" strokeWidth="36" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 300 150 Q 350 200 400 250"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 300 150 Q 350 200 400 250"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 300 150 Q 350 200 400 250"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 5}
                    strokeLinecap="round"
                  />
                )}
                <rect x="335" y="185" width="85" height="18" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="377.5" y="198" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  Left CIV
                </text>
              </g>
            );
          })()}

          {/* Vessel 4: Right Internal Iliac Vein (right_IIV) */}
          {(() => {
            const vId = 'right_IIV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 200 250 Q 230 300 250 340" stroke="transparent" strokeWidth="30" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 200 250 Q 230 300 250 340"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 200 250 Q 230 300 250 340"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 200 250 Q 230 300 250 340"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 4}
                    strokeLinecap="round"
                  />
                )}
                <text x="255" y="320" textAnchor="start" fill="#cbd5e1" fontSize="9" fontWeight="medium">
                  R IIV
                </text>
              </g>
            );
          })()}

          {/* Vessel 5: Left Internal Iliac Vein (left_IIV) */}
          {(() => {
            const vId = 'left_IIV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 400 250 Q 370 300 350 340" stroke="transparent" strokeWidth="30" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 400 250 Q 370 300 350 340"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 400 250 Q 370 300 350 340"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 400 250 Q 370 300 350 340"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 4}
                    strokeLinecap="round"
                  />
                )}
                <text x="345" y="320" textAnchor="end" fill="#cbd5e1" fontSize="9" fontWeight="medium">
                  L IIV
                </text>
              </g>
            );
          })()}

          {/* Vessel 6: Right External Iliac Vein (right_EIV) */}
          {(() => {
            const vId = 'right_EIV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 200 250 Q 170 310 150 380" stroke="transparent" strokeWidth="32" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 200 250 Q 170 310 150 380"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 200 250 Q 170 310 150 380"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 200 250 Q 170 310 150 380"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 4}
                    strokeLinecap="round"
                  />
                )}
                <rect x="100" y="300" width="75" height="18" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="137.5" y="313" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  Right EIV
                </text>
              </g>
            );
          })()}

          {/* Vessel 7: Left External Iliac Vein (left_EIV) */}
          {(() => {
            const vId = 'left_EIV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);

            return (
              <g
                key={vId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 400 250 Q 430 310 450 380" stroke="transparent" strokeWidth="32" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 400 250 Q 430 310 450 380"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 400 250 Q 430 310 450 380"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 400 250 Q 430 310 450 380"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 4}
                    strokeLinecap="round"
                  />
                )}
                <rect x="425" y="300" width="75" height="18" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="462.5" y="313" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  Left EIV
                </text>
              </g>
            );
          })()}

          {/* Lower Limb Contextual Continuation: CFVs below Inguinal Ligament */}
          {/* Right CFV (right_CFV) */}
          {(() => {
            const vId = 'right_CFV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);
            const isIncluded = isLowerLimbIncluded.right;

            return (
              <g
                key={vId}
                className={`transition-all duration-200 ${isIncluded ? 'cursor-pointer' : 'opacity-40 pointer-events-none'}`}
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => isIncluded && handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (isIncluded && onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 150 380 L 150 480" stroke="transparent" strokeWidth="32" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 150 380 L 150 480"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 150 380 L 150 480"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 150 380 L 150 480"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 4}
                    strokeLinecap="round"
                  />
                )}
                <rect x="90" y="420" width="120" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="150" y="434" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  Right CFV (Lower Limb)
                </text>
              </g>
            );
          })()}

          {/* Left CFV (left_CFV) */}
          {(() => {
            const vId = 'left_CFV';
            const v = getVesselVisuals(vId);
            const isSel = selectedVesselIds.includes(vId);
            const isIncluded = isLowerLimbIncluded.left;

            return (
              <g
                key={vId}
                className={`transition-all duration-200 ${isIncluded ? 'cursor-pointer' : 'opacity-40 pointer-events-none'}`}
                onMouseEnter={() => setHoveredId(vId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => isIncluded && handleVesselClick(vId, e)}
                onContextMenu={(e) => {
                  if (isIncluded && onContextMenu) {
                    onContextMenu(vId, e);
                  }
                }}
              >
                <path d="M 450 380 L 450 480" stroke="transparent" strokeWidth="32" strokeLinecap="round" />
                {isSel && (
                  <path
                    d="M 450 380 L 450 480"
                    stroke="#22d3ee"
                    strokeWidth={v.wallWidth + 8}
                    strokeLinecap="round"
                    filter="url(#iliocaval-glow)"
                    opacity="0.85"
                  />
                )}
                <path
                  d="M 450 380 L 450 480"
                  stroke={v.wallColor}
                  strokeWidth={v.wallWidth}
                  strokeDasharray={v.wallDashArray}
                  strokeLinecap="round"
                  opacity={v.opacity}
                />
                {v.lumenColor !== 'transparent' && (
                  <path
                    d="M 450 380 L 450 480"
                    stroke={v.lumenColor}
                    strokeWidth={v.wallWidth - 4}
                    strokeLinecap="round"
                  />
                )}
                <rect x="390" y="420" width="120" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="450" y="434" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  Left CFV (Lower Limb)
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Hover Information Tooltip Overlay */}
        {hoveredFinding && (
          <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-700 p-2.5 rounded-lg shadow-2xl backdrop-blur-sm max-w-sm pointer-events-none z-20">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-100 mb-1">
              <span>{hoveredFinding.vesselName}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                  hoveredFinding.status === 'abnormal'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : hoveredFinding.status === 'normal'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : hoveredFinding.status === 'not_visualised'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hoveredFinding.status === 'not_visualised'
                  ? 'Not Visualised (NV)'
                  : hoveredFinding.status === 'not_assessed'
                  ? 'Not Examined (NA)'
                  : hoveredFinding.status}
              </span>
            </div>
            {hoveredFinding.status === 'abnormal' ? (
              <p className="text-[11px] text-amber-300">
                Thrombus: {hoveredFinding.patency?.replace(/_/g, ' ') || 'Present'}{' '}
                {hoveredFinding.chronicity ? `(${hoveredFinding.chronicity.replace(/_/g, ' ')})` : ''}
              </p>
            ) : hoveredFinding.status === 'not_visualised' ? (
              <p className="text-[11px] text-amber-300">
                Reason: {NON_VISUALIZATION_REASON_LABELS[hoveredFinding.nonVisualizationReason || 'body_habitus']}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">Normal ultrasound appearance and patent flow.</p>
            )}
          </div>
        )}
      </div>

      {/* Batch Edit Drawer Modal for Iliocaval Selection */}
      {showBatchDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  BATCH EDIT ({selectedVesselIds.length} PELVIC SEGMENTS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">
                  Clinical Status
                </label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value as VesselStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="">-- Unchanged --</option>
                  <option value="normal">Normal Patent</option>
                  <option value="abnormal">Abnormal (Thrombus / Occlusion)</option>
                  <option value="not_visualised">Not Visualised (NV)</option>
                  <option value="not_assessed">Not Examined (NA)</option>
                </select>
              </div>

              {batchStatus === 'abnormal' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">
                      Patency / Occlusion
                    </label>
                    <select
                      value={batchPatency}
                      onChange={(e) => setBatchPatency(e.target.value as Patency)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    >
                      <option value="">-- Unchanged --</option>
                      <option value="completely_occluded">Completely Occluded</option>
                      <option value="partially_occluded">Partially Occluded</option>
                      <option value="recanalised">Recanalised Post-Thrombotic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">
                      Thrombus Chronicity
                    </label>
                    <select
                      value={batchChronicity}
                      onChange={(e) => setBatchChronicity(e.target.value as SonographicChronicity)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    >
                      <option value="">-- Unchanged --</option>
                      <option value="acute_appearing">Acute-Appearing</option>
                      <option value="subacute_appearing">Subacute-Appearing</option>
                      <option value="chronic_post_thrombotic">Chronic Post-Thrombotic</option>
                      <option value="acute_on_chronic">Acute-on-Chronic</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBatchDrawer(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBatchEdit}
                className="px-4 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md"
              >
                APPLY TO {selectedVesselIds.length} SEGMENTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
