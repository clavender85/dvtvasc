import React from 'react';
import { SymptomSiteAssessment, SymptomSide, SymptomRegion, SymptomFocalFinding } from '../types/dvt';
import { Target, Info } from 'lucide-react';

interface SymptomSiteSectionProps {
  symptomSite?: SymptomSiteAssessment;
  onChangeSymptomSite: (updated: SymptomSiteAssessment) => void;
}

const REGION_OPTIONS: SymptomRegion[] = [
  'Groin',
  'Thigh',
  'Popliteal fossa',
  'Calf',
  'Ankle',
  'Generalised leg',
  'Other'
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
    side: 'Right',
    regions: [],
    focalAreaAssessed: false,
    focalFinding: 'No focal abnormality',
    comments: ''
  };

  const handleToggleRegion = (region: SymptomRegion) => {
    const existing = current.regions || [];
    const next = existing.includes(region)
      ? existing.filter((r) => r !== region)
      : [...existing, region];
    onChangeSymptomSite({ ...current, regions: next });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 text-slate-100 text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            SITE OF SYMPTOMS (PAIN / SWELLING)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 italic">Targeted Symptom Localization</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Symptom Side & Regions */}
        <div className="space-y-2.5">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Symptomatic Side:</label>
            <div className="flex items-center gap-1.5">
              {(['Right', 'Left', 'Bilateral'] as SymptomSide[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => onChangeSymptomSite({ ...current, side })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    current.side === side
                      ? 'bg-amber-600 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Anatomical Region(s) (Select all that apply):</label>
            <div className="flex flex-wrap gap-1.5">
              {REGION_OPTIONS.map((reg) => {
                const isSelected = (current.regions || []).includes(reg);
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => handleToggleRegion(reg)}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-colors border ${
                      isSelected
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {reg}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focal Area Assessment & Finding */}
        <div className="space-y-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">
              Focal symptomatic area specifically assessed?
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeSymptomSite({ ...current, focalAreaAssessed: true })}
                className={`px-3 py-1 rounded font-bold text-xs transition-colors ${
                  current.focalAreaAssessed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onChangeSymptomSite({ ...current, focalAreaAssessed: false })}
                className={`px-3 py-1 rounded font-bold text-xs transition-colors ${
                  !current.focalAreaAssessed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {current.focalAreaAssessed && (
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Symptomatic Site Finding:</label>
              <select
                value={current.focalFinding || 'No focal abnormality'}
                onChange={(e) =>
                  onChangeSymptomSite({
                    ...current,
                    focalFinding: e.target.value as SymptomFocalFinding
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
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
              placeholder="Focal symptom comments (e.g., maximum tenderness 5cm below knee crease)..."
              value={current.comments || ''}
              onChange={(e) => onChangeSymptomSite({ ...current, comments: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/50">
        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          Note: A negative focal symptomatic-site assessment does NOT imply the overall DVT examination is negative.
        </span>
      </div>
    </div>
  );
};
