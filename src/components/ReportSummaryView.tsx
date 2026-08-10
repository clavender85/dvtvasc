// Automated Sonographer Summary & Report Finalisation View

import React from 'react';
import { ExamState, ValidationAlert } from '../types/dvt';
import { Copy, RefreshCw, Printer, AlertTriangle, ShieldCheck, CheckSquare, Square } from 'lucide-react';

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
  onToggleSignOff
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100 p-5 space-y-5">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            STRUCTURED SONOGRAPHER FINDINGS SUMMARY
          </h2>
          <p className="text-xs text-slate-400">
            Automatically converted from entered examination observations. Review and validate prior to finalisation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onRegenerateSummary}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            Reset to Generated
          </button>

          <button
            onClick={onCopySummary}
            className="bg-teal-700 hover:bg-teal-600 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy to Clipboard
          </button>

          <button
            onClick={onPrintWorksheet}
            className="bg-indigo-700 hover:bg-indigo-600 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Worksheet / PDF
          </button>
        </div>
      </div>

      {/* Logic Alerts Drawer */}
      {alerts.length > 0 && (
        <div className="p-4 bg-amber-950/80 border border-amber-800 rounded-xl space-y-2 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Clinical Consistency Checks ({alerts.length})
          </div>
          <div className="space-y-1 pl-6">
            {alerts.map((a) => (
              <p key={a.id} className="text-amber-200">
                • <strong className="text-amber-100">{a.title}:</strong> {a.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Editable Summary Text Area */}
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
              Sonographer Review Complete
            </span>
            <p className="text-slate-400 text-[11px]">
              I confirm that the interactive diagram, extent landmarks, and generated summary text accurately reflect the ultrasound examination.
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400">
          <div>Sonographer: <strong className="text-slate-200">{state.header.sonographer || 'Unspecified'}</strong></div>
          <div>Timestamp: <strong className="text-slate-200">{new Date().toLocaleString()}</strong></div>
        </div>
      </div>
    </div>
  );
};
