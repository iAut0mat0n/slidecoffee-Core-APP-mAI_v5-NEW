import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Coffee, Loader2, Sparkles, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { streamChatMessage } from '../lib/api-stream'
import { generateSlides } from '../lib/api'
import { toast } from 'sonner'
import { useCreateProject } from '../lib/queries'

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

type AgentPhase = 'research' | 'outline' | 'generating' | 'complete'

export default function AIAgentCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const createProject = useCreateProject()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<AgentPhase>('research')
  const [slides, setSlides] = useState<SlidePreview[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [enableResearch, setEnableResearch] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial greeting
    addAgentMessage(
      "Hi! I'm your AI presentation assistant. Let me help you create an amazing presentation. What would you like to create today?"
    )
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
    
    try {
      // Phase 1: Research & Planning with streaming AI
      setCurrentPhase('research')
      addAgentMessage('Let me research your topic and create a plan...', true)
      
      const chatMessages = [
        {
          role: 'system',
          content: `You are an expert presentation designer. Create a detailed presentation plan based on the user's request.

CRITICAL: Respond ONLY with valid JSON in this exact format:
{
  "title": "Presentation Title",
  "summary": "Brief overview of the topic",
  "slides": [
    {
      "title": "Slide Title",
      "purpose": "What this slide accomplishes",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "themes": ["Theme 1", "Theme 2"]
}

Create 6-8 slides. Be specific and actionable.`
        },
        {
          role: 'user',
          content: userRequest
        }
      ]
      
      let aiPlanText = ''
      let currentMessage = { id: Date.now().toString(), role: 'agent' as const, content: '', timestamp: new Date() }
      setMessages(prev => [...prev, currentMessage])
      
      // Stream the AI response with research enabled
      for await (const event of streamChatMessage(chatMessages, user.id, undefined, {
        enableResearch: enableResearch,
        workspaceId: undefined, // Backend will get from auth context
      })) {
        if (event.type === 'chunk' && event.content) {
          aiPlanText += event.content
          setMessages(prev => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg.role === 'agent') {
              lastMsg.content = aiPlanText
            }
            return updated
          })
        } else if (event.type === 'done') {
          if (event.fullResponse) {
            aiPlanText = event.fullResponse
          }
          break
        } else if (event.type === 'error') {
          throw new Error(event.error || 'AI generation failed')
        }
      }
      
      // Parse the JSON plan
      let parsedPlan
      try {
        parsedPlan = JSON.parse(aiPlanText)
        if (!parsedPlan.slides || !Array.isArray(parsedPlan.slides)) {
          throw new Error('Invalid plan format: missing slides array')
        }
      } catch (parseError) {
        console.error('Failed to parse AI plan:', parseError)
        throw new Error('AI returned invalid plan format. Please try again.')
      }
      
      addAgentMessage(`Perfect! I've created a plan with ${parsedPlan.slides.length} slides: ${parsedPlan.title}`)
      setCurrentPhase('outline')
      
      // Phase 2: Generate Slides
      setCurrentPhase('generating')
      addAgentMessage('Creating your slides with beautiful designs...', true)
      
      const slidesResult = await generateSlides({ plan: parsedPlan })
      
      if (!slidesResult.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides were generated')
      }
      
      // Phase 3: Display slides progressively
      const generatedSlides: SlidePreview[] = []
      for (let i = 0; i < slidesResult.slides.length; i++) {
        const slide = slidesResult.slides[i]
        const slidePreview: SlidePreview = {
          id: i + 1,
          title: slide.title || `Slide ${i + 1}`,
          content: slide.content || '',
        }
        generatedSlides.push(slidePreview)
        setSlides([...generatedSlides])
        setCurrentSlide(i)
        setProgress(((i + 1) / slidesResult.slides.length) * 100)
        addAgentMessage(`✓ Slide ${i + 1}: ${slidePreview.title}`)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Phase 4: Save to Database
      setCurrentPhase('complete')
      addAgentMessage('Saving your presentation...')
      
      const projectData = {
        title: parsedPlan.title || 'Untitled Presentation',
        description: parsedPlan.summary || '',
        slides: slidesResult.slides,
        created_by: user.id,
        workspace_id: user.default_workspace_id,
        thumbnail: null,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const savedProject = await createProject.mutateAsync(projectData)
      
      addAgentMessage(`🎉 Your presentation is ready! Created ${slidesResult.slides.length} slides and saved to your projects.`)
      toast.success('Presentation created successfully!')
      
      // Redirect to editor after 2 seconds
      setTimeout(() => {
        navigate(`/projects/${savedProject.id}/editor`)
      }, 2000)
      
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

