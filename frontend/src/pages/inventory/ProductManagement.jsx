import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createProduct, updateProduct, fetchProductDetail } from '../../lib/api';
import { useNavigate, useParams } from 'react-router-dom';

const ProductManagement = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        brand: '',
        count: '',
        color: '',
        material: '',
        pricePerKg: '',
        stockKg: '',
        category: 'Filament Yarn',
        yarnType: 'polyester',
        weight: 'dk',
        texture: 'smooth',
        length: '2500',
        needleSize: '',
        gauge: '',
        description: '',
        leadTimeDays: '3',
        thumbnailUrl: '',
        tags: ''
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    React.useEffect(() => {
        if (isEdit) {
            const getProduct = async () => {
                try {
                    const data = await fetchProductDetail(id);
                    const p = data.product;
                    setForm({
                        name: p.name || '',
                        brand: p.brand || '',
                        count: p.count || '',
                        color: p.color || '',
                        material: p.material || '',
                        pricePerKg: p.pricePerKg || '',
                        stockKg: p.stockKg || '',
                        category: p.category || 'Filament Yarn',
                        yarnType: p.yarnType || 'polyester',
                        weight: p.weight || 'dk',
                        texture: p.texture || 'smooth',
                        length: p.length || '2500',
                        needleSize: p.needleSize || '',
                        gauge: p.gauge || '',
                        description: p.description || '',
                        leadTimeDays: p.leadTimeDays || '3',
                        thumbnailUrl: p.thumbnail || '',
                        tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '')
                    });
                    if (p.thumbnail) {
                        setPreview(p.thumbnail);
                        setImageMode(p.thumbnail.startsWith('http') ? 'url' : 'upload');
                    }
                } catch (err) {
                    setError('Failed to load product details.');
                } finally {
                    setFetching(false);
                }
            };
            getProduct();
        }
    }, [id, isEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let data;
            if (imageMode === 'upload' && file) {
                data = new FormData();
                Object.keys(form).forEach(key => {
                    data.append(key, form[key]);
                });
                data.append('image', file);
            } else {
                data = { ...form };
            }

            if (isEdit) {
                await updateProduct(token, id, data);
                setSuccess('Product updated successfully! Returning to catalog...');
            } else {
                await createProduct(token, data);
                setSuccess('Product created successfully! Redirecting...');
            }

            setTimeout(() => {
                navigate('/storefront');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to create product. Ensure all fields are valid.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="h-1 w-64 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigoInk animate-[shimmer_2s_infinite] w-1/3" />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Global Inventory...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isEdit ? 'Modify Asset' : 'Product Asset Creation'}
                        </h1>
                        <p className="text-slate-500 font-bold">
                            {isEdit ? `Updating ${form.name} in the marketplace.` : 'Register new yarn varieties into the global marketplace catalog.'}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/storefront')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm ring-1 ring-slate-100 group"
                        title="Back to Marketplace"
                    >
                        <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-12 grid gap-10 lg:grid-cols-2">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-50 pb-2">Core Specifications</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</label>
                                    <input required name="name" value={form.name} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="e.g. Ultra Soft Filament" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand / Manufacturer</label>
                                    <input required name="brand" value={form.brand} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="e.g. Shivam Premium" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yarn Count</label>
                                    <input required name="count" value={form.count} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="e.g. 150/T" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Material</label>
                                    <input required name="material" value={form.material} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="e.g. 100% Polyester" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Color / Shade</label>
                                <input required name="color" value={form.color} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="e.g. Cobalt Blue" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (INR / KG)</label>
                                    <input required name="pricePerKg" type="number" value={form.pricePerKg} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initial Stock (KG)</label>
                                    <input required name="stockKg" type="number" value={form.stockKg} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="100" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-50 pb-2">Technical Properties</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yarn Type</label>
                                    <select name="yarnType" value={form.yarnType} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none">
                                        {['cotton', 'wool', 'acrylic', 'polyester', 'silk', 'linen', 'bamboo', 'alpaca', 'cashmere', 'blend'].map(t => (
                                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texture</label>
                                    <select name="texture" value={form.texture} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none">
                                        {['smooth', 'textured', 'boucle', 'chenille', 'slub', 'heathered', 'marled', 'variegated'].map(t => (
                                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Needle Size</label>
                                    <input required name="needleSize" value={form.needleSize} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="3.5mm - 4.5mm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stitch Gauge</label>
                                    <input required name="gauge" value={form.gauge} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="22 sts / 10cm" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight Category</label>
                                    <select name="weight" value={form.weight} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none">
                                        {['lace', 'fingering', 'sport', 'dk', 'worsted', 'aran', 'chunky', 'bulky', 'super bulky'].map(w => (
                                            <option key={w} value={w}>{w.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Length (M / KG)</label>
                                    <input name="length" type="number" value={form.length} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Imagery & Details */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-50 pb-2">Global Asset Media</h3>

                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <button type="button" onClick={() => setImageMode('upload')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${imageMode === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Cloud Upload</button>
                                <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${imageMode === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Direct Link (URL)</button>
                            </div>

                            <div className="min-h-[240px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-6 bg-slate-50/50">
                                {imageMode === 'upload' ? (
                                    <>
                                        {preview ? (
                                            <div className="relative group">
                                                <img src={preview} alt="Preview" className="h-40 w-40 object-cover rounded-2xl shadow-lg" />
                                                <button type="button" onClick={() => { setPreview(null); setFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer text-center space-y-3">
                                                <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">☁️</div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Global Cloud Storage</p>
                                                    <p className="text-[10px] font-bold text-slate-400">JPG, PNG or WebP</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">🔗</div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Image Link (URL)</label>
                                            <input name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleInputChange} className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none shadow-sm" placeholder="https://..." />
                                        </div>
                                        {form.thumbnailUrl && (
                                            <img src={form.thumbnailUrl} alt="Preview" className="h-20 w-full object-cover rounded-xl mt-2 border border-slate-100" onError={(e) => e.target.style.display = 'none'} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-50 pb-2">Logistics & Marketing</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                                    <input name="category" value={form.category} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Time (Days)</label>
                                    <input name="leadTimeDays" type="number" value={form.leadTimeDays} onChange={handleInputChange} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Narrative</label>
                                <textarea name="description" value={form.description} onChange={handleInputChange} className="w-full h-24 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none resize-none" placeholder="Describe the yarn's quality and applications..." />
                            </div>
                        </div>

                        {error && <p className="text-xs font-black text-rose-500 uppercase tracking-widest text-center py-4 bg-rose-50 rounded-2xl ring-1 ring-rose-100">{error}</p>}
                        {success && (
                            <div className="flex flex-col items-center gap-2 p-6 bg-emerald-50 rounded-[2rem] ring-1 ring-emerald-100 animate-in fade-in zoom-in duration-500">
                                <span className="text-3xl">✅</span>
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest text-center">{success}</p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/storefront')}
                                className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-100 active:scale-95"
                            >
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Initializing Asset...' : (isEdit ? 'Save & Verify Changes' : 'Deploy Global Asset')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductManagement;
