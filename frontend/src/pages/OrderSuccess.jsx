import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dots, setDots] = useState('');

    // Simple animation for dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length < 3 ? prev + '.' : '');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">

                {/* Success Icon Animation */}
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce-slow">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Payment Successful!</h1>
                <p className="text-slate-500 font-medium text-lg mb-8">
                    Thank you for your purchase. Your order <span className="font-bold text-slate-900">#{id ? id.slice(-6).toUpperCase() : '...'}</span> has been confirmed.
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span>Confirmation sent to:</span>
                            <span className="font-bold text-slate-900">{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimated Delivery:</span>
                            <span className="font-bold text-slate-900">3-5 Business Days</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate('/my-account')}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        View Order Details
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-100 hover:bg-slate-50 transition-all"
                    >
                        Continue Shopping
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-400 font-medium">
                    A copy of the invoice has been sent to your registered email.
                </p>
            </div>
        </div>
    );
};

export default OrderSuccess;
