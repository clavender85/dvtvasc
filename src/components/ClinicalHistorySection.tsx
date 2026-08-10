// Previous Venous & Vascular History Section

import React, { useState } from 'react';
import { PreviousHistory } from '../types/dvt';
import { Plus, Trash2, History } from 'lucide-react';

interface ClinicalHistorySectionProps {
  history: PreviousHistory;
  onChangeHistory: (newHistory: PreviousHistory) => void;
}

export const ClinicalHistorySection: React.FC<ClinicalHistorySectionProps> = ({
  history,
  onChangeHistory
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const addVenousProcedure = () => {
    const newProc = {
      id: `proc-${Date.now()}`,
      side: 'Right' as const,
      procedure: 'GSV stripping',
      dateApprox: '',
      vesselInvolved: '',
      details: ''
    };
    onChangeHistory({
      ...history,
      previousVenousProcedures: [...(history.previousVenousProcedures || []), newProc]
    });
  };

  const removeVenousProcedure = (id: string) => {
    onChangeHistory({
      ...history,
      previousVenousProcedures: (history.previousVenousProcedures || []).filter((p) => p.id !== id)
    });
  };

  const toggleArterial = (type: string) => {
    const current = history.previousArterialSurgery || [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    onChangeHistory({ ...history, previousArterialSurgery: next });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-slate-100 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between text-left transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            PREVIOUS DVT & VASCULAR SURGICAL HISTORY
          </span>
          {history.hasPreviousDvt === 'Yes' && (
            <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
              Prior DVT Logged
            </span>
          )}
        </div>
        <span className="text-slate-400 text-xs font-semibold">{isOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 text-xs bg-slate-900/60">
          {/* Prior DVT Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Previous DVT Logged?</label>
              <div className="flex gap-2">
                {(['No', 'Yes', 'Unknown'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChangeHistory({ ...history, hasPreviousDvt: opt })}
                    className={`px-3 py-1 rounded border text-xs font-medium ${
                      history.hasPreviousDvt === opt
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {history.hasPreviousDvt === 'Yes' && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prior DVT Limb & Date</label>
                  <div className="flex gap-2">
                    <select
                      value={history.previousDvtSide || 'Right'}
                      onChange={(e) => onChangeHistory({ ...history, previousDvtSide: e.target.value as any })}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Bilateral">Bilateral</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Date / Approx Timeframe"
                      value={history.previousDvtDate || ''}
                      onChange={(e) => onChangeHistory({ ...history, previousDvtDate: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Previously Involved Vessels</label>
                  <input
                    type="text"
                    placeholder="e.g. Left Popliteal, PTV"
                    value={history.previouslyInvolvedVessels || ''}
                    onChange={(e) => onChangeHistory({ ...history, previouslyInvolvedVessels: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  />
                </div>
              </>
            )}
          </div>

          {/* Anticoagulation Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Anticoagulation Status</label>
              <select
                value={history.anticoagulation}
                onChange={(e) => onChangeHistory({ ...history, anticoagulation: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
              >
                <option value="None">None</option>
                <option value="Current anticoagulation">Current anticoagulation</option>
                <option value="Recently ceased">Recently ceased</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Medication Details / Dose</label>
              <input
                type="text"
                placeholder="e.g. Apixaban 5mg BD, Warfarin INR 2.4"
                value={history.anticoagulationDetails || ''}
                onChange={(e) => onChangeHistory({ ...history, anticoagulationDetails: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
              />
            </div>
          </div>

          {/* Previous Venous Surgery / Intervention List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 uppercase text-[11px] tracking-wider">
                Previous Venous Surgery / Interventions
              </span>
              <button
                type="button"
                onClick={addVenousProcedure}
                className="bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Intervention
              </button>
            </div>

            {(history.previousVenousProcedures || []).length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">No previous venous surgical intervention documented.</p>
            ) : (
              <div className="space-y-2">
                {history.previousVenousProcedures.map((proc) => (
                  <div
                    key={proc.id}
                    className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded text-xs"
                  >
                    <select
                      value={proc.side}
                      onChange={(e) => {
                        const next = history.previousVenousProcedures.map((p) =>
                          p.id === proc.id ? { ...p, side: e.target.value as any } : p
                        );
                        onChangeHistory({ ...history, previousVenousProcedures: next });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Bilateral">Bilateral</option>
                      <option value="Central">Central</option>
                    </select>

                    <select
                      value={proc.procedure}
                      onChange={(e) => {
                        const next = history.previousVenousProcedures.map((p) =>
                          p.id === proc.id ? { ...p, procedure: e.target.value } : p
                        );
                        onChangeHistory({ ...history, previousVenousProcedures: next });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 flex-1"
                    >
                      <option value="Varicose vein surgery">Varicose vein surgery</option>
                      <option value="GSV stripping">GSV stripping</option>
                      <option value="SSV surgery">SSV surgery</option>
                      <option value="Endovenous laser therapy">Endovenous laser therapy (EVLT)</option>
                      <option value="Radiofrequency ablation">Radiofrequency ablation (RFA)</option>
                      <option value="Sclerotherapy">Sclerotherapy</option>
                      <option value="Venous stent">Venous stent</option>
                      <option value="Iliac venous stent">Iliac venous stent</option>
                      <option value="IVC filter">IVC filter</option>
                      <option value="Thrombectomy">Thrombectomy</option>
                      <option value="Thrombolysis">Thrombolysis</option>
                      <option value="AV fistula/graft">AV fistula/graft</option>
                      <option value="Other vascular surgery">Other vascular surgery</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Vessel / Details..."
                      value={proc.details || ''}
                      onChange={(e) => {
                        const next = history.previousVenousProcedures.map((p) =>
                          p.id === proc.id ? { ...p, details: e.target.value } : p
                        );
                        onChangeHistory({ ...history, previousVenousProcedures: next });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 flex-1"
                    />

                    <button
                      type="button"
                      onClick={() => removeVenousProcedure(proc.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Arterial Surgery Pills */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Previous Arterial / Other Surgery</label>
            <div className="flex flex-wrap gap-1.5">
              {['Bypass graft', 'Vascular reconstruction', 'Amputation', 'Arterial stent', 'Other'].map((art) => {
                const isSel = (history.previousArterialSurgery || []).includes(art);
                return (
                  <button
                    key={art}
                    type="button"
                    onClick={() => toggleArterial(art)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      isSel ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {art}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
