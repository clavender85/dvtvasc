// Examination Technical Limitations Section

import React, { useState } from 'react';
import { ExaminationLimitations, LimitationSeverity } from '../types/dvt';
import { LIMITATION_FACTORS, ANATOMICAL_VESSELS } from '../data/anatomyData';
import { AlertCircle } from 'lucide-react';

interface LimitationsSectionProps {
  limitations: ExaminationLimitations;
  onChangeLimitations: (newLimitations: ExaminationLimitations) => void;
}

export const LimitationsSection: React.FC<LimitationsSectionProps> = ({
  limitations,
  onChangeLimitations
}) => {
  const [isOpen, setIsOpen] = useState(limitations.hasLimitations);

  const toggleFactor = (factorId: string) => {
    const current = limitations.factors || [];
    const next = current.includes(factorId) ? current.filter((f) => f !== factorId) : [...current, factorId];
    onChangeLimitations({
      ...limitations,
      hasLimitations: next.length > 0,
      factors: next
    });
  };

  const toggleAffectedVessel = (vId: string) => {
    const current = limitations.affectedVesselIds || [];
    const next = current.includes(vId) ? current.filter((id) => id !== vId) : [...current, vId];
    onChangeLimitations({
      ...limitations,
      affectedVesselIds: next
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-slate-100 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between text-left transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${limitations.hasLimitations ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            EXAMINATION LIMITATIONS & UNVISUALISED SEGMENTS
          </span>
          {limitations.hasLimitations && (
            <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
              {limitations.severity.toUpperCase()} LIMITATIONS
            </span>
          )}
        </div>
        <span className="text-slate-400 text-xs font-semibold">{isOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 text-xs bg-slate-900/60">
          {/* Limitations Toggle & Severity */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-slate-300">Technical Limitations Present?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChangeLimitations({ ...limitations, hasLimitations: false, factors: [] })}
                  className={`px-3 py-1 rounded text-xs font-medium border ${
                    !limitations.hasLimitations
                      ? 'bg-emerald-700 border-emerald-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  No Significant Limitations
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLimitations({ ...limitations, hasLimitations: true })}
                  className={`px-3 py-1 rounded text-xs font-medium border ${
                    limitations.hasLimitations
                      ? 'bg-amber-700 border-amber-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Limitations Recorded
                </button>
              </div>
            </div>

            {limitations.hasLimitations && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Severity:</span>
                {(['minor', 'moderate', 'significant'] as LimitationSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => onChangeLimitations({ ...limitations, severity: sev })}
                    className={`px-2.5 py-1 rounded border text-xs capitalize ${
                      limitations.severity === sev
                        ? 'bg-amber-600 border-amber-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Factor Checklist */}
          {limitations.hasLimitations && (
            <>
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">
                  Limitation Factors (Select All Applicable)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                  {LIMITATION_FACTORS.map((fact) => {
                    const isChecked = (limitations.factors || []).includes(fact.id);
                    return (
                      <button
                        key={fact.id}
                        type="button"
                        onClick={() => toggleFactor(fact.id)}
                        className={`px-2.5 py-1.5 rounded text-[11px] text-left transition-colors border ${
                          isChecked
                            ? 'bg-amber-950 border-amber-700 text-amber-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {fact.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag specific vessels not visualised */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Specify Vessel Segments Inadequately Visualised / Not Assessed
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg max-h-32 overflow-y-auto flex flex-wrap gap-1">
                  {['right', 'left'].map((side) =>
                    ANATOMICAL_VESSELS.map((vDef) => {
                      const vId = `${side}_${vDef.vesselKey}`;
                      const isSel = (limitations.affectedVesselIds || []).includes(vId);
                      return (
                        <button
                          key={vId}
                          type="button"
                          onClick={() => toggleAffectedVessel(vId)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                            isSel
                              ? 'bg-rose-950 border-rose-700 text-rose-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {side.toUpperCase().substring(0, 1)} {vDef.shortName}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Free Text Note */}
              <div>
                <input
                  type="text"
                  placeholder="Additional Technical Limitations Notes..."
                  value={limitations.customDetails || ''}
                  onChange={(e) => onChangeLimitations({ ...limitations, customDetails: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
