import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  BarChart3,
  Clock,
  Users,
  ShieldAlert,
  TrendingDown,
  Activity,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Zap,
  TrendingUp,
  Download,
  UserCheck,
  UserX,
  Power
} from 'lucide-react';

export const AdminAnalytics = () => {
  const {
    language,
    appointments,
    doctors,
    departments,
    medicationTasks,
    inventory,
    emergencyAlerts,
    auditLogs,
    users,
    toggleUserActive,
  } = useHospital();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'audit'
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('Today');

  // Calculations for KPI cards:
  const waitTimesByDept = [
    { dept: 'General Medicine', waitMins: 18, color: 'bg-cyan-500', barPct: '60%' },
    { dept: 'Cardiology', waitMins: 24, color: 'bg-blue-600', barPct: '80%' },
    { dept: 'Pediatrics', waitMins: 12, color: 'bg-emerald-500', barPct: '40%' },
    { dept: 'Orthopedics', waitMins: 22, color: 'bg-indigo-500', barPct: '72%' },
    { dept: 'Emergency & Trauma', waitMins: 2, color: 'bg-rose-600', barPct: '10%' },
  ];

  // Busiest Hours Distribution
  const hourlyArrivals = [
    { hour: '08:00 AM', count: 12 },
    { hour: '09:00 AM', count: 34 },
    { hour: '10:00 AM', count: 48 }, // Peak
    { hour: '11:00 AM', count: 42 },
    { hour: '12:00 PM', count: 28 },
    { hour: '01:00 PM', count: 14 },
    { hour: '02:00 PM', count: 32 },
    { hour: '03:00 PM', count: 26 },
    { hour: '04:00 PM', count: 18 },
  ];
  const maxHourlyCount = Math.max(...hourlyArrivals.map(h => h.count));

  // Doctor Workload
  const doctorWorkload = doctors.map(d => {
    const apts = appointments.filter(a => a.doctorId === d.id);
    return {
      doctorName: d.name,
      deptName: d.deptName,
      activeCases: d.activePatientsCount || 10,
      todayAppointments: apts.length,
      avatar: d.avatar,
    };
  });

  // Missed Dose Rate calculation
  const totalMedTasks = medicationTasks.length || 1;
  const delayedOrMissedCount = medicationTasks.filter(t => t.status === 'Delayed' || t.status === 'Missed').length;
  const missedDoseRate = ((delayedOrMissedCount / totalMedTasks) * 100).toFixed(1);

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilter === 'ALL') return true;
    return log.role === auditFilter;
  });

  // Export CSV Report
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
    link.setAttribute('download', `hospital_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#002855]">
              Hospital Operational Analytics & Executive Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Department wait times, peak hours, clinician workload, eMAR safety rates, and immutable audit logs
            </p>
          </div>
        </div>

        {/* Action Toggles & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            {['Today', 'Last 7 Days', 'Last 30 Days'].map((tab) => (
              <button
                key={tab}
                onClick={() => setDateFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  dateFilter === tab ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'overview' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'users' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff RBAC ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'audit' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
            title="Export CSV Operational Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Operations Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Avg Wait Time */}
            <div className="bg-white p-5 rounded-3xl border border-cyan-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg OPD Wait Time</span>
                <Clock className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-3xl font-black text-[#002855] mt-2 font-mono">
                17.4 <span className="text-sm font-semibold text-slate-500 font-sans">mins</span>
              </p>
              <div className="flex items-center text-[11px] text-emerald-600 font-bold mt-2">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                <span>-24% after QR Passports</span>
              </div>
            </div>

            {/* KPI 2: Emergency Response Time */}
            <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-red-500">Emergency Ack Time</span>
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-black text-red-600 mt-2 font-mono">
                1m 42s
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Target: &lt; 3 mins • 100% compliance
              </p>
            </div>

            {/* KPI 3: Missed-Dose Rate */}
            <div className="bg-white p-5 rounded-3xl border border-cyan-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">eMAR Delayed/Missed Rate</span>
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-[#002855] mt-2 font-mono">
                {missedDoseRate}%
              </p>
              <p className="text-[11px] text-amber-700 font-semibold mt-2">
                {delayedOrMissedCount} of {totalMedTasks} doses delayed (Radiology hold)
              </p>
            </div>

            {/* KPI 4: Active Appointments & Queue */}
            <div className="bg-white p-5 rounded-3xl border border-cyan-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Live Active Tokens</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-cyan-700 mt-2 font-mono">
                {appointments.filter(a => a.tokenStatus !== 'Completed').length}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                {appointments.filter(a => a.tokenStatus === 'In Consultation').length} Currently in Doctor Cabin
              </p>
            </div>
          </div>

          {/* Row 2: Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Busiest Hours Heatmap / Bar Chart (Takes 7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-cyan-100 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-[#002855] text-sm">
                    Busiest Hours: Patient Arrivals & Consultations
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded">
                  Peak: 10:00 AM - 11:00 AM
                </span>
              </div>

              {/* Responsive SVG / CSS Bar Chart */}
              <div className="space-y-2 pt-2">
                {hourlyArrivals.map((item, idx) => {
                  const pct = Math.round((item.count / maxHourlyCount) * 100);
                  const isPeak = item.count === maxHourlyCount;
                  return (
                    <div key={idx} className="flex items-center text-xs space-x-3">
                      <span className="w-20 text-[11px] font-mono text-slate-500 shrink-0">
                        {item.hour}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPeak
                              ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600'
                              : 'bg-gradient-to-r from-cyan-300 to-sky-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 font-bold text-slate-700 text-right font-mono">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Wait Times (Takes 5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-cyan-100 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-[#002855] text-sm">
                    Average Wait Time by Department
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {waitTimesByDept.map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{item.dept}</span>
                      <span className="font-mono text-cyan-800">{item.waitMins} mins</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.barPct }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl text-[11px] text-cyan-950">
                <strong>Formula:</strong> Start of consultation timestamp minus patient check-in timestamp. Emergency & Trauma bypasses routine wait times entirely.
              </div>
            </div>
          </div>

          {/* Row 3: Clinician Workload Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-[#002855] text-sm">
                  Clinician Workload & Case Allocation
                </h3>
              </div>
              <span className="text-xs text-slate-400">Contextual workload (Not a simplistic score)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctorWorkload.map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={doc.avatar}
                      alt={doc.doctorName}
                      className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{doc.doctorName}</h4>
                      <p className="text-[10px] text-cyan-700 font-semibold">{doc.deptName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Active</span>
                      <span className="font-bold text-slate-800">{doc.activeCases}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Today's OPD</span>
                      <span className="font-bold text-cyan-700 font-mono">{doc.todayAppointments} booked</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management & RBAC */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl overflow-hidden animate-fadeIn">
          <div className="p-4 bg-[#002244] text-white flex justify-between items-center text-xs">
            <span className="font-mono uppercase font-bold tracking-wider">
              Hospital Staff & Role-Based Access Control (RBAC)
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono">
              {users.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-cyan-50/40 transition">
                    <td className="py-3.5 px-4 flex items-center space-x-3">
                      <img src={u.avatar} alt={u.displayName} className="w-8 h-8 rounded-full object-cover border border-cyan-400" />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.displayName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{u.uid}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 uppercase font-mono">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-3.5 rounded-2xl border border-cyan-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyan-600" />
              <span className="font-bold text-slate-700">Filter Role:</span>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800"
              >
                <option value="ALL">All Roles</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="TRIAGE ENGINE">Triage Engine</option>
                <option value="PATIENT">Patient</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <span className="text-slate-500 font-mono">
              Immutable Log: {filteredAuditLogs.length} events recorded
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002244] text-white uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor & Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource ID</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-cyan-50/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{log.actorName}</span>
                        <span className="text-[10px] font-mono text-cyan-700">{log.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {log.resourceId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
