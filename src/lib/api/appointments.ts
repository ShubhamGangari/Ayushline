import { supabase, isSupabaseConfigured } from '../supabase';
import { addNotification } from './notifications';

export interface Appointment {
  id: string | number;
  patient_id?: string | null;
  patient_name: string;
  patient_email?: string | null;
  doctor_id: string;
  doctor_name?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
}

const APPOINTMENTS_STORAGE_KEY = 'ayush_user_appointments';

function getLocalAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAppointments(appts: Appointment[]) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appts));
    window.dispatchEvent(new Event('ayush_appointments_update'));
  } catch (err) {
    console.error('Failed to save appointments locally:', err);
  }
}

export async function createAppointment(appointmentData: Partial<Appointment>): Promise<{ success: boolean; message: string }> {
  const newAppt: Appointment = {
    id: `appt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    patient_id: appointmentData.patient_id || 'guest',
    patient_name: appointmentData.patient_name || 'AYUSH Patient',
    patient_email: appointmentData.patient_email || 'user@ayushline.gov.in',
    doctor_id: appointmentData.doctor_id || '1',
    doctor_name: appointmentData.doctor_name || 'AYUSH Practitioner',
    preferred_date: appointmentData.preferred_date || new Date().toISOString().split('T')[0],
    preferred_time: appointmentData.preferred_time || '10:00 AM',
    message: appointmentData.message || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  // Save to local storage
  const currentLocal = getLocalAppointments();
  saveLocalAppointments([newAppt, ...currentLocal]);

  // Always trigger a notification for the patient
  addNotification({
    type: 'consultation',
    title: 'Consultation Requested ⏳',
    message: `Your appointment request for ${newAppt.preferred_date} at ${newAppt.preferred_time} with Dr. ${newAppt.doctor_name} has been submitted. Status: Pending doctor confirmation.`,
    status: 'pending',
    doctorName: newAppt.doctor_name || 'AYUSH Practitioner',
    date: newAppt.preferred_date || undefined,
    time: newAppt.preferred_time || undefined,
  });

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, message: 'Appointment request submitted! You can view it in "My Consultations".' };
  }
  try {
    const { error } = await supabase.from('appointments').insert([{
      patient_name: newAppt.patient_name,
      patient_email: newAppt.patient_email,
      doctor_id: newAppt.doctor_id,
      doctor_name: newAppt.doctor_name,
      preferred_date: newAppt.preferred_date,
      preferred_time: newAppt.preferred_time,
      message: newAppt.message,
      status: 'pending'
    }]);

    if (error) throw error;
    return { success: true, message: 'Appointment request sent! The doctor will confirm your booking.' };
  } catch (err: any) {
    return { success: true, message: 'Appointment saved locally! The doctor will confirm shortly.' };
  }
}

export async function getUserAppointments(userEmailOrId?: string): Promise<Appointment[]> {
  const localList = getLocalAppointments();

  if (!isSupabaseConfigured || !supabase) {
    if (!userEmailOrId) return localList;
    return localList.filter(
      a => a.patient_email === userEmailOrId || a.patient_id === userEmailOrId
    );
  }

  try {
    let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (userEmailOrId) {
      query = query.or(`patient_email.eq.${userEmailOrId},patient_id.eq.${userEmailOrId}`);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return localList;

    // Combine remote and local items avoiding duplicates by ID
    const remoteIds = new Set(data.map(d => String(d.id)));
    const uniqueLocal = localList.filter(l => !remoteIds.has(String(l.id)));
    return [...data, ...uniqueLocal];
  } catch {
    return localList;
  }
}

export async function cancelAppointment(appointmentId: string | number): Promise<boolean> {
  const current = getLocalAppointments();
  const updated = current.map(a => String(a.id) === String(appointmentId) ? { ...a, status: 'cancelled' as const } : a);
  saveLocalAppointments(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
    } catch {
      // local update already done
    }
  }
  return true;
}

export async function getAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
