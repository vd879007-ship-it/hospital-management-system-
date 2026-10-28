import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { ROLES, ROLE_DETAILS } from '../../config/roles';
import {
  User,
  ClipboardList,
  HeartPulse,
  Stethoscope,
  Activity,
  Pill,
  BarChart3,
  CheckCircle,
  Bed
} from 'lucide-react';

const ROLE_ICONS = {
  patient: User,
  reception: ClipboardList,
  receptionist: ClipboardList,
  triage_staff: HeartPulse,
  doctor: Stethoscope,
  nurse: Activity,
  pharmacist: Pill,
  admin: BarChart3,
  beds: Bed
};

export const RoleSwitcher = ({ compact = false }) => {
  const { currentRole, setCurrentRole, users, language, t } = useHospital();

  const isTamil = language === 'ta';

  const demoAccounts = [
    { role: 'patient', label: isTamil ? 'நோயாளி' : 'Patient', sub: 'Thirunavukkarasu M.' },
    { role: 'reception', label: isTamil ? 'வரவேற்பு' : 'Reception', sub: 'Deepa Krishnan' },
    { role: 'triage_staff', label: isTamil ? 'டிரையாஜ்' : 'Triage Staff', sub: 'Sister Mary Joseph' },
    { role: 'doctor', label: isTamil ? 'மருத்துவர்' : 'Doctor', sub: 'Dr. Carlo Toledano' },
    { role: 'nurse', label: isTamil ? 'செவிலியர்' : 'Nurse', sub: 'Nurse Geetha R.' },
    { role: 'pharmacist', label: isTamil ? 'மருந்தாளர்' : 'Pharmacist', sub: 'R. Anand, B.Pharm' },
    { role: 'admin', label: isTamil ? 'நிர்வாகி' : 'Admin', sub: 'Dr. R. Natarajan' },
    { role: 'beds', label: isTamil ? 'படுக்கைகள் & ICU' : 'Beds & ICU', sub: '32 Bed Live Map' },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1 sm:gap-1.5 w-full">
        {demoAccounts.map(account => {
          const Icon = ROLE_ICONS[account.role] || User;
          const isActive = currentRole === account.role || (account.role === 'reception' && currentRole === 'receptionist');
          return (
            <button
              key={account.role}
              type="button"
              onClick={() => setCurrentRole(account.role)}
              className={`min-w-0 flex items-center justify-center space-x-1 sm:space-x-1.5 px-1 sm:px-2 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition text-center cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 font-bold ring-1 ring-blue-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/70'
              }`}
              title={`${account.label} (${account.sub})`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{account.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('roleSwitcherTitle')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('roleSwitcherSubtitle')}
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
          {t('activeRole')}: {currentRole.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {demoAccounts.map(account => {
          const Icon = ROLE_ICONS[account.role] || User;
          const isActive = currentRole === account.role || (account.role === 'reception' && currentRole === 'receptionist');
          return (
            <button
              key={account.role}
              onClick={() => setCurrentRole(account.role)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition text-center ${
                isActive
                  ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-xs font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl mb-1.5 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold leading-tight">{account.label}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-full block mt-0.5">{account.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
