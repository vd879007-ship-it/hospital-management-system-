import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Send,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  X,
  Sparkles,
  ShieldAlert,
  Headphones,
  Sliders,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TamilAudioPrescriptionModal = ({
  isOpen,
  onClose,
  patient,
  doctor,
  prescriptionItems = [],
  notes = '',
  diagnosis = ''
}) => {
  const { language, t } = useHospital();
  const isTamil = language === 'ta';

  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.85); // 0.85x is clearer for elderly patients
  const [dispatchChannel, setDispatchChannel] = useState('whatsapp'); // 'whatsapp' | 'ivr' | 'sms'
  const [phoneNumber, setPhoneNumber] = useState(patient?.phone || '+91 98401 23456');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Generate script dynamically from prescription based on active language
  const generateVoiceScript = () => {
    const patientName = isTamil ? (patient?.nameTa || patient?.name || 'நோயாளி') : (patient?.name || 'Patient');
    const doctorName = isTamil ? (doctor?.nameTa || doctor?.name || 'மருத்துவர்') : (doctor?.name || 'Doctor');
    
    if (isTamil) {
      let script = `வணக்கம் ${patientName} அவர்களே. உங்கள் மருத்துவர் ${doctorName} உங்களுக்கு வழங்கிய மருந்து வழிகாட்டுதல் இதோ. `;
      if (diagnosis) {
        script += `உங்கள் பரிசோதனை முடிவு: ${diagnosis}. `;
      }
      if (prescriptionItems && prescriptionItems.length > 0) {
        script += `நீங்கள் உட்கொள்ள வேண்டிய மருந்துகள்: `;
        prescriptionItems.forEach((item, index) => {
          let freqTa = '';
          if (item.frequency.includes('1-0-1')) freqTa = 'காலை 1 மாத்திரை மற்றும் இரவு 1 மாத்திரை சாப்பாட்டிற்கு பிறகு';
          else if (item.frequency.includes('1-1-1')) freqTa = 'காலை 1, மதியம் 1, இரவு 1 மாத்திரை சாப்பாட்டிற்கு பிறகு';
          else if (item.frequency.includes('1-0-0')) freqTa = 'காலை மட்டும் 1 மாத்திரை சாப்பாட்டிற்கு முன்';
          else if (item.frequency.includes('0-0-1')) freqTa = 'இரவு தூங்கும் முன் 1 மாத்திரை மட்டும்';
          else if (item.frequency.includes('SOS')) freqTa = 'காய்ச்சல் அல்லது வலி அதிகமாக இருக்கும் போது மட்டும்';
          else freqTa = `${item.frequency}`;

          script += `${index + 1}) ${item.name} (${item.strength}), ${freqTa}, ${item.duration} நாட்களுக்கு உட்கொள்ளவும். `;
        });
      }
      script += `முக்கிய அறிவுரை: தினமும் தேவையான அளவு வெந்நீர் அருந்தவும், நல்ல ஓய்வு எடுக்கவும். ஏதேனும் ஒவ்வாமை அல்லது அசதி ஏற்பட்டால் உடனே மருத்துவமனைக்கு வரவும். நன்றி!`;
      return script;
    } else {
      let script = `Hello ${patientName}. Here is your prescription instruction from ${doctorName}. `;
      if (diagnosis) {
        script += `Diagnosis: ${diagnosis}. `;
      }
      if (prescriptionItems && prescriptionItems.length > 0) {
        script += `Prescribed medicines: `;
        prescriptionItems.forEach((item, index) => {
          let freqEn = 'after meals';
          if (item.frequency.includes('1-0-1')) freqEn = 'one tablet morning and night after food';
          else if (item.frequency.includes('1-1-1')) freqEn = 'one tablet morning, afternoon, and night after food';
          else if (item.frequency.includes('1-0-0')) freqEn = 'one tablet in morning before breakfast';
          else if (item.frequency.includes('0-0-1')) freqEn = 'one tablet at night before bed';
          else if (item.frequency.includes('SOS')) freqEn = 'take only when necessary for pain or fever';

          script += `${index + 1}) ${item.name} (${item.strength}), ${freqEn}, for ${item.duration}. `;
        });
      }
      script += `Important advice: Drink sufficient warm water and take complete rest. If any allergy occurs, visit the hospital immediately. Thank you.`;
      return script;
    }
  };

  const scriptText = generateVoiceScript();

  // Web Speech API
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setSentSuccess(false);
    }
  }, [isOpen]);

  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert(isTamil ? 'உங்கள் உலாவியில் Speech Synthesis வசதி ஆதரிக்கப்படவில்லை.' : 'Speech Synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

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
      } else if (indianVoice) {
        utterance.voice = indianVoice;
      } else {
        utterance.lang = 'ta-IN';
      }
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  const handleSendDispatch = (e) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      confetti({ particleCount: 50, spread: 60 });
    }, 1200);
  };

  const openWhatsAppDirect = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(
      `🏥 *Hospital Smart Management System (HSMS)*\n\n` +
      `${isTamil ? 'வணக்கம்' : 'Hello'} ${patient?.name || ''},\n\n` +
      `🩺 *${isTamil ? 'மருத்துவர்' : 'Doctor'}:* ${doctor?.name || 'Dr. Arun Kumar'}\n` +
      `📋 *${isTamil ? 'மருந்து குறிப்பு (Prescription)' : 'Prescription'}:*\n` +
      scriptText + `\n\n` +
      `🔊 Voice Note: https://hsms-care.hospital/audio-rx/${patient?.patientId || '123'}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-cyan-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002447] via-[#003366] to-[#001f3d] p-5 text-white flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-bold bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                  {isTamil ? 'குரல்வழி Rx' : 'Voice Audio Rx'}
                </span>
                <span className="text-xs text-slate-300">
                  {t('patientLabel')}: <strong>{(isTamil && patient?.nameTa) ? patient?.nameTa : patient?.name}</strong> ({patient?.patientId})
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {isTamil ? 'தமிழில் குரல் வழி மருந்து குறிப்பு (Voice Prescription)' : 'Voice Prescription Audio Guidance'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Audio Player Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#001e3d] rounded-2xl p-5 text-white border border-cyan-900 shadow-inner space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{isTamil ? 'தெளிவான குரல் வழி விளக்கம் (Audio Synthesizer)' : 'Text-to-Speech Audio Synthesizer'}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {isPlaying ? (isTamil ? '▶️ ஒலிக்கிறது...' : '▶️ Playing...') : (isTamil ? '⏸️ தயார்' : '⏸️ Ready')}
              </span>
            </div>

            {/* Audio Waveform Animation */}
            <div className="h-12 bg-slate-950/60 rounded-xl p-3 flex items-center justify-center space-x-1.5 border border-cyan-900/50">
              {[40, 65, 30, 85, 95, 45, 70, 90, 50, 75, 100, 60, 35, 80, 55, 90, 40, 70].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-cyan-500 to-sky-300 animate-pulse'
                      : 'bg-cyan-950 h-2'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(10, (h * (i % 2 === 0 ? 0.9 : 1.2)) % 40)}px` : '6px'
                  }}
                />
              ))}
            </div>

            {/* Audio Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md active:scale-95 ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>{isTamil ? 'நிறுத்து' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{isTamil ? 'தமிழில் கேளுங்கள்' : 'Play Audio'}</span>
                    </>
                  )}
                </button>

                {isPlaying && (
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                    title="Stop"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Speed Controller */}
              <div className="flex items-center space-x-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-900/60">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">{t('voiceSpeed')}:</span>
                {[0.75, 0.85, 1.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setSpeechRate(rate);
                      if (isPlaying) {
                        window.speechSynthesis?.cancel();
                        setIsPlaying(false);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                      speechRate === rate
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transcript Card */}
          <div className="bg-cyan-50/60 rounded-2xl p-4 border border-cyan-200 space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-800 block">
              📝 {t('prescriptionTranscript')}:
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-cyan-100 shadow-xs">
              "{scriptText}"
            </p>
          </div>

          {/* WhatsApp / SMS Dispatch Simulation Section */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  📲 {isTamil ? 'நோயாளிக்கு வாய்ஸ் நோட் அனுப்பு (Automated Dispatch)' : 'Dispatch Audio Note to Patient Mobile'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isTamil ? 'நோயாளிக்கு WhatsApp அல்லது தொலைபேசி அழைப்பு வழியாக அனுப்பவும்' : "Sends direct voice recording to patient's WhatsApp or automated phone IVR call"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendDispatch} className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDispatchChannel('whatsapp')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 font-semibold transition ${
                    dispatchChannel === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchChannel('ivr')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 font-semibold transition ${
                    dispatchChannel === 'ivr'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>IVR Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchChannel('sms')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 font-semibold transition ${
                    dispatchChannel === 'sms'
                      ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>SMS Voice Link</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn-primary text-xs py-2 px-4 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? (isTamil ? 'அனுப்பப்படுகிறது...' : 'Dispatching...') : (isTamil ? 'அனுப்புக' : 'Send Audio')}</span>
                </button>
                {dispatchChannel === 'whatsapp' && (
                  <button
                    type="button"
                    onClick={openWhatsAppDirect}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                  >
                    <span>WhatsApp Web</span>
                  </button>
                )}
              </div>

              {sentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isTamil
                      ? `குரல் வழி மருந்து குறிப்பு ${phoneNumber} எண்ணிற்கு வெற்றிகரமாக அனுப்பப்பட்டது!`
                      : `Voice prescription audio dispatched successfully to ${phoneNumber}!`}
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
