import React, { useState } from 'react';
import { useSignUp, useGoogleOAuth, setLocalSession } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { User, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, GraduationCap, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createOrUpsertProfile, type UserRole } from '../../lib/api/profiles';
import { validateSignUpData, validateEmail } from '../../lib/authValidation';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);


interface CustomSignUpProps {
  onBack?: () => void;
  afterSignUpUrl?: string;
  selectedRole?: UserRole;
}

const CustomSignUp = ({ onBack, afterSignUpUrl = '/', selectedRole = 'user' }: CustomSignUpProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUpWithGoogle } = useGoogleOAuth();

  // Role-specific fields
  const [role, setRole] = useState<UserRole>(selectedRole);
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('BAMS');
  const [system, setSystem] = useState('ayurveda');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');

  const { signUp, isLoaded, setActive } = useSignUp();

  const saveProfileAndFinish = async (userId: string) => {
    const profileData: any = {
      name: name.trim(),
      email: email.trim(),
      role,
    };
    if (role === 'student') {
      profileData.college = college;
      profileData.qualification = degree;
      profileData.system = system;
      profileData.bio = bio;
    } else if (role === 'doctor') {
      profileData.specialization = specialization;
      profileData.qualification = qualification;
      profileData.experience_years = experienceYears ? parseInt(experienceYears, 10) : 0;
      profileData.system = system;
      profileData.address = clinicName;
      profileData.city = city;
      profileData.whatsapp = whatsapp;
      profileData.bio = bio;
    }
    await createOrUpsertProfile(userId, profileData);
    window.location.href = afterSignUpUrl;
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError('');

    if (val.trim()) {
      const res = validateEmail(val);
      if (res.suggestion) {
        setSuggestion(res.suggestion);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    // Pre-submission thorough validation
    const validation = validateSignUpData({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Validation error');
      return;
    }

    setLoading(true);

    try {
      if (!signUp) {
        setError('Auth system is initializing. Please try again.');
        setLoading(false);
        return;
      }

      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || undefined;

      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });
        await saveProfileAndFinish(result.createdUserId || '');
      } else {
        // Trigger email code OTP send if available
        if (signUp.prepareEmailAddressVerification) {
          try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          } catch {
            // If already prepared, proceed
          }
        }
        setVerificationSent(true);
      }
    } catch (err: any) {
      const rawMsg = err.errors?.[0]?.message || err.message || '';
      const code = err.errors?.[0]?.code || '';

      if (code === 'form_identifier_exists' || rawMsg.includes('already exists') || rawMsg.includes('taken')) {
        setError('An account with this email address is already registered. Please Sign In.');
      } else {
        setError(rawMsg || 'Account creation failed. Please check details and try again.');
      }
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      if (signUp?.attemptEmailAddressVerification) {
        const result = await signUp.attemptEmailAddressVerification({
          code: otpCode.trim(),
        });

        if (result.status === 'complete' && setActive) {
          await setActive({ session: result.createdSessionId });
          await saveProfileAndFinish(result.createdUserId || '');
          return;
        } else {
          setError('Verification in progress. Please check and try again.');
        }
      } else {
        // Local demo mode verification
        const mockUser = {
          id: `usr_${Date.now()}`,
          email,
          name,
          role,
          createdAt: new Date().toISOString(),
        };
        setLocalSession(mockUser);
        await saveProfileAndFinish(mockUser.id);
        return;
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code. Please check your email and try again.');
    }
    setVerifyingOtp(false);
  };

  const handleResendCode = async () => {
    setError('');
    setInfoMsg('');
    try {
      if (signUp?.prepareEmailAddressVerification) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setInfoMsg('A new 6-digit OTP code has been sent to your email address!');
      } else {
        setInfoMsg('Demo Mode: Verification OTP code reset. You can enter any 6-digit code (e.g. 123456).');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to resend code. Please try again in a few seconds.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const started = await signUpWithGoogle({
        role,
        redirectUrlComplete: window.location.origin + afterSignUpUrl,
      });
      if (!started) {
        setError(
          'Google Sign-In could not connect. Allow this domain in your Clerk dashboard (Allowed Origins), then try again — or continue with email.'
        );
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign up with Google');
    }
    setGoogleLoading(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-ayush-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (verificationSent) {
    return (
      <div>
        <button
          onClick={() => {
            setVerificationSent(false);
            setError('');
            setInfoMsg('');
          }}
          className="text-ayush-charcoal/50 hover:text-ayush-charcoal flex items-center text-sm font-ui mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Change Email / Edit Details
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-ayush-charcoal/5">
          <div className="w-16 h-16 rounded-full bg-ayush-sage flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-ayush-forest" />
          </div>

          <h1 className="text-2xl font-display font-bold text-ayush-forest text-center mb-1">
            Enter Verification OTP
          </h1>
          <p className="text-ayush-charcoal/70 font-body text-sm text-center mb-6">
            We've sent a 6-digit verification code to <strong className="text-ayush-forest">{email}</strong>
          </p>

          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs leading-relaxed font-body">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Verification Code Sent:
            </p>
            <p className="text-emerald-900/90">
              A 6-digit verification code (OTP) has been dispatched to <strong>{email}</strong>.
              Please check your <strong>Inbox</strong> and <strong>Spam / Junk folder</strong>.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="block w-full py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-bold transition-all"
                placeholder="123456"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 text-base font-semibold"
              disabled={verifyingOtp || otpCode.length < 4}
            >
              {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP & Complete Setup'}
            </Button>

            <div className="flex items-center justify-between pt-2 text-xs font-ui text-ayush-charcoal/70">
              <button
                type="button"
                onClick={handleResendCode}
                className="font-semibold text-ayush-forest hover:text-ayush-gold transition-colors underline"
              >
                Resend Code
              </button>
              <Link
                to="/join/sign-in"
                className="font-semibold text-ayush-forest hover:text-ayush-gold transition-colors"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-ayush-charcoal/50 hover:text-ayush-charcoal flex items-center text-sm font-ui mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to roles
        </button>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-ayush-charcoal/5">
        <h1 className="text-2xl font-display font-bold text-ayush-forest mb-1">Create Account</h1>
        <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
          Join the AYUSH community today to explore, consult and connect.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-5 border border-ayush-charcoal/20 rounded-xl bg-white hover:bg-ayush-ivory/50 font-ui font-semibold text-ayush-charcoal transition-all shadow-sm"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-ayush-gold border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ayush-charcoal/10"></div>
          </div>
          <div className="relative flex justify-center text-xs font-ui uppercase text-ayush-charcoal/50">
            <span className="px-3 bg-white">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-ui font-semibold text-sm transition-all ${role === 'student' ? 'border-ayush-forest bg-ayush-forest text-white' : 'border-ayush-forest/20 text-ayush-forest hover:bg-ayush-sage'}`}
              >
                <GraduationCap className="w-4 h-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-ui font-semibold text-sm transition-all ${role === 'doctor' ? 'border-ayush-forest bg-ayush-forest text-white' : 'border-ayush-forest/20 text-ayush-forest hover:bg-ayush-sage'}`}
              >
                <Stethoscope className="w-4 h-4" /> Doctor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-ayush-charcoal/40" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all text-sm"
                placeholder="Dr. John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-ayush-charcoal/40" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            {suggestion && (
              <button
                type="button"
                onClick={() => {
                  const match = suggestion.match(/Did you mean (.+)\?/);
                  if (match?.[1]) handleEmailChange(match[1]);
                }}
                className="mt-1 text-xs text-ayush-forest font-ui underline hover:text-ayush-gold"
              >
                {suggestion}
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-ayush-charcoal/40" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all text-sm"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ayush-charcoal/40 hover:text-ayush-charcoal"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-ayush-charcoal/40" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all text-sm"
                placeholder="Re-enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ayush-charcoal/40 hover:text-ayush-charcoal"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-ui px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div id="clerk-captcha"></div>

          <Button type="submit" variant="primary" className="w-full justify-center py-3" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm font-ui pt-2">
            <p className="text-ayush-charcoal/70">
              Already have an account?{' '}
              <Link
                to="/join/sign-in"
                className="font-semibold text-ayush-forest hover:text-ayush-gold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomSignUp;
