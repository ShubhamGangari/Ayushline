import { supabase, isSupabaseConfigured } from '../supabase';

export interface Doctor {
  id: string | number;
  user_id?: string | null;
  name: string;
  email?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  specialization: string;
  system: string;
  experience_years: number;
  qualification?: string | null;
  clinic_name?: string | null;
  city?: string | null;
  bio?: string | null;
  certificate_url?: string | null;
  profile_image_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rating?: number;
  total_reviews?: number;
  created_at?: string;
  image?: string;
  experience?: string;
  expertise?: string[];
  conditions?: string[];
  consultation_fee?: string | number;
}

export const DOCTOR_AVATAR_POOL = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813571-24a39073231f?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
];

export function getDoctorAvatar(id?: string | number, name?: string): string {
  if (!id) return DOCTOR_AVATAR_POOL[0];
  const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DOCTOR_AVATAR_POOL[hash % DOCTOR_AVATAR_POOL.length];
}

export const fallbackDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Ananya Sharma',
    system: 'Ayurveda',
    specialization: 'Panchakarma & Joint Pain',
    experience_years: 15,
    experience: '15 Years',
    rating: 4.8,
    whatsapp: '919876543210',
    phone: '+91 98765 43210',
    qualification: 'BAMS, MD (Ayurveda)',
    clinic_name: 'Sanjeevani Herbal Care',
    city: 'New Delhi',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    expertise: ['pain', 'digestion', 'arthritis', 'back pain'],
    status: 'approved',
    consultation_fee: '₹500',
    bio: 'Panchakarma specialist with 15+ years of clinical excellence in treating chronic arthritis and digestive disorders naturally.',
  },
  {
    id: '2',
    name: 'Dr. Rahul Verma',
    system: 'Homeopathy',
    specialization: 'Skin & Allergy Care',
    experience_years: 10,
    experience: '10 Years',
    rating: 4.5,
    whatsapp: '919876543211',
    phone: '+91 98765 43211',
    qualification: 'BHMS',
    clinic_name: 'Healing Touch Homeo',
    city: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    expertise: ['anxiety', 'skin', 'allergies', 'stress'],
    status: 'approved',
    consultation_fee: '₹400',
    bio: 'Dedicated homeopath focusing on root cause treatment for chronic eczema, psoriasis, and asthma.',
  },
  {
    id: '3',
    name: 'Dr. Priya Singh',
    system: 'Yoga Therapy',
    specialization: 'Mind & Body Wellness',
    experience_years: 8,
    experience: '8 Years',
    rating: 4.9,
    whatsapp: '919876543212',
    phone: '+91 98765 43212',
    qualification: 'M.Sc (Yoga Therapy)',
    clinic_name: 'Ananda Yoga Kendra',
    city: 'Rishikesh',
    image: 'https://images.unsplash.com/photo-1594824813571-24a39073231f?w=300&auto=format&fit=crop&q=80',
    expertise: ['stress', 'flexibility', 'breathing', 'mental health'],
    status: 'approved',
    consultation_fee: '₹600',
    bio: 'Specialist in therapeutic yoga pranayama for hypertension, insomnia, and postural correction.',
  },
  {
    id: '4',
    name: 'Dr. Vikram Aditya',
    system: 'Siddha',
    specialization: 'Chronic Disease & Immunity',
    experience_years: 20,
    experience: '20 Years',
    rating: 4.7,
    whatsapp: '919876543213',
    phone: '+91 98765 43213',
    qualification: 'BSMS',
    clinic_name: 'Agastya Siddha Hospital',
    city: 'Chennai',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    expertise: ['chronic', 'immunity', 'fever', 'wellness'],
    status: 'approved',
    consultation_fee: '₹700',
    bio: 'Ancient Siddha mineral and herbal remedy practitioner for auto-immune and metabolic health.',
  },
];

export async function getApprovedDoctors(): Promise<Doctor[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackDoctors;
  }
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackDoctors;
    }

    return data.map(d => ({
      ...d,
      image: d.profile_image_url || getDoctorAvatar(d.id, d.name),
      experience: `${d.experience_years} Years`,
      expertise: d.specialization ? d.specialization.toLowerCase().split(', ') : ['general'],
      whatsapp: d.whatsapp || '919876543210',
    }));
  } catch {
    return fallbackDoctors;
  }
}

export async function getAllDoctorsAdmin(): Promise<Doctor[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackDoctors;
  }
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return fallbackDoctors;
    return data;
  } catch {
    return fallbackDoctors;
  }
}

export async function registerDoctor(doctorData: Partial<Doctor>): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, message: 'Doctor registered (Demo mode). Will require admin approval once Supabase is connected.' };
  }
  try {
    const { error } = await supabase.from('doctors').insert([
      {
        name: doctorData.name,
        email: doctorData.email,
        whatsapp: doctorData.whatsapp,
        specialization: doctorData.specialization,
        system: doctorData.system || 'ayurveda',
        experience_years: doctorData.experience_years || 0,
        qualification: doctorData.qualification,
        clinic_name: doctorData.clinic_name,
        city: doctorData.city,
        bio: doctorData.bio,
        user_id: doctorData.user_id,
        status: 'pending'
      }
    ]);

    if (error) throw error;
    return { success: true, message: 'Registration submitted successfully! Pending admin approval.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to submit registration.' };
  }
}

export async function updateDoctorStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase.from('doctors').update({ status }).eq('id', id);
  return !error;
}

export async function deleteDoctor(id: string | number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase.from('doctors').delete().eq('id', id);
  return !error;
}

export async function getDoctorById(id: string | number): Promise<Doctor | null> {
  // First try fallback list
  const fallback = fallbackDoctors.find(d => String(d.id) === String(id));

  if (!isSupabaseConfigured || !supabase) {
    return fallback || null;
  }
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return fallback || null;
    return {
      ...data,
      image: data.profile_image_url || getDoctorAvatar(data.id, data.name),
      experience: `${data.experience_years} Years`,
      expertise: data.specialization ? data.specialization.toLowerCase().split(', ') : ['general'],
    } as Doctor;
  } catch {
    return fallback || null;
  }
}
