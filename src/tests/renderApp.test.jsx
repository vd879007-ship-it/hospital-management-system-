import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock localStorage
const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; }
};

import App from '../App';
import { HospitalProvider } from '../context/HospitalContext';
import { PatientPortal } from '../features/patient/PatientPortal';
import { ReceptionPortal } from '../features/reception/ReceptionPortal';
import { DoctorPortal } from '../features/doctor/DoctorPortal';
import { NursePortal } from '../features/nurse/NursePortal';
import { BedWardTracker } from '../features/beds/BedWardTracker';
import { PharmacyPortal } from '../features/pharmacy/PharmacyPortal';
import { AdminPortal } from '../features/admin/AdminPortal';
import { TriagePortal } from '../features/triage/TriagePortal';

describe('App & Feature Portals Rendering with Clean / Empty State', () => {
  it('should render App without any crash', () => {
    const html = renderToString(<App />);
    expect(html).toContain('HSMS');
  });

  it('should render each portal inside HospitalProvider without throwing', () => {
    expect(() => renderToString(<HospitalProvider><PatientPortal /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><ReceptionPortal /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><DoctorPortal /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><NursePortal /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><BedWardTracker /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><PharmacyPortal /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><AdminPortal /></HospitalProvider>)).not.toThrow();
    expect(() => renderToString(<HospitalProvider><TriagePortal /></HospitalProvider>)).not.toThrow();
  });
});
