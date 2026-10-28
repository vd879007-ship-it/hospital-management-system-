import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  parseHospitalImportData,
  SAMPLE_PATIENTS_JSON,
  SAMPLE_PATIENTS_CSV
} from '../lib/dataImporter';
import {
  Upload,
  FileText,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Download,
  CloudUpload,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DataImportModal = () => {
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    importHospitalData,
    deleteDefaultData,
    isFirebaseSyncing,
    language,
    t
  } = useHospital();

  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [parseError, setParseError] = useState('');
  const [clearExisting, setClearExisting] = useState(true);
  const [syncToFirebase, setSyncToFirebase] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isImportModalOpen) return null;

  // Handle Text Parsing
  const handleParse = (text) => {
    setInputText(text);
    setParseError('');
    setSuccessMessage('');
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }
    try {
      const result = parseHospitalImportData(text);
      setParsedPreview(result);
    } catch (err) {
      setParseError(err.message);
      setParsedPreview(null);
    }
  };

  // Handle File Upload (.json or .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');
    setSuccessMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleParse(content);
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (!parsedPreview) return;
    setIsProcessing(true);
    setSuccessMessage('');
    setParseError('');

    try {
      const result = await importHospitalData(parsedPreview, {
        clearExisting,
        syncToFirebase
      });

      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

      let msg = isTamil
        ? `✅ ${result.patientsCount} நோயாளிகள் வெற்றிகரமாக இறக்குமதி செய்யப்பட்டு சேமிக்கப்பட்டனர்!`
        : `✅ Successfully imported and saved ${result.patientsCount} patient records!`;

      if (syncToFirebase) {
        if (result.firebaseResult?.success) {
          msg += isTamil
            ? ` Firebase Firestore-ல் வெற்றிகரமாக பதிவேற்றப்பட்டது.`
            : ` Stored directly in Firebase Firestore.`;
        } else if (result.firebaseResult?.error) {
          msg += ` (Firebase notice: ${result.firebaseResult.error})`;
        }
      }

      setSuccessMessage(msg);

      // Auto close after 2.5 seconds
      setTimeout(() => {
        setIsImportModalOpen(false);
      }, 2500);
    } catch (err) {
      setParseError(err.message || 'Error occurred while saving data.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Complete Wipe of Default Data
  const handleDeleteAll = async () => {
    const confirmText = isTamil
      ? 'அனைத்து மாதிரி மற்றும் ஏற்கனவே உள்ள தரவுகளையும் நிச்சயமாக நீக்க விரும்புகிறீர்களா?'
      : 'Are you sure you want to delete all default and existing data? This will clear all records.';

    if (window.confirm(confirmText)) {
      setIsProcessing(true);
      await deleteDefaultData();
      setIsProcessing(false);
      setParsedPreview(null);
      setInputText('');
      setSuccessMessage(
        isTamil
          ? '🗑️ அனைத்து இயல்புநிலை மாதிரித் தரவுகளும் நீக்கப்பட்டுவிட்டன. கணினி முற்றிலும் புதிய நிலைக்கு மாற்றப்பட்டது.'
          : '🗑️ All default demo data has been completely deleted. System is now 100% clean.'
      );
    }
  };

  // Download Sample Templates
  const downloadTemplate = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center p-2 text-white">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {isTamil ? 'மருத்துவமனை தரவு இறக்குமதி & Firebase சேமிப்பு' : 'Import Hospital Data & Sync to Firebase'}
              </h3>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {isTamil
                  ? 'JSON / CSV கோப்பை பதிவேற்றி Firebase Firestore-ல் நேரடியாக சேமிக்கவும்'
                  : 'Upload or paste JSON/CSV to save patient records to Firebase Firestore'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Quick Action: Download Sample Templates */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-xs font-bold text-slate-700">
              {isTamil ? 'மாதிரி வடிவமைப்பு பதிவிறக்கம்:' : 'Sample Templates:'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => downloadTemplate(SAMPLE_PATIENTS_JSON, 'patients_sample.json', 'application/json')}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON Template</span>
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate(SAMPLE_PATIENTS_CSV, 'patients_sample.csv', 'text/csv')}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Template</span>
              </button>
            </div>
          </div>

          {/* Tabs: Paste JSON vs Upload File */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 -mb-px cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {isTamil ? 'JSON / CSV ஒட்டுக' : 'Paste JSON / CSV'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 -mb-px cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {isTamil ? 'கோப்பைப் பதிவேற்றுக' : 'Upload File (.json / .csv)'}
            </button>
          </div>

          {/* Tab 1: Textarea */}
          {activeTab === 'paste' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {isTamil ? 'உங்கள் நோயாளிகள் தரவை இங்கே ஒட்டவும்:' : 'Paste your JSON or CSV patient records:'}
              </label>
              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => handleParse(e.target.value)}
                placeholder={isTamil ? 'இங்கே JSON அல்லது CSV தரவை ஒட்டவும்...' : 'Paste JSON array [ { "name": "...", "age": 30, ... } ] or CSV rows here...'}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          {/* Tab 2: File Upload */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 text-center bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".json,.csv,text/csv,application/json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {fileName || (isTamil ? 'கோப்பை இங்கே இழுத்துப் போடவும் அல்லது தேர்ந்தெடுக்கவும்' : 'Drag & drop JSON/CSV file or click to browse')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isTamil ? 'ஆதரிக்கப்படும் வடிவங்கள்: .json, .csv' : 'Supported formats: .json, .csv'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parse Preview Card */}
          {parsedPreview && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">
                    {isTamil ? 'கண்டறியப்பட்ட பதிவுகள்:' : 'Detected Records Ready for Import:'}
                  </span>
                </div>
                <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                  {parsedPreview.summary.patientsCount} {isTamil ? 'நோயாளிகள்' : 'Patients'}
                </span>
              </div>

              {/* Sample patient preview */}
              {parsedPreview.data?.patients?.length > 0 && (
                <div className="text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                  <p className="font-semibold text-slate-900">
                    {isTamil ? 'முதல் நோயாளி மாதிரி:' : 'First Record Preview:'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] text-slate-600">
                    <span><strong>Name:</strong> {parsedPreview.data.patients[0].name}</span>
                    <span><strong>Age/Sex:</strong> {parsedPreview.data.patients[0].age}y / {parsedPreview.data.patients[0].gender}</span>
                    <span><strong>Blood:</strong> {parsedPreview.data.patients[0].bloodType}</span>
                    <span><strong>Mobile:</strong> {parsedPreview.data.patients[0].mobile}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Settings & Flags */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>
                {isTamil
                  ? 'பழைய மாதிரித் தரவுகளை முழுமையாக நீக்கிவிட்டு புதிய தரவை மட்டும் சேமி'
                  : 'Wipe all old default/demo data and replace with imported records (Recommended)'}
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={syncToFirebase}
                onChange={(e) => setSyncToFirebase(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="flex items-center space-x-1">
                <span>{isTamil ? 'Firebase Firestore-ல் நேரடியாக சேமித்து வைக்கவும்' : 'Store directly into Firebase Firestore'}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">Cloud</span>
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Delete All Data Button */}
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition border border-rose-200 cursor-pointer disabled:opacity-50"
            title={isTamil ? 'அனைத்து மாதிரித் தரவுகளையும் நீக்கு' : 'Delete all mock/seed records'}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isTamil ? 'இயல்புநிலை மாதிரித் தரவை நீக்குக' : 'Delete All Default Data'}</span>
          </button>

          {/* Primary Action Buttons */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200 cursor-pointer"
            >
              {t('close')}
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!parsedPreview || isProcessing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-md active:scale-95 ${
                parsedPreview && !isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isTamil ? 'Firebase-ல் சேமிக்கிறது...' : 'Storing in Firebase...'}</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>{isTamil ? 'சேமித்து Firebase-ல் பதிவேற்றுக' : 'Save & Store in Firebase'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
