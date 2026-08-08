import React, { useState } from 'react';
import { useSignIn } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, Code, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '../../lib/authValidation';

interface CustomForgotPasswordProps {
  onBack?: () => void;
  afterResetUrl?: string;
}

type ForgotStep = 'email' | 'verify';

const CustomForgotPassword = ({ onBack, afterResetUrl = '/join/sign-in' }: CustomForgotPasswordProps) => {
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isLoaded, setActive } = useSignIn();

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid email format!');
      return;
    }

    setLoading(true);
    try {
      if (!signIn) return;
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('verify');
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to send reset email. Please check your email address.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const pwdVal = validatePassword(password, 6);
    if (!pwdVal.isValid) {
      setError(pwdVal.error || 'Invalid password.');
      return;
    }

    if (!code.trim()) {
      setError('Please enter the verification OTP code.');
      return;
    }

    setLoading(true);
    try {
      if (!signIn) return;
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });
        window.location.href = afterResetUrl;
      } else {
        setError('Unable to reset password. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to reset password. The OTP code may have expired.');
    }
    setLoading(false);
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
        {step === 'email' ? (
          <>
            <h1 className="text-2xl font-display font-bold text-ayush-forest mb-1">Forgot Password?</h1>
            <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
              Enter your registered email address to receive a password reset verification code.
            </p>

            <form onSubmit={handleSendReset} className="space-y-5">
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-ayush-charcoal/40" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-ui px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full justify-center py-3" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-display font-bold text-ayush-forest mb-1">Reset Password</h1>
            <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
              Verification code sent to <strong>{email}</strong>. Enter the OTP code and your new password below.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
                  Verification Code (OTP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Code className="h-5 w-5 text-ayush-charcoal/40" />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-ayush-forest/20 rounded-xl focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/50 font-ui transition-all text-center tracking-widest text-sm"
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">
                  New Password
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
                    placeholder="Enter new password"
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
                  Confirm New Password
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
                    placeholder="Confirm new password"
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

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-ui px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full justify-center py-3" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomForgotPassword;
