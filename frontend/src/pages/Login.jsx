import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { user, login, error, setError, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  if (user) {
    // Redirect based on user role
    const getRedirectPath = (role) => {
      switch (role) {
        case 'admin':
          return '/admin';
        case 'sales_staff':
          return '/sales';
        case 'inventory_staff':
          return '/inventory';
        case 'customer':
          return '/my-account';
        default:
          return '/';
      }
    };
    return <Navigate to={getRedirectPath(user.role)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setError("");

    try {
      await login(identifier, password, 'staff');
      // Navigation will be handled by AuthContext
    } catch (err) {
      setFormError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
        Secure login
      </p>
      <h1 className="mt-2 font-display text-3xl text-indigoInk">
        Shivam Yarn Console
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Use your admin or staff credentials to enter the control room.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-semibold text-indigoInk">
            Username or email
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
            placeholder="shivamyarn or admin@yarnbusiness.com"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-indigoInk">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        {(formError || error) && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {formError || error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigoInk/90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-xs text-slate-500">
        <p className="mb-2 font-semibold">Sample Staff Accounts:</p>
        <p>Admin → <strong>admin / admin123</strong></p>
        <p>Sales Staff → <strong>sales1 / sales123</strong></p>
        <p>Inventory Staff → <strong>inventory1 / inventory123</strong></p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-slate-500">
          Are you a customer?{' '}
          <a href="/customer/login" className="text-indigoInk hover:underline">
            Login here
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;
