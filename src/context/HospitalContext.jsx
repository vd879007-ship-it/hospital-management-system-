import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SEED_PATIENTS,
  SEED_DEPARTMENTS,
  SEED_DOCTORS,
  SEED_TOKENS,
  SEED_PRESCRIPTIONS,
  SEED_MEDICATION_TASKS,
  SEED_INVENTORY,
  SEED_BEDS,
  SEED_AUDIT_LOGS,
  SEED_USERS
} from '../lib/seedData';
import {
  generateOfflineQRPayload,
  calculateWaitTime,
  checkDrugAllergyConflict,
  calculateTriageScore,
  generateUniquePatientId,
  generateUniqueTokenNumber,
  formatAadhaar,
  normalizeAadhaar
} from '../lib/utils';
import { TRANSLATIONS } from '../data/translations';
import {
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  bulkImportToFirestore,
  clearAllFirestoreData,
  testFirebaseConnection,
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  fetchAllFromFirestore,
  subscribeToCollection
} from '../services/firebaseService';

const HospitalContext = createContext();

// All 32 beds reset to unassigned/available status
export const CLEAN_BEDS = SEED_BEDS.map(bed => ({
  ...bed,
  status: 'available',
  patientName: null,
  patientId: null,
  diagnosis: null,
  oxygen: null,
  admittedAt: null,
  doctor: null,
  cleanMinsLeft: null
}));

// Safe Empty Patient fallback object when database has zero patients
export const EMPTY_PATIENT = {
  id: '',
  patientId: '',
  name: '',
  nameTa: '',
  gender: '-',
  age: 0,
  dateOfBirth: '-',
  bloodType: '-',
  mobile: '',
  email: '',
  nationalId: '',
  aadhaarNumber: '',
  abhaAddress: '',
  address: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  allergies: [],
  medicalHistory: [],
  prescriptions: [],
  labReports: [],
  vitals: {
    temperature: '-',
    bloodPressure: '-',
    pulseRate: '-',
    spo2: '-',
    height: '-',
    weight: '-',
    lastUpdated: '-'
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  qrPayload: ''
};

// Safe normalizer to prevent any undefined property access crashes
export const normalizePatient = (raw) => {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PATIENT };
  return {
    ...EMPTY_PATIENT,
    ...raw,
    vitals: {
      ...EMPTY_PATIENT.vitals,
      ...(raw.vitals || {})
    },
    emergencyContact: {
      ...EMPTY_PATIENT.emergencyContact,
      ...(raw.emergencyContact || {})
    },
    allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
    medicalHistory: Array.isArray(raw.medicalHistory) ? raw.medicalHistory : [],
    prescriptions: Array.isArray(raw.prescriptions) ? raw.prescriptions : [],
    labReports: Array.isArray(raw.labReports) ? raw.labReports : [],
    surgeries: Array.isArray(raw.surgeries) ? raw.surgeries : [],
    pastMedications: Array.isArray(raw.pastMedications) ? raw.pastMedications : []
  };
};

// Automatic one-time cleanup of old seed data from previous browser sessions
if (typeof window !== 'undefined' && localStorage.getItem('hsms_db_cleaned_v3') !== 'true') {
  localStorage.removeItem('hsms_patients');
  localStorage.removeItem('hsms_appointments');
  localStorage.removeItem('hsms_prescriptions');
  localStorage.removeItem('hsms_medicationTasks');
  localStorage.removeItem('hsms_emergencyAlerts');
  localStorage.removeItem('hsms_auditLogs');
  localStorage.removeItem('hsms_selectedPatientId');
  localStorage.removeItem('hsms_inventory');
  localStorage.removeItem('hsms_users');
  localStorage.setItem('hsms_beds', JSON.stringify(CLEAN_BEDS));
  localStorage.setItem('hsms_db_cleaned_v3', 'true');
}

export const HospitalProvider = ({ children }) => {
  // 1. Current Active Role
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('hsms_currentRole') || 'patient';
  });

  // 2. Language: 'en' (English) | 'ta' (Tamil)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('hsms_language') || 'en';
  });

  // 3. Selected Active Patient ID
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    return localStorage.getItem('hsms_selectedPatientId') || '';
  });

  // 4. Selected Active Doctor ID
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => {
    return localStorage.getItem('hsms_selectedDoctorId') || 'doc-1';
  });

  // 5. Persistent State Collections (Defaults to clean EMPTY arrays - only user saved data)
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('hsms_patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('hsms_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('hsms_prescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [medicationTasks, setMedicationTasks] = useState(() => {
    const saved = localStorage.getItem('hsms_medicationTasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('hsms_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [beds, setBeds] = useState(() => {
    const saved = localStorage.getItem('hsms_beds');
    return saved ? JSON.parse(saved) : CLEAN_BEDS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('hsms_auditLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState(() => {
    const saved = localStorage.getItem('hsms_emergencyAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('hsms_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('hsms_doctors');
    return saved ? JSON.parse(saved) : SEED_DOCTORS;
  });

  // Currently serving token index for OPD live calculation
  const [currentServingTokenNumber, setCurrentServingTokenNumber] = useState(101);

  // Modals visibility
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [activeBedModal, setActiveBedModal] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isUploadReportModalOpen, setIsUploadReportModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);

  // Firebase Sync State
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(() => ({
    isConfigured: isFirebaseConfigured(),
    projectId: getActiveFirebaseConfig().projectId || '',
    lastSyncedAt: localStorage.getItem('hsms_last_firebase_sync') || null,
    syncMessage: ''
  }));

  // Auto-fetch data from Firebase Firestore on startup & subscribe to live updates
  useEffect(() => {
    let isMounted = true;
    if (isFirebaseConfigured()) {
      fetchAllFromFirestore().then(res => {
        if (isMounted && res.success && res.data) {
          if (res.data.patients?.length > 0) {
            const valid = res.data.patients
              .filter(p => p && p.id && (p.name || p.nameTa || p.patientId))
              .map(normalizePatient);
            setPatients(valid);
            if (valid.length > 0) {
              setSelectedPatientId(prev => (prev && valid.some(p => p.id === prev)) ? prev : valid[0]?.id || '');
            }
          }
          if (res.data.appointments?.length > 0) setAppointments(res.data.appointments);
          if (res.data.prescriptions?.length > 0) setPrescriptions(res.data.prescriptions);
          if (res.data.medicationTasks?.length > 0) setMedicationTasks(res.data.medicationTasks);
          if (res.data.inventory?.length > 0) setInventory(res.data.inventory);
          if (res.data.beds?.length > 0) setBeds(res.data.beds);
          if (res.data.users?.length > 0) setUsers(res.data.users);
          if (res.data.emergencyAlerts?.length > 0) setEmergencyAlerts(res.data.emergencyAlerts);
          if (res.data.auditLogs?.length > 0) setAuditLogs(res.data.auditLogs);

          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setFirebaseStatus(prev => ({
            ...prev,
            isConfigured: true,
            lastSyncedAt: now,
            syncMessage: 'Live synchronized with Firebase Cloud Firestore.'
          }));
        }
      }).catch(err => {
        console.warn('[Firebase] Initial auto-fetch notice:', err.message);
      });

      // Set up real-time listeners for instant multi-user synchronization
      const unsubPatients = subscribeToCollection('patients', (items) => {
        if (isMounted) {
          const valid = (items || [])
            .filter(p => p && p.id && (p.name || p.nameTa || p.patientId))
            .map(normalizePatient);
          setPatients(valid);
          if (valid.length === 0) {
            setSelectedPatientId('');
          } else {
            setSelectedPatientId(prev => (prev && valid.some(p => p.id === prev)) ? prev : valid[0]?.id || '');
          }
        }
      });
      const unsubAppointments = subscribeToCollection('appointments', (items) => {
        if (isMounted) setAppointments(items);
      });
      const unsubPrescriptions = subscribeToCollection('prescriptions', (items) => {
        if (isMounted) setPrescriptions(items);
      });
      const unsubBeds = subscribeToCollection('beds', (items) => {
        if (isMounted && items.length > 0) setBeds(items);
      });
      const unsubInventory = subscribeToCollection('inventory', (items) => {
        if (isMounted) setInventory(items);
      });
      const unsubUsers = subscribeToCollection('users', (items) => {
        if (isMounted) setUsers(items);
      });

      return () => {
        isMounted = false;
        unsubPatients && unsubPatients();
        unsubAppointments && unsubAppointments();
        unsubPrescriptions && unsubPrescriptions();
        unsubBeds && unsubBeds();
        unsubInventory && unsubInventory();
        unsubUsers && unsubUsers();
      };
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('hsms_currentRole', currentRole); }, [currentRole]);
  useEffect(() => { localStorage.setItem('hsms_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('hsms_selectedPatientId', selectedPatientId); }, [selectedPatientId]);
  useEffect(() => { localStorage.setItem('hsms_selectedDoctorId', selectedDoctorId); }, [selectedDoctorId]);
  useEffect(() => { localStorage.setItem('hsms_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('hsms_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('hsms_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);
  useEffect(() => { localStorage.setItem('hsms_medicationTasks', JSON.stringify(medicationTasks)); }, [medicationTasks]);
  useEffect(() => { localStorage.setItem('hsms_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('hsms_beds', JSON.stringify(beds)); }, [beds]);
  useEffect(() => { localStorage.setItem('hsms_auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('hsms_emergencyAlerts', JSON.stringify(emergencyAlerts)); }, [emergencyAlerts]);
  useEffect(() => { localStorage.setItem('hsms_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('hsms_doctors', JSON.stringify(doctors)); }, [doctors]);

  // Append Audit Log Helper
  const addAuditLog = (action, resourceType, resourceId, details) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-CA') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      actorUid: `usr-${currentRole}-01`,
      actorName: currentRole.toUpperCase() + ' Staff',
      role: currentRole.toUpperCase(),
      action,
      resourceType,
      resourceId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Save audit log to Firestore in background
    saveDocumentToFirestore('audit_logs', newLog.id, newLog).catch(() => {});
  };

  // Central Universal Aadhaar Record Lookup
  const lookupPatientByAadhaar = (searchQuery) => {
    const clean = normalizeAadhaar(searchQuery);
    if (!clean) return null;
    return patients.find(p => {
      const pAadhaar = normalizeAadhaar(p.aadhaarNumber);
      const pId = normalizeAadhaar(p.patientId);
      return pAadhaar.includes(clean) || (clean.length === 12 && pAadhaar === clean) || pId.includes(clean);
    }) || null;
  };

  // 1. Patient Registration with unique ID & offline QR payload
  const registerPatient = (patientData) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newPatientId = generateUniquePatientId(randomSuffix);
    const newId = `pat-${Date.now()}`;
    const formattedAadhaar = patientData.aadhaarNumber 
      ? formatAadhaar(patientData.aadhaarNumber) 
      : `4599 8899 ${randomSuffix}`;

    const newPatient = {
      id: newId,
      patientId: newPatientId,
      name: patientData.name,
      nameTa: patientData.nameTa || patientData.name,
      gender: patientData.gender || 'Not Specified',
      age: parseInt(patientData.age, 10) || 30,
      dateOfBirth: patientData.dateOfBirth || '1995-01-01',
      bloodType: patientData.bloodType || 'B+',
      mobile: patientData.mobile || '+91 90000 00000',
      email: patientData.email || `${patientData.name.toLowerCase().replace(/[^a-z]/g, '')}@meditech.fake`,
      address: patientData.address || 'Chennai, Tamil Nadu',
      emergencyContact: {
        name: patientData.emergencyContactName || 'Family Member',
        phone: patientData.emergencyContactPhone || '+91 98888 88888',
        relationship: patientData.emergencyContactRel || 'Relative',
      },
      allergies: patientData.allergies 
        ? (Array.isArray(patientData.allergies) ? patientData.allergies : patientData.allergies.split(',').map(s => s.trim()).filter(Boolean))
        : ['None known'],
      vitals: {
        temperature: '37.0 °C',
        bloodPressure: '120/80 mmHg',
        pulseRate: '76 bpm',
        respiratoryRate: '16 bpm',
        spo2: '99%',
        height: '170 cm',
        weight: '68.0 kg',
        lastUpdated: 'Just now'
      },
      nationalId: `IND-ABHA-${randomSuffix}`,
      aadhaarNumber: formattedAadhaar,
      abhaAddress: `${patientData.name.toLowerCase().split(' ')[0]}.${randomSuffix}@abdm`,
      abhaNumber: `91-4422-9011-${randomSuffix}`,
      avatar: patientData.gender === 'Female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      medicalHistory: patientData.medicalHistory || [],
      labReports: patientData.labReports || [],
      surgeries: patientData.surgeries || [],
      pastMedications: patientData.pastMedications || [],
      activeToken: null,
      qrPayload: ''
    };

    // Encode offline-readable QR payload
    newPatient.qrPayload = generateOfflineQRPayload(newPatient);

    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newId);
    addAuditLog('REGISTER_PATIENT', 'patients', newPatientId, `New patient registered: ${newPatient.name} (Aadhaar: ${newPatient.aadhaarNumber}) with offline QR passport.`);

    // Automatically save to Firebase Firestore
    saveDocumentToFirestore('patients', newPatient.id, newPatient).catch(err => {
      console.warn('[Firebase] Background write warning for patient:', err);
    });

    return newPatient;
  };

  // 2. Book OPD Appointment & Issue Token
  const bookAppointment = (appointmentData) => {
    const aptNumber = appointments.length + 101;
    const tokenNo = generateUniqueTokenNumber(appointments.length + 1);
    
    // Calculate wait time
    const waitInfo = calculateWaitTime({
      userToken: tokenNo,
      currentServingToken: currentServingTokenNumber,
      averageConsultationMins: 5,
      triageLevel: appointmentData.triageLevel || 'Routine (Green)'
    });

    const newApt = {
      id: `tok-${Date.now()}`,
      appointmentId: `APT-2026-${aptNumber}`,
      tokenNumber: tokenNo,
      patientId: appointmentData.patientId,
      patientName: appointmentData.patientName,
      doctorId: appointmentData.doctorId || 'doc-1',
      doctorName: appointmentData.doctorName || 'Dr. Carlo Toledano',
      departmentId: appointmentData.departmentId || 'dept-1',
      deptName: appointmentData.deptName || 'General Medicine',
      slotTime: appointmentData.slotTime || '10:00 AM',
      date: appointmentData.date || new Date().toISOString().split('T')[0],
      status: 'Checked-In',
      tokenStatus: 'Waiting',
      triageLevel: appointmentData.triageLevel || 'Routine (Green)',
      symptomSummary: appointmentData.symptomSummary || 'Routine Consultation',
      checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      consultationStartedAt: null,
      estimatedWaitMins: waitInfo.estimatedWaitMins
    };

    // If critical, jump to top of queue!
    setAppointments(prev => {
      if (newApt.triageLevel.includes('Critical')) {
        return [newApt, ...prev];
      }
      return [...prev, newApt];
    });

    // Update patient active token
    setPatients(prev => prev.map(p => p.id === appointmentData.patientId ? { ...p, activeToken: tokenNo } : p));
    addAuditLog('ISSUE_TOKEN', 'tokens', tokenNo, `Issued ${tokenNo} for ${appointmentData.patientName} (${newApt.deptName})`);

    // Automatically store in Firebase Firestore
    saveDocumentToFirestore('appointments', newApt.id, newApt).catch(err => {
      console.warn('[Firebase] Background write warning for appointment:', err);
    });

    return newApt;
  };

  // 3. Update Token Queue Status
  const updateTokenStatus = (tokenId, newStatus) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === tokenId || apt.tokenNumber === tokenId) {
        const updated = { ...apt, tokenStatus: newStatus };
        if (newStatus === 'In Consultation' && !apt.consultationStartedAt) {
          updated.consultationStartedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const num = parseInt(apt.tokenNumber.replace(/\D/g, ''), 10);
          if (num) setCurrentServingTokenNumber(num);
        }
        // Save to Firebase
        saveDocumentToFirestore('appointments', updated.id, updated).catch(() => {});
        return updated;
      }
      return apt;
    }));
    addAuditLog('UPDATE_TOKEN_STATUS', 'tokens', tokenId, `Token status transitioned to "${newStatus}"`);
  };

  // 4. Trigger Emergency Code Red Escalation
  const triggerEmergencyAlert = ({ patientId, patientName, warningSigns, origin }) => {
    const alertCode = Math.floor(800 + Math.random() * 199);
    const alertId = `EMR-ALERT-${alertCode}`;

    const newAlert = {
      id: `alt-${Date.now()}`,
      alertId,
      patientId: patientId || 'Unknown',
      patientName: patientName || 'Emergency Patient',
      severity: 'Critical (Red)',
      warningSigns: warningSigns || 'Acute Chest Pain / Respiratory Distress',
      origin: origin || 'Triage Screener',
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledgedBy: null,
      acknowledgedAt: null,
      actionTaken: null
    };

    setEmergencyAlerts(prev => [newAlert, ...prev]);

    // Automatically prioritize patient in appointments queue (Queue Jump)
    setAppointments(prev => prev.map(apt => {
      if (apt.patientId === patientId || apt.patientName === patientName) {
        const updated = { ...apt, triageLevel: 'Critical (Red)', estimatedWaitMins: 1 };
        saveDocumentToFirestore('appointments', updated.id, updated).catch(() => {});
        return updated;
      }
      return apt;
    }));

    saveDocumentToFirestore('emergency_alerts', newAlert.id, newAlert).catch(() => {});
    addAuditLog('EMERGENCY_ESCALATION', 'alerts', alertId, `CRITICAL Code Red triggered: ${warningSigns} for ${patientName}`);
    return newAlert;
  };

  // 5. Acknowledge Emergency Alert
  const acknowledgeEmergencyAlert = (alertId, staffName, actionTaken) => {
    const timeNow = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEmergencyAlerts(prev => prev.map(a => {
      if (a.id === alertId || a.alertId === alertId) {
        const updated = {
          ...a,
          status: 'Acknowledged',
          acknowledgedBy: staffName || 'Emergency Duty Lead',
          acknowledgedAt: timeNow,
          actionTaken: actionTaken || 'Patient admitted to Resuscitation Bay; Attending immediately.'
        };
        saveDocumentToFirestore('emergency_alerts', updated.id, updated).catch(() => {});
        return updated;
      }
      return a;
    }));
    addAuditLog('ACKNOWLEDGE_ALERT', 'alerts', alertId, `Alert acknowledged by ${staffName}. Action: ${actionTaken}`);
  };

  // 6. Doctor Consultation & Digital Prescription
  const finalizeConsultation = ({ patientId, doctorId, diagnosis, notes, prescriptionItems, requestedTests, followUpDays }) => {
    const currentPatient = patients.find(p => p.id === patientId);
    const currentDoctor = SEED_DOCTORS.find(d => d.id === doctorId) || SEED_DOCTORS[0];
    const rxId = `RX-2026-${Math.floor(900 + Math.random() * 900)}`;

    const newPrescription = {
      id: `rx-${Date.now()}`,
      prescriptionId: rxId,
      patientId,
      patientName: currentPatient?.name || 'Patient',
      doctorId,
      doctorName: currentDoctor.name,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      status: 'Finalized',
      clinicianSigned: true,
      signedAt: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes,
      items: prescriptionItems
    };

    setPrescriptions(prev => [newPrescription, ...prev]);

    // Add to patient history
    const historyItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      provider: currentDoctor.name,
      type: 'In-Clinic',
      diagnosis,
      department: currentDoctor.deptName,
      notes: `${notes} ${requestedTests ? `[Ordered: ${requestedTests}]` : ''}`
    };

    // Create nurse medication tasks
    const newTasks = prescriptionItems.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      taskId: `TSK-${Math.floor(800 + Math.random() * 800)}`,
      patientId,
      patientName: currentPatient?.name || 'Patient',
      roomBed: 'Daycare Bed 02',
      medicineName: `${item.name} (${item.strength})`,
      dose: item.dose || '1 tablet',
      route: item.route || 'Oral',
      scheduledTime: idx % 2 === 0 ? '02:00 PM' : '08:00 PM',
      status: 'Pending',
      administeredBy: null,
      administeredAt: null,
      delayReason: null,
      doctorNotified: false
    }));

    setMedicationTasks(prev => [...newTasks, ...prev]);

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const updatedP = {
          ...p,
          medicalHistory: [historyItem, ...p.medicalHistory],
          activeToken: null
        };
        saveDocumentToFirestore('patients', updatedP.id, updatedP).catch(() => {});
        return updatedP;
      }
      return p;
    }));

    // Mark current appointment completed
    setAppointments(prev => prev.map(apt => {
      if (apt.patientId === patientId && apt.tokenStatus !== 'Completed') {
        const updatedApt = { ...apt, tokenStatus: 'Completed', status: 'Completed' };
        saveDocumentToFirestore('appointments', updatedApt.id, updatedApt).catch(() => {});
        return updatedApt;
      }
      return apt;
    }));

    // Save prescription and tasks to Firebase
    saveDocumentToFirestore('prescriptions', newPrescription.id, newPrescription).catch(() => {});
    newTasks.forEach(task => saveDocumentToFirestore('medication_tasks', task.id, task).catch(() => {}));

    addAuditLog('FINALIZE_PRESCRIPTION', 'prescriptions', rxId, `Prescription signed by ${currentDoctor.name} for ${currentPatient?.name} (Diagnosis: ${diagnosis})`);
    return newPrescription;
  };

  // 7. Nurse Medication Administration
  const administerMedication = (taskId, nurseName) => {
    const timeNow = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMedicationTasks(prev => prev.map(t => {
      if (t.id === taskId || t.taskId === taskId) {
        const updated = {
          ...t,
          status: 'Administered',
          administeredBy: nurseName || 'Duty Nurse RN',
          administeredAt: timeNow,
          delayReason: null
        };
        saveDocumentToFirestore('medication_tasks', updated.id, updated).catch(() => {});
        return updated;
      }
      return t;
    }));
    addAuditLog('ADMINISTER_MEDICATION', 'medications', taskId, `Administered by ${nurseName || 'Nurse'}`);
  };

  // 8. Nurse Delay / Missed Dose Recording
  const recordMissedDose = (taskId, status, reason, nurseName) => {
    setMedicationTasks(prev => prev.map(t => {
      if (t.id === taskId || t.taskId === taskId) {
        const updated = {
          ...t,
          status,
          delayReason: reason,
          administeredBy: nurseName || 'Duty Nurse RN',
          doctorNotified: true
        };
        saveDocumentToFirestore('medication_tasks', updated.id, updated).catch(() => {});
        return updated;
      }
      return t;
    }));
    addAuditLog('MEDICATION_DELAY_RECORDED', 'medications', taskId, `Status: ${status}, Reason: "${reason}", Clinician Notified.`);
  };

  // 9. Pharmacy Dispensing with atomic stock deduction
  const dispensePrescription = (prescriptionId, pharmacistName) => {
    const targetRx = prescriptions.find(p => p.id === prescriptionId || p.prescriptionId === prescriptionId);
    if (!targetRx) return { success: false, message: 'Prescription not found' };

    // Deduct stock for all items
    setInventory(prev => prev.map(invItem => {
      const matched = targetRx.items.find(i => 
        i.name.toLowerCase().includes(invItem.name.toLowerCase()) || 
        invItem.name.toLowerCase().includes(i.name.toLowerCase())
      );
      if (matched) {
        const qtyToDeduct = matched.quantity || 10;
        const newStock = Math.max(0, invItem.currentStock - qtyToDeduct);
        const updatedItem = {
          ...invItem,
          currentStock: newStock,
          status: newStock <= invItem.reorderLevel ? 'Low Stock' : 'In Stock'
        };
        saveDocumentToFirestore('inventory', updatedItem.id, updatedItem).catch(() => {});
        return updatedItem;
      }
      return invItem;
    }));

    // Update prescription status to Dispensed
    setPrescriptions(prev => prev.map(p => {
      if (p.id === prescriptionId || p.prescriptionId === prescriptionId) {
        const updatedRx = {
          ...p,
          status: 'Dispensed',
          dispensedBy: pharmacistName || 'Chief Pharmacist',
          dispensedAt: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        saveDocumentToFirestore('prescriptions', updatedRx.id, updatedRx).catch(() => {});
        return updatedRx;
      }
      return p;
    }));

    addAuditLog('DISPENSE_PRESCRIPTION', 'prescriptions', targetRx.prescriptionId, `Medicines dispensed by ${pharmacistName || 'Pharmacist'}. Stock updated.`);
    return { success: true };
  };

  // 10. Restock Medicine
  const restockMedicine = (medicineId, addQuantity, batchNo, expiryDate) => {
    setInventory(prev => prev.map(item => {
      if (item.id === medicineId) {
        const newStock = item.currentStock + parseInt(addQuantity, 10);
        const updated = {
          ...item,
          currentStock: newStock,
          batchNo: batchNo || item.batchNo,
          expiryDate: expiryDate || item.expiryDate,
          status: newStock > item.reorderLevel ? 'In Stock' : 'Low Stock',
        };
        saveDocumentToFirestore('inventory', updated.id, updated).catch(() => {});
        return updated;
      }
      return item;
    }));
    addAuditLog('RESTOCK_INVENTORY', 'inventory', medicineId, `Restocked +${addQuantity} units.`);
  };

  // 11. Bed Management & Transfer Bed Action
  const transferBed = (sourceBedId, targetBedId, transferReason) => {
    const sourceBed = beds.find(b => b.id === sourceBedId);
    const targetBed = beds.find(b => b.id === targetBedId);

    if (!sourceBed || !targetBed) {
      return { success: false, message: 'Invalid bed selection' };
    }
    if (targetBed.status !== 'available') {
      return { success: false, message: `Target bed ${targetBedId} is not available (${targetBed.status})` };
    }

    setBeds(prev => prev.map(b => {
      if (b.id === sourceBedId) {
        const updatedSource = {
          ...b,
          status: 'sanitizing',
          patientName: null,
          patientId: null,
          diagnosis: null,
          oxygen: null,
          admittedAt: null,
          cleanMinsLeft: 12
        };
        saveDocumentToFirestore('beds', updatedSource.id, updatedSource).catch(() => {});
        return updatedSource;
      }
      if (b.id === targetBedId) {
        const updatedTarget = {
          ...b,
          status: 'occupied',
          patientName: sourceBed.patientName,
          patientId: sourceBed.patientId,
          diagnosis: sourceBed.diagnosis,
          oxygen: sourceBed.oxygen,
          admittedAt: 'Just Transferred',
          doctor: sourceBed.doctor
        };
        saveDocumentToFirestore('beds', updatedTarget.id, updatedTarget).catch(() => {});
        return updatedTarget;
      }
      return b;
    }));

    addAuditLog('TRANSFER_BED', 'beds', `${sourceBedId} -> ${targetBedId}`, `Patient ${sourceBed.patientName} transferred from ${sourceBedId} to ${targetBedId}. Reason: ${transferReason || 'Clinical step-down/transfer'}`);
    return { success: true };
  };

  const updateBedStatus = (bedId, newStatus, extra = {}) => {
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        const updated = {
          ...b,
          status: newStatus,
          ...extra
        };
        saveDocumentToFirestore('beds', updated.id, updated).catch(() => {});
        return updated;
      }
      return b;
    }));
    addAuditLog('UPDATE_BED_STATUS', 'beds', bedId, `Bed status updated to ${newStatus}`);
  };

  // 12. User & Staff Management (Admin)
  const toggleUserActive = (uid) => {
    let updatedUser = null;
    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        updatedUser = { ...u, active: !u.active };
        return updatedUser;
      }
      return u;
    }));
    if (updatedUser) {
      saveDocumentToFirestore('users', uid, updatedUser).catch(() => {});
    }
    addAuditLog('TOGGLE_USER_STATUS', 'users', uid, 'User active status updated by administrator.');
  };

  const addStaffMember = (staffData) => {
    const newUid = `usr-${staffData.role || 'staff'}-${Date.now()}`;
    const newUser = {
      uid: newUid,
      displayName: staffData.displayName,
      role: staffData.role,
      departmentId: staffData.departmentId || null,
      email: staffData.email || `${staffData.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.org`,
      active: true,
      avatar: staffData.avatar || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80`
    };

    setUsers(prev => [newUser, ...prev]);

    // If role is doctor, also add to doctors state so appointment booking can use it
    if (staffData.role === 'doctor') {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: staffData.displayName.startsWith('Dr.') ? staffData.displayName : `Dr. ${staffData.displayName}`,
        deptName: staffData.deptName || 'General Medicine',
        specialty: staffData.specialty || 'General Practitioner',
        cabin: staffData.cabin || 'Cabin 104'
      };
      setDoctors(prev => [newDoc, ...prev]);
      saveDocumentToFirestore('doctors', newDoc.id, newDoc).catch(() => {});
    }

    saveDocumentToFirestore('users', newUser.uid, newUser).catch(() => {});
    addAuditLog('CREATE_STAFF_ACCOUNT', 'users', newUid, `Administrator added new ${staffData.role}: ${staffData.displayName}`);
    return newUser;
  };

  // 12b. Add Medication to Pharmacy Formulary (Admin & Pharmacist)
  const addInventoryMedicine = (medData) => {
    const newId = `med-${Date.now()}`;
    const currentStock = parseInt(medData.currentStock, 10) || 50;
    const reorderLevel = parseInt(medData.reorderLevel, 10) || 20;
    const newItem = {
      id: newId,
      name: medData.name,
      category: medData.category || 'Therapeutics & Formulary',
      currentStock,
      reorderLevel,
      unit: medData.unit || 'Tablets',
      batchNo: medData.batchNo || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: medData.expiryDate || '2028-12-31',
      status: currentStock > reorderLevel ? 'In Stock' : 'Low Stock',
      price: parseFloat(medData.price) || 45.00
    };

    setInventory(prev => [newItem, ...prev]);
    saveDocumentToFirestore('inventory', newItem.id, newItem).catch(() => {});
    addAuditLog('ADD_FORMULARY_ITEM', 'inventory', newItem.id, `New drug added to inventory: ${newItem.name}`);
    return newItem;
  };

  // 12c. Upload Diagnostic Scan / Lab Investigation (Doctor)
  const uploadLabReport = ({ patientId, testName, category, findings, fileName, fileData, doctorName, date }) => {
    const reportId = `lab-${Date.now()}`;
    const newReport = {
      id: reportId,
      patientId,
      testName,
      category: category || 'Diagnostic Radiology',
      findings: findings || 'Findings documented by clinical team.',
      date: date || new Date().toISOString().split('T')[0],
      doctorName: doctorName || 'Attending Physician',
      fileName: fileName || `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      fileData: fileData || null,
      status: 'Verified & Certified',
      uploadedAt: new Date().toISOString()
    };

    // Update patient lab reports array
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const updatedReports = [newReport, ...(p.labReports || [])];
        const updatedP = { ...p, labReports: updatedReports };
        saveDocumentToFirestore('patients', updatedP.id, updatedP).catch(() => {});
        return updatedP;
      }
      return p;
    }));

    // Save document in lab_reports collection as well
    saveDocumentToFirestore('lab_reports', newReport.id, newReport).catch(() => {});
    addAuditLog('UPLOAD_LAB_REPORT', 'lab_reports', reportId, `Doctor uploaded ${testName} (${category}) for patient ID ${patientId}`);
    return newReport;
  };

  // 13. Bulk Data Import & Store in Firebase Firestore
  const importHospitalData = async (parsedBundle, { clearExisting = true, syncToFirebase = true } = {}) => {
    setIsFirebaseSyncing(true);
    try {
      const newPatients = parsedBundle.data?.patients || parsedBundle.patients || [];
      const newAppointments = parsedBundle.data?.appointments || parsedBundle.appointments || [];
      const newPrescriptions = parsedBundle.data?.prescriptions || parsedBundle.prescriptions || [];
      const newInventory = parsedBundle.data?.inventory || parsedBundle.inventory || [];
      const newBeds = parsedBundle.data?.beds || parsedBundle.beds || [];

      if (clearExisting) {
        setPatients(newPatients);
        setAppointments(newAppointments);
        setPrescriptions(newPrescriptions);
        if (newInventory.length > 0) setInventory(newInventory);
        if (newBeds.length > 0) setBeds(newBeds);
        setEmergencyAlerts([]);
        setAuditLogs([]);
      } else {
        if (newPatients.length > 0) {
          setPatients(prev => {
            const existingIds = new Set(prev.map(p => p.patientId || p.id));
            const filtered = newPatients.filter(p => !existingIds.has(p.patientId || p.id));
            return [...filtered, ...prev];
          });
        }
        if (newAppointments.length > 0) {
          setAppointments(prev => [...newAppointments, ...prev]);
        }
        if (newPrescriptions.length > 0) {
          setPrescriptions(prev => [...newPrescriptions, ...prev]);
        }
      }

      if (newPatients.length > 0) {
        setSelectedPatientId(newPatients[0].id);
      }

      addAuditLog('IMPORT_DATA', 'system', 'BULK', `Imported ${newPatients.length} patient records into HSMS.`);

      let firebaseResult = null;
      if (syncToFirebase) {
        firebaseResult = await bulkImportToFirestore({
          patients: newPatients,
          appointments: newAppointments,
          prescriptions: newPrescriptions,
          inventory: newInventory.length > 0 ? newInventory : inventory,
          beds: newBeds.length > 0 ? newBeds : beds
        });

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem('hsms_last_firebase_sync', now);
        setFirebaseStatus(prev => ({
          ...prev,
          lastSyncedAt: now,
          syncMessage: firebaseResult.success ? `Successfully stored ${firebaseResult.count} records in Firebase Firestore!` : `Local saved. Firebase notice: ${firebaseResult.error}`
        }));
      }

      return {
        success: true,
        patientsCount: newPatients.length,
        appointmentsCount: newAppointments.length,
        firebaseResult
      };
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // 14. Completely Delete All Default & Mock Data
  const deleteDefaultData = async () => {
    setPatients([]);
    setAppointments([]);
    setPrescriptions([]);
    setMedicationTasks([]);
    setEmergencyAlerts([]);
    setAuditLogs([]);
    setInventory([]);
    setUsers([]);
    setBeds(CLEAN_BEDS);
    setSelectedPatientId('');

    localStorage.removeItem('hsms_patients');
    localStorage.removeItem('hsms_appointments');
    localStorage.removeItem('hsms_prescriptions');
    localStorage.removeItem('hsms_medicationTasks');
    localStorage.removeItem('hsms_emergencyAlerts');
    localStorage.removeItem('hsms_auditLogs');
    localStorage.removeItem('hsms_inventory');
    localStorage.removeItem('hsms_users');
    localStorage.removeItem('hsms_selectedPatientId');
    localStorage.setItem('hsms_beds', JSON.stringify(CLEAN_BEDS));
    localStorage.setItem('hsms_db_cleaned_v3', 'true');

    // Also clear Firebase Firestore so no default data remains
    if (isFirebaseConfigured()) {
      await clearAllFirestoreData().catch(e => console.warn('[Firebase] Clear error:', e));
    }

    addAuditLog('DELETE_ALL_DATA', 'system', 'ALL', 'All default demo and mock records completely deleted.');
  };

  // Reset Demo Data (Provides choice to wipe or restore sample)
  const resetDemoData = () => {
    deleteDefaultData();
  };

  // Push all local data to Firebase (only user-entered data)
  const syncAllDataToFirebase = async () => {
    setIsFirebaseSyncing(true);
    try {
      const occupiedOrModifiedBeds = beds.filter(b => b.status !== 'available' || b.patientId);
      const result = await bulkImportToFirestore({
        patients,
        appointments,
        prescriptions,
        medicationTasks,
        inventory,
        beds: occupiedOrModifiedBeds,
        users
      });

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('hsms_last_firebase_sync', now);
      setFirebaseStatus(prev => ({
        ...prev,
        lastSyncedAt: now,
        syncMessage: result.success ? `Synced ${result.count} records to Firebase Firestore.` : `Sync error: ${result.error}`
      }));
      return result;
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Wipe all collections in Firebase Firestore
  const wipeAllFirebaseData = async () => {
    setIsFirebaseSyncing(true);
    try {
      const result = await clearAllFirestoreData();
      if (result.success) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setFirebaseStatus(prev => ({
          ...prev,
          lastSyncedAt: now,
          syncMessage: `Cleared all collections in Firebase Firestore (${result.count} deleted).`
        }));
      }
      return result;
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Pull all data from Firebase
  const pullAllDataFromFirebase = async () => {
    setIsFirebaseSyncing(true);
    try {
      const res = await fetchAllFromFirestore();
      if (res.success && res.data) {
        if (res.data.patients?.length > 0) setPatients(res.data.patients);
        if (res.data.appointments?.length > 0) setAppointments(res.data.appointments);
        if (res.data.prescriptions?.length > 0) setPrescriptions(res.data.prescriptions);
        if (res.data.medicationTasks?.length > 0) setMedicationTasks(res.data.medicationTasks);
        if (res.data.inventory?.length > 0) setInventory(res.data.inventory);
        if (res.data.beds?.length > 0) setBeds(res.data.beds);
        return { success: true, count: res.data.patients?.length || 0 };
      }
      return { success: false, error: res.error };
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  const rawPatient = (patients.length > 0 && patients.find(p => p.id === selectedPatientId)) || patients[0] || EMPTY_PATIENT;
  const selectedPatient = normalizePatient(rawPatient);
  const activeEmergencyAlerts = emergencyAlerts.filter(a => a.status === 'Active');

  const translations = TRANSLATIONS[language] || TRANSLATIONS.en;
  const t = (key, fallback) => {
    return translations[key] || fallback || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <HospitalContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        language,
        setLanguage,
        t,
        translations,
        selectedPatientId,
        setSelectedPatientId,
        selectedDoctorId,
        setSelectedDoctorId,
        selectedPatient,
        patients,
        departments: SEED_DEPARTMENTS,
        doctors,
        setDoctors,
        appointments,
        prescriptions,
        medicationTasks,
        inventory,
        beds,
        emergencyAlerts,
        activeEmergencyAlerts,
        auditLogs,
        users,
        currentServingTokenNumber,
        setCurrentServingTokenNumber,
        isQRScannerOpen,
        setIsQRScannerOpen,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        isAadhaarModalOpen,
        setIsAadhaarModalOpen,
        activeBedModal,
        setActiveBedModal,
        isImportModalOpen,
        setIsImportModalOpen,
        isFirebaseModalOpen,
        setIsFirebaseModalOpen,
        isUploadReportModalOpen,
        setIsUploadReportModalOpen,
        isAddStaffModalOpen,
        setIsAddStaffModalOpen,
        isAddMedicineModalOpen,
        setIsAddMedicineModalOpen,
        isFirebaseSyncing,
        firebaseStatus,
        lookupPatientByAadhaar,
        registerPatient,
        bookAppointment,
        updateTokenStatus,
        triggerEmergencyAlert,
        acknowledgeEmergencyAlert,
        finalizeConsultation,
        uploadLabReport,
        administerMedication,
        recordMissedDose,
        dispensePrescription,
        restockMedicine,
        addInventoryMedicine,
        transferBed,
        updateBedStatus,
        toggleUserActive,
        addStaffMember,
        addAuditLog,
        resetDemoData,
        deleteDefaultData,
        importHospitalData,
        syncAllDataToFirebase,
        pullAllDataFromFirebase,
        wipeAllFirebaseData
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => useContext(HospitalContext);
