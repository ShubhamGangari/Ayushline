import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProfile, createOrUpsertProfile } from '../../lib/api/profiles';
import { Button } from '../ui/Button';
import { Building2, Save, CheckCircle, Plus, Trash2, Users, Calendar, ShieldCheck, XCircle } from 'lucide-react';
import { getEvents, createEvent, deleteEvent, type Event } from '../../lib/api/events';

interface Attendee {
  id: string;
  name: string;
  email: string;
  eventTitle: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Event Creation State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('Webinar');
  const [hosting, setHosting] = useState(false);
  const [eventSuccess, setEventSuccess] = useState('');

  // Organization Hosted Events
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);

  // Sample Attendees State
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: '1', name: 'Dr. Vivek Sharma', email: 'vivek@ayush.org', eventTitle: 'National Panchakarma Symposium 2026', status: 'Pending' },
    { id: '2', name: 'Kavita Patel', email: 'kavita@gmail.com', eventTitle: 'Yoga & Mental Health Workshop', status: 'Approved' },
    { id: '3', name: 'Amit Singh', email: 'amit@student.in', eventTitle: 'National Panchakarma Symposium 2026', status: 'Pending' },
  ]);

  useEffect(() => {
    if (user?.id) {
      void getProfile(user.id).then((p) => {
        if (p) {
          setName(p.name || user.name || '');
          setAccreditation(p.accreditation || 'Ministry of AYUSH Recognized');
          setCity(p.city || '');
          setWhatsapp(p.whatsapp || '919876543210');
          setPhone(p.phone || '');
          setBio(p.bio || '');
          setAvatarUrl(p.avatar_url || user.avatarUrl || '');
        } else {
          setName(user.name || '');
          setAvatarUrl(user.avatarUrl || '');
        }
      });
    }

    void loadEvents();
  }, [user?.id]);

  const loadEvents = async () => {
    const eventsData = await getEvents();
    setHostedEvents(eventsData);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg('');

    const res = await createOrUpsertProfile(user.id, {
      name,
      email: user.email,
      role: 'org',
      accreditation,
      city,
      whatsapp,
      phone,
      bio,
      avatar_url: avatarUrl,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Institution details saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventDescription.trim()) return;
    setHosting(true);
    setEventSuccess('');

    const res = await createEvent({
      title: eventTitle,
      date: eventDate,
      location: eventLocation || 'Online Webinar',
      description: eventDescription,
      organizer: name || user?.name || 'AYUSH Institution',
      type: eventType,
    });

    setHosting(false);
    if (res.success && res.data) {
      setHostedEvents([res.data, ...hostedEvents]);
      setEventSuccess('Event hosted successfully!');
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      setEventDescription('');
      setTimeout(() => setEventSuccess(''), 3000);
    }
  };

  const handleDeleteHostedEvent = async (eventId: string | number) => {
    if (!window.confirm('Are you sure you want to remove/delete this event?')) return;
    await deleteEvent(eventId);
    setHostedEvents((prev) => prev.filter((ev) => String(ev.id) !== String(eventId)));
  };

  const updateAttendeeStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setAttendees((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Organization Banner */}
      <div className="bg-gradient-to-r from-ayush-forest via-slate-900 to-emerald-950 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <img
              src={avatarUrl || `https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80`}
              alt={name}
              className="w-20 h-20 rounded-full border-4 border-ayush-gold object-cover shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Organization')}&background=2d5a27&color=fff&size=150`;
              }}
            />
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-ayush-gold/20 text-ayush-gold text-sm font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4 mr-1" /> Institution Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">{name || 'AYUSH Institution'}</h1>
              <p className="text-ayush-ivory/80 font-body text-base mt-1">
                {accreditation} • {city || 'National Campus'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="#host-event"
              className="px-6 py-3 bg-ayush-gold text-ayush-forest font-ui font-semibold rounded-full hover:bg-white transition-colors shadow-sm flex items-center gap-2 text-base"
            >
              <Plus className="w-4 h-4" /> Host New Event
            </a>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Hosted Events & Host New Event Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host New Event Form */}
          <div id="host-event" className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
            <h2 className="text-3xl font-display font-bold text-ayush-forest mb-6 flex items-center gap-2">
              <Plus className="w-7 h-7 text-ayush-gold" /> Host New Event / Webinar
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Event Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. National Conference on Herbal Medicine"
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Event Date & Time</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. August 25, 2026 • 10:00 AM"
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Venue / Online Link</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Zoom Webinar / Main Auditorium"
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                  />
                </div>

                <div>
                  <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                  >
                    <option value="Webinar">Online Webinar</option>
                    <option value="Conference">National Conference</option>
                    <option value="Workshop">Hands-on Workshop</option>
                    <option value="Exhibition">Expo & Exhibition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Event Description & Agenda</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={4}
                  placeholder="Detail key speakers, topics, registration requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm resize-none"
                  required
                ></textarea>
              </div>

              {eventSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-ui flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{eventSuccess}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="py-3 px-6" disabled={hosting}>
                {hosting ? 'Publishing Event...' : 'Publish Event'}
              </Button>
            </form>
          </div>

          {/* Hosted Events List with Delete Action */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
            <h2 className="text-3xl font-display font-bold text-ayush-forest mb-6 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-ayush-gold" /> Managed Events ({hostedEvents.length})
            </h2>

            <div className="space-y-4">
              {hostedEvents.map((ev) => (
                <div key={ev.id} className="p-5 rounded-2xl border border-ayush-charcoal/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ayush-ivory/30">
                  <div>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-ayush-forest text-white">
                      {ev.organizer || 'Hosted'}
                    </span>
                    <h3 className="font-display font-bold text-xl text-ayush-forest mt-1">{ev.title}</h3>
                    <p className="text-sm font-ui text-ayush-charcoal/70">{ev.date} • {ev.location}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteHostedEvent(ev.id)}
                    className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-ui text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5 self-start md:self-auto"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Event
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Attendees & Moderation */}
        <div className="space-y-6">
          {/* Attendees Approval Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
            <h3 className="text-2xl font-display font-bold text-ayush-forest mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-ayush-gold" /> Participant Applications
            </h3>

            <div className="space-y-4">
              {attendees.map((att) => (
                <div key={att.id} className="p-4 rounded-2xl bg-ayush-cream/50 border border-ayush-forest/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-ui font-bold text-base text-ayush-forest">{att.name}</p>
                    <span
                      className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${
                        att.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : att.status === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                  <p className="text-sm font-ui text-ayush-charcoal/60">{att.email}</p>
                  <p className="text-sm font-body text-ayush-forest font-semibold">{att.eventTitle}</p>

                  <div className="flex gap-2 pt-1">
                    {att.status !== 'Approved' && (
                      <button
                        onClick={() => updateAttendeeStatus(att.id, 'Approved')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-ui text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {att.status !== 'Rejected' && (
                      <button
                        onClick={() => updateAttendeeStatus(att.id, 'Rejected')}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-ui text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
