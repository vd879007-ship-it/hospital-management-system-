import { getFirebaseInstance, getActiveFirebaseConfig, isFirebaseConfigured } from '../services/firebaseService';

// Export instances from dynamic centralized firebase service
export const { db, auth, app, analytics } = getFirebaseInstance();

export const initFirebaseEmulators = () => {
  // Emulators are managed via firebaseService if VITE_USE_FIREBASE_EMULATOR is enabled
};

export const getFirebaseStatus = () => {
  const config = getActiveFirebaseConfig();
  return {
    projectId: config.projectId || 'demo-hospital-sms',
    isConfigured: isFirebaseConfigured(),
    storageBucket: config.storageBucket
  };
};
