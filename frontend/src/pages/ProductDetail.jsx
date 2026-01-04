import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductDetail } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetchProductDetail(id);
        console.log("Product Detail Response:", response);

        if (response.product) {
          setProduct(response.product);
        } else if (response.success && response.data) {
          setProduct(response.data);
        } else if (response.name) {
          // Handle case where backend returns raw product object
          setProduct(response);
        } else {
          setError("Product not found or invalid response format");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigoInk border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to Load Product</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigoInk text-white rounded-full text-sm font-bold">
        Back to Home
      </button>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigoInk border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return null;

  // Fallback images if none provided
  const images = product.images?.length > 0 ? product.images : [
    'https://placehold.co/600x600/f1f5f9/64748b?text=Yarn+View+1',
    'https://placehold.co/600x600/f8fafc/94a3b8?text=Yarn+View+2',
    'https://placehold.co/600x600/e2e8f0/475569?text=Packaging',
    'https://placehold.co/600x600/f1f5f9/64748b?text=Texture'
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Optional: show toast
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-slate-900 pb-20 font-sans">
      {/* Breadcrumb / Back Nav */}
      <div className="bg-white py-4 px-4 shadow-sm border-b border-slate-200 mb-8 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')} className="group text-xs font-bold text-slate-500 hover:text-indigoInk flex items-center gap-2 transition-colors">
            <div className="p-1.5 rounded-full bg-slate-100 group-hover:bg-indigoInk/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
            Back
          </button>
          <div className="flex gap-2 text-xs font-medium text-slate-400">
            <span onClick={() => navigate('/')} className="hover:text-indigoInk cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-slate-600">{product.category || 'Yarns'}</span>
            <span>/</span>
            <span className="text-indigoInk font-bold truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left Col: Images (Interactive Gallery) */}
        <div className="lg:col-span-1 hidden lg:flex flex-col gap-4 sticky top-24 h-fit">
          {images.map((img, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActiveImage(idx)}
              className={`relative w-20 h-24 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${activeImage === idx ? 'ring-2 ring-indigoInk ring-offset-2 shadow-lg scale-105' : 'border border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'}`}
            >
              <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Main Image Stage */}
        <div className="lg:col-span-6 relative group">
          <div className="w-full h-[500px] lg:h-[700px] flex items-center justify-center bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

            <img src={images[activeImage]} alt={product.name} className="relative z-10 max-w-[85%] max-h-[85%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105" />

            <div className="absolute top-6 right-6 z-20">
              <button className="p-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Product Intelligence & Requisition */}
        <div className="lg:col-span-5 space-y-8">

          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigoInk text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigoInk/20">Top Quality</span>
              {product.stockKg > 500 && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">Bulk Stock Available</span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-indigoInk leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-sm font-medium border-b border-slate-200 pb-6">
              <span className="text-slate-500">Brand: <span className="text-indigoInk font-bold">{product.brand}</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-slate-500">Quality: <span className="text-indigoInk font-bold">A+ Grade</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="flex items-center gap-1 text-yarnSun">
                {[1, 2, 3, 4, 5].map(s => <svg key={s} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                <span className="text-slate-400 ml-1 text-xs">(Verified)</span>
              </div>
            </div>
          </div>

          {/* Price & Requisition Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-[100px] z-0 opacity-50"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Price</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-indigoInk tracking-tighter">₹{product.pricePerKg?.toLocaleString()}</span>
                  <span className="text-xl font-medium text-slate-400">/ kg</span>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-2 border border-emerald-100">
                  Includes 5% GST
                </div>
              </div>

              {/* Quantity & Action */}
              <div className="flex-1 w-full md:max-w-xs space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 5))}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-indigoInk hover:text-yarnSun font-bold transition-colors"
                  >-</button>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-slate-900">{quantity} kg</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 5)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-indigoInk hover:text-yarnSun font-bold transition-colors"
                  >+</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="col-span-1 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-indigoInk hover:text-indigoInk transition-all text-sm uppercase tracking-wide"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="col-span-1 py-3 px-4 bg-indigoInk text-white font-bold rounded-xl hover:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>Buy Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Logistics Info Bar */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivery Time</div>
                <div className="text-sm font-bold text-slate-700">{product.leadTimeDays || 3} Days</div>
              </div>
              <div className="border-l border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Min Order</div>
                <div className="text-sm font-bold text-slate-700">{product.minOrderQuantity || 1} kg</div>
              </div>
              <div className="border-l border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock</div>
                <div className="text-sm font-bold text-emerald-600">
                  {product.stockKg > 0 ? `${product.stockKg}kg Available` : 'Made to Order'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specs Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-yarnSun pl-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Material</div>
                  <div className="font-bold text-slate-800">{product.material || product.composition}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Count</div>
                  <div className="font-bold text-slate-800">{product.count} ({product.yarnType})</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Size</div>
                  <div className="font-bold text-slate-800">{product.needleSize || 'Standard'}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Gauge</div>
                  <div className="font-bold text-slate-800">{product.gauge || 'Standard'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigoInk pl-3">More Info</h3>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-sm text-slate-600 leading-relaxed">
                <p className="mb-4 font-medium italic">"{product.description || 'Premium quality yarn, best for knitting and weaving. Strong and durable.'}"</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Good packaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Trusted Quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Lab Tested</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Suggested / Sponsored Widget converted to "Related Inventory" */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Similar Products</h4>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold">Recommended</span>
            </div>

            <div className="flex gap-4 items-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigoInk/20 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0">
                <img src="https://placehold.co/100x100/e2e8f0/475569?text=Alt" className="w-full h-full object-cover rounded-lg" alt="Alt" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">Premier Poly-Cotton 40s</div>
                <div className="text-xs text-slate-500">Good quality alternative</div>
              </div>
              <div className="font-bold text-indigoInk text-sm">₹290/kg</div>
              <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
