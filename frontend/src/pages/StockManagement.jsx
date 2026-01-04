import { useState, useEffect } from "react";
import {
  fetchStockRecords,
  fetchStockAlerts,
  fetchStockMovements,
  updateStockQuantity,
} from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Professional Icons
const Icons = {
  Refresh: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Box: () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Alert: () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Critical: () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  List: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  History: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Eye: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Edit: () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Plus: () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Minus: () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>,
  Target: () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

const StockManagement = () => {
  const [stockData, setStockData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [stockRes, alertsRes, movesRes] = await Promise.all([
          fetchStockRecords(token),
          fetchStockAlerts(token),
          fetchStockMovements(token, 15),
        ]);
        setStockData(stockRes.data || []);
        setAlerts(alertsRes.data || []);
        setMovements(movesRes.data || []);
      } catch (err) {
        setError(err.message || "Unable to load stock data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const refreshData = async () => {
    if (!token) return;
    try {
      const [stockRes, alertsRes, movesRes] = await Promise.all([
        fetchStockRecords(token),
        fetchStockAlerts(token),
        fetchStockMovements(token, 15),
      ]);
      setStockData(stockRes.data || []);
      setAlerts(alertsRes.data || []);
      setMovements(movesRes.data || []);
    } catch (err) {
      setError(err.message || "Unable to refresh stock data");
    }
  };

  const handleStockAdjustment = async (productId, quantity, adjustmentType, notes) => {
    if (!token) return;
    try {
      await updateStockQuantity(
        productId,
        { quantity, adjustmentType, notes },
        token
      );
      await refreshData();
      setShowAdjustment(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err.message || "Unable to update stock");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 p-6">
        <div className="h-10 w-64 rounded-xl bg-slate-200"></div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl bg-slate-100"></div>)}
        </div>
        <div className="h-96 rounded-3xl bg-slate-100"></div>
      </div>
    );
  }

  const lowStockCount = alerts.length;
  const criticalCount = alerts.filter(a => a.urgency === 'critical').length;

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Management</h1>
          <p className="mt-1 text-slate-500 font-medium">Monitor and update your inventory levels</p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Icons.Refresh />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icons.Box />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-black text-slate-900">{stockData.length}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors ${lowStockCount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
              <Icons.Alert />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
              <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors ${criticalCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${criticalCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-400'}`}>
              <Icons.Critical />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Critical Low</p>
              <p className={`text-2xl font-black ${criticalCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{criticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-slate-100 p-1 w-fit">
        {[
          { id: 'inventory', label: 'Current Stock', icon: <Icons.List /> },
          { id: 'movements', label: 'History', icon: <Icons.History /> },
          { id: 'alerts', label: 'Low Stock', icon: <Icons.Eye /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${activeTab === tab.id
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        {activeTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                  <th className="pb-4 pl-4">Product Details</th>
                  <th className="pb-4">Current Stock</th>
                  <th className="pb-4">Total Value</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item) => (
                  <tr key={item.productId} className="group hover:bg-slate-50 transition-colors">
                    <td className="rounded-l-xl py-4 pl-4 border-y border-l border-transparent group-hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {item.product?.thumbnail ? (
                            <img src={item.product?.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Icons.Box />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{item.product?.name}</p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.product?.brand} · {item.product?.color}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 border-y border-transparent group-hover:border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.quantity} kg</span>
                        <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${item.stockStatus === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            style={{ width: `${Math.min(100, (item.quantity / (item.product?.minStockLevel || 20) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-900 border-y border-transparent group-hover:border-slate-100">
                      ₹{(item.quantity * (item.product?.pricePerKg || 0)).toLocaleString()}
                    </td>
                    <td className="py-4 border-y border-transparent group-hover:border-slate-100">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.stockStatus === 'low'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                        {item.stockStatus === 'low' ? 'Low Stock' : 'Good'}
                      </span>
                    </td>
                    <td className="rounded-r-xl py-4 pr-4 text-right border-y border-r border-transparent group-hover:border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowAdjustment(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-900 hover:text-white"
                      >
                        <Icons.Edit />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">Stock History</h2>
              <p className="text-xs font-bold text-slate-400">Recent transactions</p>
            </div>
            <div className="divide-y divide-slate-100">
              {movements.map((move) => (
                <div key={move._id} className="flex items-center justify-between py-4 group hover:bg-slate-50 px-4 rounded-xl -mx-4 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${move.type.includes('purchase') || move.type.includes('in')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                      }`}>
                      {move.type.includes('purchase') || move.type.includes('in') ? <Icons.Plus /> : <Icons.Minus />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{move.product?.name || 'Unknown Product'}</p>
                      <p className="text-xs font-medium text-slate-500 capitalize">{move.type.replace('_', ' ')} · {new Date(move.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${move.type.includes('purchase') || move.type.includes('in')
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                      }`}>
                      {move.type.includes('purchase') || move.type.includes('in') ? '+' : '-'}{move.quantity} kg
                    </p>
                    <p className="text-xs text-slate-400 italic max-w-[200px] truncate">{move.notes || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Low Stock Items</h2>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                <Icons.Target />
                <p className="mt-4 font-bold">All stock levels are healthy.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {alerts.map((alert) => (
                  <div key={alert.productId} className={`relative overflow-hidden rounded-2xl p-6 border transition-all ${alert.urgency === 'critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{alert.product?.name}</p>
                        <p className="mt-4 text-3xl font-black text-slate-900">{alert.quantity} kg</p>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                          Short by: <span className="text-rose-600">{alert.deficit} kg</span>
                        </p>
                      </div>
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${alert.urgency === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                        {alert.urgency}
                      </span>
                    </div>
                    <button
                      onClick={() => { setSelectedProduct({ productId: alert.productId, ...alert }); setShowAdjustment(true); }}
                      className="mt-6 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:scale-95 border border-slate-200"
                    >
                      Restock Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adjustment Modal Overlay */}
      {showAdjustment && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdjustment(false)}></div>
          <div className="relative w-full max-w-lg animate-in fade-in zoom-in duration-200 rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Update Stock Level</h3>
                <p className="text-sm font-bold text-slate-400">For <span className="text-indigo-600">{selectedProduct.product?.name}</span></p>
              </div>
              <button onClick={() => setShowAdjustment(false)} className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200 transition-colors">
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <StockAdjustmentForm
              product={selectedProduct}
              onSubmit={handleStockAdjustment}
              onCancel={() => setShowAdjustment(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StockAdjustmentForm = ({ product, onSubmit, onCancel }) => {
  const [quantity, setQuantity] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('increase');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product.productId || product._id, Number(quantity), adjustmentType, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Action Type</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'increase', label: 'Add Stock', icon: <Icons.Plus /> },
            { id: 'decrease', label: 'Remove', icon: <Icons.Minus /> },
            { id: 'set', label: 'Set Exact', icon: <Icons.Target /> }
          ].map(type => (
            <label key={type.id} className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 border transition-all ${adjustmentType === type.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              <div className={adjustmentType === type.id ? 'text-indigo-600' : 'text-slate-400'}>
                {type.icon}
              </div>
              <span className="text-xs font-bold">{type.label}</span>
              <input type="radio" name="adjType" value={type.id} checked={adjustmentType === type.id} onChange={() => setAdjustmentType(type.id)} className="sr-only" />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Quantity (kg)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="0"
          step="0.01"
          className="w-full rounded-2xl bg-slate-50 px-5 py-3 text-xl font-bold text-slate-900 outline-none border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Reason for Change</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          rows="3"
          className="w-full rounded-2xl bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 outline-none border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          placeholder="Enter a brief reason..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-[2] rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
        >
          Confirm Update
        </button>
      </div>
    </form>
  );
};

export default StockManagement;
