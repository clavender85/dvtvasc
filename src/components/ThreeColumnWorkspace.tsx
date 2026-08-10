// Three-Column Comparison Workspace Component (PREVIOUS | CURRENT | INTERVAL CHANGE)

import React, { useState } from 'react';
import { VesselComparison, ComparisonOutcome, ExamState, ThrombusGroup } from '../types/dvt';
import { CheckCircle2, GitCompare, Filter, AlertTriangle, Layers, ArrowUpRight, ArrowDownRight, Edit3, HelpCircle } from 'lucide-react';
import { calculateExtentDifference } from '../utils/comparisonEngine';

interface ThreeColumnWorkspaceProps {
  state: ExamState;
  onChangeComparisons: (comparisons: VesselComparison[]) => void;
  onConfirmAll: () => void;
}

const COMPARISON_OUTCOMES_LIST: { value: ComparisonOutcome; label: string; badgeColor: string }[] = [
  { value: 'NEW', label: 'NEW DVT (Confirmed Normal Prior)', badgeColor: 'bg-rose-900 border-rose-600 text-rose-200' },
  { value: 'PERSISTENT', label: 'PERSISTENT (Stable DVT)', badgeColor: 'bg-amber-950 border-amber-700 text-amber-200' },
  { value: 'STABLE', label: 'STABLE (No Significant Change)', badgeColor: 'bg-slate-800 border-slate-700 text-slate-300' },
  { value: 'EXTENDED PROXIMALLY', label: 'EXTENDED PROXIMALLY', badgeColor: 'bg-rose-950 border-rose-500 text-rose-300' },
  { value: 'EXTENDED DISTALLY', label: 'EXTENDED DISTALLY', badgeColor: 'bg-rose-900 border-rose-600 text-rose-200' },
  { value: 'INCREASED EXTENT', label: 'INCREASED EXTENT', badgeColor: 'bg-rose-900 border-rose-600 text-rose-200' },
  { value: 'REDUCED EXTENT', label: 'REDUCED EXTENT / RETRACTED', badgeColor: 'bg-teal-950 border-teal-700 text-teal-300' },
  { value: 'IMPROVED RECANALISATION', label: 'IMPROVED RECANALISATION', badgeColor: 'bg-emerald-950 border-emerald-700 text-emerald-300' },
  { value: 'REDUCED RECANALISATION', label: 'REDUCED RECANALISATION', badgeColor: 'bg-amber-950 border-amber-700 text-amber-300' },
  { value: 'INCREASED OCCLUSION', label: 'INCREASED OCCLUSION', badgeColor: 'bg-rose-950 border-rose-700 text-rose-300' },
  { value: 'REDUCED OCCLUSION', label: 'REDUCED OCCLUSION', badgeColor: 'bg-teal-950 border-teal-700 text-teal-300' },
  { value: 'RESOLVED', label: 'RESOLVED (Fully Normal Today)', badgeColor: 'bg-emerald-900 border-emerald-500 text-emerald-200' },
  { value: 'RESIDUAL POST-THROMBOTIC CHANGE', label: 'RESIDUAL POST-THROMBOTIC CHANGE', badgeColor: 'bg-blue-950 border-blue-700 text-blue-300' },
  { value: 'ACUTE-APPEARING THROMBUS ON CHRONIC CHANGE', label: 'ACUTE ON CHRONIC THROMBUS', badgeColor: 'bg-rose-950 border-rose-500 text-rose-200' },
  { value: 'INDETERMINATE CHANGE', label: 'INDETERMINATE CHANGE', badgeColor: 'bg-slate-900 border-slate-700 text-slate-400' },
  { value: 'UNABLE TO COMPARE', label: 'UNABLE TO COMPARE', badgeColor: 'bg-slate-900 border-slate-700 text-slate-400' }
];

export const ThreeColumnWorkspace: React.FC<ThreeColumnWorkspaceProps> = ({
  state,
  onChangeComparisons,
  onConfirmAll
}) => {
  const [filterMode, setFilterMode] = useState<'abnormal_or_changed_only' | 'all_assessed'>('abnormal_or_changed_only');
  const [sideFilter, setSideFilter] = useState<'all' | 'right' | 'left' | 'pelvis'>('all');

  const comparisons = state.comparisons;
  const priorHeader = state.comparisonState?.header;
  const thrombusGroups = state.comparisonState?.thrombusGroups || [];

  const handleUpdateComparison = (vId: string, updates: Partial<VesselComparison>) => {
    const next = comparisons.map((c) => (c.vesselId === vId ? { ...c, ...updates } : c));
    onChangeComparisons(next);
  };

  // Filter comparison cards
  const filteredComparisons = comparisons.filter((comp) => {
    // Side filter
    if (sideFilter !== 'all') {
      if (sideFilter === 'right' && !comp.vesselId.startsWith('right')) return false;
      if (sideFilter === 'left' && !comp.vesselId.startsWith('left')) return false;
      if (sideFilter === 'pelvis' && !comp.vesselId.startsWith('pelvis')) return false;
    }

    if (filterMode === 'all_assessed') return true;

    // Abnormal / Changed Only (Default)
    const isPriorAbnormal = comp.priorFinding?.status === 'abnormal';
    const isCurrentAbnormal = comp.currentFinding?.status === 'abnormal';
    const isChanged = comp.suggestedOutcome !== 'STABLE' || comp.confirmedOutcome !== 'STABLE';

    return isPriorAbnormal || isCurrentAbnormal || isChanged;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Workspace Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider pr-2 border-r border-slate-800">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            Display Filter:
          </span>

          <button
            type="button"
            onClick={() => setFilterMode('abnormal_or_changed_only')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterMode === 'abnormal_or_changed_only'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Show Abnormal / Changed Only ({filteredComparisons.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('all_assessed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterMode === 'all_assessed'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Show All Assessed Vessels ({comparisons.length})
          </button>

          {/* Side Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 ml-2">
            {(['all', 'right', 'left'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSideFilter(s)}
                className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                  sideFilter === s ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          type="button"
          onClick={onConfirmAll}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirm All Reviewed Suggestions
        </button>
      </div>

      {/* Thrombus Group Cards (Multi-Vessel Continuous DVT) */}
      {thrombusGroups.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Continuous Thrombus Group Comparisons ({thrombusGroups.length}):
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {thrombusGroups.map((grp) => (
              <div key={grp.id} className="p-3.5 bg-slate-900 border border-teal-800/80 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-teal-300 text-xs">{grp.name}</span>
                  <span className="bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                    Multi-Segment DVT
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{grp.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Column Header Bar */}
      <div className="hidden lg:grid grid-cols-12 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-bold uppercase tracking-wider text-[11px]">
        <div className="col-span-3">VESSEL SEGMENT</div>
        <div className="col-span-3 text-amber-400">PREVIOUS STUDY ({priorHeader?.examDate || 'Prior'})</div>
        <div className="col-span-3 text-teal-400">TODAY'S EXAMINATION</div>
        <div className="col-span-3 text-emerald-400">INTERVAL CHANGE & CONFIRMATION</div>
      </div>

      {/* Vessel Comparison Cards */}
      {filteredComparisons.length === 0 ? (
        <div className="p-10 text-center text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
          No vessel comparison records match current filter criteria. Select "Show All Assessed Vessels" to inspect all segments.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComparisons.map((comp) => {
            const isConfirmed = comp.confirmed;
            const outcomeObj = COMPARISON_OUTCOMES_LIST.find((o) => o.value === comp.confirmedOutcome) || {
              badgeColor: 'bg-slate-800 border-slate-700 text-slate-300'
            };

            // Extent Difference calculation if applicable
            const extentCalc = calculateExtentDifference(comp.priorFinding?.proximalExtent, comp.currentFinding?.proximalExtent);

            return (
              <div
                key={comp.vesselId}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isConfirmed ? 'bg-slate-900 border-teal-800/80 shadow-md' : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {/* Mobile / Card Vessel Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{comp.vesselName}</span>
                    <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                      {comp.side}
                    </span>
                  </div>

                  {/* Confirmed Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleUpdateComparison(comp.vesselId, { confirmed: !isConfirmed })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                      isConfirmed ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isConfirmed ? 'Confirmed Sonographer Interpretation' : 'Click to Confirm'}
                  </button>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                  {/* Vessel Identification Column (Col 1-3) */}
                  <div className="lg:col-span-3 space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block border-b border-slate-800 pb-1">
                      Segment Metadata
                    </span>
                    <div className="text-slate-300 font-semibold">{comp.vesselName}</div>
                    <div className="text-[11px] text-slate-400 capitalize">Category: {comp.category?.replace('_', ' ')}</div>
                    {comp.priorFinding?.comments && (
                      <div className="text-[10px] text-amber-300/80 italic">Prior comment: {comp.priorFinding.comments}</div>
                    )}
                  </div>

                  {/* COLUMN 1: PREVIOUS STUDY (Col 4-6) */}
                  <div className="lg:col-span-3 space-y-1.5 bg-slate-950/90 p-3 rounded-xl border border-amber-900/40 text-slate-300">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block border-b border-slate-800 pb-1">
                      Previous Study ({priorHeader?.examDate || 'Prior'})
                    </span>
                    <div className="font-semibold text-slate-100">{comp.priorStatus}</div>
                    <div className="text-[11px] text-slate-400">Extent: {comp.priorExtent}</div>
                  </div>

                  {/* COLUMN 2: CURRENT STUDY (Col 7-9) */}
                  <div className="lg:col-span-3 space-y-1.5 bg-slate-950/90 p-3 rounded-xl border border-teal-900/40 text-slate-300">
                    <span className="text-[10px] font-bold uppercase text-teal-400 block border-b border-slate-800 pb-1">
                      Current Examination
                    </span>
                    <div className="font-semibold text-slate-100">{comp.currentStatus}</div>
                    <div className="text-[11px] text-slate-400">Extent: {comp.currentExtent}</div>
                  </div>

                  {/* COLUMN 3: INTERVAL CHANGE & CONFIRMATION (Col 10-12) */}
                  <div className="lg:col-span-3 space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block border-b border-slate-800 pb-1">
                        Calculated Interval Change
                      </span>

                      {/* Display extent measurement difference if calculated */}
                      {extentCalc.canCalculate && extentCalc.direction !== 'stable' && (
                        <div className="p-1.5 bg-emerald-950/80 border border-emerald-800 rounded text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                          {extentCalc.direction === 'proximal_extension' ? (
                            <ArrowUpRight className="w-4 h-4 text-rose-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-teal-400" />
                          )}
                          <span>{extentCalc.message}</span>
                        </div>
                      )}

                      {/* Suggested Outcome Statement */}
                      <p className="text-[11px] text-slate-200 leading-snug">
                        {comp.confirmedStatement || comp.suggestedStatement}
                      </p>
                    </div>

                    {/* Outcome Dropdown */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Sonographer Outcome:</label>
                      <select
                        value={comp.confirmedOutcome}
                        onChange={(e) =>
                          handleUpdateComparison(comp.vesselId, {
                            confirmedOutcome: e.target.value as ComparisonOutcome,
                            confirmed: true
                          })
                        }
                        className={`w-full border rounded-lg px-2.5 py-1.5 font-bold text-xs ${outcomeObj.badgeColor}`}
                      >
                        {COMPARISON_OUTCOMES_LIST.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional Sonographer Notes */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Sonographer comparison statement for report e.g. 'Persistent left popliteal DVT with improved recanalisation'..."
                    value={comp.notes || ''}
                    onChange={(e) => handleUpdateComparison(comp.vesselId, { notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
