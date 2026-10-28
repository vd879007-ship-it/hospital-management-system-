// Comprehensive 7-Role Definition and Permission Matrix for Hospital Smart Management System

export const ROLES = {
  PATIENT: 'patient',
  RECEPTIONIST: 'receptionist',
  TRIAGE_STAFF: 'triage_staff',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PHARMACIST: 'pharmacist',
  ADMIN: 'admin',
};

export const ROLE_DETAILS = {
  [ROLES.PATIENT]: {
    id: ROLES.PATIENT,
    label: 'Patient',
    labelTa: 'நோயாளி',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: 'Personal health passport, appointment booking, token tracking, symptom screening, and prescriptions',
  },
  [ROLES.RECEPTIONIST]: {
    id: ROLES.RECEPTIONIST,
    label: 'Receptionist',
    labelTa: 'வரவேற்பாளர்',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Patient registration, appointment scheduling, routine token queue, check-in, and QR lookup',
  },
  [ROLES.TRIAGE_STAFF]: {
    id: ROLES.TRIAGE_STAFF,
    label: 'Triage Staff',
    labelTa: 'டிரையாஜ் பணியாளர்',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Multilingual symptom screening review, clinical acuity routing, and Code Red emergency escalation',
  },
  [ROLES.DOCTOR]: {
    id: ROLES.DOCTOR,
    label: 'Doctor / Clinician',
    labelTa: 'மருத்துவர்',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Outpatient consultation, clinical assessment, digital tamper-evident prescriptions, and lab requests',
  },
  [ROLES.NURSE]: {
    id: ROLES.NURSE,
    label: 'Nurse (RN)',
    labelTa: 'செவிலியர்',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'eMAR medication administration rounds, vital signs monitoring, and mandatory delay/omission logs',
  },
  [ROLES.PHARMACIST]: {
    id: ROLES.PHARMACIST,
    label: 'Pharmacist',
    labelTa: 'மருந்தாளுநர்',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'Doctor-signed prescription dispensary, batch & expiry monitoring, atomic inventory stock deduction',
  },
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    label: 'Hospital Administrator',
    labelTa: 'மருத்துவமனை நிர்வாகி',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Operational analytics, wait times, staff workload, security audit trail, and user management',
  },
};

// Centralized Permission Matrix
export const PERMISSIONS = {
  // Patient Permissions
  VIEW_OWN_PASSPORT: [ROLES.PATIENT, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.TRIAGE_STAFF, ROLES.NURSE],
  BOOK_OWN_APPOINTMENT: [ROLES.PATIENT, ROLES.RECEPTIONIST],
  SELF_SCREEN_SYMPTOMS: [ROLES.PATIENT, ROLES.TRIAGE_STAFF],

  // Receptionist Permissions
  REGISTER_PATIENTS: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  MANAGE_APPOINTMENTS: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  ADVANCE_ROUTINE_QUEUE: [ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.ADMIN],
  SCAN_PATIENT_QR: [ROLES.RECEPTIONIST, ROLES.TRIAGE_STAFF, ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST],

  // Triage Staff Permissions
  REVIEW_TRIAGE_SUMMARIES: [ROLES.TRIAGE_STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  TRIGGER_EMERGENCY_ALERT: [ROLES.TRIAGE_STAFF, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT],
  ACKNOWLEDGE_EMERGENCY: [ROLES.TRIAGE_STAFF, ROLES.DOCTOR, ROLES.NURSE, ROLES.ADMIN],

  // Doctor Permissions
  DOCUMENT_CONSULTATION: [ROLES.DOCTOR],
  SIGN_PRESCRIPTION: [ROLES.DOCTOR],
  ORDER_LAB_TESTS: [ROLES.DOCTOR],
  APPROVE_DISCHARGE: [ROLES.DOCTOR],

  // Nurse Permissions
  VIEW_MEDICATION_TASKS: [ROLES.NURSE, ROLES.DOCTOR, ROLES.ADMIN],
  ADMINISTER_MEDICATION: [ROLES.NURSE],
  RECORD_MISSED_DOSE: [ROLES.NURSE],

  // Pharmacist Permissions
  DISPENSE_PRESCRIPTION: [ROLES.PHARMACIST],
  MANAGE_INVENTORY: [ROLES.PHARMACIST, ROLES.ADMIN],
  RESTOCK_MEDICINES: [ROLES.PHARMACIST, ROLES.ADMIN],

  // Administrator Permissions
  VIEW_OPERATIONAL_ANALYTICS: [ROLES.ADMIN, ROLES.DOCTOR],
  VIEW_SECURITY_AUDIT_LOGS: [ROLES.ADMIN],
  MANAGE_HOSPITAL_USERS: [ROLES.ADMIN],
  EXPORT_OPERATIONAL_REPORTS: [ROLES.ADMIN],
};

export const hasPermission = (userRole, permissionKey) => {
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) return false;
  const normalizedRole = userRole === 'reception' ? ROLES.RECEPTIONIST : userRole;
  return allowedRoles.includes(normalizedRole);
};
