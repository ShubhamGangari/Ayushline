import React, { useEffect, useState } from 'react';
import { Stethoscope, FileText, Calendar, CheckCircle2, Clock, Users } from 'lucide-react';
import { getAllDoctorsAdmin } from '../../lib/api/doctors';
import { getAllPostsAdmin } from '../../lib/api/posts';
import { getAllEventsAdmin } from '../../lib/api/events';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [pendingDoctors, setPendingDoctors] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);
  const [pendingEvents, setPendingEvents] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const doctors = await getAllDoctorsAdmin();
      const posts = await getAllPostsAdmin();
      const events = await getAllEventsAdmin();

      setPendingDoctors(doctors.filter(d => d.status === 'pending').length);
      setPendingPosts(posts.filter(p => p.status === 'pending').length);
      setPendingEvents(events.filter(e => e.status === 'pending').length);

      try {
        const raw = localStorage.getItem('ayush_registered_users_v2');
        setTotalUsers(raw ? JSON.parse(raw).length : 0);
      } catch {
        setTotalUsers(0);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-ayush-forest">Admin Dashboard</h1>
        <p className="text-ayush-charcoal/70 font-body text-sm mt-1">
          Welcome to the Ayushline Control Panel. Approve pending doctors, moderate articles and manage events.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-800 font-ui text-sm">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Demo Mode Active:</strong> Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are not set yet. All data is running with local fallback state. Run `supabase_schema.sql` in your Supabase project once ready.
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/doctors" className="bg-white p-6 rounded-2xl border border-ayush-forest/10 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            {pendingDoctors > 0 ? (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-ui">
                {pendingDoctors} Pending
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-ui flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Clear
              </span>
            )}
          </div>
          <h3 className="text-2xl font-display font-bold text-ayush-forest group-hover:text-ayush-gold">Doctor Applications</h3>
          <p className="text-xs font-ui text-ayush-charcoal/60 mt-1">Review practitioner registrations</p>
        </Link>

        <Link to="/admin/posts" className="bg-white p-6 rounded-2xl border border-ayush-forest/10 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            {pendingPosts > 0 ? (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-ui">
                {pendingPosts} Pending
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-ui flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Clear
              </span>
            )}
          </div>
          <h3 className="text-2xl font-display font-bold text-ayush-forest group-hover:text-ayush-gold">Articles & Content</h3>
          <p className="text-xs font-ui text-ayush-charcoal/60 mt-1">Moderate submitted articles & blogs</p>
        </Link>

        <Link to="/admin/events" className="bg-white p-6 rounded-2xl border border-ayush-forest/10 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            {pendingEvents > 0 ? (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-ui">
                {pendingEvents} Pending
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-ui flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Clear
              </span>
            )}
          </div>
          <h3 className="text-2xl font-display font-bold text-ayush-forest group-hover:text-ayush-gold">Events & Seminars</h3>
          <p className="text-xs font-ui text-ayush-charcoal/60 mt-1">Approve community events</p>
        </Link>

        <Link to="/admin/users" className="bg-white p-6 rounded-2xl border border-ayush-forest/10 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-ui">
              {totalUsers} Registered
            </span>
          </div>
          <h3 className="text-2xl font-display font-bold text-ayush-forest group-hover:text-ayush-gold">User Accounts</h3>
          <p className="text-xs font-ui text-ayush-charcoal/60 mt-1">Manage user profiles & roles</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
