import { Card, CardTag } from '../components/ui/Card';
import { ArrowRight, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getApprovedPosts, getPostImage, type Post } from '../lib/api/posts';

type SystemType = 'ayurveda' | 'yoga' | 'unani' | 'siddha' | 'homeopathy';

interface CategoryProps {
  system: SystemType;
  title: string;
  description: string;
}

const Category = ({ system, title, description }: CategoryProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const contentTypes = ['All', 'Blog', 'Article', 'News', 'Case Study', 'Review'];

  useEffect(() => {
    async function loadCategoryPosts() {
      const data = await getApprovedPosts(system);
      setPosts(data);
    }
    loadCategoryPosts();
  }, [system]);

  const filteredPosts = posts.filter(post => {
    const matchesType = selectedType === 'All' || (post.type && post.type.toLowerCase() === selectedType.toLowerCase().replace(' ', '_'));
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Show real community posts in the sidebar instead of placeholder topics
  const popularPosts = posts.slice(0, 4);

  return (
    <div className="w-full bg-ayush-cream min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full bg-ayush-forest bg-mandala py-24 border-b border-ayush-gold/20">
        <div className="absolute inset-0 bg-ayush-forest/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CardTag system={system}>{title}</CardTag>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-ayush-cream mt-4 mb-4">
            {title}
          </h1>
          <p className="text-xl text-ayush-ivory/90 font-body max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Feed */}
          <div className="lg:w-2/3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-ui transition-colors capitalize ${
                      selectedType === type ? 'bg-ayush-gold text-ayush-forest font-semibold' : 'bg-ayush-sage text-ayush-charcoal/70 hover:bg-ayush-gold/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 bg-ayush-sage border border-ayush-charcoal/10 rounded-full focus:outline-none focus:border-ayush-gold font-ui text-sm w-full sm:w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ayush-charcoal/40" />
              </div>
            </div>

            {/* Article Grid */}
            {filteredPosts.length === 0 ? (
              <div className="bg-ayush-sage p-12 rounded-2xl text-center text-ayush-charcoal/60 font-ui">
                No published articles found for "{title}" in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="flex flex-col h-full" system={system}>
                    <div className="h-40 bg-ayush-sage relative flex items-center justify-center text-ayush-forest/20 overflow-hidden">
                      <img
                        src={getPostImage(system, post.thumbnail_url, post.image, post.id)}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <span className="text-xs font-ui font-semibold text-ayush-charcoal/50 mb-2 uppercase tracking-wider">{post.type}</span>
                      <h3 className="text-xl font-display font-bold text-ayush-forest mb-3 leading-tight">{post.title}</h3>
                      <p className="font-body text-ayush-charcoal/70 text-sm mb-6 flex-grow">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-ui text-ayush-charcoal/50">{post.date || 'Recent'}</span>
                        <Link to={`/article/${post.id}`} className="text-sm font-ui font-semibold text-ayush-forest hover:text-ayush-gold flex items-center">
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Placeholder */}
            <div className="flex justify-center mt-12 gap-2">
               {[1, 2, 3].map((page, i) => (
                 <button key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-ui text-sm ${page === 1 ? 'bg-ayush-gold text-ayush-forest font-bold' : 'bg-ayush-sage text-ayush-charcoal hover:bg-ayush-gold/20'}`}>
                   {page}
                 </button>
               ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            {/* About System */}
            <div className="bg-ayush-sage p-6 rounded-2xl border border-ayush-forest/5">
              <h3 className="text-2xl font-display font-bold text-ayush-forest mb-4">About {title}</h3>
              <p className="font-body text-sm text-ayush-charcoal/80 mb-4 leading-relaxed">
                {description} This section provides a brief historical context and the fundamental principles that govern the practice and philosophy of the system.
              </p>
              <Link to="/about" className="text-ayush-gold font-ui text-sm font-semibold hover:underline flex items-center">
                Learn more about our {title} community <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Popular Posts */}
            <div className="bg-ayush-sage p-6 rounded-2xl border border-ayush-forest/5">
              <h3 className="text-xl font-display font-bold text-ayush-forest mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-ayush-gold" /> Popular in {title}
              </h3>
              {popularPosts.length === 0 ? (
                <p className="text-sm font-ui text-ayush-charcoal/50">No popular articles yet — be the first to publish!</p>
              ) : (
                <ul className="space-y-4">
                  {popularPosts.map((post) => (
                    <li key={post.id} className="border-b border-ayush-charcoal/10 pb-4 last:border-0 last:pb-0">
                      <Link to={`/article/${post.id}`} className="group block">
                        <h4 className="font-display font-semibold text-ayush-charcoal group-hover:text-ayush-gold transition-colors leading-snug mb-1 line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-xs font-ui text-ayush-charcoal/50">{post.date || 'Recent'}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* CTA Banner */}
            <div className="bg-ayush-forest p-6 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-mandala opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold text-ayush-cream mb-2">Share Your Expertise</h3>
                <p className="font-body text-sm text-ayush-ivory/80 mb-4">Contribute to the {title} community by publishing your articles.</p>
                <Link to="/submit-content">
                  <button className="bg-ayush-gold text-ayush-forest w-full py-2 rounded-full font-ui font-semibold text-sm hover:bg-opacity-90">
                    Submit Article
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Category;
