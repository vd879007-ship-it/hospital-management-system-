import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { parseOfflineQRPayload, generateOfflineQRPayload } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Search,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  WifiOff,
  AlertCircle,
  Phone,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QRScannerModal = () => {
  const {
    isQRScannerOpen,
    setIsQRScannerOpen,
    patients,
    setSelectedPatientId,
    setCurrentRole,
    addAuditLog,
    language,
    t
  } = useHospital();

  const [searchCode, setSearchCode] = useState('');
  const [scannedPatient, setScannedPatient] = useState(null);
  const [rawQRInput, setRawQRInput] = useState('');
  const [offlineDecoded, setOfflineDecoded] = useState(null);

  if (!isQRScannerOpen) return null;

  const isTamil = language === 'ta';

  const handleSelectPatient = (patient) => {
    setScannedPatient(patient);
    setSelectedPatientId(patient.id);
    const parsed = parseOfflineQRPayload(patient.qrPayload || generateOfflineQRPayload(patient));
    setOfflineDecoded(parsed.data);
    addAuditLog('QR_SCAN_ACCESS', 'patients', patient.patientId, `Scanned offline QR Digital Health ID for ${patient.name}`);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleScanRaw = (e) => {
    e.preventDefault();
    if (!rawQRInput.trim()) return;

    const parsed = parseOfflineQRPayload(rawQRInput);
    if (parsed.isValid) {
      setOfflineDecoded(parsed.data);
      const matched = patients.find(p => p.patientId === parsed.data.pid);
      if (matched) {
        setScannedPatient(matched);
        setSelectedPatientId(matched.id);
      }
      confetti({ particleCount: 50, spread: 60 });
    } else {
      alert(`Invalid QR Payload: ${parsed.error}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchCode.trim().toLowerCase();
    const found = patients.find(p => 
      p.patientId.toLowerCase().includes(query) || 
      p.name.toLowerCase().includes(query) ||
      (p.nameTa && p.nameTa.toLowerCase().includes(query))
    );
    if (found) {
      handleSelectPatient(found);
    } else {
      alert(isTamil ? 'நோயாளி பதிவேட்டில் கிடைக்கவில்லை.' : 'Patient not found in registry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t('offlineDigitalPassport')}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('offlineScannerDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsQRScannerOpen(false);
              setScannedPatient(null);
              setOfflineDecoded(null);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Badge */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span className="font-semibold">{t('offlineZeroNetBadge')}</span>
            <span>{t('offlineZeroNetDesc')}</span>
          </div>
          <span className="badge-highlight text-[10px]">{t('zeroBytesTransmitted')}</span>
        </div>

        {/* Search / Select Demo Patient to Simulate Scan */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-700 uppercase block">
            {t('simulateScanLabel')}
          </span>
          <div className="flex flex-wrap gap-2">
            {patients.slice(0, 5).map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPatient(p)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-semibold transition"
              >
                {(isTamil && p.nameTa) ? p.nameTa.split(' ')[0] : p.name.split(' ')[0]} ({p.patientId})
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 text-xs">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder={t('searchPatientPlaceholder')}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 transition"
            />
            <button type="submit" className="btn-primary text-xs py-2 px-4 shadow-xs">
              <Search className="w-4 h-4" />
              <span>{t('lookup')}</span>
            </button>
          </form>
        </div>

        {/* Decoded Offline Results */}
        {offlineDecoded && (
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 shadow-inner space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-blue-700">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm uppercase">
                  {t('verifiedOfflinePassport')}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700">
                {offlineDecoded.pid}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('patientLabel')}</span>
                <span className="text-base font-bold text-slate-900">
                  {(isTamil && offlineDecoded.nameTa) ? offlineDecoded.nameTa : offlineDecoded.name}
                </span>
                {isTamil && offlineDecoded.nameTa && (
                  <span className="text-xs text-blue-600 font-medium block">{offlineDecoded.name}</span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('bloodGroup')}</span>
                <span className="text-2xl font-bold text-blue-700">{offlineDecoded.blood}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">
                ⚠️ {t('allergies')}:
              </span>
              <p className="font-semibold text-rose-900">
                {Array.isArray(offlineDecoded.allergies) && offlineDecoded.allergies.length > 0
                  ? offlineDecoded.allergies.join(', ')
                  : t('noAllergies')}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                🚨 {t('emergencyContact')}:
              </span>
              <p className="font-semibold text-slate-900">
                {offlineDecoded.emg?.name} ({offlineDecoded.emg?.rel}) —{' '}
                <span className="text-blue-700">{offlineDecoded.emg?.phone}</span>
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsQRScannerOpen(false);
                  setCurrentRole('doctor');
                }}
                className="btn-primary text-xs py-2 px-4 shadow-xs"
              >
                <span>{t('openDoctorConsultation')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
