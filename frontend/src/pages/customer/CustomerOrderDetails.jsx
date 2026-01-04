import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchOrder } from '../../lib/api';

const CustomerOrderDetails = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrder = async () => {
            if (token && id) {
                try {
                    const data = await fetchOrder(id, token);
                    setOrder(data);
                } catch (err) {
                    setError("Failed to load order details.");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadOrder();
    }, [id, token]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !order) return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Order not found</h2>
            <p className="text-slate-500 mb-6">{error || "We couldn't find the order you're looking for."}</p>
            <button onClick={() => navigate('/my-account/orders')} className="text-indigo-600 font-bold hover:underline">Back to Orders</button>
        </div>
    );

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Breadcrumb / Header */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button onClick={() => navigate('/my-account')} className="hover:underline hover:text-indigo-600">Your Account</button>
                <span>&rsaquo;</span>
                <button onClick={() => navigate('/my-account/orders')} className="hover:underline hover:text-indigo-600">Your Orders</button>
                <span>&rsaquo;</span>
                <span className="text-slate-800 font-medium">Order #{order.orderNumber || (order._id && order._id.slice(-6).toUpperCase())}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow space-y-8">
                    {/* Order Details Card */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6">
                            <h1 className="text-2xl font-light text-slate-800 mb-6">Order Details</h1>

                            <div className="flex flex-wrap gap-8 text-sm mb-8">
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Ordered on</span>
                                    <span className="text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="border-l border-slate-200 pl-8">
                                    <span className="block text-slate-500 font-medium mb-1">Order #</span>
                                    <span className="text-slate-800">{order.orderNumber || (order._id && order._id.slice(-6).toUpperCase())}</span>
                                </div>
                                <div className="border-l border-slate-200 pl-8">
                                    <span className="block text-slate-500 font-medium mb-1">Total Amount</span>
                                    <span className="text-slate-800 font-bold">₹{Number(order.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Visual Boxes / Status Tracker */}
                            {isCancelled ? (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8">
                                    <h3 className="text-red-800 font-bold">Order Cancelled</h3>
                                    <p className="text-red-600 text-sm">This order has been cancelled.</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg p-6 mb-8 bg-slate-50/50">
                                    <div className="relative">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                        ></div>
                                        <div className="relative flex justify-between">
                                            {steps.map((step, idx) => (
                                                <div key={step} className="flex flex-col items-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 z-10 ${idx <= currentStepIndex ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'
                                                        }`}></div>
                                                    <span className={`text-xs font-bold uppercase mt-3 tracking-wide ${idx <= currentStepIndex ? 'text-green-700' : 'text-slate-400'
                                                        }`}>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="space-y-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 border border-slate-200 p-2">
                                            {item.product?.thumbnail ? (
                                                <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 text-center">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-800">{item.product?.name || item.productSnapshot?.name || "Unknown Product"}</h3>
                                            <p className="text-sm text-slate-500 mb-1">{item.product?.brand || item.productSnapshot?.brand} &bull; {item.product?.color || item.productSnapshot?.color}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button className="px-3 py-1 bg-yarnSun text-indigoInk text-xs font-bold rounded hover:bg-yellow-400 transition">
                                                    Buy it again
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">₹{item.price?.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Shipping Address</h3>
                        <div className="text-sm text-slate-600 leading-relaxed">
                            <p className="font-bold text-slate-800 mb-1">{order.buyer?.name || user.name}</p>
                            <p>{order.shippingAddress?.street || "No street provided"}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
                            <p>{order.shippingAddress?.country || "India"}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Payment Method</h3>
                        <div className="flex items-center gap-3">
                            {/* Simple generic icon */}
                            <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                                {order.paymentMethod || "COD"}
                            </div>
                            <p className="text-sm text-slate-600 font-medium">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                                    order.paymentMethod === 'card' ? 'ending in ****' :
                                        order.paymentMethod}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Item(s) Subtotal:</span>
                                <span>₹{(order.subtotal || order.totalAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping:</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Tax:</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-base">
                                <span>Grand Total:</span>
                                <span>₹{(order.totalAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrderDetails;
