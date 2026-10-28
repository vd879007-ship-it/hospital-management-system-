import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  Mic,
  MicOff,
  AlertTriangle,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  HeartPulse,
  Info,
  CheckCircle,
  HelpCircle,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SymptomScreener = () => {
  const {
    language,
    selectedPatient,
    triggerEmergencyAlert,
    bookAppointment,
    departments,
    doctors,
    setCurrentRole,
    addAuditLog,
  } = useHospital();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [inputSymptom, setInputSymptom] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language === 'ta' ? 'ta-IN' : 'en-US');
  const [isListening, setIsListening] = useState(false);
  const [screenerResult, setScreenerResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync selected language when global language changes
  useEffect(() => {
    setSelectedLanguage(language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US');
  }, [language]);

  // Voice Recognition Web Speech API Setup
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use the quick preset buttons or type below.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputSymptom(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Deterministic Emergency Warning Rule Engine
  const analyzeSymptoms = (symptomText) => {
    setIsAnalyzing(true);
    setScreenerResult(null);

    setTimeout(() => {
      const lower = symptomText.toLowerCase();

      // Deterministic Red Flags / Emergency rules
      const emergencyKeywords = [
        'chest pain', 'நெஞ்சு வலி', 'छाती में दर्द',
        'heart', 'மாரடைப்பு', 'heart attack',
        'breathless', 'மூச்சுத்திணறல்', 'सांस लेने में कठिनाई',
        'shortness of breath', 'severe bleeding', 'ரத்தப்போக்கு',
        'unconscious', 'மயக்கம்', 'seizure', 'வலிப்பு',
        'paralysis', 'பக்கவாதம்', 'stroke', 'face drooping'
      ];

      const isEmergency = emergencyKeywords.some(kw => lower.includes(kw.toLowerCase()));

      if (isEmergency) {
        // Trigger Emergency Escalation immediately!
        const alertObj = triggerEmergencyAlert({
          patientId: selectedPatient?.id,
          patientName: selectedPatient?.name || 'Emergency Patient',
          warningSigns: symptomText,
          origin: `Symptom Screener (${selectedLanguage})`
        });

        setScreenerResult({
          type: 'EMERGENCY',
          severity: 'Critical (Red)',
          suggestedDept: 'Emergency & Trauma (Resuscitation Bay)',
          deptId: 'dept-5',
          summary: language === 'ta' 
            ? 'அவசர சிகிச்சை எச்சரிக்கை! உயிருக்கு ஆபத்தான அறிகுறிகள் கண்டறியப்பட்டுள்ளன. வழக்கமான டோக்கன் வரிசையில் காத்திருக்காமல் உடனடி அவசர சிகிச்சை பிரிவுக்கு செல்லவும்.'
            : 'CRITICAL ALERT! Potentially life-threatening emergency warning signs detected. DO NOT wait in the routine outpatient queue. Human assessment initiated.',
          recommendedAction: 'Direct transfer to Emergency Trauma / Cath Lab Resus Bay. Staff alerted.',
          alertId: alertObj.alertId,
        });
      } else {
        // Routine Routing Rules
        let suggestedDept = 'General Medicine';
        let deptId = 'dept-1';
        let level = 'Routine (Green)';

        if (lower.includes('heart') || lower.includes('palpitation') || lower.includes('துடிப்பு')) {
          suggestedDept = 'Cardiology';
          deptId = 'dept-2';
          level = 'Priority (Yellow)';
        } else if (lower.includes('child') || lower.includes('baby') || lower.includes('குழந்தை') || lower.includes('குழந்தைகள்')) {
          suggestedDept = 'Pediatrics';
          deptId = 'dept-3';
        } else if (lower.includes('bone') || lower.includes('fracture') || lower.includes('joint') || lower.includes('முறிவு') || lower.includes('மூட்டு')) {
          suggestedDept = 'Orthopedics';
          deptId = 'dept-4';
        } else if (lower.includes('cough') || lower.includes('lung') || lower.includes('இருமல்') || lower.includes('சளி')) {
          suggestedDept = 'Pulmonology';
          deptId = 'dept-6';
        }

        setScreenerResult({
          type: 'ROUTINE',
          severity: level,
          suggestedDept,
          deptId,
          summary: language === 'ta'
            ? `அறிகுறிகள் பரிசீலிக்கப்பட்டு ${suggestedDept} பிரிவுக்கு பரிந்துரை செய்யப்படுகிறது. மருத்துவர் நேரில் பரிசோதித்து இறுதி முடிவெடுப்பார்.`
            : `Symptoms analyzed and routed to ${suggestedDept}. Clinician will review history and examination findings in OPD.`,
          recommendedAction: 'Proceed to book appointment or register routine token.',
        });
      }

      setIsAnalyzing(false);
    }, 600);
  };

  // Quick Tamil / English symptom buttons for effortless testing
  const quickPresets = [
    {
      label: 'நெஞ்சு வலி & மூச்சுத்திணறல் (Chest pain & breathlessness)',
      text: 'திடீர் கடுமையான நெஞ்சு வலி மற்றும் இடது கையில் பரவும் வலி, மூச்சுத்திணறல் (Severe sudden chest pain & breathlessness)',
      isEmergency: true
    },
    {
      label: '3 நாட்களாக அதிக காய்ச்சல், குளிர் (High fever & chills)',
      text: '3 நாட்களாக விடாத அதிக காய்ச்சல் (102°F), நடுக்கம் மற்றும் கடுமையான தலைவலி (Persistent high fever and chills for 3 days)',
      isEmergency: false
    },
    {
      label: 'மூட்டு வலி & நடப்பதில் சிரமம் (Joint pain & walking difficulty)',
      text: 'வலது முழங்கால் மூட்டு வலி மற்றும் வீக்கம், நடக்கும் போது கடுமையான வலி (Right knee joint swelling and severe walking pain)',
      isEmergency: false
    },
    {
      label: 'தொடர் வறட்டு இருமல், தொண்டை வலி (Persistent dry cough)',
      text: '5 நாட்களாக விடாத வறட்டு இருமல் மற்றும் தொண்டை எரிச்சல் (Persistent dry cough and throat irritation)',
      isEmergency: false
    }
  ];

  const handleBookSuggested = () => {
    if (!screenerResult) return;
    const targetDept = departments.find(d => d.id === screenerResult.deptId) || departments[0];
    const targetDoctor = doctors.find(d => d.departmentId === screenerResult.deptId) || doctors[0];

    bookAppointment({
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.name,
      doctorId: targetDoctor.id,
      doctorName: targetDoctor.name,
      departmentId: targetDept.id,
      deptName: targetDept.name,
      triageLevel: screenerResult.severity,
      symptomSummary: inputSymptom,
    });

    confetti({ particleCount: 40, spread: 50 });
    alert(`Appointment & Routine Token generated successfully for ${targetDept.name}!`);
    setCurrentRole('reception');
  };

  return (
    <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-md">
              <HeartPulse className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-[#002855]">
              {language === 'ta' ? 'பன்மொழி அறிகுறி பகுப்பாய்வு & டிரையாஜ்' : 'Multilingual Symptom Screener & Triage'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ta'
              ? 'தமிழ் மற்றும் ஆங்கில குரல் அல்லது தட்டச்சு மூலம் உங்கள் அறிகுறிகளை பதிவு செய்யவும்.'
              : 'Voice-assisted screening with deterministic emergency escalation pathways.'}
          </p>
        </div>

        {/* Language selector for voice input */}
        <div className="flex items-center bg-cyan-50 border border-cyan-200 p-1.5 rounded-2xl text-xs">
          <span className="text-cyan-800 font-bold mr-2 text-[11px] uppercase tracking-wider">
            Voice Lang:
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-white border border-cyan-300 rounded-xl px-2 py-1 text-xs font-semibold text-cyan-900 focus:outline-none cursor-pointer"
          >
            <option value="ta-IN">தமிழ் (Tamil - India)</option>
            <option value="en-US">English (US / Global)</option>
            <option value="hi-IN">हिन्दी (Hindi - India)</option>
          </select>
        </div>
      </div>

      {/* Quick Test Presets (Especially Tamil-First!) */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500 mr-1" />
          {language === 'ta' ? 'விரைவு சோதனை முன்னமைவுகள் (Quick Test Presets)' : 'Quick Test Presets (Click to Load)'}:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputSymptom(preset.text);
                analyzeSymptoms(preset.text);
              }}
              className={`p-3 rounded-2xl text-left border text-xs font-medium transition flex items-center justify-between ${
                preset.isEmergency
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900 hover:bg-rose-100 hover:border-rose-400'
                  : 'bg-cyan-50/60 border-cyan-100 text-cyan-950 hover:bg-cyan-100 hover:border-cyan-300'
              }`}
            >
              <span>{preset.label}</span>
              {preset.isEmergency && (
                <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Emergency Rule
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Voice & Text Input Box */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {language === 'ta' ? 'உங்கள் அறிகுறிகளை விவரிக்கவும் (குரல் / உரை)' : 'Describe Symptoms (Voice or Text)'}:
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={inputSymptom}
            onChange={(e) => setInputSymptom(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'எ.கா: எனக்கு 2 நாட்களாக கடுமையான நெஞ்சு வலி, மூச்சுத்திணறல் உள்ளது...'
                : 'e.g. Sudden severe chest tightness radiating to arm, or 3 days fever...'
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
          />

          {/* Voice Input Mic Button */}
          <button
            onClick={handleVoiceInput}
            className={`absolute right-3 bottom-3 p-2.5 rounded-xl border transition shadow-sm flex items-center space-x-1.5 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse border-red-600'
                : 'bg-white hover:bg-cyan-50 text-cyan-600 border-cyan-200'
            }`}
            title="Click to speak using Web Speech API"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-xs font-semibold">
              {isListening
                ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...')
                : (language === 'ta' ? 'பேசுக' : 'Speak')}
            </span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => analyzeSymptoms(inputSymptom)}
            disabled={!inputSymptom.trim() || isAnalyzing}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span>Analyzing rules...</span>
            ) : (
              <>
                <span>{language === 'ta' ? 'டிரையாஜ் பகுப்பாய்வு செய்க' : 'Analyze & Route'}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screener Result Box */}
      {screenerResult && (
        <div
          className={`rounded-3xl p-5 sm:p-6 border transition animate-fadeIn ${
            screenerResult.type === 'EMERGENCY'
              ? 'bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border-red-300 shadow-lg shadow-red-500/10'
              : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-white border-cyan-200 shadow-md'
          }`}
        >
          {screenerResult.type === 'EMERGENCY' ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-600 text-white rounded-2xl shadow animate-bounce">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
                      {screenerResult.severity}
                    </span>
                    <h4 className="text-lg font-black text-red-950">
                      {t.emergencyAlertTitle}
                    </h4>
                  </div>
                </div>
                <span className="font-mono text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold">
                  {screenerResult.alertId}
                </span>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-red-200 text-sm text-red-900 leading-relaxed font-medium">
                {screenerResult.summary}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-red-700 font-semibold">
                  ⚠️ Routine queue bypassed. On-duty clinician & resuscitation bay notified.
                </p>
                <button
                  onClick={() => setCurrentRole('doctor')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  View Staff Emergency Queue →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-cyan-600 text-white rounded-2xl shadow">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-wide block">
                      Triage Level: {screenerResult.severity}
                    </span>
                    <h4 className="text-base font-extrabold text-[#002855]">
                      Suggested Routing: {screenerResult.suggestedDept}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-cyan-100 text-xs text-slate-700 leading-relaxed font-medium">
                {screenerResult.summary}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-800">{selectedPatient?.name}</strong>
                </span>
                <button
                  onClick={handleBookSuggested}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold px-5 py-2.5 rounded-xl shadow transition text-xs"
                >
                  <span>Book Slot & Issue Token ({screenerResult.suggestedDept})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scope and Clinical Disclaimer */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start space-x-2 leading-relaxed">
        <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700">Important Scope Note:</strong> {t.disclaimer}
        </p>
      </div>
    </div>
  );
};
