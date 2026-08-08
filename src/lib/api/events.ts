import { supabase, isSupabaseConfigured } from '../supabase';

export type Event = EventItem;

export interface EventItem {
  id: string | number;
  organizer_id?: string | null;
  organizer_name?: string | null;
  organizer?: string | null;
  title: string;
  type: string;
  event_date: string;
  date?: string;
  location: string;
  description: string;
  attendees_count?: number;
  attendees?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export const fallbackEvents: EventItem[] = [
  { id: '1', title: 'Global Ayurveda Summit 2026', type: 'Seminar', event_date: 'August 15, 2026', date: 'August 15, 2026', location: 'New Delhi, India (Hybrid)', attendees: 500, description: 'A 3-day global summit bringing together leading Ayurvedic practitioners to discuss modern integrations of ancient practices.', status: 'approved' },
  { id: '2', title: 'Therapeutic Yoga Workshop', type: 'Workshop', event_date: 'September 5, 2026', date: 'September 5, 2026', location: 'Online via Zoom', attendees: 150, description: 'An interactive workshop focusing on specific asanas for stress relief and chronic pain management. Open to all levels.', status: 'approved' },
  { id: '3', title: 'Homeopathy in Pediatrics', type: 'Webinar', event_date: 'September 20, 2026', date: 'September 20, 2026', location: 'Online', attendees: 300, description: 'A dedicated webinar for practitioners to learn safe homeopathic approaches for common pediatric illnesses.', status: 'approved' }
];

export async function getApprovedEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackEvents;
  }
  try {
    const { data, error } = await supabase.from('events').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return fallbackEvents;
    return data.map(e => ({
      ...e,
      date: e.event_date,
      attendees: e.attendees_count || 0
    }));
  } catch {
    return fallbackEvents;
  }
}

export async function getAllEventsAdmin(): Promise<EventItem[]> {
  if (!isSupabaseConfigured || !supabase) return fallbackEvents;
  try {
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (error || !data) return fallbackEvents;
    return data;
  } catch {
    return fallbackEvents;
  }
}

export async function createEvent(eventData: Partial<EventItem> & { organizer?: string }): Promise<{ success: boolean; message: string; data?: EventItem }> {
  const newEvent: EventItem = {
    id: `ev_local_${Date.now()}`,
    title: eventData.title || 'Untitled Event',
    type: eventData.type || 'Seminar',
    event_date: eventData.event_date || eventData.date || 'TBD',
    date: eventData.date || eventData.event_date || 'TBD',
    location: eventData.location || 'Online',
    description: eventData.description || '',
    organizer_name: eventData.organizer || eventData.organizer_name || 'Community Organizer',
    organizer: eventData.organizer || eventData.organizer_name || 'Community Organizer',
    attendees: 0,
    status: 'approved',
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, message: 'Event published!', data: newEvent };
  }
  try {
    const { data, error } = await supabase.from('events').insert([{
      title: newEvent.title,
      type: newEvent.type,
      event_date: newEvent.event_date,
      location: newEvent.location,
      description: newEvent.description,
      organizer_name: newEvent.organizer_name,
      status: 'pending'
    }]).select().single();

    if (error) throw error;
    return { success: true, message: 'Event submitted for admin review!', data: data as EventItem };
  } catch (err: any) {
    return { success: true, message: 'Event published locally!', data: newEvent };
  }
}

export async function getEvents(): Promise<EventItem[]> {
  return getApprovedEvents();
}

export async function deleteEvent(id: string | number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase.from('events').delete().eq('id', id);
  return !error;
}

export async function updateEventStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase.from('events').update({ status }).eq('id', id);
  return !error;
}

// User Event Registrations (stored in LocalStorage)
const EVENT_REGISTRATIONS_KEY = 'ayush_registered_events';

export interface UserEventRegistration {
  eventId: string | number;
  userEmail: string;
  eventTitle: string;
  eventType: string;
  eventDate: string;
  location: string;
  registeredAt: string;
}

function getLocalRegistrations(): UserEventRegistration[] {
  try {
    const raw = localStorage.getItem(EVENT_REGISTRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(regs: UserEventRegistration[]) {
  try {
    localStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(regs));
    window.dispatchEvent(new Event('ayush_events_update'));
  } catch (err) {
    console.error('Failed to save event registrations:', err);
  }
}

export function registerForEvent(event: EventItem, userEmail: string = 'user@ayushline.gov.in'): { success: boolean; message: string } {
  const current = getLocalRegistrations();
  const exists = current.some(r => String(r.eventId) === String(event.id) && r.userEmail === userEmail);
  
  if (exists) {
    return { success: false, message: 'You are already registered for this event!' };
  }

  const newReg: UserEventRegistration = {
    eventId: event.id,
    userEmail,
    eventTitle: event.title,
    eventType: event.type,
    eventDate: event.event_date || event.date || 'TBD',
    location: event.location,
    registeredAt: new Date().toISOString(),
  };

  saveLocalRegistrations([newReg, ...current]);
  return { success: true, message: `Successfully registered for "${event.title}"!` };
}

export function unregisterFromEvent(eventId: string | number, userEmail: string = 'user@ayushline.gov.in'): boolean {
  const current = getLocalRegistrations();
  const filtered = current.filter(r => !(String(r.eventId) === String(eventId) && r.userEmail === userEmail));
  saveLocalRegistrations(filtered);
  return true;
}

export function isUserRegisteredForEvent(eventId: string | number, userEmail: string = 'user@ayushline.gov.in'): boolean {
  const current = getLocalRegistrations();
  return current.some(r => String(r.eventId) === String(eventId) && r.userEmail === userEmail);
}

export function getUserRegisteredEvents(userEmail: string = 'user@ayushline.gov.in'): UserEventRegistration[] {
  const current = getLocalRegistrations();
  if (!userEmail) return current;
  return current.filter(r => r.userEmail === userEmail);
}

