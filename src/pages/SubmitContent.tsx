import React, { useState } from 'react';
import { PenTool, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { createPost } from '../lib/api/posts';
import { Link } from 'react-router-dom';

const SubmitContent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('ayurveda');
  const [type, setType] = useState('article');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createPost({
      title,
      system,
      type,
      excerpt,
      content,
      author_name: authorName,
    });
    setLoading(false);
    setMessage(res.message);
    setSubmitted(true);
  };

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-ui text-ayush-charcoal/70 hover:text-ayush-forest mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>

        {submitted ? (
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
