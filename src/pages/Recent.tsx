import { Link } from 'react-router-dom';
import CollapsibleSidebar from '../components/CollapsibleSidebar';
import { Clock, FileText, Sparkles } from 'lucide-react';

export default function Recent() {
  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Recent</h1>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your recent presentations</h2>
          <p className="text-gray-600 mb-6">Presentations you've worked on recently will appear here</p>
          <Link 
            to="/brews" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Brew
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
