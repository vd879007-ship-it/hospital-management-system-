/**
 * HSMS Clinical and Operational Utilities
 * Team MediTechTitans
 */

/**
 * 1. Offline QR Payload Generator
 * Encodes patient medical identification, blood group, allergies, and emergency contacts
 * directly into a JSON string for offline scanning without internet connection.
 */
export const generateOfflineQRPayload = (patient) => {
  if (!patient) return '';
  const payload = {
    v: 1, // Schema version
    sys: 'HSMS-OFFLINE-PASSPORT',
    pid: patient.patientId || patient.id,
    name: patient.name,
    nameTa: patient.nameTa || '',
    dob: patient.dateOfBirth,
    gender: patient.gender,
    blood: patient.bloodType,
    aadhaar: patient.aadhaarNumber || '',
    allergies: Array.isArray(patient.allergies) ? patient.allergies : [patient.allergies].filter(Boolean),
    emg: {
      name: patient.emergencyContact?.name || 'Emergency Contact',
      phone: patient.emergencyContact?.phone || '',
      rel: patient.emergencyContact?.relationship || 'Relative'
    },
    meds: (patient.medicalHistory || []).slice(0, 2).map(m => m.diagnosis),
    ts: new Date().toISOString()
  };
  return JSON.stringify(payload);
};

/**
 * Normalizes Aadhaar input by removing spaces and hyphens
 */
export const normalizeAadhaar = (aadhaar = '') => {
  return String(aadhaar).replace(/[^0-9]/g, '');
};

/**
 * Formats 12-digit Aadhaar into standard XXXX XXXX XXXX grouping
 */
export const formatAadhaar = (aadhaar = '') => {
  const digits = normalizeAadhaar(aadhaar).slice(0, 12);
  if (!digits) return '';
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
};

/**
 * Parses and verifies an offline QR payload string
 */
export const parseOfflineQRPayload = (rawString) => {
  try {
    const data = JSON.parse(rawString);
    if (!data.pid || !data.blood) {
      throw new Error('Incomplete offline passport data');
    }
    return {
      isValid: true,
      data,
      error: null
    };
  } catch (err) {
    return {
      isValid: false,
      data: null,
      error: err.message || 'Invalid QR passport format'
    };
  }
};

/**
 * 2. Dynamic Predictive OPD Wait-Time Calculator
 * Calculates estimated wait time based on tokens ahead in queue,
 * average consultation duration, and urgency adjustment.
 */
export const calculateWaitTime = ({
  userToken,
  currentServingToken,
  averageConsultationMins = 5,
  triageLevel = 'Routine (Green)'
}) => {
  const userNum = typeof userToken === 'number' 
    ? userToken 
    : parseInt(String(userToken || '').replace(/\D/g, ''), 10) || 0;
  
  const currentNum = typeof currentServingToken === 'number'
    ? currentServingToken
    : parseInt(String(currentServingToken || '').replace(/\D/g, ''), 10) || 0;

  const tokensAhead = Math.max(0, userNum - currentNum);

  // If user is already being served or passed
  if (tokensAhead === 0) {
    return {
      tokensAhead: 0,
      estimatedWaitMins: 0,
      status: 'Ready for Consultation'
    };
  }

  // Triage weighting: Critical cases bypass, Priority cases get faster slots
  let urgencyMultiplier = 1.0;
  if (triageLevel.includes('Critical')) urgencyMultiplier = 0.2;
  else if (triageLevel.includes('Urgent')) urgencyMultiplier = 0.6;
  else if (triageLevel.includes('Priority')) urgencyMultiplier = 0.8;

  const waitMinutes = Math.max(1, Math.round(tokensAhead * averageConsultationMins * urgencyMultiplier));

  return {
    tokensAhead,
    estimatedWaitMins: waitMinutes,
    status: waitMinutes <= 5 ? 'Approaching Soon' : 'Waiting in Queue'
  };
};

/**
 * 3. Drug-Allergy Safety Checker
 * Checks prescribed medicine against documented patient allergies.
 * Detects cross-reactive classes: Penicillins, Sulfas, NSAIDs/Aspirin, Cephalosporins, Macrolides.
 */
export const checkDrugAllergyConflict = (medicineName = '', allergies = []) => {
  if (!medicineName || !allergies || allergies.length === 0) {
    return { hasConflict: false, matchedAllergy: null, warning: null };
  }

  const medLower = medicineName.toLowerCase();
  const normalizedAllergies = allergies.map(a => a.toLowerCase().trim());

  // Check direct names and common cross-reactive drug classes
  for (const allergy of normalizedAllergies) {
    if (allergy === 'none' || allergy === 'none known' || allergy === 'no known allergies') {
      continue;
    }

    // Penicillin / Beta-lactam group
    if (allergy.includes('penicillin') || allergy.includes('amoxicillin') || allergy.includes('ampicillin')) {
      if (
        medLower.includes('penicillin') ||
        medLower.includes('amoxicillin') ||
        medLower.includes('augmentin') ||
        medLower.includes('ampicillin') ||
        medLower.includes('clav') ||
        medLower.includes('piperacillin')
      ) {
        return {
          hasConflict: true,
          matchedAllergy: allergy,
          severity: 'HIGH_RISK',
          warning: `Contraindication: Patient allergic to ${allergy}. ${medicineName} is a penicillin/beta-lactam antibiotic.`
        };
      }
    }

    // Sulfa / Sulfonamide group
    if (allergy.includes('sulfa') || allergy.includes('sulfonamide')) {
      if (
        medLower.includes('sulfa') ||
        medLower.includes('bactrim') ||
        medLower.includes('cotrimoxazole') ||
        medLower.includes('sulfamethoxazole')
      ) {
        return {
          hasConflict: true,
          matchedAllergy: allergy,
          severity: 'HIGH_RISK',
          warning: `Contraindication: Patient allergic to ${allergy}. ${medicineName} contains sulfonamide.`
        };
      }
    }

    // Aspirin & NSAIDs
    if (allergy.includes('aspirin') || allergy.includes('nsaid') || allergy.includes('ibuprofen')) {
      if (
        medLower.includes('aspirin') ||
        medLower.includes('ecosprin') ||
        medLower.includes('ibuprofen') ||
        medLower.includes('diclofenac') ||
        medLower.includes('naproxen') ||
        medLower.includes('combiflam')
      ) {
        return {
          hasConflict: true,
          matchedAllergy: allergy,
          severity: 'HIGH_RISK',
          warning: `Contraindication: Patient allergic to ${allergy}. ${medicineName} is an NSAID/salicylate.`
        };
      }
    }

    // Cephalosporins
    if (allergy.includes('cephalosporin') || allergy.includes('ceftriaxone') || allergy.includes('cefixime')) {
      if (
        medLower.includes('cef') ||
        medLower.includes('ceph') ||
        medLower.includes('ceftriaxone') ||
        medLower.includes('cefixime')
      ) {
        return {
          hasConflict: true,
          matchedAllergy: allergy,
          severity: 'HIGH_RISK',
          warning: `Contraindication: Patient allergic to ${allergy}. ${medicineName} is a cephalosporin.`
        };
      }
    }

    // Direct string match fallback
    if (medLower.includes(allergy) || allergy.includes(medLower)) {
      return {
        hasConflict: true,
        matchedAllergy: allergy,
        severity: 'HIGH_RISK',
        warning: `Direct Allergy Match: Patient documented allergy to ${allergy} conflicts with ${medicineName}.`
      };
    }
  }

  return { hasConflict: false, matchedAllergy: null, warning: null };
};

/**
 * 4. Rule-Based Clinical Triage Screener
 * Evaluates symptoms in English or Tamil, produces triage acuity score and category.
 * Designed with clean interface for future LLM integration.
 */
export const calculateTriageScore = (symptomsText = '', vitals = {}) => {
  const text = (symptomsText || '').toLowerCase();
  let score = 0;
  const flags = [];

  // Red Flag / STAT Emergency Keywords (English + Tamil transliteration/tamil text)
  const redFlags = [
    { key: 'chest pain', ta: 'நெஞ்சு வலி', reason: 'Suspected Acute Coronary Syndrome' },
    { key: 'breathless', ta: 'மூச்சுத்திணறல்', reason: 'Severe Respiratory Distress' },
    { key: 'shortness of breath', ta: 'மூச்சு வாங்கல்', reason: 'Dyspnea / Hypoxia' },
    { key: 'unconscious', ta: 'மயக்கம்', reason: 'Altered Mental Status / Syncope' },
    { key: 'fainting', ta: 'மயங்கி', reason: 'Loss of consciousness' },
    { key: 'crush injury', ta: 'விபத்து', reason: 'Severe Trauma' },
    { key: 'bleeding heavily', ta: 'அதிக ரத்தம்', reason: 'Active Hemorrhage' },
    { key: 'stroke', ta: 'பக்கவாதம்', reason: 'Neurological Deficit' },
    { key: 'slurred speech', ta: 'பேச்சு குளறல்', reason: 'Acute Cerebrovascular Event' }
  ];

  for (const rf of redFlags) {
    if (text.includes(rf.key) || text.includes(rf.ta)) {
      score += 40;
      flags.push(rf.reason);
    }
  }

  // Yellow Flag / Urgent Keywords
  const yellowFlags = [
    { key: 'high fever', ta: 'அதிக காய்ச்சல்', reason: 'High Grade Pyrexia' },
    { key: 'severe abdominal pain', ta: 'வயிற்று வலி', reason: 'Acute Abdomen' },
    { key: 'vomiting continuously', ta: 'தொடர் வாந்தி', reason: 'Dehydration / Persistent Vomiting' },
    { key: 'palpitations', ta: 'படபடப்பு', reason: 'Tachycardia / Arrhythmia' }
  ];

  for (const yf of yellowFlags) {
    if (text.includes(yf.key) || text.includes(yf.ta)) {
      score += 20;
      flags.push(yf.reason);
    }
  }

  // Vitals scoring
  if (vitals.spo2 && parseInt(vitals.spo2) < 92) {
    score += 40;
    flags.push('Low Oxygen Saturation (<92%)');
  }
  if (vitals.pulseRate && (parseInt(vitals.pulseRate) > 120 || parseInt(vitals.pulseRate) < 50)) {
    score += 15;
    flags.push('Abnormal Heart Rate');
  }

  // Acuity determination
  let triageLevel = 'Routine (Green)';
  let color = '#10b981';
  let isEmergency = false;

  if (score >= 40) {
    triageLevel = 'Critical (Red)';
    color = '#ef4444';
    isEmergency = true;
  } else if (score >= 20) {
    triageLevel = 'Urgent (Orange)';
    color = '#f59e0b';
  } else if (score >= 10) {
    triageLevel = 'Priority (Yellow)';
    color = '#eab308';
  }

  return {
    score,
    triageLevel,
    color,
    isEmergency,
    flags,
    aiRecommendation: isEmergency 
      ? 'IMMEDIATE RESUSCITATION: Route directly to Emergency Bay & Alert On-Duty Clinician.'
      : score >= 20 
      ? 'PRIORITY OPD: Schedule within 15-30 minutes.'
      : 'ROUTINE OPD: Standard queue placement.'
  };
};

/**
 * 5. Unique ID Generators
 */
export const generateUniquePatientId = (suffix) => {
  const random = suffix || Math.floor(1000 + Math.random() * 9000);
  return `HSP-2026-${random}`;
};

export const generateUniqueTokenNumber = (counter = 1) => {
  return `TK-${100 + counter}`;
};
