import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';

type Status = 'pending' | 'waiting' | 'ready' | 'timeout' | 'no-auth' | 'unverified';

export default function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, supabaseUser } = useAuth();
  const [status, setStatus] = useState<Status>('pending');
  const [retriesLeft, setRetriesLeft] = useState(20); // 20 retries * 500ms = 10 seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Primary effect: Determine status based on auth state
  useEffect(() => {
    if (authLoading) {
      setStatus('pending');
      return;
    }

    if (!supabaseUser) {
      setStatus('no-auth');
      return;
    }

    // Check email verification
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    const confirmationField = supabaseUser.email_confirmed_at;
    
    const isEmailVerified = 
      confirmationField === undefined || // Email confirmation not enabled
      confirmationField !== null || // Email confirmed
      !pendingEmail; // No pending verification

    if (!isEmailVerified) {
      setStatus('unverified');
      return;
    }

    // Clear pending email if verified
    if (pendingEmail && confirmationField) {
      localStorage.removeItem('pendingVerificationEmail');
    }

    // Check for database user record
    if (user) {
      if (retriesLeft < 20) {
        console.log(`✅ User record found after ${20 - retriesLeft} retries`);
      }
      setStatus('ready');
      setRetriesLeft(20); // Reset for next time
    } else if (retriesLeft > 0) {
      setStatus('waiting');
    } else {
      console.error('❌ Timeout waiting for user record creation');
      setStatus('timeout');
    }
  }, [authLoading, supabaseUser, user, retriesLeft]);

  // Secondary effect: Handle retry timer when status is 'waiting'
  useEffect(() => {
    if (status === 'waiting') {
      console.log(`⏳ Waiting for user record... (${20 - retriesLeft + 1}/20)`);
      timerRef.current = setTimeout(() => {
        setRetriesLeft(prev => prev - 1);
      }, 500);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [status, retriesLeft]);

  // Show loading spinner while pending or waiting
  if (status === 'pending' || status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect based on final status
  if (status === 'no-auth' || status === 'timeout') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'unverified') {
    return <Navigate to="/verify-email" replace />;
  }

  // status === 'ready'
  return <>{children}</>;
}
