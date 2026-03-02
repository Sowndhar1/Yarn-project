import React from "react";

// Local brand assets
import imgExterior from "../about-exterior.png";
import imgWeaving from "../about-weaving.jpg";
import imgWarehouse from "../about-warehouse.jpg";
import imgKnitting from "../about-knitting.jpg";

const About = () => {
  return (
    <div className="bg-white min-h-screen font-body text-slate-700 pb-20">

      {/* 1. HERO SECTION: Clean, Centered, Impactful */}
      <section className="relative pt-32 pb-24 px-6 bg-slate-50 border-b border-slate-100 overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-slate-100/50 rounded-full blur-3xl -z-10 opacity-60" />

        <div className="container-elite mx-auto text-center space-y-8 max-w-4xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigoInk/5 border border-indigoInk/10 text-indigoInk text-xs font-bold tracking-[0.2em] uppercase">
            Est. 2009 • Tiruppur
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight leading-[1.1]">
            Weaving Excellence into <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigoInk to-slate-500">
              Every Strand.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed max-w-2xl mx-auto">
            Shivam Yarn Agencies bridges the gap between global manufacturing standards and local export needs with precision, speed, and integrity.
          </p>
        </div>
      </section>

      {/* 2. VISUAL STORY GRID: Simple & Asymmetric */}
      <section className="py-24 px-6 container-elite mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
                A Decade of Dedication.
              </h2>
              <div className="w-20 h-1 bg-yarnSun rounded-full" />
            </div>
            <p className="text-lg leading-loose text-slate-600">
              Founded in 2009, our journey began with a singular vision: to eliminate procurement bottlenecks for modern export houses. Located in the heart of Tiruppur's knitwear cluster, we have evolved from a local supplier to a strategic partner for major garmenting units.
            </p>
            <p className="text-lg leading-loose text-slate-600">
              Our inventory model is built on resilience. By maintaining high-volume "Ex-Stock" availability, we ensure that our clients never face production halts due to raw material shortages.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="border-l-4 border-slate-200 pl-6">
                <p className="text-4xl font-display font-bold text-slate-900">15+</p>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mt-2">Years active</p>
              </div>
              <div className="border-l-4 border-slate-200 pl-6">
                <p className="text-4xl font-display font-bold text-slate-900">500+</p>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mt-2">Active Clients</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative group">
            <div className="absolute inset-4 border-2 border-slate-900/5 rounded-2xl -z-10 transform translate-x-6 translate-y-6 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4" />
            <div className="overflow-hidden rounded-xl shadow-2xl bg-slate-100 aspect-[4/5] object-cover">
              <img src={imgExterior} alt="Company Headquarters" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES: Minimalist Cards */}
      <section className="py-24 bg-slate-900 text-slate-50">
        <div className="container-elite mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl font-display font-bold text-white">Our Operating Principles</h2>
            <p className="text-slate-300 text-lg">Built on transparency, driven by quality.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-6 text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-white">Uncompromised Quality</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Every batch undergoes rigorous ISO-compliant testing for denier strength and dye affinity before entering our warehouse.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-6 text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-white">Zero-Delay Logistics</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Our 24-hour dispatch guarantee ensures that your production lines never stop waiting for raw materials.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6 text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 5.68 1.33 10.27 4 13l8 11 8-11c2.67-2.73 2.54-7.32-.42-8.42z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-white">Customer Centricity</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                We don't just sell yarn; we provide technical consultation to help you choose the right material for the perfect finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INFRASTRUCTURE & TEAM */}
      <section className="py-24 px-6 container-elite mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">Operational Infrastructure</h2>
          <p className="text-lg text-slate-500 max-w-2xl">
            Our facilities are designed for speed and safety, ensuring that every cone of yarn is stored in optimal conditions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Large Image */}
          <div className="md:row-span-2 relative group overflow-hidden rounded-2xl h-[500px]">
            <img src={imgWarehouse} alt="Warehouse" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
              <p className="text-white font-bold text-xl">Central Warehouse</p>
              <p className="text-slate-300 text-sm mt-2">20,000 sq.ft storage capacity with humidity control.</p>
            </div>
          </div>

          {/* Smaller Images */}
          <div className="relative group overflow-hidden rounded-2xl h-[240px]">
            <img src={imgWeaving} alt="Quality Check" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <p className="text-white font-bold">Quality Control</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl h-[240px]">
            <img src={imgKnitting} alt="Dispatch" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <p className="text-white font-bold">Logistics Fleet</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CTA: Professional & Direct */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container-elite mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">Start a Conversation</h2>
          <p className="text-slate-500 mb-10 text-lg">
            Whether you need a custom quote or technical advice, our team is ready to assist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="inline-flex justify-center items-center px-8 py-4 bg-indigoInk text-white rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Contact Sales
            </a>
            <a href="tel:+919092152148" className="inline-flex justify-center items-center px-8 py-4 bg-white border border-slate-200 text-indigoInk rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-slate-50 transition-all hover:border-slate-300">
              +91 90921 52148
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-medium uppercase tracking-widest">
            <p>© 2025 Shivam Yarn Agencies</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Trade</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
