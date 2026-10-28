import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import { HealthIDCard } from '../HealthIDCard';
import { SymptomScreener } from './SymptomScreener';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Building2,
  Stethoscope
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PatientPortal = () => {
  const {
    selectedPatient,
    language,
    departments,
    doctors,
    appointments,
    bookAppointment,
    discharges,
  } = useHospital();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeView, setActiveView] = useState('card'); // 'card' | 'screener' | 'book' | 'discharge'
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0].id);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0].id);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [currentServingTokenNumber, setCurrentServingTokenNumber] = useState(10); // Simulated currently serving token in OPD

  if (!selectedPatient) return null;

  // Filter available doctors for chosen department
  const filteredDoctors = doctors.filter(d => d.departmentId === selectedDeptId);

  // Active appointment for this patient
  const patientApt = appointments.find(
    a => a.patientId === selectedPatient.id && a.tokenStatus !== 'Cancelled'
  );

  // Patient's discharge record
  const patientDischarge = discharges.find(d => d.patientId === selectedPatient.id);

  // Dynamic Predictive AI OPD Wait Time calculations
  const userTokenNum = patientApt ? (parseInt(patientApt.tokenNumber.replace(/\D/g, '')) || 14) : 14;
  const tokensAhead = Math.max(0, userTokenNum - currentServingTokenNumber);
  const avgTimePerPatient = 4.5; // minutes per consultation
  const estimatedWaitMins = Math.round(tokensAhead * avgTimePerPatient);
  const queueProgress = Math.min(100, Math.round((currentServingTokenNumber / userTokenNum) * 100));

  const handleBook = (e) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === selectedDeptId);
    const doc = doctors.find(d => d.id === selectedDoctorId) || filteredDoctors[0];

    const newApt = bookAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: doc?.id,
      doctorName: doc?.name,
      departmentId: dept.id,
      deptName: dept.name,
      slotTime: selectedSlot,
      triageLevel: 'Routine (Green)',
      symptomSummary: 'Self-booked outpatient consultation.',
    });

    confetti({ particleCount: 50, spread: 60 });
    alert(`Appointment successfully confirmed! Token Number: ${newApt.tokenNumber}`);
    setActiveView('card');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Professional Patient Portal Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl text-white shadow-sm">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {language === 'ta' ? 'நோயாளி சுயசேவை போர்டல்' : 'Patient Healthcare Portal'}
              </h2>
              <span className="text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-md">
                {selectedPatient.patientId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome, <strong className="text-slate-800">{selectedPatient.name}</strong> • Authorized digital health passport & outpatient care services
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveView('card')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeView === 'card'
                ? 'bg-[#002855] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Digital Health Passport</span>
          </button>

          <button
            onClick={() => setActiveView('book')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeView === 'book'
                ? 'bg-[#002855] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.bookAppointment}</span>
          </button>

          <button
            onClick={() => setActiveView('screener')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeView === 'screener'
                ? 'bg-[#002855] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.symptomScreener}</span>
          </button>

          {patientDischarge && (
            <button
              onClick={() => setActiveView('discharge')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                activeView === 'discharge'
                  ? 'bg-[#002855] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Discharge Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Active Routine Token Banner with Predictive AI OPD Queue Wait-Time */}
      {patientApt && (
        <div className="bg-gradient-to-br from-[#002855] via-[#003875] to-[#001e3d] rounded-3xl p-5 sm:p-6 text-white border border-cyan-500/40 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 text-cyan-300 shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                    Active Routine Queue Token
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    tokensAhead === 0
                      ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {tokensAhead === 0 ? '🔔 Now Calling (உங்கள் முறை)' : patientApt.tokenStatus}
                  </span>
                </div>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-white">
                    {patientApt.tokenNumber}
                  </span>
                  <span className="text-xs sm:text-sm text-cyan-100">
                    {patientApt.deptName} • Attending: <strong>{patientApt.doctorName}</strong> (Slot: {patientApt.slotTime})
                  </span>
                </div>
              </div>
            </div>

            {/* Wait Time Counter Badge */}
            <div className="flex items-center space-x-3 bg-black/40 px-4 py-3 rounded-2xl border border-cyan-800/80">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Predictive Wait-Time (AI)
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300">
                  {tokensAhead === 0 ? '0 mins' : `~${estimatedWaitMins} mins`}
                </span>
              </div>
              <div className="h-8 w-px bg-cyan-900" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Doctor Serving
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                  #{currentServingTokenNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic AI Queue Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono text-cyan-200">
              <span>Current Token: #{currentServingTokenNumber}</span>
              <span className="font-bold text-white">Your Token: #{userTokenNum} ({tokensAhead} patients ahead)</span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-cyan-900/60">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${queueProgress}%` }}
              />
            </div>
          </div>

          {/* Bilingual Live Guidance Message */}
          <div className="bg-[#00172e] p-3.5 rounded-2xl border border-cyan-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-amber-200 font-medium">
                {language === 'ta'
                  ? tokensAhead === 0
                    ? `🔔 உங்கள் டோக்கன் எண் #${userTokenNum} அழைக்கப்படுகிறது! தயவுசெய்து ஆலோசனை அறைக்கு செல்லவும்.`
                    : `📢 உங்கள் டோக்கன் எண் #${userTokenNum}. டாக்டர் தற்போது #${currentServingTokenNumber}-ஐப் பார்க்கிறார். உங்கள் முறை வர இன்னும் தோராயமாக ${estimatedWaitMins} நிமிடங்கள் ஆகும்.`
                  : tokensAhead === 0
                  ? `🔔 Token #${userTokenNum} is now being called! Please proceed into the clinician room.`
                  : `📢 Your Token is #${userTokenNum}. Doctor is currently examining #${currentServingTokenNumber}. Estimated wait: ~${estimatedWaitMins} mins (${tokensAhead} patients ahead).`}
              </p>
              <p className="text-[11px] text-slate-400">
                {tokensAhead > 3
                  ? '☕ Smart Suggestion: You have time to visit the cafeteria or waiting garden. We will send a voice alert when 2 tokens remain.'
                  : '🚪 Please remain seated near Room 204 Outpatient consultation door.'}
              </p>
            </div>

            {/* Test Simulation Button */}
            <button
              type="button"
              onClick={() => {
                if (currentServingTokenNumber < userTokenNum) {
                  setCurrentServingTokenNumber(prev => prev + 1);
                  confetti({ particleCount: 20, spread: 40 });
                } else {
                  alert('Token consultation reached your number! You are next in line.');
                }
              }}
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold rounded-xl text-xs transition shrink-0 active:scale-95 shadow"
              title="Click to simulate doctor completing a patient and advancing queue"
            >
              ▶️ Call Next Token (Simulate)
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Display */}
      {activeView === 'card' && <HealthIDCard />}

      {activeView === 'screener' && <SymptomScreener />}

      {activeView === 'book' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-3xl mx-auto animate-fadeIn">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {language === 'ta' ? 'புதிய மருத்துவ ஆலோசனை முன்பதிவு' : 'Book Outpatient (OPD) Consultation'}
                </h3>
                <p className="text-xs text-slate-500">
                  Select clinical department, attending specialist, and available time slot
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleBook} className="space-y-4">
            {/* 1. Department Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Department *
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  const docs = doctors.filter(d => d.departmentId === e.target.value);
                  if (docs.length > 0) setSelectedDoctorId(docs[0].id);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) - {d.nameTa}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Doctor Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Attending Specialist Clinician *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
              >
                {filteredDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} • {doc.specialty} ({doc.cabin})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Slot Times */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Convenient Time Slot *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['09:30 AM', '10:00 AM', '10:45 AM', '11:30 AM', '02:00 PM', '03:15 PM'].map(slot => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                      selectedSlot === slot
                        ? 'bg-[#002855] text-white border-[#002855] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
              >
                <span>Confirm Appointment & Generate Queue Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'discharge' && patientDischarge && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 max-w-3xl mx-auto animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Certified Hospital Discharge Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Approved by {patientDischarge.approvedBy} on {patientDischarge.dischargeDate}
                </p>
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
              Discharged Stable
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong className="block text-slate-900 mb-1">Clinical Summary:</strong>
            {patientDischarge.summary}
          </div>

          <div>
            <strong className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Post-Discharge Instructions:
            </strong>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              {patientDischarge.instructions.map((inst, i) => (
                <li key={i} className="pl-1">{inst}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900 font-semibold flex items-center justify-between">
            <span>Scheduled Follow-up Clinic Visit: {patientDischarge.followUpAt}</span>
            <span className="text-[11px] bg-cyan-200 px-2.5 py-0.5 rounded">OPD Room 102</span>
          </div>
        </div>
      )}
    </div>
  );
};
