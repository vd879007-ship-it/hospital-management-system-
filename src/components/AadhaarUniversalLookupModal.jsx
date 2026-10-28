import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { formatAadhaar, normalizeAadhaar } from '../lib/utils';
import {
  Search,
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  HeartPulse,
  Pill,
  Scissors,
  Building2,
  AlertTriangle,
  Printer,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AadhaarUniversalLookupModal = () => {
  const {
    isAadhaarModalOpen,
    setIsAadhaarModalOpen,
    patients,
    setSelectedPatientId,
    setCurrentRole,
    lookupPatientByAadhaar,
    language,
    t
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'tests' | 'tablets' | 'surgeries' | 'encounters'
  const [selectedPatientRecord, setSelectedPatientRecord] = useState(patients[0] || null);
  const [searchError, setSearchError] = useState('');

  if (!isAadhaarModalOpen) return null;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim()) {
      setSearchError(language === 'ta' ? 'தயவுசெய்து 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்' : 'Please enter 12-digit Aadhaar number');
      return;
    }

    const matched = lookupPatientByAadhaar(searchQuery);
    if (matched) {
      setSelectedPatientRecord(matched);
      setSelectedPatientId(matched.id);
      confetti({ particleCount: 40, spread: 60 });
    } else {
      setSearchError(
        language === 'ta'
          ? `ஆதார் எண் "${searchQuery}" உடன் இணைக்கப்பட்ட மருத்துவப் பதிவுகள் எதுவும் இல்லை.`
          : `No cross-hospital records found for Aadhaar number "${searchQuery}".`
      );
    }
  };

  const handleSelectQuickPatient = (patient) => {
    setSearchQuery(patient.aadhaarNumber || '');
    setSelectedPatientRecord(patient);
    setSelectedPatientId(patient.id);
    setSearchError('');
  };

  const handlePrint = () => {
    window.print();
  };

  const isTamil = language === 'ta';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <CreditCard className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t('aadhaarModalTitle')}
                </h2>
                <span className="badge-highlight text-[10px]">{t('aadhaarSearchAnywhere')}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {t('aadhaarModalDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAadhaarModalOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aadhaar Input Box */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <CreditCard className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('aadhaarInputPlaceholder')}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 tracking-wider transition"
              />
            </div>
            <button
              type="submit"
              className="btn-primary text-sm py-3 px-6 shadow-xs shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{t('aadhaarSearchBtn')}</span>
            </button>
          </div>

          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick Demo Aadhaar Shortcut Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="font-semibold text-slate-600 mr-1">{t('aadhaarDemoShortcuts')}</span>
            {patients.slice(0, 4).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectQuickPatient(p)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl text-[11px] font-mono font-semibold transition"
              >
                {(isTamil && p.nameTa) ? p.nameTa.split(' ')[0] : p.name.split(' ')[0]} ({p.aadhaarNumber})
              </button>
            ))}
          </div>
        </form>

        {/* Selected Patient Unified Health Record */}
        {selectedPatientRecord && (
          <div className="space-y-5 animate-fadeIn">
            {/* Identity Card Bar */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={selectedPatientRecord.avatar}
                    alt={selectedPatientRecord.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {isTamil && selectedPatientRecord.nameTa ? selectedPatientRecord.nameTa : selectedPatientRecord.name}
                      </h3>
                      <span className="badge-highlight font-mono text-[10px]">
                        {selectedPatientRecord.bloodType}
                      </span>
                    </div>
                    {isTamil && selectedPatientRecord.nameTa && (
                      <p className="text-xs text-slate-500 font-medium">{selectedPatientRecord.name}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isTamil ? (selectedPatientRecord.gender === 'Male' ? 'ஆண்' : selectedPatientRecord.gender === 'Female' ? 'பெண்' : 'மற்றவை') : selectedPatientRecord.gender} • {selectedPatientRecord.age} {t('years')} • {t('dateOfBirth')}: {selectedPatientRecord.dateOfBirth}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1 shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('printRecords')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAadhaarModalOpen(false);
                      setCurrentRole('doctor');
                    }}
                    className="btn-primary text-xs py-1.5 px-3.5 shadow-xs"
                  >
                    <span>{t('startConsultation')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Aadhaar & ABHA Verified Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('verifiedAadhaarUid')}</span>
                  <span className="font-mono font-bold text-sm text-blue-700 flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1 shrink-0" />
                    {selectedPatientRecord.aadhaarNumber}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('abhaAddressLabel')}</span>
                  <span className="font-mono font-semibold text-xs text-slate-800">
                    {selectedPatientRecord.abhaAddress || 'patient@abdm'}
                  </span>
                </div>

                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 space-y-0.5">
                  <span className="text-[10px] text-rose-700 font-bold uppercase block">⚠️ {t('allergies')}</span>
                  <span className="font-semibold text-xs text-rose-800">
                    {selectedPatientRecord.allergies && selectedPatientRecord.allergies.length > 0
                      ? selectedPatientRecord.allergies.join(', ')
                      : t('noAllergies')}
                  </span>
                </div>
              </div>
            </div>

            {/* Record Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeTab === 'all' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('allRecordsTab')}
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                  activeTab === 'tests' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t('labScansTab')} ({selectedPatientRecord.labReports.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('tablets')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                  activeTab === 'tablets' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{t('tabletsTab')} ({selectedPatientRecord.pastMedications?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('surgeries')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                  activeTab === 'surgeries' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{t('surgeriesTab')} ({selectedPatientRecord.surgeries?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('encounters')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                  activeTab === 'encounters' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('encountersTab')} ({selectedPatientRecord.medicalHistory.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. LAB TESTS & SCANS */}
            {(activeTab === 'all' || activeTab === 'tests') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
                    <Activity className="w-4 h-4 mr-1 text-blue-600" />
                    1. {t('labReports')}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">Cross-Hospital Aggregated</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  {selectedPatientRecord.labReports.map((lab, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-200 transition space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-sm">{lab.test}</span>
                        <div className="flex items-center space-x-2">
                          <span className="badge-highlight text-[9px] font-mono">{lab.date}</span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            {lab.status || (isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified')}
                          </span>
                        </div>
                      </div>
                      <p className="font-mono font-semibold text-blue-700 bg-white p-2 rounded-xl border border-slate-200">
                        {t('labTestResult')}: {lab.result}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span className="font-medium text-slate-700">{t('hospitalLabel')}: {lab.hospital || 'MediTech Central Diagnostics'}</span>
                        <span>{t('doctorLabel')}: {lab.doctor || 'Dr. Carlo Toledano'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. PAST MEDICATIONS & TABLETS */}
            {(activeTab === 'all' || activeTab === 'tablets') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
                    <Pill className="w-4 h-4 mr-1 text-blue-600" />
                    2. {t('tabletsTab')}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">Formulary Linked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {(selectedPatientRecord.pastMedications || []).map((med, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm leading-tight">{med.medicineName}</span>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {t('indicationLabel')}: <strong className="text-slate-800">{med.indication}</strong>
                      </p>
                      <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{med.hospital}</span>
                        <span>{t('prescribedByLabel')}: {med.prescribedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. SURGERIES & PAST OPERATIONS */}
            {(activeTab === 'all' || activeTab === 'surgeries') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
                    <Scissors className="w-4 h-4 mr-1 text-blue-600" />
                    3. {t('surgeriesTab')}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">OT Verified</span>
                </div>

                {selectedPatientRecord.surgeries && selectedPatientRecord.surgeries.length > 0 ? (
                  <div className="space-y-2.5 text-xs">
                    {selectedPatientRecord.surgeries.map((surg, i) => (
                      <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5 className="font-bold text-slate-900 text-sm">{surg.surgeryName}</h5>
                          <span className="badge-highlight font-mono text-[10px]">{surg.date}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                          <p>{t('hospitalLabel')}: <strong>{surg.hospital}</strong></p>
                          <p>{t('surgeonLabel')}: <strong>{surg.surgeon}</strong></p>
                          <p>{t('indicationLabel')}: <strong>{surg.indication}</strong></p>
                          <p>{t('implantsUsedLabel')}: <strong>{surg.implantsUsed || (isTamil ? 'இல்லை' : 'None')}</strong></p>
                        </div>
                        <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                          {t('outcomeLabel')}: {surg.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                    {t('noMajorSurgeries')}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. CROSS-HOSPITAL ENCOUNTER HISTORY */}
            {(activeTab === 'all' || activeTab === 'encounters') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
                    <Building2 className="w-4 h-4 mr-1 text-blue-600" />
                    4. {t('encountersTab')}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">Timeline</span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedPatientRecord.medicalHistory.map((hist, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span className="text-slate-900 text-xs font-bold">{hist.hospital || (isTamil ? 'மருத்துவமனை சந்திப்பு' : 'Hospital Episode')}</span>
                        <span className="badge-highlight text-[9px] font-mono">{hist.date}</span>
                      </div>
                      <p className="text-blue-700 font-semibold text-[11px]">
                        {t('departmentLabel')}: {hist.department} • {t('doctorLabel')}: {hist.provider}
                      </p>
                      <p className="text-slate-800 font-medium text-[11px]">
                        {t('diagnosisLabel')}: {hist.diagnosis}
                      </p>
                      <p className="text-slate-600 text-[11px]">{hist.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
