import { supabase, isSupabaseConfigured } from '../supabase';

export interface DiscussionReply {
  id: string | number;
  discussion_id: string | number;
  user_id?: string | null;
  user_name: string;
  content: string;
  created_at?: string;
}

export async function getRepliesForDiscussion(discussionId: string | number): Promise<DiscussionReply[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('discussion_replies')
      .select('*')
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createReply(discussionId: string | number, userName: string, content: string): Promise<{ success: boolean; data?: DiscussionReply; message?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const newReply: DiscussionReply = {
      id: Date.now().toString(),
      discussion_id: discussionId,
      user_name: userName || 'Guest User',
      content,
    };
    return { success: true, data: newReply };
  }

  try {
    const { data, error } = await supabase
      .from('discussion_replies')
      .insert([{
        discussion_id: discussionId,
        user_name: userName || 'Guest User',
        content
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      success: true,
      data: {
        ...data,
        user_name: data.user_name,
        content: data.content,
      }
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
