// Commercial-Grade Bidirectional Live Generated Report Preview Section
// Directly linked to central structured exam data & report generator

import React, { useState, useMemo, useEffect } from 'react';
import { ExamState, ReportBlock, VesselFinding } from '../types/dvt';
import { generateStructuredReportBlocks } from '../utils/reportGenerator';
import {
  FileText,
  MousePointer,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Edit3,
  MapPin,
  Filter,
  AlertCircle,
  SkipBack,
  SkipForward,
  X,
  ArrowUpRight
} from 'lucide-react';
import { VESSEL_NAME_MAP } from '../data/anatomyData';

interface ReportPreviewPanelProps {
  state: ExamState;
  selectedVesselId: string | null;
  selectedVesselIds?: string[];
  onSelectVessel: (vesselId: string) => void;
  onSelectGroup?: (vesselIds: string[]) => void;
  onOpenDetailModal?: (vesselId: string) => void;
  onSwitchRegion?: (region: 'iliocaval' | 'right_lower_limb' | 'left_lower_limb') => void;
  onNavigateToReportTab?: () => void;
  onNavigateToComparison?: () => void;
  isReportManuallyEdited?: boolean;
  onReviewChanges?: () => void;
  onRegenerateReport?: () => void;
}

export const ReportPreviewPanel: React.FC<ReportPreviewPanelProps> = ({
  state,
  selectedVesselId,
  selectedVesselIds = [],
  onSelectVessel,
  onSelectGroup,
  onOpenDetailModal,
  onSwitchRegion,
  onNavigateToReportTab,
  onNavigateToComparison,
  isReportManuallyEdited = false,
  onReviewChanges,
  onRegenerateReport
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [filterRelatedOnly, setFilterRelatedOnly] = useState<boolean>(false);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  // QA Review Mode ("REVIEW REPORT AGAINST MAP")
  const [isQaModeActive, setIsQaModeActive] = useState<boolean>(false);
  const [qaFindingIndex, setQaFindingIndex] = useState<number>(0);

  // Generate structured report blocks live from central state
  const blocks = useMemo(() => generateStructuredReportBlocks(state), [state]);

  // Comprehensive Clinical Consistency Engine
  const conflicts = useMemo(() => {
    const list: { id: string; vesselId?: string; message: string }[] = [];
    const findings = state.vesselFindings;

    // Check 1: Pathology vs "No DVT identified" contradiction
    const hasThrombus = Object.values(findings).some((rawF) => {
      const f = rawF as VesselFinding;
      return (
        f.status === 'abnormal' ||
        f.thrombusPresence === 'thrombus_present' ||
        f.compressibility === 'non_compressible' ||
        f.compressibility === 'partially_compressible'
      );
    });
    if (
      hasThrombus &&
      state.summaryText?.includes('No deep venous thrombosis is identified.') &&
      !state.summaryText?.includes('except')
    ) {
      list.push({
        id: 'dvt-conflict',
        message: 'Thrombus pathology documented in worksheet, but report states "No DVT identified".'
      });
    }

    // Check 2: Not visualised / Not assessed vessel declared normal
    Object.entries(findings).forEach(([vId, rawF]) => {
      const f = rawF as VesselFinding;
      if (
        (f.status === 'not_visualised' || f.status === 'not_assessed') &&
        f.compressibility === 'fully_compressible'
      ) {
        const cleanKey = vId.replace(/^(right_|left_|pelvis_)/, '');
        const vName = VESSEL_NAME_MAP[cleanKey] || cleanKey;
        list.push({
          id: `nv-conflict-${vId}`,
          vesselId: vId,
          message: `Vessel "${vName}" is marked "${
            f.status === 'not_visualised' ? 'Not Visualised' : 'Not Assessed'
          }" but recorded as fully compressible.`
        });
      }
    });

    // Check 3: Occluded vessel recorded with normal compressibility
    Object.entries(findings).forEach(([vId, rawF]) => {
      const f = rawF as VesselFinding;
      if (f.patency === 'completely_occluded' && f.compressibility === 'fully_compressible') {
        const cleanKey = vId.replace(/^(right_|left_|pelvis_)/, '');
        const vName = VESSEL_NAME_MAP[cleanKey] || cleanKey;
        list.push({
          id: `occl-conflict-${vId}`,
          vesselId: vId,
          message: `Vessel "${vName}" is marked as Completely Occluded, but recorded with fully compressible status.`
        });
      }
    });

    return list;
  }, [state.vesselFindings, state.summaryText]);

  // Extract abnormal / key findings for QA Review Mode
  const abnormalBlocks = useMemo(() => {
    return blocks.filter(
      (b) =>
        b.category === 'dvt' ||
        b.category === 'superficial' ||
        (b.sourceVesselIds && b.sourceVesselIds.length > 0 && b.section.includes('LOWER LIMB'))
    );
  }, [blocks]);

  // Combined active selections
  const activeSelectedIds = useMemo(() => {
    const set = new Set<string>();
    if (selectedVesselId) set.add(selectedVesselId);
    selectedVesselIds.forEach((id) => set.add(id));
    return Array.from(set);
  }, [selectedVesselId, selectedVesselIds]);

  // Handle Block Click -> Smooth Scroll Up + Select Anatomy on Map
  const handleBlockClick = (block: ReportBlock, shouldScroll: boolean = true) => {
    if (shouldScroll) {
      const workspaceEl = document.getElementById('anatomical-map-workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (!block.sourceVesselIds || block.sourceVesselIds.length === 0) return;

    // 1. Auto-switch region if needed
    if (block.region === 'iliocaval' && onSwitchRegion) {
      onSwitchRegion('iliocaval');
    } else if (block.region === 'right_lower_limb' && onSwitchRegion) {
      onSwitchRegion('right_lower_limb');
    } else if (block.region === 'left_lower_limb' && onSwitchRegion) {
      onSwitchRegion('left_lower_limb');
    }

    // 2. Select Source Vessel(s)
    if (block.sourceVesselIds.length > 1 && onSelectGroup) {
      onSelectGroup(block.sourceVesselIds);
    } else {
      onSelectVessel(block.sourceVesselIds[0]);
    }
  };

  // Double click block -> Open detail editor for source vessel
  const handleBlockDoubleClick = (block: ReportBlock) => {
    if (block.sourceVesselIds && block.sourceVesselIds.length > 0 && onOpenDetailModal) {
      onOpenDetailModal(block.sourceVesselIds[0]);
    }
  };

  // QA Mode Stepper sync
  useEffect(() => {
    if (isQaModeActive && abnormalBlocks.length > 0) {
      const current = abnormalBlocks[qaFindingIndex];
      if (current && current.sourceVesselIds && current.sourceVesselIds.length > 0) {
        handleBlockClick(current, true);
      }
    }
  }, [isQaModeActive, qaFindingIndex]);

  // Filter blocks based on user view choices
  const displayedBlocks = useMemo(() => {
    if (!filterRelatedOnly || activeSelectedIds.length === 0) {
      if (viewMode === 'compact') {
        return blocks.filter(
          (b) =>
            b.section.includes('IMPRESSION') ||
            b.category === 'dvt' ||
            b.category === 'superficial' ||
            b.category === 'limitation'
        );
      }
      return blocks;
    }

    return blocks.filter((b) =>
      b.sourceVesselIds?.some((vId) => activeSelectedIds.includes(vId))
    );
  }, [blocks, filterRelatedOnly, activeSelectedIds, viewMode]);

  // Helper to translate vessel IDs into human-readable anatomical names
  const getReadableSourceNames = (vesselIds?: string[]): string => {
    if (!vesselIds || vesselIds.length === 0) return '';
    return vesselIds
      .map((id) => {
        const cleanKey = id.replace(/^(right_|left_|pelvis_)/, '');
        return VESSEL_NAME_MAP[cleanKey] || cleanKey;
      })
      .slice(0, 4)
      .join(', ') + (vesselIds.length > 4 ? ` (+${vesselIds.length - 4} more)` : '');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all font-sans text-xs">
      {/* Top Main Section Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-teal-950 text-teal-400 border border-teal-800/80 p-2 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-teal-300" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-slate-100 uppercase">
                GENERATED FINDINGS PREVIEW
              </span>

              {/* Status Badges */}
              {conflicts.length > 0 ? (
                <span className="bg-rose-950/90 text-rose-300 border border-rose-700/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>REPORT / WORKSHEET CONFLICT DETECTED ({conflicts.length})</span>
                </span>
              ) : isReportManuallyEdited ? (
                <span className="bg-amber-950/90 text-amber-300 border border-amber-700/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>WORKSHEET CHANGED — REPORT REVIEW REQUIRED</span>
                </span>
              ) : (
                <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SYNCHRONISED WITH WORKSHEET</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live structured report generated directly from anatomical worksheet inputs
            </p>
          </div>
        </div>

        {/* Header Control Buttons */}
        <div className="flex items-center gap-2">
          {/* QA Review Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsQaModeActive(!isQaModeActive);
              setQaFindingIndex(0);
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border shadow-sm ${
              isQaModeActive
                ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                : 'bg-slate-800 text-amber-300 border-amber-800/60 hover:bg-slate-700'
            }`}
            title="Sequentially highlight each abnormal finding and show corresponding map anatomy"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isQaModeActive ? 'QA Reviewing...' : 'REVIEW REPORT AGAINST MAP'}</span>
          </button>

          {/* Open Full Report Page Link */}
          {onNavigateToReportTab && (
            <button
              type="button"
              onClick={onNavigateToReportTab}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-teal-950 hover:bg-teal-900 border border-teal-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              title="Open full Report page for final review and sign-off"
            >
              <span>OPEN FULL REPORT</span>
              <ArrowUpRight className="w-4 h-4 text-teal-300" />
            </button>
          )}

          {/* Expand / Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            title={isExpanded ? 'Collapse Report Preview' : 'Expand Report Preview'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Clinical Conflict Alert Banner */}
      {conflicts.length > 0 && (
        <div className="bg-rose-950/80 border-b border-rose-800 p-3 px-4 text-xs text-rose-100">
          <div className="flex items-center justify-between gap-2 mb-1.5 font-bold text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Report Consistency Conflicts Detected:</span>
            </div>
            <span className="text-[10px] bg-rose-900 px-2 py-0.5 rounded text-rose-200 uppercase font-mono">
              Action Needed
            </span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-rose-200/90 text-xs">
            {conflicts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span>{c.message}</span>
                {c.vesselId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (c.vesselId) {
                        onSelectVessel(c.vesselId);
                        const workspaceEl = document.getElementById('anatomical-map-workspace');
                        if (workspaceEl) workspaceEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-100 border border-rose-700 rounded text-[10px] font-bold flex-shrink-0"
                  >
                    Review Vessel
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Manual Editing Review Banner */}
      {isReportManuallyEdited && conflicts.length === 0 && (
        <div className="bg-amber-950/60 border-b border-amber-800/80 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Worksheet findings have changed since the report was manually edited.</span>
          </div>
          <div className="flex items-center gap-2">
            {onReviewChanges && (
              <button
                type="button"
                onClick={onReviewChanges}
                className="px-2.5 py-1 bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700 rounded font-bold text-[11px]"
              >
                Review Changes
              </button>
            )}
            {onRegenerateReport && (
              <button
                type="button"
                onClick={onRegenerateReport}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-[11px] shadow"
              >
                Regenerate Report
              </button>
            )}
          </div>
        </div>
      )}

      {/* QA Review Mode Stepper Bar */}
      {isQaModeActive && (
        <div className="p-3 bg-amber-950/50 border-b border-amber-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-200 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="font-bold uppercase tracking-wider">
              QA Mode: Reviewing Finding {abnormalBlocks.length > 0 ? qaFindingIndex + 1 : 0} of {abnormalBlocks.length}
            </span>
          </div>

          {abnormalBlocks.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={qaFindingIndex === 0}
                onClick={() => setQaFindingIndex((i) => Math.max(0, i - 1))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded font-bold flex items-center gap-1"
              >
                <SkipBack className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                type="button"
                disabled={qaFindingIndex >= abnormalBlocks.length - 1}
                onClick={() => setQaFindingIndex((i) => Math.min(abnormalBlocks.length - 1, i + 1))}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded font-bold flex items-center gap-1 shadow-md"
              >
                Next
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsQaModeActive(false)}
                className="p-1 text-slate-400 hover:text-white"
                title="Exit QA Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic">No abnormal findings to review</span>
          )}
        </div>
      )}

      {/* Main Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-slate-950/90 max-h-[500px] overflow-y-auto">
          {/* Sub-toolbar: View Modes & Active Selection Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  viewMode === 'full'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FULL REPORT PREVIEW
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  viewMode === 'compact'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                KEY FINDINGS ONLY
              </button>
            </div>

            {/* Filter Related Only Toggle */}
            {activeSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterRelatedOnly(!filterRelatedOnly)}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all border ${
                  filterRelatedOnly
                    ? 'bg-sky-950 text-sky-300 border-sky-700 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span>Show Selected Anatomy Findings Only ({activeSelectedIds.length})</span>
              </button>
            )}

            <span className="text-slate-400 text-xs italic hidden sm:inline">
              Single-click sentence to show on map | Double-click sentence to edit vessel details
            </span>
          </div>

          {/* Render Structured Report Blocks */}
          {displayedBlocks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">
              No matching report findings found for current filter.
            </div>
          ) : (
            displayedBlocks.map((block) => {
              const hasVessels = block.sourceVesselIds && block.sourceVesselIds.length > 0;
              const isSourceMatched =
                hasVessels &&
                block.sourceVesselIds?.some((vId) => activeSelectedIds.includes(vId));
              const isHovered = hoveredBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onMouseEnter={() => setHoveredBlockId(block.id)}
                  onMouseLeave={() => setHoveredBlockId(null)}
                  onClick={() => handleBlockClick(block, true)}
                  onDoubleClick={() => handleBlockDoubleClick(block)}
                  className={`p-3.5 rounded-lg border transition-all relative ${
                    isSourceMatched
                      ? 'bg-sky-950/80 border-sky-500 shadow-xl ring-2 ring-sky-500/50'
                      : isHovered
                      ? 'bg-slate-850 border-teal-600/80 cursor-pointer shadow-md'
                      : hasVessels
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer'
                      : 'bg-slate-900/50 border-slate-800/60 text-slate-300'
                  }`}
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                        {block.section}
                      </span>
                      {block.category === 'dvt' && (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800/80 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          PATHOLOGY
                        </span>
                      )}
                      {block.category === 'limitation' && (
                        <span className="bg-amber-950/80 text-amber-400 border border-amber-800/80 text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          LIMITATION
                        </span>
                      )}
                      {isSourceMatched && (
                        <span className="bg-sky-900 text-sky-200 border border-sky-600 text-[9px] font-bold px-1.5 py-0.2 rounded animate-pulse">
                          ACTIVE MAP MATCH
                        </span>
                      )}
                    </div>

                    {/* Source Anatomy Badge */}
                    {hasVessels && (
                      <span
                        className="text-[10px] font-bold text-slate-400 hover:text-teal-300 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                        title={`Source Anatomy: ${getReadableSourceNames(block.sourceVesselIds)}`}
                      >
                        <MousePointer className="w-3 h-3 text-teal-400" />
                        <span>Source ({block.sourceVesselIds?.length})</span>
                      </span>
                    )}
                  </div>

                  {/* Report Block Wording */}
                  <div className="whitespace-pre-wrap font-mono text-slate-100 text-xs leading-relaxed">
                    {block.text}
                  </div>

                  {/* Hover Bar showing Source Vessels & Contextual Actions */}
                  {isHovered && hasVessels && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-sans">
                      <div className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span>
                          Source Vessel(s):{' '}
                          <strong className="text-teal-300 font-semibold">
                            {getReadableSourceNames(block.sourceVesselIds)}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlockClick(block, true);
                          }}
                          className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 rounded font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3 h-3" />
                          SHOW ON MAP
                        </button>

                        {onOpenDetailModal && block.sourceVesselIds && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetailModal(block.sourceVesselIds![0]);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded font-bold flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-slate-400" />
                            Edit Finding
                          </button>
                        )}

                        {block.category === 'comparison' && onNavigateToComparison && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToComparison();
                            }}
                            className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 rounded font-bold"
                          >
                            VIEW COMPARISON
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Bottom Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-sans text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsQaModeActive(true);
                  setQaFindingIndex(0);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>REVIEW REPORT AGAINST MAP</span>
              </button>
            </div>

            {onNavigateToReportTab && (
              <button
                type="button"
                onClick={onNavigateToReportTab}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <span>OPEN FULL REPORT</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
