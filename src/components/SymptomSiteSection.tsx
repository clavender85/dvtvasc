import React, { useState } from 'react';
import { SymptomSiteAssessment, SymptomSide, SymptomRegion, SymptomFocalFinding } from '../types/dvt';
import { Target } from 'lucide-react';

interface SymptomSiteSectionProps {
  symptomSite?: SymptomSiteAssessment;
  onChangeSymptomSite: (updated: SymptomSiteAssessment) => void;
}

const REGION_CHIPS: { label: string; value: SymptomRegion }[] = [
  { label: 'Groin', value: 'Groin' },
  { label: 'Thigh', value: 'Thigh' },
  { label: 'Popliteal', value: 'Popliteal fossa' },
  { label: 'Calf', value: 'Calf' },
  { label: 'Ankle', value: 'Ankle' },
  { label: 'Generalised', value: 'Generalised leg' },
  { label: 'Other', value: 'Other' }
];

const FINDING_OPTIONS: SymptomFocalFinding[] = [
  'No focal abnormality',
  'Corresponds to DVT',
  'Superficial thrombosis',
  "Baker's cyst",
  'Haematoma',
  'Collection',
  'Oedema',
  'Varicosity',
  'Other'
];

export const SymptomSiteSection: React.FC<SymptomSiteSectionProps> = ({
  symptomSite,
  onChangeSymptomSite
}) => {
  const current: SymptomSiteAssessment = symptomSite || {
    side: 'Not specified',
    regions: [],
    focalAreaAssessed: false,
    focalFinding: 'No focal abnormality',
    comments: ''
  };

  const [showFocalDetails, setShowFocalDetails] = useState<boolean>(
    Boolean(current.focalAreaAssessed || current.comments || (current.focalFinding && current.focalFinding !== 'No focal abnormality'))
  );

  const handleToggleRegion = (val: SymptomRegion) => {
    const existing = current.regions || [];
    const next = existing.includes(val)
      ? existing.filter((r) => r !== val)
      : [...existing, val];
    onChangeSymptomSite({ ...current, regions: next });
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px] uppercase tracking-wider">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>SYMPTOMS / SITE</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Symptom Localization</span>
      </div>

      {/* Symptomatic Side */}
      <div>
        <label className="text-[10px] text-slate-400 block font-semibold mb-1">
          Symptomatic side:
        </label>
        <div className="flex flex-wrap items-center gap-1">
          {(['Right', 'Left', 'Bilateral', 'Not specified'] as SymptomSide[]).map((sideOption) => {
            const isSelected = current.side === sideOption;
            return (
              <button
                key={sideOption}
                type="button"
                onClick={() => onChangeSymptomSite({ ...current, side: sideOption })}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  isSelected
                    ? sideOption === 'Not specified'
                      ? 'bg-slate-700 text-slate-100 font-bold border border-slate-500'
                      : 'bg-amber-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sideOption}
              </button>
            );
          })}
        </div>
      </div>

      {/* Anatomical Regions */}
      <div>
        <label className="text-[10px] text-slate-400 block font-semibold mb-1">
          Region:
        </label>
        <div className="flex flex-wrap gap-1">
          {REGION_CHIPS.map((chip) => {
            const isSelected = (current.regions || []).includes(chip.value);
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleToggleRegion(chip.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                  isSelected
                    ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Focal Site Details Toggle */}
      <div className="pt-1 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => setShowFocalDetails(!showFocalDetails)}
          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
        >
          <span>{showFocalDetails ? '▼ Hide Focal Site Details' : '+ Focal Site Details'}</span>
          {current.focalAreaAssessed && (
            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1 rounded ml-1">
              Assessed
            </span>
          )}
        </button>

        {showFocalDetails && (
          <div className="mt-2 space-y-2 bg-slate-900/90 p-2 rounded border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-300">
                Focal area specifically assessed?
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChangeSymptomSite({ ...current, focalAreaAssessed: true })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    current.focalAreaAssessed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onChangeSymptomSite({ ...current, focalAreaAssessed: false })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    !current.focalAreaAssessed
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {current.focalAreaAssessed && (
              <div>
                <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                  Finding at symptomatic site:
                </label>
                <select
                  value={current.focalFinding || 'No focal abnormality'}
                  onChange={(e) =>
                    onChangeSymptomSite({
                      ...current,
                      focalFinding: e.target.value as SymptomFocalFinding
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-[11px]"
                >
                  {FINDING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Optional focal site comments..."
                value={current.comments || ''}
                onChange={(e) => onChangeSymptomSite({ ...current, comments: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-[11px] placeholder-slate-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
