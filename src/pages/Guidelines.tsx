const Guidelines = () => {
  return (
    <div className="bg-ayush-cream min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-ayush-forest mb-8 border-b border-ayush-charcoal/10 pb-6">
          Community Guidelines
        </h1>
        
        <div className="space-y-12 font-body text-ayush-charcoal/80 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4">1. Purpose of Ayushline</h2>
            <p className="mb-4">
              Ayushline is dedicated to the dissemination of authentic, evidence-based, and traditionally grounded knowledge concerning Ayurveda, Yoga, Unani, Siddha, and Homeopathy (AYUSH). Our goal is to foster a respectful environment for learning and sharing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4">2. Content Standards</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Accuracy & Authenticity:</strong> All shared content should be accurate and preferably referenced to classical texts (Samhitas, Materia Medica, etc.) or modern clinical research.</li>
              <li><strong>No Misinformation:</strong> Claims of "miracle cures" without substantial evidence are strictly prohibited.</li>
              <li><strong>Professionalism:</strong> Maintain a professional tone. Case studies should prioritize patient anonymity and comply with local healthcare privacy laws.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4">3. Community Interaction</h2>
            <p className="mb-4">
              We encourage healthy debate and discussion. However, we have a zero-tolerance policy for:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Hate speech, discrimination, or personal attacks against any community member.</li>
              <li>Disparaging remarks against any specific AYUSH system or allopathic medicine.</li>
              <li>Spam, unsolicited promotions, or self-aggrandizement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4">4. Editorial Review Process</h2>
            <p className="mb-4">
              All submitted articles, blogs, and case studies undergo a peer-review process by our editorial board. We reserve the right to edit for clarity, formatting, and adherence to these guidelines before publication.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4">5. Disclaimer</h2>
            <p className="mb-4">
              The content on Ayushline is for educational and informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.
            </p>
          </section>
          
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
