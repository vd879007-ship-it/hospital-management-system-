import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  connectFirestoreEmulator,
  onSnapshot
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/**
 * Hospital Smart Management System (HSMS) - Firebase Service
 * Connected to Firebase project: hospital-management-syst-374ae
 */

// User's Firebase project configuration
const DEFAULT_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyARtxrHw-Vk8EmZNryHtbXFNsQjObkHD3o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hospital-management-syst-374ae.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hospital-management-syst-374ae',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hospital-management-syst-374ae.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '192193607357',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:192193607357:web:b70f014ffcb1c3e452e9d4',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-C4BJM8RK4F'
};

// Retrieve active Firebase configuration (priority: localStorage custom config -> .env)
export const getActiveFirebaseConfig = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('hsms_firebase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.projectId && parsed.apiKey) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Firebase] Failed to read custom config from localStorage:', err);
  }
  return DEFAULT_CONFIG;
};

// Check if valid Firebase credentials are provided
export const isFirebaseConfigured = () => {
  const config = getActiveFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.projectId &&
    config.apiKey !== 'your_firebase_api_key_placeholder' &&
    config.apiKey !== 'demo-hsms-api-key'
  );
};

// Save custom Firebase configuration to localStorage and re-initialize
export const saveCustomFirebaseConfig = (config) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hsms_firebase_config', JSON.stringify(config));
  }
  // Reset cached app
  reinitializeFirebase();
};

// Clear custom Firebase configuration
export const clearCustomFirebaseConfig = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('hsms_firebase_config');
  }
  reinitializeFirebase();
};

let activeApp = null;
let activeDb = null;
let activeAuth = null;
let activeAnalytics = null;

// Initialize or retrieve Firebase App & Firestore
export const getFirebaseInstance = () => {
  const config = getActiveFirebaseConfig();

  if (!activeApp) {
    if (getApps().length === 0) {
      activeApp = initializeApp(config);
    } else {
      activeApp = getApp();
    }

    activeDb = getFirestore(activeApp);
    activeAuth = getAuth(activeApp);

    // Initialize Analytics if supported in browser
    if (typeof window !== 'undefined') {
      isSupported().then(supported => {
        if (supported && !activeAnalytics && activeApp) {
          activeAnalytics = getAnalytics(activeApp);
        }
      }).catch(() => {});
    }

    // Only connect to emulator if explicitly instructed in .env
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(activeDb, '127.0.0.1', 8080);
        connectAuthEmulator(activeAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
        console.info('[Firebase] Connected to local Firebase Emulators (Firestore: 8080, Auth: 9099)');
      } catch (err) {
        console.debug('[Firebase] Emulator connection notice:', err.message);
      }
    }
  }

  return { app: activeApp, db: activeDb, auth: activeAuth, analytics: activeAnalytics };
};

// Re-initialize Firebase with updated config
export const reinitializeFirebase = async () => {
  if (activeApp) {
    try {
      await deleteApp(activeApp);
    } catch (e) {
      // Ignore delete errors
    }
    activeApp = null;
    activeDb = null;
    activeAuth = null;
  }
  return getFirebaseInstance();
};

// Helper to sanitize data (remove undefined and functions before sending to Firestore)
const sanitizeForFirestore = (obj) => {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj));
};

// 1. Save single document to any collection
export const saveDocumentToFirestore = async (collectionName, docId, data) => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, collectionName, String(docId));
    const cleanData = sanitizeForFirestore(data);
    await setDoc(docRef, { ...cleanData, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, docId };
  } catch (err) {
    console.error(`[Firebase] Error writing to ${collectionName}/${docId}:`, err);
    return { success: false, error: err.message };
  }
};

// 2. Delete single document
export const deleteDocumentFromFirestore = async (collectionName, docId) => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.error(`[Firebase] Error deleting ${collectionName}/${docId}:`, err);
    return { success: false, error: err.message };
  }
};

// 3. Bulk Import Data to Firestore
export const bulkImportToFirestore = async (dataBundle) => {
  // dataBundle: { patients: [], appointments: [], prescriptions: [], inventory: [], beds: [] }
  try {
    const { db } = getFirebaseInstance();
    let totalSaved = 0;
    const errors = [];

    const collectionMap = {
      patients: dataBundle.patients || [],
      appointments: dataBundle.appointments || [],
      prescriptions: dataBundle.prescriptions || [],
      medication_tasks: dataBundle.medicationTasks || [],
      inventory: dataBundle.inventory || [],
      beds: dataBundle.beds || [],
      emergency_alerts: dataBundle.emergencyAlerts || [],
      audit_logs: dataBundle.auditLogs || []
    };

    for (const [colName, items] of Object.entries(collectionMap)) {
      if (!Array.isArray(items) || items.length === 0) continue;

      // Firestore batch size limit is 500 operations
      const chunkSize = 250;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        chunk.forEach(item => {
          const docId = String(
            item.id || item.patientId || item.tokenNumber || `${colName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
          );
          const docRef = doc(db, colName, docId);
          const cleanItem = sanitizeForFirestore(item);
          batch.set(docRef, { ...cleanItem, syncedAt: new Date().toISOString() }, { merge: true });
          totalSaved++;
        });

        await batch.commit();
      }
    }

    return { success: true, count: totalSaved, error: null };
  } catch (err) {
    console.error('[Firebase] Bulk import error:', err);
    const isPermissionDenied = err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED');
    return {
      success: false,
      count: 0,
      permissionDenied: isPermissionDenied,
      error: isPermissionDenied
        ? 'Firebase Security Rules Blocked: In Firebase Console -> Firestore Database -> Rules, set "allow read, write: if true;" and click Publish.'
        : err.message
    };
  }
};

// 4. Fetch entire collection from Firestore
export const fetchCollectionFromFirestore = async (collectionName) => {
  try {
    const { db } = getFirebaseInstance();
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items = [];
    querySnapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return { success: true, items };
  } catch (err) {
    console.error(`[Firebase] Error fetching collection ${collectionName}:`, err);
    return { success: false, items: [], error: err.message };
  }
};

// 5. Fetch all hospital data from Firestore (for Pull / Sync)
export const fetchAllFromFirestore = async () => {
  try {
    const [pats, apts, rxs, tasks, inv, bedsRes, usersRes, alertsRes, logsRes, labsRes] = await Promise.all([
      fetchCollectionFromFirestore('patients'),
      fetchCollectionFromFirestore('appointments'),
      fetchCollectionFromFirestore('prescriptions'),
      fetchCollectionFromFirestore('medication_tasks'),
      fetchCollectionFromFirestore('inventory'),
      fetchCollectionFromFirestore('beds'),
      fetchCollectionFromFirestore('users'),
      fetchCollectionFromFirestore('emergency_alerts'),
      fetchCollectionFromFirestore('audit_logs'),
      fetchCollectionFromFirestore('lab_reports')
    ]);

    return {
      success: true,
      data: {
        patients: pats.items || [],
        appointments: apts.items || [],
        prescriptions: rxs.items || [],
        medicationTasks: tasks.items || [],
        inventory: inv.items || [],
        beds: bedsRes.items || [],
        users: usersRes.items || [],
        emergencyAlerts: alertsRes.items || [],
        auditLogs: logsRes.items || [],
        labReports: labsRes.items || []
      }
    };
  } catch (err) {
    console.error('[Firebase] Error fetching all hospital data:', err);
    return { success: false, error: err.message };
  }
};

// 5b. Real-time Subscription to a Collection
export const subscribeToCollection = (collectionName, callback) => {
  try {
    const { db } = getFirebaseInstance();
    if (!db) return () => {};
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    }, (error) => {
      console.warn(`[Firebase] Realtime listener notice for ${collectionName}:`, error.message);
    });
  } catch (err) {
    console.warn(`[Firebase] Failed to setup listener for ${collectionName}:`, err.message);
    return () => {};
  }
};

// 6. Delete all documents across all hospital collections (for clean wipe)
export const clearAllFirestoreData = async () => {
  try {
    const { db } = getFirebaseInstance();
    const collectionsToClear = [
      'patients',
      'appointments',
      'prescriptions',
      'medication_tasks',
      'inventory',
      'beds',
      'users',
      'doctors',
      'departments',
      'emergency_alerts',
      'audit_logs',
      'lab_reports',
      'tokens'
    ];

    let totalDeleted = 0;
    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        const docs = snap.docs;
        const chunkSize = 250;
        for (let i = 0; i < docs.length; i += chunkSize) {
          const chunk = docs.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach(docSnap => {
            batch.delete(docSnap.ref);
            totalDeleted++;
          });
          await batch.commit();
        }
      }
    }

    return { success: true, count: totalDeleted };
  } catch (err) {
    console.error('[Firebase] Error clearing collections:', err);
    return { success: false, error: err.message };
  }
};

// 7. Test connection to Firebase Firestore
export const testFirebaseConnection = async () => {
  try {
    const { db } = getFirebaseInstance();
    const testDoc = doc(db, '_system', 'ping_check');
    const timestamp = new Date().toISOString();
    await setDoc(testDoc, { ping: 'ok', timestamp }, { merge: true });
    const snap = await getDoc(testDoc);
    if (snap.exists()) {
      return { connected: true, message: 'Successfully connected and verified read/write access to Firebase Firestore!' };
    }
    return { connected: false, message: 'Write completed but read verification failed.' };
  } catch (err) {
    const isPermissionDenied = err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED');
    if (isPermissionDenied) {
      return {
        connected: false,
        permissionDenied: true,
        message: 'Firebase Security Rules Blocked: Go to Firebase Console -> Firestore Database -> Rules tab, change "allow read, write: if false;" to "allow read, write: if true;" and click Publish.'
      };
    }
    return { connected: false, message: err.message };
  }
};
