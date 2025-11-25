import { useEffect } from 'react';
import { Coffee } from 'lucide-react';
import AppLogo from '../components/AppLogo';

export default function LoginReplit() {
  useEffect(() => {
    // Auto-redirect to Replit Auth after 1 second
    const timer = setTimeout(() => {
      window.location.href = '/api/login';
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <AppLogo />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Coffee className="w-10 h-10 text-purple-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Welcome to SlideCoffee
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Sign in with Replit to continue
            </p>

            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign in with Replit
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Redirecting automatically...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
