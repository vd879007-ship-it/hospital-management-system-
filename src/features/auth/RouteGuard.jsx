import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { hasPermission } from '../../config/roles';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

export const RouteGuard = ({ allowedRoles = [], requiredPermission, children }) => {
  const { currentRole, setCurrentRole } = useHospital();

  const normalizedCurrent = currentRole === 'reception' ? 'receptionist' : currentRole;

  let isAllowed = true;

  if (allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r === 'reception' ? 'receptionist' : r);
    isAllowed = normalizedAllowed.includes(normalizedCurrent);
  }

  if (isAllowed && requiredPermission) {
    isAllowed = hasPermission(currentRole, requiredPermission);
  }

  if (!isAllowed) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white border-2 border-[#FF0000] rounded-3xl shadow-xl text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 mx-auto bg-red-100 text-[#FF0000] rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#FF0000]">
            Access Restricted by Role-Based Access Control (RBAC)
          </h2>
          <p className="text-sm text-[#0000CC]">
            Current Role: <span className="font-bold uppercase text-[#E36C09]">{currentRole}</span>. 
            This module requires authorization: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">{allowedRoles.join(' / ') || requiredPermission}</span>.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-2">
          {allowedRoles.map(role => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#FF0000] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition shadow-md"
            >
              <span>Switch to {role.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
