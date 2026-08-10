// Comprehensive Prior Study Comparison Section Component

import React, { useState } from 'react';
import { ExamState, VesselComparison, PriorExamHeader, PriorExamRecord, PriorVesselFinding } from '../types/dvt';
import { PriorHeaderSection } from './PriorHeaderSection';
import { ThreeColumnWorkspace } from './ThreeColumnWorkspace';
import { SideBySideDiagramView } from './SideBySideDiagramView';
import { PriorManualEntryModal } from './PriorManualEntryModal';
import { buildVesselComparisons, generateIntervalComparisonSummary, getComparisonValidationWarnings } from '../utils/comparisonEngine';
import { GitCompare, LayoutGrid, Eye, FileText, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ComparisonSectionProps {
  state: ExamState;
  onChangeExamState: (nextState: ExamState) => void;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ state, onChangeExamState }) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'diagram'>('workspace');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Initialize comparisonState if undefined
  const cState = state.comparisonState || {
    header: {
      hasPriorExam: state.history.hasPreviousDvt === 'Yes',
      examDate: state.history.previousStudyDate || '2026-05-10',
      location: 'Same institution',
      imagesAvailable: 'Yes',
      comparisonSource: 'Previous worksheet data available',
      quality: 'Adequate for comparison',
      confidence: 'HIGH',
      anticoagulationStatus: state.history.anticoagulationDetails || 'Current anticoagulation'
    },
    priorFindings: {},
    thrombusGroups: [],
    priorTimeline: [],
    viewMode: '3column',
    filterMode: 'abnormal_or_changed_only',
    includeDiagramInPrint: true
  };

  // Header update handler
  const handleHeaderChange = (nextHeader: PriorExamHeader) => {
    const updatedState: ExamState = {
      ...state,
      comparisonState: {
        ...cState,
        header: nextHeader
      }
    };
    // Re-evaluate comparisons with updated header
    const nextComps = buildVesselComparisons(updatedState);
    onChangeExamState({
      ...updatedState,
      comparisons: nextComps
    });
  };

  // Import Structured Prior
  const handleImportStructuredPrior = (record: PriorExamRecord) => {
    const updatedState: ExamState = {
      ...state,
      comparisonState: {
        ...cState,
        header: {
          ...cState.header,
          hasPriorExam: true,
          examDate: record.examDate,
          location: (record.location as any) || 'Same institution',
          comparisonSource: 'Previous worksheet data available'
        },
        priorFindings: record.vesselFindings,
        activePriorExamId: record.id,
        priorTimeline: cState.priorTimeline.some((r) => r.id === record.id)
          ? cState.priorTimeline
          : [record, ...cState.priorTimeline]
      }
    };

    const nextComps = buildVesselComparisons(updatedState);
    onChangeExamState({
      ...updatedState,
      comparisons: nextComps
    });
  };

  // Manual Findings Save Handler
  const handleSaveManualPriorFindings = (findings: Record<string, PriorVesselFinding>) => {
    const updatedState: ExamState = {
      ...state,
      comparisonState: {
        ...cState,
        header: {
          ...cState.header,
          hasPriorExam: true,
          comparisonSource: 'Report reviewed only'
        },
        priorFindings: findings
      }
    };

    const nextComps = buildVesselComparisons(updatedState);
    onChangeExamState({
      ...updatedState,
      comparisons: nextComps
    });
  };

  // Clear Prior Study
  const handleClearPriorStudy = () => {
    const updatedState: ExamState = {
      ...state,
      comparisonState: {
        ...cState,
        header: {
          ...cState.header,
          hasPriorExam: false
        },
        priorFindings: {}
      },
      comparisons: []
    };
    onChangeExamState(updatedState);
  };

  // Auto-Calculate / Re-evaluate Comparisons
  const handleRefreshComparisons = () => {
    const nextComps = buildVesselComparisons(state);
    onChangeExamState({
      ...state,
      comparisons: nextComps
    });
  };

  // Confirm All Suggestions
  const handleConfirmAll = () => {
    const nextComps = state.comparisons.map((c) => ({ ...c, confirmed: true }));
    onChangeExamState({
      ...state,
      comparisons: nextComps
    });
  };

  // Comparisons change handler
  const handleComparisonsChange = (comps: VesselComparison[]) => {
    onChangeExamState({
      ...state,
      comparisons: comps
    });
  };

  // Get Validation Warnings
  const warnings = getComparisonValidationWarnings(state);

  return (
    <div className="space-y-5">
      {/* 1. Prior Examination Header & Systematic Config */}
      <PriorHeaderSection
        header={cState.header}
        onChangeHeader={handleHeaderChange}
        onImportStructuredPrior={handleImportStructuredPrior}
        onOpenManualEntryModal={() => setIsManualModalOpen(true)}
        onClearPriorStudy={handleClearPriorStudy}
        priorTimeline={cState.priorTimeline}
        activePriorExamId={cState.activePriorExamId}
        onSelectPriorTimelineExam={(examId) => {
          const found = cState.priorTimeline.find((r) => r.id === examId);
          if (found) handleImportStructuredPrior(found);
        }}
      />

      {/* Main Comparison Section (Visible when Prior Exam Available) */}
      {cState.header.hasPriorExam && (
        <div className="space-y-4">
          {/* Section Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('workspace')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  activeTab === 'workspace'
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                3-Column Comparison Workspace
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  activeTab === 'diagram'
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                Graphical Map Comparison
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefreshComparisons}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Recalculate interval changes from current vessel findings"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              Recalculate Comparisons
            </button>
          </div>

          {/* Clinical Validation Warnings Drawer */}
          {warnings.length > 0 && (
            <div className="p-4 bg-amber-950/80 border border-amber-800 rounded-2xl space-y-2 text-xs text-amber-200 shadow-md">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Clinical Comparison Logic Verification ({warnings.length} Alerts):
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                {warnings.map((w) => (
                  <li key={w.id} className="leading-relaxed">
                    <strong>{w.title}:</strong> {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Active Tab Body */}
          {activeTab === 'workspace' && (
            <ThreeColumnWorkspace
              state={state}
              onChangeComparisons={handleComparisonsChange}
              onConfirmAll={handleConfirmAll}
            />
          )}

          {activeTab === 'diagram' && <SideBySideDiagramView state={state} />}

          {/* Automated Comparison Summary Excerpt Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Generated Interval Comparison Report Text Preview:
              </span>
              <span className="text-[10px] font-bold text-teal-300 bg-teal-950 border border-teal-800 px-2.5 py-0.5 rounded-full">
                Auto-Synchronised
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {generateIntervalComparisonSummary(state)}
            </pre>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      <PriorManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        priorFindings={cState.priorFindings}
        onSavePriorFindings={handleSaveManualPriorFindings}
      />
    </div>
  );
};
