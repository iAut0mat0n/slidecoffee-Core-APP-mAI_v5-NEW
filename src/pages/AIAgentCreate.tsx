import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Send, Coffee, Loader2, Sparkles, Search, ExternalLink as LinkIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { streamSlideGeneration } from '../lib/api-slides-stream'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  thinking?: boolean
}

interface SlidePreview {
  id: number
  title: string
  content: string
  thumbnail?: string
}

interface ResearchSource {
  url: string
  title: string
  snippet?: string
}

type AgentPhase = 'research' | 'outline' | 'generating' | 'complete'

export default function AIAgentCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<AgentPhase>('research')
  const [slides, setSlides] = useState<SlidePreview[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [enableResearch, setEnableResearch] = useState(true)
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([])
  const [outline, setOutline] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Get project context from navigation state
  const projectContext = location.state as { projectId?: string; projectName?: string; brandId?: string } | null
  
  useEffect(() => {
    // Initial greeting
    const greeting = projectContext?.projectName 
      ? `Hi! I'm ready to create slides for "${projectContext.projectName}". What topic would you like me to research and present?`
      : "Hi! I'm your AI presentation assistant. Let me help you create an amazing presentation. What would you like to create today?"
    
    addAgentMessage(greeting)
    
    if (projectContext) {
      console.log('🎯 Project context loaded:', projectContext);
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addAgentMessage = (content: string, thinking = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'agent',
      content,
      timestamp: new Date(),
      thinking,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const generatePresentationWithAI = async (userRequest: string) => {
    if (!user?.id) {
      toast.error('Please log in to use AI generation')
      return
    }

    setIsGenerating(true)
    setResearchSources([])
    setSlides([])
    setOutline(null)
    setProgress(0)
    
    try {
      // TRUE STREAMING MAGIC - Watch everything happen in real-time!
      console.log('📡 Starting slide generation with context:', {
        topic: userRequest,
        projectId: projectContext?.projectId,
        brandId: projectContext?.brandId
      });
      
      for await (const event of streamSlideGeneration({
        topic: userRequest,
        enableResearch: enableResearch,
        projectId: projectContext?.projectId,
        brandId: projectContext?.brandId
      })) {
        
        switch (event.type) {
          case 'start':
            addAgentMessage('🚀 Starting presentation generation...', true)
            break;
            
          case 'research_start':
            setCurrentPhase('research')
            addAgentMessage('🔍 Researching your topic...', true)
            break;
            
          case 'research_source':
            // Add each source as it's found - REAL-TIME!
            if (event.url && event.title) {
              setResearchSources(prev => [...prev, {
                url: event.url!,
                title: event.title!,
                snippet: event.snippet
              }])
              addAgentMessage(`📚 Found: ${event.title}`)
            }
            break;
            
          case 'research_complete':
            addAgentMessage(`✅ Research complete! Found ${event.sourceCount || 0} sources`)
            break;
            
          case 'research_error':
            addAgentMessage('⚠️ Research unavailable, continuing without sources')
            break;
            
          case 'outline_start':
            setCurrentPhase('outline')
            addAgentMessage('📝 Creating presentation outline...', true)
            break;
            
          case 'outline_complete':
            setOutline(event.outline)
            addAgentMessage(`✨ Outline ready! Planning ${event.outline?.slides?.length || 0} slides: "${event.outline?.title}"`)
            break;
            
          case 'slide_start':
            setCurrentPhase('generating')
            addAgentMessage('🎨 Generating slides...', true)
            break;
            
          case 'slide_generated':
            // Each slide appears AS IT'S GENERATED - TRUE MAGIC!
            if (event.slide) {
              const slidePreview: SlidePreview = {
                id: event.slideNumber || 0,
                title: event.slide.title || `Slide ${event.slideNumber}`,
                content: event.slide.content || ''
              }
              setSlides(prev => [...prev, slidePreview])
              setCurrentSlide((event.slideNumber || 1) - 1)
              setProgress(event.progress || 0)
              addAgentMessage(`✓ Slide ${event.slideNumber}/${event.totalSlides}: ${event.slide.title}`)
            }
            break;
            
          case 'slides_complete':
            addAgentMessage(`🎉 All ${event.slideCount} slides generated!`)
            break;
            
          case 'complete':
            setCurrentPhase('complete')
            const presentationId = event.presentation?.id
            const presentationTitle = event.presentation?.title || 'your presentation'
            
            addAgentMessage(`✅ ${presentationTitle} is ready! Created ${event.presentation?.slideCount} slides.`)
            toast.success('Presentation created successfully!')
            
            // Show sources used
            if (event.sources && event.sources.length > 0) {
              addAgentMessage(`📖 Used ${event.sources.length} research sources`)
            }
            
            // Redirect to editor after 2 seconds
            if (presentationId) {
              setTimeout(() => {
                navigate(`/projects/${presentationId}/editor`)
              }, 2000)
            }
            break;
            
          case 'error':
            throw new Error(event.message || 'Generation failed')
        }
      }
      
    } catch (error) {
      console.error('AI Generation Error:', error)
      addAgentMessage(`❌ Sorry, something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Failed to generate presentation')
      setCurrentPhase('research')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addUserMessage(userMessage)

    // Start AI generation
    if (messages.length === 1) {
      // First user message - start generation
      await new Promise(resolve => setTimeout(resolve, 500))
      addAgentMessage('Great! Let me start working on that for you.')
      await generatePresentationWithAI(userMessage)
    } else {
      // Follow-up messages - allow refinement
      await new Promise(resolve => setTimeout(resolve, 500))
      addAgentMessage('I understand. Let me refine the presentation based on your feedback.')
      await generatePresentationWithAI(userMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel - AI Chat */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">AI Agent</h2>
              <p className="text-sm text-gray-500">
                {currentPhase === 'research' && 'Researching your topic...'}
                {currentPhase === 'outline' && 'Creating outline...'}
                {currentPhase === 'generating' && 'Creating your BREW...'}
                {currentPhase === 'complete' && 'Ready!'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.thinking && (
                  <div className="flex items-center gap-2 mb-2 text-sm opacity-70">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          {/* Research Mode Toggle */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <span>Research Mode</span>
            </div>
            <button
              onClick={() => setEnableResearch(!enableResearch)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableResearch ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableResearch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {enableResearch && (
            <div className="mb-3 px-1 text-xs text-purple-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI will research your topic for better insights</span>
            </div>
          )}
          <div className="flex items-end gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Guide the agent..."
              disabled={isGenerating}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGenerating}
              className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-lg">Live Preview</h2>
          {progress > 0 && progress < 100 && (
            <div className="text-sm text-gray-500 mt-1">
              {Math.round(progress)}% complete
            </div>
          )}
        </div>

        {/* Research Sources Panel */}
        {researchSources.length > 0 && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm">Research Sources ({researchSources.length})</h3>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {researchSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-xs hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <LinkIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{source.title}</div>
                    <div className="text-gray-500 truncate">{source.url}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Outline Preview */}
        {outline && !slides.length && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm">Outline</h3>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900 mb-2">{outline.title}</div>
              <div className="text-gray-600 text-xs mb-2">{outline.summary}</div>
              <div className="text-xs text-gray-500">
                {outline.slides?.length || 0} slides planned
              </div>
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {slides.length === 0 ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-16 h-16 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Waiting to start...
              </h3>
              <p className="text-gray-500">
                Tell me what you'd like to create
              </p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              {/* Current Slide Preview */}
              <div className="bg-white rounded-lg shadow-lg p-12 mb-6 aspect-[16/9] flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 text-center">
                  {slides[currentSlide]?.title || 'Market Analysis'}
                </h1>
                <p className="text-xl text-gray-600 text-center">
                  {currentPhase === 'generating' ? 'Q1 2024' : 'Content preview'}
                </p>
                {currentPhase === 'generating' && (
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-24 bg-gray-200 rounded animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {currentPhase === 'generating' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Slide {currentSlide + 1} of {slides.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Slide Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`
                      flex-shrink-0 w-32 h-24 rounded-lg border-2 transition-all
                      ${index === currentSlide 
                        ? 'border-purple-600 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      ${index > currentSlide && currentPhase === 'generating' 
                        ? 'opacity-50' 
                        : ''
                      }
                    `}
                  >
                    <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col items-center justify-center">
                      <div className="text-xs font-semibold text-gray-900 text-center">
                        {slide.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{slide.id}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Complete Actions */}
              {currentPhase === 'complete' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => navigate(`/editor/${slides[0]?.id}`)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Open in Editor
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

