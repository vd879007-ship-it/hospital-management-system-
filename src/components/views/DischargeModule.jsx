import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  FileText,
  CheckCircle2,
  Printer,
  Calendar,
  AlertCircle,
  User,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DischargeModule = ({ onDone }) => {
  const {
    selectedPatient,
    dischargePatient,
    currentRole,
    discharges,
  } = useHospital();

  const [summary, setSummary] = useState(
    'Patient presented with acute upper respiratory tract symptoms. Successfully evaluated and stabilized with oral antimicrobial and antipyretic therapy. Hemodynamically stable, afebrile, and tolerating oral nutrition.'
  );
  const [instructions, setInstructions] = useState(
    'Complete the full 5-day antibiotic course.\nAvoid chilled beverages and dust exposure.\nPerform warm saline gargling twice daily.\nReport immediately to Emergency if fever spikes or shortness of breath develops.'
  );
  const [followUpDate, setFollowUpDate] = useState('2026-10-28');
  const [isFinalized, setIsFinalized] = useState(false);

  const existingDischarge = discharges.find(d => d.patientId === selectedPatient?.id);

  const handleFinalizeDischarge = (e) => {
    e.preventDefault();
    if (!summary.trim()) {
      alert('Clinical discharge summary cannot be empty.');
      return;
    }

    const instructionList = instructions.split('\n').filter(s => s.trim().length > 0);

    dischargePatient({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      summary,
      instructions: instructionList,
      followUpAt: followUpDate,
    });

    confetti({ particleCount: 50, spread: 60 });
    setIsFinalized(true);
    alert('Discharge summary successfully finalized and certified by attending clinician.');
    if (onDone) onDone();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-xl space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#002855]">
              Discharge & Post-Care Instructions
            </h3>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-800">{selectedPatient?.name}</strong> ({selectedPatient?.patientId})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {existingDischarge && (
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          )}
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
            {existingDischarge ? 'Certified' : 'Drafting'}
          </span>
        </div>
      </div>

      {/* Patient Demographic Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">Age / Sex</span>
          <span className="font-bold text-slate-800">{selectedPatient?.age} yrs / {selectedPatient?.gender}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Blood Group</span>
          <span className="font-bold text-rose-600">{selectedPatient?.bloodType}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Attending Clinician</span>
          <span className="font-bold text-cyan-800">Dr. Carlo Toledano</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Date of Discharge</span>
          <span className="font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span>
        </div>
      </div>

      {/* Form or Read-only Display */}
      {existingDischarge && !isFinalized ? (
        <div className="space-y-4 text-xs">
          <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100">
            <h4 className="font-bold text-cyan-950 uppercase text-[10px] tracking-wider mb-1">
              Clinical Summary of Care:
            </h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              {existingDischarge.summary}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-2">
              Post-Care Directives:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              {existingDischarge.instructions.map((inst, i) => (
                <li key={i} className="pl-1">{inst}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center justify-between">
            <span>Scheduled Follow-Up Appointment: {existingDischarge.followUpAt}</span>
            <span className="text-[11px] bg-emerald-200 px-2.5 py-0.5 rounded">OPD Room 102</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleFinalizeDischarge} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Summary of Hospital Care *
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Post-Discharge Instructions & Precautions (one per line) *
            </label>
            <textarea
              rows={4}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Follow-Up Clinic Visit Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1" />
              Clinician sign-off seals the discharge order.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Finalize & Sign Discharge
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
