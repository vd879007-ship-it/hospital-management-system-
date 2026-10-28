import { generateOfflineQRPayload, formatAadhaar } from './utils';

/**
 * Hospital Data Importer
 * Parses JSON & CSV input, normalizes patient records, and generates offline QR payloads & ABHA IDs.
 */

// Normalizes a raw patient object into the complete HSMS schema
export const normalizePatientRecord = (raw, index = 0) => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const patientId = raw.patientId || `HSP-2026-${1000 + index + Math.floor(Math.random() * 100)}`;
  const id = raw.id || `pat-${timestamp}-${index}-${randomSuffix}`;
  const name = raw.name || `Patient ${index + 1}`;
  const nameTa = raw.nameTa || raw.name || name;
  const age = parseInt(raw.age, 10) || 30;
  const gender = raw.gender || 'Not Specified';
  const bloodType = raw.bloodType || 'B+';
  const mobile = raw.mobile || '+91 90000 00000';
  const email = raw.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@meditech.fake`;
  const aadhaarNumber = raw.aadhaarNumber ? formatAadhaar(raw.aadhaarNumber) : `4599 8899 ${randomSuffix}`;
  const abhaAddress = raw.abhaAddress || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.1001@abdm`;
  const address = raw.address || 'Tamil Nadu, India';

  // Parse allergies into array
  let allergies = ['None known'];
  if (raw.allergies) {
    if (Array.isArray(raw.allergies)) {
      allergies = raw.allergies;
    } else if (typeof raw.allergies === 'string') {
      allergies = raw.allergies.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
      if (allergies.length === 0) allergies = ['None known'];
    }
  }

  // Parse emergency contact
  const emergencyContact = {
    name: raw.emergencyContact?.name || raw.emergencyContactName || 'Family Member',
    phone: raw.emergencyContact?.phone || raw.emergencyContactPhone || mobile,
    relationship: raw.emergencyContact?.relationship || raw.emergencyContactRel || 'Relative'
  };

  // Parse vitals
  const vitals = {
    temperature: raw.vitals?.temperature || raw.temperature || '37.0 °C',
    bloodPressure: raw.vitals?.bloodPressure || raw.bloodPressure || '120/80 mmHg',
    pulseRate: raw.vitals?.pulseRate || raw.pulseRate || '76 bpm',
    spo2: raw.vitals?.spo2 || raw.spo2 || '98%',
    height: raw.vitals?.height || raw.height || '168 cm',
    weight: raw.vitals?.weight || raw.weight || '65 kg',
    lastUpdated: raw.vitals?.lastUpdated || 'Today, Recorded at Intake'
  };

  const patient = {
    id,
    patientId,
    name,
    nameTa,
    gender,
    age,
    dateOfBirth: raw.dateOfBirth || '1996-01-01',
    bloodType,
    mobile,
    email,
    nationalId: raw.nationalId || aadhaarNumber,
    aadhaarNumber,
    abhaAddress,
    address,
    avatar: raw.avatar || `https://images.unsplash.com/photo-${1534528741775 + (index % 10)}?w=150&auto=format&fit=crop&q=80`,
    allergies,
    emergencyContact,
    vitals,
    medicalHistory: Array.isArray(raw.medicalHistory) ? raw.medicalHistory : [],
    prescriptions: Array.isArray(raw.prescriptions) ? raw.prescriptions : [],
    labReports: Array.isArray(raw.labReports) ? raw.labReports : [],
    qrTokenRef: `QR-REF-${patientId}`,
    qrPayload: ''
  };

  // Generate offline QR passport string
  patient.qrPayload = generateOfflineQRPayload(patient);

  return patient;
};

// CSV Line Parser handling quotes and commas
const parseCSVLine = (text) => {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
};

// Parse CSV text into patient records
export const parseCSVToPatients = (csvText) => {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and 1 data row.');
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const patients = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });

    const patient = normalizePatientRecord({
      name: rowObj.name || rowObj.patientname || rowObj.fullname,
      nameTa: rowObj.nameta || rowObj.tamilname,
      age: rowObj.age,
      gender: rowObj.gender || rowObj.sex,
      bloodType: rowObj.bloodtype || rowObj.bloodgroup || rowObj.blood,
      mobile: rowObj.mobile || rowObj.phone || rowObj.phonenumber,
      email: rowObj.email,
      aadhaarNumber: rowObj.aadhaarnumber || rowObj.aadhaar || rowObj.uid,
      address: rowObj.address || rowObj.city,
      allergies: rowObj.allergies || rowObj.allergy,
      emergencyContactName: rowObj.emergencycontactname || rowObj.emergencyname,
      emergencyContactPhone: rowObj.emergencycontactphone || rowObj.emergencyphone,
      bloodPressure: rowObj.bloodpressure || rowObj.bp,
      pulseRate: rowObj.pulserate || rowObj.pulse,
      spo2: rowObj.spo2
    }, i - 1);

    patients.push(patient);
  }

  return patients;
};

// Main Data Importer: auto-detects JSON or CSV
export const parseHospitalImportData = (rawText) => {
  if (!rawText || !rawText.trim()) {
    throw new Error('Please enter or upload data to import.');
  }

  const trimmed = rawText.trim();

  // 1. Attempt JSON parsing
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);

      // Scenario A: Full Bundle { patients: [...], appointments: [...], inventory: [...], beds: [...] }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const patients = Array.isArray(parsed.patients)
          ? parsed.patients.map((p, idx) => normalizePatientRecord(p, idx))
          : [];

        const appointments = Array.isArray(parsed.appointments) ? parsed.appointments : [];
        const prescriptions = Array.isArray(parsed.prescriptions) ? parsed.prescriptions : [];
        const inventory = Array.isArray(parsed.inventory) ? parsed.inventory : [];
        const beds = Array.isArray(parsed.beds) ? parsed.beds : [];

        return {
          type: 'JSON_BUNDLE',
          data: { patients, appointments, prescriptions, inventory, beds },
          summary: {
            patientsCount: patients.length,
            appointmentsCount: appointments.length,
            prescriptionsCount: prescriptions.length,
            inventoryCount: inventory.length,
            bedsCount: beds.length
          }
        };
      }

      // Scenario B: Array of Patients [ { name: "..." }, ... ]
      if (Array.isArray(parsed)) {
        const patients = parsed.map((p, idx) => normalizePatientRecord(p, idx));
        return {
          type: 'JSON_PATIENTS',
          data: { patients },
          summary: {
            patientsCount: patients.length,
            appointmentsCount: 0,
            prescriptionsCount: 0,
            inventoryCount: 0,
            bedsCount: 0
          }
        };
      }
    } catch (jsonErr) {
      // If starts with { or [ but fails, inform user of JSON error
      throw new Error(`Invalid JSON format: ${jsonErr.message}`);
    }
  }

  // 2. Attempt CSV parsing
  try {
    const patients = parseCSVToPatients(trimmed);
    return {
      type: 'CSV_PATIENTS',
      data: { patients },
      summary: {
        patientsCount: patients.length,
        appointmentsCount: 0,
        prescriptionsCount: 0,
        inventoryCount: 0,
        bedsCount: 0
      }
    };
  } catch (csvErr) {
    throw new Error(`Could not parse data as JSON or CSV: ${csvErr.message}`);
  }
};

// Sample Templates for download
export const SAMPLE_PATIENTS_JSON = JSON.stringify([
  {
    name: "Kavitha Raman",
    nameTa: "கவிதா ராமன்",
    age: 34,
    gender: "Female",
    bloodType: "O+",
    mobile: "+91 98401 23456",
    email: "kavitha.raman@gmail.com",
    aadhaarNumber: "4599 8899 1234",
    address: "No. 12, Gandhi Street, Chennai, Tamil Nadu",
    allergies: ["Penicillin"],
    emergencyContact: {
      name: "Raman S.",
      relationship: "Spouse",
      phone: "+91 98401 23457"
    },
    vitals: {
      bloodPressure: "120/80 mmHg",
      pulseRate: "72 bpm",
      temperature: "37.0 °C",
      spo2: "99%"
    }
  },
  {
    name: "Rajesh Kumar",
    nameTa: "ராஜேஷ் குமார்",
    age: 42,
    gender: "Male",
    bloodType: "B+",
    mobile: "+91 98401 88888",
    email: "rajesh.kumar@yahoo.com",
    aadhaarNumber: "7890 1234 5678",
    address: "56 North Mada St, Mylapore, Chennai",
    allergies: ["None known"],
    emergencyContact: {
      name: "Priya Kumar",
      relationship: "Sister",
      phone: "+91 98401 88889"
    },
    vitals: {
      bloodPressure: "130/85 mmHg",
      pulseRate: "80 bpm",
      temperature: "36.8 °C",
      spo2: "98%"
    }
  }
], null, 2);

export const SAMPLE_PATIENTS_CSV = `name,nameTa,age,gender,bloodType,mobile,email,aadhaarNumber,address,allergies
Kavitha Raman,கவிதா ராமன்,34,Female,O+,+91 98401 23456,kavitha@example.com,4599 8899 1234,"Chennai, Tamil Nadu",Penicillin
Rajesh Kumar,ராஜேஷ் குமார்,42,Male,B+,+91 98401 88888,rajesh@example.com,7890 1234 5678,"Madurai, Tamil Nadu",None known
Ananya Sundaram,அனன்யா சுந்தரம்,28,Female,AB+,+91 98401 55555,ananya@example.com,2345 6789 0123,"Coimbatore, Tamil Nadu",Sulfa Drugs`;
