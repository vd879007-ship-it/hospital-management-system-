import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  Users,
  Clock,
  Bed,
  Pill,
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export const AdminPortal = () => {
  const {
    patients,
    appointments,
    beds,
    inventory,
    auditLogs,
    users,
    toggleUserActive,
    setIsAddStaffModalOpen,
    setIsAddMedicineModalOpen,
    language,
    t
  } = useHospital();

  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'audit' | 'users'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // 1. Chart Data: Patients Per Day (Last 7 Days)
  const patientsPerDayData = [
    { day: 'Mon', outpatient: 38, emergency: 6 },
    { day: 'Tue', outpatient: 44, emergency: 9 },
    { day: 'Wed', outpatient: 52, emergency: 4 },
    { day: 'Thu', outpatient: 48, emergency: 8 },
    { day: 'Fri', outpatient: 61, emergency: 12 },
    { day: 'Sat', outpatient: 35, emergency: 5 },
    { day: 'Sun', outpatient: 29, emergency: 7 },
  ];

  // 2. Chart Data: Average Wait Time by Department (Minutes)
  const waitTimeByDeptData = [
    { department: 'General Med', waitMins: 18, benchmark: 15 },
    { department: 'Cardiology', waitMins: 24, benchmark: 20 },
    { department: 'Pediatrics', waitMins: 12, benchmark: 15 },
    { department: 'Orthopedics', waitMins: 22, benchmark: 20 },
    { department: 'Emergency', waitMins: 2, benchmark: 5 },
    { department: 'Pulmonology', waitMins: 16, benchmark: 15 },
  ];

  // 3. Chart Data: Bed Occupancy
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const sanitizingBeds = beds.filter(b => b.status === 'sanitizing').length;
  const reservedBeds = beds.filter(b => b.status === 'reserved').length;

  const bedOccupancyData = [
    { name: 'Occupied', value: occupiedBeds, color: '#2563eb' },
    { name: 'Available', value: availableBeds, color: '#10b981' },
    { name: 'Cleaning', value: sanitizingBeds, color: '#f59e0b' },
    { name: 'Reserved', value: reservedBeds, color: '#6366f1' },
  ];

  // 4. Chart Data: Top Diagnoses
  const topDiagnosesData = [
    { diagnosis: 'Upper Resp Infection', cases: 42 },
    { diagnosis: 'Acute Bronchitis', cases: 31 },
    { diagnosis: 'Type 2 Diabetes', cases: 28 },
    { diagnosis: 'Hypertension', cases: 24 },
    { diagnosis: 'Gastroenteritis', cases: 19 },
    { diagnosis: 'Angina / Cardiac', cases: 14 },
  ];

  // 5. Chart Data: Stock Levels (Sample Formulary Items)
  const stockLevelsData = inventory.slice(0, 8).map(item => ({
    name: item.name.split(' ')[0],
    stock: item.currentStock,
    threshold: item.reorderLevel
  }));

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.actorName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Export CSV Audit Trail
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'Details'];
    const rows = filteredAuditLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.resourceId}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hsms_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('adminTitle')}
            </h1>
            <span className="badge-highlight">{isTamil ? 'நிர்வாக நுண்ணறிவு' : 'Admin Intelligence'}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {t('adminDesc')}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('analyticsTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'audit' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('auditLogsTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('userAccountsTab')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RECHARTS OPERATIONAL DASHBOARDS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">{t('kpiTotalPatients')}</span>
              <span className="text-3xl font-bold text-blue-600">{patients.length}</span>
              <span className="text-[10px] text-blue-700 font-semibold block mt-1">{isTamil ? 'தனித்துவ பாஸ்போர்ட்டுகள்' : 'Unique Hospital Passports'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">{t('kpiBedOccupancy')}</span>
              <span className="text-3xl font-bold text-slate-900">
                {Math.round((occupiedBeds / 32) * 100)}%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">{occupiedBeds} / 32 {isTamil ? 'உள்நோயாளிகள்' : 'Inpatients'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">{t('kpiAvgWaitTime')}</span>
              <span className="text-3xl font-bold text-blue-700">14m</span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">{isTamil ? '20 நிமிட வரம்பிற்குள்' : 'Within 20m benchmark'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">{t('kpiLowStockItems')}</span>
              <span className="text-3xl font-bold text-slate-900">{inventory.length}</span>
              <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                {inventory.filter(i => i.currentStock <= i.reorderLevel).length} {isTamil ? 'எச்சரிக்கைகள்' : 'Low Stock Alerts'}
              </span>
            </div>
          </div>

          {/* Row 1: Patients Per Day + Average Wait Time by Dept */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Patients Per Day */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  1. Patients Per Day (Outpatient vs Emergency)
                </h3>
                <span className="badge-highlight text-[10px]">7-Day Trend</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientsPerDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="outpatient" name="Outpatient Visits" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="emergency" name="Code Red Emergency" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Average Wait Time by Department */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  2. Average Wait Time by Department (Minutes)
                </h3>
                <span className="badge-highlight text-[10px]">Benchmarked</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waitTimeByDeptData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} unit="m" />
                    <YAxis dataKey="department" type="category" stroke="#64748b" fontSize={10} width={75} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="waitMins" name="Actual Wait (Mins)" fill="#0284c7" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="benchmark" name="Target SLA" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Bed Occupancy + Top Diagnoses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 3: Bed Occupancy */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  3. 32-Bed Live Occupancy Distribution
                </h3>
                <span className="badge-highlight text-[10px]">Real-Time Floor</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bedOccupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {bedOccupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Top Clinical Diagnoses */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  4. Top Clinical Diagnoses (This Month)
                </h3>
                <span className="badge-highlight text-[10px]">Morbidity Stats</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDiagnosesData} layout="vertical" margin={{ top: 10, right: 10, left: 50, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="diagnosis" type="category" stroke="#64748b" fontSize={10} width={90} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="cases" name="Documented Episodes" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: Stock Levels */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 gap-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                {isTamil ? '5. மருந்து சரக்கு இருப்பு vs மறுவரிசை அளவு' : '5. Formulary Stock Levels vs Reorder Thresholds'}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="badge-highlight text-[10px]">Pharmacy Supply</span>
                <button
                  type="button"
                  onClick={() => setIsAddMedicineModalOpen(true)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer active:scale-95"
                >
                  {isTamil ? '➕ புதிய மருந்து' : '➕ Add Drug'}
                </button>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockLevelsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="stock" name="Current Stock" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threshold" name="Reorder Alert Threshold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEARCHABLE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit trail by actor, action, details..."
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 w-full sm:w-80 transition"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="ALL">All Roles</option>
                <option value="DOCTOR">Doctor</option>
                <option value="RECEPTION">Reception</option>
                <option value="NURSE">Nurse</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="TRIAGE_STAFF">Triage Staff</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="btn-primary text-xs py-1.5 px-3 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Actor & Role</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Target Resource</th>
                  <th className="py-3 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{log.actorName}</span>
                      <span className="badge-highlight text-[9px] px-1.5 py-0.5">{log.role}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-blue-700">{log.action}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{log.resourceId}</td>
                    <td className="py-3 px-3 text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isTamil ? 'மருத்துவமனை பணியாளர் கணக்குகள் & RBAC அணுகல்' : 'Hospital User Accounts & RBAC Matrix'}
              </h3>
              <p className="text-xs text-slate-600">
                {isTamil
                  ? 'பணியாளர் கணக்குகளை நிர்வகிக்கவும்; Firebase-ல் நேரடியாகப் புதிய கணக்குகளைச் சேர்க்கவும்.'
                  : 'Administer system accounts and toggle access privileges in real-time with Firebase.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isTamil ? '➕ புதிய பணியாளர் சேர்க்க' : '➕ Add Staff Member'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  {isTamil ? 'பணியாளர் கணக்குகள் எதுவும் இல்லை' : 'No staff accounts registered'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isTamil ? 'புதிய பணியாளரை உருவாக்க மேலே உள்ள "+ புதிய பணியாளர் சேர்க்க" பொத்தானைப் பயன்படுத்தவும்.' : 'Use "+ Add Staff Member" to register new staff accounts.'}
                </p>
              </div>
            ) : (
              users.map(u => (
                <div
                  key={u.uid}
                  className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} alt={u.displayName} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{u.displayName}</h4>
                      <span className="badge-highlight text-[9px] font-mono uppercase">{u.role}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className={`font-semibold ${u.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {u.active ? '● Active' : '○ Deactivated'}
                    </span>
                    <button
                      onClick={() => toggleUserActive(u.uid)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        u.active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
