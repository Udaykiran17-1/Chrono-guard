import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  HelpCircle,
  LogIn,
  Search,
  Menu,
  X,
} from 'lucide-react';
import Button from '../ui/Button';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore Talent', icon: Users },
  { to: '/projects', label: 'Find Projects', icon: Briefcase },
  { to: '/how-it-works', label: 'How It Works', icon: HelpCircle },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav
        className="sticky top-0 z-40 h-nav min-h-nav w-full border-b border-card-border bg-white shadow-nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-brand-indigo"
            onClick={closeMobile}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="6" fill="#3730A3" />
              <path
                d="M8 20V12L14 8L20 12V20L14 16L8 20Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path d="M14 16L20 20V12L14 16Z" fill="white" fillOpacity="0.6" />
            </svg>
            <span>SkillBridge</span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search skills, people, projects…"
                className="w-full rounded-lg border border-card-border bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:ring-offset-1"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'text-brand-indigo'
                      : 'text-slate-500 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="mx-2 h-6 w-px bg-slate-200" aria-hidden="true" />

            <NavLink
              to="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </NavLink>

            <Link to="/get-started">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="fixed right-0 top-nav z-30 flex h-[calc(100vh-56px)] w-72 flex-col bg-white shadow-xl lg:hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            {/* Mobile search */}
            <div className="border-b border-card-border p-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search…"
                  className="w-full rounded-lg border border-card-border bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  aria-label="Search"
                />
              </div>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-indigo-50 text-brand-indigo'
                            : 'text-slate-700 hover:bg-slate-50',
                        ].join(' ')
                      }
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile CTA */}
            <div className="border-t border-card-border p-4 space-y-2">
              <Link to="/login" onClick={closeMobile} className="block">
                <Button variant="outline" className="w-full">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/get-started" onClick={closeMobile} className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
