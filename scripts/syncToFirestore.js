import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import {
  SEED_PATIENTS,
  SEED_DEPARTMENTS,
  SEED_DOCTORS,
  SEED_TOKENS,
  SEED_PRESCRIPTIONS,
  SEED_MEDICATION_TASKS,
  SEED_INVENTORY,
  SEED_BEDS,
  SEED_AUDIT_LOGS,
  SEED_USERS
} from '../src/lib/seedData.js';

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

const sanitize = (data) => JSON.parse(JSON.stringify(data));

async function uploadCollectionInBatches(collectionName, items, idKey = 'id') {
  if (!items || items.length === 0) return 0;
  console.log(`Uploading ${items.length} records to collection: ${collectionName}...`);

  const chunkSize = 250;
  let count = 0;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach(item => {
      const docId = String(item[idKey] || item.id || item.uid || item.patientId || item.tokenNumber || `${collectionName}-${count}`);
      const docRef = doc(db, collectionName, docId);
      batch.set(docRef, { ...sanitize(item), syncedAt: new Date().toISOString() }, { merge: true });
      count++;
    });

    await batch.commit();
  }

  console.log(`✓ ${collectionName}: ${count} records uploaded.`);
  return count;
}

async function main() {
  console.log('--- Starting Cloud Firestore Sync for Project: hospital-management-syst-374ae ---');
  let total = 0;

  total += await uploadCollectionInBatches('patients', SEED_PATIENTS, 'id');
  total += await uploadCollectionInBatches('appointments', SEED_TOKENS, 'id');
  total += await uploadCollectionInBatches('prescriptions', SEED_PRESCRIPTIONS, 'id');
  total += await uploadCollectionInBatches('medication_tasks', SEED_MEDICATION_TASKS, 'id');
  total += await uploadCollectionInBatches('inventory', SEED_INVENTORY, 'id');
  total += await uploadCollectionInBatches('beds', SEED_BEDS, 'id');
  total += await uploadCollectionInBatches('users', SEED_USERS, 'uid');
  total += await uploadCollectionInBatches('doctors', SEED_DOCTORS, 'id');
  total += await uploadCollectionInBatches('departments', SEED_DEPARTMENTS, 'id');
  total += await uploadCollectionInBatches('audit_logs', SEED_AUDIT_LOGS, 'id');

  console.log(`\n🎉 SUCCESS! Total ${total} records successfully uploaded and stored in Firebase Firestore!`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
