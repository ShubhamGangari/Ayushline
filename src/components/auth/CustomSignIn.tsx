import React, { useState } from 'react';
import { useSignIn, setLocalSession, saveLocalUser, isLocalAuthMode, useGoogleOAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { User, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../lib/authValidation';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

interface CustomSignInProps {
  onBack?: () => void;
  afterSignInUrl?: string;
}

const CustomSignIn = ({ onBack, afterSignInUrl = '/' }: CustomSignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isLoaded, setActive } = useSignIn();
  const { signInWithGoogle } = useGoogleOAuth();
  const navigate = useNavigate();

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

    // Pre-submission email validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Invalid email address format.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (!signIn) {
        setError('Auth system is initializing. Please try again.');
        setLoading(false);
        return;
      }

      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });
        window.location.href = afterSignInUrl;
      }
    } catch (err: any) {
      const rawMsg = err.errors?.[0]?.message || err.message || '';
      if (rawMsg.includes('identifier') || rawMsg.includes('user not found') || rawMsg.includes('Couldn\'t find')) {
        setError('No account found with this email address. Please Sign Up.');
      } else if (rawMsg.includes('password') || rawMsg.includes('incorrect')) {
        setError('Incorrect password! Please double-check your password and try again.');
      } else {
        setError(rawMsg || 'Sign in failed. Please check your credentials.');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const started = await signInWithGoogle({
        redirectUrlComplete: window.location.origin + afterSignInUrl,
      });
      if (!started) {
        setError(
          'Google Sign-In could not connect. Allow this domain in your Clerk dashboard (Allowed Origins), then try again — or sign in with email.'
        );
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign in with Google');
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
        <h1 className="text-2xl font-display font-bold text-ayush-forest mb-1">Welcome Back</h1>
        <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
          Enter your email and password to log in to your account.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
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
            <span className="px-3 bg-white">Or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
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

          <div className="flex items-center justify-between text-sm font-ui">
            <Link
              to="/join/forgot-password"
              className="text-ayush-gold font-semibold hover:text-ayush-forest transition-colors"
            >
              Forgot Password?
            </Link>
            <Link
              to="/join/sign-up"
              className="text-ayush-charcoal/70 hover:text-ayush-forest transition-colors font-medium"
            >
              Need an account? Sign Up
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center py-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {isLocalAuthMode() && (
          <div className="mt-8 pt-6 border-t border-ayush-charcoal/10">
            <p className="text-xs font-ui font-semibold text-ayush-forest uppercase tracking-wider text-center mb-3">
              ⚡ Quick Demo Login (Instant Preview Testing)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const user = {
                    id: 'demo_student_1',
                    email: 'student@ayushline.com',
                    name: 'Aarav Sharma (Student)',
                    role: 'student' as const,
                    avatarUrl: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=0D9488&color=fff',
                    createdAt: new Date().toISOString()
                  };
                  saveLocalUser(user);
                  setLocalSession(user);
                  navigate('/profile');
                }}
                className="py-2 px-3 bg-ayush-ivory hover:bg-ayush-gold/10 border border-ayush-forest/20 rounded-lg text-xs font-ui font-medium text-ayush-forest transition-all text-center"
              >
                🎓 Demo Student
              </button>
              <button
                type="button"
                onClick={() => {
                  const user = {
                    id: 'demo_doctor_1',
                    email: 'doctor@ayushline.com',
                    name: 'Dr. Priya Verma (Practitioner)',
                    role: 'doctor' as const,
                    avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Verma&background=5C8A3C&color=fff',
                    createdAt: new Date().toISOString()
                  };
                  saveLocalUser(user);
                  setLocalSession(user);
                  navigate('/profile');
                }}
                className="py-2 px-3 bg-ayush-ivory hover:bg-ayush-gold/10 border border-ayush-forest/20 rounded-lg text-xs font-ui font-medium text-ayush-forest transition-all text-center"
              >
                🩺 Demo Doctor
              </button>
              <button
                type="button"
                onClick={() => {
                  const user = {
                    id: 'demo_org_1',
                    email: 'org@ayushline.com',
                    name: 'Ayurveda Sansthan',
                    role: 'org' as const,
                    avatarUrl: 'https://ui-avatars.com/api/?name=Ayurveda+Sansthan&background=7B4FA6&color=fff',
                    createdAt: new Date().toISOString()
                  };
                  saveLocalUser(user);
                  setLocalSession(user);
                  navigate('/profile');
                }}
                className="py-2 px-3 bg-ayush-ivory hover:bg-ayush-gold/10 border border-ayush-forest/20 rounded-lg text-xs font-ui font-medium text-ayush-forest transition-all text-center"
              >
                🏥 Demo Institution
              </button>
              <button
                type="button"
                onClick={() => {
                  const user = {
                    id: 'demo_user_1',
                    email: 'user@ayushline.com',
                    name: 'Rahul Verma',
                    role: 'user' as const,
                    avatarUrl: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=D97706&color=fff',
                    createdAt: new Date().toISOString()
                  };
                  saveLocalUser(user);
                  setLocalSession(user);
                  navigate('/profile');
                }}
                className="py-2 px-3 bg-ayush-ivory hover:bg-ayush-gold/10 border border-ayush-forest/20 rounded-lg text-xs font-ui font-medium text-ayush-forest transition-all text-center"
              >
                👤 Demo User
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomSignIn;
