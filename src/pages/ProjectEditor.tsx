import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Check, Loader2 } from 'lucide-react'
import { useProject, useUpdateProject } from '../lib/queries'
import { toast } from 'sonner'

interface Slide {
  id?: number
  title: string
  content: string
  layout?: string
  notes?: string
}

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id!)
  const updateProject = useUpdateProject()

  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (project) {
      setTitle(project.title || 'Untitled Presentation')
      setSlides(project.slides || [])
    }
  }, [project])

  const saveProject = useCallback(async () => {
    if (!id || !hasUnsavedChanges) return

    setIsSaving(true)
    try {
      await updateProject.mutateAsync({
        id,
        data: {
          title,
          slides,
          updated_at: new Date().toISOString()
        }
      })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save project:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [id, title, slides, hasUnsavedChanges, updateProject])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges) {
        saveProject()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [slides, title, hasUnsavedChanges, saveProject])

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    setSlides(prev => {
      const newSlides = [...prev]
      newSlides[index] = { ...newSlides[index], ...updates }
      return newSlides
    })
    setHasUnsavedChanges(true)
  }

  const addSlide = () => {
    const newSlide: Slide = {
      title: `Slide ${slides.length + 1}`,
      content: '',
      layout: 'title-content',
      notes: ''
    }
    setSlides([...slides, newSlide])
    setCurrentSlide(slides.length)
    setHasUnsavedChanges(true)
  }

  const deleteSlide = (index: number) => {
    if (slides.length === 1) {
      toast.error('Cannot delete the last slide')
      return
    }
    setSlides(slides.filter((_, i) => i !== index))
    setCurrentSlide(Math.max(0, currentSlide - 1))
    setHasUnsavedChanges(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide] || { title: '', content: '' }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setHasUnsavedChanges(true)
              }}
              className="font-semibold text-lg border-none outline-none focus:ring-0"
            />
            <p className="text-sm text-gray-500 flex items-center gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : lastSaved ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  Saved {lastSaved.toLocaleTimeString()}
                </>
              ) : hasUnsavedChanges ? (
                'Unsaved changes'
              ) : (
                'Up to date'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveProject}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
            Present
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={addSlide}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg mb-4"
            >
              + Add Slide
            </button>

            <div className="space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-full p-3 rounded-lg text-left transition-all cursor-pointer relative group ${
                    currentSlide === index
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Slide {index + 1}</div>
                  <div className="font-medium text-sm truncate">{slide.title || 'Untitled'}</div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{slide.content}</div>
                  
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(index)
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl" style={{ width: '960px', height: '540px', aspectRatio: '16/9' }}>
            <div className="h-full flex flex-col p-12">
              <input
                type="text"
                value={currentSlideData.title}
                onChange={(e) => updateSlide(currentSlide, { title: e.target.value })}
                className="text-4xl font-bold mb-6 border-none outline-none focus:ring-0 w-full"
                placeholder="Slide title..."
              />
              <textarea
                value={currentSlideData.content}
                onChange={(e) => updateSlide(currentSlide, { content: e.target.value })}
                className="flex-1 text-xl border-none outline-none focus:ring-0 w-full resize-none"
                placeholder="Slide content..."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Slide Properties</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout
                  </label>
                  <select
                    value={currentSlideData.layout || 'title-content'}
                    onChange={(e) => updateSlide(currentSlide, { layout: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="title-content">Title + Content</option>
                    <option value="title-only">Title Only</option>
                    <option value="two-columns">Two Columns</option>
                    <option value="image-text">Image + Text</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold mb-3">Speaker Notes</h3>
              <textarea
                value={currentSlideData.notes || ''}
                onChange={(e) => updateSlide(currentSlide, { notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={6}
                placeholder="Add notes for this slide..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
