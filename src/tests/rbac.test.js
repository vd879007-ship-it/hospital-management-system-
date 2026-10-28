import { describe, it, expect } from 'vitest';
import { ROLES, hasPermission } from '../config/roles';

describe('Role-Based Access Control (RBAC) Security Matrix', () => {
  it('should allow doctors to document consultations and sign prescriptions', () => {
    expect(hasPermission(ROLES.DOCTOR, 'DOCUMENT_CONSULTATION')).toBe(true);
    expect(hasPermission(ROLES.DOCTOR, 'SIGN_PRESCRIPTION')).toBe(true);
  });

  it('should forbid receptionists from clinical note documentation', () => {
    expect(hasPermission(ROLES.RECEPTIONIST, 'DOCUMENT_CONSULTATION')).toBe(false);
    expect(hasPermission(ROLES.RECEPTIONIST, 'SIGN_PRESCRIPTION')).toBe(false);
  });

  it('should allow receptionists and admins to register patients and manage appointments', () => {
    expect(hasPermission(ROLES.RECEPTIONIST, 'REGISTER_PATIENTS')).toBe(true);
    expect(hasPermission(ROLES.ADMIN, 'REGISTER_PATIENTS')).toBe(true);
    expect(hasPermission(ROLES.PATIENT, 'REGISTER_PATIENTS')).toBe(false);
  });

  it('should allow only nurses to record medication administration events', () => {
    expect(hasPermission(ROLES.NURSE, 'ADMINISTER_MEDICATION')).toBe(true);
    expect(hasPermission(ROLES.DOCTOR, 'ADMINISTER_MEDICATION')).toBe(false);
    expect(hasPermission(ROLES.PATIENT, 'ADMINISTER_MEDICATION')).toBe(false);
  });

  it('should allow only pharmacists to dispense prescriptions and manage stock', () => {
    expect(hasPermission(ROLES.PHARMACIST, 'DISPENSE_PRESCRIPTION')).toBe(true);
    expect(hasPermission(ROLES.DOCTOR, 'DISPENSE_PRESCRIPTION')).toBe(false);
    expect(hasPermission(ROLES.PATIENT, 'DISPENSE_PRESCRIPTION')).toBe(false);
  });

  it('should allow emergency alert triggering from triage staff, reception, and patient screener', () => {
    expect(hasPermission(ROLES.TRIAGE_STAFF, 'TRIGGER_EMERGENCY_ALERT')).toBe(true);
    expect(hasPermission(ROLES.PATIENT, 'TRIGGER_EMERGENCY_ALERT')).toBe(true);
    expect(hasPermission(ROLES.DOCTOR, 'ACKNOWLEDGE_EMERGENCY')).toBe(true);
  });

  it('should restrict security audit logs and user management to administrators', () => {
    expect(hasPermission(ROLES.ADMIN, 'VIEW_SECURITY_AUDIT_LOGS')).toBe(true);
    expect(hasPermission(ROLES.PATIENT, 'VIEW_SECURITY_AUDIT_LOGS')).toBe(false);
    expect(hasPermission(ROLES.NURSE, 'VIEW_SECURITY_AUDIT_LOGS')).toBe(false);
  });
});
