import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, type UserRole } from '../lib/api/profiles';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { PractitionerDashboard } from '../components/dashboard/PractitionerDashboard';
import { OrganizationDashboard } from '../components/dashboard/OrganizationDashboard';
import {
  getUserAppointments,
  cancelAppointment,
  type Appointment
} from '../lib/api/appointments';
import {
  getUserRegisteredEvents,
  unregisterFromEvent,
  type UserEventRegistration
} from '../lib/api/events';
import {
  GraduationCap,
  Stethoscope,
  Building2,
  Loader2,
  User,
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  PlusCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Filter
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface DashboardProps {
  defaultTab?: 'overview' | 'consultations' | 'events';
}

export const Dashboard = ({ defaultTab }: DashboardProps) => {
  const { user, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Determine current active tab
  const tabFromQuery = searchParams.get('tab') as 'overview' | 'consultations' | 'events' | null;
  const initialTab = defaultTab || tabFromQuery || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'events'>(initialTab);

  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // User Specific Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<UserEventRegistration[]>([]);
  const [consultFilter, setConsultFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const userEmail = user?.email || 'user@ayushline.gov.in';

  // Sync tab with URL parameter changes
  useEffect(() => {
    if (tabFromQuery && (tabFromQuery === 'overview' || tabFromQuery === 'consultations' || tabFromQuery === 'events')) {
      setActiveTab(tabFromQuery);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabFromQuery, defaultTab]);

  const changeTab = (tab: 'overview' | 'consultations' | 'events') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Load profile & role
  useEffect(() => {
    if (user?.id) {
      void getProfile(user.id).then((p) => {
        const profileRole = p?.role;
        const authRole = user.role as UserRole;
        // Prefer the profile role unless it is the generic 'user' while the
        // auth metadata carries a more specific role (doctor/student/org).
        const role =
          profileRole && profileRole !== 'user'
            ? profileRole
            : authRole || 'student';
        setActiveRole(role);
        setLoading(false);
      });
    } else if (user) {
      setActiveRole((user.role as UserRole) || 'student');
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // Load user specific appointments & events
  const loadUserData = async () => {
    const appts = await getUserAppointments(userEmail);
    setAppointments(appts);

    const evs = getUserRegisteredEvents(userEmail);
    setRegisteredEvents(evs);
  };

  useEffect(() => {
    void loadUserData();

    const handleApptUpdate = () => void loadUserData();
    const handleEventUpdate = () => void loadUserData();

    window.addEventListener('ayush_appointments_update', handleApptUpdate);
    window.addEventListener('ayush_events_update', handleEventUpdate);

    return () => {
      window.removeEventListener('ayush_appointments_update', handleApptUpdate);
      window.removeEventListener('ayush_events_update', handleEventUpdate);
    };
  }, [userEmail]);

  const handleCancelAppointment = async (id: string | number) => {
    if (confirm('Are you sure you want to cancel this appointment request?')) {
      await cancelAppointment(id);
      setActionMessage('Appointment request cancelled.');
      await loadUserData();
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleUnregisterEvent = (eventId: string | number, eventTitle: string) => {
    if (confirm(`Unregister from "${eventTitle}"?`)) {
      unregisterFromEvent(eventId, userEmail);
      setActionMessage(`Unregistered from "${eventTitle}".`);
      void loadUserData();
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-ayush-gold animate-spin mx-auto mb-3" />
          <p className="text-ayush-charcoal/60 font-ui text-sm font-semibold">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = activeRole === 'admin';

  // Filter user appointments
  const filteredAppointments = appointments.filter((a) => {
    if (consultFilter === 'pending') return a.status === 'pending';
    if (consultFilter === 'confirmed') return a.status === 'confirmed';
    if (consultFilter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div className="bg-ayush-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-ayush-charcoal/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-ayush-forest text-ayush-gold font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display font-bold text-3xl text-ayush-forest">{user?.name || 'User'}</h1>
                {isAdmin && (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base font-ui text-ayush-charcoal/60 font-semibold">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              to="/profile"
              className="px-5 py-3 rounded-xl bg-ayush-cream text-ayush-forest border border-ayush-forest/20 font-ui font-bold text-sm flex items-center gap-2 hover:bg-ayush-sage transition-all"
            >
              <User className="w-4 h-4 text-ayush-gold" /> Edit Profile
            </Link>
            <button
              onClick={() => {
                if (signOut) void signOut();
                window.location.href = '/';
              }}
              className="px-5 py-3 rounded-xl border border-rose-200 text-rose-600 font-ui font-bold text-sm flex items-center gap-2 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Global Action Message Banner */}
        {actionMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center justify-between font-ui text-base animate-fade-in shadow-xs">
            <span className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {actionMessage}
            </span>
            <button onClick={() => setActionMessage(null)} className="text-sm font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-ayush-charcoal/10 shadow-xs">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => changeTab('overview')}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-ui font-bold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-ayush-forest text-white shadow-sm'
                  : 'text-ayush-charcoal/70 hover:text-ayush-forest hover:bg-ayush-cream/60'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => changeTab('consultations')}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-ui font-bold text-sm flex items-center justify-center gap-2 transition-all relative whitespace-nowrap ${
                activeTab === 'consultations'
                  ? 'bg-ayush-forest text-white shadow-sm'
                  : 'text-ayush-charcoal/70 hover:text-ayush-forest hover:bg-ayush-cream/60'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>My Consultations</span>
              {appointments.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'consultations' ? 'bg-ayush-gold text-ayush-forest' : 'bg-ayush-sage text-ayush-forest'}`}>
                  {appointments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => changeTab('events')}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-ui font-bold text-sm flex items-center justify-center gap-2 transition-all relative whitespace-nowrap ${
                activeTab === 'events'
                  ? 'bg-ayush-forest text-white shadow-sm'
                  : 'text-ayush-charcoal/70 hover:text-ayush-forest hover:bg-ayush-cream/60'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>AYUSH Events</span>
              {registeredEvents.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'events' ? 'bg-ayush-gold text-ayush-forest' : 'bg-ayush-sage text-ayush-forest'}`}>
                  {registeredEvents.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-ayush-charcoal/50 font-ui pr-3">
            <span>Role: <strong className="text-ayush-forest uppercase">{activeRole || 'User'}</strong></span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div
                onClick={() => changeTab('consultations')}
                className="bg-white p-6 md:p-7 rounded-3xl border border-ayush-charcoal/10 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-ayush-forest transition-colors" />
                </div>
                <p className="text-4xl font-display font-bold text-ayush-forest">{appointments.length}</p>
                <p className="text-sm font-ui text-ayush-charcoal/60 font-semibold mt-1.5">My Booked Consultations</p>
              </div>

              <div
                onClick={() => changeTab('events')}
                className="bg-white p-6 md:p-7 rounded-3xl border border-ayush-charcoal/10 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-ayush-forest transition-colors" />
                </div>
                <p className="text-4xl font-display font-bold text-ayush-forest">{registeredEvents.length}</p>
                <p className="text-sm font-ui text-ayush-charcoal/60 font-semibold mt-1.5">Registered AYUSH Events</p>
              </div>

              <div
                onClick={() => window.location.href = '/profile'}
                className="bg-white p-6 md:p-7 rounded-3xl border border-ayush-charcoal/10 shadow-xs hover:shadow-md transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-ayush-forest transition-colors" />
                </div>
                <p className="text-xl font-display font-bold text-ayush-forest truncate">{user?.name || 'User Profile'}</p>
                <p className="text-sm font-ui text-ayush-charcoal/60 font-semibold mt-1.5">Edit Account & Settings</p>
              </div>
            </div>

            {/* Admin Switcher if Admin */}
            {isAdmin && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-ayush-charcoal/10 shadow-xs">
                <span className="font-ui font-bold text-ayush-forest text-base">Admin View Selector:</span>
                <div className="flex flex-wrap gap-2">
                  {(['student', 'doctor', 'org'] as UserRole[]).map((r) => {
                    const icons = { student: <GraduationCap className="w-4 h-4" />, doctor: <Stethoscope className="w-4 h-4" />, org: <Building2 className="w-4 h-4" /> };
                    const labels = { student: 'Student Portal', doctor: 'Doctor Portal', org: 'Institution Portal' };
                    return (
                      <button
                        key={r}
                        onClick={() => setActiveRole(r)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-ui font-bold flex items-center gap-1.5 transition-all ${
                          activeRole === r ? 'bg-ayush-forest text-white shadow-xs' : 'bg-ayush-cream text-ayush-forest hover:bg-ayush-sage'
                        }`}
                      >
                        {icons[r as keyof typeof icons]} {labels[r as keyof typeof labels]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role Portal Component */}
            {activeRole === 'doctor' ? (
              <PractitionerDashboard />
            ) : activeRole === 'org' ? (
              <OrganizationDashboard />
            ) : (
              <StudentDashboard />
            )}
          </div>
        )}

        {/* TAB 2: MY CONSULTATIONS */}
        {activeTab === 'consultations' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Filter Controls */}
            <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-ayush-charcoal/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Stethoscope className="w-6 h-6 text-ayush-gold" />
                  <h2 className="text-3xl font-display font-bold text-ayush-forest">My Consultations</h2>
                </div>
                <p className="text-sm md:text-base text-ayush-charcoal/60 font-ui font-medium">
                  View and manage all doctor appointments requested or scheduled by you.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending ⏳' },
                  { id: 'confirmed', label: 'Confirmed ✅' },
                  { id: 'cancelled', label: 'Cancelled ❌' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setConsultFilter(f.id as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      consultFilter === f.id
                        ? 'bg-ayush-forest text-white shadow-xs'
                        : 'bg-ayush-cream text-ayush-charcoal/70 hover:text-ayush-forest'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                
                <Link
                  to="/consult"
                  className="px-5 py-2.5 rounded-xl bg-ayush-gold text-ayush-forest font-bold text-sm flex items-center gap-1.5 hover:bg-opacity-90 transition-all shadow-xs ml-auto md:ml-2"
                >
                  <PlusCircle className="w-4 h-4" /> Book New Consultation
                </Link>
              </div>
            </div>

            {/* Consultations List / Empty State */}
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-ayush-charcoal/10 shadow-xs max-w-2xl mx-auto space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-display font-bold text-ayush-forest">No Consultations Till Now</h3>
                <p className="text-base font-body text-ayush-charcoal/70 max-w-md mx-auto leading-relaxed">
                  You have not booked any AYUSH doctor consultations yet. Connect with qualified Ayurvedic, Homeopathic, Unani, Siddha, and Yoga specialists for personalized advice.
                </p>
                <div className="pt-2">
                  <Link
                    to="/consult"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ayush-forest text-white font-bold text-base hover:bg-ayush-gold hover:text-ayush-forest transition-all shadow-md"
                  >
                    <Search className="w-4 h-4" /> Find Doctors & Book Consultation
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAppointments.map((appt) => {
                  const isPending = appt.status === 'pending';
                  const isConfirmed = appt.status === 'confirmed';
                  const isCancelled = appt.status === 'cancelled';

                  return (
                    <div
                      key={appt.id}
                      className="bg-white rounded-3xl p-6 border border-ayush-charcoal/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs uppercase font-bold tracking-wider text-ayush-charcoal/50 bg-ayush-cream px-3 py-1 rounded-full border border-ayush-charcoal/5">
                            Consultation Request
                          </span>

                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                              <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Confirmation
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-sm font-bold">
                              <XCircle className="w-4 h-4 text-rose-600" /> Cancelled
                            </span>
                          )}
                        </div>

                        {/* Doctor & Details */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-ayush-sage text-ayush-forest font-bold text-xl flex items-center justify-center flex-shrink-0">
                            👨‍⚕️
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-xl text-ayush-forest">
                              Dr. {appt.doctor_name || 'AYUSH Practitioner'}
                            </h3>
                            <p className="text-sm text-ayush-gold font-bold font-ui">Certified Practitioner</p>
                          </div>
                        </div>

                        {/* Schedule Box */}
                        <div className="bg-ayush-cream/50 rounded-2xl p-4 space-y-2.5 text-sm font-ui text-ayush-charcoal/80 mb-3 border border-ayush-charcoal/5">
                          <div className="flex items-center justify-between">
                            <span className="text-ayush-charcoal/60">Preferred Date:</span>
                            <span className="font-bold text-ayush-forest">{appt.preferred_date || 'TBD'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ayush-charcoal/60">Preferred Time:</span>
                            <span className="font-bold text-ayush-forest">{appt.preferred_time || 'TBD'}</span>
                          </div>
                          {appt.message && (
                            <div className="pt-2.5 border-t border-ayush-charcoal/10">
                              <span className="text-ayush-charcoal/60 block mb-0.5">Health Concern / Note:</span>
                              <p className="italic text-ayush-charcoal/80 line-clamp-2">"{appt.message}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-ayush-charcoal/10">
                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Cancel
                          </button>
                        )}
                        <Link
                          to="/consult"
                          className="px-4 py-2 rounded-xl bg-ayush-forest text-white font-bold text-sm hover:bg-ayush-gold hover:text-ayush-forest transition-all"
                        >
                          Book Another
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AYUSH EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-ayush-charcoal/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-6 h-6 text-ayush-gold" />
                  <h2 className="text-3xl font-display font-bold text-ayush-forest">My Registered AYUSH Events</h2>
                </div>
                <p className="text-sm md:text-base text-ayush-charcoal/60 font-ui font-medium">
                  Seminars, therapeutic workshops, and webinars you have reserved a spot for.
                </p>
              </div>

              <Link
                to="/events"
                className="px-5 py-2.5 rounded-xl bg-ayush-forest text-white font-bold text-sm flex items-center gap-1.5 hover:bg-ayush-gold hover:text-ayush-forest transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4" /> Browse All Events
              </Link>
            </div>

            {/* Events List / Empty State */}
            {registeredEvents.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-ayush-charcoal/10 shadow-xs max-w-2xl mx-auto space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                  <Calendar className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-display font-bold text-ayush-forest">No Registered Events Till Now</h3>
                <p className="text-base font-body text-ayush-charcoal/70 max-w-md mx-auto leading-relaxed">
                  You haven't registered for any AYUSH events or webinars yet. Discover upcoming summits, therapeutic yoga retreats, and traditional medical seminars.
                </p>
                <div className="pt-2">
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ayush-forest text-white font-bold text-base hover:bg-ayush-gold hover:text-ayush-forest transition-all shadow-md"
                  >
                    <Calendar className="w-4 h-4" /> Explore AYUSH Events
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEvents.map((ev) => (
                  <div
                    key={ev.eventId}
                    className="bg-white rounded-3xl p-6 border border-ayush-charcoal/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full bg-ayush-sage text-ayush-forest font-ui text-xs font-bold uppercase tracking-wider">
                          {ev.eventType}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered
                        </span>
                      </div>

                      <h3 className="text-2xl font-display font-bold text-ayush-forest mb-3 leading-tight">
                        {ev.eventTitle}
                      </h3>

                      <div className="space-y-2.5 text-sm font-ui text-ayush-charcoal/70 mb-4 bg-ayush-cream/40 p-4 rounded-2xl">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-ayush-gold" />
                          <span className="font-bold text-ayush-forest">{ev.eventDate}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-ayush-gold" />
                          <span>{ev.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-ayush-charcoal/10 flex items-center justify-between">
                      <button
                        onClick={() => handleUnregisterEvent(ev.eventId, ev.eventTitle)}
                        className="text-sm font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Registration
                      </button>

                      <Link
                        to="/events"
                        className="text-sm font-bold text-ayush-forest hover:text-ayush-gold flex items-center gap-0.5"
                      >
                        View Event <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
