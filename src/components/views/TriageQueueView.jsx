import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  UserPlus,
  QrCode,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle2,
  Phone,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TriageQueueView = () => {
  const {
    language,
    appointments,
    updateTokenStatus,
    registerPatient,
    departments,
    doctors,
    triggerEmergencyAlert,
    setIsQRScannerOpen,
    setSelectedPatientId,
    setCurrentRole,
  } = useHospital();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'register' | 'emergencyTrigger'
  const [deptFilter, setDeptFilter] = useState('ALL');

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: '',
    nameTa: '',
    age: '',
    gender: 'Male',
    dateOfBirth: '1995-06-15',
    bloodType: 'B+',
    mobile: '',
    email: '',
    allergies: 'None',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: 'Spouse',
  });

  // Emergency Form State
  const [emergencyData, setEmergencyData] = useState({
    patientName: '',
    warningSigns: 'Acute chest pain radiating to left arm, cold sweat',
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      alert('Please enter patient name and mobile number.');
      return;
    }

    const created = registerPatient(formData);
    confetti({ particleCount: 50, spread: 70 });
    alert(`Patient successfully registered! Patient ID: ${created.patientId}`);
    setFormData({
      name: '',
      nameTa: '',
      age: '',
      gender: 'Male',
      dateOfBirth: '1995-06-15',
      bloodType: 'B+',
      mobile: '',
      email: '',
      allergies: 'None',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRel: 'Spouse',
    });
    setActiveTab('queue');
  };

  const handleManualEmergency = (e) => {
    e.preventDefault();
    if (!emergencyData.patientName) {
      alert('Enter patient name.');
      return;
    }

    triggerEmergencyAlert({
      patientName: emergencyData.patientName,
      warningSigns: emergencyData.warningSigns,
      origin: 'Reception / Triage Desk Desk-01'
    });

    alert('CRITICAL EMERGENCY ALERT BROADCASTED TO ALL CLINICIANS & TRAUMA BAY!');
    setEmergencyData({ patientName: '', warningSigns: '' });
    setActiveTab('queue');
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(apt => {
    if (deptFilter === 'ALL') return true;
    return apt.departmentId === deptFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#002855]">
                {language === 'ta' ? 'வரவேற்பு & நேரடி வரிசை மேலாண்மை' : 'Reception & Routine Token Queue'}
              </h2>
              <p className="text-xs text-slate-500">
                Manage token lifecycle (Waiting → Called → In Consultation → Completed) with separated emergency pathway
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'queue' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            Live Queue Board ({appointments.filter(a => a.tokenStatus !== 'Completed').length})
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'register' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Patient Registration</span>
          </button>
          <button
            onClick={() => setActiveTab('emergencyTrigger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'emergencyTrigger' ? 'bg-red-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Trigger Emergency Escalation</span>
          </button>
        </div>
      </div>

      {/* View 1: Live Token Queue Board */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-cyan-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyan-600" />
              <span className="font-bold text-slate-700">Filter Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Total in System:</span>
              <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">
                {filteredAppointments.length} Tokens
              </span>
            </div>
          </div>

          {/* Tokens Table */}
          <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002244] text-white uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Token #</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Department & Doctor</th>
                    <th className="py-3 px-4">Slot / Check-in</th>
                    <th className="py-3 px-4">Triage Priority</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Advance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-cyan-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-cyan-700 text-sm">
                        {apt.tokenNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{apt.appointmentId}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 block">{apt.deptName}</span>
                        <span className="text-[11px] text-slate-500">{apt.doctorName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">{apt.slotTime}</span>
                        <span className="text-[11px] text-slate-400">In: {apt.checkedInAt}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.triageLevel.includes('Yellow')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {apt.triageLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center space-x-1 ${
                          apt.tokenStatus === 'Waiting'
                            ? 'bg-slate-100 text-slate-700'
                            : apt.tokenStatus === 'Called'
                            ? 'bg-blue-100 text-blue-700 animate-pulse'
                            : apt.tokenStatus === 'In Consultation'
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span>{apt.tokenStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {apt.tokenStatus === 'Waiting' && (
                            <button
                              onClick={() => updateTokenStatus(apt.id, 'Called')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Call Token
                            </button>
                          )}
                          {apt.tokenStatus === 'Called' && (
                            <button
                              onClick={() => {
                                updateTokenStatus(apt.id, 'In Consultation');
                                setSelectedPatientId(apt.patientId);
                                setCurrentRole('doctor');
                              }}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Start Consult
                            </button>
                          )}
                          {apt.tokenStatus === 'In Consultation' && (
                            <button
                              onClick={() => updateTokenStatus(apt.id, 'Completed')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Mark Done
                            </button>
                          )}
                          {apt.tokenStatus === 'Completed' && (
                            <span className="text-emerald-600 font-bold text-xs flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Finished
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Patient Registration Form */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto animate-fadeIn">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#002855]">
                  Patient Registration & QR Card Issuance
                </h3>
                <p className="text-xs text-slate-500">
                  Generates unique Hospital ID and secure digital health passport
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  பெயர் (தமிழ்)
                </label>
                <input
                  type="text"
                  placeholder="எ.கா: ரமேஷ் குமார்"
                  value={formData.nameTa}
                  onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="35"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Known Drug Allergies (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Aspirin"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-md transition"
              >
                Create Profile & Issue Verified Digital QR Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View 3: Emergency Trigger Desk */}
      {activeTab === 'emergencyTrigger' && (
        <div className="bg-red-50/60 rounded-3xl border border-red-200 shadow-xl p-6 sm:p-8 space-y-5 max-w-xl mx-auto animate-fadeIn">
          <div className="flex items-center space-x-3 pb-3 border-b border-red-200">
            <div className="p-2.5 bg-red-600 text-white rounded-2xl shadow">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-950">
                Staff Emergency Escalation Override
              </h3>
              <p className="text-xs text-red-700">
                Instantly bypass routine queues for urgent or life-threatening arrivals
              </p>
            </div>
          </div>

          <form onSubmit={handleManualEmergency} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-red-900 uppercase tracking-wider mb-1">
                Patient Name / Identification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unidentified Trauma Patient #04"
                value={emergencyData.patientName}
                onChange={(e) => setEmergencyData({ ...emergencyData, patientName: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-xl p-2.5 text-red-950 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-red-900 uppercase tracking-wider mb-1">
                Emergency Warning Signs *
              </label>
              <textarea
                rows={3}
                required
                value={emergencyData.warningSigns}
                onChange={(e) => setEmergencyData({ ...emergencyData, warningSigns: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-xl p-2.5 text-red-950 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition text-sm"
            >
              🚨 Broadcast Urgent Code Red Alert Now
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
