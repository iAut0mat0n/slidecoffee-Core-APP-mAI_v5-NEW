import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Coffee, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<AgentPhase>('research')
  const [slides, setSlides] = useState<SlidePreview[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
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

  const simulateAgentWork = async () => {
    setIsGenerating(true)
    
    // Phase 1: Research
    setCurrentPhase('research')
    await new Promise(resolve => setTimeout(resolve, 1000))
    addAgentMessage('Let me research your topic...', true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    addAgentMessage('Found 3 relevant market reports')
    
    // Phase 2: Outline
    setCurrentPhase('outline')
    await new Promise(resolve => setTimeout(resolve, 1500))
    addAgentMessage('Generating outline with 8 slides')
    
    const slideOutline = [
      'Slide 1: Title',
      'Slide 2: Executive Summary',
      'Slide 3: Market Overview',
      'Slide 4: Key Findings',
      'Slide 5: Data Analysis',
      'Slide 6: Recommendations',
      'Slide 7: Next Steps',
      'Slide 8: Thank You',
    ]
    
    addAgentMessage(slideOutline.map((s, i) => `• ${s}`).join('\n'))
    
    // Phase 3: Generating slides
    setCurrentPhase('generating')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newSlides: SlidePreview[] = []
    for (let i = 0; i < 8; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      const slide: SlidePreview = {
        id: i + 1,
        title: slideOutline[i].replace(/Slide \d+: /, ''),
        content: 'Content preview...',
      }
      newSlides.push(slide)
      setSlides([...newSlides])
      setCurrentSlide(i)
      setProgress(((i + 1) / 8) * 100)
      addAgentMessage(`Adding content to slide ${i + 1}...`, true)
    }
    
    // Phase 4: Complete
    setCurrentPhase('complete')
    await new Promise(resolve => setTimeout(resolve, 500))
    addAgentMessage('🎉 Your presentation is ready! You can now review and edit it.')
    
    setIsGenerating(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addUserMessage(userMessage)

    // Simulate agent response
    if (messages.length === 1) {
      // First user message - start generation
      await new Promise(resolve => setTimeout(resolve, 500))
      addAgentMessage('Great! Let me start working on that for you.')
      await simulateAgentWork()
    } else {
      // Follow-up messages
      await new Promise(resolve => setTimeout(resolve, 1000))
      addAgentMessage('I understand. Let me adjust that for you.')
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

