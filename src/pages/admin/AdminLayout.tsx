import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Stethoscope, FileText, Calendar, Home, ArrowLeft, Users } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

const AdminLayout: React.FC = () => {
  const { isAdmin, isLoaded } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-ayush-forest/10">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-ayush-forest mb-2">Access Denied</h1>
          <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
            You do not have administrator permissions to access this area.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-ayush-forest text-white py-3 rounded-full font-ui font-semibold flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Website
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <Home className="w-5 h-5" /> },
    { label: 'Doctors Approval', path: '/admin/doctors', icon: <Stethoscope className="w-5 h-5" /> },
    { label: 'Articles & Content', path: '/admin/posts', icon: <FileText className="w-5 h-5" /> },
    { label: 'Events & Seminars', path: '/admin/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'User Accounts', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-ayush-ivory flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ayush-forest text-ayush-ivory flex-shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-xl text-ayush-gold">AYUSHLINE</span>
            <span className="block text-xs font-ui text-ayush-ivory/60 uppercase tracking-widest mt-0.5">Admin Portal</span>
          </div>
          <Link to="/" className="text-xs font-ui text-ayush-gold hover:underline flex items-center">
            View Site
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl font-ui text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-ayush-gold text-ayush-forest shadow-md'
                    : 'text-ayush-ivory/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
