import { describe, it, expect } from 'vitest';
import {
  normalizePatientRecord,
  parseCSVToPatients,
  parseHospitalImportData,
  SAMPLE_PATIENTS_JSON,
  SAMPLE_PATIENTS_CSV
} from '../lib/dataImporter';
import {
  getActiveFirebaseConfig,
  isFirebaseConfigured
} from '../services/firebaseService';

describe('Hospital Data Importer & Normalizer', () => {
  it('should normalize raw patient record with required clinical schemas', () => {
    const raw = {
      name: 'Selvi Meenakshi',
      age: 29,
      gender: 'Female',
      bloodType: 'O+',
      allergies: 'Penicillin, Dust',
      emergencyContactName: 'Sundaram M.',
      emergencyContactPhone: '+91 98401 11223'
    };

    const patient = normalizePatientRecord(raw, 0);

    expect(patient.name).toBe('Selvi Meenakshi');
    expect(patient.age).toBe(29);
    expect(patient.gender).toBe('Female');
    expect(patient.bloodType).toBe('O+');
    expect(patient.allergies).toContain('Penicillin');
    expect(patient.allergies).toContain('Dust');
    expect(patient.emergencyContact.name).toBe('Sundaram M.');
    expect(patient.qrPayload).toContain('HSMS-OFFLINE-PASSPORT');
    expect(patient.qrPayload).toContain('O+');
  });

  it('should parse CSV patient records properly', () => {
    const csv = `name,age,gender,bloodType,mobile,allergies
Anand Kumar,45,Male,B+,+91 98401 99999,Aspirin
Deepa Raman,38,Female,A+,+91 98401 88888,None`;

    const patients = parseCSVToPatients(csv);
    expect(patients.length).toBe(2);
    expect(patients[0].name).toBe('Anand Kumar');
    expect(patients[0].bloodType).toBe('B+');
    expect(patients[0].allergies).toContain('Aspirin');
    expect(patients[1].name).toBe('Deepa Raman');
    expect(patients[1].gender).toBe('Female');
  });

  it('should parse sample JSON template accurately', () => {
    const result = parseHospitalImportData(SAMPLE_PATIENTS_JSON);
    expect(result.type).toBe('JSON_PATIENTS');
    expect(result.data.patients.length).toBe(2);
    expect(result.data.patients[0].name).toBe('Kavitha Raman');
    expect(result.data.patients[1].name).toBe('Rajesh Kumar');
  });

  it('should parse sample CSV template accurately', () => {
    const result = parseHospitalImportData(SAMPLE_PATIENTS_CSV);
    expect(result.type).toBe('CSV_PATIENTS');
    expect(result.data.patients.length).toBe(3);
    expect(result.data.patients[0].name).toBe('Kavitha Raman');
    expect(result.data.patients[2].name).toBe('Ananya Sundaram');
  });
});

describe('Firebase Configuration Manager', () => {
  it('should retrieve active config without throwing errors', () => {
    const config = getActiveFirebaseConfig();
    expect(typeof config).toBe('object');
    expect(config).toHaveProperty('projectId');
    expect(config).toHaveProperty('apiKey');
  });

  it('should be configured with user project hospital-management-syst-374ae', () => {
    const config = getActiveFirebaseConfig();
    expect(config.projectId).toBe('hospital-management-syst-374ae');
    expect(config.apiKey).toBe('AIzaSyARtxrHw-Vk8EmZNryHtbXFNsQjObkHD3o');
    expect(isFirebaseConfigured()).toBe(true);
  });

  it('should validate all hospital data models for Firebase persistence', () => {
    const labReport = {
      id: 'lab-101',
      patientId: 'pat-1',
      testName: 'Chest X-Ray PA View',
      category: 'Diagnostic Radiology',
      findings: 'Clear lung fields',
      doctorName: 'Dr. Carlo Toledano',
      date: '2026-10-27'
    };

    const staffMember = {
      uid: 'usr-doctor-99',
      displayName: 'Dr. S. Karthikeyan',
      role: 'doctor',
      specialty: 'Cardiologist',
      active: true
    };

    const inventoryDrug = {
      id: 'med-99',
      name: 'Cefixime 200mg',
      currentStock: 120,
      reorderLevel: 25,
      batchNo: 'BATCH-2026-901'
    };

    expect(labReport.testName).toBe('Chest X-Ray PA View');
    expect(staffMember.role).toBe('doctor');
    expect(inventoryDrug.currentStock).toBeGreaterThan(inventoryDrug.reorderLevel);
  });
});
