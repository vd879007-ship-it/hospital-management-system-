import { describe, it, expect } from 'vitest';
import {
  patientRegistrationSchema,
  appointmentBookingSchema,
  consultationSchema,
  prescriptionItemSchema,
  emergencyAlertSchema,
  inventoryItemSchema
} from '../schemas';

describe('Zod Validation Schemas', () => {
  it('should validate valid patient registration data', () => {
    const validPatient = {
      name: 'Ramesh Sundaram',
      age: 42,
      gender: 'Male',
      dateOfBirth: '1984-03-12',
      bloodType: 'B+',
      mobile: '+91 94441 22334',
      email: 'ramesh.s@test.com',
      emergencyContactName: 'Geetha Sundaram',
      emergencyContactPhone: '+91 94441 99887',
      emergencyContactRel: 'Spouse',
      preferredLanguage: 'ta',
    };
    const result = patientRegistrationSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
  });

  it('should reject invalid patient registration when required fields are missing', () => {
    const invalidPatient = {
      name: 'R', // too short
      age: -5,  // negative age
    };
    const result = patientRegistrationSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it('should validate consultation documentation with clinical assessment', () => {
    const validConsult = {
      patientId: 'pat-1',
      doctorId: 'doc-1',
      diagnosis: 'Acute Bronchitis',
      notes: 'Bilateral rhonchi present on auscultation.',
      followUpDays: 7,
    };
    const result = consultationSchema.safeParse(validConsult);
    expect(result.success).toBe(true);
  });

  it('should validate prescription items with standardized 1-0-1 dosage', () => {
    const validPrescriptionItem = {
      name: 'Amoxicillin + Clavulanate (Augmentin)',
      strength: '625 mg',
      dose: '1 tablet',
      frequency: '1-0-1 (Twice Daily)',
      duration: '5 Days',
      route: 'Oral (After Food)',
      quantity: 10,
    };
    const result = prescriptionItemSchema.safeParse(validPrescriptionItem);
    expect(result.success).toBe(true);
  });

  it('should validate emergency alert data', () => {
    const validAlert = {
      patientName: 'Emergency Trauma Patient #1',
      warningSigns: 'Acute crush injury, massive blood loss, unreactive pupils',
      origin: 'Ambulance Triage Bay',
      severity: 'Critical (Red)',
    };
    const result = emergencyAlertSchema.safeParse(validAlert);
    expect(result.success).toBe(true);
  });

  it('should validate inventory item with non-negative stock and threshold', () => {
    const validInventory = {
      name: 'Paracetamol',
      category: 'Analgesic',
      batchNo: 'DOL-2026-44B',
      expiryDate: '2028-01-15',
      currentStock: 480,
      reorderLevel: 100,
    };
    const result = inventoryItemSchema.safeParse(validInventory);
    expect(result.success).toBe(true);
  });
});
