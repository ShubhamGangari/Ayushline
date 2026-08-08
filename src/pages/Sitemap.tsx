import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sitemap = () => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Ayurveda', path: '/ayurveda' },
    { name: 'Yoga', path: '/yoga' },
    { name: 'Unani', path: '/unani' },
    { name: 'Siddha', path: '/siddha' },
    { name: 'Homeopathy', path: '/homeopathy' },
    { name: 'Consult', path: '/consult' },
    { name: 'Events', path: '/events' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'Join', path: '/join' },
    { name: 'Doctor Registration', path: '/about/doctor-registration' },
    { name: 'Submit Content', path: '/submit-content' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Disclaimer', path: '/disclaimer' },
    { name: 'Thank You', path: '/thank-you' },
  ];

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Leaf className="w-10 h-10 text-ayush-gold mr-3" />
          <h1 className="text-4xl font-display font-bold text-ayush-forest">Sitemap</h1>
        </div>
        
        <div className="bg-white rounded-3xl shadow-md border border-ayush-forest/10 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pages.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className="text-ayush-forest font-ui font-semibold hover:text-ayush-gold transition-colors text-sm"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
