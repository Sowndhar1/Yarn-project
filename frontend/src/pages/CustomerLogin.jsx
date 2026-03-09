import { useState, useEffect, useCallback } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { checkIdentifierRequest } from "../lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;
const leadingSpecialRegex = /^[^a-zA-Z0-9]/;

const CustomerLogin = () => {
  const { user, loginWithOTP, completeOTPVerification, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [identifierStatus, setIdentifierStatus] = useState(null); // null, 'checking', 'exists', 'not_found'
  const [formError, setFormError] = useState("");
  const [step, setStep] = useState('credentials'); // 'credentials', 'otp'
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/my-account";
  const successMessage = location.state?.message;

  const validateIdentifier = (value) => {
    if (!value.trim()) return "Enter a valid email or mobile number.";
    const clean = value.trim();

    // Check if it's a phone number (just digits)
    if (/^\d+$/.test(clean)) {
      if (!phoneRegex.test(clean)) return "Enter a valid 10-digit mobile number.";
      return "";
    }

    // Otherwise check as email
    if (leadingSpecialRegex.test(clean)) {
      return "Email cannot start with a special character.";
    }
    if (!emailRegex.test(clean)) {
      return "Enter a valid email.";
    }
    return "";
  };

  // Debounced identifier check
  useEffect(() => {
    const checkUser = async () => {
      const validation = validateIdentifier(identifier);
      if (validation || !identifier.trim()) {
        setIdentifierStatus(null);
        return;
      }

      setIdentifierStatus('checking');
      try {
        const response = await checkIdentifierRequest(identifier);
        if (response.exists) {
          setIdentifierStatus('exists');
        } else {
          setIdentifierStatus('not_found');
        }
      } catch (err) {
        setIdentifierStatus(null);
      }
    };

    const timeoutId = setTimeout(checkUser, 600);
    return () => clearTimeout(timeoutId);
  }, [identifier]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateIdentifier(identifier);
    setIdentifierError(validation);
    if (validation) return;

    setFormError("");

    try {
      await loginWithOTP(identifier, password, 'customer');
      setStep('otp');
    } catch (err) {
      setFormError(err.message || "Invalid email/mobile or password.");
    }
  };

  const handleOTPSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      await completeOTPVerification(identifier, otp, false);
      // Success is handled by user redirect
    } catch (err) {
      setFormError(err.message || "Verification failed. Please check the code.");
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await loginWithOTP(identifier, password, 'customer');
      setFormError("");
      alert("Verification code resent to your email.");
    } catch (err) {
      setFormError("Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  if (user) {
    if (from === "/my-account") {
      return <Navigate to="/" state={{ welcomeMessage: `Welcome back, ${user.name.split(' ')[0]}!` }} replace />;
    }
    return <Navigate to={from} replace />;
  }

  const canSubmit = identifier.trim() && password.trim() && !identifierError && identifierStatus !== 'checking';

  return (
    <section className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Customer login</p>
      <h1 className="mt-2 font-display text-3xl text-indigoInk">Login to your account</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter your email or mobile number to access your orders.
      </p>

      {successMessage && (
        <p className="mt-6 rounded-2xl bg-mintGlow/30 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      )}

      {step === 'credentials' ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-semibold text-indigoInk">Email or Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setIdentifierError(validateIdentifier(event.target.value));
                }}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none transition-colors ${identifierStatus === 'exists' ? 'border-emerald-500 bg-emerald-50/30' :
                  identifierStatus === 'not_found' ? 'border-rose-500 bg-rose-50/30' :
                    'border-slate-200 focus:border-indigoInk'
                  }`}
                placeholder="Email or 10-digit mobile"
                required
              />
              {identifierStatus === 'checking' && (
                <div className="absolute right-4 top-[18px]">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              )}
              {identifierStatus === 'exists' && (
                <div className="absolute right-4 top-[18px] text-emerald-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>
            {identifierError && <p className="mt-2 text-sm text-rose-600">{identifierError}</p>}
            {!identifierError && identifierStatus === 'not_found' && (
              <p className="mt-2 text-sm text-rose-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                This number/email is not registered.
              </p>
            )}
            {!identifierError && identifierStatus === 'exists' && (
              <p className="mt-2 text-sm text-emerald-600 font-medium">Account verified! Proceed with password.</p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-indigoInk">Password</label>
              <button type="button" className="text-xs font-bold text-indigoInk hover:underline">Forgot Password?</button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
              placeholder="Enter password"
              required
            />
          </div>

          {(formError || error) && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigoInk/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit} className="mt-8 space-y-6">
          <div className="text-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <p className="text-sm font-medium text-indigoInk">
              A 6-digit verification code has been sent to your email.
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">Verification Code</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              className="mt-2 w-full text-center text-2xl tracking-[0.5em] font-black rounded-2xl border border-slate-200 px-4 py-4 focus:border-indigoInk focus:outline-none"
              placeholder="000000"
              required
            />
          </div>

          {(formError || error) && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 text-center">
              {formError || error}
            </p>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigoInk/90 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & Sign In"}
            </button>
            <div className="flex justify-between items-center px-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-xs font-bold text-slate-500 hover:text-indigoInk"
              >
                ← Back to Login
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || loading}
                className="text-xs font-bold text-indigoInk hover:underline disabled:opacity-50"
              >
                {isResending ? "Resending…" : "Resend Code"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-xs text-slate-500">
        Demo Account: <strong>sowndharsv2006@gmail.com / 912006_SV</strong>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Shivam Yarn?{" "}
        <button
          type="button"
          onClick={() => navigate("/customer/register")}
          className="font-semibold text-indigoInk underline-offset-4 hover:underline"
        >
          Create an account
        </button>
      </p>

      <div className="mt-4 text-center">
        <p className="text-sm text-slate-500">
          Are you a staff member?{' '}
          <a href="/login" className="text-indigoInk hover:underline">
            Login here
          </a>
        </p>
      </div>
    </section>
  );
};

export default CustomerLogin;
