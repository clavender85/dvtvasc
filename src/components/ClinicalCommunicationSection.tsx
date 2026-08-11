import React, { useState } from 'react';
import { ClinicalCommunication } from '../types/dvt';
import { PhoneCall, ChevronDown, ChevronUp } from 'lucide-react';

interface ClinicalCommunicationSectionProps {
  hasPositiveDvt: boolean;
  communication?: ClinicalCommunication;
  onChangeCommunication: (comm: ClinicalCommunication) => void;
}

export const ClinicalCommunicationSection: React.FC<ClinicalCommunicationSectionProps> = ({
  hasPositiveDvt,
  communication,
  onChangeCommunication
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(hasPositiveDvt);

  const defaultDateTime = new Date().toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const current: ClinicalCommunication = communication || {
    contacted: 'Not required under local protocol',
    contactNameRole: '',
    dateTime: defaultDateTime,
    method: 'Phone',
    outcomeInstructions: '',
    patientDisposition: ''
  };

  return (
    <div className="bg-slate-900 border border-amber-600/70 rounded-xl overflow-hidden shadow-sm mb-4 text-slate-100 text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-amber-950/40 hover:bg-amber-950/60 flex items-center justify-between text-left transition-colors border-b border-amber-800/60"
      >
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-amber-300">
            CLINICAL COMMUNICATION & DIRECT NOTIFICATION
          </span>
          {hasPositiveDvt && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white ml-2">
              DVT Documented
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px] font-semibold">{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 bg-slate-900/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Radiologist / Clinician Contacted?
              </label>
              <select
                value={current.contacted}
                onChange={(e) =>
                  onChangeCommunication({
                    ...current,
                    contacted: e.target.value as ClinicalCommunication['contacted']
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-medium"
              >
                <option value="Yes">Yes — Direct Communication Completed</option>
                <option value="No">No — Urgent Alert Pending</option>
                <option value="Not required under local protocol">
                  Not required under local protocol
                </option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Contact Name & Role:
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. J. Smith (ED Registrar)"
                value={current.contactNameRole || ''}
                onChange={(e) =>
                  onChangeCommunication({ ...current, contactNameRole: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Date & Time:</label>
              <input
                type="text"
                value={current.dateTime || defaultDateTime}
                onChange={(e) =>
                  onChangeCommunication({ ...current, dateTime: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Communication Method:</label>
              <select
                value={current.method || 'Phone'}
                onChange={(e) =>
                  onChangeCommunication({
                    ...current,
                    method: e.target.value as ClinicalCommunication['method']
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              >
                <option value="Phone">Phone</option>
                <option value="In person">In Person</option>
                <option value="Electronic message">Electronic / Secure Message</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Outcome / Clinical Instructions:
              </label>
              <input
                type="text"
                placeholder="e.g. Advised ED to review for outpatient anticoagulation..."
                value={current.outcomeInstructions || ''}
                onChange={(e) =>
                  onChangeCommunication({ ...current, outcomeInstructions: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Patient Disposition / Comments:
              </label>
              <input
                type="text"
                placeholder="e.g. Patient returned to ED waiting room..."
                value={current.patientDisposition || ''}
                onChange={(e) =>
                  onChangeCommunication({ ...current, patientDisposition: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic bg-slate-950/60 p-2 rounded">
            Note: This section records operational clinical notification details for documentation purposes only.
          </div>
        </div>
      )}
    </div>
  );
};
