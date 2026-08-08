import { useState, useEffect } from 'react';
import { Stethoscope, GraduationCap, Building2, ArrowLeft, Leaf } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CustomSignIn from '../components/auth/CustomSignIn';
import CustomSignUp from '../components/auth/CustomSignUp';
import CustomForgotPassword from '../components/auth/CustomForgotPassword';
import { type UserRole } from '../lib/api/profiles';

const Join = () => {
  const [roleSelected, setRoleSelected] = useState<UserRole>('user');
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const roleParam = (searchParams.get('role') as UserRole) || roleSelected;

  const isSignIn = currentPath.includes('sign-in');
  const isForgotPassword = currentPath.includes('forgot-password');
  const isSignUp = currentPath.includes('sign-up') || (!isSignIn && !isForgotPassword && roleSelected !== 'user');

  // Auto-redirect when already signed in. The page itself renders instantly —
  // this effect only fires once auth state is known (Clerk loads in the
  // background), so signed-in users are never stuck on a loading screen.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate, location.state]);

  const handleSelectRole = (r: UserRole) => {
    setRoleSelected(r);
    navigate(`/join/sign-up?role=${r}`);
  };

  const renderForm = () => {
    if (isForgotPassword) {
      return (
        <CustomForgotPassword
          onBack={() => navigate('/join/sign-in')}
          afterResetUrl="/join/sign-in"
        />
      );
    }

    if (isSignIn) {
      return (
        <CustomSignIn
          onBack={() => navigate('/join')}
          afterSignInUrl="/dashboard"
        />
      );
    }

    if (isSignUp) {
      return (
        <CustomSignUp
          onBack={() => navigate('/join')}
          afterSignUpUrl="/dashboard"
          selectedRole={roleParam}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-ayush-cream flex flex-col md:flex-row">
      {/* Left Banner */}
      <div className="w-full md:w-5/12 bg-ayush-forest bg-mandala text-ayush-cream flex flex-col justify-center items-center p-12 relative overflow-hidden hidden md:flex">
        <div className="absolute inset-0 bg-ayush-forest/60 mix-blend-multiply"></div>
        <div className="relative z-10 text-center max-w-md">
          <Leaf className="w-24 h-24 text-ayush-gold mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl font-display font-bold mb-4">Holistic Health, Holistic Life.</h2>
          <p className="font-body text-ayush-ivory/80 text-lg">
            "Sharing the wisdom ensures continuation and upgradation of wisdom."
          </p>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-ayush-cream relative">
        <div className="w-full max-w-xl">

          {!isSignIn && !isForgotPassword && !isSignUp && (
            <div className="mb-8 text-center md:text-left">
              <Link to="/" className="inline-block md:hidden mb-6 text-ayush-gold">
                <Leaf className="w-12 h-12 mx-auto" />
              </Link>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-ayush-forest mb-2">
                Join the Community
              </h1>
              <p className="text-ayush-charcoal/70 font-body">Select your role to get started.</p>
            </div>
          )}

          {!isSignIn && !isForgotPassword && !isSignUp && (
            <div className="space-y-4">
              <button
                onClick={() => handleSelectRole('doctor')}
                className="w-full bg-white p-6 rounded-2xl border border-ayush-charcoal/10 hover:border-ayush-gold hover:shadow-md transition-all flex items-center group text-left"
              >
                <div className="w-12 h-12 rounded-full bg-ayush-sage flex items-center justify-center text-ayush-forest mr-4 group-hover:bg-ayush-gold group-hover:text-white transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-ayush-forest group-hover:text-ayush-gold">
                    AYUSH Practitioner
                  </h3>
                  <p className="text-sm font-body text-ayush-charcoal/70 mt-1">
                    Connect, share clinical experiences, manage consultations & WhatsApp inquiries.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('student')}
                className="w-full bg-white p-6 rounded-2xl border border-ayush-charcoal/10 hover:border-ayush-gold hover:shadow-md transition-all flex items-center group text-left"
              >
                <div className="w-12 h-12 rounded-full bg-ayush-sage flex items-center justify-center text-ayush-forest mr-4 group-hover:bg-ayush-gold group-hover:text-white transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-ayush-forest group-hover:text-ayush-gold">
                    AYUSH Student
                  </h3>
                  <p className="text-sm font-body text-ayush-charcoal/70 mt-1">
                    Access study materials, book consultations, and learn from experts.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('org')}
                className="w-full bg-white p-6 rounded-2xl border border-ayush-charcoal/10 hover:border-ayush-gold hover:shadow-md transition-all flex items-center group text-left"
              >
                <div className="w-12 h-12 rounded-full bg-ayush-sage flex items-center justify-center text-ayush-forest mr-4 group-hover:bg-ayush-gold group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-ayush-forest group-hover:text-ayush-gold">
                    Organization / Institution
                  </h3>
                  <p className="text-sm font-body text-ayush-charcoal/70 mt-1">
                    Host webinars/events, manage registrations, and moderate content.
                  </p>
                </div>
              </button>

              <div className="mt-8 text-center border-t border-ayush-charcoal/10 pt-6">
                <p className="text-sm font-ui text-ayush-charcoal">
                  Already have an account?{' '}
                  <Link to="/join/sign-in" className="font-semibold text-ayush-forest hover:text-ayush-gold transition-colors">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          )}

          {(isSignIn || isForgotPassword || isSignUp) && (
            <div>
              {renderForm()}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Join;
