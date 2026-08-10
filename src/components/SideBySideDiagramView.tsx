// Graphical Side-by-Side, Overlay & Change Map Anatomical Visualiser Component

import React, { useState } from 'react';
import { ExamState, Side, VesselFinding, PriorVesselFinding } from '../types/dvt';
import { ANATOMICAL_VESSELS } from '../data/anatomyData';
import { Eye, Layers, GitCompare, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface SideBySideDiagramViewProps {
  state: ExamState;
}

export const SideBySideDiagramView: React.FC<SideBySideDiagramViewProps> = ({ state }) => {
  const [graphicalMode, setGraphicalMode] = useState<'side_by_side' | 'overlay' | 'change_map'>('side_by_side');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');

  const priorFindings = state.comparisonState?.priorFindings || {};
  const currentFindings = state.vesselFindings;

  // Filter vessels for the selected side
  const limbVessels = ANATOMICAL_VESSELS.filter((v) => v.category !== 'pelvis');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-xl">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">
              GRAPHICAL ANATOMICAL COMPARISON MAP
            </h3>
            <p className="text-xs text-slate-400">
              Visual spatial mapping of thrombus distribution between prior and current study.
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Side Switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs mr-2">
            <button
              onClick={() => setSelectedSide('left')}
              className={`px-3 py-1 rounded-lg font-bold ${
                selectedSide === 'left' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Left Limb
            </button>
            <button
              onClick={() => setSelectedSide('right')}
              className={`px-3 py-1 rounded-lg font-bold ${
                selectedSide === 'right' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Right Limb
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setGraphicalMode('side_by_side')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                graphicalMode === 'side_by_side' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
            <button
              onClick={() => setGraphicalMode('overlay')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                graphicalMode === 'overlay' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Overlay Mode
            </button>
            <button
              onClick={() => setGraphicalMode('change_map')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                graphicalMode === 'change_map' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Change Map
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Visual Legend:</span>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-900 border border-amber-500 inline-block" />
            <span className="text-slate-300">Previous Thrombus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-600 border border-rose-400 inline-block" />
            <span className="text-slate-300">Current Thrombus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-purple-700 border border-purple-400 inline-block" />
            <span className="text-slate-300">Persistent Overlap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-900 border border-emerald-500 inline-block" />
            <span className="text-slate-300">Resolved Thrombus</span>
          </div>
        </div>
      </div>

      {/* Graphical Mode Render */}
      {graphicalMode === 'side_by_side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Previous Study Diagram */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="text-center pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                PREVIOUS STUDY ({state.comparisonState?.header?.examDate || 'Prior'}) - {selectedSide.toUpperCase()} LIMB
              </span>
            </div>

            <div className="space-y-2">
              {limbVessels.map((v) => {
                const vId = `${selectedSide}_${v.vesselKey}`;
                const prior = priorFindings[vId];
                const isAbnormal = prior?.status === 'abnormal';

                return (
                  <div
                    key={vId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isAbnormal
                        ? 'bg-amber-950/80 border-amber-700 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{v.name}</span>
                    <span className="text-[11px] font-bold">
                      {isAbnormal ? prior?.patency?.replace(/_/g, ' ') || 'Abnormal' : 'Normal / Patent'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Current Study Diagram */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="text-center pb-2 border-b border-slate-800">
              <span className="font-bold text-teal-400 text-xs uppercase tracking-wider">
                TODAY'S EXAMINATION - {selectedSide.toUpperCase()} LIMB
              </span>
            </div>

            <div className="space-y-2">
              {limbVessels.map((v) => {
                const vId = `${selectedSide}_${v.vesselKey}`;
                const curr = currentFindings[vId];
                const isAbnormal = curr?.status === 'abnormal';

                return (
                  <div
                    key={vId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isAbnormal
                        ? 'bg-rose-950/80 border-rose-700 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{v.name}</span>
                    <span className="text-[11px] font-bold">
                      {isAbnormal ? curr?.patency?.replace(/_/g, ' ') || 'Abnormal' : 'Normal / Patent'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay & Change Map Modes */}
      {(graphicalMode === 'overlay' || graphicalMode === 'change_map') && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-center pb-2 border-b border-slate-800">
            <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider">
              {graphicalMode === 'overlay' ? 'SINGLE OVERLAY DIAGRAM MODE' : 'INTERVAL CHANGE MAP MODE'} - {selectedSide.toUpperCase()} LIMB
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {limbVessels.map((v) => {
              const vId = `${selectedSide}_${v.vesselKey}`;
              const prior = priorFindings[vId];
              const curr = currentFindings[vId];

              const priorAbnormal = prior?.status === 'abnormal';
              const currAbnormal = curr?.status === 'abnormal';

              let stateColor = 'bg-slate-900 border-slate-800 text-slate-400';
              let stateText = 'Unchanged Normal';

              if (priorAbnormal && currAbnormal) {
                stateColor = 'bg-purple-950 border-purple-700 text-purple-200';
                stateText = 'Persistent Overlap Thrombus';
              } else if (!priorAbnormal && currAbnormal) {
                stateColor = 'bg-rose-950 border-rose-600 text-rose-200';
                stateText = 'NEW / Extension Segment';
              } else if (priorAbnormal && !currAbnormal) {
                stateColor = 'bg-emerald-950 border-emerald-700 text-emerald-300';
                stateText = 'Resolved Previous Segment';
              }

              return (
                <div key={vId} className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${stateColor}`}>
                  <span>{v.name}</span>
                  <span className="text-[11px] uppercase tracking-wide">{stateText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
