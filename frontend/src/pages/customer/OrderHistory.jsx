import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fetchMyOrders } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const { token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            if (token) {
                try {
                    const myOrders = await fetchMyOrders(token);
                    setOrders(myOrders);
                } catch (error) {
                    console.error("Failed to fetch orders", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadOrders();
    }, [token]);

    const handleBuyAgain = (e, order) => {
        e.stopPropagation();
        if (!order.items || order.items.length === 0) return;

        // Add all items from the order to the cart
        order.items.forEach(item => {
            if (item.product) {
                // Map the order item structure back to what addToCart expects
                // Usually addToCart expects { id: productId, ...productDetails }
                // item.product in order history is usually the populated product object
                const productToAdd = {
                    id: item.product._id || item.product.id,
                    name: item.product.name,
                    pricePerKg: item.product.pricePerKg, // Ensure this exists or fallback
                    thumbnail: item.product.thumbnail,
                    gstRate: item.product.gstRate
                };
                addToCart(productToAdd, item.quantity || 1);
            }
        });
        navigate('/cart');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate('/my-account')} className="text-slate-400 hover:text-indigo-600 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-light text-slate-800">Your Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">View and track all your past purchases</p>
                </div>
            </div>

            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div
                            key={order._id || order.id}
                            className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white group relative"
                        >
                            {/* Main Card Click Area - Absolute positioning to cover everything except buttons */}
                            <div
                                className="absolute inset-0 z-0 cursor-pointer"
                                onClick={() => navigate(`/my-account/orders/${order._id || order.id}`)}
                            ></div>

                            <div className="bg-slate-50 px-6 py-4 flex flex-wrap gap-y-4 justify-between items-center text-sm border-b border-slate-200 relative z-10 pointer-events-none">
                                <div className="flex gap-8 pointer-events-auto">
                                    <div>
                                        <span className="block text-slate-500 uppercase text-[10px] font-bold tracking-wider">Order Placed</span>
                                        <span className="font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 uppercase text-[10px] font-bold tracking-wider">Total</span>
                                        <span className="font-medium text-slate-700">₹{(order.totalAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 uppercase text-[10px] font-bold tracking-wider">Order #</span>
                                        <span className="font-medium text-slate-700">{order.orderNumber || (order._id && order._id.slice(-6).toUpperCase())}</span>
                                    </div>
                                </div>
                                <div className="pointer-events-auto">
                                    <button
                                        onClick={() => navigate(`/my-account/orders/${order._id || order.id}`)}
                                        className="text-indigo-600 font-bold hover:underline"
                                    >
                                        View Order Details
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 relative z-10 pointer-events-none">
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="flex-grow space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 mb-1">
                                                    {order.status === 'delivered' ? 'Delivered' :
                                                        order.status === 'shipped' ? 'Shipped' :
                                                            order.status === 'processing' ? 'Processing' :
                                                                order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {order.status === 'pending' ? 'Your order is being reviewed by our team.' :
                                                        order.status === 'processing' ? 'We are packing your yarn.' :
                                                            order.status === 'shipped' ? 'Your package is on the way.' :
                                                                'Package delivered successfully.'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Simple items preview */}
                                        <div className="flex gap-4 overflow-x-auto pb-2 pointer-events-auto">
                                            {order.items && order.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200">
                                                    {item.product?.thumbnail ? (
                                                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover rounded-md opacity-90" />
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-bold text-center px-1">{item.product?.name || "Yarn"}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {order.items && order.items.length > 3 && (
                                                <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-xs">
                                                    +{order.items.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:w-48 flex-shrink-0 flex flex-col gap-2 pointer-events-auto">
                                        <button
                                            onClick={() => navigate(`/my-account/track/${order._id || order.id}`)}
                                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                                        >
                                            Track Package
                                        </button>
                                        <button
                                            onClick={(e) => handleBuyAgain(e, order)}
                                            className="w-full py-2 px-4 border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition"
                                        >
                                            Buy Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-6 text-lg">You have not placed any orders yet.</p>
                    <button onClick={() => navigate('/')} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-xl">
                        Start Shopping
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
