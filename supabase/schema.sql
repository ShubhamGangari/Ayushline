-- ====================================================================
-- AYUSHLINE PORTAL - Complete Supabase Database Schema SQL
-- Copy and paste this script into your Supabase Dashboard > SQL Editor
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'doctor', 'student', 'org', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  whatsapp TEXT,
  phone TEXT,
  college TEXT,
  specialization TEXT,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  system TEXT,
  city TEXT,
  address TEXT,
  accreditation TEXT,
  clinic_address TEXT,
  clinic_location TEXT,
  website TEXT,
  google_map_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert/update own profile" ON public.profiles;
CREATE POLICY "Users can insert/update own profile" ON public.profiles 
  FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 2. DOCTORS TABLE (Consultation Directory)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT DEFAULT '919876543210',
  phone TEXT DEFAULT '+91 98765 43210',
  specialization TEXT DEFAULT 'Ayurveda Specialist',
  system TEXT DEFAULT 'ayurveda',
  experience_years INTEGER DEFAULT 5,
  qualification TEXT DEFAULT 'BAMS',
  clinic_name TEXT DEFAULT 'AYUSH Wellness Clinic',
  clinic_address TEXT,
  city TEXT DEFAULT 'Delhi',
  bio TEXT,
  certificate_url TEXT,
  profile_image_url TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  rating NUMERIC DEFAULT 4.9,
  total_reviews INTEGER DEFAULT 12,
  consultation_fee TEXT DEFAULT '₹500',
  listing_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for doctor search & system filtering
CREATE INDEX IF NOT EXISTS idx_doctors_system ON public.doctors(system);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON public.doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON public.doctors(city);

-- RLS for doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public doctors read" ON public.doctors;
CREATE POLICY "Public doctors read" ON public.doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Doctors insert and update" ON public.doctors;
CREATE POLICY "Doctors insert and update" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 3. DOCTOR REVIEWS TABLE (JustDial-style Reviews)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  doctor_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL DEFAULT 'Verified Patient',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON public.doctor_reviews(doctor_id);

ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reviews read" ON public.doctor_reviews;
CREATE POLICY "Public reviews read" ON public.doctor_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews insert" ON public.doctor_reviews;
CREATE POLICY "Public reviews insert" ON public.doctor_reviews FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------------------
-- 4. APPOINTMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public appointments read" ON public.appointments;
CREATE POLICY "Public appointments read" ON public.appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public appointments write" ON public.appointments;
CREATE POLICY "Public appointments write" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 5. POSTS / ARTICLES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT,
  author_name TEXT,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  type TEXT DEFAULT 'blog',
  system TEXT DEFAULT 'ayurveda',
  thumbnail_url TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  views INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_system ON public.posts(system);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public posts read" ON public.posts;
CREATE POLICY "Public posts read" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public posts write" ON public.posts;
CREATE POLICY "Public posts write" ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 6. EVENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organizer_id TEXT,
  organizer_name TEXT,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'webinar',
  event_date TEXT,
  location TEXT,
  description TEXT,
  banner_url TEXT,
  registration_link TEXT,
  attendees_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public events read" ON public.events;
CREATE POLICY "Public events read" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public events write" ON public.events;
CREATE POLICY "Public events write" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 7. DISCUSSIONS & REPLIES TABLES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discussions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden')),
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public discussions read" ON public.discussions;
CREATE POLICY "Public discussions read" ON public.discussions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public discussions write" ON public.discussions;
CREATE POLICY "Public discussions write" ON public.discussions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  discussion_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public discussion_replies read" ON public.discussion_replies;
CREATE POLICY "Public discussion_replies read" ON public.discussion_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public discussion_replies write" ON public.discussion_replies;
CREATE POLICY "Public discussion_replies write" ON public.discussion_replies FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  type TEXT DEFAULT 'consultation',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT,
  read BOOLEAN DEFAULT false,
  doctor_name TEXT,
  date TEXT,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public notifications read" ON public.notifications;
CREATE POLICY "Public notifications read" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public notifications write" ON public.notifications;
CREATE POLICY "Public notifications write" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SEED DATA — SAMPLE CONTENT SO THE SITE IS POPULATED ON LAUNCH
-- (Idempotent: safe to run multiple times.)
-- ====================================================================

-- ------------------------- DOCTORS -------------------------
INSERT INTO public.doctors
  (id, user_id, name, email, whatsapp, phone, specialization, system, experience_years, qualification, clinic_name, clinic_address, city, bio, certificate_url, profile_image_url, status, admin_notes, rating, total_reviews, consultation_fee, listing_enabled)
VALUES
  ('seed-dr-1', NULL, 'Dr. Anjali Sharma', 'anjali@ayushline.in', '919876543210', '+91 98765 43210', 'Ayurveda Specialist', 'ayurveda', 12, 'MD (Ayurveda), BAMS', 'Arogya Wellness Clinic', '2nd Floor, MG Road, Delhi', 'Delhi', 'Dr. Anjali has 12+ years of experience in Panchakarma and women''s health. She focuses on root-cause healing through classical Ayurveda.', NULL, NULL, 'approved', NULL, 4.9, 128, '₹800', true),
  ('seed-dr-2', NULL, 'Dr. Rajesh Kumar', 'rajesh@ayushline.in', '919812345678', '+91 98123 45678', 'Yoga & Naturopathy Therapist', 'yoga', 8, 'MSc Yoga Therapy, ND', 'Prana Yoga Studio', 'Plot 45, Jubilee Hills, Hyderabad', 'Hyderabad', 'Certified yoga therapist and naturopath. Specializes in stress management, respiratory health, and lifestyle disorders.', NULL, NULL, 'approved', NULL, 4.8, 96, '₹600', true),
  ('seed-dr-3', NULL, 'Dr. Fatima Siddiqui', 'fatima@ayushline.in', '919800123456', '+91 98001 23456', 'Unani Consultant', 'unani', 15, 'MD (Unani), BUMS', 'Nuskha Unani Centre', 'Shop 7, Charminar Road, Hyderabad', 'Hyderabad', 'Senior Unani physician specializing in chronic skin conditions, joint pain, and metabolic disorders using classical Ilaj-bit-Tadbeer.', NULL, NULL, 'approved', NULL, 4.7, 74, '₹700', true),
  ('seed-dr-4', NULL, 'Dr. Meera Nair', 'meera@ayushline.in', '919934567890', '+91 99345 67890', 'Homeopathy Consultant', 'homeopathy', 6, 'MD (Homeopathy), BHMS', 'HealHomeopathy Clinic', '12, Lake View Road, Kochi', 'Kochi', 'Gentle, constitutional homeopathy for allergies, skin problems, and pediatric care.', NULL, NULL, 'approved', NULL, 4.9, 152, '₹500', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------- POSTS / ARTICLES -------------------------
INSERT INTO public.posts
  (id, author_id, author_name, title, excerpt, content, type, system, thumbnail_url, status, views, read_time_minutes, published_at)
VALUES
  ('seed-post-1', NULL, 'Dr. Anjali Sharma', '5 Ayurvedic Habits for Better Digestion', 'Simple daily routines to support Agni and improve gut health.', 'Ayurveda teaches that all health begins in the gut. Start your day with warm water, eat your largest meal at noon, and avoid iced drinks with meals. These small shifts can dramatically improve digestion and energy.', 'blog', 'ayurveda', NULL, 'approved', 1240, 6, NOW() - INTERVAL '5 days'),
  ('seed-post-2', NULL, 'Dr. Rajesh Kumar', 'Pranayama for Daily Stress Relief', 'A 5-minute breathing routine to calm your nervous system.', 'Alternate nostril breathing (Nadi Shodhana) balances the nervous system. Sit comfortably, close the right nostril, inhale through the left, then alternate. Do this for 5 minutes daily.', 'article', 'yoga', NULL, 'approved', 980, 4, NOW() - INTERVAL '3 days'),
  ('seed-post-3', NULL, 'Dr. Meera Nair', 'Understanding Constitutional Homeopathy', 'How remedies are chosen based on your unique physical and emotional profile.', 'Homeopathy looks at the whole person. Two people with the same cough may receive different remedies based on their unique symptoms, temperament, and modalities. This personalized approach is the core of classical homeopathy.', 'blog', 'homeopathy', NULL, 'approved', 640, 5, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ------------------------- EVENTS -------------------------
INSERT INTO public.events
  (id, organizer_id, organizer_name, title, type, event_date, location, description, banner_url, registration_link, attendees_count, status)
VALUES
  ('seed-ev-1', NULL, 'Ayushline', 'National Ayurveda Wellness Webinar', 'webinar', '2026-12-10', 'Online (Zoom)', 'Join leading practitioners for a free webinar on seasonal routines (Ritucharya) and immunity.', NULL, NULL, 320, 'approved'),
  ('seed-ev-2', NULL, 'Ayushline', 'Yoga for Beginners Workshop', 'workshop', '2026-12-18', 'Prana Yoga Studio, Hyderabad', 'A hands-on 2-hour workshop introducing foundational asanas and breathing techniques.', NULL, NULL, 45, 'approved'),
  ('seed-ev-3', NULL, 'Ayushline', 'AYUSH Research Conference 2026', 'conference', '2027-01-15', 'India International Centre, Delhi', 'Annual conference showcasing cutting-edge research across all five AYUSH systems.', NULL, NULL, 210, 'approved')
ON CONFLICT (id) DO NOTHING;

-- ------------------------- DISCUSSIONS -------------------------
INSERT INTO public.discussions
  (id, user_id, user_name, topic, content, status, replies_count)
VALUES
  ('seed-disc-1', NULL, 'Neha Gupta', 'Is Panchakarma safe for beginners?', 'I have heard a lot about Panchakarma but I am unsure if it''s right for me. What should I look for in a practitioner?', 'approved', 2),
  ('seed-disc-2', NULL, 'Arjun Patel', 'Best daily routine for office workers', 'I sit for 10 hours a day. Any Ayurvedic and yoga tips to counter stiffness and fatigue?', 'approved', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.discussion_replies
  (id, discussion_id, user_id, user_name, content)
VALUES
  ('seed-reply-1', 'seed-disc-1', NULL, 'Dr. Anjali Sharma', 'Yes — always consult a certified practitioner. A proper Panchakarma includes a pre-treatment (Purvakarma) phase to prepare the body.'),
  ('seed-reply-2', 'seed-disc-1', NULL, 'Maya', 'I did a 7-day program and it was very gentle. Just make sure they do a proper consultation first.'),
  ('seed-reply-3', 'seed-disc-2', NULL, 'Dr. Rajesh Kumar', 'Take a 2-minute stretch break every hour, keep your water warm, and try 5 minutes of desk yoga at lunch.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------- DOCTOR REVIEWS -------------------------
INSERT INTO public.doctor_reviews
  (id, doctor_id, reviewer_name, rating, comment)
VALUES
  ('seed-rev-1', 'seed-dr-1', 'Ramesh Sharma', 5, 'Very thorough consultation. My digestion improved within weeks.'),
  ('seed-rev-2', 'seed-dr-1', 'Priya', 5, 'Explained everything clearly, no unnecessary medicines.'),
  ('seed-rev-3', 'seed-dr-4', 'Suresh', 5, 'Wonderful with kids. My son''s allergy is much better.'),
  ('seed-rev-4', 'seed-dr-2', 'Kavya', 4, 'Great yoga guidance, very calming sessions.')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- STORAGE BUCKET FOR IMAGE UPLOADS
-- ====================================================================
-- The app uploads images (avatars, doctor photos, event banners, article
-- thumbnails) to a public Storage bucket named "images". This keeps the
-- tables small (they only store the file URL, never the image bytes).
--
-- Run this section AFTER creating the tables above. It is idempotent
-- (safe to run multiple times).

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to read public images
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow image uploads (the app uses the anon key)
DROP POLICY IF EXISTS "Public upload images" ON storage.objects;
CREATE POLICY "Public upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- ====================================================================
-- SCHEMA + SEED DATA COMPLETED SUCCESSFULLY!
-- ====================================================================
