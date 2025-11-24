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
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
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

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingCode(true);
    try {
      if (!email || !code) {
        toast.error('Please enter the verification code');
        return;
      }

      console.log('🔐 Verifying code for:', email);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      });

      if (error) {
        console.error('🔐 Verification error:', error);
        
        if (error.message?.includes('expired')) {
          toast.error('Code expired! Please click "Resend" and try again within 60 seconds.');
        } else if (error.message?.includes('invalid')) {
          toast.error('Invalid code. Please check the code in your email and try again.');
        } else {
          toast.error(error.message || 'Verification failed');
        }
        return;
      }

      if (data.session) {
        completedRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        localStorage.removeItem('pendingVerificationEmail');
        toast.success('Email verified successfully!');
        navigate('/onboarding/welcome');
      }
    } catch (error: any) {
      console.error('🔐 Verification failed:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setVerifyingCode(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before requesting another code`);
      return;
    }

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

      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          toast.error('Too many requests. Please wait 60 seconds and try again.');
        } else {
          throw error;
        }
      } else {
        toast.success('Verification code sent! Please check your inbox.');
        
        // Start 60-second cooldown
        setResendCooldown(60);
        cooldownTimerRef.current = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error('📧 Resend failed:', error);
      toast.error(error.message || 'Failed to resend code');
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
              We sent an 8-digit verification code to
            </p>
            <p className="text-center font-medium text-gray-900 mb-6">
              {email}
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900">
                Enter the 8-digit code from your email to verify your account.
              </p>
            </div>

            {/* Code Input Form */}
            <form onSubmit={verifyCode} className="mb-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Enter 8-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center text-2xl tracking-wider font-mono"
                  maxLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={verifyingCode || code.length !== 8}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingCode ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            {checking && (
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-6">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Checking verification status...</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={resendVerificationEmail}
                disabled={resending || resendCooldown > 0}
                className="w-full px-6 py-3 border border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Code'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code? Check your spam folder or click "Resend"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
