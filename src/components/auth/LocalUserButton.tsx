import { useState, useEffect } from 'react';
import { useAuth, getLocalSession, type LocalUser } from '../../hooks/useAuth';
import { getProfile } from '../../lib/api/profiles';
import { LogOut, ChevronDown, User, LayoutDashboard, Stethoscope, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LocalUserButton = () => {
  const { user: authUser, signOut } = useAuth();
  const [localSession, setLocalSessionState] = useState<LocalUser | null>(() => getLocalSession());
  const [avatarFromProfile, setAvatarFromProfile] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Sync active user either from Clerk or Local session
  const currentUser = authUser || localSession;

  useEffect(() => {
    const handleAuthChange = () => {
      const sess = getLocalSession();
      setLocalSessionState(sess);
      const activeId = authUser?.id || sess?.id;
      if (activeId) {
        void getProfile(activeId).then((p) => {
          if (p?.avatar_url) setAvatarFromProfile(p.avatar_url);
        });
      }
    };
    handleAuthChange();
    window.addEventListener('ayush_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('ayush_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [authUser?.id]);

  if (!currentUser) return null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    window.location.href = '/';
  };

  const displayAvatar = avatarFromProfile || currentUser.avatarUrl;
  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const ROLE_COLORS: Record<string, string> = {
    doctor: 'bg-emerald-100 text-emerald-800',
    student: 'bg-blue-100 text-blue-800',
    org: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    user: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="relative inline-block text-left">
      {/* Avatar Button — clicking opens dropdown */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-ayush-gold/60 transition-all focus:outline-none"
        title="Account & Profile Options"
      >
        <div className="w-9 h-9 rounded-full border-2 border-ayush-gold bg-ayush-forest text-ayush-gold font-ui font-bold text-xs flex items-center justify-center overflow-hidden shadow-sm">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-ayush-ivory/80 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-ayush-charcoal/10 z-50 py-2 font-ui animate-scale-in">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-ayush-charcoal/10 bg-ayush-cream/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-ayush-gold flex-shrink-0 bg-ayush-forest text-ayush-gold flex items-center justify-center font-bold">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ayush-forest truncate">{currentUser.name}</p>
                  <p className="text-xs text-ayush-charcoal/60 truncate">{currentUser.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${ROLE_COLORS[currentUser.role] || 'bg-gray-100 text-gray-700'}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-ayush-forest hover:bg-ayush-cream hover:text-ayush-gold transition-colors"
              >
                <User className="w-4 h-4 text-ayush-gold" />
                <span>My Profile (Edit Info)</span>
              </Link>
              <Link
                to="/dashboard?tab=overview"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ayush-charcoal hover:bg-ayush-cream hover:text-ayush-forest transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-ayush-forest/60" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/dashboard?tab=consultations"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ayush-charcoal hover:bg-ayush-cream hover:text-ayush-forest transition-colors"
              >
                <Stethoscope className="w-4 h-4 text-ayush-forest/60" />
                <span>My Consultations</span>
              </Link>
              <Link
                to="/dashboard?tab=events"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ayush-charcoal hover:bg-ayush-cream hover:text-ayush-forest transition-colors"
              >
                <Calendar className="w-4 h-4 text-ayush-forest/60" />
                <span>AYUSH Events</span>
              </Link>
            </div>

            <div className="border-t border-ayush-charcoal/10 pt-1 mt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


