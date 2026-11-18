import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardTag } from '../components/ui/Card';
import { Leaf, ArrowRight, Activity, Droplets, Moon, FlaskConical, Stethoscope, GraduationCap, Building2, BookOpen, MessageSquare, PenTool, Video, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApprovedPosts, getPostImage, type Post } from '../lib/api/posts';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

import { AyurvedaIcon, YogaIcon, UnaniIcon, SiddhaIcon, HomeopathyIcon } from '../components/ui/SystemIcons';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadHomePosts() {
      const posts = await getApprovedPosts();
      setLatestPosts(posts.slice(0, 3));
    }
    loadHomePosts();
  }, []);

  const ayushPillars = [
    {
      id: 'ayurveda',
      name: 'Ayurveda',
      icon: <AyurvedaIcon className="w-8 h-8 mb-4" />,
      desc: 'Ancient Indian science of Doshas, Dhatus & natural healing.',
      system: 'ayurveda' as const,
    },
    {
      id: 'yoga',
      name: 'Yoga',
      icon: <YogaIcon className="w-8 h-8 mb-4" />,
      desc: 'Physical, mental & spiritual well-being through practice.',
      system: 'yoga' as const,
    },
    {
      id: 'unani',
      name: 'Unani',
      icon: <UnaniIcon className="w-8 h-8 mb-4" />,
      desc: 'Greco-Arab healing via humoral balance & herbs.',
      system: 'unani' as const,
    },
    {
      id: 'siddha',
      name: 'Siddha',
      icon: <SiddhaIcon className="w-8 h-8 mb-4" />,
      desc: 'Ancient Tamil system of balance & mineral remedies.',
      system: 'siddha' as const,
    },
    {
      id: 'homeopathy',
      name: 'Homeopathy',
      icon: <HomeopathyIcon className="w-8 h-8 mb-4" />,
      desc: "'Like cures like' with natural diluted substances.",
      system: 'homeopathy' as const,
    },
  ];

  return (
    <div className="w-full bg-ayush-cream">
      {/* Hero Section */}
      <section className="relative w-full bg-ayush-sage bg-mandala min-h-[calc(100vh-72px)] flex items-center overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-ayush-sage/40"></div>
        
        {/* AYUSH Watermark Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute text-ayush-gold/10 font-display font-bold text-[6rem] sm:text-[10rem] md:text-[14rem] leading-none whitespace-nowrap"
            initial={{ x: "100%", y: "10%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            AYUSH
          </motion.div>
          <motion.div
            className="absolute text-ayush-forest/5 font-display font-bold text-[8rem] sm:text-[14rem] md:text-[18rem] leading-none whitespace-nowrap"
            initial={{ x: "-50%", y: "40%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          >
            WISDOM
          </motion.div>
        </div>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="relative z-10 max-w-[1536px] mx-auto px-5 sm:px-8 lg:px-10 w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ayush-forest leading-[1.2] tracking-tight">
                Ancient Wisdom.<br />
                <span className="text-ayush-gold font-extrabold">Modern Knowledge.</span><br />
                One Platform.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-ayush-charcoal/85 font-body max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A universal AYUSH portal connecting verified practitioners, students, researchers, and wellness seekers globally.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/join" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-md font-bold rounded-2xl">
                    Register Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#explore" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto text-base px-8 py-3.5 bg-white/90 backdrop-blur-md shadow-sm border border-ayush-forest/10 font-bold rounded-2xl">
                    Explore AYUSH
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Visual Showcase Column */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative mx-auto">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white p-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop&q=75"
                    alt="AYUSH Healing & Wellness"
                    width="700"
                    height="450"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-[320px] lg:h-[350px] object-cover rounded-2xl"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=700&auto=format&fit=crop&q=75';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ayush-forest/85 via-transparent to-transparent rounded-2xl"></div>

                  <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                    <span className="px-3 py-1 bg-ayush-gold text-ayush-forest font-ui font-bold text-xs rounded-full uppercase tracking-wider inline-block">
                      AYUSH Excellence
                    </span>
                    <h3 className="text-xl font-display font-bold text-white">Holistic Healing Ecosystem</h3>
                    <p className="text-xs font-ui text-ayush-ivory/80">Ayurveda • Yoga • Unani • Siddha • Homeopathy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Welcome & Overview Strip */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className="py-20 bg-white text-center px-4"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-ayush-forest mb-6 tracking-tight">
            Welcome to Ayushline®
          </h2>
          <p className="font-body text-ayush-charcoal/80 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            Ayushline is a universal platform to preserve, share, and elevate the traditional AYUSH healing systems (Ayurveda, Yoga & Naturopathy, Unani, Siddha, and Homeopathy), connecting practitioners, students, and wellness seekers globally.
          </p>
        </div>
      </motion.section>

      {/* 5 AYUSH Pillars Section */}
      <section id="explore" className="py-24 bg-ayush-ivory px-4">
        <div className="max-w-[1600px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-ayush-forest mb-4">Explore AYUSH Systems</h2>
            <div className="w-24 h-1 bg-ayush-gold mx-auto"></div>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6"
          >
            {ayushPillars.map((pillar) => (
              <motion.div key={pillar.id} variants={fadeInUp}>
                <Card system={pillar.system} className="p-6 group cursor-pointer h-full">
                  {pillar.icon}
                  <h3 className="text-xl font-display font-bold text-ayush-forest mb-2 group-hover:text-ayush-gold transition-colors">{pillar.name}</h3>
                  <p className="text-sm font-body text-ayush-charcoal/80 mb-6">{pillar.desc}</p>
                  <Link to={`/${pillar.id}`} className="inline-flex items-center text-sm font-ui font-semibold text-ayush-charcoal group-hover:text-ayush-gold transition-colors">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Membership Types */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-[1600px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-ayush-forest mb-4">Who Is This For?</h2>
            <p className="text-lg text-ayush-charcoal/70 font-body">Join the ecosystem tailored to your role in the AYUSH community.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80', icon: <Stethoscope className="w-10 h-10 text-ayush-gold mb-4" />, title: 'AYUSH Practitioner', desc: 'Connect with peers, share clinical experiences, and grow your practice.', type: 'Practitioner' },
              { image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80', icon: <GraduationCap className="w-10 h-10 text-ayush-gold mb-4" />, title: 'AYUSH Student', desc: 'Access study materials, learn from experts, and prepare for your career.', type: 'Student' },
              { image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80', icon: <Building2 className="w-10 h-10 text-ayush-gold mb-4" />, title: 'Organization / Institution', desc: 'Promote your college, hospital, or wellness center to a global audience.', type: 'Organization' },
            ].map((member, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-ayush-sage rounded-2xl border border-ayush-forest/5 flex flex-col items-center text-center overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full h-48 relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.title}
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="400"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-ayush-forest/10 mix-blend-multiply"></div>
                </div>
                <div className="p-8 flex flex-col items-center flex-grow w-full">
                  {member.icon}
                  <h3 className="text-2xl font-display font-bold text-ayush-forest mb-3">{member.title}</h3>
                  <p className="font-body text-ayush-charcoal/80 mb-8 flex-grow">{member.desc}</p>
                  <Link to={`/join?type=${member.type.toLowerCase()}`} className="w-full">
                    <Button variant="secondary" className="w-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-ayush-gold hover:text-white transition-all duration-300">Join as {member.type} <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content Types Section */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        className="py-20 bg-ayush-sage text-ayush-forest text-center px-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-mandala opacity-50"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-10">Share Your Knowledge</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { label: 'Blogs', icon: <PenTool className="w-4 h-4" /> },
              { label: 'News', icon: <BookOpen className="w-4 h-4" /> },
              { label: 'Articles', icon: <BookOpen className="w-4 h-4" /> },
              { label: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
              { label: 'Interviews', icon: <Video className="w-4 h-4" /> },
              { label: 'Experiences', icon: <Activity className="w-4 h-4" /> },
              { label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
              { label: 'Analysis', icon: <Activity className="w-4 h-4" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-ayush-forest/10 font-ui text-sm hover:bg-ayush-gold hover:text-white transition-all duration-300 cursor-default shadow-sm">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <Link to="/submit-content">
            <Button variant="primary" className="shadow-sm">Submit Article Online</Button>
          </Link>
        </div>
      </motion.section>

      {/* Popular Content */}
      <section className="py-24 bg-ayush-ivory px-4">
        <div className="max-w-[1600px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="text-4xl font-display font-bold text-ayush-forest">Latest Insights</h2>
              <p className="text-ayush-charcoal/70 font-body mt-2">Discover recent articles and updates from the community.</p>
            </div>
            <Link to="/ayurveda" className="hidden md:flex items-center text-ayush-gold font-ui font-semibold hover:text-ayush-saffron transition-colors">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {latestPosts.map((post, i) => (
              <motion.div key={post.id || i} variants={fadeInUp} className="h-full">
                <Card className="flex flex-col h-full bg-white">
                  <div className="h-48 bg-ayush-sage relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                     <img
                       src={getPostImage(post.system, post.thumbnail_url, post.image, post.id)}
                       alt={post.title}
                       loading="lazy"
                       decoding="async"
                       width="600"
                       height="400"
                       className="absolute inset-0 w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.currentTarget;
                         target.onerror = null;
                         target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80';
                       }}
                     />
                     <div className="absolute inset-0 bg-ayush-forest/10 mix-blend-multiply"></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <CardTag system={(post.system as any) || 'ayurveda'}>{(post.system || 'ayurveda').charAt(0).toUpperCase() + (post.system || 'ayurveda').slice(1)}</CardTag>
                    <h3 className="text-xl font-display font-bold text-ayush-forest mb-3 leading-tight">{post.title}</h3>
                    <p className="font-body text-ayush-charcoal/70 text-sm mb-6 flex-grow">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-ui text-ayush-charcoal/50">{post.date || 'Recent'}</span>
                        <span className="text-xs font-ui text-ayush-charcoal/30">•</span>
                        <span className="text-xs font-ui text-ayush-charcoal/50">{post.readTime || '5 min read'}</span>
                      </div>
                      <Link to={`/article/${post.id}`} className="text-sm font-ui font-semibold text-ayush-forest hover:text-ayush-gold flex items-center">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-8 text-center md:hidden">
             <Link to="/ayurveda" className="inline-flex items-center text-ayush-gold font-ui font-semibold">
              View All Insights <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Join CTA Strip */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        className="bg-gradient-to-r from-ayush-sage to-ayush-ivory py-16 px-4 border-t border-b border-ayush-forest/10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-ayush-forest mb-4">Become Part of the AYUSH Community</h2>
          <p className="text-ayush-charcoal/80 font-body text-lg mb-8">Join thousands of practitioners and students dedicated to holistic health.</p>
          <Link to="/join">
            <button className="bg-ayush-gold text-white hover:bg-ayush-forest transition-colors duration-300 font-ui font-semibold text-lg px-10 py-4 rounded-full shadow-md">
              Register Now
            </button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
