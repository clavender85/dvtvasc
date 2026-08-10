// Compact Confirmation Modal for Marking Routine Assessed Segments Normal

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface NormalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRight: () => void;
  onConfirmLeft: () => void;
  onConfirmBilateral: () => void;
}

export const NormalConfirmationModal: React.FC<NormalConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmRight,
  onConfirmLeft,
  onConfirmBilateral
}) => {
  const [selectedScope, setSelectedScope] = useState<'right' | 'left' | 'bilateral'>('bilateral');

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedScope === 'right') {
      onConfirmRight();
    } else if (selectedScope === 'left') {
      onConfirmLeft();
    } else {
      onConfirmBilateral();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Mark Routine Assessed Segments Normal
              </h3>
              <p className="text-xs text-slate-400">Protocol-driven baseline entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Scope Selection */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2">
              Select Examination Scope:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope('right')}
                className={`py-2 px-3 rounded-lg font-bold border text-center transition-all ${
                  selectedScope === 'right'
                    ? 'bg-teal-600 border-teal-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Right Limb Only
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope('left')}
                className={`py-2 px-3 rounded-lg font-bold border text-center transition-all ${
                  selectedScope === 'left'
                    ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Left Limb Only
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope('bilateral')}
                className={`py-2 px-3 rounded-lg font-bold border text-center transition-all ${
                  selectedScope === 'bilateral'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Bilateral Limbs
              </button>
            </div>
          </div>

          {/* Included Routine Segments */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Protocol-Defined Routine Segments Included:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              CFV, PFV, Proximal FV, Mid FV, Distal FV, Popliteal V, Tibioperoneal Trunk, Posterior Tibial Veins (paired), Peroneal Veins (paired), Gastrocnemius Veins, and Soleal Veins.
            </p>
          </div>

          {/* Excluded Optional Segments */}
          <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-slate-400 text-[11px]">
            <span className="font-semibold text-slate-300">Note:</span> Optional segments (IVC, Iliac veins, Anterior Tibial veins, GSV, SSV) will remain unassessed unless explicitly selected.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-colors"
          >
            Confirm & Mark Normal
          </button>
        </div>
      </div>
    </div>
  );
};
