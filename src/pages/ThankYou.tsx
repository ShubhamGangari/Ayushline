import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <div className="bg-ayush-cream min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 shadow-lg border border-ayush-forest/10 text-center max-w-md w-full">
        <Leaf className="w-20 h-20 text-ayush-gold mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold text-ayush-forest mb-4">Thank You!</h1>
        <p className="font-body text-ayush-charcoal/70 mb-8">
          Your submission has been received successfully. Our team will review it and get back to you shortly.
        </p>
        <Link to="/" className="inline-block px-6 py-3 rounded-full bg-ayush-gold text-ayush-forest font-ui font-semibold hover:bg-ayush-forest hover:text-white transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
