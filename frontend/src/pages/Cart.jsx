import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotals, refreshCartItems } = useCart();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [orderNotes, setOrderNotes] = useState('');
    const [voucherCode, setVoucherCode] = useState('');

    useEffect(() => {
        refreshCartItems();
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/customer/login', {
                state: {
                    from: '/cart',
                    message: 'Please sign in to view your cart.'
                }
            });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Cart...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const freeShippingThreshold = 5000;
    const progress = Math.min((cartTotals.subtotal / freeShippingThreshold) * 100, 100);

    // Business Logic: Calculate dynamic dispatch date
    const getDispatchDate = (leadTimeDays) => {
        const date = new Date();
        date.setDate(date.getDate() + (leadTimeDays || 3));
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-6 max-w-lg p-8">
                    <div className="w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty Cart" className="w-32 opacity-50 grayscale" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Your Cart is empty</h2>
                        <Link to="/storefront" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-sm">
                            Browse our catalog
                        </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <button
                            onClick={() => navigate('/storefront')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Left Column: Cart Items */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Header Area */}
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                                <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
                                <span className="text-sm text-slate-500 font-medium align-bottom">Price</span>
                            </div>

                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0 w-32 h-32 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center sticky top-0">
                                                <Link to={`/product/${item.id}`}>
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.name}
                                                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://placehold.co/400x400/f1f5f9/64748b?text=Yarn+Sample';
                                                        }}
                                                    />
                                                </Link>
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <Link to={`/product/${item.id}`} className="text-lg font-bold text-slate-800 hover:text-indigo-600 leading-tight block mb-1 transition-colors">
                                                            {item.name}
                                                        </Link>
                                                        <div className="text-xs text-green-700 font-bold bg-green-50 inline-block px-1.5 py-0.5 rounded">In Stock</div>
                                                        <div className="text-xs text-slate-500">Sold by <span className="text-slate-700 font-medium">Shivam Yarn Agencies</span></div>

                                                        <div className="flex items-center gap-4 mt-4">
                                                            {/* Qty Select */}
                                                            <div className="flex items-center border border-slate-300 rounded-md bg-white shadow-sm h-8">
                                                                <span className="px-2 text-xs font-bold text-slate-500 border-r border-slate-300 bg-slate-50 h-full flex items-center">Qty</span>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-3 hover:bg-slate-100 text-slate-600 disabled:opacity-30 font-bold transition-colors">-</button>
                                                                <span className="px-2 text-sm font-bold text-slate-900 w-8 text-center">{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 hover:bg-slate-100 text-slate-600 font-bold transition-colors">+</button>
                                                            </div>

                                                            <div className="h-4 w-px bg-slate-200 mx-1"></div>

                                                            <button onClick={() => removeFromCart(item.id)} className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline">Remove</button>

                                                            <div className="h-4 w-px bg-slate-200 mx-1"></div>

                                                            <button className="text-xs font-medium text-slate-500 hover:text-indigo-600 hover:underline">Save for later</button>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-slate-900">₹{((item.pricePerKg || 0) * (item.quantity || 1)).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4 mt-6">
                                <div className="text-xl text-slate-900">
                                    Subtotal ({cartItems.length} items): <span className="font-bold">₹{(cartTotals?.subtotal || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm sticky top-4">
                            {/* Free Delivery Progress */}
                            {cartTotals.subtotal < freeShippingThreshold && (
                                <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                        <span className="font-medium">Add <span className="text-indigo-600 font-bold">₹{(freeShippingThreshold - (cartTotals?.subtotal || 0)).toLocaleString()}</span> for <span className="inline-flex items-center gap-1 font-bold text-green-700"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>FREE Delivery</span></span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {cartTotals.subtotal >= freeShippingThreshold && (
                                <div className="mb-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded border border-green-100">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-bold">Your order qualifies for FREE Delivery.</span>
                                </div>
                            )}

                            <div className="text-lg text-slate-800 mb-6 pb-6 border-b border-slate-100">
                                Subtotal <span className="text-slate-500 text-sm font-normal">({cartItems.length} items)</span>
                                <div className="font-bold text-2xl mt-1">₹{(cartTotals?.subtotal || 0).toLocaleString()}</div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all mb-4 transform active:scale-[0.98]"
                            >
                                Proceed to Buy
                            </button>
                        </div>

                        {/* Recently Viewed Placeholder */}
                        <div className="mt-4 bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-sm text-slate-800 mb-2">Customers who bought items in your cart also bought</h3>
                            {/* Horizontal scroll placeholder */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex-shrink-0 w-24 h-32 bg-slate-50 border border-slate-100 rounded p-1">
                                        <div className="h-20 bg-slate-200 mb-1"></div>
                                        <div className="h-3 w-16 bg-slate-200 rounded mb-1"></div>
                                        <div className="h-3 w-10 bg-slate-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
