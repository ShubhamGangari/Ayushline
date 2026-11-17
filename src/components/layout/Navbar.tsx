import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth, UserButton } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { AyushlineLogo } from '../ui/AyushlineLogo';
import { AyurvedaIcon, YogaIcon, UnaniIcon, SiddhaIcon, HomeopathyIcon } from '../ui/SystemIcons';
import { NotificationBell } from './NotificationBell';

const AYUSH_SYSTEMS = [
  { name: 'Ayurveda', path: '/ayurveda', icon: <AyurvedaIcon className="w-6 h-6 shrink-0" />, desc: 'Ancient Indian healing' },
  { name: 'Yoga & Naturopathy', path: '/yoga', icon: <YogaIcon className="w-6 h-6 shrink-0" />, desc: 'Mind-body wellness' },
  { name: 'Unani', path: '/unani', icon: <UnaniIcon className="w-6 h-6 shrink-0" />, desc: 'Greco-Arab medicine' },
  { name: 'Siddha', path: '/siddha', icon: <SiddhaIcon className="w-6 h-6 shrink-0" />, desc: 'Tamil healing system' },
  { name: 'Homeopathy', path: '/homeopathy', icon: <HomeopathyIcon className="w-6 h-6 shrink-0" />, desc: 'Like cures like' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ayushOpen, setAyushOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close AYUSH dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAyushOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setAyushOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `text-sm font-ui transition-colors duration-200 ${
      isActive(path)
        ? 'text-ayush-gold font-semibold'
        : 'text-ayush-ivory/85 hover:text-ayush-gold'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-ayush-forest text-ayush-ivory shadow-lg" aria-label="Main navigation">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo with Trademark */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <AyushlineLogo size="md" variant="gold" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">

            {/* AYUSH Systems Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAyushOpen(!ayushOpen)}
                aria-expanded={ayushOpen}
                aria-haspopup="true"
                aria-label="AYUSH Systems menu"
                className={`flex items-center gap-1 text-sm font-ui transition-colors ${
                  ayushOpen ? 'text-ayush-gold' : 'text-ayush-ivory/85 hover:text-ayush-gold'
                }`}
              >
                AYUSH Systems <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ayushOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {ayushOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-ayush-charcoal/10 py-2 z-50 animate-scale-in" role="menu" aria-label="AYUSH systems list">
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-ayush-charcoal/40">Select System</p>
                  {AYUSH_SYSTEMS.map((sys) => (
                    <Link
                      key={sys.path}
                      to={sys.path}
                      role="menuitem"
                      onClick={() => setAyushOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-ayush-cream transition-colors group"
                    >
                      <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        {sys.icon}
                      </div>
                      <div>
                        <p className="text-sm font-ui font-bold text-ayush-forest group-hover:text-ayush-gold transition-colors">{sys.name}</p>
                        <p className="text-[11px] text-ayush-charcoal/50">{sys.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/consult"   aria-current={isActive('/consult') ? 'page' : undefined}   className={linkClass('/consult')}>Consultation</Link>
            <Link to="/whats-new" aria-current={isActive('/whats-new') ? 'page' : undefined} className={linkClass('/whats-new')}>What's New</Link>
            <Link to="/about"     aria-current={isActive('/about') ? 'page' : undefined}     className={linkClass('/about')}>About Us</Link>

            {/* Auth Section */}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              {isAdmin && (
                <Link to="/admin"
                  className="px-3 py-1.5 rounded-full bg-ayush-saffron text-ayush-forest font-ui font-bold text-xs flex items-center gap-1 shadow-sm hover:opacity-90 transition-opacity"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              {isLoaded && isSignedIn && <NotificationBell />}
              {isLoaded && isSignedIn ? (
                <UserButton />
              ) : (
                <Link to="/join"
                  className="px-5 py-2 rounded-full bg-ayush-gold text-ayush-forest font-ui font-semibold text-sm hover:bg-opacity-90 transition-all"
                >
                  Join / Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile: User Button + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {isAdmin && (
              <Link to="/admin"
                className="px-2.5 py-1 rounded-full bg-ayush-saffron text-ayush-forest font-ui font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <ShieldCheck className="w-3 h-3" /> Admin
              </Link>
            )}
            {isLoaded && isSignedIn && <NotificationBell />}
            {isLoaded && isSignedIn && (
              <UserButton />
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-controls="mobile-menu"
              className="p-2 rounded-lg text-ayush-ivory hover:text-ayush-gold hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden bg-ayush-forest border-t border-white/10 pb-6 px-4" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
          {/* AYUSH Systems */}
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ayush-ivory/40 mb-2 px-1">AYUSH Systems</p>
            <div className="grid grid-cols-2 gap-2">
              {AYUSH_SYSTEMS.map((sys) => (
                <Link
                  key={sys.path}
                  to={sys.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {sys.icon}
                  </div>
                  <span className="text-sm font-ui text-ayush-ivory/90">{sys.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 mt-1 space-y-1">
            {[
              { name: 'Consultation', path: '/consult' },
              { name: "What's New", path: '/whats-new' },
              { name: 'About Us', path: '/about' },
            ].map((link) => (
              <Link key={link.path} to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-ui text-ayush-ivory/85 hover:bg-white/10 hover:text-ayush-gold transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mt-2">
            {isAdmin && (
              <Link to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-ayush-saffron hover:bg-white/10 mb-1">
                <ShieldCheck className="w-4 h-4" /> Admin Portal
              </Link>
            )}
            {isLoaded && !isSignedIn && (
              <Link to="/join"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-3 rounded-full bg-ayush-gold text-ayush-forest font-ui font-semibold text-sm">
                Join / Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
