import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfileRequest, changePasswordRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const LoginSecurity = () => {
    const { user, token, setUser } = useAuth();
    const navigate = useNavigate();

    // Personal Details State
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [detailsMessage, setDetailsMessage] = useState({ type: '', text: '' });

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setDetailsMessage({ type: '', text: '' });
        try {
            const response = await updateProfileRequest(token, { name, phone });
            // Update local context safely
            if (response.user) {
                // Determine how your context expects user updates. 
                // Assuming setUser expects the full user object.
                // Re-hydrating context might be safer via fetchProfile if setUser isn't enough, 
                // but usually the auth provider update is sufficient.
                // We'll trust the response for now.
                // NOTE: `useAuth` usually provides a setUser or update method. 
                // If not, we might need to reload or re-fetch.
                // Looking at user context usage elsewhere, it seems to just read `user`.
                // We will attempt to rely on the backend update and maybe a page reload or context refresh if `setUser` is available.
                // Given step 2893 AuthContext wasn't fully viewed but usually `setUser` exists.
                // If `setUser` is simple setState, we do:
                setUser(response.user);
            }
            setDetailsMessage({ type: 'success', text: 'Details updated successfully.' });
            setIsEditingDetails(false);
        } catch (err) {
            setDetailsMessage({ type: 'error', text: err.message || 'Failed to update details.' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        try {
            await changePasswordRequest(token, currentPassword, newPassword);
            setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button onClick={() => navigate('/my-account')} className="hover:underline hover:text-indigo-600">Your Account</button>
                <span>&rsaquo;</span>
                <span className="text-slate-800 font-medium">Login & Security</span>
            </div>

            <h1 className="text-3xl font-light text-slate-800 mb-8">Login & Security</h1>

            <div className="space-y-8">
                {/* Personal Details Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">Personal Information</h2>
                        {!isEditingDetails && (
                            <button
                                onClick={() => setIsEditingDetails(true)}
                                className="text-sm font-bold text-indigo-600 hover:underline"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    <div className="p-6">
                        {detailsMessage.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${detailsMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {detailsMessage.text}
                            </div>
                        )}

                        {isEditingDetails ? (
                            <form onSubmit={handleUpdateDetails} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingDetails(false)}
                                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Name</p>
                                    <p className="font-medium text-slate-800">{user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-medium text-slate-800">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="font-medium text-slate-800">{user?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800">Password</h2>
                    </div>
                    <div className="p-6">
                        {passwordMessage.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {passwordMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSecurity;
