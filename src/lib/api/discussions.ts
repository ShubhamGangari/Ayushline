import { supabase, isSupabaseConfigured } from '../supabase';

export interface Discussion {
  id: string | number;
  user_id?: string | null;
  user_name?: string;
  user?: string;
  topic: string;
  content?: string;
  text?: string;
  replies_count?: number;
  replies?: number;
  status?: string;
  created_at?: string;
}

export const fallbackDiscussions: Discussion[] = [
  { id: '1', user: 'Aarav M.', topic: 'Chronic Back Pain', text: 'I have been experiencing chronic lower back pain for the past 6 months. I work a desk job and sit for long hours. Can anyone suggest some Ayurvedic remedies or Yoga postures that might help alleviate the pain without relying on painkillers?', replies: 5, status: 'approved' },
  { id: '2', user: 'Neha K.', topic: 'Stress and Anxiety', text: 'With my current work schedule, my stress levels are through the roof. I am looking for natural ways to calm my mind. Does Homeopathy or Unani have effective treatments for severe anxiety?', replies: 12, status: 'approved' },
];

export async function getApprovedDiscussions(): Promise<Discussion[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackDiscussions;
  }
  try {
    const { data, error } = await supabase.from('discussions').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return fallbackDiscussions;
    return data.map(d => ({
      ...d,
      user: d.user_name || 'Community Member',
      text: d.content,
      replies: d.replies_count || 0
    }));
  } catch {
    return fallbackDiscussions;
  }
}

export async function createDiscussion(topic: string, content: string, userName?: string): Promise<{ success: boolean; data?: Discussion; message?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const newPost: Discussion = {
      id: Date.now().toString(),
      user: userName || 'Guest User',
      topic,
      text: content,
      replies: 0,
      status: 'approved'
    };
    return { success: true, data: newPost };
  }

  try {
    const { data, error } = await supabase.from('discussions').insert([{
      topic,
      content,
      user_name: userName || 'Guest User',
      status: 'approved' // Forum posts directly approved by default as per common flow
    }]).select().single();

    if (error) throw error;
    return {
      success: true,
      data: {
        ...data,
        user: data.user_name,
        text: data.content,
        replies: 0
      }
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
