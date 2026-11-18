import { supabase, isSupabaseConfigured } from '../supabase';
import { addNotification, updateNotificationRoleInviteStatus } from './notifications';

export type UserRole = 'user' | 'doctor' | 'student' | 'org' | 'admin';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'System Administrator',
  doctor: 'Practitioner / Doctor',
  student: 'Student / Seeker',
  org: 'Organization',
  user: 'Student / Seeker',
};

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  pending_role?: UserRole | null;
  pending_role_invited_by?: string | null;
  pending_role_invited_at?: string | null;
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

  // Guard against accidental downgrade:
  // If user already holds 'admin', 'doctor', or 'org' role, and incoming data is 'user',
  // keep the existing privileged role.
  let resolvedRole: UserRole = existingLocal?.role || 'user';
  if (data.role && data.role !== 'user') {
    resolvedRole = data.role;
  } else if (!existingLocal?.role && data.role) {
    resolvedRole = data.role;
  }

  const updatedLocal: Profile = {
    id: userId,
    name: data.name ?? existingLocal?.name ?? 'User',
    email: data.email ?? existingLocal?.email ?? null,
    role: resolvedRole,
    pending_role: data.pending_role !== undefined ? data.pending_role : (existingLocal?.pending_role ?? null),
    pending_role_invited_by: data.pending_role_invited_by ?? existingLocal?.pending_role_invited_by ?? null,
    pending_role_invited_at: data.pending_role_invited_at ?? existingLocal?.pending_role_invited_at ?? null,
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
      college: updatedLocal.college,
      specialization: updatedLocal.specialization,
      qualification: updatedLocal.qualification,
      experience_years: updatedLocal.experience_years,
      system: updatedLocal.system,
      city: updatedLocal.city,
      address: updatedLocal.address,
      whatsapp: updatedLocal.whatsapp,
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

export function getLocalProfile(userId: string): Profile | null {
  try {
    const raw = localStorage.getItem(`ayush_profile_${userId}`);
    if (raw) return JSON.parse(raw);

    // Fallback: check registered users array
    const usersRaw = localStorage.getItem('ayush_registered_users_v2');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const needle = userId.toLowerCase();
      const match = users.find((u: any) => u.id === userId || (u.email && u.email.toLowerCase() === needle));
      if (match) {
        return {
          id: match.id,
          name: match.name || 'User',
          email: match.email || '',
          role: match.role || 'user',
          pending_role: match.pending_role || null,
          pending_role_invited_by: match.pending_role_invited_by || null,
          pending_role_invited_at: match.pending_role_invited_at || null,
          avatar_url: match.avatarUrl || match.avatar_url || null,
          bio: match.bio || null,
          created_at: match.createdAt || match.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAllProfilesAdmin(): Promise<Profile[]> {
  let list: Profile[] = [];

  // 1. Fetch from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as Profile[];
      }
    } catch {
      // Fallback to local
    }
  }

  // 2. Fetch from local storage registered users
  let localUsers: Profile[] = [];
  try {
    const raw = localStorage.getItem('ayush_registered_users_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      localUsers = parsed.map((u: any) => ({
        id: u.id,
        name: u.name || 'User',
        email: u.email || '',
        role: (u.role as UserRole) || 'student',
        pending_role: u.pending_role || null,
        pending_role_invited_by: u.pending_role_invited_by || null,
        pending_role_invited_at: u.pending_role_invited_at || null,
        avatar_url: u.avatarUrl || u.avatar_url || null,
        bio: u.bio || null,
        created_at: u.createdAt || u.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
  } catch {
    // ignore
  }

  // 3. Scan all localStorage keys for any individual profile objects
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ayush_profile_')) {
        const val = localStorage.getItem(key);
        if (val) {
          const p = JSON.parse(val);
          if (p && p.id) {
            localUsers.push(p);
          }
        }
      }
    }

    const activeRaw = localStorage.getItem('ayush_active_session_v2');
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      if (active && active.id) {
        localUsers.push({
          id: active.id,
          name: active.name || 'User',
          email: active.email || '',
          role: active.role || 'user',
          pending_role: active.pending_role || null,
          pending_role_invited_by: active.pending_role_invited_by || null,
          pending_role_invited_at: active.pending_role_invited_at || null,
          avatar_url: active.avatarUrl || active.avatar_url || null,
          bio: active.bio || null,
          created_at: active.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch {
    // ignore
  }

  // Merge lists by email or id
  const map = new Map<string, Profile>();
  [...list, ...localUsers].forEach((u) => {
    const key = (u.email || u.id).toLowerCase();
    if (!map.has(key)) {
      map.set(key, u);
    } else {
      const existing = map.get(key)!;
      map.set(key, {
        ...existing,
        ...u,
        role: u.role || existing.role,
        pending_role: u.pending_role ?? existing.pending_role ?? null,
      });
    }
  });

  return Array.from(map.values());
}

/**
 * Directly updates user's role without user approval (direct admin action)
 */
export async function updateProfileRoleAdmin(userId: string, role: UserRole): Promise<boolean> {
  const profile = getLocalProfile(userId);
  if (profile) {
    profile.role = role;
    profile.pending_role = null;
    saveLocalProfile(profile);
  }

  // Update local storage registered users
  try {
    const raw = localStorage.getItem('ayush_registered_users_v2');
    if (raw) {
      const users = JSON.parse(raw);
      const needle = userId.toLowerCase();
      const idx = users.findIndex((u: any) => u.id === userId || (u.email && u.email.toLowerCase() === needle));
      if (idx >= 0) {
        users[idx].role = role;
        users[idx].pending_role = null;
        localStorage.setItem('ayush_registered_users_v2', JSON.stringify(users));
      }
    }
  } catch {
    // ignore
  }

  // Update Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
    } catch {
      // ignore
    }
  }

  window.dispatchEvent(new CustomEvent('ayush_auth_change'));
  return true;
}

/**
 * Invites a user to assume a new role.
 * Sets pending_role on their profile and sends them an approval notification.
 */
export async function inviteProfileRoleAdmin(
  userId: string,
  newRole: UserRole,
  adminIdentifier = 'System Administrator'
): Promise<{ success: boolean; message: string }> {
  const profile = getLocalProfile(userId);
  const targetEmail = profile?.email || (userId.includes('@') ? userId : '');
  const roleName = ROLE_LABELS[newRole] || newRole;

  // 1. Update Profile in LocalStorage with pending_role
  if (profile) {
    profile.pending_role = newRole;
    profile.pending_role_invited_by = adminIdentifier;
    profile.pending_role_invited_at = new Date().toISOString();
    saveLocalProfile(profile);
  }

  // 2. Update registered users list
  try {
    const raw = localStorage.getItem('ayush_registered_users_v2');
    if (raw) {
      const users = JSON.parse(raw);
      const needle = (targetEmail || userId).toLowerCase();
      const idx = users.findIndex((u: any) => u.id === userId || (u.email && u.email.toLowerCase() === needle));
      if (idx >= 0) {
        users[idx].pending_role = newRole;
        users[idx].pending_role_invited_by = adminIdentifier;
        users[idx].pending_role_invited_at = new Date().toISOString();
        localStorage.setItem('ayush_registered_users_v2', JSON.stringify(users));
      }
    }
  } catch {
    // ignore
  }

  // 3. Dispatch an approval notification specifically targeted to this user
  addNotification({
    userId,
    userEmail: targetEmail || undefined,
    type: 'role_invite',
    title: `Role Invitation: ${roleName}`,
    message: `Administrator (${adminIdentifier}) has invited you to assume the role of "${roleName}". Would you like to accept this role?`,
    status: 'pending',
    roleInvite: {
      role: newRole,
      roleLabel: roleName,
      invitedBy: adminIdentifier,
      status: 'pending',
    },
  });

  window.dispatchEvent(new CustomEvent('ayush_auth_change'));
  window.dispatchEvent(new Event('ayush_notification_update'));

  return {
    success: true,
    message: `Role invitation sent! ${profile?.name || targetEmail || 'User'} will receive a notification to approve or decline this role.`,
  };
}

/**
 * User accepts the role invitation
 */
export async function acceptRoleInvite(
  userId: string,
  userEmail?: string,
  notificationId?: string
): Promise<{ success: boolean; newRole: UserRole }> {
  const profile = getLocalProfile(userId) || (userEmail ? getLocalProfile(userEmail) : null);
  const targetRole = profile?.pending_role;

  if (!targetRole) {
    return { success: false, newRole: 'user' };
  }

  // Update profile
  if (profile) {
    profile.role = targetRole;
    profile.pending_role = null;
    profile.pending_role_invited_by = null;
    profile.pending_role_invited_at = null;
    saveLocalProfile(profile);
  }

  // Update registered users array
  try {
    const raw = localStorage.getItem('ayush_registered_users_v2');
    if (raw) {
      const users = JSON.parse(raw);
      const needle = (userEmail || userId).toLowerCase();
      const idx = users.findIndex((u: any) => u.id === userId || (u.email && u.email.toLowerCase() === needle));
      if (idx >= 0) {
        users[idx].role = targetRole;
        users[idx].pending_role = null;
        localStorage.setItem('ayush_registered_users_v2', JSON.stringify(users));
      }
    }
  } catch {
    // ignore
  }

  // Update Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').update({ role: targetRole, updated_at: new Date().toISOString() }).eq('id', userId);
    } catch {}
  }

  // Update notification status
  if (notificationId) {
    updateNotificationRoleInviteStatus(notificationId, 'accepted');
  }

  // Send positive confirmation notification
  const roleName = ROLE_LABELS[targetRole] || targetRole;
  addNotification({
    userId,
    userEmail,
    type: 'system',
    title: `Role Activated: ${roleName} 🎉`,
    message: `You have successfully accepted the role of ${roleName}. Your new permissions and capabilities are now active.`,
    status: 'completed',
  });

  window.dispatchEvent(new CustomEvent('ayush_auth_change'));
  window.dispatchEvent(new Event('ayush_notification_update'));

  return { success: true, newRole: targetRole };
}

/**
 * User declines the role invitation
 */
export async function declineRoleInvite(
  userId: string,
  userEmail?: string,
  notificationId?: string
): Promise<boolean> {
  const profile = getLocalProfile(userId) || (userEmail ? getLocalProfile(userEmail) : null);
  if (profile) {
    profile.pending_role = null;
    profile.pending_role_invited_by = null;
    profile.pending_role_invited_at = null;
    saveLocalProfile(profile);
  }

  try {
    const raw = localStorage.getItem('ayush_registered_users_v2');
    if (raw) {
      const users = JSON.parse(raw);
      const needle = (userEmail || userId).toLowerCase();
      const idx = users.findIndex((u: any) => u.id === userId || (u.email && u.email.toLowerCase() === needle));
      if (idx >= 0) {
        users[idx].pending_role = null;
        localStorage.setItem('ayush_registered_users_v2', JSON.stringify(users));
      }
    }
  } catch {
    // ignore
  }

  if (notificationId) {
    updateNotificationRoleInviteStatus(notificationId, 'declined');
  }

  addNotification({
    userId,
    userEmail,
    type: 'system',
    title: 'Role Offer Declined',
    message: 'You have declined the role invitation. Your current account permissions remain unchanged.',
    status: 'info',
  });

  window.dispatchEvent(new CustomEvent('ayush_auth_change'));
  window.dispatchEvent(new Event('ayush_notification_update'));

  return true;
}

export async function deleteProfileAdmin(userId: string): Promise<boolean> {
  // Remove local storage
  try {
    const raw = localStorage.getItem('ayush_registered_users_v2');
    if (raw) {
      const users = JSON.parse(raw);
      const updated = users.filter((u: any) => u.id !== userId && u.email?.toLowerCase() !== userId.toLowerCase());
      localStorage.setItem('ayush_registered_users_v2', JSON.stringify(updated));
    }
    localStorage.removeItem(`ayush_profile_${userId}`);
  } catch {
    // ignore
  }

  // Delete from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').delete().eq('id', userId);
    } catch {
      // ignore
    }
  }

  return true;
}

function saveLocalProfile(profile: Profile) {
  try {
    localStorage.setItem(`ayush_profile_${profile.id}`, JSON.stringify(profile));

    // Also sync active local session and local users array
    const activeRaw = localStorage.getItem('ayush_active_session_v2');
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      if (active.id === profile.id || (active.email && profile.email && active.email.toLowerCase() === profile.email.toLowerCase())) {
        active.role = profile.role;
        active.pending_role = profile.pending_role ?? null;
        if (profile.name) active.name = profile.name;
        if (profile.avatar_url) active.avatarUrl = profile.avatar_url;
        localStorage.setItem('ayush_active_session_v2', JSON.stringify(active));
      }
    }

    const usersRaw = localStorage.getItem('ayush_registered_users_v2');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex(
      (u: any) => u.id === profile.id || (u.email && profile.email && u.email.toLowerCase() === profile.email.toLowerCase())
    );
    const userItem = {
      id: profile.id,
      name: profile.name || 'User',
      email: profile.email || '',
      role: profile.role || 'user',
      pending_role: profile.pending_role ?? null,
      pending_role_invited_by: profile.pending_role_invited_by ?? null,
      pending_role_invited_at: profile.pending_role_invited_at ?? null,
      avatarUrl: profile.avatar_url,
      avatar_url: profile.avatar_url,
      createdAt: profile.created_at || new Date().toISOString(),
    };
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...userItem };
    } else {
      users.push(userItem);
    }
    localStorage.setItem('ayush_registered_users_v2', JSON.stringify(users));
  } catch {
    // ignore
  }
}
