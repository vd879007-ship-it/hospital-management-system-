import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ShieldCheck,
  Send,
  Bed,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NursePortal = () => {
  const {
    medicationTasks,
    administerMedication,
    recordMissedDose,
    patients,
    language,
    t
  } = useHospital();

  const isTamil = language === 'ta';

  const [nurseName, setNurseName] = useState('Nurse Geetha R., RN (Badge #N-402)');
  const [activeTaskModal, setActiveTaskModal] = useState(null); // task object for delay/omission
  const [delayStatus, setDelayStatus] = useState('Delayed'); // 'Delayed' | 'Missed'
  const [delayReason, setDelayReason] = useState('Patient away at Diagnostic Lab / Procedure');

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
    alert(
      isTamil
        ? `பணி ${activeTaskModal.taskId} நிலை "${delayStatus}" எனப் பதிவு செய்யப்பட்டது. மருத்துவருக்கு அறிவிப்பு அனுப்பப்பட்டுள்ளது.`
        : `Task ${activeTaskModal.taskId} marked as ${delayStatus}. Clinician alert triggered.`
    );
    setActiveTaskModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('nurseTitle')}
            </h1>
            <span className="badge-highlight">{isTamil ? 'மருத்துவப் பாதுகாப்பு' : 'Clinical Safety'}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {t('nurseDesc')}
          </p>
        </div>

        {/* On-Duty Nurse Identification */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl text-xs">
          <span className="font-semibold text-blue-700">{isTamil ? 'பணியிலுள்ள செவிலியர்:' : 'On-Duty RN:'}</span>
          <input
            type="text"
            value={nurseName}
            onChange={(e) => setNurseName(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              {isTamil ? 'வழங்க வேண்டிய மருந்துகள்' : 'Pending Scheduled Doses'}
            </span>
            <span className="text-3xl font-bold text-amber-600">{pendingTasks.length}</span>
          </div>
          <Clock className="w-10 h-10 text-amber-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              {isTamil ? 'வழங்கப்பட்ட மருந்துகள்' : 'Administered Doses'}
            </span>
            <span className="text-3xl font-bold text-emerald-600">{completedTasks.length}</span>
          </div>
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              {isTamil ? 'தாமதமான / தவறியவை' : 'Delayed / Omitted (Alerted)'}
            </span>
            <span className="text-3xl font-bold text-rose-600">{delayedTasks.length}</span>
          </div>
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
      </div>

      {/* Medication Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {isTamil ? 'திட்டமிடப்பட்ட மருந்து வழங்கும் அட்டவணை' : 'Scheduled Medication Administration Rounds'}
          </h2>
          <span className="text-xs font-semibold text-blue-700">
            {isTamil ? `மொத்த பணிகள்: ${medicationTasks.length}` : `Total Tasks: ${medicationTasks.length}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">{isTamil ? 'நோயாளி & படுக்கை' : 'Patient & Location'}</th>
                <th className="py-3 px-3">{isTamil ? 'மருந்து & அளவு' : 'Medication & Dose'}</th>
                <th className="py-3 px-3">{isTamil ? 'வகை' : 'Route'}</th>
                <th className="py-3 px-3">{isTamil ? 'நேரம்' : 'Scheduled Time'}</th>
                <th className="py-3 px-3">{t('status')}</th>
                <th className="py-3 px-3">{isTamil ? 'வழங்கியவர்' : 'Administered By'}</th>
                <th className="py-3 px-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicationTasks.map(task => {
                const isPending = task.status === 'Pending';
                const isAdministered = task.status === 'Administered';
                const isDelayed = task.status === 'Delayed' || task.status === 'Missed';

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-50 transition ${
                      isPending ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{task.patientName}</span>
                      <span className="text-[11px] text-blue-700 font-mono font-semibold">{task.roomBed}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{task.medicineName}</span>
                      <span className="text-[11px] text-slate-500">{task.dose}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{task.route}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{task.scheduledTime}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        isAdministered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDelayed
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isTamil
                          ? (isAdministered ? 'வழங்கப்பட்டது' : isDelayed ? 'தாமதமானது' : 'நிலுவையில் உள்ளது')
                          : task.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {task.administeredBy ? (
                        <div>
                          <span className="font-semibold block">{task.administeredBy}</span>
                          <span className="text-[10px] text-slate-400">{task.administeredAt}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleAdminister(task)}
                            className="btn-primary text-xs py-1.5 px-3 shadow-xs"
                          >
                            {isTamil ? 'மருந்து வழங்கு' : 'Administer'}
                          </button>
                          <button
                            onClick={() => setActiveTaskModal(task)}
                            className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                          >
                            {isTamil ? 'தாமதம் / நிறுத்து' : 'Hold / Delay'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {isTamil ? 'பதிவானது' : 'Recorded'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delay / Missed Dose Justification Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isTamil ? 'மருந்து தாமதம் அல்லது விடுபட்டதை பதிவு செய்' : 'Record Medication Delay or Omission'}
              </h3>
              <p className="text-xs text-slate-600">
                {activeTaskModal.medicineName} ({activeTaskModal.patientName})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">{t('status')}</label>
                <select
                  value={delayStatus}
                  onChange={(e) => setDelayStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                >
                  <option value="Delayed">{isTamil ? 'தாமதமானது (தற்காலிக நிறுத்தம்)' : 'Delayed (Temporarily Held)'}</option>
                  <option value="Missed">{isTamil ? 'தவறியது (விடுபட்ட மருந்து)' : 'Missed (Omitted Dose)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  {isTamil ? 'கட்டாய மருத்துவ காரணம் *' : 'Mandatory Clinical Justification *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveDelay}
                className="btn-primary text-xs py-2 px-4 shadow-xs"
              >
                {isTamil ? 'சேமித்து மருத்துவருக்கு அறிவி' : 'Save & Alert Clinician'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
