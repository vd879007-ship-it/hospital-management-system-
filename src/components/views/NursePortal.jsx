import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ShieldCheck,
  Send,
  Bed,
  Bell,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NursePortal = () => {
  const {
    language,
    medicationTasks,
    administerMedication,
    recordMissedDose,
    patients,
  } = useHospital();

  const [nurseName, setNurseName] = useState('Nurse Geetha R., RN (Badge #N-402)');
  const [activeTaskModal, setActiveTaskModal] = useState(null); // task object for delay/missed recording
  const [delayStatus, setDelayStatus] = useState('Delayed');
  const [delayReason, setDelayReason] = useState('Patient away at Radiology / Procedure');

  const pendingTasks = medicationTasks.filter(t => t.status === 'Pending');
  const completedTasks = medicationTasks.filter(t => t.status === 'Administered');
  const delayedTasks = medicationTasks.filter(t => t.status === 'Delayed' || t.status === 'Missed');

  const handleAdminister = (task) => {
    administerMedication(task.id, nurseName);
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleSaveDelay = () => {
    if (!activeTaskModal) return;
    recordMissedDose(activeTaskModal.id, delayStatus, delayReason, nurseName);
    alert(`Task marked as ${delayStatus}. Clinician alert triggered.`);
    setActiveTaskModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#002855]">
              Nurse Care & Electronic Medication Administration (eMAR)
            </h2>
            <p className="text-xs text-slate-500">
              Timestamped medication safety tracker with mandatory omission reasons & clinician alerts
            </p>
          </div>
        </div>

        {/* On-Duty Nurse Identification */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl text-xs">
          <span className="font-bold text-slate-600">On-Duty RN:</span>
          <input
            type="text"
            value={nurseName}
            onChange={(e) => setNurseName(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-semibold text-cyan-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Doses</span>
            <span className="text-2xl font-black text-amber-600">{pendingTasks.length}</span>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Administered Successfully</span>
            <span className="text-2xl font-black text-emerald-600">{completedTasks.length}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Delayed / Omitted (Alerted)</span>
            <span className="text-2xl font-black text-rose-600">{delayedTasks.length}</span>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
      </div>

      {/* Safety Guideline Alert */}
      <div className="bg-cyan-50/70 border border-cyan-200 p-3.5 rounded-2xl text-xs text-cyan-950 flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <p>
          <strong>5 Rights of Medication Administration Enforced:</strong> Verify right patient, right medication, right dose, right route, right time. System strictly forbids silently auto-marking medications as administered.
        </p>
      </div>

      {/* Medication Task List */}
      <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl overflow-hidden">
        <div className="p-4 bg-[#002244] text-white flex justify-between items-center text-xs">
          <span className="font-mono uppercase font-bold tracking-wider">
            Active Scheduled Medication Rounds
          </span>
          <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono">
            {medicationTasks.length} Scheduled Tasks
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {medicationTasks.map((task) => (
            <div key={task.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  task.status === 'Administered'
                    ? 'bg-emerald-100 text-emerald-700'
                    : task.status === 'Delayed'
                    ? 'bg-amber-100 text-amber-700'
                    : task.status === 'Missed'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-cyan-100 text-cyan-700'
                }`}>
                  <Bed className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {task.medicineName}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {task.dose}
                    </span>
                    <span className="text-[10px] text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded">
                      {task.route}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    Patient: <strong className="text-slate-800">{task.patientName}</strong> • {task.roomBed}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      Scheduled: {task.scheduledTime}
                    </span>
                    {task.administeredAt && (
                      <span className="text-emerald-700 font-semibold">
                        • Given at: {task.administeredAt} by {task.administeredBy}
                      </span>
                    )}
                    {task.delayReason && (
                      <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                        • Reason: {task.delayReason} (Clinician Notified)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {task.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => handleAdminister(task)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Administer</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTaskModal(task);
                        setDelayStatus('Delayed');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold rounded-xl text-xs border border-slate-200 transition"
                    >
                      Delay / Omit
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    task.status === 'Administered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {task.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delay / Missed Dose Reason Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-300 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-500 text-white rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Delayed or Missed Dose
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTaskModal.medicineName} ({activeTaskModal.patientName})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Status Designation
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDelayStatus('Delayed')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      delayStatus === 'Delayed'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Delayed
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelayStatus('Missed')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      delayStatus === 'Missed'
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Missed / Omitted
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Clinical Reason (Mandatory) *
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  <option value="Patient away at Radiology / Procedure">Patient away at Radiology / Procedure</option>
                  <option value="Patient Fasting / NPO for scheduled surgery">Patient Fasting / NPO for scheduled surgery</option>
                  <option value="Patient refused medication (Informed refusal documented)">Patient refused medication (Informed refusal documented)</option>
                  <option value="Medication temporarily held per Doctor verbal order">Medication temporarily held per Doctor verbal order</option>
                  <option value="Adverse drug reaction / nausea reported">Adverse drug reaction / nausea reported</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDelay}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow"
              >
                Save & Notify Attending Clinician
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
