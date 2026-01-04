import { useState, useEffect } from "react";
import { createPurchase, fetchProducts } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

const initialSupplier = {
  name: "",
  gstin: "",
  phone: "",
  address: "",
};

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(initialSupplier);
  const [items, setItems] = useState([
    {
      productId: "",
      quantity: "",
      ratePerKg: "",
      gstRate: 5,
      discount: 0,
    },
  ]);
  const [products, setProducts] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        setProducts(res.data || []);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    loadProducts();
  }, []);

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", quantity: "", ratePerKg: "", gstRate: 5, discount: 0 },
    ]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.ratePerKg) || 0;
        const discount = Number(item.discount) || 0;
        const gst = Number(item.gstRate) || 0;

        const subtotal = qty * rate;
        const discountAmount = subtotal * (discount / 100);
        const taxableAmount = subtotal - discountAmount;
        const gstAmount = taxableAmount * (gst / 100);
        const totalAmount = taxableAmount + gstAmount;

        acc.subtotal += subtotal;
        acc.discount += discountAmount;
        acc.gst += gstAmount;
        acc.total += totalAmount;
        return acc;
      },
      { subtotal: 0, discount: 0, gst: 0, total: 0 }
    );
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const payload = {
        supplierName: supplier.name,
        supplierGstin: supplier.gstin,
        supplierPhone: supplier.phone,
        supplierAddress: supplier.address,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          ratePerKg: Number(item.ratePerKg),
          discount: Number(item.discount),
          gstRate: Number(item.gstRate),
        })),
        paymentStatus,
        paymentMethod,
        notes,
      };

      await createPurchase(payload, token);

      setNotification({ type: "success", message: "Purchase record finalized successfully" });
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 hover:text-indigo-600 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Procurement Terminal</h1>
            <p className="text-sm font-bold text-slate-500">Inbound material logistics entry</p>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`rounded-3xl px-8 py-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${notification.type === "success" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
          <span className="text-sm font-black uppercase tracking-wider">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Supplier Section */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-8 text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">01</span>
              Supplier Identity
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Corporate Entity Name</label>
                <input
                  type="text"
                  value={supplier.name}
                  onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                  required
                  placeholder="e.g. Reliance Spinners Ltd."
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">GST Identification (GSTIN)</label>
                <input
                  type="text"
                  value={supplier.gstin}
                  onChange={(e) => setSupplier({ ...supplier, gstin: e.target.value })}
                  placeholder="27AAAAA0000A1Z5"
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Logistics Contact</label>
                <input
                  type="tel"
                  value={supplier.phone}
                  onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Warehouse/HQ</label>
                <input
                  type="text"
                  value={supplier.address}
                  onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
                  placeholder="Industrial Estate, Unit 4B..."
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">02</span>
                Inventory Payload
              </h2>
              <button
                type="button"
                onClick={addItemRow}
                className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600 active:scale-95"
              >
                + Add Line Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="pb-2 pl-4">Material Component</th>
                    <th className="pb-2">Mass (kg)</th>
                    <th className="pb-2">Base Rate</th>
                    <th className="pb-2">GST %</th>
                    <th className="pb-2 text-right pr-4">Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-transparent">
                  {items.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="rounded-l-2xl bg-slate-50 py-4 pl-4">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, "productId", e.target.value)}
                          required
                          className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                        >
                          <option value="">Select SKU</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="bg-slate-50 py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          placeholder="0.00"
                          className="w-20 bg-transparent text-sm font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="bg-slate-50 py-4">
                        <input
                          type="number"
                          value={item.ratePerKg}
                          onChange={(e) => updateItem(index, "ratePerKg", e.target.value)}
                          placeholder="0.00"
                          className="w-20 bg-transparent text-sm font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="bg-slate-50 py-4">
                        <input
                          type="number"
                          value={item.gstRate}
                          onChange={(e) => updateItem(index, "gstRate", e.target.value)}
                          className="w-12 bg-transparent text-sm font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="rounded-r-2xl bg-slate-50 py-4 pr-4 text-right">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItemRow(index)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Summary Section */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-8 text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">03</span>
              Financial Core
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Gross Load</span>
                <span className="text-slate-900">₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Total Levies (GST)</span>
                <span className="text-slate-900">₹{totals.gst.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-100 my-4"></div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Settlement</span>
                <span className="text-3xl font-black text-indigo-600">₹{totals.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Protocol</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="paid">Finalized (Paid)</option>
                  <option value="pending">Deferred (Pending)</option>
                  <option value="partial">Strategic (Partial)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transfer Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="bank_transfer">Digital Wire</option>
                  <option value="cash">Fiat (Cash)</option>
                  <option value="cheque">Physical Voucher</option>
                  <option value="upi">Instant UPI</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Audit Memo</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Operational Context..."
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-10 w-full rounded-3xl bg-indigo-600 py-6 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:bg-slate-900 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Processing Transaction..." : "Authorize Procurement"}
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🛡️</div>
              <div>
                <p className="text-sm font-black">Audit Protection</p>
                <p className="text-[10px] font-bold text-slate-400">All procurement entries are double-encrypted and logged to the central ledger for compliance.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseEntry;
