import React, { useEffect, useState } from 'react';
import { type Post, getAllPostsAdmin, updatePostStatus, deletePost } from '../../lib/api/posts';
import { Check, X, User, Trash2 } from 'lucide-react';

const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAllPostsAdmin();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleStatusChange = async (id: string | number, status: 'approved' | 'rejected') => {
    await updatePostStatus(id.toString(), status);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDeletePost = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    await deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const filteredPosts = posts.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ayush-forest">Articles & Content Moderation</h1>
          <p className="text-ayush-charcoal/70 font-body text-sm mt-1">Review user submitted articles before they are published to the public portal.</p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-full border border-ayush-forest/10 shadow-sm self-start">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-ui font-semibold capitalize transition-all ${
                filter === type ? 'bg-ayush-forest text-white' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ayush-charcoal/60 font-ui">Loading posts...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ayush-forest/10 text-ayush-charcoal/60 font-ui">
          No articles found for filter "{filter}".
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-6 border border-ayush-forest/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-ui font-bold uppercase tracking-wider bg-ayush-sage text-ayush-forest">
                    {post.system} • {post.type}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-ui font-semibold capitalize ${
                    post.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    post.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {post.status}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-ayush-forest">{post.title}</h3>
                <p className="font-body text-sm text-ayush-charcoal/80 line-clamp-2">{post.excerpt}</p>
                
                <div className="text-xs font-ui text-ayush-charcoal/50 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1" /> By {post.author_name || 'Contributor'}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {post.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(post.id, 'approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-ui text-xs font-semibold flex items-center shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </button>
                )}
                {post.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusChange(post.id, 'rejected')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-ui text-xs font-semibold flex items-center shadow-sm transition-all"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-ui text-xs font-semibold flex items-center shadow-sm transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
