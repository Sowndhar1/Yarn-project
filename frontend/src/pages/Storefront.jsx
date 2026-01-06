import { useEffect, useMemo, useState, useCallback } from "react";
import heroRightBg from "../hero-right-branded.jpg";
import heroSecondaryBg from "../hero-secondary-branded.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import OrderModal from "../components/OrderModal.jsx";
import ProductRangeDetails from "../components/ProductRangeDetails.jsx";
import { createOrder, fetchProducts } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const heroHighlights = [
  { label: "Dispatch", value: "Fast turnarounds" },
  { label: "Counts ready", value: "Wide range" },
  { label: "Support", value: "On-call team" },
];

const trustBadges = ["Trusted garment units", "ISO aligned", "Mill-direct", "Since 2009"];

const quickStats = [
  { label: "Orders fulfilled this week", value: "38" },
  { label: "Available counts today", value: "24" },
  { label: "Average response time", value: "2 hrs" },
];

const reasons = [
  {
    title: "Simple ordering",
    copy: "Pick your count, add the kilos, and we confirm with a single call or WhatsApp.",
  },
  {
    title: "Reliable stock",
    copy: "We publish what is physically in the warehouse so you don’t chase ghosts.",
  },
  {
    title: "Clear communication",
    copy: "One coordinator tracks packing, billing, and truck updates for you.",
  },
];

const featuredCounts = [
  { label: "Filament Range", detail: "30D to 1500D Available" },
  { label: "Lycra & Core", detail: "High Bulk & Lurex" },
  { label: "Polyester", detail: "100% & Recycled" },
  { label: "Fancy Yarn", detail: "Cotton & Specialties" },
];

const testimonials = [
  {
    quote: "We now plan yarn for the week in 15 minutes flat. Dispatch photos land before the truck.",
    name: "A. Mohan",
    role: "Plant Head, Kayal Knitwear",
  },
  {
    quote: "Pricing is transparent and they never hide shortages. Even urgents get honest ETAs.",
    name: "Divya Krish",
    role: "Co-founder, Loom & Co",
  },
];

// Simplified Terminology for Local Audience
const Storefront = () => {
  // ... keep existing state ...
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [welcomeToast, setWelcomeToast] = useState("");
  const [showRangeModal, setShowRangeModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.welcomeMessage) {
      setWelcomeToast(location.state.welcomeMessage);
      const timer = setTimeout(() => setWelcomeToast(""), 4000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  }, []);

  // Use a ref for the interval to reset it on manual click
  const [timerId, setTimerId] = useState(null);

  const startTimer = useCallback(() => {
    if (timerId) clearInterval(timerId);
    const id = setInterval(nextSlide, 8000); // 8s for better readability
    setTimerId(id);
  }, [nextSlide, timerId]);

  useEffect(() => {
    const id = setInterval(nextSlide, 8000);
    setTimerId(id);
    return () => clearInterval(id);
  }, [nextSlide]);

  const handleManualNav = (index) => {
    setCurrentSlide(index);
    startTimer(); // Reset auto-play timer
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchProducts();
        setProducts(result.data || []);
      } catch (err) {
        setError(err.message || "Unable to load catalog");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      "Filament Yarn",
      "High Bulk Yarn",
      "Lycra & Core Lycra Yarn",
      "Lurex Yarn",
      "Polyester Yarn",
      "Cotton & Fancy Yarn",
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = `${product.name} ${product.brand} ${product.color}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, activeCategory]);

  const handleCreateOrder = async (payload) => {
    setSubmitting(true);
    setOrderError("");
    try {
      const token = localStorage.getItem("yarn-auth-token");
      await createOrder(payload, token);
      setSelectedProduct(null);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderIntent = (product) => {
    if (!user) {
      navigate("/customer/login", {
        state: {
          from: "/",
          intent: "order",
          productId: product.id,
          message: "Please sign in to order."
        }
      });
      return;
    }
    setSelectedProduct(product);
  };

  return (
    <>
      <div className="flex flex-col gap-24 pb-32 overflow-x-hidden container-elite animate-reveal relative">
        {/* Welcome Toast */}
        {welcomeToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-indigoInk text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
              <div className="bg-green-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="font-bold text-sm">{welcomeToast}</p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Slidable Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[40px] bg-white text-indigoInk border border-slate-200 shadow-sm mt-4 lg:mt-8 min-h-[auto] lg:min-h-[700px]">
          <div
            className="flex transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 1: Primary Brand & Search */}
            <div className="w-full shrink-0 relative flex flex-col lg:block">
              <div className="absolute inset-0 bg-slate-50 opacity-20" />
              <div className="relative grid gap-8 lg:gap-16 px-6 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:px-20 lg:py-32 h-full items-center">
                <div className="space-y-6 lg:space-y-10 order-2 lg:order-1">
                  <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 lg:px-4 lg:py-2 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigoInk" />
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">
                      Premium Yarn Supply • Tirupur
                    </p>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-semibold leading-[1.05] md:text-8xl text-indigoInk tracking-tighter">
                    Best Quality <br />
                    <span className="text-slate-400">Yarn Supply.</span>
                  </h1>

                  <p className="max-w-2xl text-base lg:text-xl font-medium leading-relaxed text-slate-500">
                    Top Supplier of High Bulk, Lycra, Core Lycra, and Recycled Polyester Yarns. Best stocks for Tirupur manufacturers.
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-4 lg:pt-6">
                    <div className="relative flex-1 group max-w-lg">
                      <input
                        type="search"
                        placeholder="Search for yarn count..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 lg:px-8 lg:py-5 text-indigoInk shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all focus:border-indigoInk/40 focus:ring-4 focus:ring-indigoInk/5 outline-none placeholder:text-slate-300 font-medium"
                      />
                      <svg className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigoInk transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="block lg:h-full order-1 lg:order-2 h-64 lg:min-h-0">
                  <div
                    className="relative rounded-[2rem] lg:rounded-[2.5rem] bg-indigoInk overflow-hidden p-6 lg:p-10 space-y-10 shadow-2xl h-full flex flex-col justify-between"
                    style={{ backgroundImage: `url(${heroRightBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <div className="absolute inset-0 bg-indigoInk/80 backdrop-blur-[2px] z-0" />
                    <div className="relative z-10 space-y-4 lg:space-y-10 h-full flex flex-col justify-between">
                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-yarnSun/60">Top Grade</p>

                      {/* Mobile: Show minimal content, Desktop: Show full details */}
                      <div className="hidden lg:grid gap-8">
                        {[
                          { title: "Direct from Mill", desc: "No extra charges.", icon: <ShieldIcon /> },
                          { title: "Quality Checked", desc: "Tested for strength.", icon: <BoxIcon /> },
                          { title: "Fast Delivery", desc: "We deliver on time.", icon: <HomeIcon /> }
                        ].map((item) => (
                          <div key={item.title} className="flex gap-5 group">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/40 group-hover:bg-yarnSun group-hover:text-indigoInk transition-all duration-500">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                              <p className="text-[11px] text-white/30 leading-relaxed mt-1">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center px-1 lg:px-2">
                        {heroHighlights.map((h) => (
                          <div key={h.label} className="text-center">
                            <p className="text-lg lg:text-xl font-semibold text-white">{h.value.split(' ')[0]}</p>
                            <p className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">{h.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2: Secondary Brand Image */}
            <div className="w-full shrink-0 relative bg-indigoInk overflow-hidden min-h-[500px] lg:min-h-auto">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-110 animate-slow-zoom"
                style={{ backgroundImage: `url(${heroSecondaryBg})` }}
              />
              <div className="absolute inset-0 bg-indigoInk/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigoInk/60 via-indigoInk/20 to-transparent" />

              <div className="relative z-10 px-8 py-16 lg:px-20 lg:py-32 h-full flex flex-col justify-center">
                <div className="max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-md px-4 py-2 w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-yarnSun animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-yarnSun drop-shadow-sm">
                      Global Supply.
                    </p>
                  </div>

                  <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-xl">
                    Market <br />
                    <span className="text-yarnSun uppercase">Leaders.</span>
                  </h2>

                  <p className="text-lg md:text-xl text-slate-100 font-medium max-w-xl leading-relaxed drop-shadow-md">
                    Direct mill connection and real-time stock updates. Get the best yarn at the best price.
                  </p>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-4 bg-white text-indigoInk rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yarnSun transition-all shadow-xl hover:scale-105 active:scale-95"
                    >
                      View Stock
                    </button>
                    <div className="hidden sm:flex items-center gap-4 px-6 border border-white/20 rounded-xl backdrop-blur-md bg-white/5 text-white">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border border-indigoInk bg-slate-400 shadow-sm" />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Verified Only</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 left-2 lg:left-6 z-20 flex items-center">
            <button
              onClick={() => handleManualNav(currentSlide === 0 ? 1 : 0)}
              className="group flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-full border border-white/20 bg-black/10 backdrop-blur-xl text-white transition-all hover:bg-white hover:text-indigoInk hover:scale-110 active:scale-90 shadow-2xl"
              aria-label="Previous Slide"
            >
              <svg className="h-5 w-5 lg:h-6 lg:w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute inset-y-0 right-2 lg:right-6 z-20 flex items-center">
            <button
              onClick={() => handleManualNav(currentSlide === 0 ? 1 : 0)}
              className="group flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-full border border-white/20 bg-black/10 backdrop-blur-xl text-white transition-all hover:bg-white hover:text-indigoInk hover:scale-110 active:scale-90 shadow-2xl"
              aria-label="Next Slide"
            >
              <svg className="h-5 w-5 lg:h-6 lg:w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Enhanced Pagination */}
          <div className="absolute bottom-24 lg:bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-5 bg-black/40 backdrop-blur-2xl px-6 py-3 lg:px-8 lg:py-4 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {[0, 1].map((idx) => (
              <button
                key={idx}
                onClick={() => handleManualNav(idx)}
                className={`group relative flex items-center justify-center transition-all duration-500 ${currentSlide === idx ? "w-10 lg:w-16" : "w-3 lg:w-4"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div className={`h-1.5 lg:h-2 rounded-full transition-all duration-500 ${currentSlide === idx
                  ? "w-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  : "w-2 bg-white/30 group-hover:bg-white/60"
                  }`} />
              </button>
            ))}
          </div>

          {/* Static Bottom Label Bar */}
          <div className="absolute bottom-0 left-0 right-0 hidden lg:flex flex-wrap items-center gap-12 border-t border-slate-100 bg-white px-12 py-8 lg:px-20 z-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Partners</span>
            {trustBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <span className="h-1 w-1 rounded-full bg-slate-200" />
                {badge}
              </div>
            ))}
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog" className="space-y-12 transition-all">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Our Products</p>
              <h2 className="text-4xl font-semibold text-indigoInk tracking-tighter">In Stock.</h2>
            </div>
            <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-100 rounded-xl shadow-sm overflow-x-auto">
              {categories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveCategory(filter)}
                  className={`rounded-lg px-4 lg:px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === filter
                    ? "bg-indigoInk text-white shadow-lg shadow-indigoInk/20"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="h-1 w-64 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigoInk animate-[shimmer_2s_infinite] w-1/3" />
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Loading Products...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onOrder={handleOrderIntent}
                  onLogin={() =>
                    navigate("/customer/login", {
                      state: { from: "/", intent: "order", productId: product.id },
                    })
                  }
                  isLoggedIn={Boolean(user)}
                />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-[2rem] bg-slate-50 border border-slate-100 py-32 text-center mt-12">
              <h3 className="text-xl font-bold text-indigoInk mb-2 text-slate-400">No products found</h3>
              <p className="text-slate-300 text-sm font-medium">Please try a different search or category.</p>
            </div>
          )}
        </section>

        {/* Corporate Value Section - Responsive Update */}
        <section className="grid gap-6 lg:gap-12 grid-cols-1 lg:grid-cols-2 mt-12">
          {/* Direct from Factory Card */}
          <div className="rounded-[40px] bg-indigoInk p-8 lg:p-16 text-white shadow-sm space-y-8 lg:space-y-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yarnSun/60">How We Work</p>
              <h3 className="text-3xl lg:text-4xl font-semibold text-white tracking-tighter">Direct from Factory</h3>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {reasons.map((item) => (
                <div key={item.title} className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-yarnSun">{item.title}</p>
                  <p className="text-sm font-medium leading-relaxed text-white/30">{item.copy}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 border-t border-white/5 pt-8 lg:pt-12">
              {quickStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl lg:text-4xl font-semibold text-white tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Card - White with Forced Style */}
          < div
            className="rounded-[40px] p-8 lg:p-16 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden h-full z-20 min-h-[500px]"
            style={{ backgroundColor: '#ffffff' }
            }
          >
            <div className="space-y-8 relative z-10 w-full">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigoInk mb-3">Product Types</p>
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-indigoInk tracking-tighter">Categories</h3>
              </div>

              <div className="grid gap-3">
                {featuredCounts.map((item) => (
                  <div key={item.label} className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigoInk hover:!bg-white hover:shadow-md transition-all duration-300 cursor-default">
                    <div>
                      <span className="block font-bold text-indigoInk text-sm group-hover:text-indigo-600 transition-colors">{item.label}</span>
                      <span className="text-[11px] font-medium text-slate-400">{item.detail}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-indigoInk group-hover:text-white group-hover:border-indigoInk transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 mt-auto relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigoInk/5 flex items-center justify-center text-indigoInk">
                  <InfoIcon />
                </div>
                <div>
                  <p className="font-bold text-sm text-indigoInk">Custom Orders</p>
                  <p className="text-[10px] font-semibold text-slate-400">Tailored to your needs</p>
                </div>
              </div>
              <button
                onClick={() => setShowRangeModal(true)}
                className="w-full py-4 rounded-xl bg-indigoInk text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigoInk/20 hover:bg-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-0"
              >
                See Full Range
              </button>
            </div>
          </div >
        </section >
      </div >

      <ProductRangeDetails isOpen={showRangeModal} onClose={() => setShowRangeModal(false)} />

      <OrderModal
        product={selectedProduct}
        submitting={submitting}
        error={orderError}
        onClose={() => setSelectedProduct(null)}
        onSubmit={handleCreateOrder}
      />
    </>
  );
};

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

export default Storefront;
