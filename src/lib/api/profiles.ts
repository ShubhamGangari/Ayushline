import { supabase, isSupabaseConfigured } from '../supabase';

export type UserRole = 'user' | 'doctor' | 'student' | 'org' | 'admin';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  college?: string | null;
  specialization?: string | null;
  qualification?: string | null;
  experience_years?: number | null;
  system?: string | null;
  city?: string | null;
  address?: string | null;
  accreditation?: string | null;
  clinic_address?: string | null;
  clinic_location?: string | null;
  website?: string | null;
  google_map_link?: string | null;
  created_at: string;
  updated_at: string;
}

export async function createOrUpsertProfile(
  userId: string,
  data: Partial<Profile>
): Promise<{ success: boolean; message: string; data?: Profile }> {
  const existingLocal = getLocalProfile(userId);
  const updatedLocal: Profile = {
    id: userId,
    name: data.name ?? existingLocal?.name ?? 'User',
    email: data.email ?? existingLocal?.email ?? null,
    role: data.role ?? existingLocal?.role ?? 'user',
    avatar_url: data.avatar_url ?? existingLocal?.avatar_url ?? null,
    bio: data.bio ?? existingLocal?.bio ?? null,
    whatsapp: data.whatsapp ?? existingLocal?.whatsapp ?? null,
    phone: data.phone ?? existingLocal?.phone ?? null,
    college: data.college ?? existingLocal?.college ?? null,
    specialization: data.specialization ?? existingLocal?.specialization ?? null,
    qualification: data.qualification ?? existingLocal?.qualification ?? null,
    experience_years: data.experience_years ?? existingLocal?.experience_years ?? null,
    system: data.system ?? existingLocal?.system ?? null,
    city: data.city ?? existingLocal?.city ?? null,
    address: data.address ?? existingLocal?.address ?? null,
    accreditation: data.accreditation ?? existingLocal?.accreditation ?? null,
    clinic_address: data.clinic_address ?? existingLocal?.clinic_address ?? null,
    clinic_location: data.clinic_location ?? existingLocal?.clinic_location ?? null,
    website: data.website ?? existingLocal?.website ?? null,
    google_map_link: data.google_map_link ?? existingLocal?.google_map_link ?? null,
    created_at: existingLocal?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveLocalProfile(updatedLocal);

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, message: 'Profile saved (Local storage).', data: updatedLocal };
  }

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      name: updatedLocal.name,
      email: updatedLocal.email,
      role: updatedLocal.role,
      avatar_url: updatedLocal.avatar_url,
      bio: updatedLocal.bio,
      updated_at: updatedLocal.updated_at,
    });

    if (error) throw error;
    return { success: true, message: 'Profile saved successfully.', data: updatedLocal };
  } catch (err: any) {
    return { success: true, message: err.message || 'Profile saved locally.', data: updatedLocal };
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const local = getLocalProfile(userId);
  if (local) return local;

  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

function getLocalProfile(userId: string): Profile | null {
  try {
    const raw = localStorage.getItem(`ayush_profile_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: Profile) {
  try {
    localStorage.setItem(`ayush_profile_${profile.id}`, JSON.stringify(profile));
  } catch {
    // ignore
  }
}
