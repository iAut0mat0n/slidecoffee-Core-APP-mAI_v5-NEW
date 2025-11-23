import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Coffee } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      // Wait for auth to finish loading
      if (loading) return;

      // No user - redirect to login
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Explicitly check for workspaces
        const { data: workspaces, error } = await supabase
          .from('v2_workspaces')
          .select('id')
          .eq('created_by', user.id)
          .limit(1);

        if (error) {
          console.error('Failed to check onboarding:', error);
          // On error, assume not onboarded (safer for new users)
          navigate('/onboarding/welcome');
          return;
        }

        const hasWorkspace = !!workspaces && workspaces.length > 0;

        if (hasWorkspace) {
          // Existing user with workspace - go to dashboard
          navigate('/dashboard');
        } else {
          // New user without workspace - go to onboarding
          navigate('/onboarding/welcome');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        navigate('/onboarding/welcome');
      }
    };

    checkOnboardingAndRedirect();
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
            <Coffee className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">Please wait a moment</p>
      </div>
    </div>
  );
}
