import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import { DischargeModule } from './DischargeModule';
import { TamilAudioPrescriptionModal } from '../TamilAudioPrescriptionModal';
import { AIRadiologyScreener } from '../AIRadiologyScreener';
import {
  Stethoscope,
  FileCheck,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Activity,
  History,
  FlaskConical,
  HeartPulse,
  UserCheck,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Volume2,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DoctorPortal = () => {
  const {
    language,
    selectedPatient,
    patients,
    setSelectedPatientId,
    selectedDoctorId,
    doctors,
    finalizeConsultation,
    activeEmergencyAlerts,
    acknowledgeEmergencyAlert,
    appointments,
    setCurrentRole,
    inventory,
  } = useHospital();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  // Consultation state
  const [diagnosis, setDiagnosis] = useState('Acute Bronchitis & Allergic Cough');
  const [clinicalNotes, setClinicalNotes] = useState('Throat erythematous, bilateral scattered wheezing. Advised steam inhalation, rest, and oral hydration.');
  const [requestedTests, setRequestedTests] = useState('Complete Blood Count, Resting 12-lead ECG');
  const [followUpDays, setFollowUpDays] = useState(5);

  // Prescription builder state
  const [prescriptionItems, setPrescriptionItems] = useState([
    {
      name: 'Amoxicillin + Clavulanate (Augmentin)',
      strength: '625 mg',
      dose: '1 tablet',
      frequency: '1-0-1 (Twice Daily)',
      duration: '5 Days',
      route: 'Oral (After Food)',
      quantity: 10,
      instructions: 'Complete 5-day course.'
    },
    {
      name: 'Paracetamol (Dolo 650)',
      strength: '650 mg',
      dose: '1 tablet',
      frequency: '1-0-1 (SOS / When fever > 38°C)',
      duration: '3 Days',
      route: 'Oral (After Food)',
      quantity: 6,
      instructions: 'Maintain 6 hours interval.'
    }
  ]);

  // Emergency Acknowledgement Modal
  const [selectedEmergencyAlert, setSelectedEmergencyAlert] = useState(null);
  const [ackAction, setAckAction] = useState('Patient transferred to Cath Lab Bay 2; STAT Trop-I and Dual Antiplatelet therapy initiated.');

  // Breakthrough features modals
  const [isTamilAudioOpen, setIsTamilAudioOpen] = useState(false);
  const [isAIRadiologyOpen, setIsAIRadiologyOpen] = useState(false);

  // Automated Drug-Allergy & Interaction Safety Check
  const allergyConflicts = prescriptionItems.filter(item => {
    const medLower = item.name.toLowerCase();
    return selectedPatient.allergies.some(allergy => {
      const aLower = allergy.toLowerCase();
      if (aLower.includes('penicillin') && (medLower.includes('amoxicillin') || medLower.includes('augmentin') || medLower.includes('penicillin'))) return true;
      if (aLower.includes('sulfa') && medLower.includes('sulfa')) return true;
      if (aLower.includes('aspirin') && (medLower.includes('aspirin') || medLower.includes('nsaid'))) return true;
      return false;
    });
  });

  const handleAddMedicine = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        name: inventory[0]?.name || 'Medicine',
        strength: '500 mg',
        dose: '1 tablet',
        frequency: '1-0-1',
        duration: '5 Days',
        route: 'Oral',
        quantity: 10,
        instructions: 'Take after meals'
      }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index, field, value) => {
    setPrescriptionItems(prescriptionItems.map((item, i) => {
      if (i === index) return { ...item, [field]: value };
      return item;
    }));
  };

  const handleFinalize = (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      alert('Please specify a clinical diagnosis before finalizing.');
      return;
    }

    finalizeConsultation({
      patientId: selectedPatient.id,
      doctorId: currentDoctor.id,
      diagnosis,
      notes: clinicalNotes,
      prescriptionItems,
      requestedTests,
      followUpDays,
    });

    confetti({ particleCount: 60, spread: 60 });
    alert(`Consultation finalized and prescription signed by ${currentDoctor.name}! Record locked and sent to Pharmacy.`);
  };

  const handleAcknowledgeAlert = () => {
    if (!selectedEmergencyAlert) return;
    acknowledgeEmergencyAlert(selectedEmergencyAlert.id, currentDoctor.name, ackAction);
    alert(`Emergency Alert ${selectedEmergencyAlert.alertId} acknowledged and logged with timestamp.`);
    setSelectedEmergencyAlert(null);
  };

  const [doctorTab, setDoctorTab] = useState('consult'); // 'consult' | 'discharge'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Clinician Header */}
      <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <img
            src={currentDoctor.avatar}
            alt={currentDoctor.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-500 shadow"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#002855]">
                {currentDoctor.name}
              </h2>
              <span className="text-xs font-bold bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full">
                {currentDoctor.deptName}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentDoctor.specialty} • {currentDoctor.cabin} • Reg #88492
            </p>
          </div>
        </div>

        {/* Action Toggles & Patient Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 text-xs font-bold">
            <button
              onClick={() => setDoctorTab('consult')}
              className={`px-3 py-1.5 rounded-xl transition ${
                doctorTab === 'consult' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consultation & Rx
            </button>
            <button
              onClick={() => setDoctorTab('discharge')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                doctorTab === 'discharge' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Discharge Summary</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl text-xs">
            <span className="font-bold text-slate-700">Patient:</span>
            <select
              value={selectedPatient.id}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-semibold text-[#002855] focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patientId}) - {p.bloodType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner for Doctor (if active alerts exist) */}
      {activeEmergencyAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-black/30 px-2 py-0.5 rounded text-white">
                STAT Priority (Red)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeEmergencyAlerts[0].alertId}: {activeEmergencyAlerts[0].patientName}
              </h3>
              <p className="text-xs text-rose-100">
                Warning Signs: {activeEmergencyAlerts[0].warningSigns}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEmergencyAlert(activeEmergencyAlerts[0])}
            className="px-4 py-2 bg-white text-red-700 hover:bg-rose-50 font-bold rounded-xl text-xs shadow transition shrink-0"
          >
            Acknowledge & Sign Action →
          </button>
        </div>
      )}

      {/* Main Content: Either Discharge Module or Active Consultation Grid */}
      {doctorTab === 'discharge' ? (
        <DischargeModule onDone={() => setDoctorTab('consult')} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient Verified Health Snapshot (Takes 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#002855] text-sm flex items-center">
                <UserCheck className="w-4 h-4 text-cyan-600 mr-1.5" />
                Verified Patient Snapshot
              </h3>
              <span className="font-mono text-[10px] text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-lg">
                {selectedPatient.patientId}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedPatient.name}</h4>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedPatient.age} yrs • {selectedPatient.gender} • <span className="text-rose-600 font-bold">{selectedPatient.bloodType}</span>
                </p>
              </div>
            </div>

            {/* Allergies Highlight */}
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide block mb-1">
                ⚠️ Known Drug Allergies
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedPatient.allergies.map((a, i) => (
                  <span key={i} className="text-xs font-bold text-rose-900 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Latest Vitals */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">
                Current Triage Vitals:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Temp</span>
                  <span className="font-bold text-slate-800">{selectedPatient.vitals.temperature}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">BP</span>
                  <span className="font-bold text-slate-800">{selectedPatient.vitals.bloodPressure}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Pulse</span>
                  <span className="font-bold text-slate-800">{selectedPatient.vitals.pulseRate}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">SpO2</span>
                  <span className="font-bold text-slate-800">{selectedPatient.vitals.spo2}</span>
                </div>
              </div>
            </div>

            {/* Previous History Brief */}
            <div>
              <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1.5">
                Past Clinical Episodes:
              </span>
              <div className="space-y-2">
                {selectedPatient.medicalHistory.slice(0, 2).map(h => (
                  <div key={h.id} className="p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>{h.diagnosis}</span>
                      <span className="text-slate-400">{h.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{h.provider}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Doctor Consultation & Digital Prescription Builder (Takes 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleFinalize} className="bg-white rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-cyan-600 text-white rounded-xl shadow">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#002855]">
                    Document Clinical Consultation & Sign Prescription
                  </h3>
                  <p className="text-xs text-slate-500">
                    Creates tamper-evident digital prescription linked to verified patient record
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnosis & Notes */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis / Angina Pectoris"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Examination Findings & Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Observations, auscultation, systemic examination..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Diagnostic Lab & Radiology Requests
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAIRadiologyOpen(true)}
                    className="flex items-center space-x-1 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200 transition"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                    <span>🧠 AI Radiology Pre-Screener (எக்ஸ்-ரே AI)</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={requestedTests}
                  onChange={(e) => setRequestedTests(e.target.value)}
                  placeholder="e.g. CBC, Serum Creatinine, Chest X-Ray PA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Smart Drug-Allergy Safety Alert Banner */}
            {allergyConflicts.length > 0 && (
              <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-xs space-y-1 text-rose-950 animate-pulse">
                <div className="flex items-center space-x-2 font-bold text-rose-700">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="uppercase tracking-wide">⚠️ CLINICAL CONTRAINDICATION ALERT (மருந்து ஒவ்வாமை எச்சரிக்கை):</span>
                </div>
                <p className="text-slate-700 mt-1">
                  Patient <strong>{selectedPatient.name}</strong> has a documented allergy to <strong>{selectedPatient.allergies.join(', ')}</strong>.
                  Prescription contains cross-reactive agent: <strong className="text-rose-900 bg-rose-200 px-1.5 py-0.5 rounded">{allergyConflicts.map(c => c.name).join(', ')}</strong>.
                </p>
                <span className="text-[10px] text-rose-600 font-bold block pt-0.5">
                  Recommendation: Consider Macrolide (Azithromycin) or non-penicillin alternative before signing.
                </span>
              </div>
            )}

            {/* Digital Prescription Items Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                  <Activity className="w-3.5 h-3.5 text-cyan-600 mr-1" />
                  Prescribed Medications ({prescriptionItems.length})
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsTamilAudioOpen(true)}
                    className="flex items-center space-x-1 text-xs font-bold text-cyan-800 hover:text-cyan-900 bg-cyan-100 hover:bg-cyan-200 px-3 py-1.5 rounded-xl border border-cyan-300 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-700" />
                    <span>🔊 தமிழில் ஆடியோ Rx (Tamil Voice Note)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="flex items-center space-x-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {prescriptionItems.map((item, index) => (
                  <div key={index} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Medicine Name (e.g. Augmentin)"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                          className="w-full font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="text"
                          placeholder="Strength (625mg)"
                          value={item.strength}
                          onChange={(e) => handleUpdateItem(index, 'strength', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Frequency</span>
                        <input
                          type="text"
                          placeholder="1-0-1"
                          value={item.frequency}
                          onChange={(e) => handleUpdateItem(index, 'frequency', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duration</span>
                        <input
                          type="text"
                          placeholder="5 Days"
                          value={item.duration}
                          onChange={(e) => handleUpdateItem(index, 'duration', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Route</span>
                        <input
                          type="text"
                          placeholder="Oral"
                          value={item.route}
                          onChange={(e) => handleUpdateItem(index, 'route', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Qty (Tablets)</span>
                        <input
                          type="number"
                          placeholder="10"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinician Review & Lock Confirmation */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
                Clinician digital signature will permanently lock this record.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition text-xs flex items-center justify-center space-x-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Sign & Finalize Prescription</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Emergency Acknowledge Modal */}
      {selectedEmergencyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-red-300 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-red-100">
              <div className="p-2.5 bg-red-600 text-white rounded-2xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-600 uppercase">
                  {selectedEmergencyAlert.alertId}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Acknowledge Critical Emergency Case
                </h3>
              </div>
            </div>

            <div className="bg-red-50 p-3.5 rounded-2xl text-xs space-y-1 text-red-950">
              <p><strong>Patient:</strong> {selectedEmergencyAlert.patientName}</p>
              <p><strong>Warning Signs:</strong> {selectedEmergencyAlert.warningSigns}</p>
              <p><strong>Origin:</strong> {selectedEmergencyAlert.origin}</p>
              <p><strong>Alert Generated:</strong> {selectedEmergencyAlert.createdAt}</p>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                Document Initial Clinical Action *
              </label>
              <textarea
                rows={3}
                value={ackAction}
                onChange={(e) => setAckAction(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedEmergencyAlert(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcknowledgeAlert}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow"
              >
                Confirm Acknowledgement & Log Response Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breakthrough Feature 1: Tamil Voice Audio Prescription Modal */}
      <TamilAudioPrescriptionModal
        isOpen={isTamilAudioOpen}
        onClose={() => setIsTamilAudioOpen(false)}
        patient={selectedPatient}
        doctor={currentDoctor}
        prescriptionItems={prescriptionItems}
        notes={clinicalNotes}
        diagnosis={diagnosis}
      />

      {/* Breakthrough Feature 4: AI Radiology & Lab Pre-Screener */}
      <AIRadiologyScreener
        isOpen={isAIRadiologyOpen}
        onClose={() => setIsAIRadiologyOpen(false)}
        onAttachReport={(summaryText) => {
          setClinicalNotes(prev => (prev ? prev + '\n\n' : '') + summaryText);
        }}
        patientName={selectedPatient?.name}
      />
    </div>
  );
};
