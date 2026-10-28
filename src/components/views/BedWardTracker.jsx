import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Bed,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  UserPlus,
  LogOut,
  RefreshCw,
  Search,
  Check,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BedWardTracker = () => {
  const { language, patients } = useHospital();

  // Initial rich bed state representing a functioning hospital floor
  const [beds, setBeds] = useState([
    // ICU Wards (8 beds)
    { id: 'ICU-01', ward: 'ICU', number: 1, status: 'occupied', patientName: 'Murugan Sundaram', patientId: 'HSP-2026-0002', diagnosis: 'Severe NSTEMI / Cardiac Monitoring', oxygen: '91%', ventilator: true, admittedAt: 'Yesterday, 11:20 PM', doctor: 'Dr. Arun Kumar' },
    { id: 'ICU-02', ward: 'ICU', number: 2, status: 'occupied', patientName: 'Sathish Kumar', patientId: 'HSP-2026-0004', diagnosis: 'Acute Respiratory Distress', oxygen: '88%', ventilator: true, admittedAt: 'Today, 02:15 AM', doctor: 'Dr. Meenakshi Sundaram' },
    { id: 'ICU-03', ward: 'ICU', number: 3, status: 'sanitizing', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: true, admittedAt: null, doctor: null, cleanMinsLeft: 8 },
    { id: 'ICU-04', ward: 'ICU', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: true, admittedAt: null, doctor: null },
    { id: 'ICU-05', ward: 'ICU', number: 5, status: 'occupied', patientName: 'Selvi Rajendran', patientId: 'HSP-2026-0006', diagnosis: 'Post-CABG Recovery', oxygen: '96%', ventilator: false, admittedAt: '2 days ago', doctor: 'Dr. Arun Kumar' },
    { id: 'ICU-06', ward: 'ICU', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'ICU-07', ward: 'ICU', number: 7, status: 'reserved', patientName: 'Incoming ER Patient', patientId: 'ER-TRANSFER', diagnosis: 'Multiple Trauma', oxygen: '94%', ventilator: true, admittedAt: 'In Transit', doctor: 'Dr. K. Senthil' },
    { id: 'ICU-08', ward: 'ICU', number: 8, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: true, admittedAt: null, doctor: null },

    // Emergency Trauma Bays (6 beds)
    { id: 'ER-01', ward: 'Emergency Trauma', number: 1, status: 'occupied', patientName: 'Karthik Raja', patientId: 'HSP-2026-0007', diagnosis: 'Road Accident / Fracture Left Femur', oxygen: '97%', ventilator: false, admittedAt: 'Today, 08:30 AM', doctor: 'Dr. Meenakshi' },
    { id: 'ER-02', ward: 'Emergency Trauma', number: 2, status: 'occupied', patientName: 'Anand Natarajan', patientId: 'HSP-2026-0008', diagnosis: 'Anaphylaxis / Drug Reaction', oxygen: '93%', ventilator: false, admittedAt: 'Today, 09:15 AM', doctor: 'Dr. Senthil' },
    { id: 'ER-03', ward: 'Emergency Trauma', number: 3, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'ER-04', ward: 'Emergency Trauma', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'ER-05', ward: 'Emergency Trauma', number: 5, status: 'sanitizing', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null, cleanMinsLeft: 4 },
    { id: 'ER-06', ward: 'Emergency Trauma', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },

    // General Medical Ward (12 beds)
    { id: 'GW-01', ward: 'General Ward', number: 1, status: 'occupied', patientName: 'Priya Ramesh', patientId: 'HSP-2026-0001', diagnosis: 'Acute Gastroenteritis & Dehydration', oxygen: '98%', ventilator: false, admittedAt: 'Today, 07:00 AM', doctor: 'Dr. Arun Kumar' },
    { id: 'GW-02', ward: 'General Ward', number: 2, status: 'occupied', patientName: 'Dinesh Balan', patientId: 'HSP-2026-0009', diagnosis: 'Viral Pyrexia / Observation', oxygen: '97%', ventilator: false, admittedAt: 'Yesterday', doctor: 'Dr. Arun Kumar' },
    { id: 'GW-03', ward: 'General Ward', number: 3, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-04', ward: 'General Ward', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-05', ward: 'General Ward', number: 5, status: 'occupied', patientName: 'Muthusamy K', patientId: 'HSP-2026-0010', diagnosis: 'Cellulitis Right Foot', oxygen: '96%', ventilator: false, admittedAt: '3 days ago', doctor: 'Dr. Meenakshi' },
    { id: 'GW-06', ward: 'General Ward', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-07', ward: 'General Ward', number: 7, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-08', ward: 'General Ward', number: 8, status: 'occupied', patientName: 'Shankar Raman', patientId: 'HSP-2026-0011', diagnosis: 'Uncontrolled Type 2 Diabetes', oxygen: '99%', ventilator: false, admittedAt: '1 day ago', doctor: 'Dr. Arun Kumar' },
    { id: 'GW-09', ward: 'General Ward', number: 9, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-10', ward: 'General Ward', number: 10, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-11', ward: 'General Ward', number: 11, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'GW-12', ward: 'General Ward', number: 12, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },

    // Pediatric Ward (6 beds)
    { id: 'PED-01', ward: 'Pediatric Care', number: 1, status: 'occupied', patientName: 'Baby Kaviya', patientId: 'HSP-2026-0003', diagnosis: 'Bronchiolitis / Nebulization Rounds', oxygen: '95%', ventilator: false, admittedAt: 'Today, 06:45 AM', doctor: 'Dr. Meenakshi' },
    { id: 'PED-02', ward: 'Pediatric Care', number: 2, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'PED-03', ward: 'Pediatric Care', number: 3, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'PED-04', ward: 'Pediatric Care', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'PED-05', ward: 'Pediatric Care', number: 5, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
    { id: 'PED-06', ward: 'Pediatric Care', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null }
  ]);

  // Filters
  const [selectedWardFilter, setSelectedWardFilter] = useState('ALL'); // 'ALL' | 'ICU' | 'Emergency Trauma' | 'General Ward' | 'Pediatric Care'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'available' | 'occupied' | 'ventilator'

  // Selected bed modal
  const [activeBedModal, setActiveBedModal] = useState(null);
  const [admissionPatientId, setAdmissionPatientId] = useState(patients[0]?.id || '');
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState('Acute Exacerbation requiring continuous monitoring');

  // Statistics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const sanitizingBeds = beds.filter(b => b.status === 'sanitizing').length;
  const availableIcuBeds = beds.filter(b => b.ward === 'ICU' && b.status === 'available').length;
  const freeVentilators = beds.filter(b => b.ventilator && b.status === 'available').length;
  const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100);

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    if (selectedWardFilter !== 'ALL' && b.ward !== selectedWardFilter) return false;
    if (statusFilter === 'available' && b.status !== 'available') return false;
    if (statusFilter === 'occupied' && b.status !== 'occupied') return false;
    if (statusFilter === 'ventilator' && !b.ventilator) return false;
    return true;
  });

  // Bed Actions
  const handleDischargeBed = (bedId) => {
    setBeds(beds.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'sanitizing',
          patientName: null,
          patientId: null,
          diagnosis: null,
          oxygen: null,
          admittedAt: null,
          cleanMinsLeft: 12
        };
      }
      return b;
    }));
    setActiveBedModal(null);
    alert(`Patient discharged from Bed ${bedId}. Bed automatically assigned to Sanitation & UV Sterilization queue.`);
  };

  const handleMarkSanitized = (bedId) => {
    setBeds(beds.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'available',
          cleanMinsLeft: null
        };
      }
      return b;
    }));
    setActiveBedModal(null);
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleAdmitPatient = (e) => {
    e.preventDefault();
    if (!activeBedModal) return;

    const patient = patients.find(p => p.id === admissionPatientId) || patients[0];

    setBeds(beds.map(b => {
      if (b.id === activeBedModal.id) {
        return {
          ...b,
          status: 'occupied',
          patientName: patient.name,
          patientId: patient.patientId,
          diagnosis: admissionDiagnosis,
          oxygen: '98%',
          admittedAt: 'Just Now',
          doctor: 'Dr. Arun Kumar'
        };
      }
      return b;
    }));

    confetti({ particleCount: 50, spread: 60 });
    alert(`Patient ${patient.name} (${patient.patientId}) successfully allocated to ${activeBedModal.id}!`);
    setActiveBedModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-700 rounded-2xl text-white shadow-md shadow-teal-500/20">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'நேரடி படுக்கை & தீவிர சிகிச்சைப் பிரிவு வரைபடம்' : 'Interactive 2D Live Bed & Ward Tracker'}
              </h2>
              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
                {totalBeds} Total Beds
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time inpatient occupancy, ventilator tracking, emergency bay allocation & automated sanitation turnaround
            </p>
          </div>
        </div>

        {/* Live Status Summary Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{availableBeds} Available</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>{occupiedBeds} Occupied ({occupancyPercentage}%)</span>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-800 flex items-center space-x-1.5">
            <span className="text-sm">🫁</span>
            <span>{freeVentilators} Free Ventilators</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ICU Availability</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-teal-600">{availableIcuBeds}</span>
            <span className="text-xs text-slate-500">of 8 Beds free</span>
          </div>
          <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            High Acuity Units
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Occupancy Rate</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{occupancyPercentage}%</span>
            <span className="text-xs text-slate-500">Ward Utilization</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${occupancyPercentage}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sanitation Queue</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-600">{sanitizingBeds}</span>
            <span className="text-xs text-slate-500">Under UV cleaning</span>
          </div>
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            Est. Turnaround ~8 mins
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Trauma Bays (ER)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-rose-600">
              {beds.filter(b => b.ward === 'Emergency Trauma' && b.status === 'available').length}
            </span>
            <span className="text-xs text-slate-500">of 6 Bays ready</span>
          </div>
          <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            Resuscitation Ready
          </span>
        </div>
      </div>

      {/* Filter and Ward Category Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Ward filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-semibold">
          <span className="text-slate-400 mr-1 shrink-0 font-bold">Ward:</span>
          {['ALL', 'ICU', 'Emergency Trauma', 'General Ward', 'Pediatric Care'].map(ward => (
            <button
              key={ward}
              onClick={() => setSelectedWardFilter(ward)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                selectedWardFilter === ward
                  ? 'bg-[#002447] text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ward === 'ALL' ? 'All Wards (அனைத்து வார்டுகள்)' : ward}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 font-semibold">
          <span className="text-slate-400 mr-1 shrink-0 font-bold">Status:</span>
          {[
            { id: 'ALL', label: 'All Status' },
            { id: 'available', label: '🟢 Available Only' },
            { id: 'occupied', label: '🔴 Occupied Only' },
            { id: 'ventilator', label: '🫁 Ventilator Equipped' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Interactive Hospital Bed Grid */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-white">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
            <h3 className="font-bold text-sm tracking-wide">
              {language === 'ta' ? 'மருத்துவமனை படுக்கை வரைபடம் (Hospital Floor Plan)' : 'Interactive Hospital Floor Bed Grid'}
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Occupied</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Sanitizing</span>
            </span>
          </div>
        </div>

        {/* Grid of Bed Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBeds.map(bed => {
            const isOccupied = bed.status === 'occupied';
            const isAvailable = bed.status === 'available';
            const isSanitizing = bed.status === 'sanitizing';
            const isReserved = bed.status === 'reserved';

            let borderStyle = 'border-slate-800 bg-slate-950/70 hover:border-cyan-500';
            if (isOccupied) borderStyle = 'border-rose-900/60 bg-gradient-to-b from-rose-950/40 to-slate-950 hover:border-rose-500';
            if (isAvailable) borderStyle = 'border-emerald-900/60 bg-gradient-to-b from-emerald-950/40 to-slate-950 hover:border-emerald-400';
            if (isSanitizing) borderStyle = 'border-amber-900/60 bg-gradient-to-b from-amber-950/30 to-slate-950 hover:border-amber-400';
            if (isReserved) borderStyle = 'border-blue-900/60 bg-gradient-to-b from-blue-950/30 to-slate-950 hover:border-blue-400';

            return (
              <div
                key={bed.id}
                onClick={() => setActiveBedModal(bed)}
                className={`p-3.5 rounded-2xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-2.5 text-xs text-white relative group ${borderStyle}`}
              >
                {/* Top: Bed ID & Badges */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm tracking-wide text-white group-hover:text-cyan-300 transition">
                    {bed.id}
                  </span>
                  <div className="flex items-center space-x-1">
                    {bed.ventilator && (
                      <span className="p-1 bg-cyan-950 text-cyan-300 rounded border border-cyan-800 text-[10px]" title="Ventilator Equipped">
                        🫁
                      </span>
                    )}
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : isOccupied
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          : isSanitizing
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-blue-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Middle Details */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                    {bed.ward}
                  </span>
                  {isOccupied ? (
                    <div className="mt-1">
                      <h5 className="font-bold text-white text-xs truncate">{bed.patientName}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{bed.diagnosis}</p>
                      <div className="flex items-center space-x-1.5 mt-1 text-[10px] font-mono text-cyan-300">
                        <span>SpO2: {bed.oxygen}</span>
                      </div>
                    </div>
                  ) : isSanitizing ? (
                    <div className="mt-1 text-amber-300 text-[10px]">
                      <span>UV Sterilizing</span>
                      <span className="block font-mono text-slate-400">{bed.cleanMinsLeft}m remaining</span>
                    </div>
                  ) : isReserved ? (
                    <div className="mt-1 text-blue-300 text-[10px]">
                      <span>Reserved for ER</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Ready for Admission</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Hint */}
                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400 transition">
                  <span>Click to view</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bed Detail / Action Modal */}
      {activeBedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-600 text-white rounded-2xl shadow">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                    {activeBedModal.ward} • {activeBedModal.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Bed Management & Patient Flow
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveBedModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5"
              >
                ✕
              </button>
            </div>

            {/* If Occupied */}
            {activeBedModal.status === 'occupied' && (
              <div className="space-y-4 text-xs">
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-rose-950">{activeBedModal.patientName}</h4>
                      <span className="text-rose-700 font-mono font-bold">{activeBedModal.patientId}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold text-[10px]">
                      Currently Occupied
                    </span>
                  </div>
                  <p className="text-slate-700"><strong>Diagnosis:</strong> {activeBedModal.diagnosis}</p>
                  <p className="text-slate-700"><strong>Attending Doctor:</strong> {activeBedModal.doctor}</p>
                  <p className="text-slate-700"><strong>Admitted:</strong> {activeBedModal.admittedAt}</p>
                  <div className="flex items-center space-x-3 pt-1 text-slate-800">
                    <span>🫁 SpO2: <strong>{activeBedModal.oxygen}</strong></span>
                    <span>Ventilator: <strong>{activeBedModal.ventilator ? 'Active (Connected)' : 'None'}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveBedModal(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDischargeBed(activeBedModal.id)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Discharge / Transfer Bed</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Available */}
            {activeBedModal.status === 'available' && (
              <form onSubmit={handleAdmitPatient} className="space-y-4 text-xs">
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-900">
                  <span className="font-bold block">🟢 Bed is currently vacant and sanitized.</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    You can immediately allocate an outpatient, emergency escalation, or triage patient.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Patient to Admit *
                  </label>
                  <select
                    value={admissionPatientId}
                    onChange={(e) => setAdmissionPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.patientId}) - Blood: {p.bloodType}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admission Clinical Indication *
                  </label>
                  <input
                    type="text"
                    required
                    value={admissionDiagnosis}
                    onChange={(e) => setAdmissionDiagnosis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveBedModal(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Confirm Inpatient Admission</span>
                  </button>
                </div>
              </form>
            )}

            {/* If Sanitizing */}
            {activeBedModal.status === 'sanitizing' && (
              <div className="space-y-4 text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                  <span className="font-bold flex items-center">
                    <RefreshCw className="w-4 h-4 text-amber-600 mr-1.5 animate-spin" />
                    Bed Under UV Sterilization & Deep Cleaning
                  </span>
                  <p className="text-amber-800">
                    Housekeeping team is completing sanitization protocol. Estimated remaining time: <strong>{activeBedModal.cleanMinsLeft || 8} minutes</strong>.
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveBedModal(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleMarkSanitized(activeBedModal.id)}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Housekeeping Signed: Mark Ready (Sanitized)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
