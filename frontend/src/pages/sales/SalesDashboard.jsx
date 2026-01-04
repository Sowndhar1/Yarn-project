import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchSalesSummary, fetchSales } from "../../lib/api.js";
import { Link } from "react-router-dom";

const SalesDashboard = () => {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryRes, salesRes] = await Promise.all([
          fetchSalesSummary(token),
          fetchSales(token, { limit: 10 })
        ]);
        setSummary(summaryRes.data);
        setRecentSales(salesRes.data || []);
      } catch (err) {
        setError(err.message || "Failed to load sales data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 rounded-xl bg-slate-200"></div>
          <div className="h-6 w-32 rounded-lg bg-slate-100"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-3xl bg-slate-100"></div>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-50"></div>
          <div className="h-96 rounded-3xl bg-slate-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 pb-12 bg-slate-50/30">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200">Sales Dashboard</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Sales Overview</h1>
            <p className="text-slate-500 font-bold max-w-lg">Track your sales and invoice status.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-[2rem] shadow-sm">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sales Staff</p>
              <p className="text-lg font-black text-slate-900">{user?.name}</p>
              <p className="text-xs font-bold text-emerald-600">Staff Member</p>
            </div>
            <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Monthly Revenue', value: `₹${summary?.currentMonthTotal?.toLocaleString() || '0'}`, sub: `Across ${summary?.currentMonthCount} orders`, icon: '💰', theme: 'emerald' },
          { label: 'Pending Dues', value: summary?.pendingPayments || '0', sub: 'Action Required', icon: '⏳', theme: 'amber' },
          { label: 'Active Customers', value: summary?.topCustomers?.length || '0', sub: 'Engagement High', icon: '🤝', theme: 'blue' },
          { label: 'Market Standing', value: 'Prime', sub: 'Alpha Performance', icon: '🏆', theme: 'indigo' }
        ].map((kpi, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${kpi.theme}-500 bg-opacity-10 text-xl group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Live</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{kpi.value}</p>
            <p className="mt-3 text-xs font-bold text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sales Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sales History</h2>
                <p className="text-sm font-bold text-slate-400">View all invoices</p>
              </div>
              <Link to="/sales/entry" className="group flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-3 text-xs font-black text-white shadow-xl transition-all hover:bg-emerald-600 active:scale-95">
                <span className="text-lg">+</span> Generate Invoice
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="pb-4 pl-4">Customer</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Settlement</th>
                    <th className="pb-4 text-right pr-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id} className="group transition-all duration-300">
                      <td className="rounded-l-[2rem] bg-slate-50/50 py-6 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 font-black text-slate-600 group-hover:text-emerald-600 group-hover:ring-emerald-200 transition-all">
                            {sale.customerName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{sale.customerName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sale.invoiceNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 py-6">
                        <p className="text-sm font-bold text-slate-600">{new Date(sale.saleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="bg-slate-50/50 py-6">
                        <p className="text-lg font-black text-slate-900 tracking-tight">₹{sale.grandTotal?.toLocaleString()}</p>
                      </td>
                      <td className="rounded-r-[2rem] bg-slate-50/50 py-6 pr-6 text-right">
                        <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter ${sale.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                          ● {sale.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
            <h2 className="mb-8 text-xl font-black text-slate-900 tracking-tight">Quick Links</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Billing', icon: '📝', to: '/sales/entry', theme: 'indigo' },
                { label: 'Clients', icon: '👥', to: '#', theme: 'emerald' },
                { label: 'Analytics', icon: '📈', to: '#', theme: 'rose' },
                { label: 'Settings', icon: '⚙️', to: '#', theme: 'amber' }
              ].map((act, i) => (
                <Link key={i} to={act.to} className={`flex flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-slate-50 p-8 transition-all hover:scale-105 group border border-slate-100`}>
                  <span className="text-4xl filter group-hover:drop-shadow-lg transition-all">{act.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">{act.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[3rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <h2 className="relative z-10 mb-8 text-xl font-black text-white tracking-tight">Top Customers</h2>
            <div className="space-y-8 relative z-10">
              {(summary?.topCustomers || []).map((customer, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Customer</span>
                      <span className="text-sm font-bold text-white uppercase">{customer.name}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-400">₹{customer.total?.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      style={{ width: `${Math.min(100, (customer.total / (summary?.topCustomers[0]?.total || 1) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {summary?.topCustomers?.length === 0 && (
                <div className="py-10 text-center text-slate-500">
                  <p className="text-xs font-black uppercase tracking-widest">No active customers this period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
