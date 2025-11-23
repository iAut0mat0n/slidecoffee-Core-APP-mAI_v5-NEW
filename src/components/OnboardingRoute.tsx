import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, supabaseUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, [supabaseUser]);

  const checkEmailVerification = async () => {
    try {
      // If user is authenticated via AuthContext, check their email verification status
      if (supabaseUser) {
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        
        // Check if Supabase has email confirmation enabled
        // email_confirmed_at is undefined if feature not enabled, null if enabled but not confirmed, or a date if confirmed
        const confirmationField = supabaseUser.email_confirmed_at;
        
        if (confirmationField === undefined) {
          // Email confirmation not enabled in Supabase - allow access
          setEmailVerified(true);
          if (pendingEmail) {
            localStorage.removeItem('pendingVerificationEmail');
          }
        } else if (confirmationField === null) {
          // Email confirmation enabled but not confirmed yet
          if (pendingEmail) {
            // User is in the verification process
            setEmailVerified(false);
          } else {
            // No pending verification (e.g., logged in existing unverified user)
            // Allow access anyway (Supabase gave them a session)
            setEmailVerified(true);
          }
        } else {
          // Email confirmed (confirmationField is a date)
          setEmailVerified(true);
          if (pendingEmail) {
            localStorage.removeItem('pendingVerificationEmail');
          }
        }
      } else {
        // No authenticated user yet
        setEmailVerified(false);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
      setEmailVerified(false);
    } finally {
      setChecking(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}
