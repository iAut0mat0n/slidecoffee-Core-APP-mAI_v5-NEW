import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Coffee Cup Icon */}
        <div className="text-9xl mb-8">☕</div>
        
        {/* Error Code */}
        <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>
        
        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! This brew has gone cold
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        
        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/help-center"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white font-medium transition-colors"
          >
            Get Help
          </Link>
        </div>
        
        {/* Suggestions */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-left">
          <h3 className="font-semibold mb-3">Maybe you were looking for:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <Link to="/projects" className="text-purple-600 hover:underline">
                Your Projects
              </Link>
            </li>
            <li>
              <Link to="/brands" className="text-purple-600 hover:underline">
                Brand Management
              </Link>
            </li>
            <li>
              <Link to="/templates-new" className="text-purple-600 hover:underline">
                Template Gallery
              </Link>
            </li>
            <li>
              <Link to="/help-center" className="text-purple-600 hover:underline">
                Help Center
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

