import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateWorkspace } from '../lib/queries';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { UsersRound } from 'lucide-react';

export default function OnboardingWorkspace() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const createWorkspace = useCreateWorkspace();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState<'personal' | 'team' | 'company'>('personal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Only send name - workspace type is UI preference only
      await createWorkspace.mutateAsync({
        name: workspaceName,
      });
      
      // CRITICAL: Refresh user data to pick up new workspaceId
      await refreshUser();
      
      toast.success('Workspace created successfully!');
      navigate('/onboarding/brand');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <UsersRound className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Create Your Workspace</h1>
          <p className="text-gray-600">
            A workspace helps you organize your presentations and collaborate with your team
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workspace Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="My Company"
                maxLength={100}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be visible to your team members
              </p>
            </div>

            {/* Workspace Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Workspace Type
              </label>
              <div className="space-y-3">
                {[
                  { id: 'personal', label: 'Personal', description: 'Just for you', icon: '👤' },
                  { id: 'team', label: 'Team', description: 'For small teams (2-10 people)', icon: '👥' },
                  { id: 'company', label: 'Company', description: 'For larger organizations', icon: '💼' },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      workspaceType === type.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="workspaceType"
                      checked={workspaceType === type.id}
                      onChange={() => setWorkspaceType(type.id as typeof workspaceType)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-semibold">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link to="/onboarding/welcome" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </form>

          {/* Progress */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

