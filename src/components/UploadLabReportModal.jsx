import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  FlaskConical,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Calendar,
  User,
  Image as ImageIcon,
  Sparkles,
  CloudUpload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UploadLabReportModal = () => {
  const {
    isUploadReportModalOpen,
    setIsUploadReportModalOpen,
    selectedPatient,
    uploadLabReport,
    selectedDoctorId,
    doctors,
    language
  } = useHospital();

  const isTamil = language === 'ta';
  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const [testName, setTestName] = useState('Chest X-Ray PA View');
  const [category, setCategory] = useState('Diagnostic Radiology');
  const [findings, setFindings] = useState('Bilateral clear lung fields, normal cardiothoracic ratio. No focal consolidation or pleural effusion.');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isUploadReportModalOpen || !selectedPatient || !selectedPatient.id) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName.trim()) {
      alert('Please enter a test/investigation name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadLabReport({
        patientId: selectedPatient.id,
        testName,
        category,
        findings,
        fileName: fileName || `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileData: filePreview,
        doctorName: currentDoctor?.name || 'Dr. Carlo Toledano',
        date: reportDate
      });

      confetti({ particleCount: 60, spread: 60 });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsUploadReportModalOpen(false);
        setFileName('');
        setFilePreview(null);
      }, 1500);
    } catch (err) {
      alert('Error uploading lab report: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2 text-white">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isTamil ? 'மருத்துவ ஸ்கேன் & அறிக்கை பதிவேற்றம்' : 'Upload Diagnostic Scan & Lab Report'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {isTamil ? 'நோயாளி:' : 'Patient:'} {selectedPatient.name} ({selectedPatient.patientId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadReportModalOpen(false)}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {success && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isTamil
                  ? 'பரிசோதனை அறிக்கை வெற்றிகரமாக Firebase-ல் பதிவேற்றப்பட்டது!'
                  : 'Diagnostic report successfully uploaded and stored in Firebase Firestore!'}
              </span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isTamil ? 'பரிசோதனை / ஸ்கேன் பெயர் *' : 'Test / Investigation Name *'}
            </label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Chest X-Ray PA, Complete Blood Count, Brain MRI, ECG"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'பிரிவு' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Diagnostic Radiology">Radiology & X-Ray</option>
                <option value="Pathology & Hematology">Pathology & Blood</option>
                <option value="Cardiology Diagnostics">Cardiology (ECG/Echo)</option>
                <option value="Biochemistry">Biochemistry (Sugar/Lipid)</option>
                <option value="Microbiology">Microbiology & Culture</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'தேதி' : 'Investigation Date'}
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isTamil ? 'மருத்துவக் கண்டுபிடிப்புகள் & குறிப்பு' : 'Clinical Findings & Radiologist Impression *'}
            </label>
            <textarea
              rows={3}
              required
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Detailed findings and observations..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isTamil ? 'கோப்பு / ஸ்கேன் படம் இணைக்கவும் (விரும்பினால்)' : 'Attach Scan / Report Document (Optional)'}
            </label>
            <div className="border border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50 hover:bg-white transition text-center relative cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="font-semibold truncate">
                  {fileName || (isTamil ? 'படத்தை தேர்ந்தெடுக்க கிளிக் செய்யவும்' : 'Click to select scan image or PDF')}
                </span>
              </div>
            </div>

            {/* Thumbnail Preview if Image */}
            {filePreview && (
              <div className="mt-2 p-2 bg-slate-100 rounded-xl max-w-xs mx-auto text-center">
                <img
                  src={filePreview}
                  alt="Scan Preview"
                  className="max-h-36 rounded-lg mx-auto object-contain border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsUploadReportModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (isTamil ? 'பதிவேற்றுகிறது...' : 'Uploading...')
                  : (isTamil ? 'Firebase-ல் பதிவேற்றி சேமிக்க' : 'Upload & Store in Firebase')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
