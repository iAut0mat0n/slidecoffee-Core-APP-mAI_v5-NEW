import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, supabaseUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userCheckComplete, setUserCheckComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 20; // 20 retries * 500ms = 10 seconds timeout

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
          
          // CRITICAL: If we have a supabaseUser but no database user yet,
          // don't mark check complete - keep waiting for AuthContext to create it
          // This prevents redirecting to /login during user creation race condition
          if (user || !supabaseUser.email_confirmed_at) {
            setUserCheckComplete(true);
            setRetryCount(0); // Reset retry count on success
          } else if (retryCount < MAX_RETRIES) {
            // User is authenticated and verified, but DB record is being created
            // Keep checking until user appears (AuthContext will create it)
            console.log(`⏳ Waiting for user record to be created in database... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            setTimeout(checkEmailVerification, 500); // Retry in 500ms
          } else {
            // Timeout: User creation took too long
            console.error('❌ Timeout waiting for user record creation');
            setUserCheckComplete(true); // Stop waiting and let redirect logic handle it
          }
        } else {
          // No authenticated user yet
          setEmailVerified(false);
          setUserCheckComplete(true);
        }
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
