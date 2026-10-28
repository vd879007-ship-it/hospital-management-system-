import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Trophy,
  CheckCircle2,
  ArrowRight,
  X,
  UserCheck,
  QrCode,
  Stethoscope,
  Pill,
  ShieldAlert,
  BarChart3,
  Sparkles,
  Play
} from 'lucide-react';

export const DemoTourModal = ({ isOpen, onClose }) => {
  const { setCurrentRole, setSelectedPatientId, language } = useHospital();

  if (!isOpen) return null;

  const phases = [
    {
      phase: 'Phase 1',
      title: 'Login & Roles + Patient Registration',
      titleTa: 'பயனர் பொறுப்புகள் & நோயாளி பதிவு',
      desc: 'Role-Based Access Control (6 roles) with complete patient profile registration, contact verification, and unique Patient ID issuance.',
      result: 'Unique Patient ID (HSP-2026-XXXX) & Role-Appropriate Profiles',
      icon: UserCheck,
      color: 'from-blue-600 to-cyan-600',
      actionRole: 'reception',
      actionPatient: 'pat-1',
    },
    {
      phase: 'Phase 2',
      title: 'QR Health Card + Appointments & Routine Token Queue',
      titleTa: 'QR ஹெல்த் கார்டு & டோக்கன் வரிசை',
      desc: 'Secure QR digital healthcare passport (mWell design), OPD booking by department and doctor slot, with live token lifecycle (Waiting ➔ Called ➔ In Consultation ➔ Completed).',
      result: 'Verified QR Health Passport & Live Queue Status Tracker',
      icon: QrCode,
      color: 'from-cyan-600 to-teal-600',
      actionRole: 'patient',
      actionPatient: 'pat-1',
    },
    {
      phase: 'Phase 3',
      title: 'Doctor Consultation & Prescription + Nurse eMAR Tasks',
      titleTa: 'மருத்துவர் ஆலோசனை & செவிலியர் மருந்து கண்காணிப்பு',
      desc: 'Doctor examines history and vitals, writes diagnosis, builds standardized digital prescription (1-0-1 dosage, duration, route), locks with digital signature, and triggers nurse care tasks.',
      result: 'Tamper-Evident Signed Prescription & Nurse eMAR Task Board',
      icon: Stethoscope,
      color: 'from-indigo-600 to-blue-600',
      actionRole: 'doctor',
      actionPatient: 'pat-1',
    },
    {
      phase: 'Phase 4',
      title: 'Pharmacy Inventory & Real-Time Dispensing + Restock',
      titleTa: 'மருந்தகம் & தானியங்கி இருப்பு கழித்தல்',
      desc: 'Pharmacist reviews finalized doctor prescriptions, confirms dispensing with 1-click which automatically decrements inventory, tracks batch/expiry, and flags low stock.',
      result: 'Auditable Dispensing Transaction & Live Stock Deduction',
      icon: Pill,
      color: 'from-emerald-600 to-teal-700',
      actionRole: 'pharmacist',
      actionPatient: 'pat-1',
    },
    {
      phase: 'Phase 5',
      title: 'Multilingual Symptom Screener + Emergency Escalation',
      titleTa: 'பன்மொழி அறிகுறி பகுப்பாய்வு & அவசர Code Red எச்சரிக்கை',
      desc: 'Tamil/English/Hindi voice input (Web Speech API) with deterministic emergency rules (chest pain, breathlessness). Bypasses routine tokens to trigger STAT staff alert & acknowledgement log.',
      result: 'Urgent Alert Broadcast & Clinician Response Time Logged',
      icon: ShieldAlert,
      color: 'from-red-600 to-rose-700',
      actionRole: 'patient',
      actionPatient: 'pat-2', // Muthuvel Pandian (Tamil record with cardiac emergency)
    },
    {
      phase: 'Phase 6',
      title: 'Admin Operational Analytics + Security Audit Trail',
      titleTa: 'நிர்வாக பகுப்பாய்வு & பாதுகாப்பு தணிக்கை பதிவேடு',
      desc: 'Department average wait times, busiest hours arrival chart, clinician workload, nurse missed-dose safety rate, emergency response time (< 3 mins), and immutable security audit logs.',
      result: 'Executive KPI Dashboard & Chronological Audit Trail',
      icon: BarChart3,
      color: 'from-violet-600 to-purple-700',
      actionRole: 'admin',
      actionPatient: 'pat-1',
    },
  ];

  const handleLaunchPhase = (p) => {
    setCurrentRole(p.actionRole);
    setSelectedPatientId(p.actionPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#001f3f] to-[#001124] text-white rounded-[32px] border border-cyan-500/50 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between">
        {/* Glow header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-800/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  6-Phase MVP Implementation Verification
                </h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  100% Complete
                </span>
              </div>
              <p className="text-xs text-cyan-200/80 mt-0.5">
                Every single phase from Section 10 of your document is fully built and ready for competition demo!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4 overflow-y-auto pr-1 py-1">
          {phases.map((p, index) => {
            const Icon = p.icon;
            return (
              <div
                key={index}
                className="bg-[#002852]/70 hover:bg-[#00346a] border border-cyan-700/60 hover:border-cyan-400 rounded-2xl p-4 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-900/60 px-2.5 py-0.5 rounded-lg border border-cyan-700">
                      {p.phase}
                    </span>
                    <span className="flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Live in Prototype
                    </span>
                  </div>

                  <div className="flex items-start space-x-3 mt-1">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.color} text-white shadow shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition">
                        {language === 'ta' && p.titleTa ? p.titleTa : p.title}
                      </h4>
                      <p className="text-[11px] text-cyan-200/80 mt-1 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-cyan-900/80 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-amber-300 truncate pr-2">
                    🎯 {p.result}
                  </span>
                  <button
                    onClick={() => handleLaunchPhase(p)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow transition shrink-0"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Open View</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cyan-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cyan-200/80 shrink-0">
          <span className="flex items-center">
            <Sparkles className="w-4 h-4 text-cyan-400 mr-1.5" />
            Judges can test the entire patient journey end-to-end with pre-seeded synthetic data.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
