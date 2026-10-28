import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Pill,
  X,
  CheckCircle2,
  Package,
  Layers,
  Calendar,
  DollarSign,
  CloudUpload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddMedicineModal = () => {
  const {
    isAddMedicineModalOpen,
    setIsAddMedicineModalOpen,
    addInventoryMedicine,
    language
  } = useHospital();

  const isTamil = language === 'ta';

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Antibiotics & Anti-infectives');
  const [currentStock, setCurrentStock] = useState('100');
  const [reorderLevel, setReorderLevel] = useState('25');
  const [unit, setUnit] = useState('Tablets');
  const [batchNo, setBatchNo] = useState(() => `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [price, setPrice] = useState('55.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAddMedicineModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter medicine name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addInventoryMedicine({
        name,
        category,
        currentStock,
        reorderLevel,
        unit,
        batchNo,
        expiryDate,
        price
      });

      confetti({ particleCount: 50, spread: 60 });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsAddMedicineModalOpen(false);
        setName('');
      }, 1400);
    } catch (err) {
      alert('Error adding medicine: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2 text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isTamil ? 'புதிய மருந்து சேர்க்கை' : 'Add Medication to Formulary'}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {isTamil ? 'மருந்து சரக்கு நேரடியாக Firebase-ல் சேமிக்கப்படும்' : 'Item will be stored directly into Firebase Firestore inventory'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddMedicineModalOpen(false)}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {success && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Medicine added to formulary & stored in Firebase!</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isTamil ? 'மருந்தின் பெயர் & அளவு (Strength) *' : 'Medicine Name & Strength *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cefixime 200mg / Pantoprazole 40mg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'பிரிவு' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Antibiotics & Anti-infectives">Antibiotics & Anti-infectives</option>
                <option value="Analgesics & Antipyretics">Analgesics & Antipyretics</option>
                <option value="Cardiovascular & Antihypertensive">Cardiovascular</option>
                <option value="Gastrointestinal Agents">Gastrointestinal</option>
                <option value="Respiratory & Antiallergic">Respiratory & Antiallergic</option>
                <option value="Endocrine & Diabetes">Endocrine & Diabetes</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'அளவு அலகு' : 'Unit'}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Tablets">Tablets</option>
                <option value="Capsules">Capsules</option>
                <option value="Vials">Vials (Injections)</option>
                <option value="Bottles">Bottles (Syrups)</option>
                <option value="Ampoules">Ampoules</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'ஆரம்ப இருப்பு *' : 'Initial Stock *'}
              </label>
              <input
                type="number"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'எச்சரிக்கை இருப்பு' : 'Reorder Level'}
              </label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'விலை (₹)' : 'Price per Unit (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'தொகுதி எண் (Batch No)' : 'Batch Number'}
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isTamil ? 'காலாவதி தேதி' : 'Expiry Date'}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsAddMedicineModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (isTamil ? 'சேமிக்கிறது...' : 'Saving...')
                  : (isTamil ? 'Firebase-ல் சேமிக்க' : 'Save Medicine to Firebase')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
