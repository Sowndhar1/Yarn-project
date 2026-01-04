import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  // Feature Tiles Configuration
  const features = [
    {
      title: "Your Orders",
      description: "Track, return, or buy things again",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      link: "/my-account/orders"
    },
    {
      title: "Login & Security",
      description: "Edit login, name, and mobile number",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      link: "/my-account/security"
    },
    {
      title: "Your Addresses",
      description: "Edit addresses for orders and gifts",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: "/my-account/addresses"
    },
    {
      title: "Contact Us",
      description: "Contact our customer service via phone or chat",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      action: () => window.location.href = "mailto:support@shivamyarn.com" // Simple action for now
    }
  ];

  useEffect(() => {
    const loadOrders = async () => {
      if (token) {
        try {
          const myOrders = await fetchMyOrders(token);
          setOrders(myOrders);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        }
      }
    };
    loadOrders();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Your Account</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your details and view your orders</p>
        </div>
        <button
          onClick={logout}
          className="text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, idx) => (
          <div
            key={idx}
            onClick={() => feature.link ? navigate(feature.link) : feature.action && feature.action()}
            className="bg-white border border-slate-200 rounded-xl p-6 flex gap-4 cursor-pointer hover:shadow-lg hover:border-indigo-500 transition-all duration-300 group shadow-sm"
          >
            <div className="flex-shrink-0">
              {feature.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{feature.title}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Preview Section */}
      <div className="border-t border-slate-200 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
          {orders.length > 0 && (
            <button onClick={() => navigate('/my-account/orders')} className="text-sm text-indigo-600 hover:underline font-bold">
              View all orders
            </button>
          )}
        </div>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.slice(0, 4).map(order => (
              <div
                key={order._id || order.id}
                onClick={() => {
                  // Navigate to the product detail of the first item
                  const firstItem = order.items && order.items[0];
                  // Handle both populated product object or raw ID
                  const productId = firstItem?.product?._id || firstItem?.product;

                  if (productId) {
                    navigate(`/product/${productId}`);
                  } else {
                    // Fallback to order details if no product found
                    navigate(`/my-account/orders/${order._id || order.id}`);
                  }
                }}
                className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer bg-white group hover:border-indigo-400"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Placed</p>
                    <p className="text-sm font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</p>
                    <p className="text-sm font-bold text-slate-900">₹{(order.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      Order #{order.orderNumber || (order._id && order._id.slice(-6).toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 mb-4">You have not placed any orders yet.</p>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition">
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
