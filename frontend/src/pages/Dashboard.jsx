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

const Dashboard = () => {
  const [data, setData] = useState({
    stockSummary: null,
    salesSummary: null,
    purchaseSummary: null,
    lowStockAlerts: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [stockRes, salesRes, purchaseRes, alertsRes, ordersRes] = await Promise.all([
          fetchStockSummary(token),
          fetchSalesSummary(token),
          fetchPurchaseSummary(token),
          fetchStockAlerts(token),
          fetchOrders(token),
        ]);

        setData({
          stockSummary: stockRes.data,
          salesSummary: salesRes.data,
          purchaseSummary: purchaseRes.data,
          lowStockAlerts: alertsRes.data || [],
          recentOrders: ordersRes.data?.slice(0, 5) || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const { stockSummary, salesSummary, purchaseSummary, lowStockAlerts, recentOrders } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stockSummary?.totalStockValue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{salesSummary?.currentMonthTotal?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <div className="w-6 h-6 bg-purple-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{purchaseSummary?.currentMonthTotal?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockSummary?.lowStockCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {lowStockAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Current: {alert.currentStock}kg | Min: {alert.minStockLevel}kg
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${alert.urgency === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {alert.urgency === 'critical' ? 'Critical' : 'Warning'}
                  </span>
                </div>
              ))}
            </div>
            {lowStockAlerts.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  to="/stock"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {lowStockAlerts.length} alerts →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{order.totalAmount?.toLocaleString()}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all orders →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/purchases/new"
                className="p-4 text-center bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Add Purchase</p>
              </Link>
              <Link
                to="/sales/new"
                className="p-4 text-center bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Add Sale</p>
              </Link>
              <Link
                to="/stock"
                className="p-4 text-center bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-500 rounded mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Manage Stock</p>
              </Link>
              <Link
                to="/orders/new"
                className="p-4 text-center bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="w-8 h-8 bg-yellow-500 rounded mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Add Order</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
