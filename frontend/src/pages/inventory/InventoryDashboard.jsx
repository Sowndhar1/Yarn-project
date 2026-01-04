import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchStockSummary, fetchStockAlerts, fetchStockMovements } from "../../lib/api.js";
import { Link } from "react-router-dom";

const InventoryDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [summaryRes, alertsRes, movementsRes] = await Promise.all([
          fetchStockSummary(token),
          fetchStockAlerts(token),
          fetchStockMovements(token, { limit: 5 })
        ]);
        setStats(summaryRes.data);
        setLowStock(alertsRes.data || []);
        setMovements(movementsRes.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-64 rounded-xl bg-slate-200"></div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-[2.5rem] bg-slate-100"></div>)}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-[3rem] bg-slate-50"></div>
          <div className="h-96 rounded-[3rem] bg-slate-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 pb-12 bg-slate-50/30">
      {/* Enterprise Inventory Header */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200">Logistics Hub V2</span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Inventory Assets</h1>
            <p className="text-slate-500 font-bold max-w-lg">Real-time stock reconciliation and global supply chain monitoring.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-[2rem] shadow-sm">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Controller</p>
              <p className="text-lg font-black text-slate-900">{user?.name}</p>
              <p className="text-xs font-bold text-indigo-600">Stock Security Level 4</p>
            </div>
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Global Stock KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total SKU count', value: stats?.totalProducts || '0', sub: 'In Active Catalog', icon: '📦', color: 'indigo' },
          { label: 'Critical Alerts', value: lowStock.length, sub: 'Restock Required', icon: '⚠️', color: 'rose' },
          { label: 'Out of Stock', value: stats?.outOfStockCount || '0', sub: 'Urgent Attention', icon: '🚫', color: 'amber' },
          { label: 'Warehouse Value', value: '₹2.4M', sub: 'Estimated Asset', icon: '💎', color: 'emerald' }
        ].map((kpi, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${kpi.color}-500 bg-opacity-10 text-xl group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
            <p className={`mt-1 text-3xl font-black tracking-tight text-${kpi.color === 'rose' ? 'rose-600' : 'slate-900'}`}>{kpi.value}</p>
            <p className="mt-3 text-xs font-bold text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Critical Stock Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Stock Deviation Alerts</h2>
                <p className="text-sm font-bold text-slate-400">SKUs below safety threshold</p>
              </div>
              <Link to="/stock" className="px-6 py-2.5 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
                Manage Stock
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="pb-4 pl-4">Asset Identification</th>
                    <th className="pb-4">SKU Code</th>
                    <th className="pb-4 text-right">Remaining</th>
                    <th className="pb-4 pl-8">Flow State</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((item) => (
                    <tr key={item._id} className="group">
                      <td className="rounded-l-[2rem] bg-slate-50/50 py-6 pl-6">
                        <p className="font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                      </td>
                      <td className="bg-slate-50/50 py-6 font-mono text-xs font-bold text-indigo-600">
                        {item.sku || 'N/A'}
                      </td>
                      <td className="bg-slate-50/50 py-6 text-right">
                        <p className="text-lg font-black text-slate-900 leading-none mb-1">{item.stock}</p>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Min: {item.minStockThreshold || 10}</p>
                      </td>
                      <td className="rounded-r-[2rem] bg-slate-50/50 py-6 pl-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.stock <= 2 ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                          ● {item.stock <= 2 ? 'Critical' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {lowStock.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 text-2xl mb-4">🛡️</div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Inventory levels optimal. All systems secured.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Operations & Log */}
        <div className="space-y-8">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
            <h2 className="mb-8 text-xl font-black text-slate-900 tracking-tight">Operations Hub</h2>
            <div className="space-y-4">
              {[
                { label: 'Inbound Receipt', icon: '📥', color: 'indigo', path: '/purchases/new' },
                { label: 'Inventory Audit', icon: '📋', color: 'emerald', path: '/stock' },
                { label: 'Dispatch Log', icon: '📤', color: 'rose', path: '/sales/new' },
                { label: 'SKU Creation', icon: '✨', color: 'amber', path: '/inventory/products' }
              ].map((op, i) => (
                <Link key={i} to={op.path} className="flex w-full items-center justify-between rounded-[2rem] bg-white border border-slate-100 p-6 transition-all hover:bg-slate-50 hover:shadow-lg group">
                  <div className="flex items-center gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${op.color}-50 text-xl transition-transform group-hover:scale-110`}>{op.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{op.label}</span>
                  </div>
                  <span className="text-slate-300 group-hover:text-slate-900 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[3rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <h2 className="relative z-10 mb-8 text-xl font-black text-white tracking-tight">Movement Log</h2>
            <div className="space-y-6 relative z-10">
              {movements.map((move, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-black ${move.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {move.type === 'purchase' ? '+' : '-'}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-sm font-bold text-white uppercase truncate max-w-[120px]">{move.productName || 'Stock Move'}</p>
                      <span className={`text-sm font-black ${move.type === 'purchase' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {move.type === 'purchase' ? `+${move.quantity}` : `-${move.quantity}`}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{move.type} • {new Date(move.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {movements.length === 0 && (
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center py-8">No recent movements logs</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
