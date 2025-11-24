import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, supabaseUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userCheckComplete, setUserCheckComplete] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, [supabaseUser, user, authLoading]);

  const checkEmailVerification = async () => {
    try {
      // Wait for AuthContext to finish loading user from database
      // supabaseUser is available immediately, but user requires DB fetch
      if (!authLoading) {
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
        setUserCheckComplete(true);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
      setEmailVerified(false);
      setUserCheckComplete(true);
    } finally {
      setChecking(false);
    }
  };

  // Show loading while AuthContext is loading OR while we're checking email verification
  if (authLoading || checking || !userCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Require both supabaseUser (auth session) AND user (database record)
  // This ensures user has a valid session AND exists in our database
  if (!supabaseUser || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}
