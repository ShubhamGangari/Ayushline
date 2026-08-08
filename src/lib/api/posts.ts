import { supabase, isSupabaseConfigured } from '../supabase';

export interface Post {
  id: string | number;
  author_id?: string | null;
  author_name?: string | null;
  title: string;
  excerpt: string;
  content?: string;
  type: string;
  system: string;
  thumbnail_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  views?: number;
  read_time_minutes?: number;
  readTime?: string;
  date?: string;
  created_at?: string;
  image?: string;
}

export const SYSTEM_FALLBACK_IMAGES: Record<string, string> = {
  ayurveda: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  yoga: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
  homeopathy: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
  unani: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80',
  siddha: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',
  sowa_rigpa: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
  'sowa-rigpa': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
  naturopathy: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
};

export const POST_IMAGE_POOLS: Record<string, string[]> = {
  ayurveda: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608248597560-1e5f0b5d56b0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611070342079-c5c6f6bf9b59?w=600&auto=format&fit=crop&q=80',
  ],
  yoga: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1510894347277-1c62f205c6d0?w=600&auto=format&fit=crop&q=80',
  ],
  homeopathy: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80',
  ],
  unani: [
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  ],
  siddha: [
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
  ],
  naturopathy: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  ]
};

export function getPostImage(system?: string, thumbnail_url?: string | null, customImage?: string, postId?: string | number): string {
  if (customImage && customImage.trim().length > 0 && !customImage.includes('/images/')) return customImage;
  if (thumbnail_url && thumbnail_url.trim().length > 0) return thumbnail_url;
  const sysKey = (system || 'ayurveda').toLowerCase().trim();
  const pool = POST_IMAGE_POOLS[sysKey] || POST_IMAGE_POOLS['ayurveda'];
  if (postId && pool && pool.length > 0) {
    const hash = String(postId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return pool[hash % pool.length];
  }
  return SYSTEM_FALLBACK_IMAGES[sysKey] || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80';
}

export const fallbackPosts: Post[] = [
  { id: '1', system: 'ayurveda', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80', title: 'Understanding Vata, Pitta, and Kapha for Daily Balance', excerpt: 'A practical guide to identifying your primary dosha and adjusting your diet accordingly.', date: 'Oct 12, 2023', readTime: '5 min read', type: 'article', status: 'approved', author_name: 'Dr. Ananya Sharma' },
  { id: '2', system: 'yoga', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80', title: 'The Science of Pranayama in Modern Stress Management', excerpt: 'How ancient breathing techniques can physically lower cortisol levels and improve focus.', date: 'Oct 10, 2023', readTime: '4 min read', type: 'blog', status: 'approved', author_name: 'Dr. Priya Singh' },
  { id: '3', system: 'homeopathy', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', title: 'Arnica Montana: Applications in Sports Recovery', excerpt: 'A clinical review of how homeopathic preparations assist in muscle tissue repair.', date: 'Oct 05, 2023', readTime: '6 min read', type: 'case_study', status: 'approved', author_name: 'Dr. Rahul Verma' },
  { id: '4', system: 'unani', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80', title: 'Principles of Mizaj (Temperament) in Unani Medicine', excerpt: 'Exploring the four humors and personalized botanical remedies in Unani clinical practices.', date: 'Sep 28, 2023', readTime: '7 min read', type: 'article', status: 'approved', author_name: 'Dr. Hakim Zafar' },
  { id: '5', system: 'siddha', image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80', title: 'Siddha Mineral Formulations & Longevity (Kayakalpa)', excerpt: 'An introduction to ancient Tamil Kayakalpa therapy for cellular revitalization.', date: 'Sep 20, 2023', readTime: '5 min read', type: 'blog', status: 'approved', author_name: 'Dr. Vikram Aditya' },
  { id: '6', system: 'naturopathy', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80', title: 'Hydrotherapy and Detoxification in Modern Naturopathy', excerpt: 'How thermal water baths and mud therapy stimulate lymphatic drainage and organ vitality.', date: 'Sep 15, 2023', readTime: '6 min read', type: 'review', status: 'approved', author_name: 'Dr. Sunita Mehta' }
];

export async function getApprovedPosts(systemFilter?: string): Promise<Post[]> {
  if (!isSupabaseConfigured || !supabase) {
    if (systemFilter && systemFilter !== 'all') {
      return fallbackPosts.filter(p => p.system.toLowerCase() === systemFilter.toLowerCase());
    }
    return fallbackPosts;
  }

  try {
    let query = supabase.from('posts').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    if (systemFilter && systemFilter !== 'all') {
      query = query.eq('system', systemFilter.toLowerCase());
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return fallbackPosts;

    return data.map(p => ({
      ...p,
      image: getPostImage(p.system, p.thumbnail_url, undefined, p.id),
      date: new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: `${p.read_time_minutes || 5} min read`
    }));
  } catch {
    return fallbackPosts;
  }
}

export async function getAllPostsAdmin(): Promise<Post[]> {
  if (!isSupabaseConfigured || !supabase) return fallbackPosts;
  try {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error || !data) return fallbackPosts;
    return data;
  } catch {
    return fallbackPosts;
  }
}

export async function createPost(postData: Partial<Post> & { content?: string }): Promise<{ success: boolean; message: string }> {
  const excerpt = postData.excerpt || (postData.content ? postData.content.slice(0, 150) + '...' : '');

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, message: 'Article published to community feed!' };
  }
  try {
    const { error } = await supabase.from('posts').insert([{
      title: postData.title,
      excerpt,
      content: postData.content,
      type: postData.type || 'blog',
      system: postData.system || 'general',
      author_name: postData.author_name || 'Anonymous Contributor',
      status: 'pending'
    }]);

    if (error) throw error;
    return { success: true, message: 'Article submitted for admin review!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to submit article.' };
  }
}

export async function getPostById(id: string | number): Promise<Post | null> {
  // First try fallback list (works when Supabase is not configured)
  const fallback = fallbackPosts.find(p => String(p.id) === String(id));

  if (!isSupabaseConfigured || !supabase) {
    return fallback || null;
  }
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return fallback || null;
    return {
      ...data,
      image: getPostImage(data.system, data.thumbnail_url, undefined, data.id),
      date: new Date(data.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: `${data.read_time_minutes || 5} min read`,
    } as Post;
  } catch {
    return fallback || null;
  }
}

export async function updatePostStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase.from('posts').update({ status }).eq('id', id);
  return !error;
}

export async function deletePost(id: string | number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return !error;
}
