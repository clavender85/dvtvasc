// Spectral Doppler & Phasicity Assessment Section

import React, { useState } from 'react';
import { DopplerAssessment, PhasicityOption, AugmentationOption } from '../types/dvt';
import { Activity, AlertCircle } from 'lucide-react';

interface DopplerSectionProps {
  doppler: DopplerAssessment;
  onChangeDoppler: (newDoppler: DopplerAssessment) => void;
}

export const DopplerSection: React.FC<DopplerSectionProps> = ({ doppler, onChangeDoppler }) => {
  const [isOpen, setIsOpen] = useState(true);

  const hasAbnormalCFV =
    doppler.rightCFVPhasicity === 'reduced_phasicity' ||
    doppler.rightCFVPhasicity === 'continuous_non_phasic' ||
    doppler.leftCFVPhasicity === 'reduced_phasicity' ||
    doppler.leftCFVPhasicity === 'continuous_non_phasic';

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

          {/* Doppler Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Right Limb Doppler */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
              <span className="font-bold text-teal-400 uppercase text-[11px] tracking-wider block">
                RIGHT LOWER LIMB DOPPLER
              </span>

              <div>
                <label className="text-slate-400 block mb-1">CFV Respiratory Phasicity:</label>
                <select
                  value={doppler.rightCFVPhasicity}
                  onChange={(e) => onChangeDoppler({ ...doppler, rightCFVPhasicity: e.target.value as PhasicityOption })}
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
                  onChange={(e) => onChangeDoppler({ ...doppler, rightPopPhasicity: e.target.value as PhasicityOption })}
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
                  onChange={(e) => onChangeDoppler({ ...doppler, rightAugmentation: e.target.value as AugmentationOption })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="normal_augmentation">Normal Augmentation</option>
                  <option value="reduced_augmentation">Reduced Augmentation</option>
                  <option value="absent_augmentation">Absent Augmentation</option>
                  <option value="not_performed">Not Performed</option>
                </select>
              </div>
            </div>

            {/* Left Limb Doppler */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
              <span className="font-bold text-sky-400 uppercase text-[11px] tracking-wider block">
                LEFT LOWER LIMB DOPPLER
              </span>

              <div>
                <label className="text-slate-400 block mb-1">CFV Respiratory Phasicity:</label>
                <select
                  value={doppler.leftCFVPhasicity}
                  onChange={(e) => onChangeDoppler({ ...doppler, leftCFVPhasicity: e.target.value as PhasicityOption })}
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
                  onChange={(e) => onChangeDoppler({ ...doppler, leftPopPhasicity: e.target.value as PhasicityOption })}
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
                  onChange={(e) => onChangeDoppler({ ...doppler, leftAugmentation: e.target.value as AugmentationOption })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="normal_augmentation">Normal Augmentation</option>
                  <option value="reduced_augmentation">Reduced Augmentation</option>
                  <option value="absent_augmentation">Absent Augmentation</option>
                  <option value="not_performed">Not Performed</option>
                </select>
              </div>
            </div>
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
