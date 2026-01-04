const Footer = () => {
  return (
    <footer className="border-t border-white/20 bg-gradient-to-r from-indigoInk to-aurora">
      <div className="mx-auto flex flex-col gap-6 px-6 py-10 text-sm text-white md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-base text-white">Shivam Yarn Agencies</p>
          <p>No: 86/64, J.G Nagar, 60 Feet Road, Tiruppur – 641 602</p>
          <p>GSTIN: 33EGBPK6473C1ZM</p>
        </div>
        <div className="space-y-1">
          <p>shivamyarnagencies@gmail.com</p>
          <p>+91 90921 52148 · 99432 20448</p>
          <p>0421-4338228</p>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/70">
          © {new Date().getFullYear()} Shivam Yarn Agencies · All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
