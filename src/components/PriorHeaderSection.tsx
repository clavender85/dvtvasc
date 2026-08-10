// Prior Examination Header Component - Systematic Metadata & Import Bar

import React, { useState } from 'react';
import { PriorExamHeader, ComparisonState, PriorExamRecord, PriorVesselFinding } from '../types/dvt';
import { Calendar, Download, Edit3, ShieldAlert, History, Trash2, CheckCircle2 } from 'lucide-react';
import { DEMO_CASES } from '../data/demoCases';

interface PriorHeaderSectionProps {
  header: PriorExamHeader;
  onChangeHeader: (header: PriorExamHeader) => void;
  onImportStructuredPrior: (priorRecord: PriorExamRecord) => void;
  onOpenManualEntryModal: () => void;
  onClearPriorStudy: () => void;
  priorTimeline: PriorExamRecord[];
  activePriorExamId?: string;
  onSelectPriorTimelineExam: (examId: string) => void;
}

export const PriorHeaderSection: React.FC<PriorHeaderSectionProps> = ({
  header,
  onChangeHeader,
  onImportStructuredPrior,
  onOpenManualEntryModal,
  onClearPriorStudy,
  priorTimeline,
  activePriorExamId,
  onSelectPriorTimelineExam
}) => {
  const [showImportDropdown, setShowImportDropdown] = useState(false);

  const handleSelectDemoPrior = (demoData: any) => {
    // Convert current vessel findings from demo case into PriorVesselFinding dictionary
    const priorMap: Record<string, PriorVesselFinding> = {};
    Object.values(demoData.vesselFindings as Record<string, any>).forEach((f: any) => {
      priorMap[f.id] = {
        vesselId: f.id,
        vesselName: f.vesselName,
        side: f.side,
        category: f.category,
        status: f.status,
        thrombusPresence: f.thrombusPresence,
        compressibility: f.compressibility,
        patency: f.patency,
        echogenicity: f.echogenicity,
        chronicity: f.chronicity,
        proximalExtent: f.proximalExtent,
        distalExtent: f.distalExtent,
        distanceToJunctionMm: f.distanceToJunction?.distanceMm,
        comments: f.comments
      };
    });

    const record: PriorExamRecord = {
      id: `prior-${Date.now()}`,
      examDate: demoData.header.examDate || '2026-05-10',
      patientId: demoData.header.patientId,
      location: 'Same institution',
      summaryText: demoData.header.clinicalHistory || 'Demo prior study loaded',
      vesselFindings: priorMap
    };

    onImportStructuredPrior(record);
    setShowImportDropdown(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg text-slate-100 p-5 space-y-4">
      {/* Top Bar / Available Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-950 border border-teal-800 text-teal-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
              PRIOR EXAMINATION METADATA & COMPARISON PROTOCOL
            </h3>
            <p className="text-xs text-slate-400">
              Configure prior study parameters to drive automatic interval change suggestions and report statements.
            </p>
          </div>
        </div>

        {/* Prior Available Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="font-bold text-slate-300 pl-2">Prior Examination Available?</span>
          <button
            type="button"
            onClick={() => onChangeHeader({ ...header, hasPriorExam: true })}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              header.hasPriorExam ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            YES
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeHeader({ ...header, hasPriorExam: false });
              onClearPriorStudy();
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              !header.hasPriorExam ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            NO
          </button>
        </div>
      </div>

      {/* Main Header Form (Visible if hasPriorExam) */}
      {header.hasPriorExam ? (
        <div className="space-y-4 text-xs">
          {/* Action Import Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-300">Prior Study Data Source:</span>
              <span className="bg-teal-950 text-teal-300 border border-teal-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                {header.comparisonSource}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Import Structured Prior Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowImportDropdown(!showImportDropdown)}
                  className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Import Structured Prior
                </button>

                {showImportDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1 text-xs">
                    <span className="block px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Demo Case as Prior Exam:
                    </span>
                    {DEMO_CASES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectDemoPrior(c.data)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors font-medium flex items-center justify-between"
                      >
                        <span>{c.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Enter Findings Manually */}
              <button
                type="button"
                onClick={onOpenManualEntryModal}
                className="bg-amber-700 hover:bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Enter Previous Findings Manually
              </button>

              {/* Clear Prior */}
              <button
                type="button"
                onClick={onClearPriorStudy}
                className="bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Clear loaded prior study"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Exam Date */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Previous Examination Date</label>
              <input
                type="date"
                value={header.examDate || ''}
                onChange={(e) => onChangeHeader({ ...header, examDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Previous Location</label>
              <select
                value={header.location}
                onChange={(e) => onChangeHeader({ ...header, location: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
              >
                <option value="Same institution">Same institution</option>
                <option value="External institution">External institution</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            {/* Images Available */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Previous Images Available?</label>
              <select
                value={header.imagesAvailable}
                onChange={(e) => onChangeHeader({ ...header, imagesAvailable: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
              >
                <option value="Yes">Yes (Images + Report)</option>
                <option value="No">No (Report Only)</option>
                <option value="Report only">Report only</option>
              </select>
            </div>

            {/* Comparison Source */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Comparison Source</label>
              <select
                value={header.comparisonSource}
                onChange={(e) => onChangeHeader({ ...header, comparisonSource: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
              >
                <option value="Previous worksheet data available">Previous worksheet data available</option>
                <option value="Images and report reviewed">Images and report reviewed</option>
                <option value="Images reviewed">Images reviewed</option>
                <option value="Report reviewed only">Report reviewed only</option>
                <option value="Patient history only">Patient history only</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Study Quality */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Previous Study Quality</label>
              <select
                value={header.quality}
                onChange={(e) => onChangeHeader({ ...header, quality: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
              >
                <option value="Adequate for comparison">Adequate for comparison</option>
                <option value="Partially adequate">Partially adequate</option>
                <option value="Limited">Limited</option>
                <option value="Unable to reliably compare">Unable to reliably compare</option>
              </select>
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Comparison Confidence Level</label>
              <select
                value={header.confidence}
                onChange={(e) => onChangeHeader({ ...header, confidence: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold text-teal-300"
              >
                <option value="HIGH">HIGH (Same protocol & clear landmarks)</option>
                <option value="MODERATE">MODERATE (Minor tech differences)</option>
                <option value="LIMITED">LIMITED (Report only / Different landmarks)</option>
              </select>
            </div>

            {/* Anticoagulation Status */}
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Prior Anticoagulation Status</label>
              <input
                type="text"
                placeholder="e.g. Rivaroxaban 20mg OD commenced 3 months ago..."
                value={header.anticoagulationStatus || ''}
                onChange={(e) => onChangeHeader({ ...header, anticoagulationStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium"
              />
            </div>
          </div>

          {/* Timeline Selector if multiple prior studies exist */}
          {priorTimeline.length > 0 && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-4 h-4 text-teal-400" />
                Examination Timeline ({priorTimeline.length} Prior Exams Saved):
              </span>
              <div className="flex flex-wrap gap-2">
                {priorTimeline.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => onSelectPriorTimelineExam(rec.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs border flex items-center gap-1.5 transition-all ${
                      activePriorExamId === rec.id
                        ? 'bg-teal-700 border-teal-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rec.examDate}</span>
                    {activePriorExamId === rec.id && <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center justify-between gap-3">
          <span>
            No prior examination specified. Click <strong>"YES"</strong> above to enable prior study comparison metrics and report section.
          </span>
          <button
            type="button"
            onClick={() => onChangeHeader({ ...header, hasPriorExam: true })}
            className="bg-teal-800 hover:bg-teal-700 text-teal-100 font-bold px-3 py-1 rounded-lg border border-teal-600 transition-colors"
          >
            Enable Comparison
          </button>
        </div>
      )}
    </div>
  );
};
