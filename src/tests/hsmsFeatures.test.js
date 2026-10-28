import { describe, it, expect } from 'vitest';
import {
  generateOfflineQRPayload,
  parseOfflineQRPayload,
  calculateWaitTime,
  checkDrugAllergyConflict,
  calculateTriageScore,
  generateUniquePatientId,
  formatAadhaar,
  normalizeAadhaar
} from '../lib/utils';
import { abdmAdapter } from '../lib/abdmAdapter';
import { SEED_BEDS, SEED_INVENTORY, SEED_PATIENTS } from '../lib/seedData';

describe('HSMS Core Clinical & Operational Algorithms', () => {
  // 1. Offline QR Passport Encoding & Decoding
  describe('Offline QR Health Passport Payload', () => {
    it('should encode blood group, allergies, and emergency contacts in QR payload', () => {
      const mockPatient = {
        patientId: 'HSP-2026-1001',
        name: 'Thirunavukkarasu Muthukumar',
        nameTa: 'திருநாவுக்கரசு',
        dateOfBirth: '1992-05-15',
        gender: 'Male',
        bloodType: 'O+',
        allergies: ['Aspirin', 'Amoxicillin'],
        emergencyContact: {
          name: 'Maria Santos',
          phone: '+91 98401 99887',
          relationship: 'Spouse'
        }
      };

      const payloadString = generateOfflineQRPayload(mockPatient);
      expect(typeof payloadString).toBe('string');
      expect(payloadString).toContain('HSMS-OFFLINE-PASSPORT');
      expect(payloadString).toContain('O+');
      expect(payloadString).toContain('Amoxicillin');
      expect(payloadString).toContain('Maria Santos');

      // Offline scanner verification
      const parsed = parseOfflineQRPayload(payloadString);
      expect(parsed.isValid).toBe(true);
      expect(parsed.data.pid).toBe('HSP-2026-1001');
      expect(parsed.data.blood).toBe('O+');
      expect(parsed.data.allergies).toContain('Amoxicillin');
      expect(parsed.data.emg.phone).toBe('+91 98401 99887');
    });

    it('should fail gracefully on invalid or corrupted QR strings', () => {
      const invalid = parseOfflineQRPayload('NOT_A_JSON_STRING');
      expect(invalid.isValid).toBe(false);
      expect(invalid.data).toBeNull();
    });
  });

  // 2. Drug-Allergy Safety Checker
  describe('Drug-Allergy Safety Validation', () => {
    it('should block penicillin-class antibiotic for penicillin-allergic patient', () => {
      const allergies = ['Penicillin', 'Sulfa'];
      const conflict = checkDrugAllergyConflict('Amoxicillin + Clavulanate (Augmentin)', allergies);
      expect(conflict.hasConflict).toBe(true);
      expect(conflict.severity).toBe('HIGH_RISK');
      expect(conflict.warning).toContain('penicillin/beta-lactam');
    });

    it('should block sulfonamide antibiotic for sulfa-allergic patient', () => {
      const allergies = ['Sulfa Drugs'];
      const conflict = checkDrugAllergyConflict('Cotrimoxazole (Bactrim DS)', allergies);
      expect(conflict.hasConflict).toBe(true);
      expect(conflict.warning).toContain('sulfonamide');
    });

    it('should block NSAIDs for aspirin-allergic patient', () => {
      const allergies = ['Aspirin'];
      const conflict = checkDrugAllergyConflict('Ibuprofen 400mg', allergies);
      expect(conflict.hasConflict).toBe(true);
      expect(conflict.warning).toContain('NSAID');
    });

    it('should permit non-conflicting medication safely', () => {
      const allergies = ['Penicillin'];
      const conflict = checkDrugAllergyConflict('Paracetamol (Dolo 650)', allergies);
      expect(conflict.hasConflict).toBe(false);
      expect(conflict.warning).toBeNull();
    });
  });

  // 3. Dynamic Predictive Wait-Time Calculator
  describe('Predictive Dynamic OPD Queue Wait-Time', () => {
    it('should calculate accurate wait time based on tokens ahead', () => {
      const wait = calculateWaitTime({
        userToken: 'TK-105',
        currentServingToken: 'TK-101',
        averageConsultationMins: 5,
        triageLevel: 'Routine (Green)'
      });

      expect(wait.tokensAhead).toBe(4);
      expect(wait.estimatedWaitMins).toBe(20); // 4 * 5 mins
      expect(wait.status).toBe('Waiting in Queue');
    });

    it('should accelerate wait time for Critical/Emergency triage level (Queue Jump)', () => {
      const wait = calculateWaitTime({
        userToken: 'TK-105',
        currentServingToken: 'TK-101',
        averageConsultationMins: 5,
        triageLevel: 'Critical (Red)'
      });

      // 4 * 5 * 0.2 = 4 minutes
      expect(wait.estimatedWaitMins).toBeLessThanOrEqual(4);
    });

    it('should return 0 minutes when patient is currently being served', () => {
      const wait = calculateWaitTime({
        userToken: 'TK-101',
        currentServingToken: 'TK-101'
      });
      expect(wait.tokensAhead).toBe(0);
      expect(wait.estimatedWaitMins).toBe(0);
      expect(wait.status).toBe('Ready for Consultation');
    });
  });

  // 4. Multilingual Clinical Triage Screener
  describe('Multilingual Symptom Triage Scoring', () => {
    it('should flag Tamil chest pain symptoms as Critical (Red)', () => {
      const result = calculateTriageScore('நோயாளிக்கு கடுமையான நெஞ்சு வலி உள்ளது மற்றும் அதிக வியர்வை');
      expect(result.isEmergency).toBe(true);
      expect(result.triageLevel).toBe('Critical (Red)');
      expect(result.flags).toContain('Suspected Acute Coronary Syndrome');
    });

    it('should flag English respiratory distress symptoms as Critical (Red)', () => {
      const result = calculateTriageScore('Patient has severe breathless feeling and chest pain');
      expect(result.isEmergency).toBe(true);
      expect(result.triageLevel).toBe('Critical (Red)');
    });

    it('should classify mild routine symptoms as Routine (Green)', () => {
      const result = calculateTriageScore('Mild seasonal runny nose and sneezing for 2 days');
      expect(result.isEmergency).toBe(false);
      expect(result.triageLevel).toBe('Routine (Green)');
    });
  });

  // 5. Interactive 32-Bed Capacity & Transfer
  describe('Hospital Bed & Ward Capacity', () => {
    it('should provide exactly 32 total beds partitioned across departments', () => {
      expect(SEED_BEDS.length).toBe(32);
      const icuBeds = SEED_BEDS.filter(b => b.ward === 'ICU');
      const erBeds = SEED_BEDS.filter(b => b.ward === 'Emergency Trauma');
      const gwBeds = SEED_BEDS.filter(b => b.ward === 'General Ward');
      const pedBeds = SEED_BEDS.filter(b => b.ward === 'Pediatric Care');

      expect(icuBeds.length).toBe(8);
      expect(erBeds.length).toBe(6);
      expect(gwBeds.length).toBe(12);
      expect(pedBeds.length).toBe(6);
    });
  });

  // 6. ABDM Adapter Stub Interface
  describe('Ayushman Bharat Digital Mission (ABDM) Adapter', () => {
    it('should generate valid ABHA Health ID format', async () => {
      const abha = await abdmAdapter.generateABHA('+919840123456', 'dinesh.kumar');
      expect(abha.success).toBe(true);
      expect(abha.abhaAddress).toContain('@abdm');
      expect(abha.abhaNumber).toMatch(/^91-\d{4}-\d{4}-\d{4}$/);
    });

    it('should verify ABHA address correctly', async () => {
      const verification = await abdmAdapter.verifyABHA('patient.1001@abdm');
      expect(verification.success).toBe(true);
      expect(verification.status).toBe('ACTIVE');
    });
  });

  // 7. Inventory & Patient ID Formats
  describe('Inventory & ID Integrity', () => {
    it('should verify inventory seed has 40 medicines', () => {
      expect(SEED_INVENTORY.length).toBe(40);
    });

    it('should generate standardized patient ID format HSP-2026-XXXX', () => {
      const pid = generateUniquePatientId(7721);
      expect(pid).toBe('HSP-2026-7721');
    });
  });

  // 8. Universal Aadhaar Lifetime Electronic Health Record (EHR) System
  describe('Universal Aadhaar Cross-Hospital Lifetime EHR', () => {
    it('should correctly format raw 12-digit numbers into 4-4-4 Aadhaar chunks', () => {
      expect(formatAadhaar('234567890123')).toBe('2345 6789 0123');
      expect(formatAadhaar('2345 6789 0123')).toBe('2345 6789 0123');
      expect(formatAadhaar('234567')).toBe('2345 67');
    });

    it('should normalize formatted Aadhaar UID by removing whitespace and non-digits', () => {
      expect(normalizeAadhaar('2345 6789 0123')).toBe('234567890123');
      expect(normalizeAadhaar('2345-6789-0123')).toBe('234567890123');
    });

    it('should verify seed patients have 12-digit Aadhaar numbers and multi-hospital records', () => {
      const patient = SEED_PATIENTS[0];
      expect(patient.aadhaarNumber).toBeDefined();
      expect(normalizeAadhaar(patient.aadhaarNumber).length).toBe(12);

      // Verify cross-hospital diagnostic lab test reports
      expect(patient.labReports).toBeDefined();
      expect(patient.labReports.length).toBeGreaterThan(0);
      expect(patient.labReports[0]).toHaveProperty('test');
      expect(patient.labReports[0]).toHaveProperty('hospital');
      expect(patient.labReports[0]).toHaveProperty('result');

      // Verify past tablets/medications taken across hospitals
      expect(patient.pastMedications).toBeDefined();
      expect(patient.pastMedications.length).toBeGreaterThan(0);
      expect(patient.pastMedications[0]).toHaveProperty('medicineName');
      expect(patient.pastMedications[0]).toHaveProperty('hospital');

      // Verify surgical operations taken across hospitals
      expect(patient.surgeries).toBeDefined();
      expect(patient.surgeries.length).toBeGreaterThan(0);
      expect(patient.surgeries[0]).toHaveProperty('surgeryName');
      expect(patient.surgeries[0]).toHaveProperty('hospital');
    });

    it('should find patient records using raw or formatted 12-digit Aadhaar UID', () => {
      const target = SEED_PATIENTS[0];
      const normalizedTarget = normalizeAadhaar(target.aadhaarNumber);

      const foundRaw = SEED_PATIENTS.find(
        p => normalizeAadhaar(p.aadhaarNumber) === normalizedTarget
      );
      const foundFormatted = SEED_PATIENTS.find(
        p => normalizeAadhaar(p.aadhaarNumber) === normalizeAadhaar(target.aadhaarNumber)
      );

      expect(foundRaw).toBeDefined();
      expect(foundFormatted).toBeDefined();
      expect(foundRaw.name).toBe(target.name);
    });
  });
});
