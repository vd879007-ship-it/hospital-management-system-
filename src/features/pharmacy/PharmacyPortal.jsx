import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
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
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PharmacyPortal = () => {
  const {
    inventory,
    prescriptions,
    dispensePrescription,
    restockMedicine,
    setIsAddMedicineModalOpen,
    auditLogs,
    language,
    t
  } = useHospital();

  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'inventory' | 'audit'
  const [pharmacistName, setPharmacistName] = useState('Chief Pharmacist R. Anand, B.Pharm');
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const finalizedPrescriptions = prescriptions.filter(p => p.status === 'Finalized');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'Dispensed');

  const lowStockItems = inventory.filter(i => i.currentStock <= i.reorderLevel);

  const handleDispense = (prescription) => {
    const result = dispensePrescription(prescription.id, pharmacistName);
    if (result.success) {
      confetti({ particleCount: 50, spread: 60 });
      alert(
        isTamil
          ? `மருந்துச் சீட்டு ${prescription.prescriptionId} நோயாளி ${prescription.patientName} அவர்களுக்கு வெற்றிகரமாக வழங்கப்பட்டது! கையிருப்பு தானாகக் குறைக்கப்பட்டது.`
          : `Prescription ${prescription.prescriptionId} successfully dispensed to ${prescription.patientName}! Stock deducted automatically.`
      );
    } else {
      alert(isTamil ? `வழங்கல் பிழை: ${result.message}` : `Dispensing error: ${result.message}`);
    }
  };

  const handleSaveRestock = () => {
    if (!restockModalItem) return;
    restockMedicine(restockModalItem.id, restockQty);
    alert(
      isTamil
        ? `மருந்து ${restockModalItem.name} +${restockQty} அலகுகள் கையிருப்பில் சேர்க்கப்பட்டது.`
        : `Restocked +${restockQty} units of ${restockModalItem.name}.`
    );
    setRestockModalItem(null);
  };

  const categories = ['ALL', ...new Set(inventory.map(i => i.category.split(' ')[0]))];

  const filteredInventory = inventory.filter(item => {
    if (categoryFilter !== 'ALL' && !item.category.includes(categoryFilter)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.batchNo.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const pharmacyAuditLogs = auditLogs.filter(
    l => l.resourceType === 'prescriptions' || l.resourceType === 'inventory'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('pharmacyTitle')}
            </h1>
            <span className="badge-highlight">{inventory.length} {isTamil ? 'மருந்துகள்' : 'Formulary Items'}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {t('pharmacyDesc')}
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('pendingRxTab')} ({finalizedPrescriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('inventoryStockTab')} ({inventory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'audit' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('pharmacyAuditTab')}</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert Strip if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs flex items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center space-x-2 font-semibold text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <span>
              {isTamil ? 'குறைந்த கையிருப்பு எச்சரிக்கை:' : 'FORMULARY REORDER ALERT:'} {lowStockItems.length} {isTamil ? 'மருந்துகள் மறுஆர்டர் வரம்பிற்கு கீழே உள்ளன:' : 'medication(s) have fallen below minimum threshold:'}
            </span>
            <span className="font-mono text-slate-800">
              {lowStockItems.slice(0, 3).map(i => `${i.name} (${i.currentStock} left)`).join(', ')}
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTab('inventory');
              setRestockModalItem(lowStockItems[0]);
            }}
            className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700 whitespace-nowrap shadow-xs"
          >
            {t('restockItemBtn')}
          </button>
        </div>
      )}

      {/* TAB 1: PRESCRIPTION QUEUE */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalizedPrescriptions.map(rx => (
              <div
                key={rx.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-700 block">{rx.prescriptionId}</span>
                    <h3 className="text-lg font-bold text-slate-900">{rx.patientName}</h3>
                  </div>
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                    {isTamil ? 'வழங்க காத்திருக்கிறது' : 'Awaiting Dispense'}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-600 font-medium">{t('doctorLabel')}: <strong className="text-slate-900">{rx.doctorName}</strong></p>
                  <p className="text-blue-700 font-semibold">{t('diagnosisLabel')}: {rx.diagnosis}</p>
                  <p className="text-slate-500 text-[11px]">{isTamil ? 'பரிந்துரைத்த நேரம்:' : 'Signed At:'} {rx.signedAt}</p>
                </div>

                {/* Items to dispense */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{isTamil ? 'பரிந்துரைத்த மருந்துகள்:' : 'Items Ordered:'}</span>
                  {rx.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-[11px] text-blue-700 font-medium block">{item.frequency} • {item.duration}</span>
                      </div>
                      <span className="font-semibold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs shadow-xs">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleDispense(rx)}
                  className="w-full btn-primary text-xs py-3 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('dispenseMedicineBtn')}</span>
                </button>
              </div>
            ))}

            {finalizedPrescriptions.length === 0 && (
              <div className="col-span-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-600 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">
                  {isTamil ? 'அனைத்து மருந்துச் சீட்டுகளும் வழங்கப்பட்டுவிட்டன!' : 'All Prescriptions Dispensed!'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isTamil ? 'மருத்துவர் புதிய மருந்துச் சீட்டை அனுப்பியதும் இங்கு தோன்றும்.' : 'New electronic prescriptions signed by doctors will appear here instantly.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORMULARY INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isTamil ? 'மருந்து பெயர், தொகுதி, வகை மூலம் தேடுக...' : 'Search by drug name, batch, category...'}
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 w-full sm:w-64 font-medium transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700">{isTamil ? 'பிரிவு:' : 'Category:'}</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMedicineModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isTamil ? 'புதிய மருந்து' : 'Add Medicine'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">{t('medicineHeader')}</th>
                  <th className="py-3 px-3">{isTamil ? 'பிரிவு' : 'Category'}</th>
                  <th className="py-3 px-3">{t('batchNoLabel')}</th>
                  <th className="py-3 px-3">{t('expiryDateLabel')}</th>
                  <th className="py-3 px-3">{t('stockLevelLabel')}</th>
                  <th className="py-3 px-3">{isTamil ? 'மறுஆர்டர் வரம்பு' : 'Reorder Threshold'}</th>
                  <th className="py-3 px-3">{t('status')}</th>
                  <th className="py-3 px-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-xs text-slate-700">
                        {isTamil ? 'மருந்துகள் எதுவும் இல்லை' : 'No medicines in inventory'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isTamil ? 'புதிய மருந்துகளைச் சேர்க்க மேலே உள்ள "+ புதிய மருந்து சேர்க்க" பொத்தானைக் கிளிக் செய்யவும்.' : 'Click "+ Add Medicine" to register medications into your hospital formulary.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(item => {
                    const isLow = item.currentStock <= item.reorderLevel;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {item.name}
                          <span className="text-[10px] text-slate-400 block font-normal">{item.generic}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-blue-700">{item.category}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{item.batchNo}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{item.expiryDate}</td>
                        <td className="py-3 px-3 font-bold text-sm">
                          <span className={isLow ? 'text-rose-600' : 'text-emerald-700'}>
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{item.reorderLevel} {item.unit}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLow ? (isTamil ? 'குறைந்த கையிருப்பு' : 'Low Stock') : (isTamil ? 'கையிருப்பில் உள்ளது' : 'In Stock')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setRestockModalItem(item)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            + {isTamil ? 'சேர்' : 'Restock'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              {isTamil ? 'மருந்தகம் & கையிருப்பு தணிக்கைப் பதிவு' : 'Dispensary & Inventory Audit Log'}
            </h3>
            <span className="text-xs font-semibold text-blue-700 font-mono">{isTamil ? 'மாற்ற முடியாதது' : 'Immutable'}</span>
          </div>

          <div className="space-y-2">
            {pharmacyAuditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span className="text-blue-700 font-semibold">{log.action}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                </div>
                <p className="text-slate-700">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{isTamil ? 'கையிருப்பு புதுப்பித்தல்' : 'Restock Formulary Batch'}</h3>
              <p className="text-xs text-slate-600">{restockModalItem.name} ({isTamil ? 'தற்போதைய கையிருப்பு:' : 'Current:'} {restockModalItem.currentStock})</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 uppercase">{isTamil ? 'சேர்க்க வேண்டிய அளவு (அலகுகள்):' : 'Quantity to Add (Units):'}</label>
              <input
                type="number"
                min="10"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveRestock}
                className="btn-primary text-xs py-2 px-4 shadow-xs"
              >
                {isTamil ? 'உறுதி செய்' : 'Confirm Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
