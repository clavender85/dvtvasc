// Commercial-Grade Bidirectional Live Generated Report Preview Section
// Directly linked to central structured exam data & report generator
// Clean, single-summary section live preview panel

import React, { useState, useMemo, useEffect } from 'react';
import { ExamState, InteractiveSentence, VesselFinding } from '../types/dvt';
import { generateConcisePreviewData, formatOtherFindingDimensions } from '../utils/reportGenerator';
import {
  FileText,
  MousePointer,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
  const [hoveredSentId, setHoveredSentId] = useState<string | null>(null);

  // QA Review Mode ("REVIEW REPORT AGAINST MAP")
  const [isQaModeActive, setIsQaModeActive] = useState<boolean>(false);
  const [qaFindingIndex, setQaFindingIndex] = useState<number>(0);

  // Generate concise single summary preview live from central state
  const conciseData = useMemo(() => generateConcisePreviewData(state), [state]);

  // Comprehensive Clinical Consistency Engine for alert badge
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

    // Check 4: Other findings dimension mismatch in manually edited report
    if (isReportManuallyEdited && state.otherFindings) {
      state.otherFindings.forEach((of) => {
        const dimStr = formatOtherFindingDimensions(of);
        if (dimStr && state.summaryText && !state.summaryText.includes(dimStr)) {
          list.push({
            id: `dim-mismatch-${of.id}`,
            message: `Reported dimensions differ from worksheet measurements for ${of.side} ${of.type} (${dimStr}).`
          });
        }
      });
    }

    return list;
  }, [state.vesselFindings, state.otherFindings, state.summaryText, isReportManuallyEdited]);

  // Combined active selections
  const activeSelectedIds = useMemo(() => {
    const set = new Set<string>();
    if (selectedVesselId) set.add(selectedVesselId);
    selectedVesselIds.forEach((id) => set.add(id));
    return Array.from(set);
  }, [selectedVesselId, selectedVesselIds]);

  // Extract sentences with vessels for QA review mode
  const qaSentences = useMemo(() => {
    return conciseData.summarySentences.filter(
      (s) => s.sourceVesselIds && s.sourceVesselIds.length > 0 && s.category !== 'normal'
    );
  }, [conciseData.summarySentences]);

  // Handle sentence click -> highlight vessels & scroll up
  const handleSentenceClick = (sent: InteractiveSentence, shouldScroll: boolean = true) => {
    if (shouldScroll) {
      const workspaceEl = document.getElementById('anatomical-map-workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (!sent.sourceVesselIds || sent.sourceVesselIds.length === 0) return;

    if (sent.region === 'iliocaval' && onSwitchRegion) {
      onSwitchRegion('iliocaval');
    } else if (sent.region === 'right_lower_limb' && onSwitchRegion) {
      onSwitchRegion('right_lower_limb');
    } else if (sent.region === 'left_lower_limb' && onSwitchRegion) {
      onSwitchRegion('left_lower_limb');
    }

    if (sent.sourceVesselIds.length > 1 && onSelectGroup) {
      onSelectGroup(sent.sourceVesselIds);
    } else {
      onSelectVessel(sent.sourceVesselIds[0]);
    }
  };

  // QA Mode Stepper sync
  useEffect(() => {
    if (isQaModeActive && qaSentences.length > 0) {
      const current = qaSentences[qaFindingIndex];
      if (current && current.sourceVesselIds && current.sourceVesselIds.length > 0) {
        handleSentenceClick(current, true);
      }
    }
  }, [isQaModeActive, qaFindingIndex]);

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
              Live concise findings summary generated directly from anatomical worksheet inputs
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
            title="Sequentially highlight each key finding and show corresponding map anatomy"
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
              QA Mode: Reviewing Finding {qaSentences.length > 0 ? qaFindingIndex + 1 : 0} of {qaSentences.length}
            </span>
          </div>

          {qaSentences.length > 0 ? (
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
                disabled={qaFindingIndex >= qaSentences.length - 1}
                onClick={() => setQaFindingIndex((i) => Math.min(qaSentences.length - 1, i + 1))}
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

      {/* Single Summary Section View */}
      {isExpanded && (
        <div className="p-4 bg-slate-950/90 space-y-3">
          {/* Main Single Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-inner space-y-3">
            {/* Interactive Combined Summary Paragraph */}
            <div className="text-slate-100 text-xs sm:text-sm font-sans leading-relaxed space-x-1">
              {conciseData.summarySentences.map((sent) => {
                const hasVessels = sent.sourceVesselIds && sent.sourceVesselIds.length > 0;
                const isMatched =
                  hasVessels && sent.sourceVesselIds?.some((id) => activeSelectedIds.includes(id));
                const isHovered = hoveredSentId === sent.id;

                return (
                  <span
                    key={sent.id}
                    onMouseEnter={() => setHoveredSentId(sent.id)}
                    onMouseLeave={() => setHoveredSentId(null)}
                    onClick={() => handleSentenceClick(sent)}
                    className={`inline transition-all rounded px-1 py-0.5 cursor-pointer ${
                      isMatched
                        ? 'bg-sky-900/90 text-sky-100 font-semibold ring-1 ring-sky-400'
                        : isHovered
                        ? 'bg-slate-800 text-teal-300 font-medium underline decoration-teal-500'
                        : 'hover:bg-slate-800/80 hover:text-slate-100'
                    }`}
                    title={
                      hasVessels
                        ? `Linked Anatomy: ${getReadableSourceNames(sent.sourceVesselIds)}`
                        : undefined
                    }
                  >
                    {sent.text}{' '}
                  </span>
                );
              })}
            </div>

            {/* Optional Key Impression Line */}
            {conciseData.keyImpression && (
              <div
                onClick={() => {
                  if (conciseData.impressionVesselIds && conciseData.impressionVesselIds.length > 0) {
                    if (conciseData.impressionVesselIds.length > 1 && onSelectGroup) {
                      onSelectGroup(conciseData.impressionVesselIds);
                    } else {
                      onSelectVessel(conciseData.impressionVesselIds[0]);
                    }
                    const workspaceEl = document.getElementById('anatomical-map-workspace');
                    if (workspaceEl) workspaceEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`pt-2.5 border-t border-slate-800 flex items-start gap-2 cursor-pointer rounded p-1.5 transition-all ${
                  conciseData.hasPathology
                    ? 'bg-amber-950/40 border-amber-900/60 hover:bg-amber-900/50'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400 flex-shrink-0">
                  KEY IMPRESSION:
                </span>
                <span
                  className={`text-xs font-semibold ${
                    conciseData.hasPathology ? 'text-amber-300' : 'text-slate-200'
                  }`}
                >
                  "{conciseData.keyImpression}"
                </span>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions & Hint */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-teal-400" />
              <span>Click any sentence to highlight linked vessels on the anatomical map</span>
            </div>

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
        </div>
      )}
    </div>
  );
};
