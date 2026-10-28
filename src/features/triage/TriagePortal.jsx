import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { calculateTriageScore, calculateWaitTime } from '../../lib/utils';
import {
  HeartPulse,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  User,
  Activity,
  Flame,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TriagePortal = () => {
  const {
    language,
    t,
    patients,
    appointments,
    triggerEmergencyAlert,
    bookAppointment,
    updateTokenStatus,
    departments,
    currentServingTokenNumber
  } = useHospital();

  const isTamil = language === 'ta';

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [symptomLanguage, setSymptomLanguage] = useState(isTamil ? 'ta' : 'en');
  const [symptomText, setSymptomText] = useState(
    isTamil ? 'நெஞ்சு வலி மற்றும் இடது கை வலி, அதிக வியர்வை' : 'Acute chest pain radiating to left arm, cold sweat'
  );
  const [duration, setDuration] = useState('45 mins');
  const [spo2, setSpo2] = useState('94');
  const [pulse, setPulse] = useState('98');

  // Update symptom language and sample text when global language changes
  useEffect(() => {
    setSymptomLanguage(isTamil ? 'ta' : 'en');
    setSymptomText(isTamil ? 'நெஞ்சு வலி மற்றும் இடது கை வலி, அதிக வியர்வை' : 'Acute chest pain radiating to left arm, cold sweat');
  }, [language]);

  // Screener Calculation State
  const [screeningResult, setScreeningResult] = useState(() => 
    calculateTriageScore(
      isTamil ? 'நெஞ்சு வலி மற்றும் இடது கை வலி, அதிக வியர்வை' : 'Acute chest pain radiating to left arm, cold sweat',
      { spo2: '94', pulseRate: '98' }
    )
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || {
    id: 'walk-in',
    name: 'Emergency Walk-in',
    nameTa: 'அவசர நோயாளி',
    age: 30,
    gender: 'Other'
  };

  const handleEvaluate = (e) => {
    if (e) e.preventDefault();
    const result = calculateTriageScore(symptomText, { spo2, pulseRate: pulse });
    setScreeningResult(result);
  };

  const handleEscalateCodeRed = () => {
    const pName = (isTamil && selectedPatient.nameTa) ? selectedPatient.nameTa : selectedPatient.name;
    triggerEmergencyAlert({
      patientId: selectedPatient.id,
      patientName: `${pName} (${selectedPatient.age}${selectedPatient.gender[0]})`,
      warningSigns: `${symptomText} [SpO2: ${spo2}%, Pulse: ${pulse} bpm]`,
      origin: 'Triage Desk Clinical Screening'
    });
    alert(
      isTamil
        ? '🚨 அவசர கோட் ரெட் எச்சரிக்கை செயல்படுத்தப்பட்டது! மருத்துவர் மற்றும் செவிலியருக்கு அவசர அறிவிப்பு அனுப்பப்பட்டுள்ளது.'
        : '🚨 CODE RED EMERGENCY ESCALATED! Alert transmitted to Doctor and Nurse stations. Patient priority updated in queue.'
    );
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleIssueTriageToken = () => {
    const isCritical = screeningResult.isEmergency;
    const targetDept = departments[0];

    const newApt = bookAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: 'doc-1',
      doctorName: 'Dr. Carlo Toledano',
      departmentId: targetDept.id,
      deptName: targetDept.name,
      triageLevel: screeningResult.triageLevel,
      symptomSummary: `${symptomText} (Acuity Score: ${screeningResult.score})`
    });

    alert(
      isTamil
        ? `டோக்கன் ${newApt.tokenNumber} முன்னுரிமை நிலை "${screeningResult.triageLevel}" உடன் வழங்கப்பட்டது.`
        : `Token ${newApt.tokenNumber} issued with Triage Level "${screeningResult.triageLevel}".`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('triageTitle')}
            </h1>
            <span className="badge-highlight">AI Rule Engine</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {t('triageDesc')}
          </p>
        </div>

        <button
          onClick={handleEscalateCodeRed}
          className="btn-primary text-xs py-2.5 px-4 bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center space-x-1.5 shrink-0"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>{isTamil ? 'உடனடி கோட் ரெட் தொடங்கு' : 'Trigger STAT Code Red'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multilingual Symptom Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              {isTamil ? 'நோயாளி அறிகுறி மதிப்பீடு' : 'Patient Symptom Screener'}
            </h2>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSymptomLanguage('ta')}
                className={`px-3 py-1 rounded-lg transition ${
                  symptomLanguage === 'ta' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ் (Tamil)
              </button>
              <button
                type="button"
                onClick={() => setSymptomLanguage('en')}
                className={`px-3 py-1 rounded-lg transition ${
                  symptomLanguage === 'en' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                {isTamil ? 'நோயாளியைத் தேர்ந்தெடுக்கவும் *' : 'Select Patient *'}
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {(isTamil && p.nameTa) ? p.nameTa : p.name} ({p.patientId}) — {t('bloodGroup')}: {p.bloodType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                {symptomLanguage === 'ta' 
                  ? 'நோயாளியின் அறிகுறிகள் (Symptoms in Tamil) *' 
                  : 'Reported Symptoms (English) *'}
              </label>
              <textarea
                rows={3}
                required
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder={symptomLanguage === 'ta' ? 'எ.கா. நெஞ்சு வலி, மூச்சுத்திணறல், படபடப்பு...' : 'e.g. Chest pain radiating to left arm, sweating, breathlessness...'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Quick Symptom Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-600 self-center mr-1">
                {isTamil ? 'உடனடி தேர்வு:' : 'Quick Add:'}
              </span>
              {[
                { en: 'Chest pain & cold sweat', ta: 'நெஞ்சு வலி மற்றும் வியர்வை' },
                { en: 'Shortness of breath', ta: 'மூச்சுத்திணறல்' },
                { en: 'High fever with chills', ta: 'அதிக காய்ச்சல்' },
                { en: 'Severe abdominal colic', ta: 'கடுமையான வயிற்று வலி' },
                { en: 'Fainting / Syncope', ta: 'மயக்கம்' }
              ].map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSymptomText(symptomLanguage === 'ta' ? chip.ta : chip.en)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-[11px] font-medium transition"
                >
                  {symptomLanguage === 'ta' ? chip.ta : chip.en}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  {isTamil ? 'கால அளவு' : 'Duration'}
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  {isTamil ? 'ஆக்சிஜன் SpO2 (%)' : 'Oxygen SpO2 (%)'}
                </label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  {isTamil ? 'நாடித்துடிப்பு (bpm)' : 'Pulse Rate (bpm)'}
                </label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary text-xs py-3 mt-2 shadow-xs">
              <Sparkles className="w-4 h-4" />
              <span>{t('evaluateAcuityBtn')}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Triage Result Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 ${
            screeningResult.isEmergency ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                {t('triageResultHeader')}
              </span>
              <span className="text-xs font-bold font-mono text-blue-700">
                {t('acuityScoreLabel')} {screeningResult.score}/100
              </span>
            </div>

            {/* Acuity Level Badge */}
            <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
              screeningResult.isEmergency 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : screeningResult.score >= 20 
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className={`p-2.5 rounded-xl text-white ${
                screeningResult.isEmergency ? 'bg-rose-600' : screeningResult.score >= 20 ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider">
                  {isTamil ? 'தீவிரத்தன்மை நிலை' : 'Acuity Level'}
                </span>
                <span className="text-lg font-bold">{screeningResult.triageLevel}</span>
              </div>
            </div>

            {/* Identified Red Flags */}
            {screeningResult.flags.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-rose-700 uppercase block">
                  {isTamil ? 'கண்டறியப்பட்ட மருத்துவ ஆபத்து காரணிகள்:' : 'Identified Clinical Risk Flags:'}
                </span>
                <div className="space-y-1">
                  {screeningResult.flags.map((flag, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-rose-800 bg-rose-50 border border-rose-200 p-2 rounded-lg font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Recommendation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-blue-700 block uppercase text-[10px]">
                {t('recommendedActionLabel')}
              </span>
              <p className="text-slate-800 font-medium">
                {screeningResult.aiRecommendation}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {screeningResult.isEmergency ? (
                <button
                  type="button"
                  onClick={handleEscalateCodeRed}
                  className="w-full btn-primary text-xs py-3 bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>{t('escalateEmergencyBtn')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleIssueTriageToken}
                  className="w-full btn-primary text-xs py-3 shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('issueTriageTokenBtn')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
