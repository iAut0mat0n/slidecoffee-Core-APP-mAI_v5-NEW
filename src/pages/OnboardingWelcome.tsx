import { Link } from 'react-router-dom';

export default function OnboardingWelcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center text-white">
          {/* Animated Coffee */}
          <div className="text-9xl mb-8 animate-bounce">☕</div>
          
          {/* Welcome Message */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to SlideCoffee!
          </h1>
          <p className="text-2xl text-purple-100 mb-12 max-w-2xl mx-auto">
            Create stunning presentations in minutes with AI-powered design and smart templates
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-purple-100 text-sm">
                Let AI handle the design while you focus on your message
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-purple-100 text-sm">
                Generate complete presentations in seconds, not hours
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
              <p className="text-purple-100 text-sm">
                Professional templates and themes that make you look good
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding/workspace">
              <button className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 font-semibold rounded-lg text-lg transition-colors">
                Get Started →
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg text-lg transition-colors backdrop-blur-sm">
                Skip Tutorial
              </button>
            </Link>
          </div>

          {/* Progress */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-3 h-3 rounded-full bg-white/30"></div>
            <div className="w-3 h-3 rounded-full bg-white/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

