import React, { useState, useEffect, useRef } from 'react';
import {
  Newspaper,
  Megaphone,
  BookOpen,
  Calendar,
  Briefcase,
  GraduationCap,
  Microscope,
  Search,
  PlusCircle,
  X,
  MapPin,
  Clock,
  User,
  Tag,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { AuthRequiredModal } from '../components/auth/AuthRequiredModal';
import { uploadImage } from '../lib/uploadImage';
import {
  getWhatsNewItems,
  createWhatsNewItem,
  type WhatsNewItem,
  type WhatsNewCategory,
} from '../lib/api/whatsNew';

interface SubSectionConfig {
  id: WhatsNewCategory;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
}

const SUBSECTIONS: SubSectionConfig[] = [
  { id: 'all', name: 'All Updates', emoji: '✨', icon: <Sparkles className="w-4 h-4" />, description: 'All latest developments, articles, events, and opportunities across AYUSH.' },
  { id: 'news', name: 'News', emoji: '📰', icon: <Newspaper className="w-4 h-4" />, description: 'National and global headlines, AYUSH ministry policies, and official updates.' },
  { id: 'announcements', name: 'Announcements', emoji: '📢', icon: <Megaphone className="w-4 h-4" />, description: 'Platform announcements, community updates, and accreditation releases.' },
  { id: 'blogs', name: 'Blogs', emoji: '✍️', icon: <BookOpen className="w-4 h-4" />, description: 'Expert clinical insights, case experiences, and wellness articles.' },
  { id: 'events', name: 'Events', emoji: '📅', icon: <Calendar className="w-4 h-4" />, description: 'Seminars, international conferences, workshops, and webinars.' },
  { id: 'careers', name: 'Careers', emoji: '💼', icon: <Briefcase className="w-4 h-4" />, description: 'AYUSH doctor job vacancies, hospital roles, and research fellowships.' },
  { id: 'education', name: 'Education', emoji: '🎓', icon: <GraduationCap className="w-4 h-4" />, description: 'BAMS/BHMS/BNYS admissions, PG counseling, CME training, and certifications.' },
  { id: 'research', name: 'Research', emoji: '🔬', icon: <Microscope className="w-4 h-4" />, description: 'Peer-reviewed clinical trials, pharmacological analyses, and scientific publications.' },
];

import { AyurvedaIcon, YogaIcon, UnaniIcon, SiddhaIcon, HomeopathyIcon } from '../components/ui/SystemIcons';

const SYSTEM_FILTERS = [
  { id: 'all', label: 'All Systems', icon: null },
  { id: 'ayurveda', label: 'Ayurveda', icon: <AyurvedaIcon className="w-4 h-4 shrink-0 inline-block mr-1" /> },
  { id: 'yoga', label: 'Yoga & Naturopathy', icon: <YogaIcon className="w-4 h-4 shrink-0 inline-block mr-1" /> },
  { id: 'unani', label: 'Unani', icon: <UnaniIcon className="w-4 h-4 shrink-0 inline-block mr-1" /> },
  { id: 'siddha', label: 'Siddha', icon: <SiddhaIcon className="w-4 h-4 shrink-0 inline-block mr-1" /> },
  { id: 'homeopathy', label: 'Homeopathy', icon: <HomeopathyIcon className="w-4 h-4 shrink-0 inline-block mr-1" /> },
];

const WhatsNew: React.FC = () => {
  const { user, isSignedIn } = useAuth();
  const [activeSubSection, setActiveSubSection] = useState<WhatsNewCategory>('all');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<WhatsNewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Engagement Auth Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('');

  // Selected item modal for full reading
  const [selectedItem, setSelectedItem] = useState<WhatsNewItem | null>(null);

  // Submit / Post modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState('');

  // Form State
  const [formCategory, setFormCategory] = useState<WhatsNewCategory>('news');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('');
  const [formSystem, setFormSystem] = useState<'ayurveda' | 'yoga' | 'unani' | 'siddha' | 'homeopathy' | 'general'>('general');
  const [formLocation, setFormLocation] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [bannerError, setBannerError] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);

  const requireAuth = (action: string, callback?: () => void) => {
    if (!isSignedIn) {
      setAuthActionName(action);
      setAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const loadData = async () => {
    setLoading(true);
    const data = await getWhatsNewItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerError('');
    try {
      const res = await uploadImage(file, 'updates', 1000, 600, 0.85);
      setFormBannerUrl(res.url);
    } catch (err: any) {
      setBannerError(err.message || 'Image upload failed. Max size 2MB.');
    }
  };

  const handleOpenSubmit = () => {
    requireAuth('publish an update in What\'s New', () => {
      setShowSubmitModal(true);
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) return;

    setIsSubmitting(true);
    const res = await createWhatsNewItem({
      category: formCategory === 'all' ? 'news' : formCategory,
      title: formTitle,
      type: formType || 'Community Post',
      system: formSystem,
      location: formLocation,
      summary: formSummary,
      banner_url: formBannerUrl,
      author_or_org: user?.name || 'Verified AYUSH Contributor',
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setIsSubmitting(false);
    setSubmitFeedback(res.message);
    setTimeout(() => {
      setShowSubmitModal(false);
      setSubmitFeedback('');
      // reset form
      setFormTitle('');
      setFormType('');
      setFormLocation('');
      setFormSummary('');
      setFormBannerUrl('');
      setFormTags('');
      loadData();
    }, 1200);
  };

  // Filtering
  const filteredItems = items.filter(item => {
    const matchesCategory = activeSubSection === 'all' || item.category === activeSubSection;
    const matchesSystem = selectedSystem === 'all' || item.system === selectedSystem || item.system === 'general';
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      (item.author_or_org && item.author_or_org.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSystem && matchesSearch;
  });

  const currentSectionMeta = SUBSECTIONS.find(s => s.id === activeSubSection) || SUBSECTIONS[0];

  return (
    <div className="bg-ayush-cream min-h-screen">
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={authActionName}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ayush-forest via-slate-900 to-emerald-950 text-white py-16 px-4 relative overflow-hidden border-b border-ayush-gold/20">
        <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none"></div>
        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ayush-gold/20 text-ayush-gold border border-ayush-gold/30 text-xs font-ui font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Ayushline® Official Feed
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 tracking-tight">
                What's New in AYUSH
              </h1>
              <p className="text-ayush-ivory/80 font-body text-base md:text-lg max-w-2xl">
                Real-time portal for authentic AYUSH News, Announcements, Blogs, Events, Careers, Education & Research publications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleOpenSubmit}
                className="flex items-center gap-2 shadow-lg hover:shadow-ayush-gold/20"
              >
                <PlusCircle className="w-4 h-4" /> Post an Update
              </Button>
            </div>
          </div>

          {/* Subsections Navigation Tabs */}
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SUBSECTIONS.map((sec) => {
              const count = sec.id === 'all'
                ? items.length
                : items.filter(i => i.category === sec.id).length;

              const isSelected = activeSubSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSubSection(sec.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-ui font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-ayush-gold text-ayush-forest shadow-md scale-105'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-base">{sec.emoji}</span>
                  <span>{sec.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-ayush-forest/20 text-ayush-forest' : 'bg-white/20 text-white'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Search & System Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-ayush-forest/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ayush-charcoal/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, careers, webinars..."
              className="w-full pl-11 pr-4 py-2.5 bg-ayush-sage/40 border border-ayush-charcoal/15 rounded-2xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-ui font-semibold text-ayush-charcoal/60 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> System:
            </span>
            {SYSTEM_FILTERS.map((sys) => (
              <button
                key={sys.id}
                onClick={() => setSelectedSystem(sys.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-ui font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedSystem === sys.id
                    ? 'bg-ayush-forest text-white shadow-sm'
                    : 'bg-ayush-sage/60 text-ayush-charcoal hover:bg-ayush-sage'
                }`}
              >
                {sys.icon}
                <span>{sys.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Heading & Description */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">{currentSectionMeta.emoji}</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ayush-forest">
              {currentSectionMeta.name}
            </h2>
          </div>
          <p className="text-sm font-body text-ayush-charcoal/70">
            {currentSectionMeta.description}
          </p>
        </div>

        {/* Grid of What's New Cards */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ayush-forest/10 shadow-sm max-w-lg mx-auto">
            <div className="text-4xl mb-4">{currentSectionMeta.emoji}</div>
            <h3 className="text-xl font-display font-bold text-ayush-forest mb-2">No updates found</h3>
            <p className="text-sm font-body text-ayush-charcoal/70 mb-6">
              No content matched your filter for this subsection. Try clearing your search query or submit the first update.
            </p>
            <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedSystem('all'); setActiveSubSection('all'); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const secMeta = SUBSECTIONS.find(s => s.id === item.category);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-3xl overflow-hidden border border-ayush-forest/10 hover:border-ayush-gold/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Banner Image */}
                  <div className="h-44 w-full bg-ayush-sage relative overflow-hidden">
                    <img
                      src={item.banner_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                    {/* Category & Type Pills */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-ayush-forest font-ui font-bold text-xs shadow-sm flex items-center gap-1">
                        <span>{secMeta?.emoji}</span>
                        <span className="capitalize">{item.category}</span>
                      </span>
                      {item.type && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white font-ui font-medium text-[11px]">
                          {item.type}
                        </span>
                      )}
                    </div>

                    {/* System Tag */}
                    {item.system && item.system !== 'general' && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-ayush-gold text-ayush-forest font-ui font-bold text-[11px] uppercase tracking-wider shadow-sm">
                          {item.system}
                        </span>
                      </div>
                    )}

                    {/* Date/Location in Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-ui">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-ayush-gold" /> {item.published_date}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-ayush-gold flex-shrink-0" /> {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-display font-bold text-lg text-ayush-forest mb-2 leading-snug group-hover:text-ayush-gold transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="font-body text-ayush-charcoal/70 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[11px] font-ui bg-ayush-sage/40 text-ayush-forest px-2.5 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer / Read More */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="text-xs font-ui text-ayush-charcoal/60 truncate max-w-[180px]">
                        {item.author_or_org || 'AYUSH Portal'}
                      </span>
                      <span className="text-xs font-ui font-bold text-ayush-forest group-hover:text-ayush-gold flex items-center gap-1">
                        Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Item View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-ayush-forest/10 relative max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 text-ayush-charcoal/50 hover:text-ayush-forest transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner */}
            {selectedItem.banner_url && (
              <div className="w-full h-56 rounded-2xl overflow-hidden relative shadow-sm">
                <img
                  src={selectedItem.banner_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-ayush-forest font-ui font-bold text-xs">
                  {selectedItem.category.toUpperCase()}
                </div>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-ui text-ayush-charcoal/60 mb-2">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-ayush-gold" /> {selectedItem.published_date}</span>
                {selectedItem.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-ayush-gold" /> {selectedItem.location}</span>
                )}
                {selectedItem.system && (
                  <span className="px-2 py-0.5 rounded-full bg-ayush-gold/20 text-ayush-forest font-bold uppercase text-[10px]">
                    {selectedItem.system}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ayush-forest leading-tight">
                {selectedItem.title}
              </h2>
              <p className="text-xs font-ui text-ayush-charcoal/60 mt-1">
                Published by: <strong>{selectedItem.author_or_org || 'AYUSH Portal'}</strong>
              </p>
            </div>

            <div className="prose font-body text-ayush-charcoal/80 text-sm sm:text-base leading-relaxed border-t border-b border-gray-100 py-4">
              <p className="font-semibold text-ayush-forest text-base mb-3">{selectedItem.summary}</p>
              <p>
                {selectedItem.content ||
                  `This update has been officially categorized under the ${selectedItem.category} section of Ayushline®. For additional inquiries, registrations, or academic citations, verified practitioners and members can collaborate directly via the AYUSH community portal.`}
              </p>
            </div>

            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((t, i) => (
                  <span key={i} className="text-xs font-ui bg-ayush-sage/40 text-ayush-forest px-3 py-1 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {selectedItem.category === 'events' ? (
                <button
                  type="button"
                  onClick={() => {
                    requireAuth('register for this event', () => {
                      alert(`Successfully registered for "${selectedItem.title}"! Confirmation has been sent to your email.`);
                    });
                  }}
                  className="flex-1 py-3 px-6 bg-ayush-forest text-white rounded-2xl font-ui font-bold text-sm hover:bg-ayush-gold hover:text-ayush-forest transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> RSVP / Register for Event
                </button>
              ) : selectedItem.category === 'careers' ? (
                <button
                  type="button"
                  onClick={() => {
                    requireAuth('apply for this career vacancy', () => {
                      alert(`Application initiated for "${selectedItem.title}". Our team will contact you.`);
                    });
                  }}
                  className="flex-1 py-3 px-6 bg-ayush-forest text-white rounded-2xl font-ui font-bold text-sm hover:bg-ayush-gold hover:text-ayush-forest transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" /> Apply for Position
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-ayush-charcoal/80 rounded-2xl font-ui font-semibold text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post / Submit Update Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-ayush-forest/10 relative max-h-[90vh] overflow-y-auto animate-scale-up">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 text-ayush-charcoal/50 hover:text-ayush-forest transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-ayush-forest">Post to What's New</h3>
              <p className="text-xs font-body text-ayush-charcoal/70 mt-1">
                Share news, events, job openings, blog insights, or research papers with the AYUSH community.
              </p>
            </div>

            {submitFeedback && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm font-ui flex items-center gap-2 mb-4 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>{submitFeedback}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-2">
                  Select Subsection *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUBSECTIONS.filter(s => s.id !== 'all').map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setFormCategory(sec.id)}
                      className={`p-2 rounded-xl text-xs font-ui font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        formCategory === sec.id
                          ? 'bg-ayush-gold text-ayush-forest border-ayush-gold font-bold shadow-sm'
                          : 'bg-ayush-cream border-gray-200 text-ayush-charcoal/80 hover:bg-ayush-sage/40'
                      }`}
                    >
                      <span>{sec.emoji}</span>
                      <span>{sec.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. National Seminar on Herbal Formulations"
                  className="w-full p-3 bg-ayush-sage/30 border border-gray-200 rounded-xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
                />
              </div>

              {/* System & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                    AYUSH System
                  </label>
                  <select
                    value={formSystem}
                    onChange={(e) => setFormSystem(e.target.value as any)}
                    className="w-full p-3 bg-ayush-sage/30 border border-gray-200 rounded-xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
                  >
                    <option value="general">General (All AYUSH)</option>
                    <option value="ayurveda">Ayurveda</option>
                    <option value="yoga">Yoga</option>
                    <option value="unani">Unani</option>
                    <option value="siddha">Siddha</option>
                    <option value="homeopathy">Homeopathy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                    Type / Sub-heading
                  </label>
                  <input
                    type="text"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    placeholder="e.g. Webinar, Vacancy, Policy"
                    className="w-full p-3 bg-ayush-sage/30 border border-gray-200 rounded-xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
                  >
                  </input>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                  Location / Mode (Optional)
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. New Delhi, India or Online via Zoom"
                  className="w-full p-3 bg-ayush-sage/30 border border-gray-200 rounded-xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                  Summary & Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Provide comprehensive details, key objectives, dates, eligibility or findings..."
                  className="w-full p-3 bg-ayush-sage/30 border border-gray-200 rounded-xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Ayurveda, Clinical, Jobs"
                  className="w-full p-3 bg-ayush-sage/30 border border-gray-200 rounded-xl font-ui text-sm focus:outline-none focus:border-ayush-gold"
                />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider mb-1">
                  Banner Image (Optional)
                </label>
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ayush-forest file:text-white hover:file:bg-ayush-gold"
                />
                {bannerError && <p className="text-xs text-red-600 mt-1">{bannerError}</p>}
                {formBannerUrl && (
                  <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-gray-200">
                    <img src={formBannerUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-ayush-gold text-ayush-forest font-ui font-bold rounded-2xl shadow-md hover:bg-ayush-forest hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-ayush-charcoal/80 rounded-2xl font-ui font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsNew;
