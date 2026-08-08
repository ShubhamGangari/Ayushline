import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, isClerkConfigured } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { ShieldCheck } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const RequireAuth = ({ children, redirectTo = '/join' }: RequireAuthProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export const RequireAdmin = ({ children, redirectTo = '/join' }: RequireAuthProps) => {
  const { isAdmin, isLoaded } = useAdmin();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded || !authLoaded) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-ayush-forest/10">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-ayush-forest mb-2">Access Denied</h1>
          <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
            You do not have administrator permissions to access this area.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-ayush-forest text-white py-3 rounded-full font-ui font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const isAuthReady = isClerkConfigured;
