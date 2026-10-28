import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { RoleSwitcher } from '../features/auth/RoleSwitcher';
import {
  Activity,
  QrCode,
  AlertTriangle,
  RotateCcw,
  Globe,
  Bell,
  ShieldAlert,
  Search,
  Sparkles,
  Bed,
  CheckCircle2,
  CreditCard,
  CloudUpload,
  Flame
} from 'lucide-react';

export const Navbar = () => {
  const {
    currentRole,
    setCurrentRole,
    language,
    setLanguage,
    t,
    setIsQRScannerOpen,
    setIsAadhaarModalOpen,
    setIsEmergencyModalOpen,
    setIsImportModalOpen,
    setIsFirebaseModalOpen,
    firebaseStatus,
    activeEmergencyAlerts,
    resetDemoData
  } = useHospital();

  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Active Code Red Emergency Ticker Banner */}
      {activeEmergencyAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white px-4 sm:px-6 py-2.5 text-xs shadow-inner border-b border-rose-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Left: Emergency Status & Patient Clinical Warning */}
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              {/* Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-white text-rose-700 px-2.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider shrink-0 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>{t('codeRedStat')}</span>
              </div>

              {/* Patient info & Warning signs */}
              <div className="flex items-baseline space-x-2 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight shrink-0">
                  {activeEmergencyAlerts[0].patientName}
                </span>
                <span className="text-rose-200 text-xs hidden sm:inline shrink-0">—</span>
                <span className="text-rose-100 font-medium text-xs truncate">
                  {activeEmergencyAlerts[0].warningSigns}
                </span>
              </div>
            </div>

            {/* Right: Action Required Button */}
            <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-rose-950/70 hover:bg-rose-950 border border-rose-300/40 text-white px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition shadow-xs cursor-pointer active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{t('immediateActionRequired')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2">
        {/* Row 1: Brand Logo & Top Utility Controls (EN/தமிழ், Aadhaar, Scan QR, Reset) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0 select-none"
            onClick={() => setCurrentRole('patient')}
            title={language === 'ta' ? 'மருத்துவமனை ஸ்மார்ட் மேலாண்மை அமைப்பு' : 'Hospital Smart Management System'}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 flex items-center justify-center p-2 text-white shadow-md shadow-blue-500/20 shrink-0 transition hover:scale-105">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-600 leading-none">
                  HSMS
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
                <span className="text-xs sm:text-base font-bold text-slate-900 leading-tight">
                  {language === 'ta' ? 'மருத்துவமனை ஸ்மார்ட் மேலாண்மை அமைப்பு' : 'Hospital Smart Management System'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 leading-none">
                {language === 'ta' ? 'MediTechTitans குழுமம் • ' : 'by Team MediTechTitans • '}
                <span className="text-blue-600 font-semibold">{t('brandSubtitle')}</span>
              </p>
            </div>
          </div>

          {/* Right Controls: Language Switcher, Aadhaar Lookup, Scan QR, Reset Demo */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start md:justify-end">
            {/* Language Switcher */}
            <div className="inline-flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  language === 'en' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Full English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  language === 'ta' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="முழுமையான தமிழில் பார்க்க"
              >
                தமிழ்
              </button>
            </div>

            {/* Universal Aadhaar Record Vault Button */}
            <button
              type="button"
              onClick={() => setIsAadhaarModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95 shrink-0"
              title={language === 'ta' ? 'அனைத்து மருத்துவமனை பதிவுகளையும் ஆதாரில் தேடலாம்' : 'Universal Aadhaar Health Record Lookup across all hospitals'}
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-100 shrink-0" />
              <span>{t('aadhaarLookupBtn')}</span>
            </button>

            {/* Offline QR Scanner Button */}
            <button
              type="button"
              onClick={() => setIsQRScannerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-semibold transition border border-slate-200 cursor-pointer active:scale-95 shrink-0"
              title={language === 'ta' ? 'ஆஃப்லைன் நோயாளி QR பாஸ்போர்ட் ஸ்கேன் செய்க' : 'Scan Offline Patient QR Passport'}
            >
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{t('scanQrBtn')}</span>
            </button>

            {/* Data Importer & Firebase Storer Button */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95 shrink-0"
              title={language === 'ta' ? 'புதிய மருத்துவமனை தரவை பதிவேற்றி Firebase-ல் சேமிக்கவும்' : 'Import hospital records and store in Firebase'}
            >
              <CloudUpload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100 shrink-0" />
              <span>{t('importDataBtn')}</span>
            </button>

            {/* Firebase Cloud Connection Status Pill */}
            <button
              type="button"
              onClick={() => setIsFirebaseModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
              title={language === 'ta' ? 'Firebase Firestore இணைப்பு கட்டமைப்பு' : 'Firebase Firestore connection settings'}
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-amber-500 shrink-0" />
              <span className="hidden sm:inline">Firebase</span>
              <span className={`w-2 h-2 rounded-full ${firebaseStatus.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(language === 'ta' ? 'அனைத்து மாதிரி மற்றும் ஏற்கனவே உள்ள தரவுகளையும் நிச்சயமாக நீக்கவா?' : 'Delete all demo and existing records from system?')) {
                  resetDemoData();
                  alert(language === 'ta' ? 'அனைத்து தரவுகளும் நீக்கப்பட்டுவிட்டன.' : 'All default and existing records deleted.');
                }
              }}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition shrink-0 cursor-pointer"
              title={language === 'ta' ? 'அனைத்து மாதிரித் தரவுகளையும் நீக்கு' : 'Delete all demo data'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: All 8 Roles displayed with ZERO horizontal swipe on any device */}
        <div className="pt-1.5 border-t border-slate-100">
          <RoleSwitcher compact={true} />
        </div>
      </div>
    </header>
  );
};
