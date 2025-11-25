import { useState, useRef } from 'react'
import { Upload, Coffee, X, Check, Palette, Type, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ExtractedTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    palette: string[]
  }
  fonts: {
    heading: string
    body: string
    all_fonts: string[]
  }
  metadata: {
    total_slides: number
    total_images: number
    has_logo: boolean
    slide_dimensions: {
      width_inches: number
      height_inches: number
    }
  }
}

interface PowerPointImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (theme: ExtractedTheme) => void
}

export default function PowerPointImportModal({ isOpen, onClose, onImport }: PowerPointImportModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedTheme, setExtractedTheme] = useState<ExtractedTheme | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pptxFile = files.find(f => f.name.endsWith('.pptx'))
    
    if (pptxFile) {
      processFile(pptxFile)
    } else {
      toast.error('Please upload a PowerPoint (.pptx) file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    setFileName(file.name)
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('pptx', file)
      
      const token = localStorage.getItem('supabase.auth.token')
      let authToken = null
      
      if (token) {
        try {
          authToken = JSON.parse(token)?.access_token
        } catch (e) {
          const authKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('sb-') && key.endsWith('-auth-token')
          )
          if (authKeys.length > 0) {
            const sessionV2 = localStorage.getItem(authKeys[0])
            if (sessionV2) {
              const parsed = JSON.parse(sessionV2)
              authToken = parsed?.access_token || parsed?.currentSession?.access_token
            }
          }
        }
      }
      
      const apiUrl = import.meta.env.PROD 
        ? '/api/themes/import-pptx' 
        : 'http://localhost:3001/api/themes/import-pptx'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to extract theme')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setExtractedTheme(result.theme)
        toast.success('Theme extracted successfully!')
      } else {
        throw new Error('Theme extraction failed')
      }
      
    } catch (error) {
      console.error('PowerPoint import error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process PowerPoint file')
      setIsProcessing(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (extractedTheme) {
      onImport(extractedTheme)
      resetModal()
      onClose()
    }
  }

  const resetModal = () => {
    setExtractedTheme(null)
    setFileName('')
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Coffee className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Import PowerPoint Theme</h2>
              <p className="text-sm text-gray-600">Extract colors and fonts from your .pptx file</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!isProcessing && !extractedTheme && (
            <>
              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                  ${isDragging 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      Drop your PowerPoint file here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse • .pptx files only • 25MB max
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Info Section */}
              <div className="mt-6 bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">What we'll extract:</h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-center gap-2">
                    <Palette size={16} />
                    Theme colors from slide masters
                  </li>
                  <li className="flex items-center gap-2">
                    <Type size={16} />
                    Font styles and typography
                  </li>
                  <li className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    Logos and brand assets
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Processing Animation */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                {/* Animated Coffee Cup */}
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center animate-pulse">
                  <Coffee className="w-12 h-12 text-white" />
                </div>
                {/* Steam Animation */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  <div className="w-1 h-6 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-8 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-6 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900">Brewing your brand essence...</h3>
              <p className="text-gray-600 mt-2">Extracting theme from {fileName}</p>
              <div className="mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}

          {/* Theme Preview */}
          {extractedTheme && !isProcessing && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Theme extracted successfully!</p>
                  <p className="text-sm text-green-700">Review the details below before importing</p>
                </div>
              </div>

              {/* Theme Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme Name</label>
                <input
                  type="text"
                  value={extractedTheme.name}
                  onChange={(e) => setExtractedTheme({ ...extractedTheme, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Colors Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Palette size={18} />
                  Color Palette
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Primary</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: extractedTheme.colors.primary }}
                      ></div>
                      <span className="text-sm font-mono">{extractedTheme.colors.primary}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Secondary</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: extractedTheme.colors.secondary }}
                      ></div>
                      <span className="text-sm font-mono">{extractedTheme.colors.secondary}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Accent</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: extractedTheme.colors.accent }}
                      ></div>
                      <span className="text-sm font-mono">{extractedTheme.colors.accent}</span>
                    </div>
                  </div>
                </div>
                {extractedTheme.colors.palette.length > 3 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Additional Colors</p>
                    <div className="flex gap-2 flex-wrap">
                      {extractedTheme.colors.palette.slice(3).map((color, idx) => (
                        <div 
                          key={idx}
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fonts */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Type size={18} />
                  Typography
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Heading Font</p>
                    <p className="font-semibold" style={{ fontFamily: extractedTheme.fonts.heading }}>
                      {extractedTheme.fonts.heading}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Body Font</p>
                    <p className="font-semibold" style={{ fontFamily: extractedTheme.fonts.body }}>
                      {extractedTheme.fonts.body}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Source File Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Total Slides:</span>
                    <span className="ml-2 font-semibold">{extractedTheme.metadata.total_slides}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Images:</span>
                    <span className="ml-2 font-semibold">{extractedTheme.metadata.total_images}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="ml-2 font-semibold">
                      {extractedTheme.metadata.slide_dimensions.width_inches.toFixed(1)}" × {extractedTheme.metadata.slide_dimensions.height_inches.toFixed(1)}"
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Logo Detected:</span>
                    <span className="ml-2 font-semibold">{extractedTheme.metadata.has_logo ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isProcessing && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
            >
              Cancel
            </button>
            {extractedTheme && (
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
              >
                <Coffee size={18} />
                Import Theme
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
