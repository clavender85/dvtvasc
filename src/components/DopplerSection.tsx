// Spectral Doppler & Phasicity Assessment Section

import React, { useState } from 'react';
import {
  DopplerAssessment,
  PhasicityOption,
  AugmentationOption,
  RegionsExamined,
  ContralateralCFVAssessment,
  ContralateralPhasicity
} from '../types/dvt';
import { Activity, AlertCircle, Eye } from 'lucide-react';

interface DopplerSectionProps {
  doppler: DopplerAssessment;
  regionsExamined?: RegionsExamined;
  contralateralCFVAssessment?: ContralateralCFVAssessment;
  hasPositiveDvt?: boolean;
  onChangeDoppler: (newDoppler: DopplerAssessment) => void;
  onChangeContralateralCFV?: (assessment: ContralateralCFVAssessment) => void;
}

export const DopplerSection: React.FC<DopplerSectionProps> = ({
  doppler,
  regionsExamined = { rightLowerLimb: true, leftLowerLimb: true, iliocaval: false },
  contralateralCFVAssessment,
  hasPositiveDvt = false,
  onChangeDoppler,
  onChangeContralateralCFV
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const isUnilateral =
    (regionsExamined.rightLowerLimb && !regionsExamined.leftLowerLimb) ||
    (!regionsExamined.rightLowerLimb && regionsExamined.leftLowerLimb);

  const examinedSide = regionsExamined.rightLowerLimb ? 'right' : 'left';
  const contralateralSide = examinedSide === 'right' ? 'left' : 'right';

  const currentContralateral: ContralateralCFVAssessment = contralateralCFVAssessment || {
    side: contralateralSide,
    phasicity: 'phasic_preserved',
    comments: ''
  };

  const handleUpdateContralateral = (updates: Partial<ContralateralCFVAssessment>) => {
    if (onChangeContralateralCFV) {
      onChangeContralateralCFV({
        ...currentContralateral,
        side: contralateralSide,
        ...updates
      });
    }
  };

  const hasAbnormalCFV =
    doppler.rightCFVPhasicity === 'reduced_phasicity' ||
    doppler.rightCFVPhasicity === 'continuous_non_phasic' ||
    doppler.leftCFVPhasicity === 'reduced_phasicity' ||
    doppler.leftCFVPhasicity === 'continuous_non_phasic' ||
    currentContralateral.phasicity === 'reduced_phasicity' ||
    currentContralateral.phasicity === 'continuous_non_phasic';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-slate-100 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between text-left transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            SPECTRAL DOPPLER ASSESSMENT & RESPIRATORY PHASICITY
          </span>
        </div>
        <span className="text-slate-400 text-xs font-semibold">{isOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 text-xs bg-slate-900/60">
          {/* Smart Non-blocking Phasicity Reminder */}
          {hasAbnormalCFV && (
            <div className="p-3 bg-amber-950/70 border border-amber-800 rounded-lg text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300">Proximal Venous Obstruction Reminder:</span>
                Reduced respiratory phasicity at the Common Femoral Vein (CFV) may warrant assessment for more proximal venous obstruction (iliac vein or IVC) where clinically appropriate.
              </div>
            </div>
          )}

          {/* Unilateral Contralateral Notice */}
          {isUnilateral && (
            <div className="p-2.5 bg-slate-950 border border-indigo-900/60 rounded-lg text-indigo-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>
                  Unilateral Study: Full contralateral leg worksheet is hidden. Use the compact <strong>Contralateral CFV Assessment</strong> below for comparison flow.
                </span>
              </div>
            </div>
          )}

          {/* Doppler Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Right Limb / Right Contralateral CFV */}
            {regionsExamined.rightLowerLimb ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                <span className="font-bold text-teal-400 uppercase text-[11px] tracking-wider block">
                  RIGHT LOWER LIMB DOPPLER
                </span>

                <div>
                  <label className="text-slate-400 block mb-1">CFV Respiratory Phasicity:</label>
                  <select
                    value={doppler.rightCFVPhasicity}
                    onChange={(e) =>
                      onChangeDoppler({ ...doppler, rightCFVPhasicity: e.target.value as PhasicityOption })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="phasic">Phasic (Normal)</option>
                    <option value="reduced_phasicity">Reduced Phasicity</option>
                    <option value="continuous_non_phasic">Continuous / Non-Phasic</option>
                    <option value="pulsatile">Pulsatile (Right heart failure / TR)</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Popliteal Vein Flow:</label>
                  <select
                    value={doppler.rightPopPhasicity}
                    onChange={(e) =>
                      onChangeDoppler({ ...doppler, rightPopPhasicity: e.target.value as PhasicityOption })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="phasic">Phasic (Normal)</option>
                    <option value="reduced_phasicity">Reduced Phasicity</option>
                    <option value="continuous_non_phasic">Continuous / Non-Phasic</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Distal Manual Augmentation:</label>
                  <select
                    value={doppler.rightAugmentation}
                    onChange={(e) =>
                      onChangeDoppler({ ...doppler, rightAugmentation: e.target.value as AugmentationOption })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="normal_augmentation">Normal Augmentation</option>
                    <option value="reduced_augmentation">Reduced Augmentation</option>
                    <option value="absent_augmentation">Absent Augmentation</option>
                    <option value="performed_prior_to_dvt">Performed prior to identification of DVT</option>
                    <option value="not_performed_positive_dvt">Not performed due to positive DVT</option>
                    <option value="not_performed">Not Performed</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                  {hasPositiveDvt && doppler.rightAugmentation === 'not_performed' && (
                    <span className="text-[10px] text-amber-400 block mt-1">
                      Option available: "Not performed due to positive DVT"
                    </span>
                  )}
                </div>
              </div>
            ) : isUnilateral && contralateralSide === 'right' ? (
              /* Compact Contralateral Right CFV Doppler */
              <div className="p-3 bg-slate-950 border border-indigo-900/80 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300 uppercase text-[11px] tracking-wider block">
                    CONTRALATERAL RIGHT CFV DOPPLER
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded">
                    Spot Assessment Only
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Right CFV Respiratory Phasicity:</label>
                  <select
                    value={currentContralateral.phasicity}
                    onChange={(e) =>
                      handleUpdateContralateral({
                        phasicity: e.target.value as ContralateralPhasicity
                      })
                    }
                    className="w-full bg-slate-900 border border-indigo-700/80 rounded px-2 py-1 text-slate-100 font-medium"
                  >
                    <option value="phasic_preserved">Phasic / Preserved</option>
                    <option value="reduced_phasicity">Reduced Phasicity</option>
                    <option value="continuous_non_phasic">Continuous / Non-Phasic</option>
                    <option value="pulsatile">Pulsatile</option>
                    <option value="not_assessed">Not Assessed</option>
                    <option value="not_visualised">Not Visualised</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Contralateral CFV comments..."
                    value={currentContralateral.comments || ''}
                    onChange={(e) => handleUpdateContralateral({ comments: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                  />
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  Note: This does NOT mean the contralateral leg was examined in full.
                </p>
              </div>
            ) : null}

            {/* Left Limb / Left Contralateral CFV */}
            {regionsExamined.leftLowerLimb ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                <span className="font-bold text-sky-400 uppercase text-[11px] tracking-wider block">
                  LEFT LOWER LIMB DOPPLER
                </span>

                <div>
                  <label className="text-slate-400 block mb-1">CFV Respiratory Phasicity:</label>
                  <select
                    value={doppler.leftCFVPhasicity}
                    onChange={(e) =>
                      onChangeDoppler({ ...doppler, leftCFVPhasicity: e.target.value as PhasicityOption })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="phasic">Phasic (Normal)</option>
                    <option value="reduced_phasicity">Reduced Phasicity</option>
                    <option value="continuous_non_phasic">Continuous / Non-Phasic</option>
                    <option value="pulsatile">Pulsatile (Right heart failure / TR)</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Popliteal Vein Flow:</label>
                  <select
                    value={doppler.leftPopPhasicity}
                    onChange={(e) =>
                      onChangeDoppler({ ...doppler, leftPopPhasicity: e.target.value as PhasicityOption })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="phasic">Phasic (Normal)</option>
                    <option value="reduced_phasicity">Reduced Phasicity</option>
                    <option value="continuous_non_phasic">Continuous / Non-Phasic</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Distal Manual Augmentation:</label>
                  <select
                    value={doppler.leftAugmentation}
                    onChange={(e) =>
                      onChangeDoppler({ ...doppler, leftAugmentation: e.target.value as AugmentationOption })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="normal_augmentation">Normal Augmentation</option>
                    <option value="reduced_augmentation">Reduced Augmentation</option>
                    <option value="absent_augmentation">Absent Augmentation</option>
                    <option value="performed_prior_to_dvt">Performed prior to identification of DVT</option>
                    <option value="not_performed_positive_dvt">Not performed due to positive DVT</option>
                    <option value="not_performed">Not Performed</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                  {hasPositiveDvt && doppler.leftAugmentation === 'not_performed' && (
                    <span className="text-[10px] text-amber-400 block mt-1">
                      Option available: "Not performed due to positive DVT"
                    </span>
                  )}
                </div>
              </div>
            ) : isUnilateral && contralateralSide === 'left' ? (
              /* Compact Contralateral Left CFV Doppler */
              <div className="p-3 bg-slate-950 border border-indigo-900/80 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 uppercase text-[11px] tracking-wider block">
                    CONTRALATERAL LEFT CFV DOPPLER
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded">
                    Spot Assessment Only
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Left CFV Respiratory Phasicity:</label>
                  <select
                    value={currentContralateral.phasicity}
                    onChange={(e) =>
                      handleUpdateContralateral({
                        phasicity: e.target.value as ContralateralPhasicity
                      })
                    }
                    className="w-full bg-slate-900 border border-indigo-700/80 rounded px-2 py-1 text-slate-100 font-medium"
                  >
                    <option value="phasic_preserved">Phasic / Preserved</option>
                    <option value="reduced_phasicity">Reduced Phasicity</option>
                    <option value="continuous_non_phasic">Continuous / Non-Phasic</option>
                    <option value="pulsatile">Pulsatile</option>
                    <option value="not_assessed">Not Assessed</option>
                    <option value="not_visualised">Not Visualised</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Contralateral CFV comments..."
                    value={currentContralateral.comments || ''}
                    onChange={(e) => handleUpdateContralateral({ comments: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                  />
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  Note: This does NOT mean the contralateral leg was examined in full.
                </p>
              </div>
            ) : null}
          </div>

          {/* Doppler Free Text */}
          <div>
            <input
              type="text"
              placeholder="Additional Spectral Doppler Observations e.g. continuous non-phasic flow during Valsalva..."
              value={doppler.dopplerComments || ''}
              onChange={(e) => onChangeDoppler({ ...doppler, dopplerComments: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};
