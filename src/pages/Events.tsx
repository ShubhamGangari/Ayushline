import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Megaphone, PlusCircle, CheckCircle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getApprovedEvents, createEvent, registerForEvent, unregisterFromEvent, isUserRegisteredForEvent, type EventItem } from '../lib/api/events';
import { useAuth } from '../hooks/useAuth';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [regUpdates, setRegUpdates] = useState(0);

  const userEmail = user?.email || 'user@ayushline.gov.in';

  useEffect(() => {
    async function loadEventsData() {
      const data = await getApprovedEvents();
      setEvents(data);
    }
    loadEventsData();
  }, []);

  const handleRegisterToggle = (eventItem: EventItem) => {
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
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Seminar');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newDate && newLocation && newDesc) {
      setLoading(true);
      const res = await createEvent({
        title: newTitle,
        type: newType,
        event_date: newDate,
        location: newLocation,
        description: newDesc,
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
    }
  };

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            onClick={() => setShowForm(!showForm)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-forest/5 hover:shadow-lg transition-all flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-ayush-gold/10 rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
              
              <div className="relative z-10 flex-grow">
                <span className="inline-block px-3 py-1 rounded-full bg-ayush-sage text-ayush-forest font-ui text-xs font-bold uppercase tracking-wider mb-4 border border-ayush-forest/10">
                  {event.type}
                </span>
                
                <h3 className="text-2xl font-display font-bold text-ayush-forest mb-4 leading-tight group-hover:text-ayush-gold transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-ayush-charcoal/80 font-ui text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-ayush-gold" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-ayush-charcoal/80 font-ui text-sm">
                    <MapPin className="w-4 h-4 mr-3 text-ayush-gold" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-ayush-charcoal/80 font-ui text-sm">
                    <Users className="w-4 h-4 mr-3 text-ayush-gold" />
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
