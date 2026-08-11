// Commercial-Grade Region Status Header Component with 3-State Controls
// Features: [ Not Set ] [ ✓ Normal / Patent ] [ ! Abnormal ]
// Automatically reflects derived status and enforces safety rules.

import React, { useState } from 'react';
import { VesselFinding } from '../types/dvt';
import {
  RegionType,
  getRegionStatus,
  markRegionRoutineNormal,
  getAbnormalVesselsForRegion,
  getUnsetRoutineVesselsForRegion
} from '../utils/regionStatusUtils';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  EyeOff,
  Sparkles,
  X
} from 'lucide-react';

interface RegionStatusHeaderProps {
  region: RegionType;
  title: string;
  themeColor?: string;
  vesselFindings: Record<string, VesselFinding>;
  onBatchUpdateFindings: (updatedFindings: Record<string, VesselFinding>) => void;
  onPromptSelectAbnormalVessel?: () => void;
  extraHeaderActions?: React.ReactNode;
}

export const RegionStatusHeader: React.FC<RegionStatusHeaderProps> = ({
  region,
  title,
  themeColor = 'text-teal-400',
  vesselFindings,
  onBatchUpdateFindings,
  onPromptSelectAbnormalVessel,
  extraHeaderActions
}) => {
  const [showAbnormalPrompt, setShowAbnormalPrompt] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const derivedStatus = getRegionStatus(region, vesselFindings);
  const abnormalVessels = getAbnormalVesselsForRegion(region, vesselFindings);
  const unsetRoutineCount = getUnsetRoutineVesselsForRegion(region, vesselFindings).length;

  const hasAbnormalities = abnormalVessels.length > 0;

  const handleNormalClick = () => {
    if (hasAbnormalities && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    executeMarkNormal();
  };

  const executeMarkNormal = () => {
    const updated = markRegionRoutineNormal(region, vesselFindings);
    onBatchUpdateFindings(updated);
    setShowConfirmation(false);
    setShowAbnormalPrompt(false);
  };

  const handleAbnormalClick = () => {
    setShowAbnormalPrompt(true);
    setShowConfirmation(false);
    if (onPromptSelectAbnormalVessel) {
      onPromptSelectAbnormalVessel();
    }
  };

  const normalButtonLabel =
    region === 'iliocaval'
      ? hasAbnormalities
        ? '✓ Mark Remaining Routine Patent'
        : '✓ Mark Routine Patent'
      : hasAbnormalities
      ? '✓ Mark Remaining Routine Normal'
      : '✓ Mark Routine Normal';

  return (
    <div className="bg-slate-950 border-b border-slate-800 p-2.5 space-y-2 sticky top-0 z-20 shadow-md font-sans">
      {/* Top Title & Derived Status Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-xs uppercase tracking-wider ${themeColor}`}>
            {title}
          </span>

          {/* Derived Status Badge */}
          {derivedStatus === 'NOT_SET' && (
            <span className="bg-slate-800/80 text-slate-400 border border-slate-700/80 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>NOT SET</span>
            </span>
          )}

          {derivedStatus === 'NORMAL' && (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>✓ NORMAL</span>
            </span>
          )}

          {derivedStatus === 'LIMITED' && (
            <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <EyeOff className="w-3 h-3 text-amber-400" />
              <span>NO DVT IDENTIFIED (LIMITED)</span>
            </span>
          )}

          {derivedStatus === 'ABNORMAL' && (
            <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>! ABNORMAL ({abnormalVessels.length})</span>
            </span>
          )}
        </div>

        {extraHeaderActions && <div className="flex items-center gap-2">{extraHeaderActions}</div>}
      </div>

      {/* Segmented Controls Bar */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-bold">
        {/* Not Set Indicator Button */}
        <div
          className={`px-2 py-1.5 rounded text-center text-[10px] sm:text-xs flex items-center justify-center gap-1 border transition-colors ${
            derivedStatus === 'NOT_SET'
              ? 'bg-slate-800 text-slate-200 border-slate-600 shadow-inner'
              : 'text-slate-500 border-transparent'
          }`}
          title="Status is derived from vessel findings"
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>○ Not Set</span>
        </div>

        {/* Rapid Normal Button */}
        <button
          type="button"
          onClick={handleNormalClick}
          className={`px-2 py-1.5 rounded text-center text-[10px] sm:text-xs flex items-center justify-center gap-1 border transition-all ${
            derivedStatus === 'NORMAL'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/90 hover:text-emerald-100'
          }`}
          title="Mark routine unset vessels in this region as normal without overwriting abnormalities"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{normalButtonLabel}</span>
        </button>

        {/* Mark Abnormal Button */}
        <button
          type="button"
          onClick={handleAbnormalClick}
          className={`px-2 py-1.5 rounded text-center text-[10px] sm:text-xs flex items-center justify-center gap-1 border transition-all ${
            derivedStatus === 'ABNORMAL'
              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
              : 'bg-rose-950/70 text-rose-300 border-rose-800/80 hover:bg-rose-900/90 hover:text-rose-100'
          }`}
          title="Select specific vessel segment to mark abnormal"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>! Abnormal</span>
        </button>
      </div>

      {/* Safety Confirmation Modal/Banner when Abnormalities exist and Normal is clicked */}
      {showConfirmation && (
        <div className="p-2.5 bg-amber-950/90 border border-amber-700/80 rounded-lg text-amber-100 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-200">
                  This section contains {abnormalVessels.length} abnormal vessel(s) (
                  {abnormalVessels.map((v) => v.vesselName).join(', ')}).
                </p>
                <p className="text-[11px] text-amber-300/90 mt-0.5">
                  Marking routine vessels normal will preserve existing abnormal findings.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="text-amber-400 hover:text-amber-100 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-[11px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeMarkNormal}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-[11px] shadow-sm flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MARK REMAINING VESSELS NORMAL</span>
            </button>
          </div>
        </div>
      )}

      {/* Prompt Banner when Abnormal Button is clicked */}
      {showAbnormalPrompt && (
        <div className="p-2.5 bg-sky-950/90 border border-sky-700/80 rounded-lg text-sky-100 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 animate-pulse" />
            <span className="font-semibold text-sky-200">
              Select the abnormal vessel segment(s) below or on the anatomical map to characterize.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAbnormalPrompt(false)}
            className="text-sky-400 hover:text-sky-100 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
