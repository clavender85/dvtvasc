import React from 'react';
import { ExamExtentState, UpperExtent, LowerExtent, RegionsExamined, StudyType } from '../types/dvt';
import { Compass } from 'lucide-react';

interface ExamExtentSectionProps {
  examExtent?: ExamExtentState;
  regionsExamined: RegionsExamined;
  studyType: StudyType;
  onChangeExtent: (extent: ExamExtentState) => void;
}

const UPPER_EXTENT_OPTIONS: UpperExtent[] = [
  'IVC',
  'Common iliac',
  'External iliac',
  'CFV / groin',
  'Other'
];

const LOWER_EXTENT_OPTIONS: LowerExtent[] = [
  'Ankle',
  'Mid calf',
  'Proximal calf',
  'Knee',
  'Other'
];

export const ExamExtentSection: React.FC<ExamExtentSectionProps> = ({
  examExtent,
  regionsExamined,
  studyType,
  onChangeExtent
}) => {
  // Compute default extent if not set
  const defaultUpper: UpperExtent = regionsExamined.iliocaval ? 'IVC' : 'CFV / groin';
  const defaultLower: LowerExtent = studyType === 'Limited DVT study' ? 'Knee' : 'Ankle';

  const rightExtent = examExtent?.right || {
    upperExtent: defaultUpper,
    lowerExtent: defaultLower
  };

  const leftExtent = examExtent?.left || {
    upperExtent: defaultUpper,
    lowerExtent: defaultLower
  };

  const handleUpdateSide = (side: 'right' | 'left', field: 'upperExtent' | 'lowerExtent', value: string) => {
    const currentSide = side === 'right' ? rightExtent : leftExtent;
    const nextSide = { ...currentSide, [field]: value };

    onChangeExtent({
      ...examExtent,
      [side]: nextSide
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 text-slate-100 text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-teal-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            ACTUAL ANATOMICAL EXAMINATION EXTENT
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Superior to Inferior Anatomical Scope</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Right Leg Extent */}
        {regionsExamined.rightLowerLimb && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-400 uppercase text-[11px] tracking-wide">
                RIGHT LIMB EXTENT
              </span>
              <span className="text-[10px] text-slate-400">
                {studyType === 'Limited DVT study' ? 'Limited Protocol' : 'Routine Protocol'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Upper Extent:</label>
                <select
                  value={rightExtent.upperExtent}
                  onChange={(e) => handleUpdateSide('right', 'upperExtent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  {UPPER_EXTENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Lower Extent:</label>
                <select
                  value={rightExtent.lowerExtent}
                  onChange={(e) => handleUpdateSide('right', 'lowerExtent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  {LOWER_EXTENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Left Leg Extent */}
        {regionsExamined.leftLowerLimb && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 uppercase text-[11px] tracking-wide">
                LEFT LIMB EXTENT
              </span>
              <span className="text-[10px] text-slate-400">
                {studyType === 'Limited DVT study' ? 'Limited Protocol' : 'Routine Protocol'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Upper Extent:</label>
                <select
                  value={leftExtent.upperExtent}
                  onChange={(e) => handleUpdateSide('left', 'upperExtent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  {UPPER_EXTENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Lower Extent:</label>
                <select
                  value={leftExtent.lowerExtent}
                  onChange={(e) => handleUpdateSide('left', 'lowerExtent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  {LOWER_EXTENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
