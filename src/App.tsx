// Main Ultrasound Lower Limb DVT Clinical Worksheet App

import React, { useState, useEffect } from 'react';
import { ExamState, VesselFinding, VesselStatus, ValidationAlert } from './types/dvt';
import { createInitialVesselFindings, ROUTINE_VESSEL_KEYS } from './data/anatomyData';
import { DEMO_CASES, DEMO_CASE_1_NORMAL } from './data/demoCases';
import { generateSonographerSummary } from './utils/reportGenerator';
import { runValidationChecks } from './utils/validationEngine';

import { HeaderBar } from './components/HeaderBar';
import { VesselMatrixView } from './components/VesselMatrixView';
import { AbnormalFindingsPanel } from './components/AbnormalFindingsPanel';
import { AnatomicalDiagram } from './components/AnatomicalDiagram';
import { IliocavalDiagram } from './components/IliocavalDiagram';
import { VesselTreeList } from './components/VesselTreeList';
import { PelvicVesselTreeList } from './components/PelvicVesselTreeList';
import { VesselDetailModal } from './components/VesselDetailModal';
import { ClinicalHistorySection } from './components/ClinicalHistorySection';
import { LimitationsSection } from './components/LimitationsSection';
import { DopplerSection } from './components/DopplerSection';
import { OtherFindingsSection } from './components/OtherFindingsSection';
import { ComparisonSection } from './components/ComparisonSection';
import { ReportSummaryView } from './components/ReportSummaryView';
import { PrintWorksheetView } from './components/PrintWorksheetView';
import { getNormalizedScope, updateHeaderScope } from './utils/scopeUtils';

import { ProximalExtensionPromptBanner } from './components/ProximalExtensionPromptBanner';
import { SymptomSiteSection } from './components/SymptomSiteSection';
import { ExamExtentSection } from './components/ExamExtentSection';
import { ClinicalCommunicationSection } from './components/ClinicalCommunicationSection';
import { AnatomicalVariantsSection } from './components/AnatomicalVariantsSection';

import { LayoutGrid, GitBranch } from 'lucide-react';

import { NormalConfirmationModal } from './components/NormalConfirmationModal';

export const App: React.FC = () => {
  // Load draft from localStorage or default to Demo Case 1 (Normal)
  const [examState, setExamState] = useState<ExamState>(() => {
    try {
      const saved = localStorage.getItem('dvt_worksheet_draft_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved DVT draft', e);
    }
    return DEMO_CASE_1_NORMAL;
  });

  const [activeTab, setActiveTab] = useState<'worksheet' | 'summary' | 'comparison'>('worksheet');
  const [worksheetViewMode, setWorksheetViewMode] = useState<'matrix' | 'diagram'>('matrix');
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isNormalModalOpen, setIsNormalModalOpen] = useState<boolean>(false);
  const [copyNotification, setCopyNotification] = useState(false);

  const scope = getNormalizedScope(examState.header);
  const { rightLowerLimb, leftLowerLimb, iliocaval } = scope.regionsExamined;

  const hasCFVThrombus =
    examState.vesselFindings['right_CFV']?.status === 'abnormal' ||
    examState.vesselFindings['left_CFV']?.status === 'abnormal';

  const hasPositiveDvt = (Object.values(examState.vesselFindings) as VesselFinding[]).some(
    (f) => f.status === 'abnormal'
  );

  const handleAddIliocavalScope = () => {
    const currentScope = getNormalizedScope(examState.header);
    const updatedScope = {
      ...currentScope,
      regionsExamined: {
        ...currentScope.regionsExamined,
        iliocaval: true
      }
    };
    const updatedHeader = updateHeaderScope(examState.header, updatedScope);
    setExamState((prev) => ({
      ...prev,
      header: updatedHeader
    }));
  };

  const handleToggleSelectVessel = (vesselId: string) => {
    setSelectedVesselIds((prev) =>
      prev.includes(vesselId) ? prev.filter((id) => id !== vesselId) : [...prev, vesselId]
    );
    setSelectedVesselId(vesselId);
  };

  const handleClearSelection = () => {
    setSelectedVesselIds([]);
    setSelectedVesselId(null);
  };

  const handleSelectGroup = (vesselIds: string[]) => {
    setSelectedVesselIds(vesselIds);
    if (vesselIds.length > 0) setSelectedVesselId(vesselIds[0]);
  };

  const handleOpenDetailModal = (vesselId: string) => {
    setSelectedVesselId(vesselId);
    setIsDetailModalOpen(true);
  };

  // Auto-generate summary text whenever findings update, unless manually edited by user
  useEffect(() => {
    if (!examState.userSummaryEdited) {
      const autoSummary = generateSonographerSummary(examState);
      setExamState((prev) => ({
        ...prev,
        generatedSummary: autoSummary
      }));
    }
  }, [
    examState.vesselFindings,
    examState.header,
    examState.history,
    examState.symptomSite,
    examState.examExtent,
    examState.limitations,
    examState.doppler,
    examState.contralateralCFVAssessment,
    examState.pelvic,
    examState.clinicalCommunication,
    examState.otherFindings,
    examState.anatomicalVariants,
    examState.comparisons,
    examState.userSummaryEdited
  ]);

  // Run validation engine
  const alerts: ValidationAlert[] = runValidationChecks(examState);

  // Save Draft locally
  const handleSaveDraft = () => {
    try {
      const draftData = {
        ...examState,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('dvt_worksheet_draft_v1', JSON.stringify(draftData));
      alert('Clinical examination draft saved to browser local storage.');
    } catch (e) {
      alert('Could not save draft to local storage.');
    }
  };

  // Select Demo Case
  const handleSelectDemoCase = (demoId: string) => {
    const demo = DEMO_CASES.find((c) => c.id === demoId);
    if (demo) {
      const summary = generateSonographerSummary(demo.data);
      setExamState({
        ...demo.data,
        generatedSummary: summary,
        userSummaryEdited: false
      });
      setSelectedVesselId(null);
    }
  };

  // Mark Routine Right Deep Veins Normal
  const handleMarkRoutineRightNormal = () => {
    const nextFindings = { ...examState.vesselFindings };

    Object.keys(nextFindings).forEach((vId) => {
      const f = nextFindings[vId];
      if (f.side === 'right' && ROUTINE_VESSEL_KEYS.includes(f.vesselKey)) {
        if (f.status !== 'abnormal') {
          nextFindings[vId] = {
            ...f,
            status: 'normal',
            compressibility: 'fully_compressible',
            patency: 'patent'
          };
        }
      }
    });

    setExamState((prev) => ({
      ...prev,
      vesselFindings: nextFindings,
      userSummaryEdited: false
    }));
  };

  // Mark Routine Left Deep Veins Normal
  const handleMarkRoutineLeftNormal = () => {
    const nextFindings = { ...examState.vesselFindings };

    Object.keys(nextFindings).forEach((vId) => {
      const f = nextFindings[vId];
      if (f.side === 'left' && ROUTINE_VESSEL_KEYS.includes(f.vesselKey)) {
        if (f.status !== 'abnormal') {
          nextFindings[vId] = {
            ...f,
            status: 'normal',
            compressibility: 'fully_compressible',
            patency: 'patent'
          };
        }
      }
    });

    setExamState((prev) => ({
      ...prev,
      vesselFindings: nextFindings,
      userSummaryEdited: false
    }));
  };

  // Mark Routine Bilateral Deep Veins Normal
  const handleMarkRoutineBilateralNormal = () => {
    const nextFindings = { ...examState.vesselFindings };

    Object.keys(nextFindings).forEach((vId) => {
      const f = nextFindings[vId];
      if ((f.side === 'right' || f.side === 'left') && ROUTINE_VESSEL_KEYS.includes(f.vesselKey)) {
        if (f.status !== 'abnormal') {
          nextFindings[vId] = {
            ...f,
            status: 'normal',
            compressibility: 'fully_compressible',
            patency: 'patent'
          };
        }
      }
    });

    setExamState((prev) => ({
      ...prev,
      vesselFindings: nextFindings,
      userSummaryEdited: false
    }));
  };

  // Legacy fallback: Mark all routinely assessed vessels normal
  const handleMarkAssessedNormal = handleMarkRoutineBilateralNormal;

  // Reset examination
  const handleResetExam = () => {
    if (confirm('Are you sure you want to reset all entered worksheet data?')) {
      const freshFindings = createInitialVesselFindings();
      const freshState: ExamState = {
        ...DEMO_CASE_1_NORMAL,
        vesselFindings: freshFindings,
        userSummaryEdited: false,
        sonographerSignOff: false
      };
      setExamState(freshState);
      setSelectedVesselId(null);
      localStorage.removeItem('dvt_worksheet_draft_v1');
    }
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const textToCopy = examState.generatedSummary;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyNotification(true);
      setTimeout(() => setCopyNotification(false), 2500);
    });
  };

  // Print Worksheet / PDF Trigger
  const handlePrintWorksheet = () => {
    window.print();
  };

  // Vessel Status Quick Toggle
  const handleUpdateVesselStatus = (vesselId: string, status: VesselStatus) => {
    const target = examState.vesselFindings[vesselId];
    if (!target) return;

    const updatedFinding: VesselFinding = {
      ...target,
      status,
      compressibility: status === 'normal' ? 'fully_compressible' : status === 'abnormal' ? 'non_compressible' : 'not_applicable',
      patency: status === 'normal' ? 'patent' : status === 'abnormal' ? 'completely_occluded' : 'indeterminate',
      chronicity: status === 'abnormal' ? 'acute_appearing' : undefined
    };

    setExamState((prev) => ({
      ...prev,
      vesselFindings: {
        ...prev.vesselFindings,
        [vesselId]: updatedFinding
      },
      userSummaryEdited: false
    }));
  };

  // Save specific vessel finding from modal
  const handleSaveVesselFinding = (updatedFinding: VesselFinding) => {
    setExamState((prev) => ({
      ...prev,
      vesselFindings: {
        ...prev.vesselFindings,
        [updatedFinding.id]: updatedFinding
      },
      userSummaryEdited: false
    }));
  };

  // Batch update multiple vessel findings from diagram or tree
  const handleBatchUpdateVessels = (updatedFindingsMap: Record<string, VesselFinding>) => {
    setExamState((prev) => ({
      ...prev,
      vesselFindings: {
        ...prev.vesselFindings,
        ...updatedFindingsMap
      },
      userSummaryEdited: false
    }));
  };

  const selectedFinding = selectedVesselId ? examState.vesselFindings[selectedVesselId] || null : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header & Navigation */}
      <HeaderBar
        header={examState.header}
        onChangeHeader={(header) => setExamState({ ...examState, header })}
        onSelectDemoCase={handleSelectDemoCase}
        onMarkAssessedNormal={() => setIsNormalModalOpen(true)}
        onSaveDraft={handleSaveDraft}
        onResetExam={handleResetExam}
        onPrintWorksheet={handlePrintWorksheet}
        onCopySummary={handleCopySummary}
        alerts={alerts}
        sonographerSignOff={examState.sonographerSignOff}
        onToggleSignOff={(signed) => setExamState({ ...examState, sonographerSignOff: signed })}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Copy Notification Toast */}
      {copyNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white px-4 py-2.5 rounded-lg shadow-2xl font-bold text-xs flex items-center gap-2 animate-fadeIn border border-teal-400">
          ✓ Structured Sonographer Summary copied to clipboard!
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 p-3 md:p-5 max-w-[95%] w-full mx-auto space-y-4 no-print">
        {/* Tab 1: Interactive Worksheet & Anatomical Mapping */}
        {activeTab === 'worksheet' && (
          <div className="space-y-4">
            {/* Requirement 2: Proximal Extension Prompt Banner */}
            <ProximalExtensionPromptBanner
              hasCFVThrombus={hasCFVThrombus}
              isIliocavalInScope={iliocaval}
              onAddIliocavalScope={handleAddIliocavalScope}
            />

            {/* Persistent Abnormal Findings Summary Panel */}
            <AbnormalFindingsPanel
              vesselFindings={examState.vesselFindings}
              onSelectVessel={setSelectedVesselId}
            />

            {/* View Mode Toolbar Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  WORKSHEET VIEW MODE:
                </span>
                <span className="text-slate-400">
                  {worksheetViewMode === 'matrix'
                    ? '18-Vessel Grid Matrix (Fast Sonographer Entry)'
                    : 'Interactive Anatomical Diagram & Side Trees'}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setWorksheetViewMode('matrix')}
                  className={`px-3 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                    worksheetViewMode === 'matrix'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Vessel Matrix Table
                </button>

                <button
                  type="button"
                  onClick={() => setWorksheetViewMode('diagram')}
                  className={`px-3 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                    worksheetViewMode === 'diagram'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Anatomical Diagram & Tree
                </button>
              </div>
            </div>

            {/* Primary Worksheet View Selection */}
            {worksheetViewMode === 'matrix' ? (
              <VesselMatrixView
                vesselFindings={examState.vesselFindings}
                selectedVesselId={selectedVesselId}
                onSelectVessel={setSelectedVesselId}
                onUpdateStatus={handleUpdateVesselStatus}
                onMarkRoutineRightNormal={handleMarkRoutineRightNormal}
                onMarkRoutineLeftNormal={handleMarkRoutineLeftNormal}
                onMarkRoutineBilateralNormal={handleMarkRoutineBilateralNormal}
              />
            ) : (
              <div className="space-y-4">
                {/* 1. Iliocaval Diagram & Pelvic Tree List if Pelvic/Iliocaval region selected */}
                {iliocaval && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-4 h-[680px]">
                      <PelvicVesselTreeList
                        vesselFindings={examState.vesselFindings}
                        selectedVesselId={selectedVesselId}
                        selectedVesselIds={selectedVesselIds}
                        onSelectVessel={setSelectedVesselId}
                        onUpdateStatus={handleUpdateVesselStatus}
                        onOpenDetailModal={handleOpenDetailModal}
                      />
                    </div>
                    <div className="lg:col-span-8 h-[680px]">
                      <IliocavalDiagram
                        vesselFindings={examState.vesselFindings}
                        selectedVesselId={selectedVesselId}
                        selectedVesselIds={selectedVesselIds}
                        onToggleSelectVessel={handleToggleSelectVessel}
                        onSelectVessel={setSelectedVesselId}
                        onQuickToggleStatus={handleUpdateVesselStatus}
                        onBatchUpdateFindings={handleBatchUpdateVessels}
                        onOpenDetailModal={handleOpenDetailModal}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Lower Limb Diagrams & Trees based on selected limbs */}
                {(rightLowerLimb || leftLowerLimb) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Both Limbs Examined */}
                    {rightLowerLimb && leftLowerLimb && (
                      <>
                        <div className="lg:col-span-3 h-[680px]">
                          <VesselTreeList
                            side="right"
                            includePelvic={iliocaval}
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            onSelectVessel={setSelectedVesselId}
                            onUpdateStatus={handleUpdateVesselStatus}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                        <div className="lg:col-span-6 h-[680px]">
                          <AnatomicalDiagram
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            selectedVesselIds={selectedVesselIds}
                            onToggleSelectVessel={handleToggleSelectVessel}
                            onClearSelection={handleClearSelection}
                            onSelectGroup={handleSelectGroup}
                            onSelectVessel={setSelectedVesselId}
                            onQuickToggleStatus={handleUpdateVesselStatus}
                            onBatchUpdateFindings={handleBatchUpdateVessels}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                        <div className="lg:col-span-3 h-[680px]">
                          <VesselTreeList
                            side="left"
                            includePelvic={iliocaval}
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            onSelectVessel={setSelectedVesselId}
                            onUpdateStatus={handleUpdateVesselStatus}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                      </>
                    )}

                    {/* Right Limb ONLY */}
                    {rightLowerLimb && !leftLowerLimb && (
                      <>
                        <div className="lg:col-span-4 h-[680px]">
                          <VesselTreeList
                            side="right"
                            includePelvic={iliocaval}
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            onSelectVessel={setSelectedVesselId}
                            onUpdateStatus={handleUpdateVesselStatus}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                        <div className="lg:col-span-8 h-[680px]">
                          <AnatomicalDiagram
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            selectedVesselIds={selectedVesselIds}
                            onToggleSelectVessel={handleToggleSelectVessel}
                            onClearSelection={handleClearSelection}
                            onSelectGroup={handleSelectGroup}
                            onSelectVessel={setSelectedVesselId}
                            onQuickToggleStatus={handleUpdateVesselStatus}
                            onBatchUpdateFindings={handleBatchUpdateVessels}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                      </>
                    )}

                    {/* Left Limb ONLY */}
                    {!rightLowerLimb && leftLowerLimb && (
                      <>
                        <div className="lg:col-span-8 h-[680px]">
                          <AnatomicalDiagram
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            selectedVesselIds={selectedVesselIds}
                            onToggleSelectVessel={handleToggleSelectVessel}
                            onClearSelection={handleClearSelection}
                            onSelectGroup={handleSelectGroup}
                            onSelectVessel={setSelectedVesselId}
                            onQuickToggleStatus={handleUpdateVesselStatus}
                            onBatchUpdateFindings={handleBatchUpdateVessels}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                        <div className="lg:col-span-4 h-[680px]">
                          <VesselTreeList
                            side="left"
                            includePelvic={iliocaval}
                            vesselFindings={examState.vesselFindings}
                            selectedVesselId={selectedVesselId}
                            onSelectVessel={setSelectedVesselId}
                            onUpdateStatus={handleUpdateVesselStatus}
                            onOpenDetailModal={handleOpenDetailModal}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Requirement 4: Site of Symptoms */}
            <SymptomSiteSection
              symptomSite={examState.symptomSite}
              onChangeSymptomSite={(symptomSite) => setExamState({ ...examState, symptomSite })}
            />

            {/* Requirement 5: Actual Examination Extent */}
            <ExamExtentSection
              examExtent={examState.examExtent}
              regionsExamined={scope.regionsExamined}
              studyType={scope.studyType}
              onChangeExtent={(examExtent) => setExamState({ ...examState, examExtent })}
            />

            {/* Collapsible Clinical Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClinicalHistorySection
                history={examState.history}
                onChangeHistory={(history) => setExamState({ ...examState, history })}
              />

              <LimitationsSection
                limitations={examState.limitations}
                onChangeLimitations={(limitations) => setExamState({ ...examState, limitations })}
              />
            </div>

            {/* Requirement 1 & 3: Spectral Doppler & Contralateral CFV */}
            <DopplerSection
              doppler={examState.doppler}
              regionsExamined={scope.regionsExamined}
              contralateralCFVAssessment={examState.contralateralCFVAssessment}
              hasPositiveDvt={hasPositiveDvt}
              onChangeDoppler={(doppler) => setExamState({ ...examState, doppler })}
              onChangeContralateralCFV={(cCFV) =>
                setExamState({ ...examState, contralateralCFVAssessment: cCFV })
              }
            />

            {/* Requirement 8: Anatomical Variants & Duplicated Veins */}
            <AnatomicalVariantsSection
              variants={examState.anatomicalVariants || []}
              onChangeVariants={(anatomicalVariants) =>
                setExamState({ ...examState, anatomicalVariants })
              }
            />

            {/* Requirement 7: Non-Venous & Other Findings */}
            <OtherFindingsSection
              otherFindings={examState.otherFindings}
              onChangeOtherFindings={(otherFindings) => setExamState({ ...examState, otherFindings })}
            />

            {/* Requirement 6: Positive Finding Clinical Communication */}
            <ClinicalCommunicationSection
              hasPositiveDvt={hasPositiveDvt}
              communication={examState.clinicalCommunication}
              onChangeCommunication={(clinicalCommunication) =>
                setExamState({ ...examState, clinicalCommunication })
              }
            />
          </div>
        )}

        {/* Tab 2: Prior Examination Comparison */}
        {activeTab === 'comparison' && (
          <ComparisonSection
            state={examState}
            onChangeExamState={(nextState) => setExamState(nextState)}
          />
        )}

        {/* Tab 3: Structured Sonographer Summary */}
        {activeTab === 'summary' && (
          <ReportSummaryView
            state={examState}
            summaryText={examState.generatedSummary}
            onChangeSummaryText={(text) =>
              setExamState({
                ...examState,
                generatedSummary: text,
                userSummaryEdited: true
              })
            }
            onRegenerateSummary={() => {
              const fresh = generateSonographerSummary(examState);
              setExamState({
                ...examState,
                generatedSummary: fresh,
                userSummaryEdited: false
              });
            }}
            onCopySummary={handleCopySummary}
            onPrintWorksheet={handlePrintWorksheet}
            alerts={alerts}
            sonographerSignOff={examState.sonographerSignOff}
            onToggleSignOff={(signed) => setExamState({ ...examState, sonographerSignOff: signed })}
          />
        )}
      </main>

      {/* Detailed Vessel Abnormality Editor Modal */}
      {selectedVesselId && selectedFinding && isDetailModalOpen && (
        <VesselDetailModal
          finding={selectedFinding}
          onClose={() => setIsDetailModalOpen(false)}
          onSaveFinding={(updated) => {
            handleSaveVesselFinding(updated);
            setIsDetailModalOpen(false);
          }}
        />
      )}

      {/* Routine Normal Confirmation Modal */}
      <NormalConfirmationModal
        isOpen={isNormalModalOpen}
        onClose={() => setIsNormalModalOpen(false)}
        onConfirmRight={handleMarkRoutineRightNormal}
        onConfirmLeft={handleMarkRoutineLeftNormal}
        onConfirmBilateral={handleMarkRoutineBilateralNormal}
      />

      {/* Print-only Worksheet Render */}
      <PrintWorksheetView state={examState} summaryText={examState.generatedSummary} />
    </div>
  );
};

export default App;
