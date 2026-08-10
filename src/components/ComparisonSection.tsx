// Comparison with Previous Examination Workflow Component

import React from 'react';
import { VesselComparison, ComparisonOutcome, ExamState, VesselFinding } from '../types/dvt';
import { GitCompare, CheckCircle2, AlertCircle } from 'lucide-react';

interface ComparisonSectionProps {
  state: ExamState;
  onChangeComparisons: (comparisons: VesselComparison[]) => void;
}

const COMPARISON_OUTCOMES: ComparisonOutcome[] = [
  'New thrombus',
  'Interval extension',
  'Interval reduction',
  'Stable/no significant change',
  'Improved recanalisation',
  'Increased occlusion',
  'Resolved',
  'Residual chronic/post-thrombotic change',
  'Unable to compare',
  'Indeterminate'
];

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ state, onChangeComparisons }) => {
  const { history, vesselFindings, comparisons } = state;

  // Auto-populate abnormal vessels into comparison list if empty
  const populateComparisonTable = () => {
    const abnormalVessels = (Object.values(vesselFindings) as VesselFinding[]).filter((f) => f.status === 'abnormal');

    const nextComparisons: VesselComparison[] = abnormalVessels.map((f) => {
      const existing = comparisons.find((c) => c.vesselId === f.id);
      if (existing) return existing;

      // Auto-suggest outcome based on prior history
      let suggested: ComparisonOutcome = 'Stable/no significant change';
      if (history.hasPreviousDvt === 'No') {
        suggested = 'New thrombus';
      } else if (f.patency === 'recanalised') {
        suggested = 'Improved recanalisation';
      }

      return {
        vesselId: f.id,
        vesselName: f.vesselName,
        priorStatus: history.previousReportSummary || 'Prior exam findings',
        priorExtent: history.previousThrombusExtent || 'Unknown prior extent',
        currentStatus: `${f.patency?.replace(/_/g, ' ')} (${f.chronicity?.replace(/_/g, ' ')})`,
        currentExtent: `${f.proximalExtent?.distance || ''} ${f.proximalExtent?.unit || ''} to ${f.distalExtent?.distance || ''} ${f.distalExtent?.unit || ''}`,
        suggestedOutcome: suggested,
        confirmedOutcome: suggested,
        confirmed: true,
        notes: ''
      };
    });

    onChangeComparisons(nextComparisons);
  };

  const handleUpdateComparison = (vId: string, updates: Partial<VesselComparison>) => {
    const next = comparisons.map((c) => (c.vesselId === vId ? { ...c, ...updates } : c));
    onChangeComparisons(next);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              COMPARISON WITH PRIOR EXAMINATION
            </h3>
            <p className="text-xs text-slate-400">
              Systematic comparison of current vessel findings against prior study ({history.previousStudyDate || 'Date not specified'})
            </p>
          </div>
        </div>

        <button
          onClick={populateComparisonTable}
          className="bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          Auto-Populate Abnormal Vessels
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
        <span>
          <strong>Clinical Rule:</strong> Comparison outcomes must be explicitly verified and confirmed by the sonographer before appearing in the final summary report.
        </span>
      </div>

      {/* Comparison Table */}
      {comparisons.length === 0 ? (
        <div className="p-6 text-center text-slate-500 bg-slate-950/50 rounded-lg border border-dashed border-slate-800 text-xs">
          No comparison records generated yet. Click "Auto-Populate Abnormal Vessels" above to load current abnormal findings for prior study comparison.
        </div>
      ) : (
        <div className="space-y-3">
          {comparisons.map((comp) => (
            <div
              key={comp.vesselId}
              className={`p-3.5 rounded-lg border text-xs space-y-3 transition-colors ${
                comp.confirmed ? 'bg-slate-950 border-teal-800/80' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className="font-bold text-sm text-teal-300">{comp.vesselName}</span>

                {/* Confirmed Toggle */}
                <button
                  onClick={() => handleUpdateComparison(comp.vesselId, { confirmed: !comp.confirmed })}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    comp.confirmed ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {comp.confirmed ? 'Confirmed for Summary' : 'Click to Confirm'}
                </button>
              </div>

              {/* Side-by-side Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Prior Study State */}
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Prior Study Findings ({history.previousStudyDate || 'Prior'})
                  </span>
                  <input
                    type="text"
                    value={comp.priorStatus}
                    onChange={(e) => handleUpdateComparison(comp.vesselId, { priorStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    placeholder="Prior status..."
                  />
                </div>

                {/* Current Exam State */}
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-teal-400 block mb-1">
                    Today's Examination Findings
                  </span>
                  <input
                    type="text"
                    value={comp.currentStatus}
                    onChange={(e) => handleUpdateComparison(comp.vesselId, { currentStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    placeholder="Current status..."
                  />
                </div>
              </div>

              {/* Outcome Selection Dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="font-bold text-slate-300">Sonographer Comparison Outcome:</label>
                <select
                  value={comp.confirmedOutcome}
                  onChange={(e) =>
                    handleUpdateComparison(comp.vesselId, {
                      confirmedOutcome: e.target.value as ComparisonOutcome,
                      confirmed: true
                    })
                  }
                  className="bg-slate-900 border border-teal-600 rounded px-3 py-1 text-teal-300 font-bold"
                >
                  {COMPARISON_OUTCOMES.map((out) => (
                    <option key={out} value={out}>
                      {out}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Comparison summary statement for report e.g. 'Previously demonstrated thrombus has reduced in extent with partial recanalisation'..."
                  value={comp.notes}
                  onChange={(e) => handleUpdateComparison(comp.vesselId, { notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
