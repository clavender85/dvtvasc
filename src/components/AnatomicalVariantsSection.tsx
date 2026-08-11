import React, { useState } from 'react';
import { AnatomicalVariantItem, VariantType, VesselStatus } from '../types/dvt';
import { GitFork, Plus, Trash2 } from 'lucide-react';

interface AnatomicalVariantsSectionProps {
  variants: AnatomicalVariantItem[];
  onChangeVariants: (updated: AnatomicalVariantItem[]) => void;
}

const VARIANT_TYPE_OPTIONS: VariantType[] = [
  'Duplicated femoral vein',
  'Duplicated popliteal vein',
  'Variant calf venous anatomy',
  'Absent / hypoplastic vein',
  'Other'
];

export const AnatomicalVariantsSection: React.FC<AnatomicalVariantsSectionProps> = ({
  variants,
  onChangeVariants
}) => {
  const [isOpen, setIsOpen] = useState(variants.length > 0);

  const addVariant = () => {
    const newItem: AnatomicalVariantItem = {
      id: `var-${Date.now()}`,
      side: 'Right',
      variantType: 'Duplicated femoral vein',
      vesselKey: 'FV',
      channel1Status: 'normal',
      channel2Status: 'normal',
      comments: ''
    };
    onChangeVariants([...variants, newItem]);
    setIsOpen(true);
  };

  const removeVariant = (id: string) => {
    onChangeVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, updates: Partial<AnatomicalVariantItem>) => {
    onChangeVariants(
      variants.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-slate-100 mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between text-left transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            ANATOMICAL VARIANTS & DUPLICATED VEINS
          </span>
          {variants.length > 0 && (
            <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">
              {variants.length} Variant(s) Documented
            </span>
          )}
        </div>
        <span className="text-slate-400 text-xs font-semibold">
          {isOpen ? 'Collapse [-]' : 'Expand [+]'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 text-xs bg-slate-900/60">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">
              Document duplicated channels or anatomical variations. Each duplicated channel is assessed independently.
            </span>
            <button
              type="button"
              onClick={addVariant}
              className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-slate-500 italic text-[11px] text-center py-2">
              No anatomical duplication or vessel hypoplasia documented.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((varItem) => {
                const isDuplication = varItem.variantType.includes('Duplicated');

                return (
                  <div
                    key={varItem.id}
                    className="p-3 bg-slate-950 border border-purple-900/50 rounded-lg space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={varItem.side}
                        onChange={(e) =>
                          updateVariant(varItem.id, {
                            side: e.target.value as 'Right' | 'Left' | 'Bilateral'
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                      >
                        <option value="Right">Right</option>
                        <option value="Left">Left</option>
                        <option value="Bilateral">Bilateral</option>
                      </select>

                      <select
                        value={varItem.variantType}
                        onChange={(e) =>
                          updateVariant(varItem.id, {
                            variantType: e.target.value as VariantType
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold flex-1"
                      >
                        {VARIANT_TYPE_OPTIONS.map((vt) => (
                          <option key={vt} value={vt}>
                            {vt}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => removeVariant(varItem.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Independent Channel Status for Duplication */}
                    {isDuplication ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">
                            Channel 1 Status:
                          </label>
                          <select
                            value={varItem.channel1Status}
                            onChange={(e) =>
                              updateVariant(varItem.id, {
                                channel1Status: e.target.value as VesselStatus
                              })
                            }
                            className={`w-full border rounded px-2 py-1 font-medium ${
                              varItem.channel1Status === 'abnormal'
                                ? 'bg-rose-950 text-rose-200 border-rose-700'
                                : varItem.channel1Status === 'normal'
                                ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                                : 'bg-slate-950 text-slate-200 border-slate-700'
                            }`}
                          >
                            <option value="normal">Channel 1: Patent / Normal</option>
                            <option value="abnormal">Channel 1: Abnormal / DVT</option>
                            <option value="not_visualised">Channel 1: Not Visualised</option>
                            <option value="not_assessed">Channel 1: Not Assessed</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">
                            Channel 2 Status:
                          </label>
                          <select
                            value={varItem.channel2Status || 'normal'}
                            onChange={(e) =>
                              updateVariant(varItem.id, {
                                channel2Status: e.target.value as VesselStatus
                              })
                            }
                            className={`w-full border rounded px-2 py-1 font-medium ${
                              varItem.channel2Status === 'abnormal'
                                ? 'bg-rose-950 text-rose-200 border-rose-700'
                                : varItem.channel2Status === 'normal'
                                ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                                : 'bg-slate-950 text-slate-200 border-slate-700'
                            }`}
                          >
                            <option value="normal">Channel 2: Patent / Normal</option>
                            <option value="abnormal">Channel 2: Abnormal / DVT</option>
                            <option value="not_visualised">Channel 2: Not Visualised</option>
                            <option value="not_assessed">Channel 2: Not Assessed</option>
                          </select>
                        </div>
                      </div>
                    ) : null}

                    <input
                      type="text"
                      placeholder="Variant comments e.g., duplicated channel terminates at mid-thigh level..."
                      value={varItem.comments || ''}
                      onChange={(e) => updateVariant(varItem.id, { comments: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 placeholder-slate-500"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
