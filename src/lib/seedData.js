import { generateOfflineQRPayload } from './utils.js';

/**
 * Synthetic Seed Data for Hospital Smart Management System (HSMS)
 * Team MediTechTitans
 * Contains ~30 fake patients, 32 beds, 40 medicines, sample tokens & records.
 * 100% synthetic data for competition & demonstration purposes.
 */

// 1. Seven Demo Users (One per role)
export const SEED_USERS = [
  {
    uid: 'usr-patient-01',
    displayName: 'Thirunavukkarasu Muthukumar',
    role: 'patient',
    departmentId: null,
    email: 'patient.demo@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-reception-01',
    displayName: 'Deepa Krishnan',
    role: 'reception',
    departmentId: 'dept-1',
    email: 'reception.desk@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-triage-01',
    displayName: 'Sister Mary Joseph (Triage RN)',
    role: 'triage_staff',
    departmentId: 'dept-5',
    email: 'triage.desk@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-doctor-01',
    displayName: 'Dr. Carlo Toledano, MD',
    role: 'doctor',
    departmentId: 'dept-1',
    email: 'doctor.opd@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr-nurse-01',
    displayName: 'Nurse Geetha R., RN',
    role: 'nurse',
    departmentId: 'dept-1',
    email: 'nurse.ward@hospital.org',
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
    displayName: 'Dr. R. Natarajan (Medical Director)',
    role: 'admin',
    departmentId: 'dept-1',
    email: 'director.admin@hospital.org',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

// 2. Departments
export const SEED_DEPARTMENTS = [
  { id: 'dept-1', name: 'General Medicine', nameTa: 'பொது மருத்துவம்', code: 'GEN', icon: 'Stethoscope' },
  { id: 'dept-2', name: 'Cardiology', nameTa: 'இதயவியல்', code: 'CARD', icon: 'HeartPulse' },
  { id: 'dept-3', name: 'Pediatrics', nameTa: 'குழந்தைகள் மருத்துவம்', code: 'PED', icon: 'Baby' },
  { id: 'dept-4', name: 'Orthopedics', nameTa: 'எலும்பியல்', code: 'ORTH', icon: 'Bone' },
  { id: 'dept-5', name: 'Emergency & Trauma', nameTa: 'அவசர சிகிச்சை பிரிவு', code: 'EMR', icon: 'AlertTriangle' },
  { id: 'dept-6', name: 'Pulmonology', nameTa: 'நுரையீரல் மருத்துவம்', code: 'PULM', icon: 'Wind' },
];

// 3. Doctors
export const SEED_DOCTORS = [
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

// Helper to generate ~30 fake patients
const rawPatientNames = [
  { en: 'Thirunavukkarasu Muthukumar', ta: 'திருநாவுக்கரசு முத்துக்குமார்', g: 'Male', age: 34, b: 'O+', al: ['Aspirin', 'Amoxicillin'] },
  { en: 'Muthuvel Pandian', ta: 'முத்துவேல் பாண்டியன்', g: 'Male', age: 58, b: 'B+', al: ['Penicillin', 'Sulfa Drugs'] },
  { en: 'Priya Meenakshi', ta: 'பிரியா மீனாட்சி', g: 'Female', age: 28, b: 'A+', al: [] },
  { en: 'Arumugam Senthil', ta: 'ஆறுமுகம் செந்தில்', g: 'Male', age: 49, b: 'O-', al: ['Ciprofloxacin'] },
  { en: 'Kavitha Balakrishnan', ta: 'கவிதா பாலகிருஷ்ணன்', g: 'Female', age: 38, b: 'B-', al: [] },
  { en: 'Rajesh Kannan', ta: 'ராஜேஷ் கண்ணன்', g: 'Male', age: 42, b: 'AB+', al: ['Ibuprofen'] },
  { en: 'Anitha Subramaniam', ta: 'அனிதா சுப்ரமணியம்', g: 'Female', age: 31, b: 'A-', al: [] },
  { en: 'Murugan Sundaram', ta: 'முருகன் சுந்தரம்', g: 'Male', age: 64, b: 'B+', al: ['Penicillin'] },
  { en: 'Selvi Rajendran', ta: 'செல்வி ராஜேந்திரன்', g: 'Female', age: 53, b: 'O+', al: [] },
  { en: 'Sathish Kumar', ta: 'சதீஷ் குமார்', g: 'Male', age: 25, b: 'A+', al: [] },
  { en: 'Deepika Raman', ta: 'தீபிகா ராமன்', g: 'Female', age: 22, b: 'B+', al: [] },
  { en: 'Karthik Raja', ta: 'கார்த்திக் ராஜா', g: 'Male', age: 39, b: 'O+', al: ['Diclofenac'] },
  { en: 'Lakshmi Narayanan', ta: 'லட்சுமி நாராயணன்', g: 'Male', age: 67, b: 'A+', al: ['Sulfa'] },
  { en: 'Shanthi Venkatesh', ta: 'சாந்தி வெங்கடேஷ்', g: 'Female', age: 46, b: 'B+', al: [] },
  { en: 'Ganesh Moorthy', ta: 'கணேஷ் மூர்த்தி', g: 'Male', age: 33, b: 'AB-', al: [] },
  { en: 'Meera Vijayakumar', ta: 'மீரா விஜயகுமார்', g: 'Female', age: 29, b: 'O+', al: [] },
  { en: 'Saravanan Perumal', ta: 'சரவணன் பெருமாள்', g: 'Male', age: 51, b: 'B+', al: [] },
  { en: 'Vasantha Kumari', ta: 'வசந்தா குமாரி', g: 'Female', age: 60, b: 'A+', al: ['Penicillin'] },
  { en: 'Dinesh Balan', ta: 'தினேஷ் பாலன்', g: 'Male', age: 27, b: 'O+', al: [] },
  { en: 'Revathi Chandran', ta: 'ரேவதி சந்திரன்', g: 'Female', age: 36, b: 'B-', al: [] },
  { en: 'Senthil Velan', ta: 'செந்தில் வேலன்', g: 'Male', age: 44, b: 'A+', al: [] },
  { en: 'Bhuvaneshwari K.', ta: 'புவனேஸ்வரி கே.', g: 'Female', age: 50, b: 'O-', al: ['Aspirin'] },
  { en: 'Manikandan R.', ta: 'மணிகண்டன் ஆர்.', g: 'Male', age: 30, b: 'B+', al: [] },
  { en: 'Pavithra Natarajan', ta: 'பவித்ரா நடராஜன்', g: 'Female', age: 26, b: 'AB+', al: [] },
  { en: 'Vijayan Ramasamy', ta: 'விஜயன் ராமசாமி', g: 'Male', age: 62, b: 'A+', al: [] },
  { en: 'Sangeetha Mohan', ta: 'சங்கீதா மோகன்', g: 'Female', age: 35, b: 'O+', al: [] },
  { en: 'Prabhu Devan', ta: 'பிரபு தேவன்', g: 'Male', age: 40, b: 'B+', al: [] },
  { en: 'Gayathri Sridhar', ta: 'காயத்ரி ஸ்ரீதர்', g: 'Female', age: 32, b: 'A-', al: [] },
  { en: 'Mohan Doss', ta: 'மோகன் தாஸ்', g: 'Male', age: 55, b: 'O+', al: [] },
  { en: 'Baby Kaviya (Pediatric)', ta: 'பேபி காவியா', g: 'Female', age: 4, b: 'B+', al: [] },
];

export const SEED_PATIENTS = rawPatientNames.map((p, index) => {
  const num = 1001 + index;
  const patientId = `HSP-2026-${num}`;
  const id = `pat-${index + 1}`;
  const dobYear = 2026 - p.age;
  const tempPatient = {
    id,
    patientId,
    name: p.en,
    nameTa: p.ta,
    gender: p.g,
    age: p.age,
    dateOfBirth: `${dobYear}-05-15`,
    bloodType: p.b,
    mobile: `+91 9444${10000 + index}`,
    email: `${p.en.toLowerCase().replace(/[^a-z]/g, '')}@meditech.fake`,
    address: `${index + 12}, Anna Salai, Chennai, Tamil Nadu`,
    emergencyContact: {
      name: `${p.en.split(' ')[0]} Family`,
      phone: `+91 9884${20000 + index}`,
      relationship: p.age < 18 ? 'Parent' : 'Spouse'
    },
    allergies: p.al.length > 0 ? p.al : ['None known'],
    vitals: {
      temperature: index === 1 ? '38.6 °C' : '36.8 °C',
      bloodPressure: index === 1 ? '148/96 mmHg' : '120/80 mmHg',
      pulseRate: index === 1 ? '98 bpm' : '74 bpm',
      respiratoryRate: '18 bpm',
      spo2: index === 1 ? '94%' : '99%',
      height: '168 cm',
      weight: '64.5 kg',
      lastUpdated: 'Today'
    },
    nationalId: `IND-ABHA-${num}`,
    aadhaarNumber: `45${String(index + 10).padStart(2, '0')} 88${String(index + 20).padStart(2, '0')} ${String(index + 1000).padStart(4, '0')}`,
    abhaAddress: `${p.en.toLowerCase().split(' ')[0]}.${num}@abdm`,
    abhaNumber: `91-4422-9011-${num}`,
    avatar: p.g === 'Female'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    medicalHistory: [
      {
        id: `hist-${index}-1`,
        date: 'Oct 10, 2026',
        hospital: 'MediTech Titans Hospital (Chennai)',
        provider: 'Dr. Carlo Toledano, MD',
        type: 'In-Clinic Outpatient',
        diagnosis: index === 1 ? 'Hypertension Stage 2' : 'Upper Respiratory Infection',
        department: 'General Medicine',
        notes: 'Routine clinical evaluation. Advised lifestyle modifications and medication compliance.'
      },
      {
        id: `hist-${index}-2`,
        date: 'Jul 14, 2025',
        hospital: 'Apollo Main Hospital (Greams Road, Chennai)',
        provider: 'Dr. V. Ramachandran, FRCS',
        type: 'Specialist Consultation',
        diagnosis: index % 2 === 0 ? 'Type 2 Diabetes Mellitus' : 'Allergic Bronchitis',
        department: 'Internal Medicine',
        notes: 'Reviewed glycemic and pulmonary status. Standard oral therapy initiated.'
      },
      {
        id: `hist-${index}-3`,
        date: 'Nov 02, 2024',
        hospital: 'Rajiv Gandhi Government General Hospital (GH Chennai)',
        provider: 'Dr. K. Senthil Nathan, MS',
        type: 'Emergency / Daycare',
        diagnosis: 'Acute Gastroenteritis & Dehydration',
        department: 'Emergency & Trauma',
        notes: 'IV fluid resuscitation and antiemetics administered. Discharged afebrile.'
      }
    ],
    surgeries: [
      ...(index % 3 === 0 ? [{
        id: `surg-${index}-1`,
        surgeryName: 'Laparoscopic Cholecystectomy (பித்தப்பை அறுவை சிகிச்சை)',
        date: 'Feb 18, 2023',
        hospital: 'Apollo Main Hospital (Chennai)',
        surgeon: 'Dr. K. Jayaraman, MS, MCh',
        type: 'Elective Minimally Invasive Surgery',
        indication: 'Symptomatic Cholelithiasis (Gallstones)',
        outcome: 'Uneventful recovery. Histopathology benign.',
        implantsUsed: 'Titanium Hem-o-lok clips'
      }] : []),
      ...(index === 1 ? [{
        id: `surg-${index}-2`,
        surgeryName: 'Percutaneous Coronary Intervention / Drug-Eluting Stent (இதய ஸ்டென்ட்)',
        date: 'Aug 22, 2024',
        hospital: 'Madras Medical Mission (MMM Chennai)',
        surgeon: 'Dr. S. Mullasari, DM (Cardio)',
        type: 'Emergency Cardiac Catheterization',
        indication: 'Coronary Artery Disease (LAD 85% Stenosis)',
        outcome: 'Resolute Onyx 3.0x24mm Stent deployed. TIMI-3 Flow restored.',
        implantsUsed: 'Medtronic Resolute Onyx DES'
      }] : []),
      ...(index % 4 === 1 ? [{
        id: `surg-${index}-3`,
        surgeryName: 'Open Reduction & Internal Fixation - Left Wrist (எலும்பு முறிவு அறுவை சிகிச்சை)',
        date: 'Oct 05, 2022',
        hospital: 'Government Multi Super Speciality Hospital (Omandurar, Chennai)',
        surgeon: 'Dr. M. Soundararajan, MS (Ortho)',
        type: 'Trauma Orthopedic Surgery',
        indication: 'Distal Radius Colles Fracture',
        outcome: 'Volar titanium locking plate fixation. Bone fully united.',
        implantsUsed: 'Synthes 3.5mm Volar Distal Radius Plate'
      }] : [])
    ],
    labReports: [
      {
        id: `lab-${index}-1`,
        test: 'Complete Blood Count (CBC) with Differential',
        date: 'Oct 10, 2026',
        hospital: 'MediTech Titans Central Diagnostics',
        doctor: 'Dr. Carlo Toledano',
        result: 'Hemoglobin: 14.2 g/dL, WBC: 7,400 /uL, Platelets: 2.4 Lakhs',
        status: 'Normal / Verified'
      },
      {
        id: `lab-${index}-2`,
        test: 'Fasting Blood Sugar (FBS) & HbA1c',
        date: 'Jul 14, 2025',
        hospital: 'Apollo Diagnostic Reference Lab (Greams Road)',
        doctor: 'Dr. V. Ramachandran',
        result: index % 2 === 0 ? 'FBS: 138 mg/dL (Elevated), HbA1c: 7.2%' : 'FBS: 92 mg/dL (Normal), HbA1c: 5.4%',
        status: 'Verified Report'
      },
      {
        id: `lab-${index}-3`,
        test: 'Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)',
        date: 'May 11, 2025',
        hospital: 'Kauvery Hospital Diagnostics (Alwarpet)',
        doctor: 'Dr. Kavitha Rajan',
        result: 'Total Chol: 210 mg/dL, LDL: 132 mg/dL, HDL: 48 mg/dL, TG: 155 mg/dL',
        status: 'Verified Report'
      },
      {
        id: `lab-${index}-4`,
        test: 'Digital Chest X-Ray PA View (மார்பு எக்ஸ்-ரே)',
        date: 'Nov 02, 2024',
        hospital: 'Rajiv Gandhi GH Radiology Dept',
        doctor: 'Dr. K. Senthil Nathan',
        result: 'Bilateral lung fields clear. Costophrenic angles normal. Heart size within normal limits.',
        status: 'Normal / Verified'
      },
      {
        id: `lab-${index}-5`,
        test: 'Resting 12-Lead Electrocardiogram (ECG)',
        date: 'Aug 20, 2024',
        hospital: 'Madras Medical Mission (MMM)',
        doctor: 'Dr. S. Mullasari',
        result: 'Normal Sinus Rhythm, 76 bpm. No acute ST-T wave changes.',
        status: 'Cardiology Signed'
      }
    ],
    pastMedications: [
      {
        id: `medhist-${index}-1`,
        medicineName: 'Metformin Hydrochloride (Glycomet 500mg)',
        dosage: '1 tablet (1-0-1)',
        duration: 'Ongoing Daily',
        route: 'Oral (After Meals)',
        prescribedDate: 'Jul 14, 2025',
        hospital: 'Apollo Main Hospital',
        prescribedBy: 'Dr. V. Ramachandran',
        indication: 'Glycemic Control / Type 2 Diabetes'
      },
      {
        id: `medhist-${index}-2`,
        medicineName: 'Telmisartan 40mg (Telma 40)',
        dosage: '1 tablet (1-0-0)',
        duration: 'Ongoing Morning',
        route: 'Oral (Morning)',
        prescribedDate: 'May 11, 2025',
        hospital: 'Kauvery Hospital',
        prescribedBy: 'Dr. Kavitha Rajan',
        indication: 'Blood Pressure / Essential Hypertension'
      },
      {
        id: `medhist-${index}-3`,
        medicineName: 'Atorvastatin 20mg (Atorva)',
        dosage: '1 tablet (0-0-1)',
        duration: 'Ongoing Bedtime',
        route: 'Oral (Night)',
        prescribedDate: 'Aug 22, 2024',
        hospital: 'Madras Medical Mission',
        prescribedBy: 'Dr. S. Mullasari',
        indication: 'Cardioprotective Statin Therapy'
      },
      {
        id: `medhist-${index}-4`,
        medicineName: 'Pantoprazole 40mg (Pan 40)',
        dosage: '1 tablet (1-0-0)',
        duration: '14 Days (SOS)',
        route: 'Oral (Empty Stomach)',
        prescribedDate: 'Nov 02, 2024',
        hospital: 'Rajiv Gandhi GH',
        prescribedBy: 'Dr. K. Senthil Nathan',
        indication: 'Gastritis & Acid Peptic Prophylaxis'
      }
    ],
    activeToken: index === 0 ? 'TK-101' : index === 1 ? 'TK-102' : null
  };

  // Embed offline readable QR payload (now includes Aadhaar)
  tempPatient.qrPayload = generateOfflineQRPayload(tempPatient);
  return tempPatient;
});

// 4. Exactly 32 Beds: 8 ICU, 6 Emergency, 12 General Ward, 6 Pediatric
export const SEED_BEDS = [
  // ICU Wards (8 beds: ICU-01 to ICU-08)
  { id: 'ICU-01', ward: 'ICU', number: 1, status: 'occupied', patientName: 'Murugan Sundaram', patientId: 'HSP-2026-1008', diagnosis: 'Severe NSTEMI / Cardiac Monitoring', oxygen: '91%', ventilator: true, admittedAt: 'Yesterday, 11:20 PM', doctor: 'Dr. Kavitha Rajan' },
  { id: 'ICU-02', ward: 'ICU', number: 2, status: 'occupied', patientName: 'Sathish Kumar', patientId: 'HSP-2026-1010', diagnosis: 'Acute Respiratory Distress', oxygen: '88%', ventilator: true, admittedAt: 'Today, 02:15 AM', doctor: 'Dr. Carlo Toledano' },
  { id: 'ICU-03', ward: 'ICU', number: 3, status: 'sanitizing', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: true, admittedAt: null, doctor: null, cleanMinsLeft: 8 },
  { id: 'ICU-04', ward: 'ICU', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: true, admittedAt: null, doctor: null },
  { id: 'ICU-05', ward: 'ICU', number: 5, status: 'occupied', patientName: 'Selvi Rajendran', patientId: 'HSP-2026-1009', diagnosis: 'Post-CABG Recovery', oxygen: '96%', ventilator: false, admittedAt: '2 days ago', doctor: 'Dr. Kavitha Rajan' },
  { id: 'ICU-06', ward: 'ICU', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'ICU-07', ward: 'ICU', number: 7, status: 'reserved', patientName: 'Incoming ER Trauma', patientId: 'ER-TRANSFER-01', diagnosis: 'Multiple Trauma', oxygen: '94%', ventilator: true, admittedAt: 'In Transit', doctor: 'Dr. Arun Kumar' },
  { id: 'ICU-08', ward: 'ICU', number: 8, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: true, admittedAt: null, doctor: null },

  // Emergency Trauma Bays (6 beds: ER-01 to ER-06)
  { id: 'ER-01', ward: 'Emergency Trauma', number: 1, status: 'occupied', patientName: 'Karthik Raja', patientId: 'HSP-2026-1012', diagnosis: 'Road Accident / Femur Fracture', oxygen: '97%', ventilator: false, admittedAt: 'Today, 08:30 AM', doctor: 'Dr. Arun Kumar' },
  { id: 'ER-02', ward: 'Emergency Trauma', number: 2, status: 'occupied', patientName: 'Lakshmi Narayanan', patientId: 'HSP-2026-1013', diagnosis: 'Anaphylaxis / Drug Reaction', oxygen: '93%', ventilator: false, admittedAt: 'Today, 09:15 AM', doctor: 'Dr. Arun Kumar' },
  { id: 'ER-03', ward: 'Emergency Trauma', number: 3, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'ER-04', ward: 'Emergency Trauma', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'ER-05', ward: 'Emergency Trauma', number: 5, status: 'sanitizing', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null, cleanMinsLeft: 4 },
  { id: 'ER-06', ward: 'Emergency Trauma', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },

  // General Medical Ward (12 beds: GW-01 to GW-12)
  { id: 'GW-01', ward: 'General Ward', number: 1, status: 'occupied', patientName: 'Shanthi Venkatesh', patientId: 'HSP-2026-1014', diagnosis: 'Acute Gastroenteritis & Dehydration', oxygen: '98%', ventilator: false, admittedAt: 'Today, 07:00 AM', doctor: 'Dr. Carlo Toledano' },
  { id: 'GW-02', ward: 'General Ward', number: 2, status: 'occupied', patientName: 'Dinesh Balan', patientId: 'HSP-2026-1019', diagnosis: 'Viral Pyrexia / Observation', oxygen: '97%', ventilator: false, admittedAt: 'Yesterday', doctor: 'Dr. Carlo Toledano' },
  { id: 'GW-03', ward: 'General Ward', number: 3, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-04', ward: 'General Ward', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-05', ward: 'General Ward', number: 5, status: 'occupied', patientName: 'Saravanan Perumal', patientId: 'HSP-2026-1017', diagnosis: 'Cellulitis Right Foot', oxygen: '96%', ventilator: false, admittedAt: '3 days ago', doctor: 'Dr. Carlo Toledano' },
  { id: 'GW-06', ward: 'General Ward', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-07', ward: 'General Ward', number: 7, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-08', ward: 'General Ward', number: 8, status: 'occupied', patientName: 'Vasantha Kumari', patientId: 'HSP-2026-1018', diagnosis: 'Uncontrolled Type 2 Diabetes', oxygen: '99%', ventilator: false, admittedAt: '1 day ago', doctor: 'Dr. Carlo Toledano' },
  { id: 'GW-09', ward: 'General Ward', number: 9, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-10', ward: 'General Ward', number: 10, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-11', ward: 'General Ward', number: 11, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'GW-12', ward: 'General Ward', number: 12, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },

  // Pediatric Ward (6 beds: PED-01 to PED-06)
  { id: 'PED-01', ward: 'Pediatric Care', number: 1, status: 'occupied', patientName: 'Baby Kaviya (Pediatric)', patientId: 'HSP-2026-1030', diagnosis: 'Bronchiolitis / Nebulization Rounds', oxygen: '95%', ventilator: false, admittedAt: 'Today, 06:45 AM', doctor: 'Dr. Ananya Sharma' },
  { id: 'PED-02', ward: 'Pediatric Care', number: 2, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'PED-03', ward: 'Pediatric Care', number: 3, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'PED-04', ward: 'Pediatric Care', number: 4, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'PED-05', ward: 'Pediatric Care', number: 5, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null },
  { id: 'PED-06', ward: 'Pediatric Care', number: 6, status: 'available', patientName: null, patientId: null, diagnosis: null, oxygen: null, ventilator: false, admittedAt: null, doctor: null }
];

// 5. Exactly 40 Medicines in Pharmacy Inventory
export const SEED_INVENTORY = [
  { id: 'med-1', name: 'Amoxicillin + Clavulanate (Augmentin 625)', generic: 'Amoxicillin 500mg + Clavulanic 125mg', category: 'Antibiotic (Penicillin)', batchNo: 'AUG-2026-09A', expiryDate: '2027-08-31', currentStock: 142, unit: 'Tablets', reorderLevel: 50, unitPrice: 24.50, status: 'In Stock' },
  { id: 'med-2', name: 'Paracetamol (Dolo 650)', generic: 'Paracetamol 650mg', category: 'Antipyretic / Analgesic', batchNo: 'DOL-2026-44B', expiryDate: '2028-01-15', currentStock: 480, unit: 'Tablets', reorderLevel: 100, unitPrice: 3.20, status: 'In Stock' },
  { id: 'med-3', name: 'Levocetirizine 5mg', generic: 'Levocetirizine Dihydrochloride', category: 'Antihistamine', batchNo: 'LVO-2025-11C', expiryDate: '2026-11-30', currentStock: 28, unit: 'Tablets', reorderLevel: 40, unitPrice: 6.80, status: 'Low Stock' },
  { id: 'med-4', name: 'Atorvastatin 40mg (Lipitor)', generic: 'Atorvastatin Calcium', category: 'Cardiovascular / Statin', batchNo: 'ATV-2026-88F', expiryDate: '2027-12-10', currentStock: 85, unit: 'Tablets', reorderLevel: 30, unitPrice: 18.00, status: 'In Stock' },
  { id: 'med-5', name: 'Glyceryl Trinitrate (Nitroglycerin SL 0.5mg)', generic: 'Nitroglycerin Sublingual', category: 'Emergency Cardiac', batchNo: 'GTN-2026-02E', expiryDate: '2027-04-20', currentStock: 14, unit: 'Bottles', reorderLevel: 25, unitPrice: 110.00, status: 'Low Stock' },
  { id: 'med-6', name: 'Adrenaline Injection (1:1000)', generic: 'Epinephrine 1mg/ml', category: 'Emergency Resuscitation', batchNo: 'ADR-2026-19X', expiryDate: '2027-02-28', currentStock: 42, unit: 'Ampoules', reorderLevel: 20, unitPrice: 45.00, status: 'In Stock' },
  { id: 'med-7', name: 'Azithromycin 500mg', generic: 'Azithromycin Dihydrate', category: 'Antibiotic (Macrolide)', batchNo: 'AZI-2026-12K', expiryDate: '2027-09-15', currentStock: 110, unit: 'Tablets', reorderLevel: 30, unitPrice: 22.00, status: 'In Stock' },
  { id: 'med-8', name: 'Metformin 500mg (Glycomet)', generic: 'Metformin Hydrochloride', category: 'Anti-Diabetic', batchNo: 'MET-2026-30M', expiryDate: '2028-03-31', currentStock: 350, unit: 'Tablets', reorderLevel: 80, unitPrice: 4.50, status: 'In Stock' },
  { id: 'med-9', name: 'Amlodipine 5mg (Norvasc)', generic: 'Amlodipine Besylate', category: 'Antihypertensive', batchNo: 'AML-2026-07P', expiryDate: '2027-11-20', currentStock: 220, unit: 'Tablets', reorderLevel: 50, unitPrice: 5.00, status: 'In Stock' },
  { id: 'med-10', name: 'Pantoprazole 40mg (Pan 40)', generic: 'Pantoprazole Sodium', category: 'Proton Pump Inhibitor', batchNo: 'PAN-2026-88Q', expiryDate: '2027-10-10', currentStock: 310, unit: 'Tablets', reorderLevel: 60, unitPrice: 9.00, status: 'In Stock' },
  { id: 'med-11', name: 'Ceftriaxone 1g Injection', generic: 'Ceftriaxone Sodium', category: 'Antibiotic (Cephalosporin)', batchNo: 'CEF-2026-15R', expiryDate: '2027-05-18', currentStock: 65, unit: 'Vials', reorderLevel: 25, unitPrice: 75.00, status: 'In Stock' },
  { id: 'med-12', name: 'Aspirin Soluble 75mg (Ecosprin)', generic: 'Acetylsalicylic Acid', category: 'Antiplatelet', batchNo: 'ASP-2026-22S', expiryDate: '2028-06-30', currentStock: 190, unit: 'Tablets', reorderLevel: 40, unitPrice: 2.10, status: 'In Stock' },
  { id: 'med-13', name: 'Salbutamol Nebulizer Solution', generic: 'Salbutamol Respules 2.5mg', category: 'Bronchodilator', batchNo: 'SAL-2026-03T', expiryDate: '2027-01-31', currentStock: 48, unit: 'Respules', reorderLevel: 30, unitPrice: 12.00, status: 'In Stock' },
  { id: 'med-14', name: 'Hydrocortisone 100mg Injection', generic: 'Hydrocortisone Sodium Succinate', category: 'Corticosteroid', batchNo: 'HYD-2026-99U', expiryDate: '2026-12-15', currentStock: 18, unit: 'Vials', reorderLevel: 25, unitPrice: 55.00, status: 'Low Stock' },
  { id: 'med-15', name: 'Furosemide 40mg (Lasix)', generic: 'Furosemide', category: 'Diuretic', batchNo: 'FUR-2026-11V', expiryDate: '2027-07-22', currentStock: 140, unit: 'Tablets', reorderLevel: 30, unitPrice: 3.80, status: 'In Stock' },
  { id: 'med-16', name: 'Ondansetron 4mg (Emset)', generic: 'Ondansetron Hydrochloride', category: 'Antiemetic', batchNo: 'OND-2026-04W', expiryDate: '2027-08-05', currentStock: 175, unit: 'Tablets', reorderLevel: 40, unitPrice: 8.50, status: 'In Stock' },
  { id: 'med-17', name: 'Insulin Human Regular 40IU/ml', generic: 'Soluble Human Insulin', category: 'Anti-Diabetic Injectable', batchNo: 'INS-2026-55X', expiryDate: '2026-10-31', currentStock: 12, unit: 'Vials', reorderLevel: 20, unitPrice: 185.00, status: 'Low Stock' },
  { id: 'med-18', name: 'Ciprofloxacin 500mg (Ciplox)', generic: 'Ciprofloxacin Hydrochloride', category: 'Antibiotic (Fluoroquinolone)', batchNo: 'CIP-2026-72Y', expiryDate: '2027-09-30', currentStock: 130, unit: 'Tablets', reorderLevel: 35, unitPrice: 14.00, status: 'In Stock' },
  { id: 'med-19', name: 'Tramadol 50mg Capsules', generic: 'Tramadol Hydrochloride', category: 'Opioid Analgesic', batchNo: 'TRA-2026-81Z', expiryDate: '2027-03-14', currentStock: 90, unit: 'Capsules', reorderLevel: 25, unitPrice: 16.50, status: 'In Stock' },
  { id: 'med-20', name: 'Oral Rehydration Salts (ORS)', generic: 'WHO Oral Rehydration Formula', category: 'Electrolytes', batchNo: 'ORS-2026-10A', expiryDate: '2028-12-31', currentStock: 500, unit: 'Sachets', reorderLevel: 100, unitPrice: 15.00, status: 'In Stock' },
  { id: 'med-21', name: 'Doxycycline 100mg', generic: 'Doxycycline Hyclate', category: 'Antibiotic (Tetracycline)', batchNo: 'DOX-2026-33B', expiryDate: '2027-11-15', currentStock: 80, unit: 'Capsules', reorderLevel: 25, unitPrice: 11.50, status: 'In Stock' },
  { id: 'med-22', name: 'Ibuprofen 400mg (Brufen)', generic: 'Ibuprofen', category: 'NSAID / Analgesic', batchNo: 'IBU-2026-44C', expiryDate: '2027-06-20', currentStock: 210, unit: 'Tablets', reorderLevel: 50, unitPrice: 4.00, status: 'In Stock' },
  { id: 'med-23', name: 'Diclofenac 50mg (Voveran)', generic: 'Diclofenac Sodium', category: 'NSAID / Analgesic', batchNo: 'DIC-2026-55D', expiryDate: '2027-04-18', currentStock: 160, unit: 'Tablets', reorderLevel: 40, unitPrice: 6.20, status: 'In Stock' },
  { id: 'med-24', name: 'Metoprolol 25mg (Betaloc)', generic: 'Metoprolol Tartrate', category: 'Beta-Blocker', batchNo: 'MET-2026-66E', expiryDate: '2028-02-10', currentStock: 145, unit: 'Tablets', reorderLevel: 30, unitPrice: 8.00, status: 'In Stock' },
  { id: 'med-25', name: 'Telmisartan 40mg (Telma)', generic: 'Telmisartan', category: 'Antihypertensive', batchNo: 'TEL-2026-77F', expiryDate: '2027-10-25', currentStock: 180, unit: 'Tablets', reorderLevel: 40, unitPrice: 12.00, status: 'In Stock' },
  { id: 'med-26', name: 'Clopidogrel 75mg (Plavix)', generic: 'Clopidogrel Bisulfate', category: 'Antiplatelet', batchNo: 'CLO-2026-88G', expiryDate: '2027-08-14', currentStock: 95, unit: 'Tablets', reorderLevel: 25, unitPrice: 21.00, status: 'In Stock' },
  { id: 'med-27', name: 'Montelukast 10mg (Montek)', generic: 'Montelukast Sodium', category: 'Antileukotriene', batchNo: 'MON-2026-99H', expiryDate: '2027-12-05', currentStock: 120, unit: 'Tablets', reorderLevel: 30, unitPrice: 17.50, status: 'In Stock' },
  { id: 'med-28', name: 'Deriphyllin Retard 150mg', generic: 'Theophylline + Etophylline', category: 'Bronchodilator', batchNo: 'DER-2026-12J', expiryDate: '2027-07-30', currentStock: 135, unit: 'Tablets', reorderLevel: 30, unitPrice: 5.50, status: 'In Stock' },
  { id: 'med-29', name: 'Ranitidine 150mg (Rantac)', generic: 'Ranitidine Hydrochloride', category: 'H2 Blocker', batchNo: 'RAN-2026-23K', expiryDate: '2027-03-22', currentStock: 110, unit: 'Tablets', reorderLevel: 30, unitPrice: 4.20, status: 'In Stock' },
  { id: 'med-30', name: 'Albendazole 400mg (Zentel)', generic: 'Albendazole', category: 'Anthelmintic', batchNo: 'ALB-2026-34L', expiryDate: '2028-05-16', currentStock: 75, unit: 'Tablets', reorderLevel: 20, unitPrice: 19.00, status: 'In Stock' },
  { id: 'med-31', name: 'Metronidazole 400mg (Flagyl)', generic: 'Metronidazole', category: 'Antiprotozoal / Antibiotic', batchNo: 'MET-2026-45M', expiryDate: '2027-09-08', currentStock: 165, unit: 'Tablets', reorderLevel: 40, unitPrice: 5.00, status: 'In Stock' },
  { id: 'med-32', name: 'Cotrimoxazole (Bactrim DS)', generic: 'Trimethoprim + Sulfamethoxazole', category: 'Antibiotic (Sulfa)', batchNo: 'BAC-2026-56N', expiryDate: '2027-06-12', currentStock: 85, unit: 'Tablets', reorderLevel: 25, unitPrice: 9.80, status: 'In Stock' },
  { id: 'med-33', name: 'Heparin 5000 IU/ml Injection', generic: 'Heparin Sodium', category: 'Anticoagulant', batchNo: 'HEP-2026-67P', expiryDate: '2026-11-20', currentStock: 16, unit: 'Vials', reorderLevel: 20, unitPrice: 120.00, status: 'Low Stock' },
  { id: 'med-34', name: 'Dopamine 200mg Injection', generic: 'Dopamine Hydrochloride', category: 'Inotropic / Vasopressor', batchNo: 'DOP-2026-78Q', expiryDate: '2027-01-10', currentStock: 22, unit: 'Ampoules', reorderLevel: 15, unitPrice: 95.00, status: 'In Stock' },
  { id: 'med-35', name: 'Midazolam 5mg/ml Injection', generic: 'Midazolam', category: 'Sedative / Anesthetic', batchNo: 'MID-2026-89R', expiryDate: '2027-04-05', currentStock: 30, unit: 'Ampoules', reorderLevel: 15, unitPrice: 65.00, status: 'In Stock' },
  { id: 'med-36', name: 'Normal Saline 0.9% 500ml', generic: 'Sodium Chloride IV', category: 'Intravenous Fluids', batchNo: 'NS-2026-90S', expiryDate: '2028-10-31', currentStock: 280, unit: 'Bottles', reorderLevel: 50, unitPrice: 38.00, status: 'In Stock' },
  { id: 'med-37', name: 'Ringer Lactate (RL) 500ml', generic: 'Compound Sodium Lactate IV', category: 'Intravenous Fluids', batchNo: 'RL-2026-01T', expiryDate: '2028-09-15', currentStock: 240, unit: 'Bottles', reorderLevel: 50, unitPrice: 42.00, status: 'In Stock' },
  { id: 'med-38', name: 'Dextrose 5% in Normal Saline', generic: 'Dextrose 5% + NaCl 0.9%', category: 'Intravenous Fluids', batchNo: 'DNS-2026-12U', expiryDate: '2028-08-20', currentStock: 190, unit: 'Bottles', reorderLevel: 40, unitPrice: 40.00, status: 'In Stock' },
  { id: 'med-39', name: 'Povidone Iodine 10% Solution', generic: 'Povidone Iodine', category: 'Antiseptic', batchNo: 'POV-2026-23V', expiryDate: '2027-12-31', currentStock: 60, unit: 'Bottles', reorderLevel: 20, unitPrice: 85.00, status: 'In Stock' },
  { id: 'med-40', name: 'Lidocaine 2% Injection (Xylocaine)', generic: 'Lidocaine Hydrochloride', category: 'Local Anesthetic', batchNo: 'LID-2026-34W', expiryDate: '2027-05-25', currentStock: 55, unit: 'Vials', reorderLevel: 20, unitPrice: 48.00, status: 'In Stock' },
];

// 6. Tokens
export const SEED_TOKENS = [
  {
    id: 'tok-1',
    appointmentId: 'APT-2026-001',
    tokenNumber: 'TK-101',
    patientId: 'pat-1',
    patientName: 'Thirunavukkarasu Muthukumar',
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlo Toledano',
    departmentId: 'dept-1',
    deptName: 'General Medicine',
    slotTime: '10:00 AM',
    date: '2026-10-26',
    status: 'Checked-In',
    tokenStatus: 'In Consultation',
    triageLevel: 'Routine (Green)',
    symptomSummary: 'Seasonal allergic cough and follow-up.',
    checkedInAt: '09:45 AM',
    consultationStartedAt: '10:05 AM',
    estimatedWaitMins: 0
  },
  {
    id: 'tok-2',
    appointmentId: 'APT-2026-002',
    tokenNumber: 'TK-102',
    patientId: 'pat-2',
    patientName: 'Muthuvel Pandian',
    doctorId: 'doc-2',
    doctorName: 'Dr. Kavitha Rajan',
    departmentId: 'dept-2',
    deptName: 'Cardiology',
    slotTime: '10:30 AM',
    date: '2026-10-26',
    status: 'Checked-In',
    tokenStatus: 'Waiting',
    triageLevel: 'Critical (Red)',
    symptomSummary: 'நெஞ்சு வலி மற்றும் இடது கை வலி (Severe chest pain & radiating discomfort).',
    checkedInAt: '10:15 AM',
    consultationStartedAt: null,
    estimatedWaitMins: 2
  },
  {
    id: 'tok-3',
    appointmentId: 'APT-2026-003',
    tokenNumber: 'TK-103',
    patientId: 'pat-3',
    patientName: 'Priya Meenakshi',
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlo Toledano',
    departmentId: 'dept-1',
    deptName: 'General Medicine',
    slotTime: '11:00 AM',
    date: '2026-10-26',
    status: 'Checked-In',
    tokenStatus: 'Waiting',
    triageLevel: 'Routine (Green)',
    symptomSummary: '3-day pyrexia with chills and fatigue.',
    checkedInAt: '10:30 AM',
    consultationStartedAt: null,
    estimatedWaitMins: 12
  }
];

// 7. Prescriptions
export const SEED_PRESCRIPTIONS = [
  {
    id: 'rx-1',
    prescriptionId: 'RX-2026-901',
    patientId: 'pat-1',
    patientName: 'Thirunavukkarasu Muthukumar',
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlo Toledano',
    date: '2026-10-26',
    diagnosis: 'Acute Bronchitis & Pharyngitis',
    status: 'Finalized',
    clinicianSigned: true,
    signedAt: '2026-10-26 10:25 AM',
    notes: 'Hydrate well, steam inhalation twice daily, return if breathlessness occurs.',
    items: [
      {
        name: 'Azithromycin 500mg',
        strength: '500 mg',
        dose: '1 tablet',
        frequency: '1-0-0 (Once Daily)',
        duration: '3 Days',
        route: 'Oral (After Food)',
        quantity: 3,
        instructions: 'Complete 3-day course.',
        tamilInstructions: 'தினமும் ஒரு மாத்திரை சாப்பாட்டிற்கு பிறகு 3 நாட்களுக்கு உட்கொள்ளவும்.'
      },
      {
        name: 'Paracetamol (Dolo 650)',
        strength: '650 mg',
        dose: '1 tablet',
        frequency: '1-0-1 (SOS / When fever > 38°C)',
        duration: '3 Days',
        route: 'Oral (After Food)',
        quantity: 6,
        instructions: 'Maintain 6 hours interval.',
        tamilInstructions: 'காய்ச்சல் இருக்கும்போது மட்டும் 6 மணி நேர இடைவெளியில் உட்கொள்ளவும்.'
      },
      {
        name: 'Levocetirizine 5mg',
        strength: '5 mg',
        dose: '1 tablet',
        frequency: '0-0-1 (Night only)',
        duration: '5 Days',
        route: 'Oral (Bedtime)',
        quantity: 5,
        instructions: 'May cause mild drowsiness.',
        tamilInstructions: 'இரவு தூங்கும் முன் 1 மாத்திரை மட்டும் 5 நாட்களுக்கு உட்கொள்ளவும்.'
      }
    ]
  }
];

// 8. Medication Tasks for Nurse eMAR
export const SEED_MEDICATION_TASKS = [
  {
    id: 'task-1',
    taskId: 'TSK-801',
    patientId: 'pat-1',
    patientName: 'Thirunavukkarasu Muthukumar',
    roomBed: 'Daycare Bed 02',
    medicineName: 'Paracetamol IV Infusion 1000mg',
    dose: '100ml IV',
    route: 'IV Infusion over 20 mins',
    scheduledTime: '11:00 AM',
    status: 'Pending',
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
    roomBed: 'Cardio Observation Bay 01',
    medicineName: 'Atorvastatin 40mg',
    dose: '1 tablet',
    route: 'Oral',
    scheduledTime: '10:30 AM',
    status: 'Administered',
    administeredBy: 'Nurse Geetha R., RN',
    administeredAt: '2026-10-26 10:32 AM',
    delayReason: null,
    doctorNotified: false
  },
  {
    id: 'task-3',
    taskId: 'TSK-803',
    patientId: 'pat-3',
    patientName: 'Priya Meenakshi',
    roomBed: 'OPD Injection Room',
    medicineName: 'Ceftriaxone 1g Injection',
    dose: '1 vial in 100ml NS',
    route: 'IV Slow',
    scheduledTime: '09:30 AM',
    status: 'Delayed',
    administeredBy: 'Nurse Geetha R., RN',
    administeredAt: null,
    delayReason: 'Patient at Diagnostic Lab for CBC; delayed safely by 30 mins.',
    doctorNotified: true
  }
];

// 9. Initial Audit Logs
export const SEED_AUDIT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-10-26 09:30:12',
    actorUid: 'usr-reception-01',
    actorName: 'Deepa Krishnan (Reception)',
    role: 'RECEPTION',
    action: 'REGISTER_PATIENT',
    resourceType: 'patients',
    resourceId: 'HSP-2026-1001',
    details: 'New patient registered: Thirunavukkarasu Muthukumar with offline QR passport.'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-26 09:45:00',
    actorUid: 'usr-reception-01',
    actorName: 'Deepa Krishnan (Reception)',
    role: 'RECEPTION',
    action: 'ISSUE_TOKEN',
    resourceType: 'tokens',
    resourceId: 'TK-101',
    details: 'Issued token TK-101 for General Medicine (Dr. Carlo Toledano).'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-26 10:15:30',
    actorUid: 'usr-triage-01',
    actorName: 'Sister Mary Joseph (Triage RN)',
    role: 'TRIAGE_STAFF',
    action: 'EMERGENCY_ESCALATION',
    resourceType: 'alerts',
    resourceId: 'EMR-ALERT-901',
    details: 'Code Red triggered for Muthuvel Pandian (Severe chest pain). Immediate queue jump.'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-26 10:25:10',
    actorUid: 'usr-doctor-01',
    actorName: 'Dr. Carlo Toledano',
    role: 'DOCTOR',
    action: 'FINALIZE_PRESCRIPTION',
    resourceType: 'prescriptions',
    resourceId: 'RX-2026-901',
    details: 'Prescription signed and locked with drug-allergy safety validation.'
  }
];
