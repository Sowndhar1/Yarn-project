import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createOrder, updateProfileRequest } from '../lib/api';

const Checkout = () => {
    const { cartItems, cartTotals, clearCart } = useCart();
    const { user, token, setUser } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Step management
    const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment, 3: Review (optional, usually combined)

    // Address State
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '', city: '', state: '', postalCode: '', country: 'India', type: 'home'
    });

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('card');

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
        // Set default address if available
        if (user?.addresses?.length > 0) {
            const defaultIndex = user.addresses.findIndex(a => a.isDefault);
            setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
        } else {
            setShowAddressForm(true);
        }
    }, [cartItems, navigate, user]);

    // Format delivery date (random logic for demo: 3-5 days)
    const getDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    };

    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let updatedAddresses;
            if (newAddress.index !== undefined) {
                // Edit mode
                updatedAddresses = [...(user.addresses || [])];
                updatedAddresses[newAddress.index] = {
                    ...updatedAddresses[newAddress.index], // Preserve _id !!
                    street: newAddress.street,
                    city: newAddress.city,
                    state: newAddress.state,
                    postalCode: newAddress.postalCode,
                    country: newAddress.country,
                    type: newAddress.type,
                    isDefault: newAddress.isDefault
                };
            } else {
                // Add mode
                updatedAddresses = [...(user.addresses || []), newAddress];
            }

            const response = await updateProfileRequest(token, { addresses: updatedAddresses });
            if (response.user) {
                setUser(response.user);
                // If adding, select the new one. If editing, keep selection or update if it was the selected one.
                if (newAddress.index === undefined) {
                    setSelectedAddressIndex(updatedAddresses.length - 1);
                }
                setShowAddressForm(false);
                // Reset form
                setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India', type: 'home' });
            }
        } catch (err) {
            setError("Failed to save address. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            // Determine active address
            let finalAddress = user?.addresses?.[selectedAddressIndex];

            // Validation
            if (!finalAddress) {
                throw new Error("Please select or add a delivery address.");
            }

            const orderPayload = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    street: finalAddress.street,
                    city: finalAddress.city,
                    state: finalAddress.state,
                    zipCode: finalAddress.postalCode, // Backend expects zipCode? or postalCode? Mapping to Schema
                    country: finalAddress.country,
                    phone: user.phone || ''
                },
                billingAddress: { // Simply duplicate for now
                    street: finalAddress.street,
                    city: finalAddress.city,
                    state: finalAddress.state,
                    zipCode: finalAddress.postalCode,
                    country: finalAddress.country
                },
                paymentMethod: paymentMethod,
                totalAmount: cartTotals.total
            };

            const response = await createOrder(orderPayload, token);

            if (response.success || response._id) {
                clearCart();
                const orderId = response.order?._id || response._id;
                navigate(`/checkout/success/${orderId}`);
            } else {
                setError(response.message || 'Failed to place order');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while placing the order');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
            {/* Header mostly for "Checkout" title like Amazon */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-indigo-950">Secure Checkout</h1>
                <div className="text-slate-500 text-sm flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span className="font-medium">Encrypted Connection</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">

                {/* Left Column - Steps */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Step 1: Delivery Address */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`p-5 flex items-center justify-between ${activeStep === 1 ? 'bg-indigo-50/50' : ''}`}>
                            <h2 className={`font-bold text-lg ${activeStep === 1 ? 'text-indigo-800' : 'text-slate-700'}`}>1. Delivery Address</h2>
                            {activeStep !== 1 && user.addresses?.[selectedAddressIndex] && (
                                <div className="text-sm text-slate-600 flex gap-4 items-center">
                                    <span className="truncate max-w-[200px] font-medium">{user.addresses[selectedAddressIndex].city}, {user.addresses[selectedAddressIndex].postalCode}</span>
                                    <button onClick={() => setActiveStep(1)} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">Change</button>
                                </div>
                            )}
                        </div>

                        {activeStep === 1 && (
                            <div className="p-6 border-t border-slate-100">
                                <div className="space-y-4">
                                    {user.addresses && user.addresses.map((addr, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => { setSelectedAddressIndex(idx); setShowAddressForm(false); }}
                                            className={`relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 transition-all ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-sm' : 'border-slate-200'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                                checked={selectedAddressIndex === idx}
                                                onChange={() => { setSelectedAddressIndex(idx); setShowAddressForm(false); }}
                                            />
                                            <div className="text-sm flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900">{user.name}</span>
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wide">{addr.type}</span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed">{addr.street}</p>
                                                <p className="text-slate-600 leading-relaxed">{addr.city}, {addr.state} - <span className="font-medium text-slate-800">{addr.postalCode}</span></p>
                                                <p className="text-slate-600 leading-relaxed">{addr.country}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent card selection
                                                        setNewAddress({ ...addr, index: idx }); // Use index to track editing
                                                        setShowAddressForm(true);
                                                    }}
                                                    className="text-slate-400 hover:text-indigo-600 text-xs mt-2 font-medium transition-colors"
                                                >
                                                    Edit address
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Address Toggle */}
                                    <div className="pt-2">
                                        <button onClick={() => { setShowAddressForm(!showAddressForm); }} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 hover:bg-indigo-50 rounded transition-colors">
                                            <span className="text-lg leading-none font-light">+</span> Add a new address
                                        </button>
                                    </div>

                                    {/* New Address Form */}
                                    {showAddressForm && (
                                        <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                                            <h3 className="font-bold text-sm text-slate-900 mb-4">{newAddress.index !== undefined ? 'Edit address' : 'Add a new address'}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="md:col-span-2">
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">Full Name</label>
                                                    <input type="text" value={user.name} disabled className="w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-100 text-slate-500" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">Street Address</label>
                                                    <input type="text" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="Flat, House no., Building, Company, Apartment" />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">City</label>
                                                    <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">State</label>
                                                    <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">Pincode</label>
                                                    <input type="text" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">Country</label>
                                                    <input type="text" value={newAddress.country} disabled className="w-full border border-slate-300 rounded-md px-3 py-2 bg-slate-100 text-slate-500" />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-xs uppercase text-slate-500 mb-1.5">Address Type</label>
                                                    <div className="relative">
                                                        <select value={newAddress.type} onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none bg-white">
                                                            <option value="home">Home (7 am – 9 pm delivery)</option>
                                                            <option value="work">Work (10 am – 6 pm delivery)</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setShowAddressForm(false);
                                                        setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India', type: 'home' });
                                                    }}
                                                    className="px-5 py-2 text-slate-600 hover:text-slate-800 font-bold text-sm transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button onClick={handleSaveNewAddress} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all transform active:scale-[0.98]">
                                                    {newAddress.index !== undefined ? 'Update Address' : 'Save Address'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Continue Button */}
                                    <div className="mt-8 flex gap-4 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setActiveStep(2)}
                                            disabled={showAddressForm || !user.addresses?.[selectedAddressIndex]}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                                        >
                                            Use this address
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Payment Method */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`p-5 flex items-center justify-between ${activeStep === 2 ? 'bg-indigo-50/50' : ''}`}>
                            <h2 className={`font-bold text-lg ${activeStep === 2 ? 'text-indigo-800' : 'text-slate-700'}`}>2. Payment Method</h2>
                            {activeStep > 2 && (
                                <div className="text-sm text-slate-600 flex gap-4 items-center">
                                    <span className="font-bold uppercase text-xs tracking-wide bg-slate-100 px-2 py-1 rounded text-slate-800">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span>
                                    <button onClick={() => setActiveStep(2)} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">Change</button>
                                </div>
                            )}
                        </div>

                        {activeStep === 2 && (
                            <div className="p-6 border-t border-slate-100">
                                <div className="space-y-3">
                                    <div className="font-bold text-slate-800 mb-4">Select a payment method</div>

                                    {['card', 'netbanking', 'upi', 'cod'].map(method => (
                                        <label key={method} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                            <div>
                                                <span className="font-bold text-sm block text-slate-900">
                                                    {method === 'card' && 'Credit or Debit Card'}
                                                    {method === 'netbanking' && 'Net Banking'}
                                                    {method === 'upi' && 'Other UPI Apps'}
                                                    {method === 'cod' && 'Cash on Delivery / Pay on Delivery'}
                                                </span>
                                                {method === 'cod' && <span className="text-xs text-slate-500 mt-1 block">Scan & Pay using UPI available at delivery</span>}
                                            </div>
                                        </label>
                                    ))}

                                    <div className="mt-8 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setActiveStep(3)}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md text-sm font-bold transition-all transform active:scale-[0.98]"
                                        >
                                            Use this payment method
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Review Items */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`p-5 flex items-center justify-between ${activeStep === 3 ? 'bg-indigo-50/50' : ''}`}>
                            <h2 className={`font-bold text-lg ${activeStep === 3 ? 'text-indigo-800' : 'text-slate-700'}`}>3. Review items and delivery</h2>
                        </div>

                        {activeStep === 3 && (
                            <div className="p-6 border-t border-slate-100">
                                {/* Delivery Estimate Header */}
                                <div className="mb-8 p-4 rounded-lg border border-indigo-100 bg-indigo-50/50 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <div>
                                        <h3 className="text-indigo-900 font-bold text-base mb-1">Estimated Delivery: {getDeliveryDate()}</h3>
                                        <p className="text-sm text-slate-600">Items are shipped from our central warehouse.</p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-6">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-5 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                            <div className="w-20 h-20 bg-slate-50 rounded-md border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center">
                                                <img src={item.thumbnail} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-slate-900 mb-1">{item.name}</h4>
                                                <div className="text-sm text-slate-600 mb-2">
                                                    <span className="font-semibold text-slate-900">₹{item.pricePerKg.toLocaleString()}</span> <span className="text-slate-400">/ unit</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">Qty: {item.quantity}</span>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-400">
                                                    Sold by: <span className="text-slate-600 font-medium">Shivam Yarn Agencies</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-900">₹{(item.pricePerKg * item.quantity).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Action Place Order for Step 3 */}
                                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center sm:hidden">
                                    {/* Mobile only place order here if needed, but sticky covers it */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Summary & Place Order */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6 shadow-lg shadow-slate-200/50">

                        <button
                            onClick={handleSubmitOrder}
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all mb-4 transform active:scale-[0.98]"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>

                        <p className="text-xs text-center text-slate-500 mb-6 px-2 leading-relaxed">
                            By placing your order, you agree to Shivam Yarn's <span className="text-indigo-600 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>

                        <div className="border-t border-slate-100 pt-6 space-y-3 text-sm text-slate-600">
                            <h3 className="font-bold text-slate-900 mb-3 text-base">Order Summary</h3>
                            <div className="flex justify-between">
                                <span>Items ({cartItems.length}):</span>
                                <span className="font-medium text-slate-900">₹{cartTotals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery:</span>
                                <span className={cartTotals.shipping === 0 ? "text-green-600 font-medium" : "text-slate-900"}>{cartTotals.shipping === 0 ? 'FREE' : `₹${cartTotals.shipping}`}</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 mt-2">
                                <span className="font-bold text-slate-800">Total:</span>
                                <span className="font-bold text-slate-800">₹{(cartTotals.subtotal + cartTotals.shipping).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-700 font-medium bg-green-50 px-3 py-2 rounded-md mt-2">
                                <span>Savings:</span>
                                <span>-₹0.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-indigo-900 pt-4 border-t border-slate-200 mt-2">
                                <span>Order Total:</span>
                                <span>₹{cartTotals.total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-6 bg-slate-50 p-4 rounded-lg text-xs text-slate-500 leading-relaxed border border-slate-100 flex gap-2">
                            <svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <strong>Delivery Policy:</strong><br />
                                Orders over ₹5,000 qualify for FREE Delivery across India.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
