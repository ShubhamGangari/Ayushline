import { Leaf, Users, Globe2, ShieldCheck, HeartPulse } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-ayush-cream min-h-screen">
      {/* Hero Section */}
      <section className="bg-ayush-forest bg-mandala text-ayush-cream py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-ayush-forest/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Leaf className="w-16 h-16 text-ayush-gold mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">About Ayushline</h1>
          <p className="text-xl font-body text-ayush-ivory/90 max-w-3xl mx-auto">
            A unified global platform dedicated to preserving, sharing, and elevating the traditional healing systems of AYUSH.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-ayush-forest/5">
            <h2 className="text-3xl font-display font-bold text-ayush-forest mb-4 flex items-center">
               Our Mission
            </h2>
            <p className="font-body text-ayush-charcoal/80 leading-relaxed text-lg">
              To create a collaborative ecosystem where practitioners, students, and wellness enthusiasts can share authentic knowledge, clinical experiences, and research about traditional healing systems. We strive to bridge ancient wisdom with modern accessibility.
            </p>
          </div>
          <div className="bg-ayush-sage p-10 rounded-3xl border border-ayush-forest/5">
            <h2 className="text-3xl font-display font-bold text-ayush-forest mb-4 flex items-center">
               Our Vision
            </h2>
            <p className="font-body text-ayush-charcoal/80 leading-relaxed text-lg">
              A world where the holistic principles of Ayurveda, Yoga, Unani, Siddha, and Homeopathy are universally understood, respected, and integrated into global healthcare paradigms for the betterment of human life.
            </p>
          </div>
        </div>
      </section>

      {/* Community Model */}
      <section className="py-20 bg-ayush-forest text-ayush-ivory px-4 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-16">A Community-Driven Platform</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-ayush-gold/20 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-ayush-gold" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Peer Reviewed</h3>
              <p className="font-body text-ayush-ivory/70 text-sm">Content is shared by verified practitioners and reviewed by the community to ensure authenticity.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-ayush-gold/20 flex items-center justify-center mb-6">
                <Globe2 className="w-8 h-8 text-ayush-gold" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Global Reach</h3>
              <p className="font-body text-ayush-ivory/70 text-sm">Connecting traditional healers from rural India to wellness seekers across the globe.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-ayush-gold/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-ayush-gold" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Preserving Integrity</h3>
              <p className="font-body text-ayush-ivory/70 text-sm">We strictly moderate content to prevent misinformation and protect the sanctity of these ancient sciences.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-ayush-gold/20 flex items-center justify-center mb-6">
                <HeartPulse className="w-8 h-8 text-ayush-gold" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Holistic Focus</h3>
              <p className="font-body text-ayush-ivory/70 text-sm">Addressing root causes rather than just symptoms, promoting a truly holistic lifestyle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-24 px-4 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-display font-bold text-ayush-forest mb-4">Get Involved</h2>
        <p className="font-body text-ayush-charcoal/70 max-w-2xl mx-auto mb-16">
          Ayushline is built by the community, for the community. Whether you are a practitioner, student, or institution, there is a place for you here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="w-8 h-8 text-ayush-gold" />,
              title: 'Join as Practitioner',
              desc: 'Get listed on our verified network, share clinical experiences, and connect with patients seeking holistic care.',
              to: '/about/doctor-registration',
              cta: 'Register Your Practice',
            },
            {
              icon: <HeartPulse className="w-8 h-8 text-ayush-gold" />,
              title: 'Share Your Knowledge',
              desc: 'Publish articles, case studies, and research insights. Our editorial board reviews every submission to keep content authentic.',
              to: '/submit-content',
              cta: 'Submit an Article',
            },
            {
              icon: <Globe2 className="w-8 h-8 text-ayush-gold" />,
              title: 'Attend & Host Events',
              desc: 'Discover seminars, workshops, and webinars — or host your own and grow the AYUSH community globally.',
              to: '/events',
              cta: 'Explore Events',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-ayush-forest/5 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-ayush-sage flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-ayush-forest mb-3">{item.title}</h3>
              <p className="font-body text-sm text-ayush-charcoal/75 mb-6 flex-grow">{item.desc}</p>
              <Link to={item.to}>
                <Button variant="secondary" className="text-sm px-6 py-2.5">{item.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Registration CTA */}
      <section className="py-20 bg-ayush-ivory px-4 text-center">
        <h2 className="text-3xl font-display font-bold text-ayush-forest mb-6">Are you an AYUSH Practitioner?</h2>
        <p className="font-body text-ayush-charcoal/80 mb-8 max-w-xl mx-auto">
          Join our verified network of doctors to share your expertise, connect with patients, and contribute to the community.
        </p>
        <Link to="/about/doctor-registration">
          <Button variant="primary">Doctor Registration / Login</Button>
        </Link>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ayush-sage px-4 text-center">
        <h2 className="text-3xl font-display font-bold text-ayush-forest mb-6">Want to contribute?</h2>
        <p className="font-body text-ayush-charcoal/80 mb-8 max-w-xl mx-auto">
          We are always looking for passionate AYUSH professionals to join our editorial board or contribute articles.
        </p>
        <Link to="/join">
          <Button variant="secondary">Join as a Contributor</Button>
        </Link>
      </section>
    </div>
  );
};

export default About;
