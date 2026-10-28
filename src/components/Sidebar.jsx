import React from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  User,
  ClipboardList,
  HeartPulse,
  Stethoscope,
  Activity,
  Pill,
  BarChart3,
  Bed,
  ShieldCheck,
  ChevronRight,
  CreditCard
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRole, setCurrentRole, setIsAadhaarModalOpen, language, t } = useHospital();

  const navItems = [
    { role: 'patient', label: t('rolePatient'), sub: t('rolePatientSub'), icon: User },
    { role: 'reception', label: t('roleReception'), sub: t('roleReceptionSub'), icon: ClipboardList },
    { role: 'triage_staff', label: t('roleTriage'), sub: t('roleTriageSub'), icon: HeartPulse },
    { role: 'doctor', label: t('roleDoctor'), sub: t('roleDoctorSub'), icon: Stethoscope },
    { role: 'nurse', label: t('roleNurse'), sub: t('roleNurseSub'), icon: Activity },
    { role: 'beds', label: t('roleBeds'), sub: t('roleBedsSub'), icon: Bed },
    { role: 'pharmacist', label: t('rolePharmacy'), sub: t('rolePharmacySub'), icon: Pill },
    { role: 'admin', label: t('roleAdmin'), sub: t('roleAdminSub'), icon: BarChart3 },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-4 shrink-0">
      <div className="px-2 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          {t('roleNavHeader')}
        </span>
        <h3 className="text-sm font-bold text-blue-600">
          {t('activeRole')}: {currentRole.toUpperCase()}
        </h3>
      </div>

      <nav className="space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRole === item.role || (item.role === 'reception' && currentRole === 'receptionist');

          return (
            <button
              key={item.role}
              onClick={() => setCurrentRole(item.role)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold block leading-tight truncate">{item.label}</span>
                  <span className={`text-[10px] block truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.sub}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100 px-2 space-y-3">
        {/* Universal Aadhaar Record Vault Launcher */}
        <button
          onClick={() => setIsAadhaarModalOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 transition group text-left"
          title={language === 'ta' ? '12-இலக்க ஆதார் எண் மூலம் மருத்துவ பதிவுகளைத் தேடுங்கள்' : 'Search any hospital record via 12-digit Aadhaar UID'}
        >
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-1.5 bg-white/20 rounded-xl text-blue-100 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block leading-tight truncate">{t('aadhaarSidebarBtn')}</span>
              <span className="text-[10px] text-blue-100/90 block truncate">{t('crossHospitalEhr')}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
          <span className="font-bold text-blue-700 block uppercase text-[10px]">
            {t('rbacModelTitle')}
          </span>
          <p className="text-slate-500">
            {t('rbacModelDesc')}
          </p>
        </div>
      </div>
    </aside>
  );
};
