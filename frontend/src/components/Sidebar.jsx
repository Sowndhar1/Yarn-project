import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-indigoInk shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col border-r border-white/5 pointer-events-auto ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-6 bg-night/20">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-yarnSun animate-pulse" />
                    <span className="font-display text-[0.7rem] font-black text-slate-300 tracking-[0.3em] uppercase">Control Panel</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto pt-4">
                <nav className="px-3 pb-6 flex flex-col gap-1">
                    <SectionHeader title="Principal" />
                    <DrawerLink to="/" text="Digital Marketplace" icon={<HomeIcon />} onClick={() => setIsOpen(false)} />
                    <DrawerLink to="/about" text="About the Enterprise" icon={<InfoIcon />} onClick={() => setIsOpen(false)} />

                    {user && (
                        <>
                            {user.role === 'customer' ? (
                                <>
                                    <SectionHeader title="Your Account" />
                                    <DrawerLink to="/my-account" text="My Profile" icon={<UserIcon />} onClick={() => setIsOpen(false)} />
                                    <DrawerLink to="/my-account/orders" text="Order History" icon={<BoxIcon />} onClick={() => setIsOpen(false)} />
                                </>
                            ) : (
                                <>
                                    <SectionHeader title="Operations" />
                                    <DrawerLink to="/dashboard" text="Analytical Dashboard" icon={<GridIcon />} onClick={() => setIsOpen(false)} />
                                    <DrawerLink to="/stock" text="Inventory Assets" icon={<BoxIcon />} onClick={() => setIsOpen(false)} />
                                    {(user.role === "admin" || user.role === "inventory_staff") && (
                                        <DrawerLink to="/inventory/products" text="Add New Product" icon={<PlusIcon />} onClick={() => setIsOpen(false)} />
                                    )}
                                    {user.role === "admin" && (
                                        <DrawerLink to="/admin" text="Security Admin" icon={<ShieldIcon />} onClick={() => setIsOpen(false)} />
                                    )}
                                    <DrawerLink to="/settings/account" text="Account Settings" icon={<UserIcon />} onClick={() => setIsOpen(false)} />
                                </>
                            )}
                        </>
                    )}
                </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-white/5 bg-night/10">
                <a
                    href="mailto:shivamyarnagencies@gmail.com"
                    className="flex items-center justify-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>Contact Support</span>
                </a>
            </div>
        </div>
    );
};

const SectionHeader = ({ title }) => (
    <p className="px-6 py-4 text-[0.6rem] font-black uppercase tracking-[0.4em] text-slate-500">{title}</p>
);

const DrawerLink = ({ to, text, icon, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `
      flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition-all group
      ${isActive
                ? 'bg-yarnSun text-indigoInk shadow-xl shadow-yarnSun/10'
                : 'text-slate-300 hover:bg-white/[0.03] hover:text-white'}
    `}
    >
        <div className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
            {icon}
        </div>
        <span className="tracking-tight">{text}</span>
    </NavLink>
);

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default Sidebar;
