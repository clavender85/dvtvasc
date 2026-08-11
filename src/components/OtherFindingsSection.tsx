// Non-Venous & Other Findings Logging Component

import React, { useState } from 'react';
import { OtherFindingItem } from '../types/dvt';
import { Plus, Trash2, Stethoscope } from 'lucide-react';

interface OtherFindingsSectionProps {
  otherFindings: OtherFindingItem[];
  onChangeOtherFindings: (newFindings: OtherFindingItem[]) => void;
}

const FINDING_TYPES = [
  "Baker's / popliteal cyst",
  "Suspected ruptured Baker's cyst",
  'Haematoma',
  'Collection',
  'Oedema',
  'Enlarged lymph node',
  'Collateral veins',
  'Superficial varicosities',
  'Superficial thrombosis',
  'Venous aneurysmal dilatation',
  'Other'
];

export const OtherFindingsSection: React.FC<OtherFindingsSectionProps> = ({
  otherFindings,
  onChangeOtherFindings
}) => {
  const [isOpen, setIsOpen] = useState(otherFindings.length > 0);

  const addFinding = () => {
    const newItem: OtherFindingItem = {
      id: `of-${Date.now()}`,
      type: "Baker's / popliteal cyst",
      side: 'Left',
      location: 'Popliteal fossa',
      comments: ''
    };
    onChangeOtherFindings([...otherFindings, newItem]);
    setIsOpen(true);
  };

  const removeFinding = (id: string) => {
    onChangeOtherFindings(otherFindings.filter((f) => f.id !== id));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-slate-100 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between text-left transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            NON-VENOUS & OTHER PATHOLOGY FINDINGS
          </span>
          {otherFindings.length > 0 && (
            <span className="bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">
              {otherFindings.length} Logged
            </span>
          )}
        </div>
        <span className="text-slate-400 text-xs font-semibold">{isOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 text-xs bg-slate-900/60">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addFinding}
              className="bg-teal-700 hover:bg-teal-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Other Finding
            </button>
          </div>

          {otherFindings.length === 0 ? (
            <p className="text-slate-500 italic text-[11px] text-center py-2">
              No non-venous pathology (e.g. Baker's cyst, lymph node, haematoma) documented.
            </p>
          ) : (
            <div className="space-y-2">
              {otherFindings.map((item) => (
                <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={item.side}
                      onChange={(e) => {
                        const next = otherFindings.map((f) => (f.id === item.id ? { ...f, side: e.target.value as any } : f));
                        onChangeOtherFindings(next);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-semibold"
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Bilateral">Bilateral</option>
                    </select>

                    <select
                      value={item.type}
                      onChange={(e) => {
                        const next = otherFindings.map((f) => (f.id === item.id ? { ...f, type: e.target.value as any } : f));
                        onChangeOtherFindings(next);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-teal-300 font-bold flex-1"
                    >
                      {FINDING_TYPES.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeFinding(item.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Anatomical Location e.g. Posteromedial knee crease"
                      value={item.location}
                      onChange={(e) => {
                        const next = otherFindings.map((f) => (f.id === item.id ? { ...f, location: e.target.value } : f));
                        onChangeOtherFindings(next);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />

                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1">
                      <span className="text-[10px] text-slate-400 font-semibold">3 Dims (mm):</span>
                      <input
                        type="number"
                        placeholder="L"
                        value={item.dimensionsLengthMm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          const next = otherFindings.map((f) => (f.id === item.id ? { ...f, dimensionsLengthMm: val } : f));
                          onChangeOtherFindings(next);
                        }}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-1 text-center text-slate-100"
                      />
                      <span className="text-slate-500">x</span>
                      <input
                        type="number"
                        placeholder="W"
                        value={item.dimensionsWidthMm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          const next = otherFindings.map((f) => (f.id === item.id ? { ...f, dimensionsWidthMm: val } : f));
                          onChangeOtherFindings(next);
                        }}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-1 text-center text-slate-100"
                      />
                      <span className="text-slate-500">x</span>
                      <input
                        type="number"
                        placeholder="D"
                        value={item.dimensionsDepthMm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          const next = otherFindings.map((f) => (f.id === item.id ? { ...f, dimensionsDepthMm: val } : f));
                          onChangeOtherFindings(next);
                        }}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-1 text-center text-slate-100"
                      />
                      <span className="text-[10px] text-slate-400">mm</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Sonographic Details e.g. Anechoic fluid collection with neck extending into knee joint space..."
                    value={item.comments}
                    onChange={(e) => {
                      const next = otherFindings.map((f) => (f.id === item.id ? { ...f, comments: e.target.value } : f));
                      onChangeOtherFindings(next);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
