import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { calculateWaitTime, formatAadhaar } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import {
  User,
  QrCode,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  Ticket,
  CreditCard,
  CloudUpload,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PatientPortal = () => {
  const {
    selectedPatient,
    patients,
    setCurrentRole,
    setIsImportModalOpen,
    language,
    t,
    appointments,
    prescriptions,
    currentServingTokenNumber,
    setIsAadhaarModalOpen,
  } = useHospital();

  const [activeTab, setActiveTab] = useState('passport'); // 'passport' | 'token' | 'prescriptions'
  const [speechRate, setSpeechRate] = useState(0.85); // 0.5x to 1.5x
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [voiceFound, setVoiceFound] = useState(true);

  const isTamil = language === 'ta';

  if (!selectedPatient || !selectedPatient.id || patients.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs my-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {isTamil ? 'நோயாளி பதிவுகள் எதுவும் இல்லை' : 'No Patient Records in Database'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {isTamil
              ? 'அனைத்து இயல்புநிலை மாதிரித் தரவுகளும் நீக்கப்பட்டுவிட்டன. புதிய நோயாளிகளை பதிவு செய்யவும் அல்லது JSON/CSV கோப்பை இறக்குமதி செய்யவும்.'
              : 'All default demo records have been cleared. Register a new patient at Reception or import your patient records to begin.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isTamil ? 'தரவு இறக்குமதி செய்க' : 'Import Hospital Data'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('reception')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
          >
            <span>{isTamil ? 'வரவேற்பறைக்குச் செல்லவும்' : 'Go to Reception Desk'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Token for Patient
  const patientToken = appointments.find(
    a => a.patientId === selectedPatient.id && a.tokenStatus !== 'Completed' && a.tokenStatus !== 'Cancelled'
  );

  // Dynamic Predictive Wait Time
  const userTokenNum = patientToken 
    ? parseInt(String(patientToken.tokenNumber || '101').replace(/\D/g, ''), 10) || 101 
    : 101;

  const waitCalculation = calculateWaitTime({
    userToken: userTokenNum,
    currentServingToken: currentServingTokenNumber,
    averageConsultationMins: 5,
    triageLevel: patientToken?.triageLevel || 'Routine (Green)'
  });

  // Patient's prescriptions
  const patientPrescriptions = prescriptions.filter(
    p => p.patientId === selectedPatient.id
  );

  // Generate prescription voice script dynamically based on active language
  const generateVoiceScript = () => {
    const rx = patientPrescriptions[0];
    const patientName = isTamil ? (selectedPatient.nameTa || selectedPatient.name) : selectedPatient.name;
    const doctorName = rx?.doctorName || (isTamil ? 'டாக்டர் கார்லோ டோலிடானோ' : 'Dr. Carlo Toledano');

    if (isTamil) {
      let script = `வணக்கம் ${patientName} அவர்களே. உங்கள் மருத்துவர் ${doctorName} உங்களுக்கு வழங்கிய மருந்து வழிகாட்டுதல் இதோ. `;
      if (rx?.diagnosis) {
        script += `உங்கள் பரிசோதனை முடிவு: ${rx.diagnosis}. `;
      }
      if (rx?.items && rx.items.length > 0) {
        script += `நீங்கள் உட்கொள்ள வேண்டிய மருந்துகள்: `;
        rx.items.forEach((item, index) => {
          let freq = 'சாப்பாட்டிற்கு பிறகு உட்கொள்ளவும்';
          if (item.frequency.includes('1-0-1')) freq = 'காலை 1 மற்றும் இரவு 1 மாத்திரை சாப்பாட்டிற்கு பிறகு';
          else if (item.frequency.includes('1-0-0')) freq = 'காலை மட்டும் 1 மாத்திரை சாப்பாட்டிற்கு பிறகு';
          else if (item.frequency.includes('0-0-1')) freq = 'இரவு தூங்கும் முன் 1 மாத்திரை';
          else if (item.frequency.includes('SOS')) freq = 'காய்ச்சல் அல்லது வலி இருக்கும் போது மட்டும்';

          script += `${index + 1}) ${item.name} (${item.strength}), ${freq}, ${item.duration} நாட்களுக்கு உட்கொள்ளவும். `;
        });
      }
      script += `தினமும் போதுமான அளவு வெந்நீர் அருந்தவும், நல்ல ஓய்வு எடுக்கவும். நன்றி.`;
      return script;
    } else {
      let script = `Hello ${patientName}. Here is your prescription guidance from ${doctorName}. `;
      if (rx?.diagnosis) {
        script += `Your diagnosis: ${rx.diagnosis}. `;
      }
      if (rx?.items && rx.items.length > 0) {
        script += `Prescribed medications: `;
        rx.items.forEach((item, index) => {
          let freq = 'take after meals';
          if (item.frequency.includes('1-0-1')) freq = 'one tablet morning and one at night after meals';
          else if (item.frequency.includes('1-0-0')) freq = 'one tablet in the morning after breakfast';
          else if (item.frequency.includes('0-0-1')) freq = 'one tablet at night before sleep';
          else if (item.frequency.includes('SOS')) freq = 'take only when necessary for pain or fever';

          script += `${index + 1}) ${item.name} (${item.strength}), ${freq}, for ${item.duration}. `;
        });
      }
      script += `Please drink adequate warm water, follow precautions, and take sufficient rest. Thank you.`;
      return script;
    }
  };

  const scriptText = generateVoiceScript();

  // Web Speech API Integration
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechError(isTamil ? 'உலாவியில் Speech Synthesis ஆதரிக்கப்படவில்லை.' : 'Web Speech API is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError(null);

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (isTamil) {
      const tamilVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
        utterance.lang = 'ta-IN';
        setVoiceFound(true);
      } else if (indianVoice) {
        utterance.voice = indianVoice;
        setVoiceFound(false);
      } else {
        utterance.lang = 'ta-IN';
        setVoiceFound(false);
      }
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
      setVoiceFound(true);
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlayingAudio(false);
      setSpeechError(isTamil ? 'குரல் பதிவு முடிவடைந்தது.' : 'Audio playback ended or was interrupted.');
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-blue-700">
              {t('patientPortalTitle')}
            </h1>
            <span className="badge-highlight font-mono">{selectedPatient.patientId}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {t('patientPortalDesc')}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'passport' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{t('digitalPassportTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'token' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('liveOpdTokenTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('voicePrescriptionTab')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DIGITAL HEALTH PASSPORT (OFFLINE QR) */}
      {activeTab === 'passport' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card Body (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isTamil && selectedPatient.nameTa ? selectedPatient.nameTa : selectedPatient.name}
                  </h2>
                  <p className="text-xs text-blue-600 font-mono font-medium">{selectedPatient.patientId}</p>
                  <p className="text-xs text-slate-500">
                    {isTamil ? (selectedPatient.gender === 'Male' ? 'ஆண்' : selectedPatient.gender === 'Female' ? 'பெண்' : 'மற்றவை') : selectedPatient.gender} • {selectedPatient.age} {t('years')} • {t('dateOfBirth')}: {selectedPatient.dateOfBirth}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1 border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('printCard')}</span>
              </button>
            </div>

            {/* Offline Clinical Metadata (Encoded in QR) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">{t('bloodGroup')}</span>
                <span className="text-2xl font-bold text-blue-700">{selectedPatient.bloodType}</span>
              </div>
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl sm:col-span-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">{t('allergies')}</span>
                <span className="text-sm font-semibold text-amber-800">
                  {selectedPatient.allergies.join(', ') || t('noAllergies')}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                🚨 {t('emergencyContact')}:
              </span>
              <p className="text-slate-800 font-semibold">
                {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) —{' '}
                <span className="text-blue-600">{selectedPatient.emergencyContact.phone}</span>
              </p>
            </div>

            {/* 12-Digit Aadhaar Universal ID */}
            <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-blue-800 flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>{t('aadhaarCardUidLabel')}</span>
                </span>
                <span className="font-mono text-slate-900 font-bold text-sm tracking-widest block mt-0.5">
                  {formatAadhaar(selectedPatient.aadhaarNumber || '234567890123')}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isTamil ? 'அனைத்து மருத்துவமனை அறிக்கைகளும் ஒரே இடத்தில்' : 'Connected to Indian Health Network • All Hospital Reports Consolidated'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-100" />
                <span>{t('allHospitalReportsBtn')}</span>
              </button>
            </div>

            {/* ABHA / ABDM Stub Data */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 block">{t('abhaAddressLabel')}</span>
                <span className="font-mono text-slate-600 font-medium">{selectedPatient.abhaAddress || 'patient.1001@abdm'}</span>
              </div>
              <span className="badge-highlight text-[10px]">National Sandbox Stub</span>
            </div>
          </div>

          {/* QR Code Offline Passport (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {t('offlineReadable')}
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <QRCodeSVG
                value={selectedPatient.qrPayload || JSON.stringify({ pid: selectedPatient.patientId, blood: selectedPatient.bloodType })}
                size={180}
                level="H"
              />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900">{t('offlineReadable')}</p>
              <p className="text-[11px] text-slate-500">
                {t('offlineReadableDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE OPD TOKEN & PREDICTIVE WAIT TIME */}
      {activeTab === 'token' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold uppercase text-blue-600">{t('liveOpdQueueBoard')}</span>
            <h2 className="text-2xl font-bold text-slate-900">
              {t('tokenStatusLabel')} {patientToken ? patientToken.tokenNumber : t('noActiveToken')}
            </h2>
            <p className="text-xs text-slate-500">
              {patientToken ? `${patientToken.deptName} • ${patientToken.doctorName}` : t('pleaseRegisterToken')}
            </p>
          </div>

          {patientToken && (
            <div className="space-y-4">
              {/* Dynamic Wait-Time Gauge */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">{t('estimatedWaitTime')}</span>
                <div className="text-4xl font-extrabold text-blue-600">
                  ~{waitCalculation.estimatedWaitMins} <span className="text-xl font-bold text-slate-600">{t('minutes')}</span>
                </div>
                <p className="text-xs font-medium text-slate-600">
                  {isTamil
                    ? `${waitCalculation.tokensAhead} நோயாளிகள் வரிசையில் முன்னுள்ளனர் • சராசரி ஆலோசனை: 5 நிமிடம்`
                    : `${waitCalculation.tokensAhead} patient(s) ahead in line • Avg consultation: 5 mins`}
                </p>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, 100 - waitCalculation.tokensAhead * 20))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{t('currentlyServing')}</span>
                  <span className="text-xl font-bold text-slate-800">TK-{currentServingTokenNumber}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">{t('yourToken')}</span>
                  <span className="text-xl font-bold text-blue-600">{patientToken.tokenNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VOICE PRESCRIPTIONS (0.5x to 1.5x SPEED) */}
      {activeTab === 'prescriptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Audio Controls & Voice Synthesizer (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {t('voiceRxTitle')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('voiceRxSubtitle')}
              </p>
            </div>

            {/* Playback Button */}
            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <button
                onClick={handlePlayAudio}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition transform hover:scale-105"
                title={isPlayingAudio ? t('pause', 'Pause') : t('clickToPlay')}
              >
                {isPlayingAudio ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <span className="text-xs font-semibold text-blue-700">
                {isPlayingAudio ? t('playingAudio') : t('clickToPlay')}
              </span>
            </div>

            {/* Playback Speed Slider: 0.5x to 1.5x */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span className="flex items-center">
                  <Sliders className="w-3.5 h-3.5 text-blue-600 mr-1" />
                  {t('voiceSpeed')}
                </span>
                <span className="text-blue-600 font-bold">{speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>{t('slow')}</span>
                <span>{t('normal')}</span>
                <span>{t('fast')}</span>
              </div>
            </div>

            {/* Fallback Notice if Voice Not Installed */}
            {!voiceFound && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>{t('fallbackVoiceNotice')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Full Text Transcript & Medications (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {t('prescriptionTranscript')}
              </h3>
              <span className="badge-highlight">{isTamil ? 'உரை வழிகாட்டி' : 'Transcript'}</span>
            </div>

            {/* Full Script Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <span className="text-[10px] font-semibold text-blue-700 uppercase block">
                {t('fullRxInstructions')}
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                {scriptText}
              </p>
            </div>

            {/* Prescribed Items List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 uppercase block">
                {t('prescribedMedicinesList')}
              </span>
              {patientPrescriptions[0]?.items?.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name} ({item.strength})</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.frequency} • {item.duration} • {item.route}</p>
                    {isTamil && item.tamilInstructions && (
                      <p className="text-[11px] text-blue-700 font-medium mt-0.5">{item.tamilInstructions}</p>
                    )}
                  </div>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
