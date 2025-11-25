import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Send, Loader2, Sparkles, Search, ExternalLink as LinkIcon, ChevronDown, ChevronUp, Check, Mic } from 'lucide-react'
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

interface Template {
  name: string
  category: string
  description: string
  color: string
}

type AgentPhase = 'idle' | 'research' | 'outline' | 'generating' | 'complete'

type TaskStep = {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed'
}

const SAMPLE_PROMPTS = [
  { title: 'Design a pitch deck for a startup seeking funding', icon: '🚀' },
  { title: 'Create a sales presentation for a B2B software solution', icon: '💼' },
  { title: 'Create a presentation on the impact of AI on the future of work', icon: '🤖' },
  { title: 'Prepare a training module on cybersecurity best practices', icon: '🔐' },
]

const TEMPLATES: Template[] = [
  { name: 'Startup Pitch Deck', category: 'Pitch Decks', description: 'Professional pitch deck for startup fundraising', color: 'from-purple-600 to-purple-700' },
  { name: 'Investor Update', category: 'Pitch Decks', description: 'Monthly/quarterly investor update template', color: 'from-green-600 to-green-700' },
  { name: 'Quarterly Business Review', category: 'Business Reviews', description: 'Comprehensive quarterly business performance review', color: 'from-blue-600 to-blue-700' },
  { name: 'Sales Proposal', category: 'Sales Presentations', description: 'Professional sales proposal template', color: 'from-red-600 to-red-700' },
  { name: 'Marketing Campaign', category: 'Marketing', description: 'Marketing campaign strategy presentation', color: 'from-pink-600 to-pink-700' },
  { name: 'Course Overview', category: 'Education', description: 'Educational course or training overview', color: 'from-amber-600 to-amber-700' },
  { name: 'Monthly Report', category: 'Reports', description: 'Monthly progress and metrics report', color: 'from-cyan-600 to-cyan-700' },
]

export default function AIAgentCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<AgentPhase>('idle')
  const [slides, setSlides] = useState<SlidePreview[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [enableResearch] = useState(true)
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([])
  const [outline, setOutline] = useState<any>(null)
  const [outlineCollapsed, setOutlineCollapsed] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>([
    { id: 'research', label: 'Research AI presentation builder market and prepare content strategy', status: 'pending' },
    { id: 'outline', label: 'Write detailed slide content outline with sales-focused messaging', status: 'pending' },
    { id: 'generate', label: 'Generate the presentation slides', status: 'pending' },
    { id: 'deliver', label: 'Deliver final presentation to user', status: 'pending' },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Get project context from navigation state
  const projectContext = location.state as { projectId?: string; projectName?: string; brandId?: string } | null

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

  const updateTaskStep = (stepId: string, status: TaskStep['status']) => {
    setTaskSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const generatePresentationWithAI = async (userRequest: string) => {
    if (!user?.id) {
      toast.error('Please log in to use AI generation')
      return
    }

    setIsGenerating(true)
    setCurrentPhase('research')
    setResearchSources([])
    setSlides([])
    setOutline(null)
    setProgress(0)
    
    // Dynamic task labels based on user topic
    const topicShort = userRequest.length > 50 ? userRequest.substring(0, 47) + '...' : userRequest
    setTaskSteps([
      { id: 'research', label: `Research "${topicShort}" and gather insights`, status: 'pending' },
      { id: 'outline', label: 'Create presentation outline with key points', status: 'pending' },
      { id: 'generate', label: 'Generate slides with content and design', status: 'pending' },
      { id: 'deliver', label: 'Finalize and save presentation', status: 'pending' },
    ])
    
    try {
      console.log('📡 Starting slide generation with context:', {
        topic: userRequest,
        projectId: projectContext?.projectId,
        brandId: projectContext?.brandId,
        template: selectedTemplate
      });
      
      for await (const event of streamSlideGeneration({
        topic: userRequest,
        enableResearch: enableResearch,
        projectId: projectContext?.projectId,
        brandId: projectContext?.brandId
      })) {
        
        switch (event.type) {
          case 'start':
            break;
            
          case 'research_start':
            setCurrentPhase('research')
            updateTaskStep('research', 'in_progress')
            break;
            
          case 'research_source':
            if (event.url && event.title) {
              setResearchSources(prev => [...prev, {
                url: event.url!,
                title: event.title!,
                snippet: event.snippet
              }])
              // Show image search messages
              if (event.title.toLowerCase().includes('image')) {
                addAgentMessage(`🔍 Searching images: ${event.snippet || 'relevant visual content'}`)
              }
            }
            break;
            
          case 'research_complete':
            updateTaskStep('research', 'completed')
            addAgentMessage(`✅ Research complete! Found ${event.sourceCount || 0} sources`)
            break;
            
          case 'research_error':
            updateTaskStep('research', 'completed')
            break;
            
          case 'outline_start':
            setCurrentPhase('outline')
            updateTaskStep('outline', 'in_progress')
            break;
            
          case 'outline_complete':
            setOutline(event.outline)
            updateTaskStep('outline', 'completed')
            break;
            
          case 'slide_start':
            setCurrentPhase('generating')
            updateTaskStep('generate', 'in_progress')
            break;
            
          case 'slide_generated':
            if (event.slide) {
              const slidePreview: SlidePreview = {
                id: event.slideNumber || 0,
                title: event.slide.title || `Slide ${event.slideNumber}`,
                content: event.slide.content || ''
              }
              setSlides(prev => [...prev, slidePreview])
              setCurrentSlide((event.slideNumber || 1) - 1)
              setProgress(event.progress || 0)
            }
            break;
            
          case 'slides_complete':
            updateTaskStep('generate', 'completed')
            break;
            
          case 'complete':
            setCurrentPhase('complete')
            updateTaskStep('deliver', 'completed')
            const presentationId = event.presentation?.id
            const presentationTitle = event.presentation?.title || 'your presentation'
            
            addAgentMessage(`✅ ${presentationTitle} is ready! Created ${event.presentation?.slideCount} slides.`)
            toast.success('Presentation created successfully!')
            
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
      setCurrentPhase('idle')
      setTaskSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
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
    await new Promise(resolve => setTimeout(resolve, 300))
    await generatePresentationWithAI(userMessage)
  }

  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText)
    addUserMessage(promptText)
    setTimeout(() => generatePresentationWithAI(promptText), 300)
  }

  const handleTemplateClick = (templateName: string) => {
    setSelectedTemplate(templateName)
    toast.success(`Selected ${templateName} template`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Content */}
      <div className="w-1/2 bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">What can I do for you?</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentPhase === 'idle' && messages.length === 0 ? (
            // Landing State - Sample Prompts + Templates
            <div className="space-y-8">
              {/* Sample Prompts */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Sample prompts</h2>
                <div className="grid grid-cols-2 gap-4">
                  {SAMPLE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.title)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{prompt.icon}</span>
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">{prompt.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Library */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">Choose a template</h2>
                  <span className="text-sm text-gray-500">8 - 12</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {TEMPLATES.slice(0, 8).map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTemplateClick(template.name)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        selectedTemplate === template.name
                          ? 'border-purple-600 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`aspect-[4/3] bg-gradient-to-br ${template.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xl opacity-80 text-center px-4">
                            {template.name}
                          </span>
                        </div>
                        {selectedTemplate === template.name && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
                        <p className="text-xs text-gray-500 truncate">{template.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Generation Progress State
            <div className="space-y-6">
              {/* Task Progress */}
              {messages.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Task progress ({taskSteps.filter(s => s.status === 'completed').length}/{taskSteps.length})</h3>
                  <div className="space-y-3">
                    {taskSteps.map((step) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {step.status === 'completed' ? (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : step.status === 'in_progress' ? (
                            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <p className={`text-sm flex-1 ${
                          step.status === 'completed' ? 'text-gray-500 line-through' :
                          step.status === 'in_progress' ? 'text-purple-600 font-medium' :
                          'text-gray-700'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Sources */}
              {researchSources.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-sm">Research Sources ({researchSources.length})</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
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
              {outline && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <button
                    onClick={() => setOutlineCollapsed(!outlineCollapsed)}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-sm">Slides outline</h3>
                    </div>
                    {outlineCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {!outlineCollapsed && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-900">{outline.title}</p>
                      <ol className="text-xs text-gray-600 space-y-1.5 pl-4">
                        {outline.slides?.map((slide: any, idx: number) => (
                          <li key={idx} className="list-decimal">{slide.title}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* Status Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`text-sm ${
                    message.role === 'user' ? 'text-purple-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {message.thinking && <Loader2 className="w-3 h-3 inline mr-2 animate-spin" />}
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your presentation topic"
              disabled={isGenerating}
              className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Mic size={18} className="text-gray-500" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isGenerating}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          {selectedTemplate && (
            <p className="text-xs text-gray-500 mt-2">Using {selectedTemplate} theme</p>
          )}
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="font-semibold text-lg">Live Preview</h2>
          {progress > 0 && progress < 100 && (
            <div className="text-sm text-gray-500 mt-1">
              {Math.round(progress)}% complete
            </div>
          )}
        </div>

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
                Choose a template or describe what you'd like to create
              </p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              {/* Current Slide Preview */}
              <div className="bg-white rounded-lg shadow-lg p-12 mb-6 aspect-[16/9] flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 text-center">
                  {slides[currentSlide]?.title || 'Slide Title'}
                </h1>
                <div className="text-gray-600 text-center max-w-2xl">
                  {slides[currentSlide]?.content?.split('\n').slice(0, 3).map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
                {currentPhase === 'generating' && (
                  <p className="text-sm text-purple-600 mt-4">Generating slide {currentSlide + 1} of {slides.length}...</p>
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
                    `}
                  >
                    <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col items-center justify-center">
                      <div className="text-xs font-semibold text-gray-900 text-center line-clamp-2">
                        {slide.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{index + 1}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
