import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  cleanUrl &&
  supabaseAnonKey &&
  cleanUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here';

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey)
  : null;

export type Database = {
  profiles: {
    id: string;
    name: string | null;
    email: string | null;
    role: 'user' | 'doctor' | 'student' | 'org' | 'admin';
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
  };
  doctors: {
    id: string;
    user_id: string | null;
    name: string;
    email: string | null;
    specialization: string;
    system: string;
    experience_years: number;
    qualification: string | null;
    clinic_name: string | null;
    city: string | null;
    bio: string | null;
    certificate_url: string | null;
    profile_image_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    rating: number;
    total_reviews: number;
    created_at: string;
  };
  posts: {
    id: string;
    author_id: string | null;
    author_name: string | null;
    title: string;
    excerpt: string | null;
    content: string | null;
    type: string;
    system: string;
    thumbnail_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    views: number;
    read_time_minutes: number;
    published_at: string | null;
    created_at: string;
  };
  events: {
    id: string;
    organizer_id: string | null;
    organizer_name: string | null;
    title: string;
    type: string;
    event_date: string;
    location: string;
    description: string | null;
    banner_url: string | null;
    registration_link: string | null;
    attendees_count: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  };
  discussions: {
    id: string;
    user_id: string | null;
    user_name: string;
    topic: string;
    content: string;
    status: 'pending' | 'approved' | 'hidden';
    replies_count: number;
    created_at: string;
  };
  appointments: {
    id: string;
    patient_id: string | null;
    patient_name: string;
    patient_email: string | null;
    doctor_id: string;
    preferred_date: string | null;
    preferred_time: string | null;
    message: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
  };
};
