import { useEffect } from 'react';
import { AuthenticateWithRedirectCallback, useUser, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { createOrUpsertProfile } from '../lib/api/profiles';
import { isClerkConfigured } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const SSOCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  const { signUp } = useSignUp();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // The role the user selected during sign-up was passed to Clerk as
      // unsafeMetadata — read it back so the profile (and therefore the
      // dashboard) reflects the correct role (doctor/student/org).
      const metadataRole =
        (user.unsafeMetadata as any)?.role ||
        (signUp?.unsafeMetadata as any)?.role ||
        (user.publicMetadata as any)?.role;

      void createOrUpsertProfile(user.id, {
        name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        role: metadataRole || 'user',
        avatar_url: user.imageUrl || null,
      });
      void navigate('/dashboard');
    }
  }, [isLoaded, isSignedIn, user, signUp, navigate]);

  if (!isClerkConfigured) {
    return <Navigate to="/" replace />;
  }

  return <AuthenticateWithRedirectCallback signInUrl="/join/sign-in" signUpUrl="/join/sign-up" />;
};

export default SSOCallback;
