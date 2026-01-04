import { useState, useEffect } from "react";
import { createSale, fetchProducts } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { generateInvoicePDF } from "../lib/InvoiceGenerator.js";

const emptyCustomer = {
  name: "",
  gstin: "",
  phone: "",
  address: "",
};

const SalesEntry = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(emptyCustomer);
  const [items, setItems] = useState([
    { productId: "", quantity: "", ratePerKg: "", gstRate: 5, discount: 0 },
  ]);
  const [products, setProducts] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSalePayload, setLastSalePayload] = useState(null); // For manual invoice generation
  const { token } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        setProducts(res.data || []);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    loadProducts();
  }, []);

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
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
        const discountPct = Number(item.discount) || 0;
        const gstPct = Number(item.gstRate) || 0;

        const rawAmount = qty * rate;
        const discount = rawAmount * (discountPct / 100);
        const taxable = rawAmount - discount;
        const gst = taxable * (gstPct / 100);
        const total = taxable + gst;

        acc.subtotal += rawAmount;
        acc.discount += discount;
        acc.gst += gst;
        acc.total += total;
        return acc;
      },
      { subtotal: 0, discount: 0, gst: 0, total: 0 }
    );
  };

  const totals = calculateTotals();

  const handleDownloadInvoice = () => {
    if (!lastSalePayload) return;
    generateInvoicePDF(lastSalePayload);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const payload = {
        customerName: customer.name,
        customerGstin: customer.gstin,
        customerPhone: customer.phone,
        customerAddress: customer.address,
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

      const response = await createSale(payload, token);

      // Prepare data for manual invoice generation
      const invoiceData = {
        ...payload,
        items: items.map(item => {
          const product = products.find(p => p._id === item.productId);
          return { ...item, productName: product ? product.name : 'Unknown Product' };
        }),
        totals,
        date: new Date(),
        invoiceId: response.data?.invoiceNumber
      };

      setLastSalePayload(invoiceData);
      setNotification({ type: "success", message: "Sale recorded successfully!" });

      // Do NOT auto-download. User must click button.
      // setTimeout(() => navigate('/sales/dashboard'), 3000); 
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (notification?.type === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7] p-4">
        <div className="bg-white rounded-[2.5rem] p-12 text-center max-w-lg w-full shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-emerald-200 shadow-xl">
            ✓
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Sale Completed!</h2>
            <p className="text-slate-500 font-bold">The transaction has been recorded in the ledger.</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={handleDownloadInvoice}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Invoice PDF
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition-all"
            >
              New Sale
            </button>

            <Link to="/sales/dashboard" className="block text-slate-400 font-bold text-sm hover:text-slate-600">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sales/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 hover:text-indigo-600 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Sales Terminal</h1>
            <p className="text-sm font-bold text-slate-500">Offline Counter Sale Entry</p>
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
          {/* Customer Section */}
          <div className="rounded-[2.5rem] bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-8 text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">01</span>
              Customer Details
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name / Shop Name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  required
                  placeholder="e.g. Walk-in Customer"
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={customer.gstin}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                  placeholder="Consumer / Unregistered"
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder=""
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Address / City</label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Tirupur"
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
                Items
              </h2>
              <button
                type="button"
                onClick={addItemRow}
                className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600 active:scale-95"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="pb-2 pl-4">Product</th>
                    <th className="pb-2">Qty (kg)</th>
                    <th className="pb-2">Rate/kg</th>
                    <th className="pb-2">GST %</th>
                    <th className="pb-2 text-right pr-4">Action</th>
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
                          <option value="">Select Product...</option>
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
                          placeholder="0"
                          className="w-20 bg-transparent text-sm font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="bg-slate-50 py-4">
                        <input
                          type="number"
                          value={item.ratePerKg}
                          onChange={(e) => updateItem(index, "ratePerKg", e.target.value)}
                          placeholder="0"
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
              Payment
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-900">₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Tax (GST)</span>
                <span className="text-slate-900">₹{totals.gst.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-100 my-4"></div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</span>
                <span className="text-3xl font-black text-indigo-600">₹{totals.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="cash">Hard Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="credit">Store Credit</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-2xl bg-emerald-50 px-6 py-4 text-sm font-black text-emerald-700 outline-none ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="paid">✅ PAID</option>
                  <option value="pending">⏳ PENDING</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional remarks..."
                  className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-10 w-full rounded-3xl bg-slate-900 py-6 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-indigo-600 hover:scale-105 active:scale-95 disabled:opacity-50 flex flex-col items-center"
            >
              {submitting ? (
                "Processing..."
              ) : (
                <>
                  <span>Complete Sale</span>
                  <span className="text-[9px] opacity-70 mt-1 font-bold normal-case">Generate Invoice</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-3xl bg-blue-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-sm font-black">Report Generation</p>
                <p className="text-[10px] font-bold text-blue-100">Sale will be recorded in the Offline Sales Ledger. Invoice can be downloaded manually.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SalesEntry;
