import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, ChevronDown, Leaf } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth, UserButton } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';

const AYUSH_SYSTEMS = [
  { name: 'Ayurveda', path: '/ayurveda', icon: '🌿', desc: 'Ancient Indian healing' },
  { name: 'Yoga & Naturopathy', path: '/yoga', icon: '🧘', desc: 'Mind-body wellness' },
  { name: 'Unani', path: '/unani', icon: '⚗️', desc: 'Greco-Arab medicine' },
  { name: 'Siddha', path: '/siddha', icon: '🔬', desc: 'Tamil healing system' },
  { name: 'Homeopathy', path: '/homeopathy', icon: '💊', desc: 'Like cures like' },
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
    <nav className="sticky top-0 z-50 bg-ayush-forest text-ayush-ivory shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-ayush-gold/20 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-ayush-gold" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide text-ayush-gold">AYUSHLINE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">

            {/* AYUSH Systems Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAyushOpen(!ayushOpen)}
                className={`flex items-center gap-1 text-sm font-ui transition-colors ${
                  ayushOpen ? 'text-ayush-gold' : 'text-ayush-ivory/85 hover:text-ayush-gold'
                }`}
              >
                AYUSH Systems <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ayushOpen ? 'rotate-180' : ''}`} />
              </button>

              {ayushOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-ayush-charcoal/10 py-2 z-50 animate-scale-in">
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-ayush-charcoal/40">Select System</p>
                  {AYUSH_SYSTEMS.map((sys) => (
                    <Link
                      key={sys.path}
                      to={sys.path}
                      onClick={() => setAyushOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-ayush-cream transition-colors group"
                    >
                      <span className="text-xl leading-none">{sys.icon}</span>
                      <div>
                        <p className="text-sm font-ui font-bold text-ayush-forest group-hover:text-ayush-gold transition-colors">{sys.name}</p>
                        <p className="text-[11px] text-ayush-charcoal/50">{sys.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/consult" className={linkClass('/consult')}>Consult</Link>
            <Link to="/events" className={linkClass('/events')}>Events</Link>
            <Link to="/about" className={linkClass('/about')}>About</Link>

            {/* Auth Section */}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              {isAdmin && (
                <Link to="/admin"
                  className="px-3 py-1.5 rounded-full bg-ayush-saffron text-ayush-forest font-ui font-bold text-xs flex items-center gap-1 shadow-sm hover:opacity-90 transition-opacity"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              {isLoaded && isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-9 h-9 rounded-full border-2 border-ayush-gold',
                    }
                  }}
                />
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
            {isLoaded && isSignedIn && (
              <UserButton afterSignOutUrl="/" />
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-ayush-ivory hover:text-ayush-gold hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ayush-forest border-t border-white/10 pb-6 px-4">
          {/* AYUSH Systems */}
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ayush-ivory/40 mb-2 px-1">AYUSH Systems</p>
            <div className="grid grid-cols-2 gap-2">
              {AYUSH_SYSTEMS.map((sys) => (
                <Link
                  key={sys.path}
                  to={sys.path}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span>{sys.icon}</span>
                  <span className="text-sm font-ui text-ayush-ivory/90">{sys.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 mt-1 space-y-1">
            {[
              { name: 'Consult', path: '/consult' },
              { name: 'Events', path: '/events' },
              { name: 'About', path: '/about' },
            ].map((link) => (
              <Link key={link.path} to={link.path}
                className="block px-3 py-2.5 rounded-xl text-sm font-ui text-ayush-ivory/85 hover:bg-white/10 hover:text-ayush-gold transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mt-2">
            {isAdmin && (
              <Link to="/admin"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-ayush-saffron hover:bg-white/10 mb-1">
                <ShieldCheck className="w-4 h-4" /> Admin Portal
              </Link>
            )}
            {isLoaded && !isSignedIn && (
              <Link to="/join"
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
