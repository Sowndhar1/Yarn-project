import { useEffect, useState } from "react";

const initialFormState = {
  productId: "",
  quantityKg: "",
  buyerName: "",
  buyerContact: "",
  buyerEmail: "",
  deliveryPreference: "standard",
  notes: "",
};

const OrderModal = ({ product, onClose, onSubmit, submitting, error }) => {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (product) {
      setForm((prev) => ({
        ...initialFormState,
        productId: product.id,
        quantityKg: prev.quantityKg,
      }));
    } else {
      setForm(initialFormState);
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      productId: product.id,
      quantityKg: form.quantityKg,
      buyer: {
        name: form.buyerName,
        contact: form.buyerContact,
        email: form.buyerEmail,
      },
      deliveryPreference: form.deliveryPreference,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              Instant booking
            </p>
            <h3 className="font-display text-2xl text-indigoInk">
              {product.name}
            </h3>
            <p className="text-sm text-slate-500">
              {product.brand} · {product.count} · {product.color}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs uppercase tracking-wide text-slate-500 hover:border-slate-400"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Quantity (kg)
              <input
                type="number"
                name="quantityKg"
                min={1}
                value={form.quantityKg}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Delivery preference
              <select
                name="deliveryPreference"
                value={form.deliveryPreference}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value="standard">Standard (3-4 days)</option>
                <option value="priority">Priority (48 hrs)</option>
                <option value="pickup">Mill pickup</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Buyer name
              <input
                name="buyerName"
                value={form.buyerName}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Contact number
              <input
                name="buyerContact"
                value={form.buyerContact}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-slate-600">
            Email (optional)
            <input
              type="email"
              name="buyerEmail"
              value={form.buyerEmail}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>

          <label className="text-sm font-medium text-slate-600">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Mention special twist, cone weight, billing or dispatch instructions"
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-2xl bg-indigoInk px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-yarnSun hover:text-indigoInk disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
