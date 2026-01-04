import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Favorites = () => {
    const { favorites } = useFavorites();
    const navigate = useNavigate();

    if (favorites.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-8">
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Loom Operations</span>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="text-indigo-600">Asset Shortlist</span>
                    </nav>

                    <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-8 shadow-sm">
                        <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Catalog Empty</h2>
                            <p className="text-slate-500 font-bold max-w-sm mx-auto">
                                No assets have been flagged for procurement. Explore the global marketplace to initialize your curation.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigoInk text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg"
                        >
                            Open Market Catalog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Breadcrumbs & Header */}
                <div className="space-y-6">
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Loom Operations</span>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="text-indigo-600">Asset Shortlist</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Your Curated Assets</h1>
                            <p className="text-slate-500 font-bold max-w-xl line-clamp-2">
                                Review and manage your shortlisted yarn varieties. Verified assets are synchronized with your global procurement profile.
                            </p>
                        </div>

                        {/* Management Stats */}
                        <div className="flex bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
                            <div className="px-6 py-4 border-r border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total SKU</p>
                                <p className="text-xl font-black text-indigo-600">{favorites.length}</p>
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ready for Order</p>
                                <p className="text-xl font-black text-emerald-500">100%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Favorites Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favorites.map((product) => (
                        <ProductCard key={product.id || product._id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Favorites;
