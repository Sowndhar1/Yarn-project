import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackButton';
import { createOrder, updateProfileRequest, verifyPayment } from '../lib/api';

const Checkout = () => {
    const { cartItems, cartTotals, clearCart } = useCart();
    const { user, token, setUser } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Step management
    const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment, 3: Review

    // Address State
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        type: 'home'
    });

    const [paymentMethod, setPaymentMethod] = useState('online');

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSaveNewAddress = async () => {
        if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
            setError("Please fill in all address fields.");
            return;
        }

        try {
            setLoading(true);
            const updatedAddresses = [...(user?.addresses || [])];
            if (newAddress.index !== undefined) {
                const { index, ...addrData } = newAddress;
                updatedAddresses[index] = addrData;
            } else {
                updatedAddresses.push(newAddress);
            }

            const response = await updateProfileRequest(token, { addresses: updatedAddresses });
            if (response.user) {
                setUser(response.user);
                setShowAddressForm(false);
                setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India', type: 'home' });
                setSelectedAddressIndex(updatedAddresses.length - 1);
            }
        } catch (err) {
            setError(err.message || "Failed to save address.");
        } finally {
            setLoading(false);
        }
    };

    const getDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const handleSubmitOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            // Determine active address
            let finalAddress = user?.addresses?.[selectedAddressIndex];

            // Validation
            if (!finalAddress) {
                console.error('Checkout: No address selected at index:', selectedAddressIndex);
                throw new Error("Please select or add a delivery address.");
            }

            console.log('Checkout: Using finalAddress:', finalAddress);

            const orderPayload = {
                items: cartItems.map(item => ({
                    productId: item._id || item.id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    street: finalAddress.street,
                    city: finalAddress.city,
                    state: finalAddress.state,
                    postalCode: finalAddress.postalCode || finalAddress.pinCode || finalAddress.zipCode,
                    country: finalAddress.country || 'India',
                    phone: user.phone || ''
                },
                billingAddress: {
                    street: finalAddress.street,
                    city: finalAddress.city,
                    state: finalAddress.state,
                    postalCode: finalAddress.postalCode || finalAddress.pinCode || finalAddress.zipCode,
                    country: finalAddress.country || 'India'
                },
                paymentMethod: paymentMethod,
                totalAmount: cartTotals.total,
                subtotal: cartTotals.subtotal,
                shippingCost: cartTotals.shipping,
                gstAmount: cartTotals.gst
            };

            console.log('Checkout: Sending order payload:', JSON.stringify(orderPayload, null, 2));
            const response = await createOrder(orderPayload, token);
            console.log('Checkout: Received response:', response);

            if (response.order || response._id || response.razorpayOrderId) {
                const orderId = response.order?.orderNumber || response.order?._id || response._id;

                if (paymentMethod === 'online' && response.razorpayOrderId) {
                    const resLoader = await loadRazorpayScript();

                    if (!resLoader) {
                        setError("Razorpay SDK failed to load. Are you online?");
                        setLoading(false);
                        return;
                    }

                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
                        amount: response.amount,
                        currency: response.currency,
                        name: "Yarn Business",
                        description: "Order Payment",
                        image: "/logo.png",
                        order_id: response.razorpayOrderId,
                        handler: async function (razorpayResponse) {
                            try {
                                setLoading(true);
                                const verifyRes = await verifyPayment({
                                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                                    razorpay_signature: razorpayResponse.razorpay_signature,
                                    orderId: orderId
                                }, token);

                                if (verifyRes.order || verifyRes.message === 'Payment verified and order confirmed') {
                                    clearCart();
                                    navigate(`/checkout/success/${orderId}`);
                                } else {
                                    setError("Payment verification failed. Please contact support.");
                                }
                            } catch (err) {
                                console.error('Verification error:', err);
                                setError("An error occurred during payment verification.");
                            } finally {
                                setLoading(false);
                            }
                        },
                        prefill: {
                            name: user.name,
                            email: user.email,
                            contact: user.phone || ""
                        },
                        notes: {
                            address: orderPayload.shippingAddress.street
                        },
                        theme: {
                            color: "#4F46E5"
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    // COD success
                    clearCart();
                    navigate(`/checkout/success/${orderId}`);
                }
            } else {
                setError(response.message || "Failed to place order.");
            }
        } catch (err) {
            console.error('Checkout Error:', err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <BackButton />
                    <h1 className="text-3xl font-bold text-indigo-950">Secure Checkout</h1>
                </div>
                <div className="text-slate-500 text-sm flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span className="font-medium">Encrypted Connection</span>
                </div>
            </div>

            {error && (
                <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Step 1: Address */}
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
                                                className="mt-1 text-indigo-600 w-4 h-4"
                                                checked={selectedAddressIndex === idx}
                                                readOnly
                                            />
                                            <div className="text-sm flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900">{user.name}</span>
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wide">{addr.type}</span>
                                                </div>
                                                <p className="text-slate-600">{addr.street}</p>
                                                <p className="text-slate-600">{addr.city}, {addr.state} - <span className="font-medium text-slate-800">{addr.postalCode}</span></p>
                                                <p className="text-slate-600">{addr.country}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-2">
                                        <button onClick={() => { setShowAddressForm(!showAddressForm); }} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 hover:bg-indigo-50 rounded transition-colors">
                                            <span className="text-lg leading-none">+</span> Add a new address
                                        </button>
                                    </div>

                                    {showAddressForm && (
                                        <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs uppercase text-slate-500 mb-1">Street Address</label>
                                                    <input type="text" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase text-slate-500 mb-1">City</label>
                                                    <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase text-slate-500 mb-1">Pincode</label>
                                                    <input type="text" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase text-slate-500 mb-1">State</label>
                                                    <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="e.g. Tamil Nadu" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase text-slate-500 mb-1">Country</label>
                                                    <input type="text" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2" />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end gap-3">
                                                <button onClick={() => setShowAddressForm(false)} className="text-slate-600 text-sm font-bold">Cancel</button>
                                                <button onClick={handleSaveNewAddress} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold">Save Address</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setActiveStep(2)}
                                            disabled={showAddressForm || !user?.addresses?.[selectedAddressIndex]}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md text-sm font-bold disabled:opacity-50"
                                        >
                                            Use this address
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Payment */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`p-5 flex items-center justify-between ${activeStep === 2 ? 'bg-indigo-50/50' : ''}`}>
                            <h2 className={`font-bold text-lg ${activeStep === 2 ? 'text-indigo-800' : 'text-slate-700'}`}>2. Payment Method</h2>
                            {activeStep !== 2 && (
                                <div className="text-sm text-slate-600 flex gap-4 items-center">
                                    <span className="font-medium">{paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                                    <button onClick={() => setActiveStep(2)} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">Change</button>
                                </div>
                            )}
                        </div>

                        {activeStep === 2 && (
                            <div className="p-6 border-t border-slate-100">
                                <div className="space-y-3">
                                    {['online', 'cod'].map(method => (
                                        <label key={method} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mt-1 text-indigo-600 w-4 h-4" />
                                            <div>
                                                <span className="font-bold text-sm block text-slate-900">
                                                    {method === 'online' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                    <button onClick={() => setActiveStep(3)} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-md text-sm font-bold">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Review */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`p-5 ${activeStep === 3 ? 'bg-indigo-50/50' : ''}`}>
                            <h2 className={`font-bold text-lg ${activeStep === 3 ? 'text-indigo-800' : 'text-slate-700'}`}>3. Review items and delivery</h2>
                        </div>

                        {activeStep === 3 && (
                            <div className="p-6 border-t border-slate-100">
                                <div className="space-y-6">
                                    {cartItems.map(item => (
                                        <div key={item._id || item.id} className="flex gap-5 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                            <div className="w-16 h-16 bg-slate-50 rounded border flex items-center justify-center p-1">
                                                <img src={item.thumbnail} alt={item.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                                <div className="text-xs text-slate-500">Qty: {item.quantity} | ₹{item.pricePerKg}/unit</div>
                                            </div>
                                            <div className="text-right font-bold text-sm">₹{(item.pricePerKg * item.quantity).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6 shadow-sm">
                        <button
                            onClick={handleSubmitOrder}
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all mb-4 disabled:opacity-50"
                        >
                            {loading ? 'Processing Order...' : 'Place Your Order'}
                        </button>

                        <div className="space-y-3 text-sm border-t border-slate-100 pt-6">
                            <h3 className="font-bold text-slate-900 mb-1">Order Summary</h3>
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">₹{cartTotals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>GST (18%):</span>
                                <span className="font-medium">₹{cartTotals.gst.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span className={cartTotals.shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                                    {cartTotals.shipping === 0 ? 'FREE' : `₹${cartTotals.shipping.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-indigo-900 pt-4 border-t">
                                <span>Total:</span>
                                <span>₹{cartTotals.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
