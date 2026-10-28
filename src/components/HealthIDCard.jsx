import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { TRANSLATIONS } from '../data/translations';
import { QRCodeSVG } from 'qrcode.react';
import {
  User,
  FileText,
  History,
  Pill,
  FlaskConical,
  Award,
  Maximize2,
  X,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Heart,
  Droplet,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Share2,
  CreditCard,
  QrCode,
  ShieldCheck,
  Building2,
  Volume2
} from 'lucide-react';
import { TamilAudioPrescriptionModal } from './TamilAudioPrescriptionModal';

export const HealthIDCard = () => {
  const { selectedPatient, language, appointments } = useHospital();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Active sub-tab inside the health passport
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'personal' | 'records' | 'history' | 'prescriptions' | 'labs'
  const [showQRModal, setShowQRModal] = useState(false);
  const [isTamilAudioOpen, setIsTamilAudioOpen] = useState(false);

  if (!selectedPatient || !selectedPatient.id) return null;

  // Current active token for this patient
  const currentToken = appointments.find(
    a => a.patientId === selectedPatient.id && a.tokenStatus !== 'Completed' && a.tokenStatus !== 'Cancelled'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Professional Smart Health ID Card (Physical / Digital Badge Format) */}
      <div className="bg-gradient-to-br from-[#002855] via-[#003875] to-[#001e3d] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-cyan-500/30 relative overflow-hidden">
        {/* Subtle background circuit watermark */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Activity className="w-48 h-48 text-cyan-300" />
        </div>

        {/* Card Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-cyan-700/50 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-500 flex items-center justify-center p-2.5 shadow-md shadow-cyan-500/30 text-white border border-cyan-200/40">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  m<span className="text-cyan-400">Well</span>
                </span>
                <span className="text-lg font-bold text-white tracking-wide">
                  Health<span className="text-cyan-400 font-extrabold">ID</span>
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  Digital Health Passport
                </span>
              </div>
              <p className="text-xs text-cyan-200/80">
                Authorized National Digital Healthcare Identification
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-cyan-200 hover:text-white rounded-xl text-xs font-semibold transition border border-cyan-700/50"
              title="Print Health Card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Card</span>
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t.expandQR}</span>
            </button>
          </div>
        </div>

        {/* Card Body: Patient Bio + QR Code */}
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center">
          {/* Patient Details (8 cols) */}
          <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="relative shrink-0">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-[#002855] rounded-full flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 font-bold uppercase">
                Patient Full Name
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {language === 'ta' ? selectedPatient.nameTa || selectedPatient.name : selectedPatient.name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="bg-[#001f3d] px-2.5 py-1 rounded-lg border border-cyan-800 font-mono text-cyan-300 font-bold">
                  ID: {selectedPatient.patientId}
                </span>
                <span className="bg-[#001f3d] px-2.5 py-1 rounded-lg border border-cyan-800 text-slate-200">
                  Age: <strong className="text-white">{selectedPatient.age} yrs</strong> ({selectedPatient.gender})
                </span>
                <span className="bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/80 text-rose-300 font-bold">
                  Blood Group: {selectedPatient.bloodType}
                </span>
              </div>

              <p className="text-xs text-cyan-200/70 pt-1 flex items-center">
                <Phone className="w-3 h-3 mr-1 text-cyan-400" />
                {selectedPatient.mobile} • <span className="text-slate-300 ml-1">{selectedPatient.email}</span>
              </p>
            </div>
          </div>

          {/* QR Code Passport Badge (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center bg-white/95 rounded-2xl p-4 text-slate-900 shadow-md border border-cyan-200">
            <div
              onClick={() => setShowQRModal(true)}
              className="cursor-pointer hover:scale-105 transition p-1 bg-white rounded-xl shadow-xs"
              title="Click to expand high-resolution QR"
            >
              <QRCodeSVG value={selectedPatient.qrTokenRef} size={96} level="H" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 mt-2 tracking-wider">
              {selectedPatient.qrTokenRef}
            </span>
            <span className="text-[10px] text-cyan-700 font-bold flex items-center mt-0.5">
              <ShieldCheck className="w-3 h-3 mr-1 text-cyan-600" />
              Verified Digital Record Token
            </span>
          </div>
        </div>

        {/* Card Footer: Emergency Alert Banner */}
        <div className="relative mt-5 pt-3 border-t border-cyan-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2 text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Emergency Contact:</strong> {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) — {selectedPatient.emergencyContact.phone}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-cyan-200">
            <span className="text-[11px] text-slate-400">Allergies:</span>
            {selectedPatient.allergies.map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-rose-500/20 text-rose-200 rounded text-[11px] font-semibold border border-rose-500/30">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Professional Section Navigation Tabs (Desktop & Tablet Enterprise View) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('card')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'card' ? 'bg-[#002855] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Health Passport Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'personal' ? 'bg-[#002855] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t.personalInfo}</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'records' ? 'bg-[#002855] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.medicalRecords}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'history' ? 'bg-[#002855] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t.medicalHistory} & Vitals</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'prescriptions' ? 'bg-[#002855] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>{t.prescriptions}</span>
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'labs' ? 'bg-[#002855] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>{t.labRequests}</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* View 1: 6 Enterprise Modules Grid (Matches mWell's 6 tiles in professional enterprise format) */}
      {activeTab === 'card' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 6 Rounded Cyan/Blue Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <button
              onClick={() => setActiveTab('personal')}
              className="p-4 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition">
                <User className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 leading-tight">
                {t.personalInfo}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className="p-4 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 leading-tight">
                {t.medicalRecords}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="p-4 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition">
                <History className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 leading-tight">
                {t.medicalHistory}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className="p-4 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition">
                <Pill className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 leading-tight">
                {t.prescriptions}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('labs')}
              className="p-4 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition">
                <FlaskConical className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 leading-tight">
                {t.labRequests}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className="p-4 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 leading-tight">
                {t.medicalCertificates}
              </span>
            </button>
          </div>

          {/* Quick Summary Grid: Recent Consultation & Vitals Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Vitals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Latest Recorded Vital Signs</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{selectedPatient.vitals.lastUpdated}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">BP</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.bloodPressure}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Pulse</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.pulseRate}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Temperature</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.temperature}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">SpO2</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.spo2}</span>
                </div>
              </div>
            </div>

            {/* Recent Medical Record brief */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Most Recent Clinical Visit</h3>
                </div>
                <button onClick={() => setActiveTab('records')} className="text-xs text-cyan-600 font-bold hover:underline">
                  View All →
                </button>
              </div>
              {selectedPatient.medicalHistory.length > 0 ? (
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{selectedPatient.medicalHistory[0].diagnosis}</span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                      {selectedPatient.medicalHistory[0].type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Provider: {selectedPatient.medicalHistory[0].provider} • {selectedPatient.medicalHistory[0].date}</p>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {selectedPatient.medicalHistory[0].notes}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No past consultations recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Personal Information */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fadeIn">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">{t.personalInfo}</h3>
            <span className="text-xs font-mono text-cyan-700 font-bold bg-cyan-50 px-2.5 py-0.5 rounded">
              Verified Profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">{t.dateOfBirth}</span>
              <p className="font-bold text-slate-800 text-sm">{selectedPatient.dateOfBirth}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">{t.age}</span>
              <p className="font-bold text-slate-800 text-sm">{selectedPatient.age} Years</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">{t.sex}</span>
              <p className="font-bold text-slate-800 text-sm">{selectedPatient.gender}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">{t.bloodType}</span>
              <p className="font-bold text-rose-600 text-sm">{selectedPatient.bloodType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.mobileNumber}</span>
              <p className="font-semibold text-slate-800 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                {selectedPatient.mobile}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.email}</span>
              <p className="font-semibold text-slate-800 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                {selectedPatient.email}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">National ID / PhilHealth</span>
              <p className="font-mono font-bold text-cyan-700 bg-white p-1 rounded border border-slate-200">
                {selectedPatient.nationalId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Medical Records Table */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900 text-sm">{t.medicalRecords}</h3>
            <span className="text-slate-500 font-mono">{selectedPatient.medicalHistory.length} Episodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Healthcare Provider</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Clinical Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPatient.medicalHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{item.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.diagnosis}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.provider}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'Surgery' ? 'bg-purple-100 text-purple-700' :
                        item.type === 'Teleconsult' ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 4: Medical History & Vitals */}
      {activeTab === 'history' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Allergies Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <Shield className="w-4 h-4 text-rose-600 mr-2" />
                Drug & Environmental Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedPatient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-800 font-bold text-xs rounded-lg border border-rose-200">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Height & Weight */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <Activity className="w-4 h-4 text-cyan-600 mr-2" />
                Body Mass & Stature
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Height</span>
                  <span className="font-bold text-slate-900 text-base">{selectedPatient.vitals.height}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Weight</span>
                  <span className="font-bold text-slate-900 text-base">{selectedPatient.vitals.weight}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 5: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">{t.prescriptions}</h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsTamilAudioOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-100 hover:bg-cyan-200 text-cyan-950 rounded-xl text-xs font-bold transition border border-cyan-300 shadow-xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-700" />
                <span>{language === 'ta' ? '🔊 தமிழில் கேட்க' : '🔊 Listen Voice Guidance'}</span>
              </button>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Clinician Verified
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-cyan-800 text-sm">RX-2026-901</span>
                <span className="text-slate-500">Dr. Carlo Toledano • Senior Consultant</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-900">Amoxicillin + Clavulanate (Augmentin) 625mg</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">1 tablet • 1-0-1 (After Food) • 5 Days</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-900">Paracetamol (Dolo 650) 650mg</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">1 tablet • SOS / When fever &gt; 38°C • 3 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 6: Lab Requests & Results */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">{t.labRequests}</h3>
          <div className="space-y-2.5 text-xs">
            {selectedPatient.labReports.map((lab) => (
              <div key={lab.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{lab.test}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Report Date: {lab.date} • Result: <strong className="text-slate-800">{lab.result}</strong></p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                  {lab.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#002855] text-white rounded-3xl border border-cyan-400/40 p-6 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold text-cyan-300">{t.showQRCode}</span>
              <button onClick={() => setShowQRModal(false)} className="p-1 text-slate-300 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-xl my-2">
              <QRCodeSVG value={selectedPatient.qrTokenRef} size={200} level="H" includeMargin={true} />
              <p className="mt-3 text-xs font-mono text-slate-500 font-semibold">{selectedPatient.qrTokenRef}</p>
            </div>
            
            {/* Offline Embedded Data Badge */}
            <div className="mt-2 bg-[#00172e] p-2.5 rounded-xl border border-cyan-800/80 text-[10px] text-cyan-300 flex items-center justify-center space-x-1.5">
              <span>📡</span>
              <span>Offline Emergency Payload (Blood Group, Allergies, Next-of-Kin) Embedded</span>
            </div>

            <p className="text-xs text-cyan-200 mt-2">
              Present to reception desk, clinician, or offline emergency scanner to retrieve permitted medical records.
            </p>
          </div>
        </div>
      )}

      {/* Breakthrough Feature: Tamil Voice Audio Prescription Modal */}
      <TamilAudioPrescriptionModal
        isOpen={isTamilAudioOpen}
        onClose={() => setIsTamilAudioOpen(false)}
        patient={selectedPatient}
        doctor={{ name: 'Dr. Carlo Toledano' }}
        prescriptionItems={[
          { name: 'Amoxicillin + Clavulanate (Augmentin)', strength: '625 mg', frequency: '1-0-1', duration: '5 Days', route: 'Oral (After Food)' },
          { name: 'Paracetamol (Dolo 650)', strength: '650 mg', frequency: 'SOS (When fever > 38°C)', duration: '3 Days', route: 'Oral (After Food)' }
        ]}
        diagnosis="Acute Upper Respiratory Tract Infection"
      />
    </div>
  );
};
