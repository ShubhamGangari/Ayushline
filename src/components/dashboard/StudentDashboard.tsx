import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProfile, createOrUpsertProfile } from '../../lib/api/profiles';
import { getApprovedEvents, type EventItem } from '../../lib/api/events';
import { getApprovedDoctors, type Doctor } from '../../lib/api/doctors';
import { Button } from '../ui/Button';
import { BookOpen, GraduationCap, Calendar, User, Save, CheckCircle, MapPin, PenTool, Stethoscope, Star, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAppointment } from '../../lib/api/appointments';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [college, setCollege] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Events & Doctors state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      void getProfile(user.id).then((p) => {
        if (p) {
          setName(p.name || user.name || '');
          setCollege(p.college || '');
          setSpecialization(p.specialization || 'BAMS');
          setWhatsapp(p.whatsapp || '');
          setBio(p.bio || '');
          setAvatarUrl(p.avatar_url || user.avatarUrl || '');
        } else {
          setName(user.name || '');
          setAvatarUrl(user.avatarUrl || '');
        }
      });
    }
  }, [user?.id]);

  useEffect(() => {
    async function loadData() {
      setEventsLoading(true);
      setDoctorsLoading(true);
      const [evts, docs] = await Promise.all([
        getApprovedEvents(),
        getApprovedDoctors(),
      ]);
      setEvents(evts);
      setDoctors(docs);
      setEventsLoading(false);
      setDoctorsLoading(false);
    }
    void loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg('');

    const res = await createOrUpsertProfile(user.id, {
      name,
      email: user.email,
      role: 'student',
      college,
      specialization,
      whatsapp,
      bio,
      avatar_url: avatarUrl,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Student profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedDoctor) return;
    setBookingSaving(true);
    setBookingError('');
    setBookingSuccess('');

    const res = await createAppointment({
      patient_id: user.id,
      patient_name: name || user.name || 'Student',
      patient_email: user.email || '',
      doctor_id: selectedDoctor,
      preferred_date: bookingDate,
      preferred_time: bookingTime,
      message: bookingMessage,
    });

    setBookingSaving(false);
    if (res.success) {
      setBookingSuccess(res.message);
      setBookingDate('');
      setBookingTime('');
      setBookingMessage('');
      setSelectedDoctor(null);
      setShowBooking(false);
      setTimeout(() => setBookingSuccess(''), 5000);
    } else {
      setBookingError(res.message || 'Failed to book appointment.');
    }
  };

  const sampleStudyGuides = [
    { title: 'Charaka Samhita Sutrasthana Index', system: 'Ayurveda', type: 'PDF Guide', date: '2026' },
    { title: 'Therapeutic Yoga Asanas for Spinal Disorders', system: 'Yoga', type: 'Video Seminar', date: '2026' },
    { title: 'Homeopathic Materia Medica Keynotes', system: 'Homeopathy', type: 'Study Sheet', date: '2026' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-ayush-forest to-emerald-800 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <img
              src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=0D9488&color=fff`}
              alt={name}
              className="w-20 h-20 rounded-full border-4 border-ayush-gold object-cover shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=0D9488&color=fff`;
              }}
            />
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-ayush-gold/20 text-ayush-gold text-sm font-bold uppercase tracking-wider mb-2">
                <GraduationCap className="w-4 h-4 mr-1" /> Student Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">{name || 'AYUSH Scholar'}</h1>
              <p className="text-ayush-ivory/80 font-body text-base mt-1">
                {college ? `${college} • ${specialization}` : 'Update your college & specialization below.'}
              </p>
            </div>
          </div>
          <Link
            to="/consult"
            className="px-6 py-3 bg-ayush-gold text-ayush-forest font-ui font-semibold rounded-full hover:bg-white transition-colors shadow-sm text-base"
          >
            Consult Practitioners
          </Link>
        </div>
      </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Study Resources */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
              <h3 className="text-2xl font-display font-bold text-ayush-forest mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-ayush-gold" /> Study Resources & Curricula
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleStudyGuides.map((guide, idx) => (
                  <div key={idx} className="bg-ayush-cream p-4 rounded-2xl shadow-xs border border-ayush-charcoal/5 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-ayush-forest text-white">
                        {guide.system}
                      </span>
                      <p className="font-display font-bold text-ayush-forest text-base mt-2">{guide.title}</p>
                    </div>
                    <p className="text-sm text-ayush-charcoal/60 font-ui mt-3 pt-2 border-t border-ayush-charcoal/10">{guide.type} • {guide.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Doctors */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-display font-bold text-ayush-forest flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-ayush-gold" /> Available Practitioners
                </h3>
                <Link to="/consult" className="text-sm font-bold font-ui text-ayush-forest hover:text-ayush-gold">
                  View All Doctors →
                </Link>
              </div>
              {doctorsLoading ? (
                <p className="text-sm font-ui text-ayush-charcoal/50">Loading doctors...</p>
              ) : doctors.length === 0 ? (
                <p className="text-sm font-ui text-ayush-charcoal/50">No doctors available right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {doctors.slice(0, 4).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-ayush-cream rounded-2xl p-4 border border-ayush-charcoal/5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-ayush-forest/10 flex items-center justify-center text-ayush-forest font-bold text-base flex-shrink-0">
                          {doc.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-ui font-bold text-ayush-forest text-base truncate">{doc.name}</p>
                          <p className="text-sm font-ui text-ayush-charcoal/60">{doc.specialization} • {doc.system}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedDoctor(String(doc.id)); setShowBooking(true); }}
                        className="px-4 py-2 rounded-xl bg-ayush-forest text-white text-sm font-ui font-bold hover:bg-ayush-gold hover:text-ayush-forest transition-colors ml-2 flex-shrink-0"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-display font-bold text-ayush-forest flex items-center gap-2">
                  <Star className="w-6 h-6 text-ayush-gold" /> Upcoming AYUSH Events
                </h3>
                <Link to="/events" className="text-sm font-bold font-ui text-ayush-forest hover:text-ayush-gold">
                  Browse All →
                </Link>
              </div>
              {eventsLoading ? (
                <p className="text-sm font-ui text-ayush-charcoal/50">Loading events...</p>
              ) : events.length === 0 ? (
                <p className="text-sm font-ui text-ayush-charcoal/50">No upcoming events listed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.slice(0, 4).map((evt) => (
                    <div key={evt.id} className="bg-ayush-cream rounded-2xl p-4 border border-ayush-charcoal/5 flex flex-col justify-between space-y-2">
                      <div>
                        <p className="font-ui font-bold text-ayush-forest text-base">{evt.title}</p>
                        <p className="text-sm font-ui text-ayush-charcoal/60 mt-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-ayush-gold" /> {evt.event_date || evt.date}
                        </p>
                        <p className="text-sm font-ui text-ayush-charcoal/60 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-ayush-gold" /> {evt.location}
                        </p>
                      </div>
                      <Link to="/events" className="text-sm font-bold text-ayush-forest hover:underline pt-2 border-t border-ayush-charcoal/10 inline-block">
                        View Event Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-ayush-forest rounded-3xl p-6 text-white shadow-sm">
              <h3 className="text-xl font-display font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => setShowBooking(!showBooking)} className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-base font-ui font-semibold">
                  <Calendar className="w-5 h-5 text-ayush-gold" /> {showBooking ? 'Close Booking Form' : 'Book Appointment'}
                </button>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-base font-ui font-semibold">
                  <User className="w-5 h-5 text-ayush-gold" /> Edit Profile Details
                </Link>
                <Link to="/submit-content" className="flex items-center gap-3 px-4 py-3.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-base font-ui font-semibold">
                  <PenTool className="w-5 h-5 text-ayush-gold" /> Publish Your Research
                </Link>
                <Link to="/events" className="flex items-center gap-3 px-4 py-3.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-base font-ui font-semibold">
                  <Star className="w-5 h-5 text-ayush-gold" /> View All Events
                </Link>
              </div>
            </div>

            {/* Booking Form */}
            {showBooking && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
                <h3 className="text-xl font-display font-bold text-ayush-forest mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ayush-gold" /> Book Consultation
                </h3>
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Select Doctor</label>
                    <select value={selectedDoctor || ''} onChange={(e) => setSelectedDoctor(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-ayush-forest/20 font-ui text-base focus:ring-2 focus:ring-ayush-gold bg-white">
                      <option value="">Choose a doctor...</option>
                      {doctors.map(d => (
                        <option key={d.id} value={String(d.id)}>{d.name} — {d.specialization}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Date</label>
                      <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-ayush-forest/20 font-ui text-base focus:ring-2 focus:ring-ayush-gold bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Time</label>
                      <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-ayush-forest/20 font-ui text-base focus:ring-2 focus:ring-ayush-gold bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Message</label>
                    <textarea value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} rows={2} placeholder="Describe your concern..." className="w-full px-3.5 py-2.5 rounded-xl border border-ayush-forest/20 font-ui text-base focus:ring-2 focus:ring-ayush-gold bg-white resize-none" />
                  </div>
                  {bookingError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-ui flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {bookingError}
                    </div>
                  )}
                  {bookingSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-ui flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {bookingSuccess}
                    </div>
                  )}
                  <Button type="submit" variant="primary" className="w-full py-3" disabled={bookingSaving}>
                    {bookingSaving ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
