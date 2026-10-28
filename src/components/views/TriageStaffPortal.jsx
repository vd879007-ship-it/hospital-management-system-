import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  HeartPulse,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  Filter,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TriageStaffPortal = () => {
  const {
    triageReviews,
    updateTriageStatus,
    triggerEmergencyAlert,
    departments,
    bookAppointment,
    setCurrentRole,
    setSelectedPatientId,
    patients,
  } = useHospital();

  const [filterAcuity, setFilterAcuity] = useState('ALL');
  const [selectedReview, setSelectedReview] = useState(null);
  const [staffNote, setStaffNote] = useState('');
  const [routingDeptId, setRoutingDeptId] = useState('dept-1');

  const filteredReviews = triageReviews.filter(r => {
    if (filterAcuity === 'ALL') return true;
    return r.urgencyFlag.includes(filterAcuity);
  });

  const handleOpenReview = (item) => {
    setSelectedReview(item);
    setStaffNote(item.staffNotes || 'Evaluated symptom acuity; airway/breathing/circulation patent.');
  };

  const handleEscalateToCodeRed = () => {
    if (!selectedReview) return;
    triggerEmergencyAlert({
      patientId: selectedReview.patientId,
      patientName: selectedReview.patientName,
      warningSigns: selectedReview.symptoms,
      origin: `Triage Review Desk (${selectedReview.assessmentId})`
    });
    updateTriageStatus(selectedReview.id, 'Escalated to Emergency', staffNote);
    alert(`Case ${selectedReview.assessmentId} ESCALATED TO STAT EMERGENCY CODE RED!`);
    setSelectedReview(null);
  };

  const handleRouteToOPD = () => {
    if (!selectedReview) return;
    const targetDept = departments.find(d => d.id === routingDeptId) || departments[0];

    updateTriageStatus(selectedReview.id, `Routed to ${targetDept.name}`, staffNote);

    // Book routine OPD appointment
    bookAppointment({
      patientId: selectedReview.patientId,
      patientName: selectedReview.patientName,
      doctorId: 'doc-1',
      doctorName: 'Dr. Carlo Toledano',
      departmentId: targetDept.id,
      deptName: targetDept.name,
      triageLevel: selectedReview.urgencyFlag,
      symptomSummary: selectedReview.summary,
    });

    confetti({ particleCount: 40, spread: 50 });
    alert(`Case ${selectedReview.assessmentId} routed to ${targetDept.name} OPD!`);
    setSelectedReview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#002855]">
              Clinical Triage Review & Acuity Routing
            </h2>
            <p className="text-xs text-slate-500">
              Human-in-the-loop validation of multilingual patient symptom screenings
            </p>
          </div>
        </div>

        {/* Acuity Filter */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs">
          <Filter className="w-3.5 h-3.5 text-cyan-600" />
          <span className="font-bold text-slate-700">Filter Acuity:</span>
          <select
            value={filterAcuity}
            onChange={(e) => setFilterAcuity(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Submissions</option>
            <option value="Red">Critical (Red Flags)</option>
            <option value="Yellow">Priority (Yellow)</option>
            <option value="Green">Routine (Green)</option>
          </select>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((item) => {
          const isCritical = item.urgencyFlag.includes('Red');
          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition shadow-sm bg-white space-y-3.5 ${
                isCritical ? 'border-red-300 shadow-red-500/10' : 'border-cyan-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {item.assessmentId}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {item.urgencyFlag}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{item.createdAt}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center">
                  <User className="w-4 h-4 text-cyan-600 mr-1.5" />
                  {item.patientName}
                </h4>
                <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1.5">
                  <strong className="text-slate-900">Patient Symptoms:</strong> {item.symptoms}
                </p>
              </div>

              <div className="bg-cyan-50/60 p-3 rounded-2xl border border-cyan-100 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 block">
                  AI Screening Summary for Human Review:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Status: <strong className="text-slate-800">{item.reviewStatus}</strong>
                </span>
                <button
                  onClick={() => handleOpenReview(item)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Review & Route</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cyan-300 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                  {selectedReview.assessmentId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Clinical Triage Decision: {selectedReview.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">Reported Symptoms:</p>
                <p className="text-slate-600">{selectedReview.symptoms}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Staff Clinical Note / Triage Justification *
                </label>
                <textarea
                  rows={2}
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  If Routing to Outpatient OPD, Select Department:
                </label>
                <select
                  value={routingDeptId}
                  onChange={(e) => setRoutingDeptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Decision Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleEscalateToCodeRed}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Escalate STAT Emergency (Code Red)</span>
              </button>

              <button
                onClick={handleRouteToOPD}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Routine OPD Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
