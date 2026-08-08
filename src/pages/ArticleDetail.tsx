import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, User, BookOpen, PenTool,
  ArrowRight, Stethoscope, Eye
} from 'lucide-react';
import { getPostById, getApprovedPosts, getPostImage, type Post } from '../lib/api/posts';
import { CardTag } from '../components/ui/Card';

const SYSTEM_LABELS: Record<string, string> = {
  ayurveda: 'Ayurveda',
  yoga: 'Yoga & Naturopathy',
  unani: 'Unani',
  siddha: 'Siddha',
  homeopathy: 'Homeopathy',
  naturopathy: 'Naturopathy',
  general: 'Community',
};

// Only these routes exist; everything else falls back to the Ayurveda feed.
const VALID_SYSTEM_ROUTES = ['ayurveda', 'yoga', 'unani', 'siddha', 'homeopathy'];
const getSystemRoute = (system: string) => (VALID_SYSTEM_ROUTES.includes(system) ? `/${system}` : '/ayurveda');

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!id) return;
      const article = await getPostById(id);
      setPost(article);
      if (article) {
        const all = await getApprovedPosts();
        const sameSystem = all.filter(
          (p) => String(p.id) !== String(id) && p.system.toLowerCase() === article.system.toLowerCase()
        );
        setRelated((sameSystem.length >= 2 ? sameSystem : all.filter((p) => String(p.id) !== String(id))).slice(0, 3));
      }
      setLoading(false);
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-ayush-cream flex flex-col items-center justify-center gap-4 px-4 text-center">
        <BookOpen className="w-16 h-16 text-ayush-forest/30" />
        <h1 className="text-2xl font-display font-bold text-ayush-forest">Article Not Found</h1>
        <p className="text-sm font-body text-ayush-charcoal/70 max-w-sm">
          This article may have been removed or is awaiting review.
        </p>
        <Link to="/ayurveda" className="text-ayush-gold hover:underline font-ui">
          ← Browse Community Articles
        </Link>
      </div>
    );
  }

  const systemKey = (post.system || 'ayurveda').toLowerCase();
  const contentBody = post.content || post.excerpt;

  return (
    <div className="bg-ayush-cream min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-ayush-forest text-ayush-cream overflow-hidden">
        <div className="absolute inset-0 bg-ayush-forest/85"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link
            to={getSystemRoute(systemKey)}
            className="inline-flex items-center text-ayush-ivory/70 hover:text-ayush-gold text-sm font-ui mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to {SYSTEM_LABELS[systemKey] || 'Articles'}
          </Link>

          <CardTag system={systemKey || 'ayurveda'}>
            {SYSTEM_LABELS[systemKey] || 'Article'}
          </CardTag>
          <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-6 max-w-3xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-ui text-ayush-ivory/80">
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-ayush-gold" /> {post.author_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ayush-gold" /> {post.date || 'Recent'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ayush-gold" /> {post.readTime || `${post.read_time_minutes || 5} min read`}
            </span>
            {typeof post.views === 'number' && post.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-ayush-gold" /> {post.views} views
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Article Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Article */}
          <article className="lg:col-span-2">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-ayush-charcoal/10">
              <div className="h-64 md:h-80 bg-ayush-sage relative overflow-hidden">
                <img
                  src={getPostImage(post.system, post.thumbnail_url, post.image, post.id)}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-ayush-forest/10 mix-blend-multiply"></div>
              </div>

              <div className="p-6 md:p-10">
                <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6">
                  {post.excerpt || 'Overview'}
                </h2>
                <div className="font-body text-base md:text-lg text-ayush-charcoal/85 leading-relaxed whitespace-pre-wrap">
                  {contentBody || 'Full article content is coming soon.'}
                </div>

                <div className="mt-10 pt-6 border-t border-ayush-charcoal/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ayush-forest text-ayush-gold font-bold text-sm flex items-center justify-center">
                      {(post.author_name || 'A').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-ui font-bold text-ayush-forest">{post.author_name || 'Community Contributor'}</p>
                      <p className="text-xs font-ui text-ayush-charcoal/50">{SYSTEM_LABELS[systemKey] || 'AYUSH'} Community</p>
                    </div>
                  </div>
                  <Link
                    to={getSystemRoute(systemKey)}
                    className="px-5 py-2.5 rounded-full bg-ayush-sage text-ayush-forest font-ui font-semibold text-sm hover:bg-ayush-gold hover:text-white transition-all inline-flex items-center gap-1.5"
                  >
                    More {SYSTEM_LABELS[systemKey] || 'Articles'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Share Your Knowledge CTA */}
            <div className="mt-8 bg-ayush-forest rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-mandala opacity-20"></div>
              <div className="relative z-10">
                <PenTool className="w-8 h-8 text-ayush-gold mx-auto mb-3" />
                <h3 className="text-2xl font-display font-bold text-ayush-cream mb-2">Written something valuable?</h3>
                <p className="font-body text-sm text-ayush-ivory/80 mb-5">
                  Share your clinical insights and research with the AYUSH community.
                </p>
                <Link
                  to="/submit-content"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ayush-gold text-ayush-forest font-ui font-semibold rounded-full hover:bg-white transition-all"
                >
                  Submit an Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
              <h3 className="text-lg font-display font-bold text-ayush-forest mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-ayush-gold" /> Related Articles
              </h3>
              {related.length === 0 ? (
                <p className="text-sm font-ui text-ayush-charcoal/50">No related articles found yet.</p>
              ) : (
                <div className="space-y-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/article/${r.id}`}
                      className="flex gap-3 p-3 rounded-2xl hover:bg-ayush-cream transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-ayush-sage">
                        <img
                          src={getPostImage(r.system, r.thumbnail_url, r.image, r.id)}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-ui font-bold text-ayush-forest text-sm leading-snug line-clamp-2 group-hover:text-ayush-gold transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs text-ayush-charcoal/50 font-ui mt-1">
                          {r.readTime || `${r.read_time_minutes || 5} min read`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-ayush-sage rounded-3xl p-6 border border-ayush-forest/5">
              <h3 className="text-lg font-display font-bold text-ayush-forest mb-3 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-ayush-gold" /> Need Expert Advice?
              </h3>
              <p className="text-sm font-body text-ayush-charcoal/80 mb-4">
                Connect with verified AYUSH practitioners for personalised guidance.
              </p>
              <Link
                to="/consult"
                className="w-full py-3 bg-ayush-forest text-white rounded-2xl font-ui font-semibold text-sm hover:bg-ayush-gold hover:text-ayush-forest transition-all flex items-center justify-center gap-2"
              >
                Book a Consultation
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
