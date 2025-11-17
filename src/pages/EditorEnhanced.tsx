import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Download, Coffee, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Presentation, type ChatMessage as ChatMessageType } from '../lib/supabase'
import Button from '../components/Button'
import ChatMessage from '../components/ChatMessage'
import ThinkingIndicator from '../components/ThinkingIndicator'
import SuggestedFollowups from '../components/SuggestedFollowups'
import { streamChatMessage } from '../lib/api-stream'
import { getRandomGreeting, getSuggestedFollowups } from '../config/aiAgent'

export default function EditorEnhanced() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isThinking, setIsThinking] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id && id !== 'new') {
      loadPresentation()
      loadMessages()
    } else {
      setLoading(false)
      // Show initial greeting for new presentations
      addGreetingMessage()
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking, streamingContent])

  // Auto-save draft message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputMessage && id) {
        localStorage.setItem(`draft_${id}`, inputMessage)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [inputMessage, id])

  // Restore draft message
  useEffect(() => {
    if (id) {
      const draft = localStorage.getItem(`draft_${id}`)
      if (draft) {
        setInputMessage(draft)
      }
    }
  }, [id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addGreetingMessage = () => {
    const greeting: ChatMessageType = {
      id: 'greeting',
      presentation_id: id || 'new',
      role: 'assistant',
      content: getRandomGreeting(),
      metadata: null,
      created_at: new Date().toISOString(),
    }
    setMessages([greeting])
    setSuggestedFollowups(getSuggestedFollowups('greeting'))
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
        .from('v2_messages')
        .select('*')
        .eq('presentation_id', id)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setMessages(data)
        // Determine suggested follow-ups based on last message
        const lastMessage = data[data.length - 1]
        if (lastMessage.role === 'assistant') {
          // Analyze content to suggest relevant follow-ups
          setSuggestedFollowups(getSuggestedFollowups('topic'))
        }
      } else {
        addGreetingMessage()
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || isThinking) return
    
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    setIsThinking(true)
    setStreamingContent('')
    setSuggestedFollowups([])
    
    try {
      // Add user message to UI immediately
      const userMessage: ChatMessageType = {
        id: `temp_${Date.now()}`,
        presentation_id: id || 'new',
        role: 'user',
        content: textToSend,
        metadata: null,
        created_at: new Date().toISOString(),
      }
      
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInputMessage('')
      
      // Clear draft
      if (id) {
        localStorage.removeItem(`draft_${id}`)
      }
      
      // Prepare messages for API
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))
      
      // Start streaming response
      setIsThinking(false)
      setIsStreaming(true)
      let fullResponse = ''
      
      for await (const event of streamChatMessage(
        apiMessages,
        user.id,
        {
          presentationId: id,
          title: presentation?.title,
        }
      )) {
        if (event.type === 'chunk' && event.content) {
          fullResponse += event.content
          setStreamingContent(fullResponse)
        } else if (event.type === 'done') {
          if (event.fullResponse) {
            fullResponse = event.fullResponse
          }
          break
        } else if (event.type === 'error') {
          throw new Error(event.error || 'Unknown error')
        }
      }
      
      // Add AI response to messages
      const aiMessage: ChatMessageType = {
        id: `ai_${Date.now()}`,
        presentation_id: id || 'new',
        role: 'assistant',
        content: fullResponse,
        metadata: null,
        created_at: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, aiMessage])
      setStreamingContent('')
      setIsStreaming(false)
      
      // Generate suggested follow-ups
      setSuggestedFollowups(getSuggestedFollowups('topic'))
      
      // Save messages to database if we have a presentation ID
      if (id && id !== 'new') {
        await supabase.from('v2_messages').insert([
          { ...userMessage, id: undefined },
          { ...aiMessage, id: undefined },
        ])
      }
      
    } catch (error) {
      console.error('Error sending message:', error)
      setIsThinking(false)
      setIsStreaming(false)
      setStreamingContent('')
      
      // Show error to user
      const errorMessage: ChatMessageType = {
        id: `error_${Date.now()}`,
        presentation_id: id || 'new',
        role: 'assistant',
        content: 'Oops! Something went wrong on my end. Mind trying that again?',
        metadata: null,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleFollowupSelect = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const slides = presentation?.slides || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <div className="text-gray-500">Loading...</div>
        </div>
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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm">Start chatting to create your presentation!</p>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              role={message.role}
              content={message.content}
            />
          ))}

          {isThinking && <ThinkingIndicator />}

          {isStreaming && streamingContent && (
            <ChatMessage
              role="assistant"
              content={streamingContent}
              isStreaming={true}
            />
          )}

          {suggestedFollowups.length > 0 && !isThinking && !isStreaming && (
            <SuggestedFollowups
              suggestions={suggestedFollowups}
              onSelect={handleFollowupSelect}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Message Brew..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
              disabled={isThinking || isStreaming}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isThinking || isStreaming || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Powered by AI memory • Your conversations are saved
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
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          {slides.length === 0 ? (
            <div className="text-center text-gray-500">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No slides yet</p>
              <p className="text-sm">Start chatting to generate your presentation</p>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full aspect-video">
              <p className="text-gray-500">Slide preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

