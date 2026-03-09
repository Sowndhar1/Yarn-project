import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const nameRegex = /^[A-Za-z ]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const leadingSpecialRegex = /^[^a-zA-Z0-9]/;
const phoneRegex = /^[6-9]\d{9}$/;

const CustomerRegister = () => {
  const { user, registerWithOTP, completeOTPVerification } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form', 'otp'
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const validateField = (field, value, nextForm = form) => {
    if (!value.trim()) {
      return "This field is required.";
    }
    switch (field) {
      case "name":
        if (!nameRegex.test(value.trim())) {
          return "Name should contain only letters.";
        }
        return "";
      case "email": {
        if (leadingSpecialRegex.test(value.trim())) {
          return "Email cannot start with a special character.";
        }
        if (!emailRegex.test(value.trim())) {
          return "Enter a valid email.";
        }
        return "";
      }
      case "phone":
        if (!phoneRegex.test(value.trim())) {
          return "Phone number must be 10 digits and start with 6, 7, 8, or 9.";
        }
        return "";
      case "password":
        if (value.trim().length < 6) {
          return "Password must be at least 6 characters.";
        }
        return "";
      case "confirmPassword":
        if (value.trim() !== nextForm.password.trim()) {
          return "Passwords do not match.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, { ...form, [name]: value }) }));
  };

  const canSubmit =
    Object.values(form).every((value) => value.trim()) &&
    Object.values(errors).every((error) => !error);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = Object.entries(form).reduce((acc, [key, value]) => {
      const validation = validateField(key, value);
      if (validation) acc[key] = validation;
      return acc;
    }, {});

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await registerWithOTP({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      });
      setStep('otp');
    } catch (err) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await completeOTPVerification(form.email.trim(), otp, true);
      setForm(initialForm);
      navigate("/my-account", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Verification failed. Please check the code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await registerWithOTP({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      });
      setSubmitError("");
      alert("Verification code resent to your email.");
    } catch (err) {
      setSubmitError("Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  if (user) {
    return <Navigate to="/my-account" replace />;
  }

  return (
    <section className="mx-auto max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Create account</p>
      <h1 className="mt-2 font-display text-3xl text-indigoInk">Customer registration</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter your details to shop faster, save orders, and get dispatch alerts.
      </p>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-semibold text-indigoInk">Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
              placeholder="Enter your name"
              required
            />
            {errors.name && <p className="mt-2 text-sm text-rose-600">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">Phone number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
              placeholder="10-digit mobile number"
              required
            />
            {errors.phone && <p className="mt-2 text-sm text-rose-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
              placeholder="Minimum 6 characters"
              required
            />
            {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
              placeholder="Re-enter password"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-rose-600">{errors.confirmPassword}</p>
            )}
          </div>

          {submitError && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigoInk/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit} className="mt-8 space-y-6">
          <div className="text-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <p className="text-sm font-medium text-indigoInk">
              A 6-digit verification code has been sent to <strong>{form.email}</strong> to verify your account.
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

          {submitError && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 text-center">{submitError}</p>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={otp.length !== 6 || submitting}
              className="w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigoInk/90 disabled:opacity-50"
            >
              {submitting ? "Verifying…" : "Verify & Create Account"}
            </button>
            <div className="flex justify-between items-center px-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-bold text-slate-500 hover:text-indigoInk"
              >
                ← Edit Details
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || submitting}
                className="text-xs font-bold text-indigoInk hover:underline disabled:opacity-50"
              >
                {isResending ? "Resending…" : "Resend Code"}
              </button>
            </div>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/customer/login")}
          className="font-semibold text-indigoInk underline-offset-4 hover:underline"
        >
          Login here
        </button>
      </p>
    </section>
  );
};

export default CustomerRegister;
