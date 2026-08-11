// Modal for Manually Entering Prior Report Findings when Structured Data is Unavailable

import React, { useState } from 'react';
import { PriorVesselFinding, Side, VesselCategory, VesselStatus, ThrombusPresence, Compressibility, Patency, SonographicChronicity, Landmark, ExtentRelation, EXTENT_RELATION_LABELS } from '../types/dvt';
import { ANATOMICAL_VESSELS, LANDMARK_LABELS } from '../data/anatomyData';
import { X, Plus, Trash2, Save, FileText } from 'lucide-react';

interface PriorManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorFindings: Record<string, PriorVesselFinding>;
  onSavePriorFindings: (findings: Record<string, PriorVesselFinding>) => void;
}

export const PriorManualEntryModal: React.FC<PriorManualEntryModalProps> = ({
  isOpen,
  onClose,
  priorFindings,
  onSavePriorFindings
}) => {
  const [localFindings, setLocalFindings] = useState<Record<string, PriorVesselFinding>>(() => ({ ...priorFindings }));
  const [selectedVesselKey, setSelectedVesselKey] = useState<string>('left_POPV');

  if (!isOpen) return null;

  const handleUpdateFinding = (vKey: string, updates: Partial<PriorVesselFinding>) => {
    setLocalFindings((prev) => {
      const existing = prev[vKey] || {
        vesselId: vKey,
        vesselName: ANATOMICAL_VESSELS.find((v) => `${vKey.startsWith('right') ? 'right' : 'left'}_${v.vesselKey}` === vKey)?.name || vKey,
        side: (vKey.startsWith('right') ? 'right' : 'left') as Side,
        category: 'popliteal' as VesselCategory,
        status: 'abnormal' as VesselStatus
      };

      return {
        ...prev,
        [vKey]: { ...existing, ...updates }
      };
    });
  };

  const handleRemoveFinding = (vKey: string) => {
    setLocalFindings((prev) => {
      const next = { ...prev };
      delete next[vKey];
      return next;
    });
  };

  const handleAddAbnormalVessel = () => {
    if (!selectedVesselKey) return;
    const vDef = ANATOMICAL_VESSELS.find((v) => `${selectedVesselKey.startsWith('right') ? 'right' : 'left'}_${v.vesselKey}` === selectedVesselKey);
    const side = (selectedVesselKey.startsWith('right') ? 'right' : 'left') as Side;
    const sideLabel = side === 'right' ? 'Right' : 'Left';

    handleUpdateFinding(selectedVesselKey, {
      vesselId: selectedVesselKey,
      vesselName: vDef ? `${sideLabel} ${vDef.name}` : selectedVesselKey,
      side,
      category: vDef?.category || 'popliteal',
      status: 'abnormal',
      thrombusPresence: 'thrombus_present',
      compressibility: 'non_compressible',
      patency: 'completely_occluded',
      chronicity: 'acute_appearing',
      comments: 'Manually entered from external prior report'
    });
  };

  const handleSaveAndClose = () => {
    onSavePriorFindings(localFindings);
    onClose();
  };

  const abnormalKeys = Object.keys(localFindings).filter((k) => localFindings[k].status === 'abnormal');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                Manual Entry: External Prior Report Findings
              </h3>
              <p className="text-xs text-slate-400">
                Enter documented findings from external prior report when structured data is unavailable.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="bg-amber-950/60 border-b border-amber-800/80 px-6 py-2.5 text-xs text-amber-200 font-medium">
          Note: Support "Not documented" for any field if not specified on the external report.
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Vessel Selection Bar */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                Select Vessel Segment to Add Prior Abnormality:
              </label>
              <select
                value={selectedVesselKey}
                onChange={(e) => setSelectedVesselKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-medium"
              >
                {['right', 'left'].map((s) => (
                  <optgroup key={s} label={`${s === 'right' ? 'Right' : 'Left'} Limb Veins`}>
                    {ANATOMICAL_VESSELS.map((v) => (
                      <option key={`${s}_${v.vesselKey}`} value={`${s}_${v.vesselKey}`}>
                        {s === 'right' ? 'Right' : 'Left'} {v.name} ({v.category})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddAbnormalVessel}
              className="mt-5 bg-teal-700 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Prior Abnormality
            </button>
          </div>

          {/* List of Added Prior Abnormalities */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
              Documented Prior Abnormal Vessels ({abnormalKeys.length}):
            </h4>

            {abnormalKeys.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                No prior vessel abnormalities added yet. Select a vessel above to document external report findings.
              </div>
            ) : (
              abnormalKeys.map((vKey) => {
                const item = localFindings[vKey];
                return (
                  <div key={vKey} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-amber-300 text-sm">{item.vesselName}</span>
                      <button
                        onClick={() => handleRemoveFinding(vKey)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/50 flex items-center gap-1 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Patency */}
                      <div>
                        <label className="block text-slate-400 text-[11px] font-semibold mb-1">Patency / Occlusion</label>
                        <select
                          value={item.patency || 'not_documented'}
                          onChange={(e) => handleUpdateFinding(vKey, { patency: e.target.value as Patency })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                        >
                          <option value="completely_occluded">Completely Occluded</option>
                          <option value="mostly_occluded">Mostly Occluded</option>
                          <option value="partially_occluded">Partially Occluded</option>
                          <option value="recanalised">Recanalised / Flow Channels</option>
                          <option value="patent">Patent</option>
                          <option value="not_documented">Not Documented</option>
                        </select>
                      </div>

                      {/* Chronicity */}
                      <div>
                        <label className="block text-slate-400 text-[11px] font-semibold mb-1">Sonographic Chronicity</label>
                        <select
                          value={item.chronicity || 'not_documented'}
                          onChange={(e) => handleUpdateFinding(vKey, { chronicity: e.target.value as SonographicChronicity })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                        >
                          <option value="acute_appearing">Acute-appearing</option>
                          <option value="subacute_appearing">Subacute-appearing</option>
                          <option value="chronic_post_thrombotic">Chronic post-thrombotic</option>
                          <option value="acute_on_chronic">Acute on chronic</option>
                          <option value="not_documented">Not Documented</option>
                        </select>
                      </div>

                      {/* Compressibility */}
                      <div>
                        <label className="block text-slate-400 text-[11px] font-semibold mb-1">Compressibility</label>
                        <select
                          value={item.compressibility || 'not_documented'}
                          onChange={(e) => handleUpdateFinding(vKey, { compressibility: e.target.value as Compressibility })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                        >
                          <option value="non_compressible">Non-compressible</option>
                          <option value="partially_compressible">Partially compressible</option>
                          <option value="fully_compressible">Fully compressible</option>
                          <option value="not_documented">Not Documented</option>
                        </select>
                      </div>
                    </div>

                    {/* Extent & Comments */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                          Proximal Extent [ Distance | Unit | Relationship | Landmark ]
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
                          <input
                            type="number"
                            placeholder="Dist"
                            value={item.proximalExtent?.distance ?? ''}
                            onChange={(e) =>
                              handleUpdateFinding(vKey, {
                                proximalExtent: {
                                  distance: e.target.value !== '' ? Number(e.target.value) : null,
                                  unit: item.proximalExtent?.unit || 'mm',
                                  relation: item.proximalExtent?.relation || 'above',
                                  landmark: item.proximalExtent?.landmark || 'knee_crease'
                                }
                              })
                            }
                            className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs"
                          />
                          <select
                            value={item.proximalExtent?.unit || 'mm'}
                            onChange={(e) =>
                              handleUpdateFinding(vKey, {
                                proximalExtent: {
                                  distance: item.proximalExtent?.distance ?? null,
                                  unit: e.target.value as 'mm' | 'cm',
                                  relation: item.proximalExtent?.relation || 'above',
                                  landmark: item.proximalExtent?.landmark || 'knee_crease'
                                }
                              })
                            }
                            className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs"
                          >
                            <option value="mm">mm</option>
                            <option value="cm">cm</option>
                          </select>
                          <select
                            value={item.proximalExtent?.relation || 'above'}
                            onChange={(e) =>
                              handleUpdateFinding(vKey, {
                                proximalExtent: {
                                  distance: item.proximalExtent?.distance ?? null,
                                  unit: item.proximalExtent?.unit || 'mm',
                                  relation: e.target.value as ExtentRelation,
                                  landmark: item.proximalExtent?.landmark || 'knee_crease'
                                }
                              })
                            }
                            className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs"
                          >
                            {Object.entries(EXTENT_RELATION_LABELS).map(([relKey, label]) => (
                              <option key={relKey} value={relKey}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={item.proximalExtent?.landmark || 'knee_crease'}
                            onChange={(e) =>
                              handleUpdateFinding(vKey, {
                                proximalExtent: {
                                  distance: item.proximalExtent?.distance ?? null,
                                  unit: item.proximalExtent?.unit || 'mm',
                                  relation: item.proximalExtent?.relation || 'above',
                                  landmark: e.target.value as Landmark
                                }
                              })
                            }
                            className="sm:col-span-4 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs truncate"
                          >
                            {Object.entries(LANDMARK_LABELS).map(([k, label]) => (
                              <option key={k} value={k}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] font-semibold mb-1">Prior Report Excerpt / Comments</label>
                        <input
                          type="text"
                          placeholder="e.g. Occlusive thrombus reported 50 mm below knee crease..."
                          value={item.comments || ''}
                          onChange={(e) => handleUpdateFinding(vKey, { comments: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 text-xs">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold">
            Cancel
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Apply Prior Findings
          </button>
        </div>
      </div>
    </div>
  );
};
