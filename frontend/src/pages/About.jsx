import React from "react";

// Local brand assets
import imgExterior from "../about-exterior.png";
import imgWeaving from "../about-weaving.jpg";
import imgWarehouse from "../about-warehouse.jpg";
import imgKnitting from "../about-knitting.jpg";

const About = () => {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-800">
      {/* Hero Section */}
      <section className="border-b border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-8 py-24 lg:py-40">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-24 items-center">
            <div className="space-y-8">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Established 2009
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Corporate Excellence in <br />
                <span className="text-slate-400">Yarn Logistics.</span>
              </h1>
              <p className="text-xl text-slate-600 leading-[1.8] max-w-xl font-medium">
                Strategically headquartered in Tiruppur, Shivam Yarn Agencies operates as a primary bridge between global manufacturing standards and local export requirements.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-slate-200/20 rounded-[3rem] -z-10 blur-2xl" />
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200/50">
                <img src={imgExterior} alt="Company Exterior" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-slate-900">2009</p>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Established</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-slate-900">Tiruppur</p>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Operations Hub</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-slate-900">30D-1500D</p>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Product Range</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-slate-900">Ex-Stock</p>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Inventory Model</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Mission & Operations */}
      <section className="max-w-7xl mx-auto px-8 py-32 lg:py-48 space-y-48">
        {/* Mission */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-32 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-6 bg-slate-100 rounded-[3rem] -z-10" />
            <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-white/50">
              <img src={imgWeaving} alt="Weaving Operations" className="w-full h-auto object-cover" />
            </div>
          </div>
          <div className="space-y-10 order-1 lg:order-2 px-4 lg:px-8">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Our Strategic Aim</p>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Supply Chain Stability.</h2>
            </div>
            <p className="text-lg text-slate-600 leading-[1.8] font-medium">
              Our central objective is to eliminate procurement bottlenecks for modern export houses. By maintaining a deep-rooted presence in the Tiruppur knitwear cluster, we ensure consistent quality and denier precision across all requisition cycles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Quality Assurance', desc: 'ISO-compliant grading standards.' },
                { title: 'Direct Mill Access', desc: 'Minimized intermediary costs.' },
                { title: 'Inventory Resilience', desc: 'Ready-to-ship local stock.' },
                { title: 'Technical Precision', desc: '30D to 1500D range support.' }
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warehouse & Dispatch */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-32 items-center">
          <div className="space-y-10 px-4 lg:px-8">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Logistics Excellence</p>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Zero-Lead Infrastructure.</h2>
            </div>
            <p className="text-lg text-slate-600 leading-[1.8] font-medium">
              With a robust warehouse infrastructure strategically located to serve the core cluster, we guarantee a 24-hour dispatch cycle. This agility is essential for high-speed garmenting units operating on strict international lead times.
            </p>
            <div className="flex items-center gap-12 pt-6">
              <div>
                <p className="text-4xl font-bold text-slate-900">24hr</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Lead Time</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <p className="text-4xl font-bold text-slate-900">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Inspection Rate</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-slate-50 rounded-[3rem] -z-10" />
            <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-white/50">
              <img src={imgWarehouse} alt="Warehouse Inventory" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Standards */}
      <section className="bg-slate-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Standardized Quality</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                We supply a wide range of filament yarns, including 80/0, 150/0, and 300/0 counts, alongside recycled polyester and specialty blends. Every batch is verified for denier precision and dye affinity.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={imgKnitting} alt="Knitting Quality" className="w-full h-auto object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Information */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">Corporate Inquiries</h2>
          <p className="text-slate-500 font-medium">Please contact our operations desk for detailed procurement specifications.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl border border-slate-100 bg-slate-50">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Email</p>
            <p className="text-sm font-semibold text-slate-700">shivamyarnagencies@gmail.com</p>
          </div>
          <div className="p-8 rounded-xl border border-slate-100 bg-slate-50">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Telephone</p>
            <p className="text-sm font-semibold text-slate-700">+91 90921 52148</p>
          </div>
          <div className="p-8 rounded-xl border border-slate-100 bg-slate-50">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">GSTIN</p>
            <p className="text-sm font-semibold text-slate-700">33EGBPK6473C1ZM</p>
          </div>
        </div>

        <div className="pt-12 text-slate-400 text-xs font-medium uppercase tracking-widest">
          Shivam Yarn Agencies · Tiruppur · Since 2009
        </div>
      </section>
    </div>
  );
};

export default About;
