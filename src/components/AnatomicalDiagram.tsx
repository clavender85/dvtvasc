// Interactive SVG Venous Anatomical Map for Lower Limb DVT Clinical Worksheet with Multi-Vessel Selection & Batch Editing

import React, { useState, useEffect, useRef } from 'react';
import {
  VesselFinding,
  VesselCategory,
  Side,
  VesselStatus,
  Landmark,
  Compressibility,
  Patency,
  SonographicChronicity,
  ThrombusEchogenicity
} from '../types/dvt';
import { LANDMARK_LABELS } from '../data/anatomyData';
import {
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Edit3,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Activity,
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Square,
  Sliders,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  MapPin,
  FileText,
  MousePointer
} from 'lucide-react';

interface AnatomicalDiagramProps {
  vesselFindings: Record<string, VesselFinding>;
  selectedVesselId: string | null;
  onSelectVessel: (vesselId: string) => void;
  onQuickToggleStatus?: (vesselId: string, status: VesselStatus) => void;
  onBatchUpdateFindings?: (updatedFindings: Record<string, VesselFinding>) => void;
  onOpenDetailModal?: (vesselId: string) => void;
  comparisons?: Record<string, any>;
}

// Visual Specification for Venous Map Rendering (Colors, Patterns, Lumen Flow)
export interface VesselVisualSpecs {
  wallColor: string;
  wallDashArray?: string;
  wallWidth: number;
  fillPatternUrl?: string;
  fillColor?: string;
  fillWidth: number;
  lumenType: 'full_flow' | 'none' | 'narrow_channel' | 'wide_residual' | 'recanalised_multi' | 'none_faint';
  lumenColor: string;
  lumenWidth: number;
  showQuestionMark?: boolean;
  statusText: string;
  opacity: number;
}

// Compact Swatch Renderer for Permanent Venous Map Legend
const LegendSwatch: React.FC<{
  title: string;
  subtitle: string;
  wallColor: string;
  fillPatternUrl?: string;
  fillColor?: string;
  wallDashArray?: string;
  lumenType: 'full_flow' | 'none' | 'narrow_channel' | 'wide_residual' | 'recanalised_multi' | 'none_faint';
  lumenColor?: string;
  showQuestionMark?: boolean;
}> = ({
  title,
  subtitle,
  wallColor,
  fillPatternUrl,
  fillColor,
  wallDashArray,
  lumenType,
  lumenColor = '#22d3ee',
  showQuestionMark
}) => (
  <div className="flex items-center gap-2.5 p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors">
    <div className="w-14 h-8 bg-slate-950 rounded border border-slate-800 flex items-center justify-center flex-shrink-0 px-1 overflow-hidden">
      <svg viewBox="0 0 50 20" className="w-full h-full">
        {/* Outer Wall */}
        <line
          x1="2"
          y1="10"
          x2="48"
          y2="10"
          stroke={wallColor}
          strokeWidth="12"
          strokeDasharray={wallDashArray}
          strokeLinecap="round"
        />
        {/* Fill / Thrombus Layer */}
        {(fillPatternUrl || fillColor) && (
          <line
            x1="4"
            y1="10"
            x2="46"
            y2="10"
            stroke={fillPatternUrl || fillColor}
            strokeWidth="9"
            strokeLinecap="round"
          />
        )}
        {/* Lumen / Flow Channel */}
        {lumenType === 'full_flow' && (
          <line x1="5" y1="10" x2="45" y2="10" stroke={lumenColor} strokeWidth="6" strokeLinecap="round" />
        )}
        {lumenType === 'narrow_channel' && (
          <line x1="5" y1="10" x2="45" y2="10" stroke={lumenColor} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {lumenType === 'wide_residual' && (
          <line x1="5" y1="10" x2="45" y2="10" stroke={lumenColor} strokeWidth="5" strokeLinecap="round" />
        )}
        {lumenType === 'recanalised_multi' && (
          <>
            <line x1="5" y1="7" x2="45" y2="7" stroke={lumenColor} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="5" y1="13" x2="45" y2="13" stroke={lumenColor} strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
        {showQuestionMark && (
          <g transform="translate(25, 10)">
            <circle r="5" fill="#d97706" stroke="#fef08a" strokeWidth="1" />
            <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">?</text>
          </g>
        )}
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-[11px] text-slate-100 truncate">{title}</div>
      <div className="text-[10px] text-slate-400 leading-tight truncate">{subtitle}</div>
    </div>
  </div>
);

// Fixed anatomical landmark Y-coordinates in SVG viewBox space (0 to 1050)
const LANDMARK_Y = {
  IVC_TOP: 60,
  IVC_BIFURCATION: 150,
  GROIN_CREASE: 240,
  SFJ: 270,
  KNEE_CREASE: 560,
  SPJ: 590,
  ANKLE: 920
};

export const AnatomicalDiagram: React.FC<AnatomicalDiagramProps> = ({
  vesselFindings,
  selectedVesselId,
  onSelectVessel,
  onQuickToggleStatus,
  onBatchUpdateFindings,
  onOpenDetailModal,
  comparisons
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showTextLabels, setShowTextLabels] = useState<boolean>(false);
  const [clickMode, setClickMode] = useState<'toggle_abnormal' | 'select_only'>('toggle_abnormal');
  const [filterMode, setFilterMode] = useState<'all' | 'abnormal_only' | 'routine'>('all');

  // Double Click / Double Tap Tracker
  const lastClickRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  // Multi-Selection State
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>(
    selectedVesselId ? [selectedVesselId] : []
  );
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [showBatchDrawer, setShowBatchDrawer] = useState<boolean>(false);

  // Batch property form state
  const [batchStatus, setBatchStatus] = useState<VesselStatus | ''>('');
  const [batchCompressibility, setBatchCompressibility] = useState<Compressibility | ''>('');
  const [batchPatency, setBatchPatency] = useState<Patency | ''>('');
  const [batchChronicity, setBatchChronicity] = useState<SonographicChronicity | ''>('');
  const [batchEchogenicity, setBatchEchogenicity] = useState<ThrombusEchogenicity | ''>('');
  const [batchLocationDetails, setBatchLocationDetails] = useState<string>('');
  const [batchComments, setBatchComments] = useState<string>('');
  const [batchProximalLandmark, setBatchProximalLandmark] = useState<Landmark | ''>('');
  const [batchProximalRelation, setBatchProximalRelation] = useState<'at' | 'above' | 'below'>('at');
  const [batchProximalDistance, setBatchProximalDistance] = useState<string>('');
  const [batchDistalLandmark, setBatchDistalLandmark] = useState<Landmark | ''>('');
  const [batchDistalRelation, setBatchDistalRelation] = useState<'at' | 'above' | 'below'>('at');
  const [batchDistalDistance, setBatchDistalDistance] = useState<string>('');

  // Keep selection in sync when parent selectedVesselId changes
  useEffect(() => {
    if (selectedVesselId && !selectedVesselIds.includes(selectedVesselId) && !isMultiSelectMode) {
      setSelectedVesselIds([selectedVesselId]);
    }
  }, [selectedVesselId]);

  const hoveredFinding = hoveredId ? vesselFindings[hoveredId] : null;
  const hoveredComparison = hoveredId && comparisons ? comparisons[hoveredId] : null;

  // Handle clicking a vessel segment (1-Click highlight, 2-Clicks describe thrombus)
  const handleVesselClick = (id: string, e?: React.MouseEvent) => {
    const now = Date.now();
    const timeDiff = now - lastClickRef.current.time;
    const isDoubleTap = lastClickRef.current.id === id && timeDiff < 450;
    lastClickRef.current = { id, time: now };

    const isModifier = e && (e.shiftKey || e.ctrlKey || e.metaKey);
    const currentFinding = vesselFindings[id];
    const isAlreadyAbnormal = currentFinding?.status === 'abnormal';

    // 2-CLICKS (Double Click or Second Click on highlighted vessel) -> Open Thrombus Description Modal
    if (isDoubleTap || (isAlreadyAbnormal && clickMode === 'toggle_abnormal' && timeDiff < 900)) {
      onSelectVessel(id);
      if (onOpenDetailModal) {
        onOpenDetailModal(id);
      }
      return;
    }

    if (isMultiSelectMode || isModifier) {
      // Toggle selection in explicit multi-select mode
      setSelectedVesselIds((prev) => {
        const exists = prev.includes(id);
        const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
        if (next.length === 1) {
          onSelectVessel(next[0]);
        }
        return next;
      });
    } else {
      // 1-CLICK ACTION: Toggle DVT highlight directly on the segment
      if (clickMode === 'toggle_abnormal' && onQuickToggleStatus) {
        const nextStatus: VesselStatus = isAlreadyAbnormal ? 'normal' : 'abnormal';
        onQuickToggleStatus(id, nextStatus);
      }

      // Add to selectedVesselIds so multiple segments stay highlighted together
      setSelectedVesselIds((prev) => {
        if (prev.includes(id)) {
          return prev;
        }
        return [...prev, id];
      });

      onSelectVessel(id);
    }
  };

  // Quick Selection Helpers
  const selectAllRightLeg = () => {
    const ids = Object.keys(vesselFindings).filter((id) => id.startsWith('right_'));
    setSelectedVesselIds(ids);
  };

  const selectAllLeftLeg = () => {
    const ids = Object.keys(vesselFindings).filter((id) => id.startsWith('left_'));
    setSelectedVesselIds(ids);
  };

  const selectAllCalfVeins = () => {
    const calfKeys = ['TPTV', 'PTV', 'PERV', 'ATV', 'MGV', 'LGV', 'SV', 'GSV_CALF'];
    const ids = Object.keys(vesselFindings).filter((id) =>
      calfKeys.some((k) => id.includes(k))
    );
    setSelectedVesselIds(ids);
  };

  const selectAllAbnormal = () => {
    const ids = Object.keys(vesselFindings).filter(
      (id) => vesselFindings[id]?.status === 'abnormal'
    );
    setSelectedVesselIds(ids);
  };

  const selectAllVessels = () => {
    setSelectedVesselIds(Object.keys(vesselFindings));
  };

  const clearSelection = () => {
    setSelectedVesselIds([]);
  };

  // Quick 1-click batch status trigger
  const handleQuickBatchStatus = (status: VesselStatus) => {
    if (selectedVesselIds.length === 0) return;
    const updatedMap: Record<string, VesselFinding> = {};

    selectedVesselIds.forEach((vId) => {
      const existing = vesselFindings[vId];
      if (!existing) return;

      updatedMap[vId] = {
        ...existing,
        status,
        compressibility:
          status === 'normal'
            ? 'fully_compressible'
            : status === 'abnormal'
            ? 'non_compressible'
            : 'not_applicable',
        patency:
          status === 'normal'
            ? 'patent'
            : status === 'abnormal'
            ? 'completely_occluded'
            : 'indeterminate',
        chronicity: status === 'abnormal' ? 'acute_appearing' : undefined
      };
    });

    if (onBatchUpdateFindings) {
      onBatchUpdateFindings(updatedMap);
    }
  };

  // Apply comprehensive batch edits
  const handleApplyBatchEdit = () => {
    if (selectedVesselIds.length === 0) return;
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
          if (!next.compressibility || next.compressibility === 'fully_compressible') {
            next.compressibility = 'non_compressible';
          }
          if (!next.patency || next.patency === 'patent') {
            next.patency = 'completely_occluded';
          }
          if (!next.chronicity) {
            next.chronicity = 'acute_appearing';
          }
        }
      }

      if (batchCompressibility) next.compressibility = batchCompressibility;
      if (batchPatency) next.patency = batchPatency;
      if (batchChronicity) next.chronicity = batchChronicity;
      if (batchEchogenicity) next.echogenicity = batchEchogenicity;

      if (batchLocationDetails.trim()) {
        next.locationDetails = batchLocationDetails.trim();
      }

      if (batchComments.trim()) {
        next.comments = existing.comments
          ? `${existing.comments}; ${batchComments.trim()}`
          : batchComments.trim();
      }

      if (batchProximalLandmark) {
        next.proximalExtent = {
          landmark: batchProximalLandmark,
          relation: batchProximalRelation,
          distance: batchProximalDistance ? parseFloat(batchProximalDistance) : null,
          unit: 'mm'
        };
      }

      if (batchDistalLandmark) {
        next.distalExtent = {
          landmark: batchDistalLandmark,
          relation: batchDistalRelation,
          distance: batchDistalDistance ? parseFloat(batchDistalDistance) : null,
          unit: 'mm'
        };
      }

      updatedMap[vId] = next;
    });

    if (onBatchUpdateFindings) {
      onBatchUpdateFindings(updatedMap);
    }

    setShowBatchDrawer(false);
  };

  // Format extent text label
  const formatExtentLabel = (f: VesselFinding): { proxText?: string; distText?: string } => {
    let proxText: string | undefined;
    let distText: string | undefined;

    if (f.distanceToJunction) {
      const jName = f.distanceToJunction.junction;
      const mm = f.distanceToJunction.distanceMm;
      proxText = `${mm} mm from ${jName}`;
    } else if (f.proximalExtent && f.proximalExtent.distance !== null) {
      const rel = f.proximalExtent.relation.replace(/_/g, ' ');
      const lm = f.proximalExtent.landmark.replace(/_/g, ' ');
      proxText = `${f.proximalExtent.distance} ${f.proximalExtent.unit} ${rel} ${lm}`;
    }

    if (f.distalExtent && f.distalExtent.distance !== null) {
      const rel = f.distalExtent.relation.replace(/_/g, ' ');
      const lm = f.distalExtent.landmark.replace(/_/g, ' ');
      distText = `${f.distalExtent.distance} ${f.distalExtent.unit} ${rel} ${lm}`;
    }

    return { proxText, distText };
  };

  // Helper for category-based vessel thickness
  const getCategoryBaseWidth = (category: VesselCategory): number => {
    switch (category) {
      case 'pelvis':
        return 16;
      case 'thigh':
        return 14;
      case 'popliteal':
        return 12;
      case 'calf_deep':
      case 'muscular_calf':
        return 9.5;
      case 'superficial':
        return 8.5;
      default:
        return 11;
    }
  };

  // Vessel visual style generator (Thicker, bold anatomical rendering + Multi-Layer Pattern Coding)
  const getVesselVisuals = (id: string, category: VesselCategory): VesselVisualSpecs => {
    const finding = vesselFindings[id];
    const isSelected = selectedVesselIds.includes(id);
    const isHovered = hoveredId === id;
    const baseWidth = getCategoryBaseWidth(category);
    const calculatedWidth = isSelected ? baseWidth + 5 : isHovered ? baseWidth + 3 : baseWidth;

    if (!finding || finding.status === 'not_assessed') {
      return {
        wallColor: '#334155',
        wallDashArray: '5 4',
        wallWidth: calculatedWidth * 0.75,
        fillColor: 'transparent',
        fillWidth: 0,
        lumenType: 'none_faint',
        lumenColor: 'transparent',
        lumenWidth: 0,
        statusText: 'Not Assessed',
        opacity: 0.45
      };
    }

    if (finding.status === 'not_visualised') {
      return {
        wallColor: '#64748b',
        wallDashArray: '3 3',
        wallWidth: calculatedWidth * 0.8,
        fillColor: 'transparent',
        fillWidth: 0,
        lumenType: 'none_faint',
        lumenColor: 'transparent',
        lumenWidth: 0,
        statusText: 'Not Visualised',
        opacity: 0.7
      };
    }

    if (finding.status === 'normal') {
      const isSuperficial = category === 'superficial';
      return {
        wallColor: isSuperficial ? '#0284c7' : '#059669',
        wallWidth: calculatedWidth,
        fillColor: isSuperficial ? '#0284c7' : '#059669',
        fillWidth: Math.max(2, calculatedWidth - 2),
        lumenType: 'full_flow',
        lumenColor: isSuperficial ? '#38bdf8' : '#34d399',
        lumenWidth: Math.max(3, calculatedWidth - 4),
        statusText: 'Normal Patent',
        opacity: filterMode === 'abnormal_only' ? 0.3 : 0.95
      };
    }

    // Abnormal Status (Thrombus / Post-Thrombotic)
    const isSuperficial = category === 'superficial';
    const patency = finding.patency || 'completely_occluded';
    const chronicity = finding.chronicity;

    const isChronic = chronicity === 'chronic_post_thrombotic';
    const isIndeterminate = chronicity === 'indeterminate' || patency === 'indeterminate';

    let wallColor = '#dc2626'; // Deep DVT Red
    let fillColor = '#be123c';
    let fillPatternUrl: string | undefined = undefined;

    if (isSuperficial) {
      wallColor = '#ea580c'; // SVT Orange
      fillColor = '#c2410c';
    } else if (isChronic) {
      wallColor = '#7e22ce'; // Purple
      fillColor = '#6b21a8';
    } else if (isIndeterminate) {
      wallColor = '#d97706'; // Amber
      fillColor = '#b45309';
    }

    let lumenType: 'full_flow' | 'none' | 'narrow_channel' | 'wide_residual' | 'recanalised_multi' | 'none_faint' = 'none';
    let lumenColor = '#22d3ee';
    let lumenWidth = 0;
    let wallDashArray: string | undefined = undefined;
    let showQuestionMark = false;

    if (isChronic) {
      wallDashArray = '6 3';
    }

    if (isIndeterminate) {
      fillPatternUrl = 'url(#crosshatch-amber)';
      showQuestionMark = true;
    }

    if (patency === 'completely_occluded') {
      lumenType = 'none';
      lumenWidth = 0;
      if (isSuperficial) {
        fillColor = '#ea580c';
      } else if (isChronic) {
        fillColor = '#7e22ce';
        fillPatternUrl = 'url(#hatch-purple)';
      } else {
        fillColor = '#be123c';
      }
    } else if (patency === 'mostly_occluded') {
      lumenType = 'narrow_channel';
      lumenWidth = 2.5;
      if (isSuperficial) {
        fillColor = '#ea580c';
      } else if (isChronic) {
        fillPatternUrl = 'url(#hatch-purple)';
      } else {
        fillColor = '#be123c';
      }
    } else if (patency === 'partially_occluded' || patency === 'patent') {
      lumenType = 'wide_residual';
      lumenWidth = Math.max(4, calculatedWidth - 6);
      if (isSuperficial) {
        fillPatternUrl = 'url(#hatch-orange)';
      } else if (isChronic) {
        fillPatternUrl = 'url(#hatch-purple)';
      } else if (!isIndeterminate) {
        fillPatternUrl = 'url(#hatch-red)';
      }
    } else if (patency === 'recanalised') {
      lumenType = 'recanalised_multi';
      lumenWidth = 1.8;
      lumenColor = '#22d3ee';
      if (isSuperficial) {
        fillPatternUrl = 'url(#hatch-orange)';
      } else if (isChronic) {
        fillPatternUrl = 'url(#hatch-purple)';
      } else {
        fillPatternUrl = 'url(#recanalised-pattern)';
      }
    }

    return {
      wallColor,
      wallDashArray,
      wallWidth: calculatedWidth + 2,
      fillPatternUrl,
      fillColor,
      fillWidth: calculatedWidth - 1,
      lumenType,
      lumenColor,
      lumenWidth,
      showQuestionMark,
      statusText: isSuperficial
        ? `Superficial Thrombus (${patency.replace(/_/g, ' ')})`
        : isChronic
        ? `Chronic Change (${patency.replace(/_/g, ' ')})`
        : isIndeterminate
        ? `Indeterminate DVT (${patency.replace(/_/g, ' ')})`
        : `DVT (${patency.replace(/_/g, ' ')})`,
      opacity: 1.0
    };
  };

  // Render a clickable vessel segment component with multi-selection badge support & 2-click thrombus modal
  const renderVesselSegment = (
    id: string,
    vesselName: string,
    category: VesselCategory,
    pathD: string,
    isPaired: boolean = false,
    pairedPathD2?: string,
    labelPos?: { x: number; y: number; textAnchor?: 'start' | 'middle' | 'end' }
  ) => {
    const finding = vesselFindings[id];
    const isSelected = selectedVesselIds.includes(id);
    const isHovered = hoveredId === id;
    const visualSpecs = getVesselVisuals(id, category);

    if (filterMode === 'abnormal_only' && finding?.status !== 'abnormal') {
      return null;
    }

    const renderPathStack = (d: string, keySuffix: string = '') => (
      <g key={`${id}_paths${keySuffix}`}>
        {/* Glow halo when selected or hovered */}
        {(isSelected || isHovered) && (
          <path
            d={d}
            stroke={isSelected ? '#38bdf8' : '#60a5fa'}
            strokeWidth={visualSpecs.wallWidth + 8}
            strokeLinecap="round"
            fill="none"
            opacity={isSelected ? 0.65 : 0.4}
            className="animate-pulse"
          />
        )}

        {/* Layer 1: Outer Wall */}
        <path
          d={d}
          stroke={isSelected ? '#38bdf8' : visualSpecs.wallColor}
          strokeWidth={visualSpecs.wallWidth}
          strokeDasharray={visualSpecs.wallDashArray}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={visualSpecs.opacity}
        />

        {/* Layer 2: Fill / Thrombus Pattern Layer */}
        {(visualSpecs.fillPatternUrl || visualSpecs.fillColor) && (
          <path
            d={d}
            stroke={visualSpecs.fillPatternUrl ? visualSpecs.fillPatternUrl : visualSpecs.fillColor}
            strokeWidth={visualSpecs.fillWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={visualSpecs.opacity}
          />
        )}

        {/* Layer 3: Internal Flow Lumen Representation */}
        {visualSpecs.lumenType === 'full_flow' && (
          <path
            d={d}
            stroke={visualSpecs.lumenColor}
            strokeWidth={visualSpecs.lumenWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {visualSpecs.lumenType === 'narrow_channel' && (
          <path
            d={d}
            stroke={visualSpecs.lumenColor}
            strokeWidth={visualSpecs.lumenWidth}
            strokeLinecap="round"
            fill="none"
            className="animate-pulse"
          />
        )}

        {visualSpecs.lumenType === 'wide_residual' && (
          <path
            d={d}
            stroke={visualSpecs.lumenColor}
            strokeWidth={visualSpecs.lumenWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {visualSpecs.lumenType === 'recanalised_multi' && (
          <>
            <path
              d={d}
              stroke={visualSpecs.lumenColor}
              strokeWidth={1.8}
              strokeDasharray="8 4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={d}
              stroke="#67e8f9"
              strokeWidth={1.2}
              strokeDasharray="4 8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </g>
    );

    return (
      <g
        key={id}
        onClick={(e) => handleVesselClick(id, e)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onSelectVessel(id);
          if (onOpenDetailModal) {
            onOpenDetailModal(id);
          }
        }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        className="cursor-pointer group transition-all duration-150"
      >
        {/* Transparent wide touch/mouse hit area for easy 1-click interaction */}
        <path
          d={pathD}
          stroke="transparent"
          strokeWidth={Math.max(34, visualSpecs.wallWidth + 18)}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="pointer-events-stroke"
        />
        {isPaired && pairedPathD2 && (
          <path
            d={pairedPathD2}
            stroke="transparent"
            strokeWidth={Math.max(34, visualSpecs.wallWidth + 18)}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="pointer-events-stroke"
          />
        )}

        {/* Primary and Paired Vessel Path Stacks */}
        {renderPathStack(pathD, '_p1')}
        {isPaired && pairedPathD2 && renderPathStack(pairedPathD2, '_p2')}

        {/* Question Mark Badge for Indeterminate Age */}
        {visualSpecs.showQuestionMark && labelPos && (
          <g transform={`translate(${labelPos.x}, ${labelPos.y - 18})`}>
            <circle r="9" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" className="shadow-lg" />
            <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">?</text>
          </g>
        )}

        {/* Multi-Selection Checkmark Badge on SVG */}
        {isSelected && labelPos && !visualSpecs.showQuestionMark && (
          <g transform={`translate(${labelPos.x}, ${labelPos.y - 14})`}>
            <circle
              r="7"
              fill="#0284c7"
              stroke="#38bdf8"
              strokeWidth="1.5"
              className="animate-bounce"
            />
            <path
              d="M-3,-0.5 L-1,1.5 L3,-2"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        )}

        {/* Landmark Text Tag for Extents */}
        {finding?.status === 'abnormal' && labelPos && (showTextLabels || isHovered) && (
          <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
            {(() => {
              const { proxText, distText } = formatExtentLabel(finding);
              const tagText = proxText || distText || visualSpecs.statusText;
              return (
                <g className="no-print">
                  <rect
                    x={labelPos.textAnchor === 'end' ? -135 : -5}
                    y="-12"
                    width="140"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={visualSpecs.wallColor}
                    strokeWidth="1"
                  />
                  <text
                    x={labelPos.textAnchor === 'end' ? -10 : 5}
                    y="0"
                    textAnchor={labelPos.textAnchor || 'start'}
                    fill="#f87171"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {tagText}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* Anatomical Text Descriptor */}
        {labelPos && finding?.status !== 'abnormal' && (showTextLabels || isHovered) && (
          <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
            <rect
              x={labelPos.textAnchor === 'end' ? -105 : -4}
              y="-10"
              width="110"
              height="15"
              rx="3"
              fill="#0f172a"
              fillOpacity="0.85"
              stroke={isSelected ? '#38bdf8' : isHovered ? '#14b8a6' : '#334155'}
              strokeWidth="0.8"
            />
            <text
              x={labelPos.textAnchor === 'end' ? -8 : 4}
              y="1"
              textAnchor={labelPos.textAnchor || 'start'}
              fill={isSelected ? '#38bdf8' : isHovered ? '#f1f5f9' : '#cbd5e1'}
              fontSize="9"
              fontWeight={isSelected || isHovered ? 'bold' : '500'}
              className="pointer-events-none"
            >
              {vesselName}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl flex flex-col h-full relative">
      {/* Top Map Toolbar & Multi-Select Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-slate-100 tracking-wide uppercase text-xs">
            Interactive Vascular Map
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            (Click vessels to inspect or edit)
          </span>
        </div>

        {/* Display & Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Click Action Mode Selector */}
          <button
            type="button"
            onClick={() =>
              setClickMode((prev) => (prev === 'toggle_abnormal' ? 'select_only' : 'toggle_abnormal'))
            }
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
              clickMode === 'toggle_abnormal'
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md shadow-rose-950/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Clicking a segment on the diagram directly toggles its DVT abnormality highlight"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Click Action:</span>
            <span className="font-bold">
              {clickMode === 'toggle_abnormal' ? 'Toggle DVT Highlight' : 'Select Only'}
            </span>
          </button>

          {/* Text Descriptors Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTextLabels(!showTextLabels)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
              showTextLabels
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle written text descriptors (pfv, prox fv, etc.) on the diagram"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Text Descriptors:</span>
            <span className="font-bold">{showTextLabels ? 'ON' : 'OFF (Graphical)'}</span>
          </button>

          {/* Multi-Select Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              if (!isMultiSelectMode && selectedVesselIds.length === 0 && selectedVesselId) {
                setSelectedVesselIds([selectedVesselId]);
              }
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
              isMultiSelectMode
                ? 'bg-sky-950 text-sky-300 border-sky-600 shadow-md shadow-sky-950'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-Select:</span>
            <span className="font-bold">{isMultiSelectMode ? 'ON' : 'OFF'}</span>
            {selectedVesselIds.length > 0 && (
              <span className="ml-1 bg-sky-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {selectedVesselIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all border ${
              showLandmarks
                ? 'bg-teal-950 text-teal-300 border-teal-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Landmarks: {showLandmarks ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterMode((prev) =>
                prev === 'all' ? 'abnormal_only' : prev === 'abnormal_only' ? 'routine' : 'all'
              )
            }
            className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Filter: {filterMode === 'all' ? 'All' : filterMode === 'abnormal_only' ? 'Abnormal' : 'Routine'}
          </button>

          <div className="flex items-center bg-slate-950 rounded border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-white border-l border-slate-800 ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Map Legend & Usage Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-[11px] mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400 inline-block animate-pulse"></span>
            <span className="font-semibold text-rose-300">Abnormal (DVT Highlighted)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 inline-block"></span>
            <span className="text-slate-300">Normal Patent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-300 inline-block"></span>
            <span className="text-slate-300">Selected Segment</span>
          </div>
        </div>
        <div className="text-slate-300 text-[11px] font-semibold flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-spin-slow" />
          <span><strong className="text-teal-300">1-Click:</strong> Highlight multiple DVT segments • <strong className="text-sky-300">2-Clicks / Double Click:</strong> Describe thrombus details</span>
        </div>
      </div>

      {/* Quick Group Selection Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1 flex items-center gap-1">
            <MousePointer className="w-3 h-3 text-teal-400" /> Select Group:
          </span>
          <button
            type="button"
            onClick={selectAllRightLeg}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] transition-colors"
          >
            Right Leg
          </button>
          <button
            type="button"
            onClick={selectAllLeftLeg}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] transition-colors"
          >
            Left Leg
          </button>
          <button
            type="button"
            onClick={selectAllCalfVeins}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] transition-colors"
          >
            Calf Veins
          </button>
          <button
            type="button"
            onClick={selectAllAbnormal}
            className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded border border-rose-800 text-[11px] transition-colors"
          >
            Abnormal Only
          </button>
          <button
            type="button"
            onClick={selectAllVessels}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px]"
          >
            Select All
          </button>
        </div>

        {selectedVesselIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBatchDrawer(!showBatchDrawer)}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Batch Edit Properties ({selectedVesselIds.length})</span>
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs"
            >
              Clear ({selectedVesselIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Multi-Vessel Batch Property Editor Drawer / Card */}
      {(showBatchDrawer || (selectedVesselIds.length > 1 && !showBatchDrawer)) && (
        <div className="mb-3 p-3.5 bg-slate-950 border border-sky-500/50 rounded-xl shadow-2xl text-xs space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin-slow" />
              <span className="font-bold text-sky-300 text-sm">
                Multi-Vessel Batch Editor ({selectedVesselIds.length} vessels selected)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowBatchDrawer(false)}
              className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selected Vessel Badges */}
          <div className="flex flex-wrap items-center gap-1.5 max-h-20 overflow-y-auto p-1.5 bg-slate-900 rounded border border-slate-800">
            {selectedVesselIds.map((vId) => {
              const finding = vesselFindings[vId];
              return (
                <span
                  key={vId}
                  className="px-2 py-0.5 rounded bg-sky-950 text-sky-200 border border-sky-800 font-medium text-[11px] flex items-center gap-1"
                >
                  {finding?.vesselName || vId}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedVesselIds((prev) => prev.filter((id) => id !== vId))
                    }
                    className="hover:text-rose-300 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          {/* Quick Status Action Buttons */}
          <div>
            <label className="block font-bold text-slate-300 text-[11px] mb-1 uppercase tracking-wider">
              1-Click Batch Status Override:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickBatchStatus('normal')}
                className="py-1.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold rounded text-center transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark Normal
              </button>
              <button
                type="button"
                onClick={() => handleQuickBatchStatus('abnormal')}
                className="py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold rounded text-center transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Mark Abnormal (DVT)
              </button>
              <button
                type="button"
                onClick={() => handleQuickBatchStatus('not_visualised')}
                className="py-1.5 px-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold rounded text-center transition-all flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Not Visualised
              </button>
              <button
                type="button"
                onClick={() => handleQuickBatchStatus('not_assessed')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold rounded text-center transition-all"
              >
                Not Assessed
              </button>
            </div>
          </div>

          {/* Detailed Batch Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            {/* Patency */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Set Patency:</label>
              <select
                value={batchPatency}
                onChange={(e) => setBatchPatency(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Unchanged --</option>
                <option value="completely_occluded">Completely Occluded</option>
                <option value="mostly_occluded">Mostly Occluded</option>
                <option value="partially_occluded">Partially Occluded</option>
                <option value="recanalised">Recanalised Channel</option>
                <option value="patent">Patent (Clear)</option>
              </select>
            </div>

            {/* Compressibility */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Set Compressibility:</label>
              <select
                value={batchCompressibility}
                onChange={(e) => setBatchCompressibility(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Unchanged --</option>
                <option value="non_compressible">Non-Compressible</option>
                <option value="partially_compressible">Partially Compressible</option>
                <option value="fully_compressible">Fully Compressible</option>
              </select>
            </div>

            {/* Chronicity */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Set Chronicity:</label>
              <select
                value={batchChronicity}
                onChange={(e) => setBatchChronicity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Unchanged --</option>
                <option value="acute_appearing">Acute-Appearing</option>
                <option value="subacute">Subacute</option>
                <option value="chronic_post_thrombotic">Chronic Post-Thrombotic</option>
                <option value="acute_on_chronic">Acute on Chronic</option>
              </select>
            </div>

            {/* Echogenicity */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Set Echogenicity:</label>
              <select
                value={batchEchogenicity}
                onChange={(e) => setBatchEchogenicity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Unchanged --</option>
                <option value="hypoechoic">Hypoechoic (Soft)</option>
                <option value="isoechoic">Isoechoic</option>
                <option value="hyperechoic">Hyperechoic (Bright/Dense)</option>
                <option value="heterogeneous">Heterogeneous</option>
                <option value="anechoic">Anechoic</option>
              </select>
            </div>
          </div>

          {/* Location & Extent Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Segment / Location Details (Applies to selected):
              </label>
              <input
                type="text"
                placeholder="e.g. Adductor canal segment, continuous extension near junction..."
                value={batchLocationDetails}
                onChange={(e) => setBatchLocationDetails(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  'Continuous across segments',
                  'Adductor canal segment',
                  'Proximal groin confluence',
                  'Free-floating tail',
                  'Isolated calf branch'
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setBatchLocationDetails(txt)}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700"
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Batch Description / Sonographer Notes:
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Continuous non-occlusive thrombus with mobile tail..."
                value={batchComments}
                onChange={(e) => setBatchComments(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyBatchEdit}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Apply to {selectedVesselIds.length} Vessels
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map & Permanent Compact Legend Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start flex-1 min-h-[680px]">
        {/* SVG Canvas Container (3 cols on lg screens) */}
        <div className="lg:col-span-3 relative h-full min-h-[680px] bg-slate-950/90 rounded-xl border border-slate-800 p-2 flex justify-center items-center overflow-auto shadow-inner">
          {/* Anatomical Direction Indicators */}
          <div className="absolute top-3 left-4 flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <ArrowUp className="w-3.5 h-3.5 text-teal-400" /> PROXIMAL (PROX)
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <ArrowDown className="w-3.5 h-3.5 text-teal-400" /> DISTAL (DIST)
          </div>

          {/* Limb Orientation Headers */}
          <div className="absolute top-3 left-1/4 -translate-x-1/2 bg-teal-950/80 border border-teal-800 text-teal-300 px-3 py-1 rounded-full text-xs font-bold shadow-md">
            RIGHT LOWER LIMB
          </div>
          <div className="absolute top-3 right-1/4 translate-x-1/2 bg-sky-950/80 border border-sky-800 text-sky-300 px-3 py-1 rounded-full text-xs font-bold shadow-md">
            LEFT LOWER LIMB
          </div>

          {/* SVG Map Canvas */}
          <div
            className="w-full h-full flex justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            <svg
              viewBox="0 0 900 1020"
              className="w-full h-full max-h-[950px]"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Red Diagonal Hatching for Partially Occluded DVT */}
                <pattern id="hatch-red" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#fee2e2" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#dc2626" strokeWidth="3" />
                  <line x1="4" y1="0" x2="4" y2="8" stroke="#ef4444" strokeWidth="2" />
                </pattern>

                {/* Orange Diagonal Hatching for Superficial Thrombus */}
                <pattern id="hatch-orange" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#ffedd5" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#ea580c" strokeWidth="3" />
                  <line x1="4" y1="0" x2="4" y2="8" stroke="#f97316" strokeWidth="2" />
                </pattern>

                {/* Purple Diagonal Hatching for Chronic Post-Thrombotic */}
                <pattern id="hatch-purple" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#f3e8ff" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#7e22ce" strokeWidth="3" />
                  <line x1="4" y1="0" x2="4" y2="8" stroke="#a855f7" strokeWidth="2" />
                </pattern>

                {/* Amber Cross-Hatched Grid for Indeterminate Age */}
                <pattern id="crosshatch-amber" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#fef3c7" />
                  <path d="M0,4 L8,4 M4,0 L4,8" stroke="#d97706" strokeWidth="2" />
                </pattern>

                {/* Recanalised Thrombus Pattern (Red/Purple with Channels) */}
                <pattern id="recanalised-pattern" width="10" height="10" patternTransform="rotate(30)" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill="#991b1b" />
                  <line x1="2" y1="0" x2="2" y2="10" stroke="#06b6d4" strokeWidth="1.5" />
                  <line x1="7" y1="0" x2="7" y2="10" stroke="#06b6d4" strokeWidth="1.5" />
                </pattern>
              </defs>

            {/* ANATOMICAL LANDMARK GUIDELINE ANNOTATIONS */}
            {showLandmarks && (
              <g className="landmarks-layer" opacity="0.85">
                {/* Groin Crease */}
                <line
                  x1="60"
                  y1={LANDMARK_Y.GROIN_CREASE}
                  x2="840"
                  y2={LANDMARK_Y.GROIN_CREASE}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <rect
                  x="70"
                  y={LANDMARK_Y.GROIN_CREASE - 10}
                  width="110"
                  height="18"
                  rx="3"
                  fill="#0f172a"
                  stroke="#334155"
                />
                <text
                  x="125"
                  y={LANDMARK_Y.GROIN_CREASE + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  GROIN CREASE
                </text>

                {/* SFJ Junction Line */}
                <line
                  x1="60"
                  y1={LANDMARK_Y.SFJ}
                  x2="840"
                  y2={LANDMARK_Y.SFJ}
                  stroke="#0284c7"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                />
                <text
                  x="830"
                  y={LANDMARK_Y.SFJ + 3}
                  textAnchor="end"
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  SFJ (Saphenofemoral Junction)
                </text>

                {/* Knee Crease */}
                <line
                  x1="60"
                  y1={LANDMARK_Y.KNEE_CREASE}
                  x2="840"
                  y2={LANDMARK_Y.KNEE_CREASE}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <rect
                  x="70"
                  y={LANDMARK_Y.KNEE_CREASE - 10}
                  width="130"
                  height="18"
                  rx="3"
                  fill="#0f172a"
                  stroke="#334155"
                />
                <text
                  x="135"
                  y={LANDMARK_Y.KNEE_CREASE + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  KNEE CREASE (Popliteal)
                </text>

                {/* SPJ Junction Line */}
                <line
                  x1="60"
                  y1={LANDMARK_Y.SPJ}
                  x2="840"
                  y2={LANDMARK_Y.SPJ}
                  stroke="#0284c7"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                />
                <text
                  x="830"
                  y={LANDMARK_Y.SPJ + 3}
                  textAnchor="end"
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  SPJ (Saphenopopliteal Junction)
                </text>

                {/* Ankle Crease */}
                <line
                  x1="60"
                  y1={LANDMARK_Y.ANKLE}
                  x2="840"
                  y2={LANDMARK_Y.ANKLE}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <rect
                  x="70"
                  y={LANDMARK_Y.ANKLE - 10}
                  width="110"
                  height="18"
                  rx="3"
                  fill="#0f172a"
                  stroke="#334155"
                />
                <text
                  x="125"
                  y={LANDMARK_Y.ANKLE + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ANKLE CREASE
                </text>
              </g>
            )}

            {/* MUSCLE BELLY SHADED OUTLINES */}
            <path
              d="M210,580 C180,620 180,720 220,770 C280,780 340,750 350,680 C360,610 320,570 210,580 Z"
              fill="#064e3b"
              fillOpacity="0.15"
              stroke="#047857"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x="185" y="660" fill="#059669" fontSize="9" fontWeight="bold" opacity="0.8">
              R Gastroc Muscle
            </text>

            <path
              d="M690,580 C720,620 720,720 680,770 C620,780 560,750 550,680 C540,610 580,570 690,580 Z"
              fill="#064e3b"
              fillOpacity="0.15"
              stroke="#047857"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x="715" y="660" fill="#059669" fontSize="9" fontWeight="bold" opacity="0.8">
              L Gastroc Muscle
            </text>

            {/* CENTRAL & PELVIC VEINS */}
            {renderVesselSegment(
              'pelvis_IVC',
              'Inferior Vena Cava (IVC)',
              'pelvis',
              'M450,60 L450,150',
              false,
              undefined,
              { x: 450, y: 105, textAnchor: 'middle' }
            )}

            {renderVesselSegment(
              'right_CIV',
              'Right Common Iliac',
              'pelvis',
              'M450,150 L340,210',
              false,
              undefined,
              { x: 380, y: 170, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_CIV',
              'Left Common Iliac',
              'pelvis',
              'M450,150 L560,210',
              false,
              undefined,
              { x: 520, y: 170, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_IIV',
              'Right Internal Iliac',
              'pelvis',
              'M380,180 L410,230',
              false,
              undefined,
              { x: 415, y: 225, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'left_IIV',
              'Left Internal Iliac',
              'pelvis',
              'M520,180 L490,230',
              false,
              undefined,
              { x: 485, y: 225, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'right_EIV',
              'Right External Iliac',
              'pelvis',
              `M340,210 L290,${LANDMARK_Y.GROIN_CREASE}`,
              false,
              undefined,
              { x: 300, y: 225, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_EIV',
              'Left External Iliac',
              'pelvis',
              `M560,210 L610,${LANDMARK_Y.GROIN_CREASE}`,
              false,
              undefined,
              { x: 600, y: 225, textAnchor: 'start' }
            )}

            {/* RIGHT LOWER LIMB VEINS */}
            {renderVesselSegment(
              'right_CFV',
              'Right CFV',
              'thigh',
              `M290,${LANDMARK_Y.GROIN_CREASE} L290,300`,
              false,
              undefined,
              { x: 275, y: 270, textAnchor: 'end' }
            )}

            <circle cx="290" cy={LANDMARK_Y.SFJ} r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

            {renderVesselSegment(
              'right_GSV_PROX',
              'Right Prox GSV',
              'superficial',
              `M290,${LANDMARK_Y.SFJ} C360,330 370,450 370,${LANDMARK_Y.KNEE_CREASE}`,
              false,
              undefined,
              { x: 360, y: 380, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_PFV',
              'Right PFV',
              'thigh',
              'M290,295 C230,320 220,410 230,480',
              false,
              undefined,
              { x: 220, y: 390, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'right_FV_PROX',
              'Right Prox FV',
              'thigh',
              'M290,300 L290,370',
              false,
              undefined,
              { x: 300, y: 335, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_FV_MID',
              'Right Mid FV',
              'thigh',
              'M290,370 L290,460',
              false,
              undefined,
              { x: 300, y: 415, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_FV_DIST',
              'Right Distal FV',
              'thigh',
              `M290,460 L290,530`,
              false,
              undefined,
              { x: 300, y: 495, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_POPV',
              'Right Popliteal',
              'popliteal',
              `M290,530 L290,${LANDMARK_Y.SPJ + 30}`,
              false,
              undefined,
              { x: 275, y: 575, textAnchor: 'end' }
            )}

            <circle cx="290" cy={LANDMARK_Y.SPJ} r="4.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

            {renderVesselSegment(
              'right_SSV',
              'Right SSV (SPJ)',
              'superficial',
              `M290,${LANDMARK_Y.SPJ} C260,640 260,760 270,860`,
              false,
              undefined,
              { x: 250, y: 720, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'right_TPTV',
              'Right TPTV',
              'calf_deep',
              `M290,${LANDMARK_Y.SPJ + 30} L290,660`,
              false,
              undefined,
              { x: 300, y: 640, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_PTV',
              'Right PTV (Paired)',
              'calf_deep',
              `M315,660 L335,${LANDMARK_Y.ANKLE}`,
              true,
              `M323,660 L343,${LANDMARK_Y.ANKLE}`,
              { x: 345, y: 800, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_PERV',
              'Right PerV (Paired)',
              'calf_deep',
              `M285,660 L285,${LANDMARK_Y.ANKLE}`,
              true,
              `M293,660 L293,${LANDMARK_Y.ANKLE}`,
              { x: 275, y: 800, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'right_ATV',
              'Right ATV (Paired)',
              'calf_deep',
              `M255,660 L235,${LANDMARK_Y.ANKLE}`,
              true,
              `M263,660 L243,${LANDMARK_Y.ANKLE}`,
              { x: 225, y: 800, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'right_MGV',
              'Right MGV',
              'muscular_calf',
              'M300,600 C340,630 350,710 325,750',
              true,
              'M306,600 C346,630 356,710 331,750',
              { x: 360, y: 680, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_LGV',
              'Right LGV',
              'muscular_calf',
              'M280,600 C240,630 230,710 255,750',
              true,
              'M274,600 C234,630 224,710 249,750',
              { x: 215, y: 680, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'right_SV',
              'Right Soleal V',
              'muscular_calf',
              'M290,680 C320,710 320,780 295,830',
              true,
              'M298,680 C328,710 328,780 303,830',
              { x: 330, y: 760, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'right_GSV_CALF',
              'Right Calf GSV',
              'superficial',
              `M370,${LANDMARK_Y.KNEE_CREASE} C385,680 380,820 370,${LANDMARK_Y.ANKLE}`,
              false,
              undefined,
              { x: 385, y: 760, textAnchor: 'start' }
            )}

            {/* LEFT LOWER LIMB VEINS */}
            {renderVesselSegment(
              'left_CFV',
              'Left CFV',
              'thigh',
              `M610,${LANDMARK_Y.GROIN_CREASE} L610,300`,
              false,
              undefined,
              { x: 625, y: 270, textAnchor: 'start' }
            )}

            <circle cx="610" cy={LANDMARK_Y.SFJ} r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

            {renderVesselSegment(
              'left_GSV_PROX',
              'Left Prox GSV',
              'superficial',
              `M610,${LANDMARK_Y.SFJ} C540,330 530,450 530,${LANDMARK_Y.KNEE_CREASE}`,
              false,
              undefined,
              { x: 520, y: 380, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_PFV',
              'Left PFV',
              'thigh',
              'M610,295 C670,320 680,410 670,480',
              false,
              undefined,
              { x: 680, y: 390, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'left_FV_PROX',
              'Left Prox FV',
              'thigh',
              'M610,300 L610,370',
              false,
              undefined,
              { x: 600, y: 335, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_FV_MID',
              'Left Mid FV',
              'thigh',
              'M610,370 L610,460',
              false,
              undefined,
              { x: 600, y: 415, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_FV_DIST',
              'Left Distal FV',
              'thigh',
              `M610,460 L610,530`,
              false,
              undefined,
              { x: 600, y: 495, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_POPV',
              'Left Popliteal',
              'popliteal',
              `M610,530 L610,${LANDMARK_Y.SPJ + 30}`,
              false,
              undefined,
              { x: 625, y: 575, textAnchor: 'start' }
            )}

            <circle cx="610" cy={LANDMARK_Y.SPJ} r="4.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

            {renderVesselSegment(
              'left_SSV',
              'Left SSV (SPJ)',
              'superficial',
              `M610,${LANDMARK_Y.SPJ} C640,640 640,760 630,860`,
              false,
              undefined,
              { x: 650, y: 720, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'left_TPTV',
              'Left TPTV',
              'calf_deep',
              `M610,${LANDMARK_Y.SPJ + 30} L610,660`,
              false,
              undefined,
              { x: 600, y: 640, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_PTV',
              'Left PTV (Paired)',
              'calf_deep',
              `M585,660 L565,${LANDMARK_Y.ANKLE}`,
              true,
              `M577,660 L557,${LANDMARK_Y.ANKLE}`,
              { x: 555, y: 800, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_PERV',
              'Left PerV (Paired)',
              'calf_deep',
              `M615,660 L615,${LANDMARK_Y.ANKLE}`,
              true,
              `M607,660 L607,${LANDMARK_Y.ANKLE}`,
              { x: 625, y: 800, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'left_ATV',
              'Left ATV (Paired)',
              'calf_deep',
              `M645,660 L665,${LANDMARK_Y.ANKLE}`,
              true,
              `M637,660 L657,${LANDMARK_Y.ANKLE}`,
              { x: 675, y: 800, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'left_MGV',
              'Left MGV',
              'muscular_calf',
              'M600,600 C560,630 550,710 575,750',
              true,
              'M594,600 C554,630 544,710 569,750',
              { x: 540, y: 680, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_LGV',
              'Left LGV',
              'muscular_calf',
              'M620,600 C660,630 670,710 645,750',
              true,
              'M626,600 C666,630 676,710 651,750',
              { x: 685, y: 680, textAnchor: 'start' }
            )}

            {renderVesselSegment(
              'left_SV',
              'Left Soleal V',
              'muscular_calf',
              'M610,680 C580,710 580,780 605,830',
              true,
              'M602,680 C572,710 572,780 597,830',
              { x: 570, y: 760, textAnchor: 'end' }
            )}

            {renderVesselSegment(
              'left_GSV_CALF',
              'Left Calf GSV',
              'superficial',
              `M530,${LANDMARK_Y.KNEE_CREASE} C515,680 520,820 530,${LANDMARK_Y.ANKLE}`,
              false,
              undefined,
              { x: 515, y: 760, textAnchor: 'end' }
            )}
          </svg>
        </div>
      </div>

      {/* Permanent Compact Legend Sidebar (1 col on lg screens) */}
      <div className="lg:col-span-1 bg-slate-950/95 border border-slate-800 rounded-xl p-3 text-xs space-y-2 font-sans self-stretch overflow-y-auto max-h-[750px] shadow-xl">
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Venous Map Legend</h4>
            <p className="text-[10px] text-slate-400">Color = Category • Pattern = Lumen State</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <LegendSwatch
            title="Normal Patent Vein"
            subtitle="Green/teal, thin solid vessel, clear flow"
            wallColor="#059669"
            fillColor="#059669"
            lumenType="full_flow"
            lumenColor="#34d399"
          />
          <LegendSwatch
            title="Completely Occluded DVT"
            subtitle="Thick solid red, 100% occluded (no lumen)"
            wallColor="#dc2626"
            fillColor="#be123c"
            lumenType="none"
          />
          <LegendSwatch
            title="Mostly Occluded DVT"
            subtitle="Red segment, narrow central flow channel"
            wallColor="#dc2626"
            fillColor="#be123c"
            lumenType="narrow_channel"
            lumenColor="#22d3ee"
          />
          <LegendSwatch
            title="Partially Occluded DVT"
            subtitle="Diagonal red hatching, wide residual lumen"
            wallColor="#dc2626"
            fillPatternUrl="url(#hatch-red)"
            lumenType="wide_residual"
            lumenColor="#22d3ee"
          />
          <LegendSwatch
            title="Recanalised Thrombus"
            subtitle="Red/purple segment, multi-channel flow lines"
            wallColor="#be123c"
            fillPatternUrl="url(#recanalised-pattern)"
            lumenType="recanalised_multi"
            lumenColor="#22d3ee"
          />
          <LegendSwatch
            title="Chronic Post-Thrombotic"
            subtitle="Purple/grey, dashed border, hatched fill"
            wallColor="#7e22ce"
            wallDashArray="6 3"
            fillPatternUrl="url(#hatch-purple)"
            lumenType="wide_residual"
            lumenColor="#22d3ee"
          />
          <LegendSwatch
            title="Indeterminate Age"
            subtitle="Amber cross-hatched pattern with ? marker"
            wallColor="#d97706"
            wallDashArray="4 2"
            fillPatternUrl="url(#crosshatch-amber)"
            lumenType="wide_residual"
            showQuestionMark={true}
          />
          <LegendSwatch
            title="Superficial Thrombus (SVT)"
            subtitle="Orange patterned vessel, distinct from DVT"
            wallColor="#ea580c"
            fillPatternUrl="url(#hatch-orange)"
            lumenType="wide_residual"
            lumenColor="#22d3ee"
          />
          <LegendSwatch
            title="Not Visualised"
            subtitle="Grey dotted vessel"
            wallColor="#64748b"
            wallDashArray="3 3"
            lumenType="none_faint"
          />
          <LegendSwatch
            title="Not Assessed"
            subtitle="Very faint neutral outline"
            wallColor="#334155"
            wallDashArray="5 4"
            lumenType="none_faint"
          />
        </div>
      </div>
    </div>

      {/* Hover Inspection Popover Panel */}
      {hoveredFinding && (
        <div className="mt-3 p-3 bg-slate-950/95 border border-teal-500/60 rounded-xl shadow-2xl text-xs text-slate-100 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-teal-300">
                {hoveredFinding.vesselName}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  hoveredFinding.status === 'abnormal'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : hoveredFinding.status === 'normal'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hoveredFinding.status.replace(/_/g, ' ')}
              </span>
              {hoveredFinding.category && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {hoveredFinding.category.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Detailed Clinical Finding Parameters */}
            {hoveredFinding.status === 'abnormal' ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
                <span>
                  <strong className="text-slate-400">Patency:</strong>{' '}
                  <span className="text-rose-300 font-semibold">
                    {hoveredFinding.patency?.replace(/_/g, ' ') || 'thrombus present'}
                  </span>
                </span>
                <span>
                  <strong className="text-slate-400">Compressibility:</strong>{' '}
                  {hoveredFinding.compressibility?.replace(/_/g, ' ') || 'non-compressible'}
                </span>
                {hoveredFinding.chronicity && (
                  <span>
                    <strong className="text-slate-400">Chronicity:</strong>{' '}
                    <span className="text-purple-300">
                      {hoveredFinding.chronicity.replace(/_/g, ' ')}
                    </span>
                  </span>
                )}
                {hoveredFinding.echogenicity && (
                  <span>
                    <strong className="text-slate-400">Echogenicity:</strong>{' '}
                    {hoveredFinding.echogenicity.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Fully compressible with normal color Doppler lumen filling and phasic flow response.
              </p>
            )}

            {/* Extents */}
            {hoveredFinding.status === 'abnormal' && (
              <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-2">
                {(() => {
                  const { proxText, distText } = formatExtentLabel(hoveredFinding);
                  return (
                    <>
                      {proxText && <span>• Proximal: {proxText}</span>}
                      {distText && <span>• Distal: {distText}</span>}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Location details or Comments if available */}
            {hoveredFinding.locationDetails && (
              <div className="text-[11px] text-sky-300 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded inline-block">
                <strong>Location:</strong> {hoveredFinding.locationDetails}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => onSelectVessel(hoveredFinding.id)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
