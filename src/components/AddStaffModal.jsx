import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  UserPlus,
  X,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Activity,
  ClipboardList,
  Pill,
  BarChart3,
  Building,
  Mail,
  CloudUpload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddStaffModal = () => {
  const {
    isAddStaffModalOpen,
    setIsAddStaffModalOpen,
    addStaffMember,
    departments,
    language
  } = useHospital();

  const isTamil = language === 'ta';

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-1');
  const [specialty, setSpecialty] = useState('Consultant Physician');
  const [cabin, setCabin] = useState('OPD Cabin 105');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAddStaffModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Please enter staff name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDept = departments.find(d => d.id === departmentId);
      await addStaffMember({
        displayName,
        role,
        email: email || `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.org`,
        departmentId,
        deptName: selectedDept?.name || 'General Medicine',
        specialty,
        cabin
      });

      confetti({ particleCount: 50, spread: 60 });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsAddStaffModalOpen(false);
        setDisplayName('');
        setEmail('');
      }, 1400);
    } catch (err) {
      alert('Error creating staff account: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isTamil ? 'புதிய மருத்துவமனை பணியாளர் சேர்க்கை' : 'Add Hospital Staff Account'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {isTamil ? 'Firebase Firestore-ல் கணக்கு உடனடியாகச் சேமிக்கப்படும்' : 'Account will be stored immediately in Firebase Firestore'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddStaffModalOpen(false)}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {success && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Staff account created and stored in Firebase Firestore!</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isTamil ? 'முழுப் பெயர் *' : 'Full Name *'}
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dr. K. Meenakshi / Nurse Divya S."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'பணிப் பொறுப்பு (Role) *' : 'System Role *'}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="doctor">Doctor (மருத்துவர்)</option>
                <option value="nurse">Nurse (செவிலியர்)</option>
                <option value="reception">Receptionist (வரவேற்பாளர்)</option>
                <option value="pharmacist">Pharmacist (மருந்தாளர்)</option>
                <option value="triage_staff">Triage Staff (டிரையாஜ்)</option>
                <option value="admin">Administrator (நிர்வாகி)</option>
                <option value="beds">Beds / ICU Lead</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'மின்னஞ்சல்' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@hospital.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Conditional Doctor Details */}
          {role === 'doctor' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
              <span className="text-[11px] font-bold text-blue-900 block">
                Doctor OPD Configuration:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Cardiologist / Pediatrician"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Cabin / Room</label>
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="Cabin 104"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (isTamil ? 'சேமிக்கிறது...' : 'Saving...')
                  : (isTamil ? 'Firebase-ல் சேமிக்க' : 'Save Staff to Firebase')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
