import { Link } from 'react-router-dom';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Spilled Coffee Icon */}
        <div className="text-9xl mb-8">☕💥</div>
        
        {/* Error Code */}
        <h1 className="text-8xl font-bold text-gray-900 mb-4">500</h1>
        
        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! We spilled the coffee
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Something went wrong on our end. Our team has been notified and we are working on a fix.
        </p>
        
        {/* Actions */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        
        {/* Error Details */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-left">
          <h3 className="font-semibold mb-3">What you can do:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Refresh the page and try again</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Clear your browser cache and cookies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>
                If the problem persists,{' '}
                <Link to="/help-center" className="text-purple-600 hover:underline">
                  contact support
                </Link>
              </span>
            </li>
          </ul>
        </div>
        
        {/* Status Link */}
        <div className="mt-6 text-sm text-gray-600">
          Check our{' '}
          <a href="#" className="text-purple-600 hover:underline">
            system status page
          </a>{' '}
          for any ongoing issues
        </div>
      </div>
    </div>
  );
}

