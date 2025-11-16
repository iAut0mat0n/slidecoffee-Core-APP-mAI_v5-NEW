import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Download, ZoomIn, ZoomOut, Check, X, Coffee, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Presentation, type ChatMessage, type PresentationPlan } from '../lib/supabase'
import Button from '../components/Button'
import * as api from '../lib/api'

export default function Editor() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [plan, setPlan] = useState<PresentationPlan | null>(null)
  const [zoom, setZoom] = useState(100)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id && id !== 'new') {
      loadPresentation()
      loadMessages()
      loadPlan()
    } else {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadPresentation = async () => {
    if (!id || id === 'new') return
    
    try {
      const { data, error } = await supabase
        .from('v2_presentations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setPresentation(data)
    } catch (error) {
      console.error('Error loading presentation:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!id || id === 'new') return
    
    try {
      const { data, error } = await supabase
        .from('v2_chat_messages')
        .select('*')
        .eq('presentation_id', id)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadPlan = async () => {
    if (!id || id === 'new') return
    
    try {
      const { data } = await supabase
        .from('v2_presentation_plans')
        .select('*')
        .eq('presentation_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) setPlan(data)
    } catch (error) {
      console.error('Error loading plan:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return
    
    setSending(true)
    try {
      // Add user message to UI immediately
      const userMessage: Partial<ChatMessage> = {
        presentation_id: id || 'new',
        role: 'user',
        content: inputMessage,
        created_at: new Date().toISOString()
      }
      
      const updatedMessages = [...messages, userMessage as ChatMessage]
      setMessages(updatedMessages)
      setInputMessage('')
      
      // Call Netlify Function for AI response
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const response = await api.sendChatMessage(apiMessages, {
        presentationId: id,
        title: presentation?.title
      })
      
      // Add AI response
      const aiMessage: Partial<ChatMessage> = {
        presentation_id: id || 'new',
        role: 'assistant',
        content: response.message,
        created_at: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, aiMessage as ChatMessage])
      
      // Save messages to database if we have a presentation ID
      if (id && id !== 'new') {
        await supabase.from('v2_chat_messages').insert([
          { ...userMessage, id: undefined },
          { ...aiMessage, id: undefined }
        ])
      }
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Show error to user
      const errorMessage: Partial<ChatMessage> = {
        presentation_id: id || 'new',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage as ChatMessage])
    } finally {
      setSending(false)
    }
  }

  const handleApprovePlan = async () => {
    if (!plan) return
    
    setGenerating(true)
    setProgress(0)
    
    try {
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 300)
      
      // Call Netlify Function to generate slides
      const response = await api.generateSlides(plan.plan)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      // Update presentation with generated slides
      if (id && id !== 'new' && presentation) {
        await supabase
          .from('v2_presentations')
          .update({
            slides: response.slides,
            status: 'completed'
          })
          .eq('id', id)
        
        setPresentation({
          ...presentation,
          slides: response.slides,
          status: 'completed'
        })
      }
      
      // Update plan status
      await supabase
        .from('v2_presentation_plans')
        .update({ status: 'approved' })
        .eq('id', plan.id)
      
      setPlan({ ...plan, status: 'approved' })
      
      setTimeout(() => {
        setGenerating(false)
        setProgress(0)
      }, 1000)
      
    } catch (error) {
      console.error('Error generating slides:', error)
      setGenerating(false)
      setProgress(0)
      alert('Failed to generate slides. Please try again.')
    }
  }

  const slides = presentation?.slides || []
  const currentSlide = slides[currentSlideIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Chat (40%) */}
      <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-purple-600" />
            <span className="font-bold">SlideCoffee</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !generating && (
            <div className="text-center text-gray-500 mt-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <p className="text-lg font-medium mb-2">Let's brew something amazing!</p>
              <p className="text-sm">Tell me about the presentation you want to create.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {generating && (
            <div className="flex flex-col items-center justify-center py-12">
              <Coffee className="w-16 h-16 text-purple-600 mb-4 animate-bounce" />
              <p className="text-lg font-medium mb-2">Brewing your slides...</p>
              <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{progress}%</p>
            </div>
          )}

          {plan && plan.status === 'pending' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-medium mb-3">Review your presentation plan:</p>
              <div className="bg-white rounded p-3 mb-3 text-sm">
                {JSON.stringify(plan.plan, null, 2)}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApprovePlan}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve & Generate
                </Button>
                <Button
                  onClick={() => {}}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message AI..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={sending || generating}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending || generating || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Slide Preview (60%) */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{presentation?.title || 'New Presentation'}</h1>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Slide Preview Area */}
        <div className="flex-1 flex">
          {/* Slide Thumbnails */}
          {slides.length > 0 && (
            <div className="w-48 bg-white border-r border-gray-200 p-4 overflow-y-auto">
              <div className="space-y-3">
                {slides.map((slide: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-full aspect-video rounded-lg border-2 transition-all ${
                      index === currentSlideIndex
                        ? 'border-purple-600 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded flex items-center justify-center">
                      <span className="text-xs text-purple-700">{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Slide View */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-100">
            {slides.length === 0 ? (
              <div className="text-center text-gray-500">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No slides yet</p>
                <p className="text-sm">Start chatting to generate your presentation</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {/* Zoom Controls */}
                <div className="flex items-center justify-end gap-2 mb-4">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Slide Content */}
                <div
                  className="bg-white shadow-2xl rounded-lg overflow-hidden mx-auto"
                  style={{
                    width: `${zoom}%`,
                    aspectRatio: '16/9'
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-50 to-white p-12 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold mb-4">Presentation Title</h2>
                    <p className="text-xl text-gray-600">Subtitle</p>
                    <ul className="mt-8 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span>First point</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span>Second point</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span>Third point</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium">
                    {currentSlideIndex + 1} / {slides.length || 1}
                  </span>
                  <button
                    onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex >= slides.length - 1}
                    className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

