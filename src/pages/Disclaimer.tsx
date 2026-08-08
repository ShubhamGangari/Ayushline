import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-ayush-gold font-ui text-sm mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-3xl shadow-md border border-ayush-forest/10 p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Leaf className="w-10 h-10 text-ayush-gold mr-3" />
            <h1 className="text-4xl font-display font-bold text-ayush-forest">Disclaimer</h1>
          </div>
          
          <div className="space-y-6 font-body text-ayush-charcoal/80 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">1. General Disclaimer</h2>
              <p>The information provided on Ayushline is for educational and informational purposes only. We do not guarantee the accuracy, completeness, or usefulness of any content on this platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">2. Medical Advice</h2>
              <p><strong>Not Medical Advice:</strong> Content on Ayushline is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your qualified healthcare provider with any questions you may have regarding a medical condition.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">3. No Doctor-Patient Relationship</h2>
              <p>Using this platform does not create a doctor-patient relationship. Content shared by practitioners is for general educational purposes only and should not be construed as personalized medical advice.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">4. Third-Party Content</h2>
              <p>Ayushline hosts user-generated content including articles, blogs, and testimonials. The views expressed by contributors are their own and do not necessarily reflect the views of Ayushline. We do not endorse or guarantee the accuracy of third-party content.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">5. External Links</h2>
              <p>Our platform may contain links to external websites. We are not responsible for the content, privacy practices, or terms of any external websites.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">6. Content Protection</h2>
              <p><strong>'Content is protected!!'</strong> All content on Ayushline is the intellectual property of its respective authors and Ayushline. Reproduction, distribution, or use of content without proper attribution or permission is prohibited.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">7. Limitation of Liability</h2>
              <p>Ayushline shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of this platform or its content.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-ayush-forest mb-3">8. Contact Us</h2>
              <p>For disclaimer-related inquiries, please contact us at:</p>
              <p className="mt-1">Email: home@ayushline.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
