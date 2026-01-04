import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfileRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const YourAddresses = () => {
    const { user, token, setUser } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditingIndex, setIsEditingIndex] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initial Form State
    const initialFormState = {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
        type: 'home'
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        let updatedAddresses = [...addresses];

        if (isEditingIndex !== null) {
            updatedAddresses[isEditingIndex] = formData;
        } else {
            updatedAddresses.push(formData);
        }

        try {
            const response = await updateProfileRequest(token, { addresses: updatedAddresses });
            if (response.user) {
                setUser(response.user);
                setAddresses(response.user.addresses);
            }
            setMessage({ type: 'success', text: 'Address saved successfully.' });
            setIsAdding(false);
            setIsEditingIndex(null);
            setFormData(initialFormState);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to save address.' });
        }
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        const updatedAddresses = addresses.filter((_, i) => i !== index);
        try {
            const response = await updateProfileRequest(token, { addresses: updatedAddresses });
            if (response.user) {
                setUser(response.user);
                setAddresses(response.user.addresses);
            }
            setMessage({ type: 'success', text: 'Address deleted successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to delete address.' });
        }
    };

    const startEdit = (index) => {
        setFormData(addresses[index]);
        setIsEditingIndex(index);
        setIsAdding(true);
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setIsEditingIndex(null);
        setFormData(initialFormState);
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button onClick={() => navigate('/my-account')} className="hover:underline hover:text-indigo-600">Your Account</button>
                <span>&rsaquo;</span>
                <span className="text-slate-800 font-medium">Your Addresses</span>
            </div>

            <h1 className="text-3xl font-light text-slate-800 mb-8">Your Addresses</h1>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {!isAdding && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add New Card */}
                    <div
                        onClick={() => { setIsAdding(true); setIsEditingIndex(null); setFormData(initialFormState); }}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all group"
                    >
                        <div className="w-12 h-12 mb-3 text-slate-300 group-hover:text-indigo-500 transition-colors">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-700 group-hover:text-indigo-700">Add Address</h2>
                    </div>

                    {/* Existing Addresses */}
                    {addresses.map((addr, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl p-6 relative hover:shadow-md transition-shadow bg-white">
                            {addr.isDefault && (
                                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">Default</span>
                            )}
                            <h3 className="font-bold text-slate-800 mb-2 capitalize">{addr.type || 'Home'}</h3>
                            <div className="text-sm text-slate-600 space-y-1 mb-6">
                                <p className="font-medium text-slate-800">{user.name}</p>
                                <p>{addr.street}</p>
                                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                <p>{addr.country}</p>
                            </div>
                            <div className="absolute bottom-4 left-6 flex gap-3 text-sm font-bold text-indigo-600">
                                <button onClick={() => startEdit(idx)} className="hover:underline">Edit</button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => handleDelete(idx)} className="hover:underline">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div className="max-w-2xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{isEditingIndex !== null ? 'Edit Address' : 'Add a new address'}</h2>
                    <form onSubmit={handleSaveSaveAddress} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Country/Region</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 bg-slate-50 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Address Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                            <input
                                type="text"
                                placeholder="Flat, House no., Building, Company, Apartment"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Pincode</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
                            >
                                {isEditingIndex !== null ? 'Update Address' : 'Add Address'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default YourAddresses;
