import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderDetailsRequest } from '../lib/api';
import { generateInvoice } from '../services/invoiceService';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id || !token) return;
            try {
                const response = await getOrderDetailsRequest(id, token);
                if (response.order) {
                    setOrder(response.order);
                }
            } catch (err) {
                console.error('Failed to fetch order details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Loading order details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-2xl mx-auto flex flex-col gap-6">

                {/* Branding Header */}
                <div className="text-center mb-4">
                    <h2 className="text-4xl font-black text-indigo-600 uppercase tracking-tight">Shivam yarn agencies</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Filament Yarn Supplier</p>
                </div>

                <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 text-center relative overflow-hidden border border-white">
                    {/* Success Icon */}
                    <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        Hello {user?.name?.split(' ')[0] || 'there'}, your order has been successfully placed.
                    </p>

                    {/* Order Card */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                            Failed to load order: {error}. Your order was placed successfully, but we couldn't fetch details for the invoice.
                        </div>
                    )}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium text-sm">Order Number:</span>
                                <span className="font-bold text-slate-900">#{order?.orderNumber || '...'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium text-sm">Date:</span>
                                <span className="font-bold text-slate-900">{order ? new Date(order.createdAt).toLocaleDateString() : '...'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium text-sm">Payment Method:</span>
                                <span className="font-bold text-slate-900 uppercase">{order?.paymentMethod || '...'}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 mt-2 flex justify-between items-center">
                                <span className="text-indigo-900 font-bold">Total Amount:</span>
                                <span className="text-xl font-black text-indigo-600">₹{order?.totalAmount?.toLocaleString() || '...'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                if (order) {
                                    generateInvoice(order);
                                } else {
                                    alert('Order details still loading. Please wait a moment.');
                                }
                            }}
                            disabled={!order}
                            className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Invoice (PDF)
                        </button>
                        <button
                            onClick={() => navigate('/my-account/orders')}
                            className="py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all"
                        >
                            Track My Order
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 w-full py-4 text-indigo-600 font-bold text-sm hover:underline"
                    >
                        Back to Home
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-slate-400 text-xs font-medium">
                        A confirmation email has been sent to {user?.email}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
