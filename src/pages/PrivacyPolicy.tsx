import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-ayush-gold font-ui text-sm mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-3xl shadow-md border border-ayush-forest/10 p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Leaf className="w-10 h-10 text-ayush-gold mr-3" />
            <h1 className="text-4xl font-display font-bold text-ayush-forest">Privacy Policy</h1>
          </div>
          
          <div className="space-y-6 font-body text-ayush-charcoal/80 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">1. Introduction</h2>
              <p>Ayushline ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website at https://ayushline.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">2. Information We Collect</h2>
              <p><strong>Personal Information:</strong> We collect information you voluntarily provide, such as your name, email address, and membership details when you register or submit content.</p>
              <p className="mt-2"><strong>Usage Data:</strong> We may collect information about how you interact with our website, including pages visited, time spent, and browser type for analytical purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">3. How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide and maintain our services</li>
                <li>Process your membership and registration</li>
                <li>Improve our platform and content</li>
                <li>Communicate with you about updates and events</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">4. Data Storage & Security</h2>
              <p>We store your data securely using industry-standard encryption and access controls. We do not sell, trade, or share your personal information with third parties without your consent.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">5. Cookies</h2>
              <p>Our website may use cookies to enhance your browsing experience. You can disable cookies through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">6. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information at any time. Contact us at home@ayushline.com to exercise these rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">7. Contact Us</h2>
              <p>For privacy-related inquiries, please contact us at:</p>
              <p className="mt-1">Email: home@ayushline.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
