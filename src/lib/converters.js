import {
  userSchema,
  patientSchema,
  tokenSchema,
  consultationSchema,
  prescriptionSchema,
  medicationTaskSchema,
  bedSchema,
  inventoryItemSchema,
  auditLogSchema,
  emergencyAlertSchema
} from './schemas';

/**
 * Creates a typed Firestore data converter with Zod validation
 * @param {import('zod').ZodType} schema 
 */
export const createFirestoreConverter = (schema) => ({
  toFirestore: (data) => {
    // Validate with Zod before writing to Firestore
    const validated = schema.parse(data);
    return { ...validated };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const parsed = schema.safeParse({ id: snapshot.id, ...data });
    if (!parsed.success) {
      console.warn(`[Firestore Converter] Validation warning for document ${snapshot.id}:`, parsed.error.issues);
      return { id: snapshot.id, ...data };
    }
    return parsed.data;
  }
});

// Specific converters for all 9 collections
export const userConverter = createFirestoreConverter(userSchema);
export const patientConverter = createFirestoreConverter(patientSchema);
export const tokenConverter = createFirestoreConverter(tokenSchema);
export const consultationConverter = createFirestoreConverter(consultationSchema);
export const prescriptionConverter = createFirestoreConverter(prescriptionSchema);
export const medicationTaskConverter = createFirestoreConverter(medicationTaskSchema);
export const bedConverter = createFirestoreConverter(bedSchema);
export const inventoryConverter = createFirestoreConverter(inventoryItemSchema);
export const auditLogConverter = createFirestoreConverter(auditLogSchema);
export const emergencyAlertConverter = createFirestoreConverter(emergencyAlertSchema);
