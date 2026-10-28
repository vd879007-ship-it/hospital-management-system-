import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QRScannerModal } from './components/QRScannerModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AadhaarUniversalLookupModal } from './components/AadhaarUniversalLookupModal';
import { DataImportModal } from './components/DataImportModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { UploadLabReportModal } from './components/UploadLabReportModal';
import { AddStaffModal } from './components/AddStaffModal';
import { AddMedicineModal } from './components/AddMedicineModal';
import { RouteGuard } from './features/auth/RouteGuard';

// Modular Feature Portals
import { PatientPortal } from './features/patient/PatientPortal';
import { ReceptionPortal } from './features/reception/ReceptionPortal';
import { TriagePortal } from './features/triage/TriagePortal';
import { DoctorPortal } from './features/doctor/DoctorPortal';
import { NursePortal } from './features/nurse/NursePortal';
import { BedWardTracker } from './features/beds/BedWardTracker';
import { PharmacyPortal } from './features/pharmacy/PharmacyPortal';
import { AdminPortal } from './features/admin/AdminPortal';

import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HeartPulse
} from 'lucide-react';

const MainContent = () => {
  const { currentRole, language, t } = useHospital();

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between">
      <div>
        {/* Visible Disclaimer Banner (Prompt Requirement) */}
        <DisclaimerBanner />

        {/* Global Brand Navbar with Role Switcher & Code Red Alert */}
        <Navbar />

        {/* Tablet-First Layout: Sidebar + Dynamic Role View */}
        <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full">
          <Sidebar />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {currentRole === 'patient' && (
              <RouteGuard allowedRoles={['patient']}>
                <PatientPortal />
              </RouteGuard>
            )}

            {(currentRole === 'reception' || currentRole === 'receptionist') && (
              <RouteGuard allowedRoles={['reception', 'receptionist', 'admin']}>
                <ReceptionPortal />
              </RouteGuard>
            )}

            {currentRole === 'triage_staff' && (
              <RouteGuard allowedRoles={['triage_staff', 'doctor', 'admin']}>
                <TriagePortal />
              </RouteGuard>
            )}

            {currentRole === 'doctor' && (
              <RouteGuard allowedRoles={['doctor']}>
                <DoctorPortal />
              </RouteGuard>
            )}

            {currentRole === 'nurse' && (
              <RouteGuard allowedRoles={['nurse', 'doctor']}>
                <NursePortal />
              </RouteGuard>
            )}

            {currentRole === 'beds' && (
              <RouteGuard allowedRoles={['nurse', 'doctor', 'reception', 'receptionist', 'admin', 'beds']}>
                <BedWardTracker />
              </RouteGuard>
            )}

            {currentRole === 'pharmacist' && (
              <RouteGuard allowedRoles={['pharmacist', 'admin']}>
                <PharmacyPortal />
              </RouteGuard>
            )}

            {currentRole === 'admin' && (
              <RouteGuard allowedRoles={['admin']}>
                <AdminPortal />
              </RouteGuard>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">
                {language === 'ta' ? 'மருத்துவமனை ஸ்மார்ட் மேலாண்மை அமைப்பு (HSMS) — MediTechTitans குழுமம்' : 'Hospital Smart Management System (HSMS) — Team MediTechTitans'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
              <span>{t('quickPillsRbac')}</span>
              <span>•</span>
              <span>{t('quickPillsQr')}</span>
              <span>•</span>
              <span>{t('quickPillsVoice')}</span>
              <span>•</span>
              <span>{t('quickPillsBeds')}</span>
              <span>•</span>
              <span>{t('quickPillsAbdm')}</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-3 border-t border-slate-800">
            {t('demoDisclaimer')}
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <QRScannerModal />
      <EmergencyModal />
      <AadhaarUniversalLookupModal />
      <DataImportModal />
      <FirebaseConfigModal />
      <UploadLabReportModal />
      <AddStaffModal />
      <AddMedicineModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <HospitalProvider>
        <MainContent />
      </HospitalProvider>
    </ErrorBoundary>
  );
}
