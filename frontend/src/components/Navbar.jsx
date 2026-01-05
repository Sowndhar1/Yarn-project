import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const Navbar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { cartTotals, clearCart } = useCart();
  const { favorites } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCart();
    // Explicitly clear guest cart to ensure no stale data appears
    localStorage.removeItem('yarn-cart-guest');
    navigate("/");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F1A2F] text-white shadow-sm border-b border-slate-100">
      <div className="w-full px-6 lg:px-12 flex items-center justify-between py-5">

        {/* Left Section: Hamburger + Logo */}
        <div className="flex items-center gap-8 lg:gap-12">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center rounded-xl border border-white/20 p-3 text-white/70 transition-all hover:bg-[rgba(255,255,255,0.12)] hover:text-white active:scale-95"
            aria-label="Toggle Navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
            </svg>
          </button>

          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
            <img
              src="/logo-circle.png"
              alt="Shivam Yarn Agencies"
              className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-white/20 transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block leading-none">
              <p className="font-display text-base font-bold tracking-tighter uppercase text-white group-hover:text-slate-300 transition-colors">Shivam Yarn Agencies</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                Filament Yarn Supplier
              </p>
            </div>
          </div>
        </div>

        {/* Center (Desktop): Essential Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) => `text-xs font-bold uppercase tracking-widest transition-colors hover:text-yarnSun ${isActive ? 'text-[#5E4B8B]' : 'text-white'}`}
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `text-xs font-bold uppercase tracking-widest transition-colors hover:text-yarnSun ${isActive ? 'text-[#5E4B8B]' : 'text-white'}`}
          >
            About
          </NavLink>
        </nav>

        {/* Right Section: Cart, Favorites, Auth */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.12)] transition-colors group/theme"
            aria-label="Toggle Background"
            title={theme === 'default' ? "Switch to Luxury Background" : "Switch to Default Background"}
          >
            {theme === 'default' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-5 5-5 5-5"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yarnSun">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {/* Favorites Icon */}
          <button
            onClick={() => navigate('/favorites')}
            className="relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.12)] transition-colors"
            aria-label="Favorites"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.12)] transition-colors"
            aria-label="Shopping Cart"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartTotals.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-indigoInk text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartTotals.itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
              <NavLink
                to={user.role === 'admin' ? '/admin' : user.role === 'sales_staff' ? '/sales' : user.role === 'inventory_staff' ? '/inventory' : '/my-account'}
                className="hidden lg:flex items-center gap-2 group/nav"
              >
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/70 mb-0.5 font-bold">Dashboard</span>
                  <span className="text-xs font-black text-yarnSun uppercase tracking-wider group-hover/nav:text-white transition-colors">
                    {user.role.replace('_staff', ' hub')}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 group-hover/nav:bg-yarnSun group-hover/nav:text-indigoInk transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </NavLink>

              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/customer/login"
                className="text-xs font-bold uppercase tracking-widest text-white hover:text-yarnSun transition-colors px-3 py-1.5"
              >
                Login
              </NavLink>

              <NavLink
                to="/customer/register"
                className="rounded-lg bg-yarnSun px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigoInk shadow-lg hover:shadow-yarnSun/20 hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
