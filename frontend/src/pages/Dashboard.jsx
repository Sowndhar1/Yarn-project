import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchStockSummary,
  fetchSalesSummary,
  fetchPurchaseSummary,
  fetchStockAlerts,
  fetchOrders,
} from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Package,
  ShoppingCart,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoveDown,
  MoveUp,
  Plus,
  ArrowRight,
  Wallet,
  ChevronLeft
} from "lucide-react";
import BackButton from "../components/common/BackButton";

const Dashboard = () => {
  const [data, setData] = useState({
    stockSummary: null,
    salesSummary: null,
    purchaseSummary: null,
    lowStockAlerts: [],
    recentOrders: [],
    salesTrend: [],
    purchaseTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const COLORS = {
    primary: "#4f46e5", // Indigo 600
    success: "#10b981", // Emerald 500
    warning: "#f59e0b", // Amber 500
    danger: "#ef4444", // Red 500
    background: "#f8fafc" // Slate 50
  };

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      setLoading(true);

      const results = await Promise.allSettled([
        fetchStockSummary(token),
        fetchSalesSummary(token),
        fetchPurchaseSummary(token),
        fetchStockAlerts(token),
        fetchOrders(token),
      ]);

      const [stockRes, salesRes, purchaseRes, alertsRes, ordersRes] = results;

      const stockData = stockRes.status === "fulfilled" ? stockRes.value.data : null;
      const salesData = salesRes.status === "fulfilled" ? salesRes.value.data : null;
      const purchaseData = purchaseRes.status === "fulfilled" ? purchaseRes.value.data : null;
      const alertsData = alertsRes.status === "fulfilled" ? alertsRes.value.data : [];
      const ordersData = ordersRes.status === "fulfilled" ? ordersRes.value.data : [];

      setData({
        stockSummary: stockData,
        salesSummary: salesData,
        purchaseSummary: purchaseData,
        lowStockAlerts: alertsData || [],
        recentOrders: ordersData?.slice(0, 5) || [],
        salesTrend: salesData?.monthlyTrend || [],
        purchaseTrend: purchaseData?.monthlyTrend || [],
      });

      setLoading(false);
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Synchronizing Dashboard...</p>
        </div>
      </div>
    );
  }

  const { stockSummary, salesSummary, purchaseSummary, lowStockAlerts, recentOrders, salesTrend, purchaseTrend } = data;

  const realTrendData = salesTrend.map((s, i) => ({
    name: s.name,
    Sales: s.sales,
    Purchases: purchaseTrend[i]?.purchases || 0,
  }));

  const hasTrendData = realTrendData.length > 0 && realTrendData.some(d => d.Sales > 0 || d.Purchases > 0);

  // Mock data for demo visualization when real data is empty
  const mockTrendData = [
    { name: 'Jan', Sales: 45000, Purchases: 32000 },
    { name: 'Feb', Sales: 52000, Purchases: 48000 },
    { name: 'Mar', Sales: 48000, Purchases: 46000 },
    { name: 'Apr', Sales: 61000, Purchases: 38000 },
    { name: 'May', Sales: 55000, Purchases: 42000 },
    { name: 'Jun', Sales: 67000, Purchases: 45000 },
  ];

  const chartData = hasTrendData ? realTrendData : mockTrendData;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time overview of inventory, finance, and operations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                const { fetchSales } = await import('../lib/api');
                const { generateSalesReport } = await import('../lib/ReportGenerator');
                const res = await fetchSales(token, { limit: 1000 });
                const salesData = res.data || res || [];
                if (!Array.isArray(salesData)) {
                  throw new Error("Invalid sales data received");
                }
                const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString();
                const end = new Date().toLocaleDateString();
                generateSalesReport(salesData, start, end);
              } catch (e) {
                console.error("Sales Report Error:", e);
                alert(`Failed to generate Sales report: ${e.message}`);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"
          >
            <IndianRupee className="w-4 h-4" /> Sales Report
          </button>
          <button
            onClick={async () => {
              try {
                const { fetchPurchases } = await import('../lib/api');
                const { generatePurchaseReport } = await import('../lib/ReportGenerator');
                const res = await fetchPurchases(token, { limit: 1000 });
                const purchaseData = res.data || res || [];
                if (!Array.isArray(purchaseData)) {
                  throw new Error("Invalid purchase data received");
                }
                const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString();
                const end = new Date().toLocaleDateString();
                generatePurchaseReport(purchaseData, start, end);
              } catch (e) {
                console.error("Purchase Report Error:", e);
                alert(`Failed to generate Purchase report: ${e.message}`);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-purple-700 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Purchase Report
          </button>

          <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Live
          </span>
        </div>
      </div >

      {/* KPI Stats Grid */}
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" >
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(stockSummary?.totalStockValue || 0)}
          icon={<Package strokeWidth={1.5} />}
          color="blue"
          trend="+2.4%"
          subLabel="vs last month"
          isTrendUp={true}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(salesSummary?.currentMonthTotal || 0)}
          icon={<IndianRupee strokeWidth={1.5} />}
          color="emerald"
          trend="+12%"
          subLabel="Growth"
          isTrendUp={true}
        />
        <StatCard
          title="Monthly Purchases"
          value={formatCurrency(purchaseSummary?.currentMonthTotal || 0)}
          icon={<ShoppingCart strokeWidth={1.5} />}
          color="purple"
          trend="-5%"
          subLabel="Cost saving"
          isTrendUp={false}
          inverseTrend={true}
        />
        <StatCard
          title="Stock Alerts"
          value={stockSummary?.lowStockCount || 0}
          icon={<AlertTriangle strokeWidth={1.5} />}
          color="amber"
          type="alert"
          subLabel="Requires Action"
        />
      </div >

      {/* Quick Actions Section */}
      < div className="grid grid-cols-2 md:grid-cols-4 gap-4" >
        <Link to="/sales/new" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">New Sale</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" />
        </Link>
        <Link to="/purchases/new" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">New Purchase</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
        </Link>
        <Link to="/inventory/products" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Add Product</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors opacity-0 group-hover:opacity-100" />
        </Link>
        <Link to="/stock" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Stock Check</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100" />
        </Link>
      </div >

      {/* Main Content Split */}
      < div className="grid grid-cols-1 lg:grid-cols-3 gap-8" >

        {/* Left Column: Financial Trends (2/3) */}
        < div className="lg:col-span-2 space-y-8" >

          {/* Financial Chart */}
          < div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200" >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Financial Performance
                  {!hasTrendData && <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Demo Data</span>}
                </h2>
                <p className="text-xs text-slate-400">Revenue & Spend Over Time</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Sales
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Purchases
                </div>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    formatter={(val) => [formatCurrency(val)]}
                  />
                  <Area type="monotone" dataKey="Sales" stroke={COLORS.primary} strokeWidth={2} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="Purchases" stroke="#a855f7" strokeWidth={2} fill="url(#colorPurchases)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div >

          {/* Recent Orders List */}
          < div className="bg-white rounded-2xl p-0 shadow-sm border border-slate-200 overflow-hidden" >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Recent Orders
              </h3>
              <Link to="/admin" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id || order._id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                        ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                      `}>
                        {order.customerName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {order.customerName || 'Walk-in'}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{order.orderNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold mt-1 text-slate-500 bg-slate-100`}>{order.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs text-slate-400">No recent orders yet.</div>
              )}
            </div>
          </div >

        </div >

        {/* Right Column: Alerts & Pending (1/3) */}
        < div className="space-y-6" >
          <div className="bg-white rounded-2xl p-0 shadow-sm border border-red-100 h-fit">
            <div className="p-5 border-b border-red-50 bg-red-50/30 flex justify-between items-center">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-700">Stock Alerts</h3>
                  <p className="text-xs text-red-400 font-medium">Items requiring attention</p>
                </div>
              </div>
              {lowStockAlerts.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{lowStockAlerts.length}</span>}
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map(alert => (
                  <div key={alert.id || alert._id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 line-clamp-1 text-sm">{alert.product?.name || alert.name}</h4>
                      <Link
                        to={`/stock`}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        Restock
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Available: <strong className="text-slate-900">{alert.currentStock}kg</strong></span>
                        <span>Min: {alert.minStockLevel}kg</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all duration-500 group-hover:bg-red-600"
                          style={{ width: `${Math.min((alert.currentStock / alert.minStockLevel) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-800 font-bold mb-1 text-sm">All Good!</h4>
                  <p className="text-slate-400 text-xs text-center max-w-[200px] mx-auto">
                    Inventory levels are healthy.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Settlements - New Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-400" /> Pending Settlements
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center hover:bg-emerald-100 transition-colors cursor-pointer group">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Receivables</p>
                  <p className="text-[10px] text-emerald-500 font-medium">To be collected</p>
                </div>
                <h4 className="text-lg font-black text-emerald-700 group-hover:scale-105 transition-transform">{formatCurrency(salesSummary?.pendingPayments || 0)}</h4>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex justify-between items-center hover:bg-amber-100 transition-colors cursor-pointer group">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">Payables</p>
                  <p className="text-[10px] text-amber-500 font-medium">To be paid</p>
                </div>
                <h4 className="text-lg font-black text-amber-700 group-hover:scale-105 transition-transform">{formatCurrency(purchaseSummary?.pendingPayments || 0)}</h4>
              </div>
            </div>
          </div>
        </div >

      </div >
    </div >
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend, subLabel, isTrendUp, inverseTrend, type }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  };

  const themeClass = themes[color] || themes.slate;

  let trendColor = "text-slate-400";
  if (trend) {
    if (inverseTrend) {
      trendColor = isTrendUp ? "text-red-500" : "text-emerald-500";
    } else {
      trendColor = isTrendUp ? "text-emerald-500" : "text-red-500";
    }
  }

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeClass} transition-colors shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendColor} bg-slate-50 px-2 py-1 rounded-md`}>
            {isTrendUp ? <MoveUp className="w-3 h-3" /> : <MoveDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{title}</p>
        <h3 className={`text-2xl font-black tracking-tight ${type === 'alert' && value > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{value}</h3>
        {subLabel && <p className="text-xs text-slate-400 font-medium mt-1">{subLabel}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
