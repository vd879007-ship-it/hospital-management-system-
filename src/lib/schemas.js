import { z } from 'zod';

// 1. User & Staff Schema
export const userRoleSchema = z.enum([
  'patient',
  'reception',
  'receptionist',
  'triage_staff',
  'doctor',
  'nurse',
  'pharmacist',
  'admin'
]);

export const userSchema = z.object({
  uid: z.string().min(1, 'User UID required'),
  displayName: z.string().min(2, 'Display name required'),
  role: userRoleSchema,
  departmentId: z.string().nullable().optional(),
  email: z.string().email('Invalid email address'),
  active: z.boolean().default(true),
  avatar: z.string().url().optional(),
  phone: z.string().optional()
});

// 2. Patient Registration & Record Schema
export const patientEmergencyContactSchema = z.object({
  name: z.string().min(2, 'Emergency contact name required'),
  phone: z.string().min(7, 'Emergency contact phone required'),
  relationship: z.string().default('Relative')
});

export const patientVitalsSchema = z.object({
  temperature: z.string().default('37.0 °C'),
  bloodPressure: z.string().default('120/80 mmHg'),
  pulseRate: z.string().default('76 bpm'),
  respiratoryRate: z.string().default('16 bpm'),
  spo2: z.string().default('99%'),
  height: z.string().default('170 cm'),
  weight: z.string().default('68.0 kg'),
  lastUpdated: z.string().default('Today')
});

export const patientRegistrationSchema = z.object({
  name: z.string().min(2, 'Patient name must be at least 2 characters'),
  nameTa: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Select gender' }),
  age: z.coerce.number().min(0, 'Age cannot be negative').max(125, 'Invalid age'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  mobile: z.string().min(8, 'Mobile number required (min 8 digits)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().default('Tamil Nadu, India'),
  emergencyContactName: z.string().min(2, 'Emergency contact name required'),
  emergencyContactPhone: z.string().min(7, 'Emergency contact phone required'),
  emergencyContactRel: z.string().default('Spouse'),
  allergies: z.string().optional(),
  aadhaarNumber: z.string().optional().refine(val => !val || /^\d{4}\s?\d{4}\s?\d{4}$/.test(val.trim()), {
    message: 'Aadhaar must be a valid 12-digit number (e.g. 1234 5678 9012)'
  }),
  preferredLanguage: z.enum(['en', 'ta', 'hi']).default('en')
});

export const patientSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(3), // e.g. HSP-2026-XXXX
  name: z.string().min(2),
  nameTa: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  age: z.number().min(0).max(125),
  dateOfBirth: z.string(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  mobile: z.string(),
  email: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: patientEmergencyContactSchema,
  allergies: z.array(z.string()).default([]),
  vitals: patientVitalsSchema,
  nationalId: z.string().optional(),
  aadhaarNumber: z.string().optional(), // 12-digit Aadhaar for Universal Health Record lookup
  abhaAddress: z.string().optional(), // ABDM readiness
  abhaNumber: z.string().optional(),  // ABDM readiness
  avatar: z.string().optional(),
  qrPayload: z.string().optional(),   // Offline-readable encoded JSON string
  medicalHistory: z.array(z.any()).default([]),
  labReports: z.array(z.any()).default([]),
  surgeries: z.array(z.any()).default([]), // Past surgical operations history
  pastMedications: z.array(z.any()).default([]), // Full historical list of tablets & prescriptions
  activeToken: z.string().nullable().optional()
});

// 3. OPD Token & Queue Schema
export const tokenQueueStatusSchema = z.enum([
  'Waiting',
  'Called',
  'In Consultation',
  'Completed',
  'Cancelled'
]);

export const triageLevelSchema = z.enum([
  'Critical (Red)',
  'Urgent (Orange)',
  'Priority (Yellow)',
  'Routine (Green)'
]);

export const tokenSchema = z.object({
  id: z.string().min(1),
  appointmentId: z.string().min(1),
  tokenNumber: z.string().min(1), // e.g. TK-101
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  doctorName: z.string().min(1),
  departmentId: z.string().min(1),
  deptName: z.string().min(1),
  slotTime: z.string().default('10:00 AM'),
  date: z.string(),
  status: z.string().default('Checked-In'),
  tokenStatus: tokenQueueStatusSchema.default('Waiting'),
  triageLevel: triageLevelSchema.default('Routine (Green)'),
  symptomSummary: z.string().optional(),
  checkedInAt: z.string(),
  consultationStartedAt: z.string().nullable().optional(),
  estimatedWaitMins: z.number().optional()
});

// 4. Clinical Consultation Schema
export const consultationSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  doctorName: z.string().optional(),
  date: z.string().optional(),
  diagnosis: z.string().min(2, 'Diagnosis required'),
  notes: z.string().min(3, 'Examination notes required'),
  requestedTests: z.string().optional(),
  followUpDays: z.coerce.number().min(0).default(7),
  status: z.enum(['Draft', 'Finalized']).default('Finalized')
});

// 5. Prescription & Medication Item Schema
export const prescriptionItemSchema = z.object({
  name: z.string().min(2, 'Medicine name required'),
  strength: z.string().min(1, 'Strength required (e.g. 500mg)'),
  dose: z.string().default('1 tablet'),
  frequency: z.string().min(1, 'Frequency required (e.g. 1-0-1)'),
  duration: z.string().min(1, 'Duration required (e.g. 5 Days)'),
  route: z.string().default('Oral (After Food)'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  instructions: z.string().optional(),
  tamilInstructions: z.string().optional()
});

export const prescriptionSchema = z.object({
  id: z.string().optional(),
  prescriptionId: z.string().optional(),
  patientId: z.string().min(1),
  patientName: z.string().optional(),
  doctorId: z.string().min(1),
  doctorName: z.string().optional(),
  date: z.string().optional(),
  diagnosis: z.string().min(2),
  status: z.enum(['Finalized', 'Dispensed', 'Cancelled']).default('Finalized'),
  clinicianSigned: z.boolean().default(true),
  signedAt: z.string().optional(),
  dispensedBy: z.string().nullable().optional(),
  dispensedAt: z.string().nullable().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medicine is required')
});

// 6. Nurse Medication Administration Task Schema (eMAR)
export const medicationTaskSchema = z.object({
  id: z.string().optional(),
  taskId: z.string().optional(),
  patientId: z.string().min(1),
  patientName: z.string().optional(),
  roomBed: z.string().min(1),
  medicineName: z.string().min(1),
  dose: z.string().min(1),
  route: z.string().default('Oral'),
  scheduledTime: z.string().min(1),
  status: z.enum(['Pending', 'Administered', 'Delayed', 'Missed']).default('Pending'),
  administeredBy: z.string().nullable().optional(),
  administeredAt: z.string().nullable().optional(),
  delayReason: z.string().nullable().optional(),
  doctorNotified: z.boolean().default(false)
});

// 7. Hospital Bed Schema (32 beds)
export const bedStatusSchema = z.enum([
  'available',
  'occupied',
  'sanitizing',
  'reserved',
  'icu'
]);

export const bedSchema = z.object({
  id: z.string().min(1), // e.g. ICU-01, ER-01, GW-01, PED-01
  ward: z.enum(['ICU', 'Emergency Trauma', 'General Ward', 'Pediatric Care']),
  number: z.number().min(1),
  status: bedStatusSchema,
  patientName: z.string().nullable().optional(),
  patientId: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  oxygen: z.string().nullable().optional(),
  ventilator: z.boolean().default(false),
  admittedAt: z.string().nullable().optional(),
  doctor: z.string().nullable().optional(),
  cleanMinsLeft: z.number().nullable().optional()
});

// 8. Pharmacy Inventory Item Schema (40 medicines)
export const inventoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Medicine name required'),
  generic: z.string().optional(),
  category: z.string().min(1, 'Category required'),
  batchNo: z.string().min(2, 'Batch/Lot number required'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid expiry date required (YYYY-MM-DD)'),
  currentStock: z.coerce.number().min(0, 'Stock cannot be negative'),
  unit: z.string().default('Tablets'),
  reorderLevel: z.coerce.number().min(1, 'Reorder level required'),
  unitPrice: z.coerce.number().min(0).default(10),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock', 'Expired']).default('In Stock')
});

// 9. Security Audit Log Schema
export const auditLogSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().optional(),
  actorUid: z.string().optional(),
  actorName: z.string().optional(),
  role: z.string().optional(),
  action: z.string().min(1),
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
  details: z.string().min(1)
});

// 10. Emergency Alert Schema
export const emergencyAlertSchema = z.object({
  id: z.string().optional(),
  alertId: z.string().optional(),
  patientId: z.string().optional(),
  patientName: z.string().min(2, 'Patient identification required'),
  severity: z.string().default('Critical (Red)'),
  warningSigns: z.string().min(3, 'Warning signs description required'),
  origin: z.string().default('Triage Screener'),
  status: z.enum(['Active', 'Acknowledged', 'Resolved']).default('Active'),
  createdAt: z.string().optional(),
  acknowledgedBy: z.string().nullable().optional(),
  acknowledgedAt: z.string().nullable().optional(),
  actionTaken: z.string().nullable().optional()
});
