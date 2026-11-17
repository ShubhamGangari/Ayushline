import React, { useState, useRef } from 'react';
import { PenTool, CheckCircle, ArrowLeft, Image as ImageIcon, AlertCircle, ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { createPost } from '../lib/api/posts';
import { uploadImage } from '../lib/uploadImage';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthRequiredModal } from '../components/auth/AuthRequiredModal';

const SubmitContent: React.FC = () => {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('ayurveda');
  const [type, setType] = useState('article');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageError, setImageError] = useState('');

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    try {
      const res = await uploadImage(file, 'posts', 900, 600, 0.85);
      setThumbnailUrl(res.url);
    } catch (err: any) {
      setImageError(err.message || 'Image size exceeds 2MB limit.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setAuthModalOpen(true);
      return;
    }
    setLoading(true);
    const res = await createPost({
      title,
      system,
      type,
      excerpt,
      content,
      author_name: authorName,
      thumbnail_url: thumbnailUrl,
    });
    setLoading(false);
    setMessage(res.message);
    setSubmitted(true);
  };

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName="submit or publish articles"
      />
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-ui text-ayush-charcoal/70 hover:text-ayush-forest mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>

        {!isSignedIn ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-ayush-forest/10 text-center space-y-6">
            <div className="w-20 h-20 bg-ayush-gold/20 text-ayush-forest rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10 text-ayush-forest" />
            </div>
            <div className="max-w-lg mx-auto space-y-3">
              <h2 className="text-3xl font-display font-bold text-ayush-forest">Login or Sign Up Required</h2>
              <p className="font-body text-ayush-charcoal/80 text-base leading-relaxed">
                To submit an article, publish case studies, or share health blogs on AYUSHLINE, please log in or create a free account.
              </p>
            </div>
            <div className="p-4 bg-ayush-cream/80 rounded-2xl border border-ayush-forest/10 max-w-md mx-auto text-xs font-ui text-ayush-forest font-semibold flex items-center justify-center gap-2">
              <span>🔒</span> Free registration takes less than 30 seconds!
            </div>
            <div className="pt-2 flex justify-center max-w-xs mx-auto">
              <Link
                to="/join"
                state={{ from: location.pathname }}
                className="w-full py-3.5 px-6 bg-ayush-forest text-white font-ui font-bold text-sm rounded-2xl hover:bg-ayush-gold hover:text-ayush-forest transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4" /> Log In / Sign Up
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-ayush-forest/10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-display font-bold text-ayush-forest">Article Submitted!</h2>
            <p className="font-body text-ayush-charcoal/80 max-w-md mx-auto">{message}</p>
            <div className="pt-4">
              <Button variant="primary" onClick={() => { setSubmitted(false); setTitle(''); setExcerpt(''); setContent(''); }}>
                Submit Another Article
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-ayush-forest/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-ayush-sage text-ayush-forest flex items-center justify-center">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-ayush-forest">Publish Your Knowledge</h1>
                <p className="text-ayush-charcoal/70 font-body text-sm">Submit your blog, article, or case study for peer review.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Gupta"
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Content Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui capitalize"
                  >
                    <option value="article">Article</option>
                    <option value="blog">Blog</option>
                    <option value="news">News</option>
                    <option value="case_study">Case Study</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">AYUSH System</label>
                  <select
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui capitalize"
                  >
                    <option value="ayurveda">Ayurveda</option>
                    <option value="yoga">Yoga</option>
                    <option value="unani">Unani</option>
                    <option value="siddha">Siddha</option>
                    <option value="homeopathy">Homeopathy</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Article Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Clinical Insights on Panchakarma"
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Featured Image / Header Banner (Optional, Max 2MB)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-ayush-ivory/50 p-4 rounded-xl border border-ayush-forest/20">
                  {thumbnailUrl ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-ayush-forest/20 flex-shrink-0">
                      <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-red-600"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-ayush-sage/40 flex items-center justify-center text-ayush-forest/50 flex-shrink-0">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-4 py-2 bg-ayush-forest text-white text-xs font-ui font-bold rounded-xl hover:bg-ayush-gold hover:text-ayush-forest transition-colors inline-flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4" /> Upload Article Thumbnail
                    </button>
                    <p className="text-xs text-ayush-charcoal/60 font-ui">Supports JPG, PNG, WebP (Max 2MB). Auto-compressed for fast loading.</p>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                {imageError && (
                  <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {imageError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Short Summary (Excerpt)</label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="2-3 sentence overview..."
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Full Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Write or paste your article text here..."
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui resize-y"
                  required
                ></textarea>
              </div>

              <Button type="submit" variant="primary" className="w-full justify-center py-4 text-lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitContent;
