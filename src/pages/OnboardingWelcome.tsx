import { useNavigate } from 'react-router-dom';
import { Coffee, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Creation',
      description: 'Meet BREW, your AI assistant that generates beautiful presentations from simple prompts',
    },
    {
      icon: '🎨',
      title: 'Brand Consistency',
      description: 'Upload your brand assets once and apply them across all presentations automatically',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Create professional presentations in minutes, not hours',
    },
    {
      icon: '🤝',
      title: 'Real-time Collaboration',
      description: 'Work together with your team with live cursors and comments',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Coffee className="w-7 h-7 text-white" />
            <span className="text-xl font-semibold">SlideCoffee</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-white">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                Welcome to SlideCoffee ✨
              </div>
              
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Create stunning presentations with AI
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                SlideCoffee combines the power of AI with beautiful design to help you create professional presentations in minutes.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/onboarding/workspace')}
                  className="px-8 py-4 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Get Started →
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  Skip for now
                </button>
              </div>

              {/* Progress */}
              <div className="mt-12 flex items-center gap-2">
                <div className="w-12 h-1 bg-white rounded-full"></div>
                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
              </div>
            </div>

            {/* Right Side - Features */}
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-purple-100">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-white/60 text-sm">
        Step 1 of 3 • Takes less than 2 minutes
      </div>
    </div>
  );
}

