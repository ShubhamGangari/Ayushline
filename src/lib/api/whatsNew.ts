import { supabase, isSupabaseConfigured } from '../supabase';

export type WhatsNewCategory =
  | 'all'
  | 'news'
  | 'announcements'
  | 'blogs'
  | 'events'
  | 'careers'
  | 'education'
  | 'research';

export interface WhatsNewItem {
  id: string | number;
  title: string;
  category: 'news' | 'announcements' | 'blogs' | 'events' | 'careers' | 'education' | 'research';
  type?: string; // e.g. Seminar, Fellowship, Press Release
  system?: 'ayurveda' | 'yoga' | 'unani' | 'siddha' | 'homeopathy' | 'general';
  published_date: string;
  location?: string;
  author_or_org?: string;
  summary: string;
  content?: string;
  banner_url?: string | null;
  link_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  attendees_or_views?: number;
  tags?: string[];
  created_at?: string;
}

export const FALLBACK_WHATS_NEW: WhatsNewItem[] = [
  // 📰 News
  {
    id: 'news-1',
    category: 'news',
    type: 'National Policy',
    title: 'Ministry of AYUSH Announces Global Traditional Medicine Integration Initiative',
    system: 'general',
    published_date: 'August 14, 2026',
    author_or_org: 'AYUSH Press Information Bureau',
    summary: 'A new framework establishing integrated AYUSH departments in tertiary care healthcare centers nationwide has been unveiled.',
    banner_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    tags: ['Policy', 'Healthcare', 'Integrative Medicine'],
    status: 'approved',
    attendees_or_views: 1420,
  },
  {
    id: 'news-2',
    category: 'news',
    type: 'Global Recognition',
    title: 'WHO Endorses Standardized Benchmarks for Ayurvedic Clinical Practice',
    system: 'ayurveda',
    published_date: 'August 10, 2026',
    author_or_org: 'World Health Organization',
    summary: 'International technical documentation released to benchmark training and clinical standards for Ayurvedic physicians globally.',
    banner_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    tags: ['WHO', 'Ayurveda', 'Global Standards'],
    status: 'approved',
    attendees_or_views: 980,
  },

  // 📢 Announcements
  {
    id: 'ann-1',
    category: 'announcements',
    type: 'Platform Feature',
    title: 'Ayushline® Launches Teleconsultation Directory Across All Five AYUSH Systems',
    system: 'general',
    published_date: 'August 12, 2026',
    author_or_org: 'Ayushline® Core Team',
    summary: 'Patients can now book verified consultations across Ayurveda, Yoga, Unani, Siddha, and Homeopathy with certified practitioners.',
    banner_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
    tags: ['Platform', 'Teleconsultation'],
    status: 'approved',
    attendees_or_views: 2150,
  },
  {
    id: 'ann-2',
    category: 'announcements',
    type: 'Accreditation',
    title: 'Special Onboarding Drive for Certified AYUSH Practitioners & Clinics',
    system: 'general',
    published_date: 'August 08, 2026',
    author_or_org: 'Medical Advisory Board',
    summary: 'Get verified badges and direct consultation booking privileges on Ayushline®. Seamless registration open till end of month.',
    banner_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
    tags: ['Onboarding', 'Practitioners', 'Verification'],
    status: 'approved',
    attendees_or_views: 890,
  },

  // ✍️ Blogs
  {
    id: 'blog-1',
    category: 'blogs',
    type: 'Clinical Insight',
    title: 'Managing Chronic Joint Inflammation: An Integrative Panchakarma Perspective',
    system: 'ayurveda',
    published_date: 'August 09, 2026',
    author_or_org: 'Dr. Rajesh Sharma, MD (Ayu)',
    summary: 'Exploring Janu Basti, Guggulu formulations, and dietary adjustments for long-term relief in osteoarthritis patients.',
    banner_url: 'https://images.unsplash.com/photo-1512290900672-1f00b7b14041?w=800&auto=format&fit=crop&q=80',
    tags: ['Ayurveda', 'Panchakarma', 'Arthritis'],
    status: 'approved',
    attendees_or_views: 640,
  },
  {
    id: 'blog-2',
    category: 'blogs',
    type: 'Lifestyle & Wellness',
    title: 'Pranayama Techniques for Modern Stress and Autonomic Nervous System Balance',
    system: 'yoga',
    published_date: 'August 05, 2026',
    author_or_org: 'Acharya V. Ramanathan',
    summary: 'How Nadisodhana and Bhramari modulate vagal tone, decrease cortisol, and improve sleep latency.',
    banner_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    tags: ['Yoga', 'Pranayama', 'Mental Health'],
    status: 'approved',
    attendees_or_views: 1120,
  },

  // 📅 Events
  {
    id: 'ev-1',
    category: 'events',
    type: 'Global Summit',
    title: 'World AYUSH Congress & Holistic Healthcare Exhibition 2026',
    system: 'general',
    published_date: 'September 15-18, 2026',
    location: 'Vigyan Bhawan, New Delhi (Hybrid)',
    author_or_org: 'International AYUSH Federation',
    summary: 'A 4-day summit bringing together 5,000+ practitioners, researchers, and pharmaceutical innovators from 40+ countries.',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    tags: ['Conferences', 'Exhibition', 'Global Summit'],
    status: 'approved',
    attendees_or_views: 780,
  },
  {
    id: 'ev-2',
    category: 'events',
    type: 'Workshop',
    title: 'Pediatric Homeopathy Masterclass: Acute & Chronic Protocols',
    system: 'homeopathy',
    published_date: 'October 04, 2026',
    location: 'Online via Live Interactive Stream',
    author_or_org: 'Institute of Classical Homeopathy',
    summary: 'Case discussions, constitutional remedy selection, and posology guidelines for childhood conditions.',
    banner_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    tags: ['Homeopathy', 'Pediatrics', 'Webinar'],
    status: 'approved',
    attendees_or_views: 340,
  },

  // 💼 Careers
  {
    id: 'car-1',
    category: 'careers',
    type: 'Full-time Vacancy',
    title: 'Senior Ayurvedic Consultant & Panchakarma Specialist Needed',
    system: 'ayurveda',
    published_date: 'August 11, 2026',
    location: 'Bengaluru Holistic Care Hospital',
    author_or_org: 'National Wellness Network',
    summary: 'Looking for BAMS + MD (Kayachikitsa/Panchakarma) with 5+ years of clinical experience. Attractive package and research support.',
    banner_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    tags: ['Jobs', 'Doctor', 'Ayurveda', 'Bengaluru'],
    status: 'approved',
    attendees_or_views: 520,
  },
  {
    id: 'car-2',
    category: 'careers',
    type: 'Fellowship',
    title: 'Junior Research Fellow - Siddha Pharmacognosy & Clinical Trials',
    system: 'siddha',
    published_date: 'August 07, 2026',
    location: 'Central Council for Research in Siddha (Chennai)',
    author_or_org: 'CCRS Research Division',
    summary: 'Funded research position investigating botanical characterization and toxicity testing of traditional Siddha herbs.',
    banner_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
    tags: ['Fellowship', 'Research', 'Siddha', 'Chennai'],
    status: 'approved',
    attendees_or_views: 410,
  },

  // 🎓 Education
  {
    id: 'edu-1',
    category: 'education',
    type: 'Postgraduate Course',
    title: 'National AYUSH PG Admissions & Specialization Counseling 2026',
    system: 'general',
    published_date: 'Academic Year 2026-27',
    location: 'All India AYUSH Counseling Portal',
    author_or_org: 'AACCC Authority',
    summary: 'Registration, seat matrix, and schedule for MD/MS admissions across government and accredited private AYUSH colleges.',
    banner_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    tags: ['Admissions', 'MD', 'MS', 'AYUSH PG'],
    status: 'approved',
    attendees_or_views: 1890,
  },
  {
    id: 'edu-2',
    category: 'education',
    type: 'Certificate Course',
    title: 'Advanced Certificate in Unani Ilaj-bit-Tadbeer (Regimental Therapy)',
    system: 'unani',
    published_date: 'Starts September 2026',
    location: 'Hybrid (Aligarh & Online Modules)',
    author_or_org: 'Unani Medical Education Trust',
    summary: 'Comprehensive 6-month hands-on clinical program on Hijama (Cupping), Fasd (Venesection), and Dalk (Massage therapy).',
    banner_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    tags: ['CME', 'Unani', 'Regimental Therapy'],
    status: 'approved',
    attendees_or_views: 310,
  },

  // 🔬 Research
  {
    id: 'res-1',
    category: 'research',
    type: 'Peer-Reviewed Paper',
    title: 'Standardized Withania somnifera Extract in Chronic Fatigue Syndrome: A Randomized Double-Blind Trial',
    system: 'ayurveda',
    published_date: 'August 2026',
    author_or_org: 'Journal of Integrative Phytotherapy',
    summary: 'Evaluating adrenal biomarker normalization, mitochondrial output, and quality-of-life scores over a 12-week intervention.',
    banner_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    tags: ['Clinical Trial', 'Ashwagandha', 'Pharmacology'],
    status: 'approved',
    attendees_or_views: 890,
  },
  {
    id: 'res-2',
    category: 'research',
    type: 'Clinical Case Series',
    title: 'Individualized Homeopathic Therapy in Refractory Atopic Dermatitis: 50 Case Observations',
    system: 'homeopathy',
    published_date: 'July 2026',
    author_or_org: 'Central Research Journal of Homeopathy',
    summary: 'Systematic documentation of SCORAD index improvements, serum IgE reductions, and relapse tracking over 18 months.',
    banner_url: 'https://images.unsplash.com/photo-1583912267670-6575ad4736f8?w=800&auto=format&fit=crop&q=80',
    tags: ['Dermatology', 'Homeopathy', 'Clinical Series'],
    status: 'approved',
    attendees_or_views: 740,
  },
];

const LOCAL_STORAGE_KEY = 'ayush_whats_new_items_v2';

export function getLocalWhatsNewItems(): WhatsNewItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return FALLBACK_WHATS_NEW;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK_WHATS_NEW;
  } catch {
    return FALLBACK_WHATS_NEW;
  }
}

export function saveLocalWhatsNewItems(items: WhatsNewItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function getWhatsNewItems(category?: WhatsNewCategory): Promise<WhatsNewItem[]> {
  const items = getLocalWhatsNewItems();
  const approved = items.filter(item => item.status === 'approved');
  if (!category || category === 'all') {
    return approved;
  }
  return approved.filter(item => item.category === category);
}

export async function createWhatsNewItem(item: Partial<WhatsNewItem>): Promise<{ success: boolean; message: string; data?: WhatsNewItem }> {
  const newItem: WhatsNewItem = {
    id: `item_${Date.now()}`,
    title: item.title || 'Untitled Update',
    category: item.category || 'news',
    type: item.type || 'General Update',
    system: item.system || 'general',
    published_date: item.published_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    location: item.location || 'Online',
    author_or_org: item.author_or_org || 'AYUSH Community Member',
    summary: item.summary || '',
    content: item.content || item.summary || '',
    banner_url: item.banner_url || null,
    link_url: item.link_url || '',
    status: 'approved',
    attendees_or_views: 0,
    tags: item.tags || [],
    created_at: new Date().toISOString(),
  };

  const current = getLocalWhatsNewItems();
  const updated = [newItem, ...current];
  saveLocalWhatsNewItems(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('events').insert([{
        title: newItem.title,
        type: `${newItem.category.toUpperCase()}: ${newItem.type}`,
        event_date: newItem.published_date,
        location: newItem.location || 'Online',
        description: newItem.summary,
        banner_url: newItem.banner_url,
        organizer_name: newItem.author_or_org,
        status: 'approved',
      }]);
    } catch {
      // Handled locally
    }
  }

  return { success: true, message: `Successfully published to What's New (${newItem.category.toUpperCase()})!`, data: newItem };
}
