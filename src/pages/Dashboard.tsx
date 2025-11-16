import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Presentation } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPresentations()
  }, [user])

  const loadPresentations = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Get user's workspaces
      const { data: workspaces } = await supabase
        .from('v2_workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
      
      if (workspaces && workspaces.length > 0) {
        // Load presentations for first workspace
        const { data } = await supabase
          .from('v2_presentations')
          .select('*')
          .eq('workspace_id', workspaces[0].id)
          .order('updated_at', { ascending: false })
          .limit(6)
        
        setPresentations(data || [])
      }
    } catch (error) {
      console.error('Error loading presentations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    navigate('/editor/new')
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : presentations.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-96">
            <div className="mb-6">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center relative">
                <Sparkles className="w-12 h-12 text-purple-600" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-600 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="absolute top-0 right-8 w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-3">No projects yet</h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Time for a fresh brew! Get started by creating your first presentation with AI
            </p>
            
            <Button
              onClick={handleCreateProject}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
            >
              Create your first project
            </Button>
          </div>
        ) : (
          // Projects Grid
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Projects</h2>
              <Button
                onClick={handleCreateProject}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentations.map((presentation) => (
                <Card
                  key={presentation.id}
                  onClick={() => navigate(`/editor/${presentation.id}`)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{presentation.title}</h3>
                  {presentation.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{presentation.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{presentation.status}</span>
                    <span>{new Date(presentation.updated_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

