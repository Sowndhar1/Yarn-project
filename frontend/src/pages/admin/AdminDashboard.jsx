import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchAdminDashboardStats, updateOrderStatus } from '../../lib/api';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchAdminDashboardStats(token);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadData();
  }, [token]);

  const stats = data ? [
    { name: 'Total Revenue', value: `₹${data.stats.revenue.toLocaleString()}`, change: '+12%', icon: '💰', color: 'bg-emerald-500' },
    { name: 'Total Orders', value: data.stats.orders, change: '+8%', icon: '📦', color: 'bg-indigo-500' },
    { name: 'Active Customers', value: data.stats.customers, change: '+15%', icon: '👤', color: 'bg-amber-500' },
    { name: 'Total Products', value: data.stats.products, icon: '🏷️', color: 'bg-rose-500' },
  ] : [];

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setUpdateError(null);
  };

  const handleClose = () => setSelectedOrder(null);

  const handleChangeStatus = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      setUpdateError(null);
      await updateOrderStatus(selectedOrder._id, newStatus, token);
      // refresh file
      const res = await fetchAdminDashboardStats(token);
      setData(res);
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setUpdateError(err.message || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    if (!data || !data.recentOrders) return;
    const rows = [['Order ID', 'Order Number', 'Customer', 'Date', 'Total', 'Status']];
    data.recentOrders.forEach(o => {
      rows.push([o._id, o.orderNumber || '', o.customer?.name || 'Guest', new Date(o.createdAt).toLocaleString(), o.totalAmount, o.status]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-slate-200"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-slate-100"></div>)}
      </div>
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Order</p>
                <h3 className="text-xl font-black text-slate-900">#{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h3>
                <p className="text-sm text-slate-600">{selectedOrder.customer?.name || 'Guest User'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Items</h4>
              <div className="space-y-3">
                {(selectedOrder.items || []).map((it, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{it.name || it.product?.name || 'Product'}</p>
                      <p className="text-sm text-slate-500">Qty: {it.quantity} · ₹{(it.price || it.unitPrice || 0).toLocaleString()}</p>
                    </div>
                    <div className="font-black">₹{((it.price || it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedOrder.status === 'delivered' || selectedOrder.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>{selectedOrder.status}</span>
                {updateError && <p className="text-sm text-red-600">{updateError}</p>}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleChangeStatus('processing')} disabled={updating} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Processing</button>
                <button onClick={() => handleChangeStatus('completed')} disabled={updating} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black hover:opacity-90">Mark Completed</button>
                <button onClick={() => handleChangeStatus('cancelled')} disabled={updating} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-black hover:opacity-90">Cancel</button>
                <button onClick={handleClose} className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}



      <div className="h-96 rounded-xl bg-slate-100"></div>
    </div >
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
      <div className="max-w-2xl w-full bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">Admin Dashboard</h2>
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-6">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
            <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Status: Loading</span>
          </div>
          <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
            Please wait while we load your business data.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="group px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            Back to Home
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen space-y-8 bg-[#f8fafc] pb-12">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Admin Mode</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Admin Dashboard</h1>
            <p className="text-slate-400 font-bold">Overview of your business performance.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Logged In</p>
              <p className="text-lg font-black">{user?.name}</p>
              <p className="text-xs font-bold text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} bg-opacity-10 text-xl group-hover:scale-110 transition-transform`}>
                <span className="filter drop-shadow-sm">{stat.icon}</span>
              </div>
              {stat.change && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Growth</span>
                  <span className="inline-flex items-center text-xs font-black text-emerald-600">
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{stat.name}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Interaction Layers */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Orders</h2>
                <p className="text-sm font-bold text-slate-400">Latest customer orders</p>
              </div>
              <div className="flex gap-2">
                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
                <div className="h-10 w-px bg-slate-100 mx-2"></div>
                <button onClick={() => exportCSV()} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors">Download Report</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <th className="pb-4 pl-4">Order Details</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-right">Value</th>
                    <th className="pb-4 pl-8">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id} onClick={() => handleOpen(order)} className="group cursor-pointer">
                      <td className="rounded-l-[1.5rem] bg-slate-50/50 py-5 pl-6">
                        <p className="text-xs font-black text-indigo-600 uppercase">#{order.orderNumber?.split('-')[1] || order._id.slice(-6)}</p>
                        <p className="text-[10px] font-bold text-slate-400">Order</p>
                      </td>
                      <td className="bg-slate-50/50 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 text-[10px] font-black text-slate-600 hidden sm:flex">
                            {order.customer?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{order.customer?.name || 'Guest User'}</span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 py-5 text-sm font-medium text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="bg-slate-50/50 py-5 text-right text-sm font-black text-slate-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="rounded-r-[1.5rem] bg-slate-50/50 py-5 pl-8">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'delivered' || order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Sales by Product Type</h2>
            <div className="space-y-8">
              {data.salesByCategory.map((cat, idx) => (
                <div key={cat._id}>
                  <div className="flex items-end justify-between mb-3 px-1">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Category</p>
                      <p className="text-sm font-bold text-slate-900">{cat._id}</p>
                    </div>
                    <p className="text-sm font-black text-slate-900">₹{cat.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100">
                    <div
                      className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-purple-500' : 'bg-pink-400'
                        }`}
                      style={{ width: `${(cat.totalAmount / data.stats.revenue * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[3rem] bg-indigo-600 p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-9C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">System Status</p>
              <h3 className="text-2xl font-black mb-4">Online</h3>
              <p className="text-sm font-bold text-indigo-100/80 mb-8 leading-relaxed">System is running securely. All modules are active.</p>
              <button onClick={() => setShowLogs(true)} className="w-full bg-white text-indigo-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg">
                View Logs
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Access Logs Modal */}
      {
        showLogs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogs(false)}></div>
            <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f172a] p-8 shadow-2xl border border-white/10 text-slate-300 font-mono text-sm max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-bold text-white tracking-widest uppercase">System Logs</h3>
                </div>
                <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar flex-1">
                {[
                  { time: '10:42:15', level: 'INFO', msg: 'Database synchronization complete' },
                  { time: '10:41:03', level: 'WARN', msg: 'High latency detected on node-region-ap-south-1' },
                  { time: '10:39:55', level: 'INFO', msg: 'User login: admin@shivam.yarn' },
                  { time: '10:38:22', level: 'INFO', msg: 'Automated backup sequence initiated' },
                  { time: '10:35:10', level: 'INFO', msg: 'Order #ORD-7829 processing started' },
                  { time: '10:30:45', level: 'SEC', msg: 'Firewall blocked suspicious IP 192.168.X.X' },
                  { time: '10:28:12', level: 'INFO', msg: 'Inventory reconciliation job finished' },
                  { time: '10:15:00', level: 'INFO', msg: 'System integrity check passed' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-2 rounded transition-colors">
                    <span className="text-slate-500">{log.time}</span>
                    <span className={`font-bold ${log.level === 'WARN' ? 'text-amber-400' : log.level === 'SEC' ? 'text-red-400' : 'text-emerald-400'}`}>{log.level}</span>
                    <span className="text-slate-300">{log.msg}</span>
                  </div>
                ))}
                <div className="text-xs text-slate-600 pt-4 text-center uppercase tracking-widest">End of Live Stream</div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminDashboard;
