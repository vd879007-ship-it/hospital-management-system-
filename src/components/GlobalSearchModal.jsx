import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Search,
  X,
  User,
  Calendar,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const GlobalSearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    patients,
    appointments,
    prescriptions,
    inventory,
    setSelectedPatientId,
    setCurrentRole,
    addAuditLog,
  } = useHospital();

  const [query, setQuery] = useState('');

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  // Filtered Results
  const matchedPatients = q
    ? patients.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameTa && p.nameTa.includes(q)) ||
        p.patientId.toLowerCase().includes(q) ||
        p.mobile.includes(q)
      )
    : [];

  const matchedAppointments = q
    ? appointments.filter(a =>
        a.tokenNumber.toLowerCase().includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.appointmentId.toLowerCase().includes(q)
      )
    : [];

  const matchedPrescriptions = q
    ? prescriptions.filter(p =>
        p.prescriptionId.toLowerCase().includes(q) ||
        p.patientName.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.items.some(i => i.name.toLowerCase().includes(q))
      )
    : [];

  const matchedMedicines = q
    ? inventory.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.generic && m.generic.toLowerCase().includes(q)) ||
        m.batchNo.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchedPatients.length > 0 ||
    matchedAppointments.length > 0 ||
    matchedPrescriptions.length > 0 ||
    matchedMedicines.length > 0;

  const handleSelectPatient = (p) => {
    setSelectedPatientId(p.id);
    setCurrentRole('patient');
    setIsSearchOpen(false);
    addAuditLog('SEARCH_ACCESS', 'patients', p.patientId, `User opened patient record via Global Search: ${p.name}`);
  };

  const handleSelectAppointment = (apt) => {
    setSelectedPatientId(apt.patientId);
    setCurrentRole('reception');
    setIsSearchOpen(false);
  };

  const handleSelectPrescription = (rx) => {
    setSelectedPatientId(rx.patientId);
    setCurrentRole('pharmacist');
    setIsSearchOpen(false);
  };

  const handleSelectMedicine = () => {
    setCurrentRole('pharmacist');
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#001c38] text-white rounded-3xl border border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-cyan-800/60 flex items-center space-x-3 shrink-0">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, tokens, prescriptions, medicines (or press Esc to close)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {!q ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto opacity-70" />
              <p className="font-semibold text-slate-300">Fast Global Hospital Search</p>
              <p className="text-[11px] text-cyan-200/70 max-w-sm mx-auto">
                Type a patient name, phone number, token number (TK-101), prescription ID (RX-2026-901), or medicine name (Augmentin, Dolo).
              </p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No hospital records found matching <strong className="text-white">"{query}"</strong>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Category 1: Patients */}
              {matchedPatients.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2 block flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    Patients ({matchedPatients.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedPatients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className="p-3 bg-[#002447] hover:bg-[#00315c] border border-cyan-800/60 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center space-x-3">
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-cyan-400" />
                          <div>
                            <span className="font-bold text-white group-hover:text-cyan-300 transition">
                              {p.name} {p.nameTa && `(${p.nameTa})`}
                            </span>
                            <span className="text-[11px] text-cyan-400/80 block font-mono">
                              {p.patientId} • Blood: {p.bloodType} • {p.mobile}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Appointments / Tokens */}
              {matchedAppointments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2 block flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Appointments & Tokens ({matchedAppointments.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedAppointments.map(a => (
                      <div
                        key={a.id}
                        onClick={() => handleSelectAppointment(a)}
                        className="p-3 bg-[#002447] hover:bg-[#00315c] border border-cyan-800/60 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <span className="font-mono font-bold text-cyan-300 mr-2">{a.tokenNumber}</span>
                          <span className="font-bold text-white group-hover:text-cyan-300 transition">{a.patientName}</span>
                          <span className="text-[11px] text-slate-300 block">
                            {a.deptName} • {a.doctorName} • Slot: {a.slotTime}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                          {a.tokenStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Prescriptions */}
              {matchedPrescriptions.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2 block flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Prescriptions ({matchedPrescriptions.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedPrescriptions.map(rx => (
                      <div
                        key={rx.id}
                        onClick={() => handleSelectPrescription(rx)}
                        className="p-3 bg-[#002447] hover:bg-[#00315c] border border-cyan-800/60 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <span className="font-mono font-bold text-cyan-300 mr-2">{rx.prescriptionId}</span>
                          <span className="font-bold text-white">{rx.patientName}</span>
                          <span className="text-[11px] text-slate-300 block">
                            Diagnosis: {rx.diagnosis} ({rx.items.length} meds)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          {rx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 4: Pharmacy Inventory */}
              {matchedMedicines.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2 block flex items-center">
                    <Pill className="w-3.5 h-3.5 mr-1" />
                    Medicines Formulary ({matchedMedicines.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedMedicines.map(m => (
                      <div
                        key={m.id}
                        onClick={handleSelectMedicine}
                        className="p-3 bg-[#002447] hover:bg-[#00315c] border border-cyan-800/60 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <span className="font-bold text-white group-hover:text-cyan-300 transition">{m.name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Batch: {m.batchNo} • Stock: {m.currentStock} {m.unit}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.currentStock <= m.reorderLevel ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#00162c] border-t border-cyan-900/60 text-[11px] text-cyan-200/60 flex items-center justify-between px-5 shrink-0">
          <span className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            Role-Based Access: Searches only permitted authorized records
          </span>
          <span className="font-mono">HSMS v2.0</span>
        </div>
      </div>
    </div>
  );
};
