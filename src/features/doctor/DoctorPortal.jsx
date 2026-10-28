import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { checkDrugAllergyConflict, formatAadhaar } from '../../lib/utils';
import { TamilAudioPrescriptionModal } from '../../components/TamilAudioPrescriptionModal';
import {
  Stethoscope,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  History,
  FlaskConical,
  Volume2,
  CheckCircle2,
  FileText,
  Sparkles,
  X,
  CreditCard,
  CloudUpload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DoctorPortal = () => {
  const {
    language,
    t,
    selectedPatient,
    patients,
    setSelectedPatientId,
    selectedDoctorId,
    doctors,
    finalizeConsultation,
    activeEmergencyAlerts,
    acknowledgeEmergencyAlert,
    inventory,
    setIsAadhaarModalOpen,
    setIsImportModalOpen,
    setIsUploadReportModalOpen,
    setCurrentRole
  } = useHospital();

  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  // Consultation state
  const [diagnosis, setDiagnosis] = useState('Acute Bronchitis & Allergic Cough');
  const [clinicalNotes, setClinicalNotes] = useState('Bilateral scattered wheezing, throat erythematous. Advised steam inhalation and hydration.');
  const [requestedTests, setRequestedTests] = useState('Complete Blood Count, Resting 12-lead ECG');
  const [followUpDays, setFollowUpDays] = useState(5);

  // Digital Prescription Items
  const [prescriptionItems, setPrescriptionItems] = useState([
    {
      name: 'Azithromycin 500mg',
      strength: '500 mg',
      dose: '1 tablet',
      frequency: '1-0-0 (Once Daily)',
      duration: '3 Days',
      route: 'Oral (After Food)',
      quantity: 3,
      instructions: 'Complete 3-day course.',
      tamilInstructions: 'தினமும் ஒரு மாத்திரை சாப்பாட்டிற்கு பிறகு உட்கொள்ளவும்.'
    },
    {
      name: 'Paracetamol (Dolo 650)',
      strength: '650 mg',
      dose: '1 tablet',
      frequency: '1-0-1 (SOS / When fever > 38°C)',
      duration: '3 Days',
      route: 'Oral (After Food)',
      quantity: 6,
      instructions: 'Maintain 6 hours interval.',
      tamilInstructions: 'காய்ச்சல் இருக்கும்போது 6 மணி நேர இடைவெளியில் உட்கொள்ளவும்.'
    }
  ]);

  // Drug-Allergy Blocking Modal State
  const [blockingAllergyModal, setBlockingAllergyModal] = useState(null);
  const [clinicalOverrideReason, setClinicalOverrideReason] = useState('');
  const [isTamilAudioOpen, setIsTamilAudioOpen] = useState(false);

  // Check all current items for allergy conflicts
  const allergyConflicts = prescriptionItems
    .map((item, index) => {
      const conflict = checkDrugAllergyConflict(item.name, selectedPatient?.allergies || []);
      return conflict.hasConflict ? { ...conflict, item, index } : null;
    })
    .filter(Boolean);

  // Add Medicine with Immediate Drug-Allergy Contraindication Check
  const handleAddMedicine = (medicineName) => {
    const medName = medicineName || inventory[0]?.name || 'Amoxicillin + Clavulanate (Augmentin 625)';
    const conflict = checkDrugAllergyConflict(medName, selectedPatient?.allergies || []);

    if (conflict.hasConflict) {
      // Trigger Blocking Modal
      setBlockingAllergyModal({
        medicineName: medName,
        warning: conflict.warning,
        matchedAllergy: conflict.matchedAllergy,
        pendingItem: {
          name: medName,
          strength: '625 mg',
          dose: '1 tablet',
          frequency: '1-0-1 (Twice Daily)',
          duration: '5 Days',
          route: 'Oral (After Food)',
          quantity: 10,
          instructions: 'Take after meals'
        }
      });
      return;
    }

    // Safe to add
    setPrescriptionItems([
      ...prescriptionItems,
      {
        name: medName,
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

  const handleConfirmOverride = () => {
    if (!clinicalOverrideReason.trim()) {
      alert('A valid clinical justification is strictly required to override an allergy contraindication.');
      return;
    }

    if (blockingAllergyModal?.pendingItem) {
      setPrescriptionItems([
        ...prescriptionItems,
        {
          ...blockingAllergyModal.pendingItem,
          instructions: `[OVERRIDDEN: ${clinicalOverrideReason}] ${blockingAllergyModal.pendingItem.instructions}`
        }
      ]);
    }
    setBlockingAllergyModal(null);
    setClinicalOverrideReason('');
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = prescriptionItems.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value };
        // Check for allergy if name changed
        if (field === 'name') {
          const conflict = checkDrugAllergyConflict(value, selectedPatient?.allergies || []);
          if (conflict.hasConflict) {
            setBlockingAllergyModal({
              medicineName: value,
              warning: conflict.warning,
              matchedAllergy: conflict.matchedAllergy,
              pendingItem: newItem
            });
          }
        }
        return newItem;
      }
      return item;
    });
    setPrescriptionItems(updated);
  };

  const handleFinalize = (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      alert('Please enter a clinical diagnosis.');
      return;
    }

    // Blocking guard: cannot finalize with un-overridden allergy conflicts
    if (allergyConflicts.length > 0) {
      alert(`BLOCKING SAFETY ERROR: Cannot sign prescription. Contains conflicting allergen: ${allergyConflicts[0].item.name}. Remove or substitute before proceeding.`);
      return;
    }

    finalizeConsultation({
      patientId: selectedPatient.id,
      doctorId: currentDoctor.id,
      diagnosis,
      notes: clinicalNotes,
      prescriptionItems,
      requestedTests,
      followUpDays
    });

    confetti({ particleCount: 60, spread: 60 });
    alert(`Prescription signed and finalized by ${currentDoctor.name}! Sent to Pharmacy.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Clinician Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentDoctor.avatar}
            alt={currentDoctor.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {language === 'ta' && currentDoctor.nameTa ? currentDoctor.nameTa : currentDoctor.name}
              </h1>
              <span className="badge-highlight">{currentDoctor.deptName}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentDoctor.specialty} • {currentDoctor.cabin} • Reg #MED-88492
            </p>
          </div>
        </div>

        {/* Patient Selector */}
        {patients.length > 0 ? (
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl text-xs">
            <span className="font-semibold text-slate-700">{language === 'ta' ? 'தற்போதைய நோயாளி:' : 'Active Patient:'}</span>
            <select
              value={selectedPatient.id}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ta' && p.nameTa ? p.nameTa : p.name} ({p.patientId}) — {p.gender}, {p.age}y
                </option>
              ))}
            </select>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'நோயாளி தரவை இறக்குமதி செய்க' : 'Import Patients'}</span>
          </button>
        )}
      </div>

      {patients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs my-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {language === 'ta' ? 'பரிசோதனைக்கு நோயாளிகள் இல்லை' : 'No Patients in OPD Queue'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {language === 'ta'
                ? 'அனைத்து இயல்புநிலை மாதிரித் தரவுகளும் நீக்கப்பட்டுவிட்டன. புதிய நோயாளிகளை பதிவு செய்யவும் அல்லது JSON/CSV கோப்பை இறக்குமதி செய்யவும்.'
                : 'All default demo records have been cleared. Register patients at Reception or import patient data to begin consultations.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{language === 'ta' ? 'தரவு இறக்குமதி செய்க' : 'Import Hospital Data'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentRole('reception')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
            >
              <span>{language === 'ta' ? 'வரவேற்பறைக்குச் செல்லவும்' : 'Go to Reception Desk'}</span>
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient History Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Patient Card Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{selectedPatient.name}</h3>
                <p className="text-[11px] text-blue-600 font-mono font-medium">{selectedPatient.patientId}</p>
                <span className="text-[11px] font-semibold text-rose-600 block">Blood: {selectedPatient.bloodType}</span>
                <span className="text-[10px] font-mono text-slate-500 font-medium block mt-0.5">
                  UID: {formatAadhaar(selectedPatient.aadhaarNumber || '234567890123')}
                </span>
              </div>
            </div>

            {/* Quick Actions: Aadhaar Lookup & Upload Diagnostic Scan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="w-full py-2 px-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
                title={language === 'ta' ? 'அனைத்து பரிசோதனை மற்றும் மருத்துவ அறிக்கைகளை காண்க' : 'View all test reports, tablets, and surgeries across hospitals'}
              >
                <CreditCard className="w-4 h-4 text-blue-100 shrink-0" />
                <span className="truncate">{t('aadhaarLookupBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadReportModalOpen(true)}
                className="w-full py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
                title={language === 'ta' ? 'நோயாளிக்கு மருத்துவ ஸ்கேன் / அறிக்கை பதிவேற்றி Firebase-ல் சேமிக்கவும்' : 'Upload diagnostic scan / lab report to Firebase for this patient'}
              >
                <CloudUpload className="w-4 h-4 text-emerald-100 shrink-0" />
                <span className="truncate">{language === 'ta' ? 'ஸ்கேன் பதிவேற்றம்' : 'Upload Lab Scan'}</span>
              </button>
            </div>

            {/* Documented Allergies Highlight */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">
                ⚠️ Documented Allergies:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                  selectedPatient.allergies.map((allergy, i) => (
                    <span key={i} className="bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded text-[11px]">
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[11px]">No known drug allergies</span>
                )}
              </div>
            </div>

            {/* Patient Vitals */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Recorded Vitals:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[9px]">Blood Pressure</span>
                  <span className="font-bold text-slate-800">{selectedPatient.vitals.bloodPressure}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[9px]">SpO2 / Pulse</span>
                  <span className="font-bold text-slate-800">{selectedPatient.vitals.spo2} • {selectedPatient.vitals.pulseRate}</span>
                </div>
              </div>
            </div>

            {/* Clinical History Timeline */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-black text-[#FF0000] uppercase block">
                Past Clinical Episodes ({selectedPatient.medicalHistory.length}):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedPatient.medicalHistory.map((hist, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                      <span>{hist.diagnosis}</span>
                      <span className="text-slate-400 text-[10px]">{hist.date}</span>
                    </div>
                    <p className="text-[10px] text-[#0000CC]">{hist.provider} ({hist.department})</p>
                    <p className="text-[10px] text-slate-600 line-clamp-2">{hist.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Scans & Uploaded Lab Reports (Live from Firebase) */}
            {selectedPatient.labReports && selectedPatient.labReports.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-emerald-700 uppercase block flex items-center justify-between">
                  <span>Uploaded Lab Reports ({selectedPatient.labReports.length}):</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">Firebase</span>
                </span>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedPatient.labReports.map((lab, idx) => (
                    <div key={lab.id || idx} className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                        <span>{lab.testName}</span>
                        <span className="text-slate-500 text-[10px]">{lab.date}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold block">{lab.category}</span>
                      <p className="text-[10px] text-slate-700 line-clamp-2">{lab.findings}</p>
                      {lab.fileData && (
                        <div className="pt-1">
                          <img src={lab.fileData} alt={lab.testName} className="max-h-24 rounded border border-emerald-200 object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Doctor Consultation & Prescription Builder (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Digital Consultation & Electronic Prescription
              </h2>
              <p className="text-xs text-slate-500">
                Documents clinical diagnosis, orders diagnostic labs, and signs prescription with allergy verification.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTamilAudioOpen(true)}
              className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
              title={language === 'ta' ? 'குரல்வழி மருந்து வழிமுறைகளை கேட்க' : 'Preview Voice Prescription Instructions'}
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>{language === 'ta' ? 'தமிழில் Audio Rx' : 'Voice Prescription Guide'}</span>
            </button>
          </div>

          <form onSubmit={handleFinalize} className="space-y-5 text-xs">
            {/* Diagnosis & Clinical Examination */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">
                  Primary Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis, Type 2 Diabetes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">
                  Examination Findings & Clinical Notes *
                </label>
                <textarea
                  rows={2}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">
                    Diagnostic Lab & Radiology Orders
                  </label>
                  <input
                    type="text"
                    value={requestedTests}
                    onChange={(e) => setRequestedTests(e.target.value)}
                    placeholder="e.g. CBC, Serum Creatinine, Chest X-Ray"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">
                    Follow-Up In (Days)
                  </label>
                  <input
                    type="number"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* BLOCKING ALLERGY BANNER IF DETECTED */}
            {allergyConflicts.length > 0 && (
              <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 text-xs space-y-2 text-rose-900 animate-pulse">
                <div className="flex items-center space-x-2 font-bold text-rose-700">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="uppercase tracking-wide">
                    ⚠️ BLOCKING DRUG-ALLERGY CONTRAINDICATION:
                  </span>
                </div>
                <p className="text-slate-800">
                  Patient <strong>{selectedPatient.name}</strong> is allergic to{' '}
                  <strong className="text-rose-700 underline">{selectedPatient.allergies.join(', ')}</strong>.
                  Prescription contains conflicting agent:{' '}
                  <strong className="bg-rose-200 px-1.5 py-0.5 rounded text-rose-950 font-mono">
                    {allergyConflicts.map(c => c.item.name).join(', ')}
                  </strong>
                </p>
                <p className="text-[11px] font-bold text-rose-700">
                  You must substitute this medication before the prescription can be signed.
                </p>
              </div>
            )}

            {/* Prescribed Medications Table Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800 uppercase text-xs flex items-center">
                  <Stethoscope className="w-4 h-4 text-blue-600 mr-1.5" />
                  Prescribed Medications ({prescriptionItems.length})
                </label>

                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddMedicine(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800"
                  >
                    <option value="">+ Quick Add from Formulary...</option>
                    {inventory.slice(0, 15).map(inv => (
                      <option key={inv.id} value={inv.name}>
                        {inv.name} ({inv.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {prescriptionItems.map((item, index) => {
                  const conflict = checkDrugAllergyConflict(item.name, selectedPatient?.allergies || []);
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border-2 space-y-2 transition ${
                        conflict.hasConflict
                          ? 'border-red-500 bg-red-50/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                            placeholder="Medicine Name"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.strength}
                            onChange={(e) => handleUpdateItem(index, 'strength', e.target.value)}
                            placeholder="Strength"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <select
                            value={item.frequency}
                            onChange={(e) => handleUpdateItem(index, 'frequency', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs font-semibold"
                          >
                            <option value="1-0-1 (Twice Daily)">1-0-1</option>
                            <option value="1-0-0 (Morning)">1-0-0</option>
                            <option value="0-0-1 (Night)">0-0-1</option>
                            <option value="1-1-1 (Thrice Daily)">1-1-1</option>
                            <option value="1-0-1 (SOS / When needed)">SOS</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleUpdateItem(index, 'duration', e.target.value)}
                            placeholder="Duration"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {conflict.hasConflict && (
                        <div className="text-[11px] text-red-700 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Contraindicated for {selectedPatient.name}: {conflict.warning}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={allergyConflicts.length > 0}
              className={`w-full py-3.5 text-sm font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg ${
                allergyConflicts.length > 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {allergyConflicts.length > 0
                  ? 'Cannot Sign — Resolve Allergy Conflicts First'
                  : 'Digitally Sign & Lock Electronic Prescription'}
              </span>
            </button>
          </form>
        </div>
      </div>
      )}

      {/* BLOCKING ALLERGY WARNING MODAL */}
      {blockingAllergyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-4 border-[#FF0000] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-[#FF0000]">
              <div className="p-3 bg-red-100 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-[#FF0000]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#FF0000]">
                  BLOCKING DRUG-ALLERGY ALERT
                </h3>
                <p className="text-xs text-[#0000CC]">
                  Prescription Safety Intercept Rule Active
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-2 text-slate-800">
              <p>
                Patient <strong>{selectedPatient.name}</strong> has a verified allergy to{' '}
                <strong className="text-red-700 font-bold uppercase">{blockingAllergyModal.matchedAllergy}</strong>.
              </p>
              <p className="text-red-950 font-bold bg-white p-2.5 rounded-xl border border-red-200">
                {blockingAllergyModal.warning}
              </p>
              <p className="text-slate-600 text-[11px]">
                Prescribing this agent may trigger acute hypersensitivity, anaphylaxis, or adverse reaction.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Override Justification (Required only if clinically indicated):
              </label>
              <input
                type="text"
                value={clinicalOverrideReason}
                onChange={(e) => setClinicalOverrideReason(e.target.value)}
                placeholder="e.g. Desensitization protocol / Cross-reactivity risk evaluated & monitored"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBlockingAllergyModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Cancel & Pick Alternative
              </button>
              <button
                type="button"
                onClick={handleConfirmOverride}
                className="btn-primary text-xs py-2 px-4 bg-red-700 hover:bg-red-800"
              >
                Authorise Clinical Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tamil Voice Prescription Modal */}
      <TamilAudioPrescriptionModal
        isOpen={isTamilAudioOpen}
        onClose={() => setIsTamilAudioOpen(false)}
        patient={selectedPatient}
        doctor={currentDoctor}
        prescriptionItems={prescriptionItems}
        diagnosis={diagnosis}
        notes={clinicalNotes}
      />
    </div>
  );
};
