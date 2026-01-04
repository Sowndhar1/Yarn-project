import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getStockState = (stockKg) => {
  if (stockKg >= 800) return { label: "High Capacity", color: "bg-emerald-50 text-emerald-600 border-emerald-100" };
  if (stockKg >= 400) return { label: "Operating Stock", color: "bg-amber-50 text-amber-600 border-amber-100" };
  if (stockKg > 0) return { label: "Low Reserve", color: "bg-rose-50 text-rose-600 border-rose-100" };
  return { label: "Out of Stock", color: "bg-slate-50 text-slate-400 border-slate-100" };
};

const ProductCard = ({ product }) => {
  const stockState = getStockState(product.stockKg);
  const { addToCart, getItemQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAdded, setShowAdded] = useState(false);

  const productId = product.id || product._id;
  const inCart = getItemQuantity(productId) > 0;
  const isFav = isFavorite(productId);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (!user) {
      navigate('/customer/login', {
        state: {
          from: '/storefront',
          message: 'Welcome to Shivam Yarn Agencies. Please login or create an account to start shopping.'
        }
      });
      return;
    }

    addToCart(product, 1);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${productId}`)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-indigoInk/5 cursor-pointer">
      {/* Visual Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Stock & Verified Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${stockState.color}`}>
            {stockState.label}
          </span>
          {product.updatedAt && (new Date() - new Date(product.updatedAt)) < 24 * 60 * 60 * 1000 && (
            <span className="rounded-full bg-emerald-500/90 text-white border border-emerald-400/50 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-sm animate-pulse">
              ✓ Verified Edit
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110"
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'fill-none text-slate-400'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-8 pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-indigoInk tracking-tighter">{product.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {product.brand} • {product.count} • {product.color}
            </p>
          </div>
          <p className="text-lg font-semibold text-indigoInk">₹{product.pricePerKg}/kg</p>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500 font-medium">
          {product.description}
        </p>

        {/* Technical Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Material Grade</p>
            <p className="text-xs font-semibold text-slate-600">{product.material}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Availability</p>
            <p className="text-xs font-semibold text-slate-600">{product.stockKg} KG</p>
          </div>
        </div>

        {/* Lead Time & Add to Cart */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">{product.leadTimeDays}D Lead</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockKg === 0}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${inCart
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : !user
                ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-indigoInk hover:text-white shadow-md'
                : 'bg-yarnSun text-indigoInk hover:bg-indigoInk hover:text-yarnSun shadow-lg hover:shadow-yarnSun/20 hover:-translate-y-0.5 active:translate-y-0'
              } disabled:cursor-not-allowed`}
          >
            {showAdded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : inCart ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                In Cart
              </>
            ) : !user ? (
              <>
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Login to Buy
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          {(user?.role === 'admin' || user?.role === 'inventory_staff') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/inventory/products/edit/${productId}`);
              }}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigoInk hover:text-white transition-all shadow-sm border border-slate-100"
              title="Edit Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
