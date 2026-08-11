// Automated Sonographer Summary & Report Finalisation View with Data Integrity Engine

import React, { useState } from 'react';
import { ExamState, ValidationAlert } from '../types/dvt';
import { generateSonographerSummary, generateStructuredReportBlocks } from '../utils/reportGenerator';
import { ReviewChangesModal } from './ReviewChangesModal';
import {
  Copy,
  RefreshCw,
  Printer,
  AlertTriangle,
  ShieldCheck,
  CheckSquare,
  Square,
  CheckCircle2,
  FileSearch,
  ArrowLeft,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface ReportSummaryViewProps {
  state: ExamState;
  summaryText: string;
  onChangeSummaryText: (text: string) => void;
  onRegenerateSummary: () => void;
  onCopySummary: () => void;
  onPrintWorksheet: () => void;
  alerts: ValidationAlert[];
  sonographerSignOff: boolean;
  onToggleSignOff: (signed: boolean) => void;
  onSelectVessel?: (vesselId: string) => void;
  onBackToWorksheet?: () => void;
}

export const ReportSummaryView: React.FC<ReportSummaryViewProps> = ({
  state,
  summaryText,
  onChangeSummaryText,
  onRegenerateSummary,
  onCopySummary,
  onPrintWorksheet,
  alerts,
  sonographerSignOff,
  onToggleSignOff,
  onSelectVessel,
  onBackToWorksheet
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'text' | 'blocks'>('text');

  // Compute live fresh summary directly from current worksheet state
  const liveFreshSummary = generateSonographerSummary(state);
  const isSynchronized = liveFreshSummary.trim() === summaryText.trim();
  const blocks = generateStructuredReportBlocks(state);

  const errors = alerts.filter((a) => a.severity === 'error');
  const reviews = alerts.filter((a) => a.severity === 'warning');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100 p-5 space-y-5">
      {/* Top Breadcrumb & Back Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span>DVT WORKSHEET</span>
          <span>›</span>
          <span className="font-bold text-teal-400">Sonographer Summary & Final Report</span>
        </div>
        {onBackToWorksheet && (
          <button
            onClick={onBackToWorksheet}
            className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← BACK TO WORKSHEET</span>
          </button>
        )}
      </div>

      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              STRUCTURED SONOGRAPHER FINDINGS SUMMARY
            </h2>

            {/* Requirement 31: Report Data Integrity Indicator */}
            {isSynchronized ? (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ✓ REPORT SYNCHRONISED WITH WORKSHEET
              </span>
            ) : (
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ⚠ WORKSHEET CHANGED — REPORT REVIEW REQUIRED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatically converted from entered examination observations into structured vascular report formatting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {!isSynchronized && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors"
              title="Compare fresh worksheet output with manual edits"
            >
              <FileSearch className="w-3.5 h-3.5 text-amber-300" />
              Review Changes
            </button>
          )}

          <button
            onClick={onRegenerateSummary}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
            title="Reset text to freshly generated structured output"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            Regenerate Report
          </button>

          <button
            onClick={onCopySummary}
            disabled={!sonographerSignOff}
            className={`font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors ${
              sonographerSignOff
                ? 'bg-teal-700 hover:bg-teal-600 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70'
            }`}
            title={sonographerSignOff ? 'Copy structured summary to clipboard' : 'Complete Sonographer Review Sign-off to enable export'}
          >
            <Copy className="w-3.5 h-3.5" />
            Copy to Clipboard
          </button>

          <button
            onClick={onPrintWorksheet}
            disabled={!sonographerSignOff}
            className={`font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors ${
              sonographerSignOff
                ? 'bg-indigo-700 hover:bg-indigo-600 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70'
            }`}
            title={sonographerSignOff ? 'Print official worksheet PDF' : 'Complete Sonographer Review Sign-off to enable printing'}
          >
            <Printer className="w-3.5 h-3.5" />
            Print Worksheet / PDF
          </button>
        </div>
      </div>

      {/* Manual Edit Protection Warning Banner */}
      {!isSynchronized && (
        <div className="p-3.5 bg-amber-950/90 border border-amber-800 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-100">Worksheet findings have changed since report text was modified.</span>
              <p className="text-[11px] text-amber-300/90 mt-0.5">
                Worksheet observations do not match the current report text. Review the changes or regenerate the report.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
            >
              Review Changes
            </button>
            <button
              onClick={onRegenerateSummary}
              className="bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
            >
              Regenerate Report
            </button>
          </div>
        </div>
      )}

      {/* EXAMINATION REVIEW Section (Requirement 25) */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>EXAMINATION REVIEW</span>
          </div>
          {errors.length === 0 && reviews.length === 0 && (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              ✓ Examination review complete — no inconsistencies detected
            </span>
          )}
        </div>

        {errors.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-rose-400 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Contradictions Detected ({errors.length}):</span>
            </div>
            {errors.map((err) => (
              <div key={err.id} className="p-2 bg-rose-950/70 border border-rose-800/80 rounded-lg flex items-center justify-between text-rose-200">
                <span>• <strong>{err.title}:</strong> {err.message}</span>
                {err.actionVesselId && onSelectVessel && (
                  <button
                    onClick={() => onSelectVessel(err.actionVesselId!)}
                    className="bg-rose-900 hover:bg-rose-800 text-rose-100 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Fix In Worksheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Clinical Prompts ({reviews.length}):</span>
            </div>
            {reviews.map((rev) => (
              <div key={rev.id} className="p-2 bg-amber-950/60 border border-amber-800/70 rounded-lg flex items-center justify-between text-amber-200">
                <span>• <strong>{rev.title}:</strong> {rev.message}</span>
                {rev.actionVesselId && onSelectVessel && (
                  <button
                    onClick={() => onSelectVessel(rev.actionVesselId!)}
                    className="bg-amber-900 hover:bg-amber-800 text-amber-100 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Go to Vessel</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Toggle Mode: Plain Text vs Interactive Blocks */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'text'
                ? 'bg-teal-950 text-teal-300 border border-teal-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Text Editor
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'blocks'
                ? 'bg-teal-950 text-teal-300 border border-teal-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            Interactive Traceable Blocks ({blocks.length})
          </button>
        </div>

        {activeTab === 'blocks' && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <MousePointer className="w-3 h-3 text-teal-400" />
            Click any block to highlight target source anatomy
          </span>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'text' ? (
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Structured Report Text (Editable)
          </label>
          <textarea
            rows={18}
            value={summaryText}
            onChange={(e) => onChangeSummaryText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono leading-relaxed text-slate-100 focus:outline-none focus:border-teal-500 shadow-inner"
          />
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs leading-relaxed">
          {blocks.map((block) => {
            const hasVessels = block.sourceVesselIds && block.sourceVesselIds.length > 0;

            return (
              <div
                key={block.id}
                onClick={() => {
                  if (hasVessels && block.sourceVesselIds && block.sourceVesselIds.length > 0 && onSelectVessel) {
                    onSelectVessel(block.sourceVesselIds[0]);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  hasVessels
                    ? 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-teal-600/80 cursor-pointer group'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 font-sans">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-md">
                    {block.section}
                  </span>
                  {hasVessels && block.sourceVesselIds && (
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <MousePointer className="w-3 h-3 text-teal-400" />
                      Highlight Anatomy ({block.sourceVesselIds.join(', ')})
                    </span>
                  )}
                </div>

                <div className="whitespace-pre-wrap text-slate-200 text-xs">
                  {block.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sonographer Mandatory Validation Sign-off */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div
          onClick={() => onToggleSignOff(!sonographerSignOff)}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          {sonographerSignOff ? (
            <CheckSquare className="w-5 h-5 text-teal-400 flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
          )}
          <div>
            <span className={`font-bold text-sm ${sonographerSignOff ? 'text-teal-300' : 'text-slate-200'}`}>
              Sonographer Review Complete & Validated
            </span>
            <p className="text-slate-400 text-[11px]">
              Confirms sonographer review of structured findings, clinical consistency checks, and intent to export.
            </p>
          </div>
        </div>

        <div className="text-right">
          {sonographerSignOff ? (
            <span className="text-teal-400 font-bold bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-lg">
              ✓ Ready for Export / Print
            </span>
          ) : (
            <span className="text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
              Sign-off Required To Export
            </span>
          )}
        </div>
      </div>

      {/* Modal for side-by-side review of worksheet vs manual report */}
      <ReviewChangesModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        freshReportText={liveFreshSummary}
        manualReportText={summaryText}
        onAcceptRegenerate={onRegenerateSummary}
        onKeepManual={() => {
          // Keep manual report text
        }}
      />
    </div>
  );
};
