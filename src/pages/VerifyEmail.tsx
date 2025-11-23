import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import AppLogo from '../components/AppLogo';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      // Get email from router state or localStorage
      const emailFromState = location.state?.email;
      const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
      const userEmail = emailFromState || emailFromStorage;
      
      if (userEmail) {
        setEmail(userEmail);
      } else {
        // No email found, redirect to signup
        navigate('/signup');
        return;
      }

      // CRITICAL: Check for existing session immediately on mount
      // If user already has a session (e.g., email confirmation disabled),
      // don't wait for polling - redirect now
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !completedRef.current) {
        // User already has a session, allow them through
        completedRef.current = true;
        localStorage.removeItem('pendingVerificationEmail');
        navigate('/onboarding/welcome');
        return;
      }

      // No existing session, start polling
      checkEmailVerification();
      intervalRef.current = setInterval(checkEmailVerification, 3000);
    };
    
    init();

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const checkEmailVerification = async () => {
    try {
      // Avoid duplicate processing
      if (completedRef.current) return;

      // Refresh session to get latest auth state
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      const activeSession = refreshError ? 
        (await supabase.auth.getSession()).data.session : 
        session;
      
      if (activeSession?.user && !completedRef.current) {
        // Mark as completed to prevent duplicate processing
        completedRef.current = true;

        // Clear the interval immediately
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Key insight: If Supabase gave the user a session, they're authorized
        // This handles both cases:
        // 1. Email confirmation disabled → session created immediately
        // 2. Email confirmation enabled AND user clicked verification link → session created
        
        // Clear the pending verification flag and proceed
        localStorage.removeItem('pendingVerificationEmail');
        
        // Show success message only if email was actually confirmed
        if (activeSession.user.email_confirmed_at) {
          toast.success('Email verified successfully!');
        }
        
        navigate('/onboarding/welcome');
      }
      // If no session, keep waiting (user hasn't clicked verification link yet)
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setChecking(false);
    }
  };

  const resendVerificationEmail = async () => {
    setResending(true);
    try {
      if (!email) {
        toast.error('No email found');
        return;
      }

      const redirectUrl = `${window.location.origin}/verify-email`;
      console.log('📧 Resending verification email to:', email, 'with redirect:', redirectUrl);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      console.log('📧 Resend response:', { error: error?.message });

      if (error) throw error;
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('📧 Resend failed:', error);
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <AppLogo />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-16 h-1 bg-purple-600 rounded-full"></div>
            <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-center text-gray-600 mb-6">
              We sent a verification link to
            </p>
            <p className="text-center font-medium text-gray-900 mb-6">
              {email}
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900">
                Click the verification link in your email to continue. This page will automatically update when verified.
              </p>
            </div>

            {checking && (
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-6">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Checking verification status...</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={resendVerificationEmail}
                disabled={resending}
                className="w-full px-6 py-3 border border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={checkEmailVerification}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              >
                I've Verified My Email
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or click "Resend"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
