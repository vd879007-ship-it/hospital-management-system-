import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { ShieldAlert, X, CheckCircle, Clock } from 'lucide-react';

export const EmergencyModal = () => {
  const {
    activeEmergencyAlerts,
    acknowledgeEmergencyAlert,
    currentRole,
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
    language,
    t
  } = useHospital();

  const [isOpen, setIsOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('Patient transferred to Cath Lab Bay 2; STAT Trop-I and Dual Antiplatelet therapy initiated.');

  if (activeEmergencyAlerts.length === 0) return null;

  const currentAlert = activeEmergencyAlerts[0];
  const showModal = isOpen || isEmergencyModalOpen;
  const isTamil = language === 'ta';

  const handleClose = () => {
    setIsOpen(false);
    setIsEmergencyModalOpen(false);
  };

  const handleAcknowledge = () => {
    const staffName = currentRole === 'doctor' ? 'Dr. Carlo Toledano' : currentRole === 'nurse' ? 'Nurse Geetha R.' : 'Triage Duty Clinician';
    acknowledgeEmergencyAlert(currentAlert.id, staffName, actionNotes);
    alert(
      isTamil
        ? `அவசர எச்சரிக்கை ${currentAlert.alertId} உறுதிப்படுத்தப்பட்டு நடவடிக்கை ஆவணப்படுத்தப்பட்டது.`
        : `Emergency Alert ${currentAlert.alertId} acknowledged and action documented.`
    );
    handleClose();
  };

  return (
    <>
      {/* Floating Emergency Alert Badge if closed */}
      {!showModal && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-rose-300 transition active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="text-xs tracking-wider uppercase font-mono">
              {t('codeRedActivePill')} ({activeEmergencyAlerts.length})
            </span>
          </button>
        </div>
      )}

      {/* Emergency Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-500 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-600 text-white rounded-2xl animate-pulse">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full uppercase">
                    {t('immediateResuscitationPriority')}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {currentAlert.alertId}
                  </h3>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs space-y-2 text-red-950 font-medium">
              <p><strong>{t('patientLabel')}:</strong> {currentAlert.patientName}</p>
              <p><strong>{t('warningSignsLabel')}:</strong> {currentAlert.warningSigns}</p>
              <p><strong>{t('triageSourceLabel')}:</strong> {currentAlert.origin}</p>
              <p className="flex items-center text-red-800">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {t('triggeredAtLabel')}: {currentAlert.createdAt}
              </p>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                {t('actionNotesLabel')}
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('dismiss')}
              </button>
              <button
                type="button"
                onClick={handleAcknowledge}
                className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition"
              >
                {t('acknowledgeAlertBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
