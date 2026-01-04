import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const leadingSpecialRegex = /^[^a-zA-Z0-9]/;

const CustomerLogin = () => {
  const { user, login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/my-account";
  const successMessage = location.state?.message;

  const validateEmail = (value) => {
    if (!value.trim()) return "Enter a valid email.";
    if (leadingSpecialRegex.test(value.trim())) {
      return "Email cannot start with a special character.";
    }
    if (!emailRegex.test(value.trim())) {
      return "Enter a valid email.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateEmail(email);
    setEmailError(validation);
    if (validation) return;

    setFormError("");

    try {
      await login(email, password, 'customer');
      // Navigation will be handled by AuthContext
    } catch (err) {
      setFormError(err.message || "Invalid email or password.");
    }
  };

  if (user) {
    if (from === "/my-account") {
      return <Navigate to="/" state={{ welcomeMessage: `Welcome back, ${user.name.split(' ')[0]}!` }} replace />;
    }
    return <Navigate to={from} replace />;
  }

  const canSubmit = email.trim() && password.trim() && !emailError;

  return (
    <section className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Customer login</p>
      <h1 className="mt-2 font-display text-3xl text-indigoInk">Login to your account</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter your email and password to access your orders.
      </p>

      {successMessage && (
        <p className="mt-6 rounded-2xl bg-mintGlow/30 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-semibold text-indigoInk">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(validateEmail(event.target.value));
            }}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
            placeholder="you@example.com"
            required
          />
          {emailError && <p className="mt-2 text-sm text-rose-600">{emailError}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-indigoInk">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
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

      <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-xs text-slate-500">
        Sample Customer Account: <strong>johndoe / customer123</strong>
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
