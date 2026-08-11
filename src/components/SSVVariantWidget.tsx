import React from 'react';
import { SSVVariantOption, SSVVariantState } from '../types/dvt';
import { GitBranch, Info } from 'lucide-react';

interface SSVVariantWidgetProps {
  side: 'right' | 'left';
  variantState?: SSVVariantState;
  onChange: (updated: SSVVariantState) => void;
  compact?: boolean;
}

const SSV_OPTIONS: { value: SSVVariantOption; label: string; shortLabel: string; description: string }[] = [
  {
    value: 'spj_present',
    label: 'SPJ Present',
    shortLabel: 'SPJ',
    description: 'SSV joins Popliteal Vein at Saphenopopliteal Junction (Standard)'
  },
  {
    value: 'cranial_extension_only',
    label: 'Cranial Extension Only',
    shortLabel: 'Cranial Ext',
    description: 'SSV continues into posterior thigh as ascending cranial extension; no SPJ identified'
  },
  {
    value: 'spj_and_cranial_extension',
    label: 'SPJ + Cranial Extension',
    shortLabel: 'SPJ + Cranial',
    description: 'SSV joins Popliteal Vein at SPJ AND continues cranially into posterior thigh'
  },
  {
    value: 'no_definite_spj',
    label: 'No Definite SPJ',
    shortLabel: 'No SPJ',
    description: 'SSV terminates in calf/popliteal fossa without a definite SPJ connection'
  },
  {
    value: 'other',
    label: 'Other Variant',
    shortLabel: 'Other',
    description: 'Other non-standard SSV anatomical variant or termination'
  }
];

const DEFAULT_VARIANT_STATE: SSVVariantState = {
  variant: 'spj_present',
  giacominiDocumented: false,
  customDetails: ''
};

export const SSVVariantWidget: React.FC<SSVVariantWidgetProps> = ({
  side,
  variantState = DEFAULT_VARIANT_STATE,
  onChange,
  compact = false
}) => {
  const currentVariant = variantState.variant || 'spj_present';
  const sideTitle = side === 'right' ? 'RIGHT SSV ANATOMY' : 'LEFT SSV ANATOMY';
  const themeColor = side === 'right' ? 'text-teal-400' : 'text-sky-400';

  const handleSelectOption = (opt: SSVVariantOption) => {
    onChange({
      ...variantState,
      variant: opt
    });
  };

  const handleToggleGiacomini = () => {
    onChange({
      ...variantState,
      giacominiDocumented: !variantState.giacominiDocumented
    });
  };

  const activeOption = SSV_OPTIONS.find((o) => o.value === currentVariant) || SSV_OPTIONS[0];

  if (compact) {
    return (
      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${themeColor}`}>
            <GitBranch className="w-3 h-3" />
            {sideTitle}
          </span>
          <span className="text-slate-400 font-semibold text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            {activeOption.shortLabel}
          </span>
        </div>

        {/* Option Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {SSV_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectOption(opt.value)}
              className={`px-1.5 py-1 rounded text-[10px] font-bold transition-all text-center border ${
                currentVariant === opt.value
                  ? 'bg-purple-900 text-purple-200 border-purple-500 shadow'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title={opt.description}
            >
              {opt.shortLabel}
            </button>
          ))}
        </div>

        {/* Giacomini Checkbox */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-900">
          <label className="flex items-center gap-1.5 text-slate-300 text-[10px] cursor-pointer">
            <input
              type="checkbox"
              checked={!!variantState.giacominiDocumented}
              onChange={handleToggleGiacomini}
              className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
            />
            <span>Giacomini-type continuation</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 p-3 rounded-xl border border-purple-900/40 space-y-2.5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className={`w-4 h-4 ${themeColor}`} />
          <span className={`font-bold uppercase tracking-wide text-xs ${themeColor}`}>
            {sideTitle} Variant & Cranial Extension
          </span>
        </div>
        <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">
          {activeOption.label}
        </span>
      </div>

      {/* Selector Options */}
      <div className="flex flex-wrap gap-1.5">
        {SSV_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelectOption(opt.value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              currentVariant === opt.value
                ? 'bg-purple-900/90 text-purple-100 border-purple-500 shadow-md font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
            title={opt.description}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-900/80 p-2 rounded border border-slate-800/80">
        <Info className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
        <span>{activeOption.description}</span>
      </p>

      {/* Additional Giacomini checkbox & Custom Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        <label className="flex items-center gap-2 text-slate-200 text-xs font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={!!variantState.giacominiDocumented}
            onChange={handleToggleGiacomini}
            className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
          />
          <span>Giacomini-type continuation documented</span>
        </label>

        {currentVariant === 'other' && (
          <input
            type="text"
            placeholder="Custom SSV anatomy details..."
            value={variantState.customDetails || ''}
            onChange={(e) => onChange({ ...variantState, customDetails: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs"
          />
        )}
      </div>
    </div>
  );
};
