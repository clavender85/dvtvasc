// Examination Header & Quick Toolbar Component

import React from 'react';
import { PatientHeader, ExamType, ValidationAlert, StudyType } from '../types/dvt';
import { CLINICAL_INDICATIONS } from '../data/anatomyData';
import { DEMO_CASES } from '../data/demoCases';
import { getNormalizedScope, updateHeaderScope } from '../utils/scopeUtils';
import { CheckCircle2, AlertTriangle, Printer, Copy, Save, RotateCcw, ShieldCheck, FileText, CheckSquare, Square } from 'lucide-react';

interface HeaderBarProps {
  header: PatientHeader;
  onChangeHeader: (newHeader: PatientHeader) => void;
  onSelectDemoCase: (demoId: string) => void;
  onMarkAssessedNormal: () => void;
  onSaveDraft: () => void;
  onResetExam: () => void;
  onPrintWorksheet: () => void;
  onCopySummary: () => void;
  alerts: ValidationAlert[];
  sonographerSignOff: boolean;
  onToggleSignOff: (signed: boolean) => void;
  activeTab: 'worksheet' | 'summary' | 'comparison';
  setActiveTab: (tab: 'worksheet' | 'summary' | 'comparison') => void;
  onOpenReviewPanel?: () => void;
  onScrollToFindingsPreview?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  header,
  onChangeHeader,
  onSelectDemoCase,
  onMarkAssessedNormal,
  onSaveDraft,
  onResetExam,
  onPrintWorksheet,
  onCopySummary,
  alerts,
  sonographerSignOff,
  onToggleSignOff,
  activeTab,
  setActiveTab,
  onOpenReviewPanel,
  onScrollToFindingsPreview
}) => {
  const scope = getNormalizedScope(header);

  const handleStudyTypeChange = (studyType: StudyType) => {
    const nextScope = { ...scope, studyType };
    onChangeHeader(updateHeaderScope(header, nextScope));
  };

  const handleRegionToggle = (regionKey: 'rightLowerLimb' | 'leftLowerLimb' | 'iliocaval') => {
    const nextRegions = {
      ...scope.regionsExamined,
      [regionKey]: !scope.regionsExamined[regionKey]
    };
    const nextScope = { ...scope, regionsExamined: nextRegions };
    onChangeHeader(updateHeaderScope(header, nextScope));
  };

  const handlePresetScope = (r: { rightLowerLimb: boolean; leftLowerLimb: boolean; iliocaval: boolean }) => {
    const nextScope = { ...scope, regionsExamined: r };
    onChangeHeader(updateHeaderScope(header, nextScope));
  };

  const handleIndicationToggle = (ind: string) => {
    const current = header.indications || [];
    const next = current.includes(ind) ? current.filter((i) => i !== ind) : [...current, ind];
    onChangeHeader({ ...header, indications: next });
  };

  const errorCount = alerts.filter((a) => a.severity === 'error').length;
  const reviewCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md sticky top-0 z-30">
      {/* Top Clinical System Banner */}
      <div className="bg-slate-950 px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-teal-950/80 text-teal-300 border border-teal-800/60 px-2.5 py-1 rounded-md font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            VASCULAR DUPLEX WORKFLOW • DVT CLINICAL WORKSHEET
          </div>
          <span className="text-slate-400 hidden sm:inline">Professional Sonographer Documentation System</span>
        </div>

        {/* Demo Case Loader Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Demo Preset:</span>
          <select
            onChange={(e) => e.target.value && onSelectDemoCase(e.target.value)}
            defaultValue=""
            className="bg-slate-800 text-slate-100 text-xs border border-slate-700 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
          >
            <option value="" disabled>
              Load Clinical Demo Case...
            </option>
            {DEMO_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
        {/* Navigation Tabs + Examination Review Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('worksheet')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'worksheet'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Anatomy & Worksheet
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Prior Study Comparison
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'summary'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Sonographer Summary
            </button>
          </div>

          {/* Compact Examination Review Indicator */}
          {onOpenReviewPanel && (
            <button
              onClick={onOpenReviewPanel}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border ${
                errorCount > 0
                  ? 'bg-rose-950 text-rose-200 border-rose-800 hover:bg-rose-900 animate-pulse'
                  : reviewCount > 0
                  ? 'bg-amber-950 text-amber-200 border-amber-800 hover:bg-amber-900'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
              }`}
              title="Open Examination Review Panel"
            >
              {errorCount > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>🔴 {errorCount} Error{errorCount > 1 ? 's' : ''}</span>
                </>
              ) : reviewCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚠ Review ({reviewCount})</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ Exam Review</span>
                </>
              )}
            </button>
          )}

          {/* Review Findings ↓ smooth scroll button when on worksheet view */}
          {activeTab === 'worksheet' && onScrollToFindingsPreview && (
            <button
              onClick={onScrollToFindingsPreview}
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Scroll down to live report findings preview"
            >
              <span>Review Findings</span>
              <span className="text-[10px]">↓</span>
            </button>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onMarkAssessedNormal}
            className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            title="Mark protocol-defined routine assessed vessels normal"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            Mark Routine Assessed Segments Normal
          </button>

          <button
            onClick={onSaveDraft}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            Save Draft
          </button>

          <button
            onClick={onCopySummary}
            className="bg-teal-900/80 hover:bg-teal-800 text-teal-100 border border-teal-700 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Copy className="w-3.5 h-3.5 text-teal-300" />
            Copy Summary
          </button>

          <button
            onClick={onPrintWorksheet}
            className="bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-300" />
            Print / PDF
          </button>

          <button
            onClick={onResetExam}
            className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 px-2 py-1.5 rounded-md transition-colors"
            title="Reset Worksheet to empty state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Patient & Examination Header Form */}
      <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Patient Identifiers */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Patient Identifiers
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              placeholder="Patient ID / MRN"
              value={header.patientId}
              onChange={(e) => onChangeHeader({ ...header, patientId: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Patient Name"
              value={header.patientName}
              onChange={(e) => onChangeHeader({ ...header, patientName: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={header.dob}
              onChange={(e) => onChangeHeader({ ...header, dob: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
            <input
              type="date"
              value={header.examDate}
              onChange={(e) => onChangeHeader({ ...header, examDate: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Sonographer & Study Type */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sonographer & Study Type
          </label>
          <input
            type="text"
            placeholder="Sonographer Name / Credentials"
            value={header.sonographer}
            onChange={(e) => onChangeHeader({ ...header, sonographer: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:border-teal-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Study Type:</span>
            <select
              value={scope.studyType}
              onChange={(e) => handleStudyTypeChange(e.target.value as StudyType)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:border-teal-500 focus:outline-none text-xs font-semibold text-teal-300"
            >
              <option value="Routine DVT study">Routine DVT study</option>
              <option value="Follow-up known DVT">Follow-up known DVT</option>
              <option value="Limited DVT study">Limited DVT study</option>
              <option value="Targeted / Problem-solving">Targeted / Problem-solving</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Anatomical Regions Examined */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Anatomical Regions Examined
          </label>
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
            <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-slate-200 hover:text-teal-300">
              <input
                type="checkbox"
                checked={scope.regionsExamined.rightLowerLimb}
                onChange={() => handleRegionToggle('rightLowerLimb')}
                className="accent-teal-500 rounded"
              />
              Right Leg
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-slate-200 hover:text-teal-300">
              <input
                type="checkbox"
                checked={scope.regionsExamined.leftLowerLimb}
                onChange={() => handleRegionToggle('leftLowerLimb')}
                className="accent-teal-500 rounded"
              />
              Left Leg
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-amber-200 hover:text-amber-100">
              <input
                type="checkbox"
                checked={scope.regionsExamined.iliocaval}
                onChange={() => handleRegionToggle('iliocaval')}
                className="accent-amber-500 rounded"
              />
              Iliocaval / Pelvic
            </label>
          </div>

          {/* Quick Scope Presets */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            <span className="text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: true, leftLowerLimb: false, iliocaval: false })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Right
            </button>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: false, leftLowerLimb: true, iliocaval: false })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: true, leftLowerLimb: true, iliocaval: false })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Bilateral
            </button>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: true, leftLowerLimb: false, iliocaval: true })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
            >
              R + Iliocaval
            </button>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: false, leftLowerLimb: true, iliocaval: true })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
            >
              L + Iliocaval
            </button>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: true, leftLowerLimb: true, iliocaval: true })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold"
            >
              Bilat + Iliocaval
            </button>
            <button
              type="button"
              onClick={() => handlePresetScope({ rightLowerLimb: false, leftLowerLimb: false, iliocaval: true })}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold"
            >
              Iliocaval Only
            </button>
          </div>
        </div>

        {/* Clinical Indications Pills */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Clinical Indications (Select All Applicable)
          </label>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1 py-0.5">
            {CLINICAL_INDICATIONS.map((ind) => {
              const isSelected = (header.indications || []).includes(ind);
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => handleIndicationToggle(ind)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    isSelected
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ind}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Clinical History / Notes..."
            value={header.clinicalHistory}
            onChange={(e) => onChangeHeader({ ...header, clinicalHistory: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:border-teal-500 focus:outline-none mt-1"
          />
        </div>
      </div>
    </header>
  );
};
