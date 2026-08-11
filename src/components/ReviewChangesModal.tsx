// Modal for reviewing changes between live worksheet state and manual report text

import React from 'react';
import { X, RefreshCw, FileText, Check, AlertTriangle } from 'lucide-react';

interface ReviewChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  freshReportText: string;
  manualReportText: string;
  onAcceptRegenerate: () => void;
  onKeepManual: () => void;
}

export const ReviewChangesModal: React.FC<ReviewChangesModalProps> = ({
  isOpen,
  onClose,
  freshReportText,
  manualReportText,
  onAcceptRegenerate,
  onKeepManual
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 shadow-2xl text-slate-100 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Worksheet vs Manual Report Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Worksheet findings have changed since you manually edited the report text. Compare fresh generated output with your current text.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fresh Generated Report */}
          <div className="bg-slate-950 border border-teal-900/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Fresh Generated Report (Live Worksheet)
              </span>
              <span className="bg-teal-950 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Up-to-Date
              </span>
            </div>
            <textarea
              readOnly
              rows={16}
              value={freshReportText}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* Current Manual Report */}
          <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Current Edited Report (Your Edits)
              </span>
              <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Modified
              </span>
            </div>
            <textarea
              readOnly
              rows={16}
              value={manualReportText}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              onKeepManual();
              onClose();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl font-bold transition-colors"
          >
            Keep My Manual Report Text
          </button>

          <button
            type="button"
            onClick={() => {
              onAcceptRegenerate();
              onClose();
            }}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2 rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate & Overwrite with Fresh Worksheet Data
          </button>
        </div>
      </div>
    </div>
  );
};
