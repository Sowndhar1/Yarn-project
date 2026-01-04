import { useRef, useEffect } from "react";

const ProductRangeDetails = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sections = [
        {
            title: "Filament Yarn Range",
            subtitle: "Main Supply Category • 30D to 1500D",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            subsections: [
                {
                    name: "Light Denier (30D – 75D)",
                    uses: ["Lightweight fabrics", "Innerwear", "Fine knits", "Micro filament blends"],
                    apps: ["Women’s wear", "Soft-feel garments", "Export knit fabric finishing"]
                },
                {
                    name: "Medium Denier (80D – 150D)",
                    badge: "Most Used",
                    uses: ["T-shirts & casual knits", "Hosiery & rib structures", "Fabric base yarn"],
                    apps: ["Knitting units", "Garment exporters", "Dye houses"]
                },
                {
                    name: "Functional / Performance (200D – 300D)",
                    uses: ["Stretch garments", "Rib cuffs & collars", "Activewear knits", "Sports fabric"],
                    apps: ["Lycra blends", "Core yarn structures", "Heavy rib materials"]
                },
                {
                    name: "Heavy Denier (600D – 1500D)",
                    uses: ["Industrial fabrics", "Reinforcement material", "Woven technical textiles"],
                    apps: ["Upholstery units", "Accessories & straps", "Export industrial products"]
                }
            ]
        },
        {
            title: "Polyester Yarn Range",
            subtitle: "30D → 1500D • Versatile & Durable",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            description: "Includes 100% Polyester Filament, High Bulk Polyester, Fancy Polyester Blends, and Recycled Polyester.",
            details: [
                { label: "Types", value: "100% Poly, High Bulk, Recycled" },
                { label: "Applications", value: "T-shirts, Sportswear, Leggings, Garment Export" }
            ]
        },
        {
            title: "Cotton & Blends",
            subtitle: "Natural & Comfortable",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M20 12a8 8 0 01-8 8 8 8 0 01-8-8M20 12a8 8 0 00-8-8 8 8 0 00-8 8" />
                </svg>
            ),
            description: "Includes 100% cotton yarn, dyed cotton yarn, and cotton + filament blends.",
            details: [
                { label: "Usage", value: "Premium knitwear, Inner garments, Export fabric programs" }
            ]
        },
        {
            title: "Lycra & Core Yarn",
            subtitle: "Stretch & Performance",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            description: "Lycra Yarn, Core Lycra Yarn, and Stretch performance yarn.",
            details: [
                { label: "Used In", value: "Rib cuffs, Collars, Waistbands, Compression garments" }
            ]
        },
        {
            title: "Eco & Recycled Line",
            subtitle: "Sustainable Solutions • 30D – 1500D",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            description: "Certified Recycled Polyester Yarn for sustainability programs and eco-focused factories.",
            details: [
                { label: "Preferred By", value: "Sustainability programs, Export brands" }
            ]
        },
        {
            title: "Fancy & Value-Added",
            subtitle: "Fashion & Design",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            ),
            description: "Lurex Yarn, Fancy Filament Yarn, and Dyed Fancy Yarn.",
            details: [
                { label: "Usage", value: "Fashion knits, Design trims, Decorative fabrics" }
            ]
        }
    ];

    const summary = [
        { cat: "Filament Yarn", range: "30D – 1500D", use: "Knitting & weaving" },
        { cat: "Polyester Yarn", range: "30D – 1500D", use: "Garment & hosiery" },
        { cat: "High Bulk Yarn", range: "150D – 300D", use: "Rib & stretch fabrics" },
        { cat: "Lycra / Core", range: "Functional", use: "Stretch garments" },
        { cat: "Cotton Yarn", range: "All variants", use: "Knitwear" },
        { cat: "Lurex / Fancy", range: "Premium", use: "Fashion fabrics" },
        { cat: "Recycled Yarn", range: "30D – 1500D", use: "Sustainable programs" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-indigoInk px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between shrink-0">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yarnSun/80 mb-2">Our Capabilities</p>
                        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tighter">Full Product Range</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 text-white hover:bg-white hover:text-indigoInk transition-all duration-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-5 sm:p-10 space-y-8 sm:space-y-12">

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {sections.map((section, idx) => (
                            <div key={idx} className={`rounded-2xl border border-slate-100 p-6 ${idx === 0 ? 'lg:col-span-2 bg-slate-50/50' : 'bg-white'}`}>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-indigoInk/5 text-indigoInk">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{section.subtitle}</p>
                                    </div>
                                </div>

                                {/* Subsections for Filament */}
                                {section.subsections ? (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {section.subsections.map((sub, sIdx) => (
                                            <div key={sIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigoInk/30 transition-all">
                                                {sub.badge && <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-yarnSun text-[8px] font-black uppercase rounded text-indigoInk">{sub.badge}</span>}
                                                <h4 className="font-bold text-sm text-indigoInk mb-2">{sub.name}</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Used For</p>
                                                        <ul className="text-xs text-slate-600 space-y-0.5">
                                                            {sub.uses.map(u => <li key={u}>• {u}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Applications</p>
                                                        <p className="text-xs text-slate-600 leading-relaxed">{sub.apps.join(", ")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600 leading-relaxed">{section.description}</p>
                                        {section.details && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {section.details.map((d, i) => (
                                                    <div key={i} className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">{d.label}</span>
                                                        <span className="text-sm font-semibold text-slate-800">{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quick Summary Table */}
                    <div className="bg-indigoInk rounded-2xl p-8 text-white">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-yarnSun rounded-full"></span>
                            Range Summary
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50">
                                        <th className="pb-4 pl-2">Category</th>
                                        <th className="pb-4">Range</th>
                                        <th className="pb-4">Primary Use</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-medium">
                                    {summary.map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-2 text-yarnSun">{row.cat}</td>
                                            <td className="py-4 text-white/80">{row.range}</td>
                                            <td className="py-4 text-white/60">{row.use}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
                    <p className="text-xs text-slate-500 font-medium">
                        Contact us for custom yarn orders or bulk pricing.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigoInk text-white rounded-lg text-sm font-bold shadow-lg shadow-indigoInk/20 hover:bg-slate-900 transition-all"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductRangeDetails;
