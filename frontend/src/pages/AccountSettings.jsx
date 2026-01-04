import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const AccountSettings = () => {
  const { user, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await changePassword(currentPassword, newPassword);
      setStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Profile</p>
        <h1 className="mt-2 font-display text-3xl text-indigoInk">Account settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Update your password and sign out of the Shivam Yarn console.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Name</p>
            <p className="mt-2 text-lg font-semibold text-indigoInk">{user.name}</p>
            <p className="text-sm text-slate-500">Role: {user.role}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
            <p className="mt-2 text-lg font-semibold text-indigoInk">{user.email}</p>
            <p className="text-sm text-slate-500">Username: {user.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        >
          Sign out
        </button>
      </header>

      <section className="rounded-[32px] bg-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Security</p>
        <h2 className="mt-2 text-2xl font-semibold text-indigoInk">Change password</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-indigoInk">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-indigoInk">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigoInk focus:outline-none"
            />
          </div>
          {status.message && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                status.type === "success"
                  ? "bg-mintGlow/20 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {status.message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigoInk/90 disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </section>
  );
};

export default AccountSettings;
