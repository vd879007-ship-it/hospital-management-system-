export const INITIAL_USERS = [
  {
    uid: 'usr-patient-01',
    displayName: 'Juan Miguel Fernandez Santos III',
    role: 'patient',
    departmentId: null,
    email: 'jmsantos@email.com',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-reception-01',
    displayName: 'Deepa Krishnan',
    role: 'receptionist',
    departmentId: 'dept-1',
    email: 'reception.desk1@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-triage-01',
    displayName: 'Sister Mary Joseph (Triage Lead)',
    role: 'triage_staff',
    departmentId: 'dept-5',
    email: 'triage.desk@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-doctor-01',
    displayName: 'Dr. Carlo Toledano',
    role: 'doctor',
    departmentId: 'dept-1',
    email: 'c.toledano@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-nurse-01',
    displayName: 'Nurse Geetha R., RN',
    role: 'nurse',
    departmentId: 'dept-1',
    email: 'geetha.nurse@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1594824813581-2244a53c9f7a?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-pharmacy-01',
    displayName: 'R. Anand, B.Pharm',
    role: 'pharmacist',
    departmentId: 'dept-1',
    email: 'pharmacy.lead@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-admin-01',
    displayName: 'Dr. R. Natarajan (Medical Superintendent)',
    role: 'admin',
    departmentId: 'dept-1',
    email: 'admin.superintendent@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    recipientUid: 'all',
    type: 'EMERGENCY_ALERT',
    title: '🚨 Critical Triage Escalation',
    message: 'Acute chest pain case routed to Resuscitation Bay 2.',
    timestamp: '10:18 AM',
    read: false,
    severity: 'critical'
  },
  {
    id: 'notif-2',
    recipientUid: 'usr-patient-01',
    type: 'TOKEN_CALLED',
    title: 'Routine Queue Token TK-101 Called',
    message: 'Dr. Carlo Toledano is ready to see you in Room 102.',
    timestamp: '10:05 AM',
    read: false,
    severity: 'info'
  },
  {
    id: 'notif-3',
    recipientUid: 'usr-patient-01',
    type: 'PRESCRIPTION_READY',
    title: 'Prescription Finalized',
    message: 'Your prescription RX-2026-901 has been signed and transmitted to Pharmacy Counter 2.',
    timestamp: '10:25 AM',
    read: true,
    severity: 'success'
  },
  {
    id: 'notif-4',
    recipientUid: 'all',
    type: 'INVENTORY_LOW',
    title: 'Low Stock Alert: Glyceryl Trinitrate SL',
    message: 'Current stock (14 bottles) has fallen below reorder threshold (25).',
    timestamp: '09:15 AM',
    read: false,
    severity: 'warning'
  }
];

export const INITIAL_TRIAGE_REVIEWS = [
  {
    id: 'trg-1',
    assessmentId: 'TRG-2026-081',
    patientId: 'pat-2',
    patientName: 'Muthuvel Pandian',
    language: 'ta',
    symptoms: 'நெஞ்சு வலி மற்றும் இடது கை வலி, அதிக வியர்வை (Severe chest pain & cold sweats)',
    duration: '45 mins',
    summary: 'Acute coronary syndrome / Myocardial infarction red flags identified via Tamil voice screening.',
    warningFlags: ['Chest Pain', 'Radiation', 'Diaphoresis'],
    urgencyFlag: 'Critical (Red)',
    reviewStatus: 'Escalated to Emergency',
    reviewedBy: 'Sister Mary Joseph (Triage RN)',
    createdAt: '2026-10-21 10:18 AM',
  },
  {
    id: 'trg-2',
    assessmentId: 'TRG-2026-082',
    patientId: 'pat-3',
    patientName: 'Priya Meenakshi',
    language: 'en',
    symptoms: 'High grade fever with chills and myalgia for 3 days',
    duration: '3 days',
    summary: 'Likely viral febrile illness. Hemodynamically stable. Requires General Medicine OPD evaluation and complete blood count.',
    warningFlags: [],
    urgencyFlag: 'Routine (Green)',
    reviewStatus: 'Routed to OPD',
    reviewedBy: 'Sister Mary Joseph (Triage RN)',
    createdAt: '2026-10-21 10:45 AM',
  }
];

export const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'General Medicine', nameTa: 'பொது மருத்துவம்', code: 'GEN', icon: 'Stethoscope' },
  { id: 'dept-2', name: 'Cardiology', nameTa: 'இதயவியல்', code: 'CARD', icon: 'HeartPulse' },
  { id: 'dept-3', name: 'Pediatrics', nameTa: 'குழந்தைகள் மருத்துவம்', code: 'PED', icon: 'Baby' },
  { id: 'dept-4', name: 'Orthopedics', nameTa: 'எலும்பியல்', code: 'ORTH', icon: 'Bone' },
  { id: 'dept-5', name: 'Emergency & Trauma', nameTa: 'அவசர சிகிச்சை பிரிவு', code: 'EMR', icon: 'AlertTriangle' },
  { id: 'dept-6', name: 'Pulmonology', nameTa: 'நுரையீரல் மருத்துவம்', code: 'PULM', icon: 'Wind' },
];

export const INITIAL_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Carlo Toledano',
    nameTa: 'டாக்டர் கார்லோ டோலிடானோ',
    departmentId: 'dept-1',
    deptName: 'General Medicine',
    specialty: 'Senior Consultant Physician',
    cabin: 'Room 102',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
    activePatientsCount: 14,
  },
  {
    id: 'doc-2',
    name: 'Dr. Kavitha Rajan',
    nameTa: 'டாக்டர் கவிதா ராஜன்',
    departmentId: 'dept-2',
    deptName: 'Cardiology',
    specialty: 'Chief Interventional Cardiologist',
    cabin: 'Room 205 (Cath Lab Wing)',
    avatar: 'https://images.unsplash.com/photo-1594824813581-2244a53c9f7a?w=150&auto=format&fit=crop&q=80',
    availableSlots: ['10:00 AM', '10:45 AM', '11:30 AM', '03:00 PM', '04:15 PM'],
    activePatientsCount: 18,
  },
  {
    id: 'doc-3',
    name: 'Dr. S. Sundaram',
    nameTa: 'டாக்டர் எஸ். சுந்தரம்',
    departmentId: 'dept-4',
    deptName: 'Orthopedics',
    specialty: 'Orthopedic & Joint Surgeon',
    cabin: 'Room 108',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    availableSlots: ['09:15 AM', '10:15 AM', '12:00 PM', '02:30 PM'],
    activePatientsCount: 11,
  },
  {
    id: 'doc-4',
    name: 'Dr. Ananya Sharma',
    nameTa: 'டாக்டர் அனன்யா சர்மா',
    departmentId: 'dept-3',
    deptName: 'Pediatrics',
    specialty: 'Pediatric Specialist',
    cabin: 'Room 104',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    availableSlots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
    activePatientsCount: 9,
  },
  {
    id: 'doc-5',
    name: 'Dr. Arun Kumar (Emergency)',
    nameTa: 'டாக்டர் அருண் குமார் (அவசர பிரிவு)',
    departmentId: 'dept-5',
    deptName: 'Emergency & Trauma',
    specialty: 'Emergency Medicine Specialist',
    cabin: 'Resuscitation Bay 1',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    availableSlots: ['On-Duty 24x7 Triage'],
    activePatientsCount: 6,
  }
];

export const INITIAL_PATIENTS = [
  {
    id: 'pat-1',
    patientId: 'HSP-2026-1234',
    name: 'Juan Miguel Fernandez Santos III',
    nameTa: 'ஜுவான் மிகுவல் பெர்னாண்டஸ்',
    gender: 'Male',
    age: 34,
    dateOfBirth: '1991-01-01',
    bloodType: 'O+',
    mobile: '+91 98401 23456',
    email: 'jmsantos@email.com',
    address: '14/B Anna Nagar West, Chennai',
    emergencyContact: {
      name: 'Maria Santos (Spouse)',
      phone: '+91 98401 99887',
      relationship: 'Spouse',
    },
    allergies: ['Aspirin', 'Shrimp', 'Amoxicillin'],
    vitals: {
      temperature: '36.8 °C',
      bloodPressure: '105/75 mmHg',
      pulseRate: '75 bpm',
      respiratoryRate: '18 bpm',
      spo2: '99%',
      height: '168 cm',
      weight: '56.85 kg',
      lastUpdated: 'Aug 31, 2026'
    },
    nationalId: 'PHIL-733-4df',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    qrTokenRef: 'QR-HSP-2026-1234-SECURE-V4',
    medicalHistory: [
      {
        id: 'hist-1',
        date: 'Aug 31, 2026',
        provider: 'Dr. Carlo Toledano',
        type: 'Teleconsult',
        diagnosis: 'Acute Upper Respiratory Tract Infection',
        department: 'General Medicine',
        notes: 'Mild cough and pharyngitis. Prescribed Azithromycin and Paracetamol. Follow up in 5 days.'
      },
      {
        id: 'hist-2',
        date: 'Aug 08, 2026',
        provider: 'Dr. Cai Salcedo',
        type: 'In-Clinic',
        diagnosis: 'Urinary Tract Infection (UTI)',
        department: 'General Medicine',
        notes: 'Urine routine showed pus cells. Completed 7 days antibiotic course. Resolved.'
      },
      {
        id: 'hist-3',
        date: 'Jul 25, 2026',
        provider: 'Dr. Carlo Toledano',
        type: 'Surgery',
        diagnosis: 'Gastroenteritis (Mild Dehydration)',
        department: 'General Medicine',
        notes: 'IV fluid hydration given at daycare. Electrolytes stabilized.'
      }
    ],
    labReports: [
      { id: 'lab-1', test: 'Complete Blood Count (CBC)', date: 'Aug 31, 2026', result: 'Normal (Hb: 14.2 g/dL, WBC: 7,200)', status: 'Verified' },
      { id: 'lab-2', test: 'Fast Plasma Glucose', date: 'Jul 25, 2026', result: '94 mg/dL (Normal)', status: 'Verified' }
    ],
    activeToken: null,
  },
  {
    id: 'pat-2',
    patientId: 'HSP-2026-8842',
    name: 'Muthuvel Pandian',
    nameTa: 'முத்துவேல் பாண்டியன்',
    gender: 'Male',
    age: 58,
    dateOfBirth: '1968-05-14',
    bloodType: 'B+',
    mobile: '+91 94441 55667',
    email: 'muthuvel.p@chennaimail.com',
    address: '42 Gandhi Road, T. Nagar, Chennai',
    emergencyContact: {
      name: 'Selvi Pandian',
      phone: '+91 94441 99001',
      relationship: 'Wife',
    },
    allergies: ['Penicillin', 'Sulfa Drugs'],
    vitals: {
      temperature: '37.1 °C',
      bloodPressure: '142/92 mmHg',
      pulseRate: '88 bpm',
      respiratoryRate: '20 bpm',
      spo2: '96%',
      height: '172 cm',
      weight: '78.2 kg',
      lastUpdated: 'Oct 20, 2026'
    },
    nationalId: 'TN-AADHAR-9821',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    qrTokenRef: 'QR-HSP-2026-8842-SECURE-V4',
    medicalHistory: [
      {
        id: 'hist-21',
        date: 'Oct 12, 2026',
        provider: 'Dr. Kavitha Rajan',
        type: 'In-Clinic',
        diagnosis: 'Stage 1 Hypertension & Angina Evaluation',
        department: 'Cardiology',
        notes: 'Complained of exertion chest tightness. Advised resting ECG and lipid panel.'
      }
    ],
    labReports: [
      { id: 'lab-21', test: 'Lipid Profile', date: 'Oct 14, 2026', result: 'Total Cholesterol: 215 mg/dL (Elevated)', status: 'Verified' }
    ],
    activeToken: 'TK-103',
  },
  {
    id: 'pat-3',
    patientId: 'HSP-2026-5519',
    name: 'Priya Meenakshi',
    nameTa: 'பிரியா மீனாட்சி',
    gender: 'Female',
    age: 28,
    dateOfBirth: '1998-09-22',
    bloodType: 'A+',
    mobile: '+91 98840 11223',
    email: 'priya.m@techcorp.in',
    address: '88 OMR IT Highway, Sholinganallur, Chennai',
    emergencyContact: {
      name: 'Rajesh Meenakshi',
      phone: '+91 98840 99443',
      relationship: 'Brother',
    },
    allergies: ['None known'],
    vitals: {
      temperature: '38.4 °C',
      bloodPressure: '110/70 mmHg',
      pulseRate: '92 bpm',
      respiratoryRate: '19 bpm',
      spo2: '98%',
      height: '162 cm',
      weight: '54.0 kg',
      lastUpdated: 'Oct 21, 2026'
    },
    nationalId: 'TN-AADHAR-3341',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    qrTokenRef: 'QR-HSP-2026-5519-SECURE-V4',
    medicalHistory: [],
    labReports: [],
    activeToken: 'TK-104',
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-1',
    appointmentId: 'APT-2026-001',
    patientId: 'pat-1',
    patientName: 'Juan Miguel Fernandez Santos III',
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlo Toledano',
    departmentId: 'dept-1',
    deptName: 'General Medicine',
    slotTime: '10:00 AM',
    date: '2026-10-21',
    status: 'Checked-In',
    tokenNumber: 'TK-101',
    tokenStatus: 'In Consultation',
    triageLevel: 'Routine (Green)',
    symptomSummary: 'Follow-up for seasonal allergic cough and throat tickle.',
    checkedInAt: '09:40 AM',
    consultationStartedAt: '10:05 AM',
  },
  {
    id: 'apt-2',
    appointmentId: 'APT-2026-002',
    patientId: 'pat-2',
    patientName: 'Muthuvel Pandian',
    doctorId: 'doc-2',
    doctorName: 'Dr. Kavitha Rajan',
    departmentId: 'dept-2',
    deptName: 'Cardiology',
    slotTime: '10:45 AM',
    date: '2026-10-21',
    status: 'Checked-In',
    tokenNumber: 'TK-103',
    tokenStatus: 'Waiting',
    triageLevel: 'Priority (Yellow)',
    symptomSummary: 'Tamil voice screening: நெஞ்சு பாரம், நடக்கும்போது மூச்சுத்திணறல் (Chest heaviness on walking)',
    checkedInAt: '10:20 AM',
    consultationStartedAt: null,
  },
  {
    id: 'apt-3',
    appointmentId: 'APT-2026-003',
    patientId: 'pat-3',
    patientName: 'Priya Meenakshi',
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlo Toledano',
    departmentId: 'dept-1',
    deptName: 'General Medicine',
    slotTime: '11:30 AM',
    date: '2026-10-21',
    status: 'Booked',
    tokenNumber: 'TK-104',
    tokenStatus: 'Waiting',
    triageLevel: 'Routine (Green)',
    symptomSummary: '3-day persistent fever (38.4°C), chills, and body aches.',
    checkedInAt: '10:50 AM',
    consultationStartedAt: null,
  }
];

export const INITIAL_PRESCRIPTIONS = [
  {
    id: 'rx-1',
    prescriptionId: 'RX-2026-901',
    patientId: 'pat-1',
    patientName: 'Juan Miguel Fernandez Santos III',
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlo Toledano',
    date: '2026-10-21',
    diagnosis: 'Acute Bronchitis & Pharyngitis',
    status: 'Finalized', // Finalized, Dispensed
    clinicianSigned: true,
    signedAt: '2026-10-21 10:25 AM',
    notes: 'Hydrate well, avoid cold drinks, steam inhalation twice daily.',
    items: [
      {
        medicineId: 'med-1',
        name: 'Amoxicillin + Clavulanate (Augmentin)',
        strength: '625 mg',
        dose: '1 tablet',
        frequency: '1-0-1 (Twice Daily)',
        duration: '5 Days',
        route: 'Oral (After Food)',
        quantity: 10,
        instructions: 'Complete full course even if feeling better.'
      },
      {
        medicineId: 'med-2',
        name: 'Paracetamol (Dolo 650)',
        strength: '650 mg',
        dose: '1 tablet',
        frequency: '1-0-1 (SOS / When fever > 38°C)',
        duration: '3 Days',
        route: 'Oral (After Food)',
        quantity: 6,
        instructions: 'Maintain 6 hour gap between tablets.'
      },
      {
        medicineId: 'med-3',
        name: 'Levocetirizine',
        strength: '5 mg',
        dose: '1 tablet',
        frequency: '0-0-1 (Night only)',
        duration: '5 Days',
        route: 'Oral (Bedtime)',
        quantity: 5,
        instructions: 'May cause mild drowsiness.'
      }
    ]
  }
];

export const INITIAL_MEDICATION_TASKS = [
  {
    id: 'task-1',
    taskId: 'TSK-801',
    patientId: 'pat-1',
    patientName: 'Juan Miguel Fernandez Santos III',
    roomBed: 'Daycare Bed 04',
    medicineName: 'Paracetamol IV Infusion',
    dose: '1000 mg (100ml)',
    route: 'IV Infusion over 20 mins',
    scheduledTime: '11:00 AM',
    status: 'Pending', // Pending, Administered, Delayed, Missed
    administeredBy: null,
    administeredAt: null,
    delayReason: null,
    doctorNotified: false
  },
  {
    id: 'task-2',
    taskId: 'TSK-802',
    patientId: 'pat-2',
    patientName: 'Muthuvel Pandian',
    roomBed: 'Cardio Observation Bed 02',
    medicineName: 'Aspirin Soluble (Ecosprin)',
    dose: '75 mg',
    route: 'Oral (Sublingual)',
    scheduledTime: '10:30 AM',
    status: 'Administered',
    administeredBy: 'Nurse Geetha R., RN',
    administeredAt: '2026-10-21 10:32 AM',
    delayReason: null,
    doctorNotified: false
  },
  {
    id: 'task-3',
    taskId: 'TSK-803',
    patientId: 'pat-2',
    patientName: 'Muthuvel Pandian',
    roomBed: 'Cardio Observation Bed 02',
    medicineName: 'Atorvastatin (Lipitor)',
    dose: '40 mg',
    route: 'Oral (Night)',
    scheduledTime: '09:00 PM',
    status: 'Pending',
    administeredBy: null,
    administeredAt: null,
    delayReason: null,
    doctorNotified: false
  },
  {
    id: 'task-4',
    taskId: 'TSK-804',
    patientId: 'pat-3',
    patientName: 'Priya Meenakshi',
    roomBed: 'OPD Injection Room',
    medicineName: 'Ceftriaxone IV',
    dose: '1 gm in 100ml NS',
    route: 'IV Slow',
    scheduledTime: '09:30 AM',
    status: 'Delayed',
    administeredBy: 'Nurse Saravanan M.',
    administeredAt: null,
    delayReason: 'Patient at Radiology for Chest X-Ray; scheduled dose postponed safely.',
    doctorNotified: true
  }
];

export const INITIAL_INVENTORY = [
  {
    id: 'med-1',
    name: 'Amoxicillin + Clavulanate (Augmentin)',
    generic: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    category: 'Antibiotic',
    batchNo: 'AUG-2026-09A',
    expiryDate: '2027-08-31',
    currentStock: 142,
    unit: 'Tablets',
    reorderLevel: 50,
    unitPrice: 24.50,
    status: 'In Stock'
  },
  {
    id: 'med-2',
    name: 'Paracetamol (Dolo 650)',
    generic: 'Paracetamol 650mg',
    category: 'Antipyretic / Analgesic',
    batchNo: 'DOL-2026-44B',
    expiryDate: '2028-01-15',
    currentStock: 480,
    unit: 'Tablets',
    reorderLevel: 100,
    unitPrice: 3.20,
    status: 'In Stock'
  },
  {
    id: 'med-3',
    name: 'Levocetirizine 5mg',
    generic: 'Levocetirizine Dihydrochloride',
    category: 'Antihistamine',
    batchNo: 'LVO-2025-11C',
    expiryDate: '2026-11-30', // Near expiry
    currentStock: 28,
    unit: 'Tablets',
    reorderLevel: 40,
    unitPrice: 6.80,
    status: 'Low Stock'
  },
  {
    id: 'med-4',
    name: 'Atorvastatin 40mg (Lipitor)',
    generic: 'Atorvastatin Calcium',
    category: 'Cardiovascular / Statin',
    batchNo: 'ATV-2026-88F',
    expiryDate: '2027-12-10',
    currentStock: 85,
    unit: 'Tablets',
    reorderLevel: 30,
    unitPrice: 18.00,
    status: 'In Stock'
  },
  {
    id: 'med-5',
    name: 'Glyceryl Trinitrate (Nitroglycerin SL 0.5mg)',
    generic: 'Nitroglycerin Sublingual',
    category: 'Emergency Cardiac',
    batchNo: 'GTN-2026-02E',
    expiryDate: '2027-04-20',
    currentStock: 14,
    unit: 'Bottles',
    reorderLevel: 25,
    unitPrice: 110.00,
    status: 'Low Stock'
  },
  {
    id: 'med-6',
    name: 'Adrenaline Injection (1:1000)',
    generic: 'Epinephrine 1mg/ml',
    category: 'Emergency Resuscitation',
    batchNo: 'ADR-2026-19X',
    expiryDate: '2027-02-28',
    currentStock: 42,
    unit: 'Ampoules',
    reorderLevel: 20,
    unitPrice: 45.00,
    status: 'In Stock'
  }
];

export const INITIAL_EMERGENCY_ALERTS = [
  {
    id: 'alt-1',
    alertId: 'EMR-ALERT-409',
    patientId: 'pat-2',
    patientName: 'Muthuvel Pandian (58M)',
    severity: 'Critical (Red)',
    warningSigns: 'Acute Central Chest Pain, Radiation to Left Jaw, Diaphoresis (Profuse Sweating)',
    origin: 'Triage Screener (Tamil Voice Input)',
    status: 'Acknowledged', // Active, Acknowledged, Resolved
    createdAt: '2026-10-21 10:18 AM',
    acknowledgedBy: 'Dr. Arun Kumar (Emergency Lead)',
    acknowledgedAt: '2026-10-21 10:20 AM', // 2 mins response time!
    actionTaken: 'Patient redirected directly to Cath Lab Resus Bay 2; STAT ECG & Troponin I ordered.',
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-10-21 09:30:12',
    actorUid: 'usr-reception-01',
    actorName: 'Reception Desk 1 (Deepa K.)',
    role: 'Receptionist',
    action: 'REGISTER_PATIENT',
    resourceType: 'patients',
    resourceId: 'HSP-2026-5519',
    details: 'New patient registered: Priya Meenakshi, QR health card generated.'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-21 09:40:45',
    actorUid: 'usr-reception-01',
    actorName: 'Reception Desk 1 (Deepa K.)',
    role: 'Receptionist',
    action: 'ISSUE_TOKEN',
    resourceType: 'appointments',
    resourceId: 'TK-101',
    details: 'Checked in Juan Miguel Santos for General Medicine with Dr. Carlo Toledano.'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-21 10:18:22',
    actorUid: 'sys-triage-screener',
    actorName: 'Multilingual Triage Engine',
    role: 'Triage Engine',
    action: 'EMERGENCY_TRIGGERED',
    resourceType: 'alerts',
    resourceId: 'EMR-ALERT-409',
    details: 'Critical warning signs detected via Tamil voice screening for Muthuvel Pandian.'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-21 10:20:05',
    actorUid: 'doc-5',
    actorName: 'Dr. Arun Kumar',
    role: 'Doctor',
    action: 'ACKNOWLEDGE_ALERT',
    resourceType: 'alerts',
    resourceId: 'EMR-ALERT-409',
    details: 'Alert acknowledged within 1m 43s; Cath Lab Bay 2 activated.'
  },
  {
    id: 'log-5',
    timestamp: '2026-10-21 10:25:50',
    actorUid: 'doc-1',
    actorName: 'Dr. Carlo Toledano',
    role: 'Doctor',
    action: 'FINALIZE_PRESCRIPTION',
    resourceType: 'prescriptions',
    resourceId: 'RX-2026-901',
    details: 'Digital prescription signed and locked for Juan Miguel Santos.'
  },
  {
    id: 'log-6',
    timestamp: '2026-10-21 10:32:10',
    actorUid: 'nurse-02',
    actorName: 'Nurse Geetha R., RN',
    role: 'Nurse',
    action: 'ADMINISTER_MEDICATION',
    resourceType: 'medicationTasks',
    resourceId: 'TSK-802',
    details: 'Administered Aspirin 75mg to Muthuvel Pandian at Bed 02.'
  }
];

export const INITIAL_DISCHARGES = [
  {
    id: 'dis-1',
    patientId: 'pat-1',
    dischargeDate: '2026-10-21',
    treatingDoctor: 'Dr. Carlo Toledano',
    summary: 'Treated for acute upper respiratory infection and pharyngitis. Hemodynamically stable, afebrile for 24h.',
    instructions: [
      'Take prescribed medications regularly as per schedule.',
      'Steam inhalation twice daily for 5 days.',
      'Warm saline gargle thrice daily.',
      'Return immediately if breathlessness, high fever or chest pain develops.'
    ],
    followUpAt: '2026-10-28',
    approvedBy: 'Dr. Carlo Toledano (Reg. 88392)'
  }
];
