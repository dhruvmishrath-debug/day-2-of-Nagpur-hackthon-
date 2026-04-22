import { Link, NavLink } from "react-router-dom";
import { Zap } from "lucide-react";

const linkBase = "px-4 py-2 rounded-full text-sm font-medium transition-colors";
const inactive = "text-stone-600 hover:text-stone-900 hover:bg-stone-100";
const active = "bg-green-600 text-white hover:bg-green-700";

const Navbar = () => (
  <header data-testid="top-navbar" className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white shadow-sm">
          <Zap size={18} strokeWidth={2.5} />
        </span>
        <div className="leading-tight">
          <p className="font-['Outfit'] text-lg font-bold tracking-tight text-stone-900">VoltRoute</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">EV Decision Engine</p>
        </div>
      </Link>
      <nav className="hidden items-center gap-2 md:flex">
        <NavLink to="/" end data-testid="nav-home" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>Home</NavLink>
        <NavLink to="/dashboard" data-testid="nav-dashboard" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>Dashboard</NavLink>
        <NavLink to="/bookings" data-testid="nav-bookings" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>Booking Status</NavLink>
      </nav>
      <Link to="/dashboard" data-testid="nav-cta" className="hidden rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 sm:inline-block">
        Find a station
      </Link>
    </div>
    <div className="flex items-center justify-center gap-1 border-t border-stone-200 px-3 py-2 md:hidden">
      <NavLink to="/" end data-testid="nav-home-mobile" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>Home</NavLink>
      <NavLink to="/dashboard" data-testid="nav-dashboard-mobile" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>Dashboard</NavLink>
      <NavLink to="/bookings" data-testid="nav-bookings-mobile" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>Bookings</NavLink>
    </div>
  </header>
);

export default Navbar;
