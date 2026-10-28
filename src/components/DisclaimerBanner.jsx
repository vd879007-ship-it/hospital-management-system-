import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner = () => {
  const { language, t } = useHospital();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center space-x-2 border-b border-slate-800 tracking-wide">
      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>
        {language === 'ta' ? (
          <>
            <strong className="text-white font-semibold">மாதிரி அமைப்பு:</strong> உண்மையான மருத்துவப் பயன்பாட்டிற்கு அல்ல. MediTechTitans குழுமம் — மருத்துவமனை ஸ்மார்ட் மேலாண்மை அமைப்பு (HSMS)
          </>
        ) : (
          <>
            <strong className="text-white font-semibold">Demo System:</strong> Not for real clinical use. Developed by Team MediTechTitans — Hospital Smart Management System (HSMS)
          </>
        )}
      </span>
    </div>
  );
};
