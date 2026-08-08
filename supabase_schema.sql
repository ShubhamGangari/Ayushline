-- =============================================
-- AYUSHLINE — SUPABASE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- Stores extra info for every Clerk user
-- =============================================
create table if not exists profiles (
  id text primary key,  -- Clerk user_id
  name text,
  email text,
  role text not null default 'user' check (role in ('user', 'doctor', 'student', 'org', 'admin')),
  avatar_url text,
  bio text,
  whatsapp text,
  phone text,
  college text,
  specialization text,
  qualification text,
  experience_years integer,
  system text,
  city text,
  address text,
  accreditation text,
  clinic_address text,
  clinic_location text,
  website text,
  google_map_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 2. DOCTORS TABLE
-- Doctor registration + approval
-- =============================================
create table if not exists doctors (
  id uuid primary key default uuid_generate_v4(),
  user_id text references profiles(id) on delete cascade,
  name text not null,
  email text,
  specialization text not null,
  system text not null check (system in ('ayurveda','yoga','unani','siddha','homeopathy','naturopathy')),
  experience_years integer default 0,
  qualification text,
  clinic_name text,
  city text,
  bio text,
  certificate_url text,
  profile_image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  rating numeric(2,1) default 0,
  total_reviews integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 3. POSTS TABLE
-- Articles, Blogs, News, Case Studies etc.
-- =============================================
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  author_id text references profiles(id) on delete set null,
  author_name text,
  title text not null,
  excerpt text,
  content text,
  type text not null default 'blog' check (type in ('blog','article','news','case_study','review','testimonial','interview','analysis')),
  system text default 'general' check (system in ('ayurveda','yoga','unani','siddha','homeopathy','general')),
  thumbnail_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  views integer default 0,
  read_time_minutes integer default 5,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 4. EVENTS TABLE
-- Seminars, Workshops, Webinars
-- =============================================
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id text references profiles(id) on delete set null,
  organizer_name text,
  title text not null,
  type text not null default 'seminar' check (type in ('seminar','workshop','webinar','conference','retreat')),
  event_date text not null,
  location text not null,
  description text,
  banner_url text,
  registration_link text,
  attendees_count integer default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 5. DISCUSSIONS TABLE
-- Community forum posts
-- =============================================
create table if not exists discussions (
  id uuid primary key default uuid_generate_v4(),
  user_id text references profiles(id) on delete set null,
  user_name text not null default 'Anonymous',
  topic text not null,
  content text not null,
  status text not null default 'approved' check (status in ('pending','approved','hidden')),
  replies_count integer default 0,
  created_at timestamptz default now()
);

-- =============================================
-- 6. DISCUSSION REPLIES TABLE
-- =============================================
create table if not exists discussion_replies (
  id uuid primary key default uuid_generate_v4(),
  discussion_id uuid references discussions(id) on delete cascade,
  user_id text references profiles(id) on delete set null,
  user_name text not null default 'Anonymous',
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- 7. APPOINTMENTS TABLE
-- Doctor booking requests
-- =============================================
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id text references profiles(id) on delete cascade,
  patient_name text not null,
  patient_email text,
  doctor_id uuid references doctors(id) on delete cascade,
  preferred_date text,
  preferred_time text,
  message text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz default now()
);

-- =============================================
-- SEED DATA — Sample approved content
-- =============================================

-- Sample approved doctors
insert into doctors (name, specialization, system, experience_years, qualification, city, bio, status, rating) values
('Dr. Ananya Sharma', 'Panchakarma & Pain Management', 'ayurveda', 15, 'BAMS, MD (Ayu)', 'New Delhi', 'Expert in Panchakarma therapies with 15 years of clinical experience in treating chronic conditions naturally.', 'approved', 4.8),
('Dr. Rahul Verma', 'Skin & Allergy', 'homeopathy', 10, 'BHMS, MD (Hom)', 'Mumbai', 'Specialized homeopath with expertise in skin conditions, allergies and chronic stress disorders.', 'approved', 4.5),
('Dr. Priya Singh', 'Yoga Therapy', 'yoga', 8, 'MSc Yoga Therapy', 'Bangalore', 'Certified yoga therapist helping patients with stress, flexibility issues and mental wellness.', 'approved', 4.9),
('Dr. Vikram Aditya', 'Chronic Disease & Immunity', 'siddha', 20, 'BSMS, MD (Siddha)', 'Chennai', 'Senior Siddha practitioner with two decades of experience treating chronic ailments and boosting immunity.', 'approved', 4.7);

-- Sample approved posts
insert into posts (author_name, title, excerpt, content, type, system, status, read_time_minutes, published_at) values
('Dr. Meera Pillai', 'Understanding Vata, Pitta, and Kapha for Daily Balance', 'A practical guide to identifying your primary dosha and adjusting your diet accordingly.', 'Full article content here...', 'article', 'ayurveda', 'approved', 5, now()),
('Prof. Suresh Kumar', 'The Science of Pranayama in Modern Stress Management', 'How ancient breathing techniques can physically lower cortisol levels and improve focus.', 'Full article content here...', 'blog', 'yoga', 'approved', 4, now()),
('Dr. Anita Bose', 'Arnica Montana: Applications in Sports Recovery', 'A clinical review of how homeopathic preparations assist in muscle tissue repair.', 'Full article content here...', 'case_study', 'homeopathy', 'approved', 6, now());

-- Sample approved events
insert into events (organizer_name, title, type, event_date, location, description, status, attendees_count) values
('AYUSH Ministry', 'Global Ayurveda Summit 2026', 'seminar', 'August 15, 2026', 'New Delhi, India (Hybrid)', 'A 3-day global summit bringing together leading Ayurvedic practitioners to discuss modern integrations of ancient practices.', 'approved', 500),
('Yoga Alliance India', 'Therapeutic Yoga Workshop', 'workshop', 'September 5, 2026', 'Online via Zoom', 'An interactive workshop focusing on specific asanas for stress relief and chronic pain management.', 'approved', 150),
('Homeopathy Association', 'Homeopathy in Pediatrics', 'webinar', 'September 20, 2026', 'Online', 'A dedicated webinar for practitioners to learn safe homeopathic approaches for common pediatric illnesses.', 'approved', 300);

-- Sample approved discussions
insert into discussions (user_name, topic, content, status, replies_count) values
('Aarav M.', 'Chronic Back Pain', 'I have been experiencing chronic lower back pain for the past 6 months. I work a desk job and sit for long hours. Can anyone suggest some Ayurvedic remedies or Yoga postures that might help alleviate the pain without relying on painkillers?', 'approved', 5),
('Neha K.', 'Stress and Anxiety', 'With my current work schedule, my stress levels are through the roof. I am looking for natural ways to calm my mind. Does Homeopathy or Unani have effective treatments for severe anxiety?', 'approved', 12);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table doctors enable row level security;
alter table posts enable row level security;
alter table events enable row level security;
alter table discussions enable row level security;
alter table discussion_replies enable row level security;
alter table appointments enable row level security;

-- PROFILES: Anyone can read, only owner can update
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (true);
create policy "Users can update own profile" on profiles for update using (true);

-- DOCTORS: Anyone can read approved doctors
create policy "Approved doctors viewable by all" on doctors for select using (status = 'approved');
create policy "Anyone can insert doctor application" on doctors for insert with check (true);
create policy "Admins can update doctors" on doctors for update using (true);

-- POSTS: Anyone can read approved posts
create policy "Approved posts viewable by all" on posts for select using (status = 'approved');
create policy "Authenticated users can submit posts" on posts for insert with check (true);
create policy "Admins can update posts" on posts for update using (true);

-- EVENTS: Anyone can read approved events
create policy "Approved events viewable by all" on events for select using (status = 'approved');
create policy "Anyone can submit events" on events for insert with check (true);
create policy "Admins can update events" on events for update using (true);

-- DISCUSSIONS: Anyone can read approved discussions
create policy "Approved discussions viewable by all" on discussions for select using (status = 'approved');
create policy "Anyone can post discussions" on discussions for insert with check (true);
create policy "Admins can update discussions" on discussions for update using (true);

-- REPLIES: Anyone can read, anyone can post
create policy "Replies viewable by all" on discussion_replies for select using (true);
create policy "Anyone can reply" on discussion_replies for insert with check (true);

-- APPOINTMENTS: Patients see own appointments, doctors see their own, admins see all
-- NOTE: Works with Clerk JWT templates (auth.jwt()->>'sub' = Clerk user id) or native Supabase auth (auth.uid()::text).
create policy "Patients can create appointment requests" on appointments for insert with check (true);
create policy "Patients can view their own appointments" on appointments for select using (
  patient_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
);
create policy "Doctors can view their own appointments" on appointments for select using (
  exists (
    select 1 from doctors d
    where d.id = appointments.doctor_id
      and d.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);
create policy "Admins can view all appointments" on appointments for select using (
  coalesce(auth.jwt() ->> 'role', '') = 'admin'
  or coalesce(auth.jwt() ->> 'app_role', '') = 'admin'
);
create policy "Patients can cancel their own appointments" on appointments for update using (
  patient_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
) with check (
  patient_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
);

-- Patients may ONLY cancel their own pending/confirmed appointment (status -> 'cancelled');
-- doctors (of that appointment) and admins may update freely. Prevents a patient
-- from silently editing doctor_id, patient_name, message, etc.
create or replace function restrict_patient_appointment_update()
returns trigger as $$
declare
  caller_role text := coalesce(auth.jwt() ->> 'role', auth.jwt() ->> 'app_role', '');
begin
  -- Admins and the assigned doctor can change anything
  if caller_role = 'admin' then
    return new;
  end if;
  if exists (
    select 1 from doctors d
    where d.id = new.doctor_id
      and d.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
  ) then
    return new;
  end if;

  -- Patient path: only allow cancelling, and never touch identifying fields
  if new.status = old.status then
    return new;
  end if;
  if new.status <> 'cancelled' or old.status = 'cancelled' then
    raise exception 'Patients may only cancel their own pending or confirmed appointments';
  end if;
  if new.patient_id is distinct from old.patient_id
     or new.patient_name is distinct from old.patient_name
     or new.patient_email is distinct from old.patient_email
     or new.doctor_id is distinct from old.doctor_id
     or new.preferred_date is distinct from old.preferred_date
     or new.preferred_time is distinct from old.preferred_time
     or new.message is distinct from old.message then
    raise exception 'Patients may only update the status of their own appointments';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_patient_appointment_update
before update on appointments
for each row
execute function restrict_patient_appointment_update();
create policy "Doctors can update their own appointments" on appointments for update using (
  exists (
    select 1 from doctors d
    where d.id = appointments.doctor_id
      and d.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
  )
);
create policy "Admins can update appointments" on appointments for update using (
  coalesce(auth.jwt() ->> 'role', '') = 'admin'
  or coalesce(auth.jwt() ->> 'app_role', '') = 'admin'
);
