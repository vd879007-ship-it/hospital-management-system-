import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  testFirebaseConnection,
  isFirebaseConfigured
} from '../services/firebaseService';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Database,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FirebaseConfigModal = () => {
  const {
    isFirebaseModalOpen,
    setIsFirebaseModalOpen,
    syncAllDataToFirebase,
    pullAllDataFromFirebase,
    wipeAllFirebaseData,
    isFirebaseSyncing,
    language,
    t
  } = useHospital();

  const isTamil = language === 'ta';

  const [config, setConfig] = useState(() => getActiveFirebaseConfig());
  const [pasteJson, setPasteJson] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isFirebaseModalOpen) return null;

  // Handle parsing pasted Firebase config object (e.g. const firebaseConfig = { ... })
  const handlePasteConfig = (raw) => {
    setPasteJson(raw);
    try {
      // Clean string if it starts with "const firebaseConfig ="
      let clean = raw.trim();
      if (clean.includes('{') && clean.includes('}')) {
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        clean = clean.substring(start, end + 1);
        // Replace unquoted keys
        const jsonFormatted = clean
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/'/g, '"');
        const parsed = JSON.parse(jsonFormatted);
        if (parsed.apiKey && parsed.projectId) {
          setConfig(prev => ({ ...prev, ...parsed }));
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        }
      }
    } catch (err) {
      // Ignore intermediate syntax error while typing
    }
  };

  // Test Firebase Firestore Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Save config first
      saveCustomFirebaseConfig(config);
      const res = await testFirebaseConnection();
      setTestResult(res);
      if (res.connected) {
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      setTestResult({ connected: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Config
  const handleSave = () => {
    saveCustomFirebaseConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsFirebaseModalOpen(false);
    }, 1200);
  };

  // Reset to Environment Defaults
  const handleReset = () => {
    if (window.confirm('Reset Firebase configuration to environment defaults?')) {
      clearCustomFirebaseConfig();
      setConfig(getActiveFirebaseConfig());
      setTestResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center p-2 text-white">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {isTamil ? 'Firebase Firestore கட்டமைப்பு' : 'Firebase Firestore Configuration'}
              </h3>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                {isTamil ? 'உங்கள் சொந்த Firebase திட்டத்துடன் இணைத்து தரவைச் சேமிக்கவும்' : 'Connect your own Firebase project for cloud persistence'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFirebaseModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Status Alert */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 border ${
                testResult.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Detailed Security Rules Fix Box if Permission Denied */}
          {testResult && testResult.permissionDenied && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2.5">
              <div className="flex items-center space-x-2 font-bold text-amber-950">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Firestore Security Rules Fix (1-Minute Step):</span>
              </div>
              <p className="leading-relaxed">
                Google Cloud Firestore is rejecting connections because the default rules are set to <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold">allow read, write: if false;</code>. Change it to allow read and write:
              </p>
              <div className="bg-white p-3 rounded-xl border border-amber-200 font-mono text-[11px] text-slate-800">
                <pre className="overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </div>
              <a
                href={`https://console.firebase.google.com/project/${config.projectId || 'hospital-management-syst-374ae'}/firestore/rules`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <span>Open Firebase Console Rules Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configuration saved successfully!</span>
            </div>
          )}

          {/* Quick Paste Box */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              {isTamil ? 'Firebase Config-ஐ நேரடியாக இங்கே ஒட்டலாம்:' : 'Quick Paste (from Firebase Console):'}
            </label>
            <textarea
              rows={2}
              value={pasteJson}
              onChange={(e) => handlePasteConfig(e.target.value)}
              placeholder="Paste firebaseConfig object: { apiKey: '...', projectId: '...' }"
              className="w-full p-2.5 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Project ID *</label>
              <input
                type="text"
                value={config.projectId || ''}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="my-hospital-firebase-project"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-0.5">API Key *</label>
              <input
                type="text"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Auth Domain</label>
                <input
                  type="text"
                  value={config.authDomain || ''}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  placeholder="project-id.firebaseapp.com"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Storage Bucket</label>
                <input
                  type="text"
                  value={config.storageBucket || ''}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  placeholder="project-id.appspot.com"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sync Actions Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              {isTamil ? 'நேரடி மேகக்கணி ஒத்திசைவு செயல்கள்:' : 'Cloud Sync Actions:'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={syncAllDataToFirebase}
                disabled={isFirebaseSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>{isTamil ? 'உள்ளூர் தரவை Firebase-க்கு அனுப்புக' : 'Push Local Data to Firebase'}</span>
              </button>

              <button
                type="button"
                onClick={pullAllDataFromFirebase}
                disabled={isFirebaseSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>{isTamil ? 'Firebase-ல் இருந்து தரவை பெறுக' : 'Pull Data from Firebase'}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(isTamil ? 'Firebase-ல் உள்ள அனைத்து தரவையும் நிச்சயமாக அழிக்க விரும்புகிறீர்களா?' : 'Are you sure you want to clear all data in Firebase Firestore?')) {
                    const res = await wipeAllFirebaseData();
                    if (res?.success) {
                      alert(isTamil ? 'Firebase தரவு வெற்றிகரமாக அழிக்கப்பட்டது.' : 'Firebase data cleared successfully.');
                    }
                  }
                }}
                disabled={isFirebaseSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isTamil ? 'Firebase தரவை அழிக்க' : 'Clear All Firebase Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
          >
            {isTamil ? 'இயல்புநிலைக்கு மீட்டமை' : 'Reset Config'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTamil ? 'இணைப்பைச் சோதிக்க' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              {isTamil ? 'சேமிக்கவும்' : 'Save Config'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
