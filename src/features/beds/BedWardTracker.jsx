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
  RefreshCw,
  Search,
  ArrowRight,
  ArrowLeftRight,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BedWardTracker = () => {
  const { language, beds, patients, transferBed, updateBedStatus, t } = useHospital();
  const isTamil = language === 'ta';

  const [selectedWardFilter, setSelectedWardFilter] = useState('ALL'); // 'ALL' | 'ICU' | 'Emergency Trauma' | 'General Ward' | 'Pediatric Care'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'available' | 'occupied' | 'sanitizing' | 'reserved'
  const [activeBedModal, setActiveBedModal] = useState(null);
  
  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetBedId, setTargetBedId] = useState('');
  const [transferReason, setTransferReason] = useState('Clinical step-down / condition stabilized');

  // Statistics
  const totalBeds = beds.length; // 32
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const sanitizingBeds = beds.filter(b => b.status === 'sanitizing').length;
  const reservedBeds = beds.filter(b => b.status === 'reserved').length;
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Available beds for transfer target
  const availableTransferTargets = beds.filter(b => b.status === 'available');

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    if (selectedWardFilter !== 'ALL' && b.ward !== selectedWardFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  const handleBedClick = (bed) => {
    setActiveBedModal(bed);
    setIsTransferModalOpen(false);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!targetBedId) {
      alert(isTamil ? 'இலக்கு படுக்கையைத் தேர்ந்தெடுக்கவும்.' : 'Please select a destination bed.');
      return;
    }

    const result = transferBed(activeBedModal.id, targetBedId, transferReason);
    if (result.success) {
      confetti({ particleCount: 50, spread: 60 });
      alert(
        isTamil
          ? `நோயாளி ${activeBedModal.id} படுக்கையிலிருந்து ${targetBedId} படுக்கைக்கு வெற்றிகரமாக மாற்றப்பட்டார்!`
          : `Patient transferred successfully from ${activeBedModal.id} to ${targetBedId}!`
      );
      setActiveBedModal(null);
      setIsTransferModalOpen(false);
    } else {
      alert(isTamil ? `இடமாற்றம் தோல்வியடைந்தது: ${result.message}` : `Transfer failed: ${result.message}`);
    }
  };

  const handleDischargeBed = (bedId) => {
    updateBedStatus(bedId, 'sanitizing', {
      patientName: null,
      patientId: null,
      diagnosis: null,
      oxygen: null,
      admittedAt: null,
      doctor: null,
      cleanMinsLeft: 20
    });
    alert(
      isTamil
        ? `நோயாளி டிஸ்சார்ஜ் செய்யப்பட்டார். படுக்கை ${bedId} தானியங்கி சுத்திகரிப்பு நிலைக்கு மாற்றப்பட்டது.`
        : `Patient discharged. Bed ${bedId} marked for sanitization.`
    );
    setActiveBedModal(null);
  };

  const handleMarkCleaned = (bedId) => {
    updateBedStatus(bedId, 'available', { cleanMinsLeft: null });
    confetti({ particleCount: 40, spread: 50 });
    setActiveBedModal(null);
  };

  const wardNames = {
    'ALL': isTamil ? 'அனைத்து 32 படுக்கைகள்' : 'All 32 Beds',
    'ICU': isTamil ? 'தீவிர சிகிச்சை (ICU)' : 'ICU',
    'Emergency Trauma': isTamil ? 'அவசர சிகிச்சை பிரிவு' : 'Emergency Trauma',
    'General Ward': isTamil ? 'பொது வார்டு' : 'General Ward',
    'Pediatric Care': isTamil ? 'குழந்தைகள் பிரிவு' : 'Pediatric Care'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('bedTrackerTitle')}
            </h1>
            <span className="badge-highlight">{totalBeds} {t('totalBeds')}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {t('bedTrackerDesc')}
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{availableBeds} {t('availableBeds')}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-800 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>{occupiedBeds} {t('occupiedBeds')} ({occupancyPercentage}%)</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{sanitizingBeds} {t('sanitizingBeds')}</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-800 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>{reservedBeds} {t('reservedBeds')}</span>
          </div>
        </div>
      </div>

      {/* Ward & Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-700 mr-2">{isTamil ? 'வார்டுகள்:' : 'Wards:'}</span>
          {['ALL', 'ICU', 'Emergency Trauma', 'General Ward', 'Pediatric Care'].map(ward => (
            <button
              key={ward}
              onClick={() => setSelectedWardFilter(ward)}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedWardFilter === ward
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {wardNames[ward] || ward}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-700">{t('status')}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="ALL">{isTamil ? 'அனைத்து நிலைகளும்' : 'All Statuses'}</option>
            <option value="available">{t('available')}</option>
            <option value="occupied">{t('occupied')}</option>
            <option value="sanitizing">{t('sanitizing')}</option>
            <option value="reserved">{t('reserved')}</option>
          </select>
        </div>
      </div>

      {/* 32-Bed Visual Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {filteredBeds.map(bed => {
          const isOccupied = bed.status === 'occupied';
          const isAvailable = bed.status === 'available';
          const isSanitizing = bed.status === 'sanitizing';
          const isReserved = bed.status === 'reserved';
          const isIcu = bed.ward === 'ICU';

          let bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950';
          let badgeColor = 'bg-emerald-600 text-white';
          if (isOccupied) {
            bgClass = 'bg-red-50 border-red-300 text-red-950';
            badgeColor = 'bg-red-600 text-white';
          } else if (isSanitizing) {
            bgClass = 'bg-amber-50 border-amber-300 text-amber-950';
            badgeColor = 'bg-amber-600 text-white';
          } else if (isReserved) {
            bgClass = 'bg-indigo-50 border-indigo-300 text-indigo-950';
            badgeColor = 'bg-indigo-600 text-white';
          }

          return (
            <div
              key={bed.id}
              onClick={() => handleBedClick(bed)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] flex flex-col justify-between min-h-[140px] ${bgClass}`}
            >
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-black/5">
                  <span className="font-mono font-bold text-xs">{bed.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${badgeColor}`}>
                    {isTamil ? (isOccupied ? 'பயன்பாட்டில்' : isAvailable ? 'காலியாக' : isSanitizing ? 'சுத்தம்' : 'முன்பதிவு') : bed.status}
                  </span>
                </div>

                <div className="pt-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">{bed.ward}</span>
                  {isOccupied && (
                    <div className="mt-1">
                      <span className="font-bold text-xs block text-slate-900 truncate">{bed.patientName}</span>
                      <span className="text-[10px] text-blue-700 font-mono block">{bed.patientId}</span>
                      <span className="text-[9px] text-slate-600 block truncate mt-0.5">{bed.diagnosis}</span>
                    </div>
                  )}
                  {isSanitizing && (
                    <div className="mt-2 text-center text-amber-800">
                      <Clock className="w-4 h-4 mx-auto animate-spin" />
                      <span className="text-[10px] font-bold block mt-1">{isTamil ? 'சுத்திகரிப்பு' : 'Cleaning'}</span>
                    </div>
                  )}
                  {isAvailable && (
                    <div className="mt-2 text-center text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mx-auto" />
                      <span className="text-[10px] font-bold block mt-1">{isTamil ? 'தயார்' : 'Ready'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Equipment Flags */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[9px] font-semibold text-slate-500">
                <span>{bed.oxygen ? `O2: ${bed.oxygen}` : 'Room Air'}</span>
                {bed.ventilator && (
                  <span className="bg-blue-600 text-white px-1 rounded font-bold">VENT</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Bed Modal Dialog */}
      {activeBedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isTamil ? `படுக்கை ${activeBedModal.id} விவரங்கள்` : `Bed ${activeBedModal.id} Overview`}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">{activeBedModal.ward} • Room #{activeBedModal.room}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveBedModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Occupied */}
            {activeBedModal.status === 'occupied' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('patientLabel')}</span>
                  <h4 className="text-base font-bold text-slate-900">{activeBedModal.patientName}</h4>
                  <p className="text-xs text-blue-700 font-mono font-semibold">{activeBedModal.patientId}</p>
                  <p className="text-xs text-slate-700 font-medium mt-1">{t('diagnosisLabel')}: <strong className="text-slate-900">{activeBedModal.diagnosis}</strong></p>
                  <div className="flex gap-4 pt-1 text-[11px] font-semibold text-slate-600">
                    <span>SpO2: {activeBedModal.oxygen}</span>
                    <span>Ventilator: {activeBedModal.ventilator ? (isTamil ? 'செயலில் உள்ளது' : 'Active (ON)') : (isTamil ? 'தேவையில்லை' : 'Not Required')}</span>
                    <span>{t('doctorLabel')}: {activeBedModal.doctor}</span>
                  </div>
                </div>

                {/* TRANSFER BED SECTION */}
                {!isTransferModalOpen ? (
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="btn-primary text-xs py-2.5 px-4 flex-1 shadow-xs"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>{t('transferPatientBtn')}</span>
                    </button>
                    <button
                      onClick={() => handleDischargeBed(activeBedModal.id)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold text-xs transition"
                    >
                      {isTamil ? 'டிஸ்சார்ஜ்' : 'Discharge'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleExecuteTransfer} className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                    <h5 className="font-bold text-blue-800 text-xs uppercase flex items-center">
                      <ArrowLeftRight className="w-4 h-4 mr-1.5" />
                      {t('transferModalTitle')}
                    </h5>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('selectTargetBed')}</label>
                      <select
                        required
                        value={targetBedId}
                        onChange={(e) => setTargetBedId(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                      >
                        <option value="">{isTamil ? `-- காலியான படுக்கையைத் தேர்ந்தெடுக்கவும் (${availableTransferTargets.length}) --` : `-- Choose Available Bed (${availableTransferTargets.length} available) --`}</option>
                        {availableTransferTargets.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.id} ({b.ward}) {b.ventilator ? '• Vent Equipped' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('transferReasonLabel')}</label>
                      <input
                        type="text"
                        required
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsTransferModalOpen(false)}
                        className="px-3 py-1.5 bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
                      >
                        {t('cancel')}
                      </button>
                      <button type="submit" className="btn-primary text-xs py-1.5 px-3 shadow-xs">
                        {isTamil ? 'இடமாற்றத்தை உறுதி செய்' : 'Confirm Transfer'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* If Cleaning / Sanitizing */}
            {activeBedModal.status === 'sanitizing' && (
              <div className="space-y-3 text-xs text-center p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-amber-900">
                  {isTamil ? 'படுக்கை UV கிருமிநாசினி சுத்திகரிப்பில் உள்ளது.' : 'Bed undergoing automated UV sterilization and terminal linen disinfection.'}
                </p>
                <button
                  onClick={() => handleMarkCleaned(activeBedModal.id)}
                  className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isTamil ? 'சுத்தம் முடிந்தது — நோயாளிக்கு தயார்' : 'Mark Cleaning Complete & Ready for Patient'}
                </button>
              </div>
            )}

            {/* If Available */}
            {activeBedModal.status === 'available' && (
              <div className="space-y-3 text-xs text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-900">
                  {isTamil ? 'இந்த படுக்கை சுத்திகரிக்கப்பட்டு உடனடியாக நோயாளி அனுமதிக்கு தயாராக உள்ளது.' : 'This bed is sterilized, inspected, and ready for immediate patient admission.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
