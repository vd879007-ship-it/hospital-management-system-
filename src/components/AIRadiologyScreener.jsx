import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  BrainCircuit,
  Scan,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Upload,
  Sparkles,
  X,
  Eye,
  ShieldAlert,
  ArrowRight,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIRadiologyScreener = ({
  isOpen,
  onClose,
  onAttachReport,
  patientName = 'Patient'
}) => {
  const { language } = useHospital();
  const isTamil = language === 'ta';

  const [selectedCaseId, setSelectedCaseId] = useState('pneumonia');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Pre-configured clinical scan test cases for instant demo
  const sampleCases = [
    {
      id: 'pneumonia',
      title: 'Chest X-Ray (PA View): Acute Pneumonia',
      titleTa: 'மார்பு எக்ஸ்-ரே: நிமோனியா நுரையீரல் தொற்று',
      category: 'Radiology / X-Ray',
      date: 'Today, 10:15 AM',
      finding: 'Right Lower Lobe Alveolar Consolidation with visible Air Bronchograms',
      severity: 'High (Immediate Clinician Attention)',
      severityColor: 'bg-rose-100 text-rose-800 border-rose-300',
      confidence: 94.8,
      anomalyBox: { top: '55%', left: '52%', width: '34%', height: '32%' },
      heatColor: 'rgba(239, 68, 68, 0.45)',
      description:
        'Dense parenchymal infiltrates noted in the right lower pulmonary zone with silhouette sign. Costophrenic sulcus demonstrates mild blunting suspicious for parapneumonic effusion.',
      actionRecommendation:
        '1. Initiate IV Ceftriaxone 1g BD + Azithromycin 500mg.\n2. Serial SpO2 monitoring (maintain > 94%).\n3. Sputum Gram stain and culture workup.',
      previewType: 'xray_pneumonia'
    },
    {
      id: 'cardiomegaly',
      title: 'Chest X-Ray (PA View): Cardiomegaly & LV Strain',
      titleTa: 'மார்பு எக்ஸ்-ரே: இதய வீக்கம் மற்றும் அழுத்த நோய்',
      category: 'Radiology / X-Ray',
      date: 'Today, 09:30 AM',
      finding: 'Cardiothoracic Ratio (CTR) elevated at 0.58; Pulmonary venous congestion',
      severity: 'Moderate to High',
      severityColor: 'bg-amber-100 text-amber-800 border-amber-300',
      confidence: 91.2,
      anomalyBox: { top: '48%', left: '32%', width: '42%', height: '38%' },
      heatColor: 'rgba(245, 158, 11, 0.45)',
      description:
        'Global enlargement of cardiac silhouette with prominent apex elongation suggestive of left ventricular hypertrophy. Mild perihilar vascular prominence without overt alveolar edema.',
      actionRecommendation:
        '1. STAT 12-lead ECG & Serum NT-proBNP.\n2. Urgent 2D-Echocardiogram within 24 hours.\n3. Initiate oral Loop Diuretic (Furosemide 20mg).',
      previewType: 'xray_cardio'
    },
    {
      id: 'normal_xray',
      title: 'Chest X-Ray: Normal Clear Lung Fields',
      titleTa: 'மார்பு எக்ஸ்-ரே: இயல்பான நுரையீரல் பரிசோதனை',
      category: 'Radiology / X-Ray',
      date: 'Yesterday, 04:00 PM',
      finding: 'No focal consolidation, pneumothorax, or pleural effusion observed',
      severity: 'Normal (Clear)',
      severityColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      confidence: 98.4,
      anomalyBox: null,
      heatColor: 'transparent',
      description:
        'Both lung fields are clear and symmetrically aerated. Mediastinal contours, aortic knob, and hilum within normal physiological limits. Costophrenic angles sharp and free.',
      actionRecommendation:
        'No emergency radiological intervention required. Routine outpatient symptomatic care sufficient.',
      previewType: 'xray_normal'
    },
    {
      id: 'dengue_platelets',
      title: 'Hematology CBC: Critical Thrombocytopenia',
      titleTa: 'ரத்தப் பரிசோதனை: ஆபத்தான டெங்கு பிளேட்லெட் சரிவு',
      category: 'Lab Diagnostics / CBC',
      date: 'Today, 11:10 AM',
      finding: 'Platelet Count: 22,000 / μL (Normal: 150,000 - 450,000) • Critically Low',
      severity: 'STAT Critical (Severe Bleeding Risk)',
      severityColor: 'bg-red-600 text-white border-red-700 animate-pulse',
      confidence: 96.5,
      anomalyBox: null,
      description:
        'Profound thrombocytopenia consistent with Grade III Dengue Hemorrhagic Syndrome. Concomitant Hematocrit is 48.5% indicating plasma extravasation and active hemoconcentration.',
      actionRecommendation:
        '1. Immediate ICU bed allocation.\n2. Crossmatch and reserve 4 units Random Donor Platelets (RDP).\n3. Strict Bed rest & avoid IM injections / NSAIDs.\n4. IV Isotonic Saline titration per Dengue fluid protocol.',
      previewType: 'lab_dengue'
    }
  ];

  const currentCase = sampleCases.find(c => c.id === selectedCaseId) || sampleCases[0];

  const triggerRescan = (caseId) => {
    setSelectedCaseId(caseId);
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          confetti({ particleCount: 30, spread: 50 });
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleAttachToConsultation = () => {
    const summary = `[AI Pre-Screen: ${currentCase.title}] Findings: ${currentCase.finding} (Confidence: ${currentCase.confidence}%). Clinician Directive: ${currentCase.actionRecommendation.replace(/\n/g, ' ')}`;
    if (onAttachReport) {
      onAttachReport(summary);
    }
    alert(`AI Radiology & Lab Report findings attached to doctor's clinical notes!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-cyan-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#001f3d] p-5 text-white flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-2xl text-white shadow-lg shadow-cyan-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-bold bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                  AI Diagnostic Vision Engine
                </span>
                <span className="text-xs text-slate-300">
                  Patient: <strong>{patientName}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {isTamil ? 'செயற்கை நுண்ணறிவு எக்ஸ்-ரே & லேப் ஸ்கிரீனிங்' : 'AI Radiology & Diagnostic Pre-Screener'}
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

        {/* Scrollable Main Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Clinical Test Selection Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isTamil ? 'மாதிரி பரிசோதனை தேர்வு:' : 'Select Sample Diagnostic Scan to Test:'}</span>
              <span className="text-[11px] font-normal text-cyan-700 font-sans">
                {isTamil ? 'டீப் லேர்னிங் பகுப்பாய்வை இயக்க ஏதேனும் ஒரு ஸ்கேனை கிளிக் செய்க' : 'Click any scan to run deep-learning tensor analysis'}
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {sampleCases.map(item => (
                <button
                  key={item.id}
                  onClick={() => triggerRescan(item.id)}
                  className={`p-3 rounded-2xl text-left border transition text-xs flex flex-col justify-between ${
                    selectedCaseId === item.id
                      ? 'bg-[#002447] text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      selectedCaseId === item.id ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.category.split('/')[0]}
                    </span>
                    <h5 className="font-bold text-xs mt-1.5 line-clamp-1">{item.title.split(':')[1]}</h5>
                  </div>
                  <span className={`text-[10px] mt-2 font-mono ${selectedCaseId === item.id ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                    AI Confidence: {item.confidence}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Viewer & AI Anomaly Heatmap */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Visualizer Column (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner overflow-hidden min-h-[300px] flex items-center justify-center">
                {/* Simulated Medical Scan Graphic */}
                {currentCase.previewType.startsWith('xray') ? (
                  <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                    {/* Simulated Ribs & Lung Silhouette */}
                    <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-56 border-4 border-slate-400 rounded-full blur-[1px] transform scale-x-125" />
                      <div className="absolute w-24 h-40 border-2 border-slate-500 rounded-full blur-[2px]" />
                      <div className="absolute h-full w-2 bg-slate-600 blur-[1px]" />
                    </div>

                    {/* Pathology Patch */}
                    {currentCase.id === 'pneumonia' && (
                      <div className="absolute bottom-10 right-6 w-24 h-20 bg-white/60 blur-md rounded-full animate-pulse" />
                    )}
                    {currentCase.id === 'cardiomegaly' && (
                      <div className="absolute bottom-12 left-10 w-32 h-28 bg-white/50 blur-lg rounded-full" />
                    )}

                    {/* AI Bounding Box & Heatmap Overlay */}
                    {showHeatmap && currentCase.anomalyBox && (
                      <div
                        className="absolute border-2 border-dashed border-rose-500 rounded-xl transition-all duration-300 pointer-events-none"
                        style={{
                          top: currentCase.anomalyBox.top,
                          left: currentCase.anomalyBox.left,
                          width: currentCase.anomalyBox.width,
                          height: currentCase.anomalyBox.height,
                          backgroundColor: currentCase.heatColor
                        }}
                      >
                        <span className="absolute -top-5 left-1 text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                          ANOMALY DETECTED ({currentCase.confidence}%)
                        </span>
                      </div>
                    )}

                    {/* Scanning Radar Sweep Line */}
                    {isScanning && (
                      <div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_15px_#22d3ee] z-20"
                        style={{
                          top: `${scanProgress}%`,
                          transition: 'top 0.2s linear'
                        }}
                      />
                    )}

                    <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-800">
                      PA-CHEST • {currentCase.previewType}
                    </div>
                  </div>
                ) : (
                  /* Lab CBC Graphic */
                  <div className="w-full bg-slate-900 rounded-xl p-4 border border-slate-700 text-xs font-mono space-y-2 text-slate-200">
                    <div className="text-cyan-400 font-bold border-b border-slate-700 pb-1.5 flex justify-between">
                      <span>COMPLETE BLOOD COUNT (CBC)</span>
                      <span>STAT LAB</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hemoglobin:</span>
                        <span className="font-bold">14.2 g/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total WBC:</span>
                        <span className="font-bold">4,100 / μL</span>
                      </div>
                      <div className="flex justify-between bg-red-950/70 p-1.5 rounded border border-red-800 text-red-200">
                        <span className="font-bold text-red-400">⚠️ Platelets:</span>
                        <span className="font-black text-red-300">22,000 / μL (CRITICAL LOW)</span>
                      </div>
                      <div className="flex justify-between bg-amber-950/50 p-1.5 rounded border border-amber-800 text-amber-200">
                        <span className="font-bold text-amber-400">Hematocrit (PCV):</span>
                        <span className="font-bold text-amber-300">48.5% (Elevated)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Heatmap */}
              {currentCase.anomalyBox && (
                <div className="flex items-center justify-between px-2 text-xs">
                  <span className="text-slate-600 font-medium">Show AI Pathology Bounding Box</span>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      showHeatmap ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {showHeatmap ? 'Hide Box' : 'Show Box'}
                  </button>
                </div>
              )}
            </div>

            {/* AI Clinical Diagnostic Report Breakdown (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentCase.severityColor}`}>
                      {currentCase.severity}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5">
                      {currentCase.finding}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black font-mono text-cyan-600">
                      {currentCase.confidence}%
                    </span>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      Model Confidence
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {currentCase.description}
                </p>

                {/* Clinical Recommendations */}
                <div className="bg-cyan-50/70 p-3.5 rounded-xl border border-cyan-200 space-y-1.5 text-xs">
                  <span className="font-bold text-cyan-900 uppercase tracking-wide block text-[11px] flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 mr-1" />
                    Recommended Clinical Action Protocol:
                  </span>
                  <pre className="font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {currentCase.actionRecommendation}
                  </pre>
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  * Clinical Disclaimer: AI pre-screener assists triage routing. Final diagnosis rests solely with the attending clinician.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {isTamil ? 'மூடு' : 'Close'}
                </button>

                <button
                  type="button"
                  onClick={handleAttachToConsultation}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isTamil ? 'பரிசோதனை முடிவுகளை இணைக்கவும்' : 'Attach AI Findings to Doctor Consultation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
