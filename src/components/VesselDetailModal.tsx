// Detailed Vessel Abnormality Card & Editor Modal

import React from 'react';
import { VesselFinding, Compressibility, Patency, ThrombusEchogenicity, SonographicChronicity, MorphologyOption, Landmark, NonVisualizationReason, NON_VISUALIZATION_REASON_LABELS, ExtentRelation, EXTENT_RELATION_LABELS } from '../types/dvt';
import { LANDMARK_LABELS } from '../data/anatomyData';
import { formatExtent } from '../utils/reportGenerator';
import { X, CheckCircle, AlertTriangle, ShieldAlert, EyeOff, Info } from 'lucide-react';

interface VesselDetailModalProps {
  finding: VesselFinding | null;
  onClose: () => void;
  onSaveFinding: (updatedFinding: VesselFinding) => void;
}

const LANDMARK_KEYS: Landmark[] = [
  'knee_crease',
  'SFJ',
  'SPJ',
  'groin_crease',
  'inguinal_ligament',
  'profunda_fv_junction',
  'adductor_canal',
  'fibular_head',
  'proximal_calf',
  'mid_calf',
  'ankle_crease',
  'medial_malleolus',
  'lateral_malleolus',
  'common_iliac_junction',
  'custom'
];

function getRelationOptionsForLandmark(landmark?: Landmark): Array<{ key: ExtentRelation; label: string }> {
  const isJunction = landmark && ['SFJ', 'SPJ', 'profunda_fv_junction', 'common_iliac_junction'].includes(landmark);
  if (isJunction) {
    return [
      { key: 'distal_to', label: 'Distal to' },
      { key: 'proximal_to', label: 'Proximal to' },
      { key: 'at', label: 'At' },
      { key: 'extending_to', label: 'Extending to' },
      { key: 'extending_through', label: 'Extending through' },
      { key: 'above', label: 'Above' },
      { key: 'below', label: 'Below' },
      { key: 'superior_to', label: 'Superior to' },
      { key: 'inferior_to', label: 'Inferior to' }
    ];
  }

  return [
    { key: 'above', label: 'Above' },
    { key: 'below', label: 'Below' },
    { key: 'at', label: 'At' },
    { key: 'proximal_to', label: 'Proximal to' },
    { key: 'distal_to', label: 'Distal to' },
    { key: 'extending_to', label: 'Extending to' },
    { key: 'extending_through', label: 'Extending through' },
    { key: 'superior_to', label: 'Superior to' },
    { key: 'inferior_to', label: 'Inferior to' }
  ];
}

const MORPHOLOGY_ITEMS: Array<{ id: MorphologyOption; label: string }> = [
  { id: 'vein_expanded', label: 'Vein Expanded / Dilated' },
  { id: 'normal_calibre', label: 'Normal Vein Calibre' },
  { id: 'vein_contracted', label: 'Vein Contracted / Small' },
  { id: 'adherent_to_wall', label: 'Adherent to Vessel Wall' },
  { id: 'mobile_component', label: 'Mobile Component' },
  { id: 'free_floating', label: 'Free-Floating Thrombus Tail' },
  { id: 'synechiae_webs', label: 'Intraluminal Synechiae / Webs' },
  { id: 'recanalisation', label: 'Channel Recanalisation Present' },
  { id: 'collateralisation', label: 'Collateral Vein Flow' },
  { id: 'wall_thickening', label: 'Venous Wall Thickening' },
  { id: 'calcification', label: 'Intraluminal Calcification' }
];

export const VesselDetailModal: React.FC<VesselDetailModalProps> = ({
  finding,
  onClose,
  onSaveFinding
}) => {
  if (!finding) return null;

  const handleMorphologyToggle = (opt: MorphologyOption) => {
    const current = finding.morphology || [];
    const next = current.includes(opt) ? current.filter((m) => m !== opt) : [...current, opt];
    onSaveFinding({ ...finding, morphology: next });
  };

  const isSuperficial = finding.category === 'superficial';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden text-slate-100 my-8">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-950 border border-teal-800 text-teal-300">
              {finding.status === 'abnormal' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {finding.vesselName}
                <span className="text-xs uppercase bg-slate-800 px-2 py-0.5 rounded text-teal-300 font-semibold border border-slate-700">
                  {finding.side.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Detailed Sonographic Examination & Extent Documentation</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Status Bar */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              Vessel Examination Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'normal', label: 'Normal / Clear' },
                { id: 'abnormal', label: 'Abnormal / Thrombus' },
                { id: 'not_visualised', label: 'Not Visualised (NV)' },
                { id: 'not_assessed', label: 'Not Examined (NA)' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    onSaveFinding({
                      ...finding,
                      status: st.id as any,
                      nonVisualizationReason: st.id === 'not_visualised' ? (finding.nonVisualizationReason || 'body_habitus') : finding.nonVisualizationReason,
                      thrombusPresence: st.id === 'abnormal' ? 'thrombus_present' : undefined,
                      compressibility: st.id === 'normal' ? 'fully_compressible' : 'non_compressible',
                      patency: st.id === 'normal' ? 'patent' : 'completely_occluded',
                      chronicity: st.id === 'abnormal' ? 'acute_appearing' : undefined
                    })
                  }
                  className={`py-2 px-2 rounded-lg font-semibold border text-center transition-all ${
                    finding.status === st.id
                      ? st.id === 'normal'
                        ? 'bg-emerald-700 border-emerald-500 text-white shadow-md'
                        : st.id === 'abnormal'
                        ? 'bg-rose-700 border-rose-500 text-white shadow-lg'
                        : st.id === 'not_visualised'
                        ? 'bg-amber-800 border-amber-600 text-amber-100 shadow-md'
                        : 'bg-slate-700 border-slate-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Non-Visualization Panel */}
          {finding.status === 'not_visualised' && (
            <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <EyeOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Reason for Non-Visualization (NV)</span>
              </div>
              <p className="text-slate-300 text-xs">
                An attempt was made to examine this vessel, but it could not be visualised. Please select the primary sonographic or technical limitation:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Limitation Reason</label>
                  <select
                    value={finding.nonVisualizationReason || 'body_habitus'}
                    onChange={(e) =>
                      onSaveFinding({
                        ...finding,
                        nonVisualizationReason: e.target.value as NonVisualizationReason
                      })
                    }
                    className="w-full bg-slate-900 border border-amber-700/80 rounded-lg px-2.5 py-1.5 text-amber-100 font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    {Object.entries(NON_VISUALIZATION_REASON_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Additional Detail / Custom Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Plaster cast above knee, severe edema, open dressing..."
                    value={finding.customNonVisualizationReason || ''}
                    onChange={(e) =>
                      onSaveFinding({
                        ...finding,
                        customNonVisualizationReason: e.target.value
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Not Examined / Out of Protocol Scope Panel */}
          {finding.status === 'not_assessed' && (
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-300 text-xs">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                <strong className="text-slate-200">Not Examined / Not Assessed (NA):</strong> This vessel segment was omitted or out of scope for the routine ultrasound protocol.
              </span>
            </div>
          )}

          {/* Expanded Abnormality Section */}
          {finding.status === 'abnormal' && (
            <div className="space-y-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
              {/* Compressibility & Patency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Compressibility: Show for thigh, popliteal, calf_deep, muscular, superficial. Hide for pelvis */}
                {finding.category !== 'pelvis' && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Transducer Compressibility</label>
                    <select
                      value={finding.compressibility || 'non_compressible'}
                      onChange={(e) => onSaveFinding({ ...finding, compressibility: e.target.value as Compressibility })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
                    >
                      <option value="fully_compressible">Fully Compressible</option>
                      <option value="partially_compressible">Partially Compressible</option>
                      <option value="non_compressible">Non-Compressible</option>
                      <option value="compression_not_possible">Compression Not Possible (Pain/Position)</option>
                      <option value="not_applicable">Not Applicable</option>
                    </select>
                  </div>
                )}

                {/* Lumen Patency / Occlusion */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lumen Patency / Occlusion</label>
                  <select
                    value={finding.patency || 'completely_occluded'}
                    onChange={(e) => onSaveFinding({ ...finding, patency: e.target.value as Patency })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
                  >
                    <option value="patent">Patent</option>
                    <option value="mostly_patent">Mostly Patent</option>
                    <option value="partially_occluded">Partially Occluded</option>
                    <option value="mostly_occluded">Mostly Occluded</option>
                    <option value="completely_occluded">Completely Occluded</option>
                    <option value="recanalised">Recanalised / Channels Present</option>
                    <option value="chronic_post_thrombotic_no_acute">Chronic Post-Thrombotic Change</option>
                    <option value="indeterminate">Indeterminate Patency</option>
                  </select>
                </div>
              </div>

              {/* Echogenicity & Chronicity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Thrombus Echogenicity</label>
                  <select
                    value={finding.echogenicity || 'hypoechoic'}
                    onChange={(e) => onSaveFinding({ ...finding, echogenicity: e.target.value as ThrombusEchogenicity })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                  >
                    <option value="anechoic_hypoechoic">Anechoic / Very Hypoechoic</option>
                    <option value="hypoechoic">Hypoechoic</option>
                    <option value="mixed_echogenicity">Mixed Echogenicity</option>
                    <option value="echogenic">Echogenic</option>
                    <option value="highly_echogenic">Highly Echogenic</option>
                    <option value="calcified">Calcified</option>
                    <option value="heterogeneous">Heterogeneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sonographic Chronicity Appearance</label>
                  <select
                    value={finding.chronicity || 'acute_appearing'}
                    onChange={(e) => onSaveFinding({ ...finding, chronicity: e.target.value as SonographicChronicity })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-teal-300 font-semibold"
                  >
                    <option value="acute_appearing">Acute-Appearing</option>
                    <option value="subacute_appearing">Subacute-Appearing</option>
                    <option value="chronic_post_thrombotic">Chronic / Post-Thrombotic Appearance</option>
                    <option value="acute_on_chronic">Acute-on-Chronic Appearance</option>
                    <option value="indeterminate_age">Indeterminate Age</option>
                  </select>
                </div>
              </div>

              {/* Structured Landmark Extent Fields */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-teal-400 uppercase tracking-wider text-[11px] block">
                    LANDMARK-BASED THROMBUS EXTENT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    [ Distance ] [ Unit ] [ Relationship ] [ Landmark ]
                  </span>
                </div>

                {/* Proximal Extent Row */}
                <div className="space-y-1">
                  <span className="text-slate-300 font-bold text-xs block">PROXIMAL EXTENT</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                    {/* Distance */}
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        placeholder="Distance"
                        value={finding.proximalExtent?.distance ?? ''}
                        onChange={(e) => {
                          const dist = e.target.value !== '' ? Number(e.target.value) : null;
                          const currentLM = finding.proximalExtent?.landmark || 'knee_crease';
                          let defaultRel = finding.proximalExtent?.relation || '';
                          if (!defaultRel && dist !== null) {
                            defaultRel = ['SFJ', 'SPJ', 'profunda_fv_junction'].includes(currentLM) ? 'distal_to' : 'above';
                          }
                          onSaveFinding({
                            ...finding,
                            proximalExtent: {
                              distance: dist,
                              unit: finding.proximalExtent?.unit || 'mm',
                              relation: defaultRel,
                              landmark: currentLM,
                              customLandmark: finding.proximalExtent?.customLandmark
                            }
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-2">
                      <select
                        value={finding.proximalExtent?.unit || 'mm'}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            proximalExtent: {
                              distance: finding.proximalExtent?.distance ?? null,
                              unit: e.target.value as 'mm' | 'cm',
                              relation: finding.proximalExtent?.relation || '',
                              landmark: finding.proximalExtent?.landmark || 'knee_crease',
                              customLandmark: finding.proximalExtent?.customLandmark
                            }
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      >
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>

                    {/* Relationship */}
                    <div className="sm:col-span-3">
                      <select
                        value={finding.proximalExtent?.relation || ''}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            proximalExtent: {
                              distance: finding.proximalExtent?.distance ?? null,
                              unit: finding.proximalExtent?.unit || 'mm',
                              relation: e.target.value as ExtentRelation | '',
                              landmark: finding.proximalExtent?.landmark || 'knee_crease',
                              customLandmark: finding.proximalExtent?.customLandmark
                            }
                          })
                        }
                        className={`w-full bg-slate-950 border rounded px-2 py-1.5 text-xs focus:outline-none ${
                          finding.proximalExtent?.distance !== null &&
                          finding.proximalExtent?.distance !== undefined &&
                          finding.proximalExtent.distance > 0 &&
                          !finding.proximalExtent.relation
                            ? 'border-amber-500 text-amber-200'
                            : 'border-slate-700 text-slate-100 focus:border-teal-500'
                        }`}
                      >
                        <option value="">-- Direction --</option>
                        {getRelationOptionsForLandmark(finding.proximalExtent?.landmark).map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Landmark */}
                    <div className="sm:col-span-4">
                      <select
                        value={finding.proximalExtent?.landmark || 'knee_crease'}
                        onChange={(e) => {
                          const newLM = e.target.value as Landmark;
                          let newRel = finding.proximalExtent?.relation || '';
                          if (!newRel && finding.proximalExtent?.distance) {
                            newRel = ['SFJ', 'SPJ', 'profunda_fv_junction'].includes(newLM) ? 'distal_to' : 'above';
                          }
                          onSaveFinding({
                            ...finding,
                            proximalExtent: {
                              distance: finding.proximalExtent?.distance ?? null,
                              unit: finding.proximalExtent?.unit || 'mm',
                              relation: newRel,
                              landmark: newLM,
                              customLandmark: finding.proximalExtent?.customLandmark
                            }
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 truncate focus:outline-none focus:border-teal-500"
                      >
                        {LANDMARK_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {LANDMARK_LABELS[k] || k}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom Landmark text if 'custom' */}
                  {finding.proximalExtent?.landmark === 'custom' && (
                    <input
                      type="text"
                      placeholder="Specify custom proximal landmark name..."
                      value={finding.proximalExtent.customLandmark || ''}
                      onChange={(e) =>
                        onSaveFinding({
                          ...finding,
                          proximalExtent: {
                            ...finding.proximalExtent!,
                            customLandmark: e.target.value
                          }
                        })
                      }
                      className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                    />
                  )}

                  {/* Validation inline prompts for Proximal */}
                  {finding.proximalExtent?.distance !== null &&
                    finding.proximalExtent?.distance !== undefined &&
                    finding.proximalExtent.distance > 0 &&
                    !finding.proximalExtent.relation && (
                      <p className="text-[11px] font-semibold text-amber-400 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400 inline flex-shrink-0" />
                        Specify relationship to landmark (e.g. Above / Distal to).
                      </p>
                    )}
                  {finding.proximalExtent?.distance === 0 &&
                    !['at', 'extending_to', 'extending_through'].includes(finding.proximalExtent?.relation || '') && (
                      <p className="text-[11px] text-teal-300/90 mt-0.5 italic">
                        Tip: For zero distance, consider selecting 'At' or 'Extending to'.
                      </p>
                    )}
                </div>

                {/* Distal Extent Row */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-slate-300 font-bold text-xs block">DISTAL EXTENT</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                    {/* Distance */}
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        placeholder="Distance"
                        value={finding.distalExtent?.distance ?? ''}
                        onChange={(e) => {
                          const dist = e.target.value !== '' ? Number(e.target.value) : null;
                          const currentLM = finding.distalExtent?.landmark || 'knee_crease';
                          let defaultRel = finding.distalExtent?.relation || '';
                          if (!defaultRel && dist !== null) {
                            defaultRel = ['SFJ', 'SPJ', 'profunda_fv_junction'].includes(currentLM) ? 'distal_to' : 'below';
                          }
                          onSaveFinding({
                            ...finding,
                            distalExtent: {
                              distance: dist,
                              unit: finding.distalExtent?.unit || 'mm',
                              relation: defaultRel,
                              landmark: currentLM,
                              customLandmark: finding.distalExtent?.customLandmark
                            }
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-2">
                      <select
                        value={finding.distalExtent?.unit || 'mm'}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            distalExtent: {
                              distance: finding.distalExtent?.distance ?? null,
                              unit: e.target.value as 'mm' | 'cm',
                              relation: finding.distalExtent?.relation || '',
                              landmark: finding.distalExtent?.landmark || 'knee_crease',
                              customLandmark: finding.distalExtent?.customLandmark
                            }
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      >
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>

                    {/* Relationship */}
                    <div className="sm:col-span-3">
                      <select
                        value={finding.distalExtent?.relation || ''}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            distalExtent: {
                              distance: finding.distalExtent?.distance ?? null,
                              unit: finding.distalExtent?.unit || 'mm',
                              relation: e.target.value as ExtentRelation | '',
                              landmark: finding.distalExtent?.landmark || 'knee_crease',
                              customLandmark: finding.distalExtent?.customLandmark
                            }
                          })
                        }
                        className={`w-full bg-slate-950 border rounded px-2 py-1.5 text-xs focus:outline-none ${
                          finding.distalExtent?.distance !== null &&
                          finding.distalExtent?.distance !== undefined &&
                          finding.distalExtent.distance > 0 &&
                          !finding.distalExtent.relation
                            ? 'border-amber-500 text-amber-200'
                            : 'border-slate-700 text-slate-100 focus:border-teal-500'
                        }`}
                      >
                        <option value="">-- Direction --</option>
                        {getRelationOptionsForLandmark(finding.distalExtent?.landmark).map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Landmark */}
                    <div className="sm:col-span-4">
                      <select
                        value={finding.distalExtent?.landmark || 'knee_crease'}
                        onChange={(e) => {
                          const newLM = e.target.value as Landmark;
                          let newRel = finding.distalExtent?.relation || '';
                          if (!newRel && finding.distalExtent?.distance) {
                            newRel = ['SFJ', 'SPJ', 'profunda_fv_junction'].includes(newLM) ? 'distal_to' : 'below';
                          }
                          onSaveFinding({
                            ...finding,
                            distalExtent: {
                              distance: finding.distalExtent?.distance ?? null,
                              unit: finding.distalExtent?.unit || 'mm',
                              relation: newRel,
                              landmark: newLM,
                              customLandmark: finding.distalExtent?.customLandmark
                            }
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 truncate focus:outline-none focus:border-teal-500"
                      >
                        {LANDMARK_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {LANDMARK_LABELS[k] || k}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom Landmark text if 'custom' */}
                  {finding.distalExtent?.landmark === 'custom' && (
                    <input
                      type="text"
                      placeholder="Specify custom distal landmark name..."
                      value={finding.distalExtent.customLandmark || ''}
                      onChange={(e) =>
                        onSaveFinding({
                          ...finding,
                          distalExtent: {
                            ...finding.distalExtent!,
                            customLandmark: e.target.value
                          }
                        })
                      }
                      className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                    />
                  )}

                  {/* Validation inline prompts for Distal */}
                  {finding.distalExtent?.distance !== null &&
                    finding.distalExtent?.distance !== undefined &&
                    finding.distalExtent.distance > 0 &&
                    !finding.distalExtent.relation && (
                      <p className="text-[11px] font-semibold text-amber-400 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400 inline flex-shrink-0" />
                        Specify relationship to landmark (e.g. Below / Distal to).
                      </p>
                    )}
                  {finding.distalExtent?.distance === 0 &&
                    !['at', 'extending_to', 'extending_through'].includes(finding.distalExtent?.relation || '') && (
                      <p className="text-[11px] text-teal-300/90 mt-0.5 italic">
                        Tip: For zero distance, consider selecting 'At' or 'Extending to'.
                      </p>
                    )}
                </div>

                {/* Formatted Summary Preview */}
                {formatExtent(finding) && (
                  <div className="mt-2.5 p-2 bg-slate-950/90 border border-teal-800/80 rounded text-xs font-mono text-teal-300 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-300 uppercase text-[10px] block">
                        Live Generated Report Excerpt:
                      </span>
                      <span>"{formatExtent(finding)}"</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Superficial Distance to Junction (SFJ / SPJ) */}
              {isSuperficial && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg space-y-2">
                  <span className="font-bold text-amber-300 text-[11px] block">
                    SUPERFICIAL THROMBUS PROXIMITY TO JUNCTION (SFJ / SPJ)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div>
                      <label className="text-slate-400">Junction:</label>
                      <select
                        value={finding.distanceToJunction?.junction || 'SFJ'}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            distanceToJunction: {
                              junction: e.target.value as any,
                              distanceMm: finding.distanceToJunction?.distanceMm || 0,
                              extensionIntoDeep: finding.distanceToJunction?.extensionIntoDeep || 'no_extension'
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 mt-0.5"
                      >
                        <option value="SFJ">Saphenofemoral Junction (SFJ)</option>
                        <option value="SPJ">Saphenopopliteal Junction (SPJ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400">Distance to Junction (mm):</label>
                      <input
                        type="number"
                        placeholder="Distance in mm"
                        value={finding.distanceToJunction?.distanceMm ?? ''}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            distanceToJunction: {
                              junction: finding.distanceToJunction?.junction || 'SFJ',
                              distanceMm: Number(e.target.value),
                              extensionIntoDeep: finding.distanceToJunction?.extensionIntoDeep || 'no_extension'
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 mt-0.5"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400">Deep Extension:</label>
                      <select
                        value={finding.distanceToJunction?.extensionIntoDeep || 'no_extension'}
                        onChange={(e) =>
                          onSaveFinding({
                            ...finding,
                            distanceToJunction: {
                              junction: finding.distanceToJunction?.junction || 'SFJ',
                              distanceMm: finding.distanceToJunction?.distanceMm || 0,
                              extensionIntoDeep: e.target.value as any
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 mt-0.5"
                      >
                        <option value="no_extension">No Extension Into Deep System</option>
                        <option value="extension">Extension Into Deep Vein</option>
                        <option value="unable_to_determine">Unable to Determine</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Morphology Checkboxes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Additional Morphological Features</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {MORPHOLOGY_ITEMS.map((item) => {
                    const isChecked = (finding.morphology || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMorphologyToggle(item.id)}
                        className={`px-2.5 py-1.5 rounded text-[11px] text-left transition-colors border ${
                          isChecked
                            ? 'bg-teal-950 border-teal-700 text-teal-200 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free Text Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Specific Sonographer Comments</label>
                <textarea
                  rows={2}
                  placeholder="Enter specific observations e.g. non-occlusive thrombus tail, collateral channel recruitment..."
                  value={finding.comments || ''}
                  onChange={(e) => onSaveFinding({ ...finding, comments: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
