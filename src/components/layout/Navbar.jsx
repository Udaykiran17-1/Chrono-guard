import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  HelpCircle,
  LogIn,
  Search,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/#talent', label: 'Explore Talent', icon: Users },
  { to: '/#projects', label: 'Find Projects', icon: Briefcase },
  { to: '/#how-it-works', label: 'How It Works', icon: HelpCircle },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMobile();
    navigate('/');
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member';

  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const role = profile?.platform_role || 'user';

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
                    isActive && to === '/'
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

            {/* Authenticated State vs Guest State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive ? 'bg-indigo-50 text-brand-indigo' : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')
                  }
                >
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-7 w-7 rounded-full border border-card-border object-cover"
                  />
                  <div className="text-left">
                    <p className="font-semibold leading-tight text-slate-900 text-xs truncate max-w-[100px]">
                      {displayName}
                    </p>
                    <span className="text-[10px] text-brand-indigo font-bold uppercase tracking-wider">
                      {role}
                    </span>
                  </div>
                </NavLink>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 px-2 py-1.5"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </NavLink>

                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
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
            {/* Authenticated user badge if logged in */}
            {isAuthenticated && (
              <div className="border-b border-card-border p-4 bg-slate-50/70 flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-10 w-10 rounded-full border border-card-border object-cover"
                />
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-900 text-sm truncate">{displayName}</p>
                  <Badge variant="indigo" className="mt-0.5 text-[10px]">
                    ROLE: {role.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

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
                {isAuthenticated && (
                  <li>
                    <NavLink
                      to="/dashboard"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                          isActive
                            ? 'bg-indigo-50 text-brand-indigo'
                            : 'text-brand-indigo hover:bg-slate-50',
                        ].join(' ')
                      }
                    >
                      <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                      Dashboard
                    </NavLink>
                  </li>
                )}

                {navLinks.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive && to === '/'
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

                <li>
                  <NavLink
                    to="/showcase"
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    <Layers className="h-4 w-4" />
                    Component Showcase
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Mobile CTA */}
            <div className="border-t border-card-border p-4 space-y-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobile} className="block">
                    <Button variant="outline" className="w-full">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobile} className="block">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
