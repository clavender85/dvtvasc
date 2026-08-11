import React, { useState } from 'react';
import { ValidationAlert } from '../types/dvt';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X, ExternalLink, ArrowRight } from 'lucide-react';

interface ExaminationReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: ValidationAlert[];
  onGoToVessel?: (vesselId: string) => void;
  onGoToRegion?: (region: 'iliocaval' | 'right_lower_limb' | 'left_lower_limb') => void;
}

export const ExaminationReviewPanel: React.FC<ExaminationReviewPanelProps> = ({
  isOpen,
  onClose,
  alerts,
  onGoToVessel,
  onGoToRegion
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  if (!isOpen) return null;

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  const errors = activeAlerts.filter((a) => a.severity === 'error');
  const reviews = activeAlerts.filter((a) => a.severity === 'warning');
  const infos = activeAlerts.filter((a) => a.severity === 'info');

  const handleAction = (alert: ValidationAlert) => {
    if (alert.actionVesselId && onGoToVessel) {
      onGoToVessel(alert.actionVesselId);
      onClose();
    } else if (alert.vesselId && onGoToVessel) {
      onGoToVessel(alert.vesselId);
      onClose();
    } else if (alert.region && onGoToRegion) {
      onGoToRegion(alert.region);
      onClose();
    }
  };

  const handleDismissInfos = () => {
    const infoIds = infos.map((i) => i.id);
    setDismissedIds((prev) => [...prev, ...infoIds]);
  };

  const handleReviewNext = () => {
    const actionables = [...errors, ...reviews];
    if (actionables.length === 0) return;
    const nextIndex = (activeItemIndex + 1) % actionables.length;
    setActiveItemIndex(nextIndex);
    handleAction(actionables[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-950 border border-teal-800 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-slate-100 uppercase">
                EXAMINATION REVIEW
              </h3>
              <p className="text-xs text-slate-400">Clinical Data Integrity Audit & Completeness Check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Status Summary Banner */}
          {errors.length === 0 && reviews.length === 0 ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-100 text-sm">
                  ✓ Examination Review Complete
                </span>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  No report contradictions or incomplete required segments detected. Ready for final review and sign-off.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">Audit Status:</span>
                {errors.length > 0 && (
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {errors.length} Contradiction(s)
                  </span>
                )}
                {reviews.length > 0 && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {reviews.length} Clinical Prompt(s)
                  </span>
                )}
              </div>
              <button
                onClick={handleReviewNext}
                className="bg-teal-700 hover:bg-teal-600 text-white px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Review Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* SECTION 1: ERRORS (Red - Genuine Contradictions) */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase tracking-wider text-[11px] border-b border-rose-900/60 pb-1">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>CONTRADICTIONS (Action Required)</span>
              </div>
              <div className="space-y-2">
                {errors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3 bg-rose-950/80 border border-rose-800/90 rounded-xl flex items-start justify-between gap-3 text-rose-100"
                  >
                    <div>
                      <span className="font-bold text-rose-200">{err.title}</span>
                      <p className="text-xs text-rose-200/90 mt-0.5">{err.message}</p>
                    </div>
                    {(err.actionVesselId || err.vesselId || err.region) && (
                      <button
                        onClick={() => handleAction(err)}
                        className="bg-rose-900 hover:bg-rose-800 text-rose-100 border border-rose-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
                      >
                        <span>Resolve</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: REVIEWS (Amber - Clinical Prompts) */}
          {reviews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider text-[11px] border-b border-amber-900/60 pb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>CLINICAL REVIEW PROMPTS ({reviews.length})</span>
              </div>
              <div className="space-y-2">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-amber-950/70 border border-amber-800/80 rounded-xl flex items-start justify-between gap-3 text-amber-100"
                  >
                    <div>
                      <span className="font-bold text-amber-200">{rev.title}</span>
                      <p className="text-xs text-amber-200/90 mt-0.5">{rev.message}</p>
                    </div>
                    {(rev.actionVesselId || rev.vesselId || rev.region) && (
                      <button
                        onClick={() => handleAction(rev)}
                        className="bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
                      >
                        <span>Go to Vessel</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: INFORMATION (Blue/Grey - Neutral Info) */}
          {infos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-sky-400 uppercase tracking-wider text-[11px] border-b border-sky-900/60 pb-1">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>INFORMATIONAL NOTES ({infos.length})</span>
                </div>
                <button
                  onClick={handleDismissInfos}
                  className="text-sky-300 hover:text-sky-100 text-[10px] underline"
                >
                  Dismiss Informational Notes
                </button>
              </div>
              <div className="space-y-1.5">
                {infos.map((info) => (
                  <div
                    key={info.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2 text-slate-300"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{info.title}:</span>{' '}
                      <span className="text-slate-400">{info.message}</span>
                    </div>
                    <button
                      onClick={() => setDismissedIds((prev) => [...prev, info.id])}
                      className="text-slate-500 hover:text-slate-300 p-1"
                      title="Hide note"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {errors.length > 0
              ? 'Contradictions must be resolved before final sign-off.'
              : 'Review items can be acknowledged or completed in worksheet.'}
          </span>
          <div className="flex items-center gap-2">
            {infos.length > 0 && (
              <button
                onClick={handleDismissInfos}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Dismiss Informational Items
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              Close Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
