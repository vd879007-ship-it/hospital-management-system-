import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileText,
  Pill,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const NotificationCenterDrawer = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setCurrentRole,
  } = useHospital();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'critical'

  if (!isNotificationDrawerOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'critical') return n.severity === 'critical';
    return true;
  });

  const handleNotificationClick = (n) => {
    markNotificationRead(n.id);
    if (n.type === 'EMERGENCY_ALERT') {
      setCurrentRole('doctor');
    } else if (n.type === 'TOKEN_CALLED') {
      setCurrentRole('patient');
    } else if (n.type === 'PRESCRIPTION_READY' || n.type === 'INVENTORY_LOW') {
      setCurrentRole('pharmacist');
    }
    setIsNotificationDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#001c38] text-white shadow-2xl border-l border-cyan-500/40 flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-cyan-800/60 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Hospital Notifications
                </h3>
                <p className="text-xs text-cyan-200/70">
                  {unreadCount} unread alerts requiring attention
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar & Quick Clear */}
          <div className="px-5 py-2.5 bg-[#00172e] border-b border-cyan-900/60 flex items-center justify-between text-xs shrink-0">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeTab === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeTab === 'unread' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('critical')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeTab === 'critical' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Critical
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto opacity-60" />
                <p>All caught up! No notifications in this tab.</p>
              </div>
            ) : (
              filtered.map((n) => {
                const isCritical = n.severity === 'critical';
                const isWarning = n.severity === 'warning';
                const isSuccess = n.severity === 'success';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative group ${
                      !n.read
                        ? 'bg-[#002852] border-cyan-500/60 shadow-sm'
                        : 'bg-[#001e3d]/70 border-cyan-900/60 opacity-80'
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}

                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-red-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : isSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-cyan-600 text-white'
                      }`}>
                        {isCritical ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isSuccess ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 pr-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition">
                            {n.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-cyan-100/80 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-cyan-300/70">
                          <span className="font-mono">{n.timestamp}</span>
                          <span className="flex items-center text-cyan-400 opacity-0 group-hover:opacity-100 transition">
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#001428] border-t border-cyan-900/60 text-[11px] text-cyan-200/60 text-center shrink-0">
            In-App Event Dispatcher • Real-Time Clinical Sync
          </div>
        </div>
      </div>
    </div>
  );
};
