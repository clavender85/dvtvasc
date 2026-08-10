// Printable Examination Worksheet & Clinical Report Component

import React from 'react';
import { ExamState } from '../types/dvt';
import { ANATOMICAL_VESSELS, LANDMARK_LABELS } from '../data/anatomyData';

interface PrintWorksheetViewProps {
  state: ExamState;
  summaryText: string;
}

export const PrintWorksheetView: React.FC<PrintWorksheetViewProps> = ({ state, summaryText }) => {
  const { header, history, limitations, vesselFindings, doppler, pelvic, otherFindings, comparisons } = state;

  return (
    <div className="print-worksheet hidden print:block bg-white text-black p-8 font-sans max-w-4xl mx-auto leading-normal text-xs">
      {/* Header Banner */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            VENOUS DUPLEX ULTRASOUND EXAMINATION WORKSHEET
          </h1>
          <p className="text-slate-600 text-xs font-semibold">Lower Limb Deep Vein Thrombosis (DVT) Assessment</p>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          <div>Document ID: DVT-WS-{header.patientId || 'DRAFT'}</div>
          <div>Date: {header.examDate}</div>
        </div>
      </div>

      {/* Patient & Exam Header Table */}
      <table className="w-full border-collapse border border-slate-300 mb-4 text-xs">
        <tbody>
          <tr className="bg-slate-100">
            <td className="border border-slate-300 p-1.5 font-bold">Patient Name:</td>
            <td className="border border-slate-300 p-1.5">{header.patientName || 'N/A'}</td>
            <td className="border border-slate-300 p-1.5 font-bold">Patient ID / MRN:</td>
            <td className="border border-slate-300 p-1.5">{header.patientId || 'N/A'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-1.5 font-bold">DOB:</td>
            <td className="border border-slate-300 p-1.5">{header.dob || 'N/A'}</td>
            <td className="border border-slate-300 p-1.5 font-bold">Sonographer:</td>
            <td className="border border-slate-300 p-1.5">{header.sonographer || 'N/A'}</td>
          </tr>
          <tr className="bg-slate-100">
            <td className="border border-slate-300 p-1.5 font-bold">Exam Scope:</td>
            <td className="border border-slate-300 p-1.5" colSpan={3}>
              {header.examType}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-1.5 font-bold">Clinical History:</td>
            <td className="border border-slate-300 p-1.5" colSpan={3}>
              {header.indications.join(', ')}. {header.clinicalHistory}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Limitations */}
      {limitations.hasLimitations && (
        <div className="mb-4 p-2.5 border border-amber-300 bg-amber-50 text-amber-900 rounded text-xs">
          <strong>EXAMINATION LIMITATIONS ({limitations.severity.toUpperCase()}):</strong>{' '}
          {limitations.factors.join(', ')}. {limitations.customDetails}
        </div>
      )}

      {/* Findings Table */}
      <h2 className="font-bold text-sm uppercase border-b border-slate-400 mb-2">Detailed Vessel Observations</h2>
      <table className="w-full border-collapse border border-slate-300 mb-4 text-[11px]">
        <thead>
          <tr className="bg-slate-200 text-left font-bold">
            <th className="border border-slate-300 p-1.5">Side</th>
            <th className="border border-slate-300 p-1.5">Vessel Segment</th>
            <th className="border border-slate-300 p-1.5">Status</th>
            <th className="border border-slate-300 p-1.5">Compressibility / Patency</th>
            <th className="border border-slate-300 p-1.5">Chronicity & Extent</th>
          </tr>
        </thead>
        <tbody>
          {['right', 'left'].map((side) =>
            ANATOMICAL_VESSELS.map((vDef) => {
              const vId = `${side}_${vDef.vesselKey}`;
              const f = vesselFindings[vId];
              if (!f) return null;

              const isAbnormal = f.status === 'abnormal';

              return (
                <tr key={vId} className={isAbnormal ? 'bg-rose-50 font-medium' : ''}>
                  <td className="border border-slate-300 p-1 capitalize">{side}</td>
                  <td className="border border-slate-300 p-1">{vDef.shortName}</td>
                  <td className="border border-slate-300 p-1 capitalize">{f.status.replace('_', ' ')}</td>
                  <td className="border border-slate-300 p-1">
                    {isAbnormal ? `${f.compressibility?.replace(/_/g, ' ')} • ${f.patency?.replace(/_/g, ' ')}` : 'Normal'}
                  </td>
                  <td className="border border-slate-300 p-1">
                    {isAbnormal
                      ? `${f.chronicity?.replace(/_/g, ' ')} ${f.proximalExtent?.distance ? `(Ext: ${f.proximalExtent.distance}${f.proximalExtent.unit} to ${f.distalExtent?.distance}${f.distalExtent?.unit})` : ''}`
                      : 'Clear'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Spectral Doppler Table */}
      <h2 className="font-bold text-sm uppercase border-b border-slate-400 mb-2">Spectral Doppler Assessment</h2>
      <table className="w-full border-collapse border border-slate-300 mb-4 text-[11px]">
        <thead>
          <tr className="bg-slate-200 text-left font-bold">
            <th className="border border-slate-300 p-1.5">Limb Side</th>
            <th className="border border-slate-300 p-1.5">CFV Respiratory Phasicity</th>
            <th className="border border-slate-300 p-1.5">Popliteal Flow</th>
            <th className="border border-slate-300 p-1.5">Distal Augmentation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 p-1 font-bold">RIGHT</td>
            <td className="border border-slate-300 p-1">{doppler.rightCFVPhasicity.replace(/_/g, ' ')}</td>
            <td className="border border-slate-300 p-1">{doppler.rightPopPhasicity.replace(/_/g, ' ')}</td>
            <td className="border border-slate-300 p-1">{doppler.rightAugmentation.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 p-1 font-bold">LEFT</td>
            <td className="border border-slate-300 p-1">{doppler.leftCFVPhasicity.replace(/_/g, ' ')}</td>
            <td className="border border-slate-300 p-1">{doppler.leftPopPhasicity.replace(/_/g, ' ')}</td>
            <td className="border border-slate-300 p-1">{doppler.leftAugmentation.replace(/_/g, ' ')}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary Report Output */}
      <h2 className="font-bold text-sm uppercase border-b border-slate-400 mb-2">Sonographer Findings Summary</h2>
      <div className="bg-slate-50 border border-slate-300 p-4 rounded font-mono text-xs whitespace-pre-wrap leading-relaxed mb-6">
        {summaryText}
      </div>

      {/* Signoff Footer */}
      <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-end text-xs">
        <div>
          <div>Sonographer Sign-off: ____________________________</div>
          <div className="text-[10px] text-slate-500 mt-1">Credentials: {header.sonographer}</div>
        </div>
        <div className="text-right">
          <div>Completion Date: {new Date().toLocaleDateString()}</div>
          <div className="text-[10px] text-slate-500">Validation Verified</div>
        </div>
      </div>
    </div>
  );
};
