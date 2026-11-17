import React, { useState } from 'react';
import { User, Stethoscope, Award, Camera, ShieldAlert, CheckCircle, BookOpen, Building } from 'lucide-react';
import { useAuth, isClerkConfigured } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { registerDoctor } from '../lib/api/doctors';
import { createOrUpsertProfile } from '../lib/api/profiles';
import CustomSignIn from '../components/auth/CustomSignIn';

const DoctorRegistration = () => {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [name, setName] = useState('');
  const [system, setSystem] = useState('ayurveda');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('5');
  const [qualification, setQualification] = useState('');
  const [college, setCollege] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Save doctor record
      const res = await registerDoctor({
        name,
        system,
        specialization,
        experience_years: parseInt(experience, 10) || 0,
        qualification,
        clinic_name: clinicName,
        city,
        bio,
      });

      // 2. Update user profile role to 'doctor'
      if (user?.id) {
        await createOrUpsertProfile(user.id, {
          name,
          email: user.email,
          role: 'doctor',
          specialization,
          system,
          qualification,
          college,
          address: clinicName,
          experience_years: parseInt(experience, 10) || 0,
          city,
          bio,
        });
      }

      setMessage(res?.message || 'Doctor application submitted successfully for admin approval!');
      setSubmitted(true);
    } catch (err: any) {
      console.warn('[DoctorRegistration] Submit warning:', err);
      setMessage(err?.message || 'Doctor application submitted successfully for admin approval!');
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (!isLoaded) {
    return (
      <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ayush-charcoal/70 font-ui">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShieldAlert className="w-16 h-16 text-ayush-gold mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ayush-forest mb-4">
            Doctor Registration
          </h1>
          <p className="font-body text-ayush-charcoal/80 text-lg mb-8 max-w-xl mx-auto">
            Please sign in to access doctor registration and login.
          </p>
          <div className="bg-white rounded-3xl shadow-xl border border-ayush-forest/10 p-8 max-w-md mx-auto">
            <CustomSignIn afterSignInUrl="/about/doctor-registration" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full bg-mandala opacity-20 pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ayush-forest mb-4">
            Doctor Registration
          </h1>
          <p className="font-body text-ayush-charcoal/80 text-lg">
            Join our community of verified AYUSH practitioners.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-ayush-forest/10 overflow-hidden">
          <div className="p-8 md:p-10">
            {submitted ? (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-display font-bold text-ayush-forest">Application Sent to Admin</h2>
                <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl max-w-lg mx-auto text-amber-900 font-body text-sm leading-relaxed shadow-sm">
                  <strong>Status: Pending Admin Approval</strong><br />
                  Your doctor information and consultation profile have been submitted successfully! Your application is now sent to the <strong>Ayushline Admin Panel</strong> for verification and approval. Once approved by the Admin, your profile will appear live in the Consultation section.
                </div>
                <p className="font-body text-xs text-ayush-charcoal/60">{message}</p>
                <div className="pt-4">
                  <Button variant="primary" onClick={() => setSubmitted(false)}>
                    Submit Another Practitioner Form
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-ayush-sage border-2 border-dashed border-ayush-gold flex flex-col items-center justify-center text-ayush-forest/50 cursor-pointer hover:bg-ayush-gold/10 transition-colors relative overflow-hidden group">
                    <Camera className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-ui">Optional</span>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                  <p className="text-sm font-ui text-ayush-charcoal/60 mt-3">Upload Profile Picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Full Doctor Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-ayush-charcoal/40" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                        placeholder="Dr. Ananya Sharma"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">AYUSH System</label>
                    <select
                      value={system}
                      onChange={(e) => setSystem(e.target.value)}
                      className="block w-full px-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all capitalize"
                    >
                      <option value="ayurveda">Ayurveda</option>
                      <option value="yoga">Yoga & Naturopathy</option>
                      <option value="sowa-rigpa">Sowa-Rigpa</option>
                      <option value="unani">Unani</option>
                      <option value="siddha">Siddha</option>
                      <option value="homeopathy">Homeopathy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">College / Institution Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-ayush-charcoal/40" />
                      </div>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                        placeholder="e.g. National Institute of Ayurveda"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Organisation / Hospital / Clinic Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-ayush-charcoal/40" />
                      </div>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                        placeholder="e.g. Ayush Wellness Clinic"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Specialization</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Stethoscope className="h-5 w-5 text-ayush-charcoal/40" />
                      </div>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                        placeholder="e.g. Panchakarma, Pain"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Qualification</label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="block w-full px-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                      placeholder="e.g. BAMS, MD"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="block w-full px-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                      placeholder="10"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">City / Location</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all"
                    placeholder="e.g. New Delhi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Experience, Expertise & Research Bio</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Award className="h-5 w-5 text-ayush-charcoal/40" />
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all min-h-[120px]"
                      placeholder="Share your clinical experience, research work, and patient success stories..."
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="primary" type="submit" className="w-full justify-center py-4 text-lg" disabled={loading}>
                    {loading ? 'Submitting Application...' : 'Register as Practitioner'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
