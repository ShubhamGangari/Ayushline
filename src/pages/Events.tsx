import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, Megaphone, PlusCircle, CheckCircle, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getApprovedEvents, createEvent, registerForEvent, unregisterFromEvent, isUserRegisteredForEvent, type EventItem } from '../lib/api/events';
import { uploadImage } from '../lib/uploadImage';
import { useAuth } from '../hooks/useAuth';
import { AuthRequiredModal } from '../components/auth/AuthRequiredModal';

const Events = () => {
  const { user, isSignedIn } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [regUpdates, setRegUpdates] = useState(0);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Seminar');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerError, setBannerError] = useState('');
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('');

  const requireAuth = (action: string, callback?: () => void) => {
    if (!isSignedIn) {
      setAuthActionName(action);
      setAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const userEmail = user?.email || 'user@ayushline.gov.in';

  useEffect(() => {
    async function loadEventsData() {
      const data = await getApprovedEvents();
      setEvents(data);
    }
    loadEventsData();
  }, [regUpdates]);

  const handleRegisterToggle = (eventItem: EventItem) => {
    if (!requireAuth('register for events')) return;
    const registered = isUserRegisteredForEvent(eventItem.id, userEmail);
    if (registered) {
      unregisterFromEvent(eventItem.id, userEmail);
      setMessage(`Unregistered from "${eventItem.title}".`);
    } else {
      const res = registerForEvent(eventItem, userEmail);
      setMessage(res.message);
    }
    setRegUpdates(prev => prev + 1);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerError('');
    try {
      const res = await uploadImage(file, 'events', 1000, 600, 0.85);
      setBannerUrl(res.url);
    } catch (err: any) {
      setBannerError(err.message || 'Image size exceeds 2MB limit.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('post a new event')) return;
    if (newTitle && newDate && newLocation && newDesc) {
      setLoading(true);
      const res = await createEvent({
        title: newTitle,
        type: newType,
        event_date: newDate,
        location: newLocation,
        description: newDesc,
        banner_url: bannerUrl,
      });
      setLoading(false);
      setMessage(res.message);
      setShowForm(false);
      // Reset form
      setNewTitle('');
      setNewType('Seminar');
      setNewDate('');
      setNewLocation('');
      setNewDesc('');
      setBannerUrl('');
      // Reload events
      const data = await getApprovedEvents();
      setEvents(data);
    }
  };

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={authActionName}
      />
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ayush-sage text-ayush-forest mb-4">
            <Megaphone className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ayush-forest mb-4">
            Announcements & Events
          </h1>
          {message && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl max-w-xl mx-auto flex items-center justify-between font-ui text-sm">
              <span className="flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> {message}</span>
              <button onClick={() => setMessage('')} className="text-xs font-bold hover:underline">Dismiss</button>
            </div>
          )}
          
          <Button 
            variant="primary" 
            onClick={() => requireAuth('post a new event', () => setShowForm(!showForm))}
            className="inline-flex items-center"
          >
            {showForm ? 'Cancel' : <><PlusCircle className="w-5 h-5 mr-2" /> Post an Event</>}
          </Button>
        </div>

        {/* Create Event Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-ayush-forest/10 max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6 border-b border-ayush-forest/10 pb-4">
              Host a New Event
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Event Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    placeholder="e.g. Yoga Retreat 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                  >
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Conference">Conference</option>
                    <option value="Retreat">Retreat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Date & Time</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    placeholder="e.g. October 12, 2026 | 10:00 AM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Location / Link</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    placeholder="e.g. Zoom Link or City"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Event Banner Image (Optional, Max 2MB)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-ayush-ivory/50 p-4 rounded-xl border border-ayush-forest/20">
                  {bannerUrl ? (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-ayush-forest/20 flex-shrink-0">
                      <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBannerUrl('')}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-red-600"
                        title="Remove banner"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-20 rounded-xl bg-ayush-sage/40 flex items-center justify-center text-ayush-forest/50 flex-shrink-0">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-4 py-2 bg-ayush-forest text-white text-xs font-ui font-bold rounded-xl hover:bg-ayush-gold hover:text-ayush-forest transition-colors inline-flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4" /> Upload Event Poster/Banner
                    </button>
                    <p className="text-xs text-ayush-charcoal/60 font-ui">Supports JPG, PNG (Max 2MB). Auto-compressed.</p>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                  </div>
                </div>
                {bannerError && (
                  <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {bannerError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Event Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui resize-none min-h-[100px]"
                  placeholder="What will attendees learn? Who is the speaker?"
                  required
                ></textarea>
              </div>
              <Button type="submit" variant="primary" className="w-full justify-center py-4 text-lg" disabled={loading}>
                {loading ? 'Publishing Event...' : 'Publish Event'}
              </Button>
            </form>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl p-0 shadow-sm border border-ayush-forest/10 hover:shadow-xl transition-all flex flex-col h-full group relative overflow-hidden">
              {event.banner_url ? (
                <div className="w-full h-48 overflow-hidden relative">
                  <img
                    src={event.banner_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-ayush-forest font-ui text-xs font-bold uppercase tracking-wider shadow-sm">
                      {event.type}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 pb-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-ayush-sage text-ayush-forest font-ui text-xs font-bold uppercase tracking-wider mb-2 border border-ayush-forest/10">
                    {event.type}
                  </span>
                </div>
              )}
              
              <div className="p-8 pt-5 relative z-10 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-ayush-forest mb-4 leading-tight group-hover:text-ayush-gold transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-ayush-charcoal/80 font-ui text-sm">
                      <Calendar className="w-4 h-4 mr-3 text-ayush-gold flex-shrink-0" />
                      {event.date || event.event_date}
                    </div>
                    <div className="flex items-center text-ayush-charcoal/80 font-ui text-sm">
                      <MapPin className="w-4 h-4 mr-3 text-ayush-gold flex-shrink-0" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-ayush-charcoal/80 font-ui text-sm">
                      <Users className="w-4 h-4 mr-3 text-ayush-gold flex-shrink-0" />
                      {event.attendees === 0 ? 'Be the first to join' : `${event.attendees} Attending`}
                    </div>
                  </div>
                  
                  <p className="font-body text-ayush-charcoal/70 line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-ayush-forest/10 relative z-10">
                  {isUserRegisteredForEvent(event.id, userEmail) ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleRegisterToggle(event)}
                      className="w-full justify-center bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all"
                    >
                      <Check className="w-4 h-4 mr-2 text-emerald-600" /> Registered (Click to Cancel)
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleRegisterToggle(event)}
                      className="w-full justify-center group-hover:bg-ayush-forest group-hover:text-ayush-cream font-bold"
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
