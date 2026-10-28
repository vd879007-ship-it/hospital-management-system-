import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { patientRegistrationSchema } from '../../lib/schemas';
import { formatAadhaar, normalizeAadhaar } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import {
  UserPlus,
  QrCode,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Phone,
  Sparkles,
  Printer,
  HeartPulse,
  UserCheck,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReceptionPortal = () => {
  const {
    language,
    t,
    patients,
    appointments,
    updateTokenStatus,
    registerPatient,
    bookAppointment,
    departments,
    doctors,
    triggerEmergencyAlert,
    setIsQRScannerOpen,
    setIsAadhaarModalOpen,
    lookupPatientByAadhaar,
    setSelectedPatientId,
    currentServingTokenNumber
  } = useHospital();

  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'queue' | 'issueToken'
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameTa: '',
    age: '',
    gender: 'Male',
    dateOfBirth: '1995-06-15',
    bloodType: 'B+',
    mobile: '',
    email: '',
    address: 'Chennai, Tamil Nadu',
    allergies: 'None',
    aadhaarNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: 'Spouse',
    preferredLanguage: 'ta'
  });

  const [formErrors, setFormErrors] = useState({});

  // Quick Token Generation Form
  const [tokenFormData, setTokenFormData] = useState({
    patientId: patients[0]?.id || '',
    departmentId: departments[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    slotTime: '10:30 AM',
    symptomSummary: 'Routine General OPD Check-up'
  });

  // Handle Registration with Zod Validation
  const handleRegister = (e) => {
    e.preventDefault();
    setFormErrors({});

    const parseResult = patientRegistrationSchema.safeParse(formData);
    if (!parseResult.success) {
      const errMap = {};
      parseResult.error.issues.forEach(issue => {
        const field = issue.path[0];
        errMap[field] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    const created = registerPatient(formData);
    setNewlyRegisteredPatient(created);
    confetti({ particleCount: 60, spread: 70 });

    // Reset Form
    setFormData({
      name: '',
      nameTa: '',
      age: '',
      gender: 'Male',
      dateOfBirth: '1995-06-15',
      bloodType: 'B+',
      mobile: '',
      email: '',
      address: 'Chennai, Tamil Nadu',
      allergies: 'None',
      aadhaarNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRel: 'Spouse',
      preferredLanguage: 'ta'
    });
  };

  // Handle Issuing Token
  const handleIssueToken = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === tokenFormData.patientId) || patients[0];
    const dept = departments.find(d => d.id === tokenFormData.departmentId) || departments[0];
    const doctor = doctors.find(d => d.id === tokenFormData.doctorId) || doctors[0];

    const newApt = bookAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: dept.id,
      deptName: dept.name,
      slotTime: tokenFormData.slotTime,
      triageLevel: 'Routine (Green)',
      symptomSummary: tokenFormData.symptomSummary
    });

    confetti({ particleCount: 50, spread: 60 });
    alert(`Token ${newApt.tokenNumber} issued for ${patient.name}! Wait time: ~${newApt.estimatedWaitMins} mins.`);
    setActiveTab('queue');
  };

  // Filter Queue Tokens
  const filteredTokens = appointments.filter(apt => {
    if (deptFilter !== 'ALL' && apt.departmentId !== deptFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        apt.tokenNumber.toLowerCase().includes(term) ||
        apt.patientName.toLowerCase().includes(term) ||
        apt.doctorName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const isTamil = language === 'ta';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('receptionTitle')}
            </h1>
            <span className="badge-highlight">OPD Live</span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {t('receptionDesc')}
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'register' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('newRegistrationTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('issueToken')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'issueToken' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>{t('issueTokenTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'queue' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('liveOpdQueueTab')} ({filteredTokens.length})</span>
          </button>
          <button
            onClick={() => setIsAadhaarModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1.5 shadow-xs"
            title={isTamil ? 'ஆதார் மூலம் மருத்துவ பதிவுகளைத் தேடுங்கள்' : 'Search lifetime records from any hospital using Aadhaar'}
          >
            <CreditCard className="w-4 h-4 text-blue-100" />
            <span>{t('aadhaarLookupBtn')}</span>
          </button>
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center space-x-1.5 border border-slate-200"
            title={t('scanQrBtn')}
          >
            <QrCode className="w-4 h-4" />
            <span>{t('scanQrBtn')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NEW PATIENT REGISTRATION */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Patient Registration & Digital Health Passport Generator
              </h2>
              <p className="text-xs text-slate-500">
                Generates a unique hospital ID (HSP-2026-XXXX) and embeds blood group, allergies & emergency contacts in an offline-scannable QR.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">
                    Patient Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Sundaram"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {formErrors.name && <p className="text-rose-600 text-[11px] mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">
                    பெயர் (தமிழில் / Tamil Name)
                  </label>
                  <input
                    type="text"
                    value={formData.nameTa}
                    onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                    placeholder="எ.கா. ரமேஷ் சுந்தரம்"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Age *</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 42"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {formErrors.age && <p className="text-rose-600 text-[11px] mt-1">{formErrors.age}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Blood Group *</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98401 22334"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {formErrors.mobile && <p className="text-rose-600 text-[11px] mt-1">{formErrors.mobile}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@email.com"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              {/* 12-Digit Aadhaar Universal Health ID */}
              <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-blue-800 uppercase tracking-wide flex items-center space-x-1.5 text-[11px]">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>{isTamil ? '12-இலக்க ஆதார் எண்' : '12-Digit Aadhaar UID'}</span>
                  </label>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                    Cross-Hospital Enabled
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: formatAadhaar(e.target.value) })}
                    placeholder="e.g. 2345 6789 0123"
                    className="flex-1 bg-white border border-blue-200 rounded-xl p-3 text-slate-900 font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {formData.aadhaarNumber && (
                    <button
                      type="button"
                      onClick={() => setIsAadhaarModalOpen(true)}
                      className="px-3.5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shrink-0 shadow-xs"
                    >
                      {isTamil ? 'அறிக்கை பார்' : 'View Record'}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isTamil
                    ? 'ஆதார் எண்ணை உள்ளிட்டால் இந்தியாவின் எந்த ஒரு மருத்துவமனையிலும் எடுக்கப்பட்ட பரிசோதனை அறிக்கைகள், மாத்திரைகள் மற்றும் அறுவை சிகிச்சை வரலாறுகள் உடனடியாக பெறப்படும்.'
                    : 'Consolidate lifetime diagnostic reports, medications, and surgical history across all connected Indian healthcare facilities.'}
                </p>
                {formErrors.aadhaarNumber && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.aadhaarNumber}</p>
                )}
              </div>

              {/* Known Allergies */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <label className="block font-semibold text-amber-800 uppercase tracking-wide text-[11px]">
                  ⚠️ Documented Drug & Food Allergies (Critical for Drug Safety Checks)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa, Aspirin, Seafood (Comma separated)"
                  className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
                />
                <span className="text-[11px] text-slate-600 block">
                  This will be encoded inside the offline QR and checked against prescriptions to block contraindications.
                </span>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block font-semibold text-slate-800 uppercase tracking-wide text-[11px]">
                  🚨 Emergency Contact Information (Encoded in Offline QR) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="Contact Name"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="Emergency Phone"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.emergencyContactRel}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRel: e.target.value })}
                      placeholder="Relationship (e.g. Spouse)"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-sm py-3.5 shadow-xs"
              >
                <UserCheck className="w-5 h-5" />
                <span>Complete Registration & Issue Offline QR Passport</span>
              </button>
            </form>
          </div>

          {/* Right Column: Newly Registered Preview */}
          <div className="lg:col-span-4 space-y-4">
            {newlyRegisteredPatient ? (
              <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase text-blue-700">
                    ✅ Registered Health Passport
                  </span>
                  <span className="badge-highlight font-mono">
                    {newlyRegisteredPatient.patientId}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <QRCodeSVG value={newlyRegisteredPatient.qrPayload} size={140} level="H" />
                  <span className="text-[10px] text-blue-700 font-semibold mt-2">
                    Offline QR: Blood {newlyRegisteredPatient.bloodType} • Allergies Encoded
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-800">
                  <h3 className="text-lg font-bold text-slate-900">{newlyRegisteredPatient.name}</h3>
                  <p className="text-xs text-slate-500">Age: {newlyRegisteredPatient.age} ({newlyRegisteredPatient.gender})</p>
                  <p className="text-xs font-semibold text-blue-700">Blood Group: {newlyRegisteredPatient.bloodType}</p>
                  <p className="text-xs text-slate-600">
                    Emergency: {newlyRegisteredPatient.emergencyContact.name} ({newlyRegisteredPatient.emergencyContact.phone})
                  </p>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                    Allergies: {newlyRegisteredPatient.allergies.join(', ') || 'None'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPatientId(newlyRegisteredPatient.id);
                    setActiveTab('issueToken');
                  }}
                  className="w-full btn-primary text-xs py-2.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Issue Token For This Patient</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center text-[#0000CC] space-y-3">
                <QrCode className="w-12 h-12 mx-auto text-slate-400" />
                <h4 className="font-bold text-slate-700">Digital Health Passport Preview</h4>
                <p className="text-xs text-slate-500">
                  Fill in the registration form to immediately generate the patient's offline vector QR passport and unique hospital ID.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ISSUE OPD TOKEN */}
      {activeTab === 'issueToken' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Issue OPD Consultation Token</h2>
            <p className="text-xs text-slate-500">
              Allocates next sequential token and computes dynamic estimated wait time.
            </p>
          </div>

          <form onSubmit={handleIssueToken} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Select Patient *</label>
              <select
                value={tokenFormData.patientId}
                onChange={(e) => setTokenFormData({ ...tokenFormData, patientId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientId}) — Blood: {p.bloodType}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Department *</label>
                <select
                  value={tokenFormData.departmentId}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, departmentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.nameTa})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Attending Physician *</label>
                <select
                  value={tokenFormData.doctorId}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, doctorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.deptName})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1 text-[11px]">Chief Symptom Summary</label>
              <input
                type="text"
                value={tokenFormData.symptomSummary}
                onChange={(e) => setTokenFormData({ ...tokenFormData, symptomSummary: e.target.value })}
                placeholder="e.g. Fever, persistent dry cough, headache"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button type="submit" className="w-full btn-primary text-sm py-3.5 shadow-xs">
              <Ticket className="w-4 h-4" />
              <span>Generate OPD Token & Add to Live Queue</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LIVE OPD QUEUE VIEW */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search token, patient name, doctor..."
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none text-slate-800 w-full sm:w-64 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tokens Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.map(token => {
              const isWaiting = token.tokenStatus === 'Waiting';
              const isInConsult = token.tokenStatus === 'In Consultation';
              const isCompleted = token.tokenStatus === 'Completed';

              return (
                <div
                  key={token.id}
                  className={`bg-white border rounded-3xl p-5 shadow-xs space-y-3 transition ${
                    isInConsult
                      ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                      : token.triageLevel.includes('Critical')
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600 font-mono">
                      {token.tokenNumber}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      isInConsult
                        ? 'bg-blue-600 text-white animate-pulse'
                        : isWaiting
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {token.tokenStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{token.patientName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{token.doctorName} • {token.deptName}</p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{token.symptomSummary}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Wait: ~{token.estimatedWaitMins || 5} mins
                    </span>

                    <div className="flex items-center space-x-1">
                      {isWaiting && (
                        <button
                          onClick={() => updateTokenStatus(token.id, 'In Consultation')}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold text-[11px] hover:bg-blue-700 transition"
                        >
                          Call Now
                        </button>
                      )}
                      {isInConsult && (
                        <button
                          onClick={() => updateTokenStatus(token.id, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold text-[11px] hover:bg-emerald-700 transition"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
