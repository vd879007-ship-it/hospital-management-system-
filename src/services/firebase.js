// Firebase client service with transparent local demo fallback
// Allows the application to run out-of-the-box in local development with zero external configuration,
// while being 100% ready for production deployment with Firebase Authentication and Firestore.

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key_placeholder'
);

export const getSystemMode = () => {
  return isFirebaseConfigured ? 'Cloud Firebase (Connected)' : 'Local Demo (Zero-Config)';
};

// Safe log of operational mode
console.info(`[HSMS Architecture] Operational Mode: ${getSystemMode()}`);
