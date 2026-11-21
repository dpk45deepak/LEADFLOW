import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Search, TrendingUp, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'All Leads', icon: Users, end: true },
  { to: '/leads/new', label: 'Add Lead', icon: UserPlus, end: true },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">LeadFlow</span>
    </div>
  );
}

function NavbarSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const [q, setQ] = useState('');

  // Keep the box in sync with the leads page search; clear it elsewhere.
  useEffect(() => setQ(pathname === '/leads' ? params.get('search') ?? '' : ''), [pathname, params]);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/leads?search=${encodeURIComponent(term)}` : '/leads');
  };

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-md">
      <label htmlFor="global-search" className="sr-only">Search leads by name</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input id="global-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads by name" className="input bg-slate-50 pl-9" />
    </form>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Main" className="space-y-1 p-3">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" /> {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4">
        <button type="button" className="icon-btn lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="hidden w-44 shrink-0 sm:block"><Logo /></div>
        <div className="flex flex-1 justify-center sm:justify-start"><NavbarSearch /></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700" aria-hidden="true">{initials(user?.name)}</span>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="btn-secondary px-3" aria-label="Log out">
            <LogOut className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 hidden w-60 border-r border-slate-200 bg-white lg:block">{nav}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-16 z-20 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="relative h-full w-64 border-r border-slate-200 bg-white">{nav}</aside>
        </div>
      )}

      <main className="px-4 pb-12 pt-24 sm:px-6 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
