import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARtxrHw-Vk8EmZNryHtbXFNsQjObkHD3o",
  authDomain: "hospital-management-syst-374ae.firebaseapp.com",
  projectId: "hospital-management-syst-374ae",
  storageBucket: "hospital-management-syst-374ae.firebasestorage.app",
  messagingSenderId: "192193607357",
  appId: "1:192193607357:web:b70f014ffcb1c3e452e9d4",
  measurementId: "G-C4BJM8RK4F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_CLEAR = [
  'patients',
  'appointments',
  'prescriptions',
  'medication_tasks',
  'inventory',
  'beds',
  'users',
  'doctors',
  'departments',
  'audit_logs',
  'emergency_alerts',
  'lab_reports',
  'tokens',
  'connectivity_test'
];

async function clearAllData() {
  console.log('--- STARTING COMPLETE FIRESTORE PURGE ---');
  let grandTotal = 0;

  for (const colName of COLLECTIONS_TO_CLEAR) {
    try {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      if (snap.empty) {
        console.log(`Collection [${colName}] is already empty.`);
        continue;
      }

      console.log(`Found ${snap.size} documents in [${colName}]. Deleting...`);
      const docs = snap.docs;
      const chunkSize = 250;

      for (let i = 0; i < docs.length; i += chunkSize) {
        const chunk = docs.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      console.log(`Successfully deleted ${snap.size} documents from [${colName}].`);
      grandTotal += snap.size;
    } catch (err) {
      console.error(`Error clearing collection [${colName}]:`, err.message);
    }
  }

  console.log(`\nPURGE COMPLETED: Total ${grandTotal} documents deleted from Firestore.`);
  process.exit(0);
}

clearAllData().catch(err => {
  console.error('Fatal error during clear:', err);
  process.exit(1);
});
