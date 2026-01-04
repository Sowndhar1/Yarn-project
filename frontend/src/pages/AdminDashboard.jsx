import { useEffect, useMemo, useState } from "react";
import { fetchOrders, updateOrderStatus } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "in-production",
  "ready-for-dispatch",
  "shipped",
  "delivered",
  "cancelled",
];

const statusColors = {
  pending: "bg-slate-200 text-slate-700",
  confirmed: "bg-mintGlow text-indigoInk",
  "in-production": "bg-blue-100 text-blue-800",
  "ready-for-dispatch": "bg-amber-100 text-amber-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();

  const loadOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchOrders(token);
      setOrders(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;
      const needle = searchTerm.trim().toLowerCase();
      const matchesSearch = needle
        ? `${order.buyer.name} ${order.productSnapshot?.name} ${order.id}`
            .toLowerCase()
            .includes(needle)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const metrics = useMemo(() => {
    if (!orders.length) {
      return { total: 0, pending: 0, shipped: 0, value: 0 };
    }
    return orders.reduce(
      (acc, order) => {
        acc.total += 1;
        if (order.status === "pending") acc.pending += 1;
        if (order.status === "shipped" || order.status === "delivered")
          acc.shipped += 1;
        acc.value +=
          order.quantityKg * (order.productSnapshot?.pricePerKg || 0);
        return acc;
      },
      { total: 0, pending: 0, shipped: 0, value: 0 }
    );
  }, [orders]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleStatusChange = async (orderId, status) => {
    setStatusUpdating(orderId);
    if (!token) return;
    try {
      await updateOrderStatus(orderId, status, token);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[40px] border border-indigoInk/10 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Mill console
            </p>
            <h1 className="font-display text-3xl text-indigoInk">
              Online order sync
            </h1>
            <p className="text-sm text-slate-500">
              Prioritize dispatches, update production stages, and keep ecommerce
              customers informed in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              className="rounded-2xl border border-indigoInk px-6 py-3 text-sm font-semibold uppercase tracking-wide text-indigoInk hover:bg-indigoInk hover:text-white"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchTerm("");
              }}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-400"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Total orders
          </p>
          <p className="mt-2 text-3xl font-semibold text-indigoInk">
            {metrics.total}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Pending
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-500">
            {metrics.pending}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Shipped / Delivered
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {metrics.shipped}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Value (₹)
          </p>
          <p className="mt-2 text-3xl font-semibold text-indigoInk">
            {metrics.value.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white bg-white/60 p-6 shadow">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Search orders
            </label>
            <input
              type="search"
              placeholder="Buyer, product or order ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigoInk focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Status filter
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigoInk focus:outline-none"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-center text-slate-500">
          Syncing latest ecommerce orders…
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-3xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Buyer</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-slate-100">
                <td className="px-6 py-5 align-top text-sm text-slate-600">
                  <p className="font-semibold text-indigoInk">
                    #{order.id.slice(0, 6).toUpperCase()}
                  </p>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </td>
                <td className="px-6 py-5 align-top text-sm text-slate-600">
                  <p className="font-medium text-indigoInk">
                    {order.productSnapshot?.name}
                  </p>
                  <p className="text-xs">
                    {order.productSnapshot?.brand} ·{" "}
                    {order.productSnapshot?.count} ·{" "}
                    {order.productSnapshot?.color}
                  </p>
                </td>
                <td className="px-6 py-5 align-top text-sm text-slate-600">
                  <p className="font-medium">{order.buyer.name}</p>
                  <p className="text-xs">{order.buyer.contact}</p>
                  {order.buyer.email && (
                    <p className="text-xs text-slate-500">
                      {order.buyer.email}
                    </p>
                  )}
                </td>
                <td className="px-6 py-5 align-top text-sm text-slate-600">
                  <p className="font-medium">
                    {order.quantityKg} kg · ₹
                    {order.productSnapshot?.pricePerKg}/kg
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.deliveryPreference}
                  </p>
                </td>
                <td className="px-6 py-5 align-top">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusColors[order.status] || "bg-slate-200"
                    }`}
                  >
                    {order.status.replace("-", " ")}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <select
                    disabled={statusUpdating === order.id}
                    value={order.status}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    onChange={(event) =>
                      handleStatusChange(order.id, event.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredOrders.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No orders match the filters right now. Clear the search above or
            refresh the feed.
          </p>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
