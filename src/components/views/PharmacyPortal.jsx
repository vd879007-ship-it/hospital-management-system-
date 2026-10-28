import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  Pill,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  RefreshCw,
  Search,
  Check,
  TrendingDown,
  ShieldCheck,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PharmacyPortal = () => {
  const {
    inventory,
    prescriptions,
    dispensePrescription,
    restockMedicine,
    language,
  } = useHospital();

  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'inventory'
  const [pharmacistName, setPharmacistName] = useState('Chief Pharmacist R. Anand, B.Pharm');
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  const finalizedPrescriptions = prescriptions.filter(p => p.status === 'Finalized');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'Dispensed');

  const lowStockCount = inventory.filter(i => i.currentStock <= i.reorderLevel).length;

  const handleDispense = (prescription) => {
    const result = dispensePrescription(prescription.id, pharmacistName);
    if (result.success) {
      confetti({ particleCount: 50, spread: 60 });
      alert(`Prescription ${prescription.prescriptionId} successfully dispensed! Stock deducted automatically.`);
    } else {
      alert(`Dispensing error: ${result.message}`);
    }
  };

  const handleSaveRestock = () => {
    if (!restockModalItem) return;
    restockMedicine(restockModalItem.id, restockQty);
    alert(`Added +${restockQty} to ${restockModalItem.name}. Stock updated.`);
    setRestockModalItem(null);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#002855]">
              Pharmacy Operations & Real-Time Stock Management
            </h2>
            <p className="text-xs text-slate-500">
              Direct digital dispensing from doctor orders with automatic batch & stock deduction
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'prescriptions' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Prescription Queue ({finalizedPrescriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'inventory' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 text-cyan-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory & Batch Tracker</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Dispensing</span>
            <span className="text-2xl font-black text-cyan-700">{finalizedPrescriptions.length}</span>
          </div>
          <FileText className="w-8 h-8 text-cyan-400" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Low Stock Items</span>
            <span className="text-2xl font-black text-rose-600">{lowStockCount}</span>
          </div>
          <TrendingDown className="w-8 h-8 text-rose-400" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Medicines in Formulary</span>
            <span className="text-2xl font-black text-slate-800">{inventory.length}</span>
          </div>
          <Package className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* View 1: Prescriptions Queue */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl overflow-hidden">
            <div className="p-4 bg-[#002244] text-white flex justify-between items-center text-xs">
              <span className="font-mono uppercase font-bold tracking-wider">
                Doctor-Signed Prescriptions Awaiting Dispensing
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono">
                {finalizedPrescriptions.length} Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {finalizedPrescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  All prescriptions have been dispensed! Check back when doctor finalizes new orders.
                </div>
              ) : (
                finalizedPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-5 space-y-4 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-cyan-700 text-sm">{rx.prescriptionId}</span>
                          <span className="text-xs font-bold text-slate-900">• {rx.patientName}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Clinician Signed
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Prescribing Doctor: {rx.doctorName} • Diagnosis: <strong className="text-slate-800">{rx.diagnosis}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDispense(rx)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Dispensing & Deduct Stock</span>
                      </button>
                    </div>

                    {/* Prescription items list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {rx.items.map((item, idx) => (
                        <div key={idx} className="bg-cyan-50/50 p-3 rounded-2xl border border-cyan-100 text-xs space-y-1">
                          <p className="font-bold text-[#002855]">{item.name}</p>
                          <p className="text-slate-600 text-[11px]">
                            Strength: <span className="font-semibold">{item.strength}</span> • Qty: <span className="font-bold text-cyan-800">{item.quantity}</span>
                          </p>
                          <p className="text-slate-500 text-[10px]">
                            Dose: {item.frequency} • {item.route}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Inventory & Batch Tracker */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-cyan-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine, batch, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-slate-500">
              Showing {filteredInventory.length} medicines
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-cyan-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002244] text-white uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Medicine & Generic</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-cyan-50/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] text-slate-500">{item.generic}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {item.batchNo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.expiryDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className={item.currentStock <= item.reorderLevel ? 'text-rose-600 font-black' : ''}>
                          {item.currentStock} {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Reorder at {item.reorderLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.currentStock <= item.reorderLevel
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.currentStock <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setRestockModalItem(item)}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-cyan-300 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <Package className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Restock {restockModalItem.name}
              </h3>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-500">Current Stock: <strong>{restockModalItem.currentStock}</strong></p>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Add Quantity
                </label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRestock}
                className="px-4 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
