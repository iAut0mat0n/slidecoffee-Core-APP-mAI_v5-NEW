import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Loader2, Check, ChevronRight, Palette, Image as ImageIcon, Sparkles, GripVertical, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBrands, useThemes } from '../lib/queries';
import CollapsibleSidebar from '../components/CollapsibleSidebar';

type Step = 'upload' | 'preview' | 'outline' | 'theme' | 'images' | 'generate';

interface OutlineSlide {
  slideNumber: number;
  title: string;
  type: string;
  keyPoints: string[];
}

interface OutlineData {
  title: string;
  summary: string;
  slides: OutlineSlide[];
}

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Preview' },
  { id: 'outline', label: 'Review Outline' },
  { id: 'theme', label: 'Choose Theme' },
  { id: 'images', label: 'Image Source' },
  { id: 'generate', label: 'Generate' },
];

const SUPPORTED_FORMATS = [
  { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'PowerPoint' },
  { ext: '.ppt', mime: 'application/vnd.ms-powerpoint', name: 'PowerPoint (Legacy)' },
  { ext: '.pdf', mime: 'application/pdf', name: 'PDF' },
  { ext: '.txt', mime: 'text/plain', name: 'Text File' },
  { ext: '.md', mime: 'text/markdown', name: 'Markdown' },
];

export default function ImportMode() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDraftId = searchParams.get('draft');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'pexels' | 'unsplash' | 'none'>('pexels');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(urlDraftId);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  
  const [options, setOptions] = useState({
    preserveFormatting: true,
    importImages: true,
    importNotes: true,
    applyBrand: false,
  });

  const { data: brandsData } = useBrands();
  const { data: themesData } = useThemes();
  const brands = brandsData || [];
  const themes = themesData || [];

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  interface DraftUpdates {
    outline_json?: OutlineData;
    current_step?: number;
    theme_id?: string;
    brand_id?: string | null;
    image_source?: string;
    options?: typeof options;
  }

  const saveDraftToServer = useCallback(async (
    id: string, 
    updates: DraftUpdates
  ) => {
    try {
      await fetch(`/api/brews/outline-drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, []);

  const debouncedSaveDraft = useCallback((updates: DraftUpdates) => {
    if (!draftId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraftToServer(draftId, updates);
    }, 1000);
  }, [draftId, saveDraftToServer]);

  useEffect(() => {
    if (!urlDraftId) return;
    
    const loadDraft = async () => {
      setIsLoadingDraft(true);
      try {
        const response = await fetch(`/api/brews/outline-drafts/${urlDraftId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const draft = await response.json();
          setDraftId(draft.id);
          if (draft.outline_json) {
            setOutlineData(draft.outline_json);
          }
          if (draft.theme_id) {
            setSelectedTheme(draft.theme_id);
          }
          if (draft.brand_id) {
            setSelectedBrand(draft.brand_id);
          }
          if (draft.image_source) {
            setImageSource(draft.image_source as 'pexels' | 'unsplash' | 'none');
          }
          if (draft.options_json) {
            setOptions(draft.options_json);
          }
          if (draft.source_content) {
            setExtractedContent(draft.source_content);
          }
          const stepMap: Record<number, Step> = { 1: 'upload', 2: 'preview', 3: 'outline', 4: 'theme', 5: 'images', 6: 'generate' };
          if (draft.current_step && stepMap[draft.current_step]) {
            setCurrentStep(stepMap[draft.current_step]);
          }
          toast.success('Draft loaded successfully');
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        toast.error('Failed to load draft');
      } finally {
        setIsLoadingDraft(false);
      }
    };
    
    loadDraft();
  }, [urlDraftId]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 50MB.');
      return false;
    }

    const isSupported = SUPPORTED_FORMATS.some(
      format => file.name.toLowerCase().endsWith(format.ext) || file.type === format.mime
    );
    
    if (!isSupported) {
      toast.error('Unsupported file format. Please upload PPTX, PDF, TXT, or MD files.');
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadedFile({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setUploadedFile({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('options', JSON.stringify(options));
      if (selectedBrand) {
        formData.append('brand_id', selectedBrand);
      }

      const response = await fetch('/api/brews/import-file', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process file');
      }

      const data = await response.json();
      setExtractedContent(data.content || '');
      setOutlineData(data.outline);
      setDraftId(data.draft_id);
      setSearchParams({ draft: data.draft_id });
      handleStepChange('preview');
      toast.success('File processed successfully!');
    } catch (error: any) {
      console.error('Processing error:', error);
      toast.error(error.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSlide = (slideNumber: number, updates: Partial<OutlineSlide>) => {
    if (!outlineData) return;
    const newOutline = {
      ...outlineData,
      slides: outlineData.slides.map(slide =>
        slide.slideNumber === slideNumber ? { ...slide, ...updates } : slide
      ),
    };
    setOutlineData(newOutline);
    debouncedSaveDraft({ outline_json: newOutline });
  };

  const handleAddSlide = (afterIndex: number) => {
    if (!outlineData) return;
    const newSlide: OutlineSlide = {
      slideNumber: afterIndex + 2,
      title: 'New Slide',
      type: 'content',
      keyPoints: ['Add your content here'],
    };
    const newSlides = [
      ...outlineData.slides.slice(0, afterIndex + 1),
      newSlide,
      ...outlineData.slides.slice(afterIndex + 1),
    ].map((slide, idx) => ({ ...slide, slideNumber: idx + 1 }));
    const newOutline = { ...outlineData, slides: newSlides };
    setOutlineData(newOutline);
    debouncedSaveDraft({ outline_json: newOutline });
  };

  const handleDeleteSlide = (slideNumber: number) => {
    if (!outlineData || outlineData.slides.length <= 1) return;
    const newSlides = outlineData.slides
      .filter(s => s.slideNumber !== slideNumber)
      .map((slide, idx) => ({ ...slide, slideNumber: idx + 1 }));
    const newOutline = { ...outlineData, slides: newSlides };
    setOutlineData(newOutline);
    debouncedSaveDraft({ outline_json: newOutline });
  };

  const handleStepChange = (newStep: Step) => {
    setCurrentStep(newStep);
    const stepMap: Record<Step, number> = { upload: 1, preview: 2, outline: 3, theme: 4, images: 5, generate: 6 };
    debouncedSaveDraft({ current_step: stepMap[newStep] });
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    debouncedSaveDraft({ theme_id: themeId });
  };

  const handleBrandSelect = (brandId: string | null) => {
    setSelectedBrand(brandId);
    debouncedSaveDraft({ brand_id: brandId });
  };

  const handleImageSourceSelect = (source: 'pexels' | 'unsplash' | 'none') => {
    setImageSource(source);
    debouncedSaveDraft({ image_source: source });
  };

  const handleGenerate = async () => {
    if (!outlineData || !selectedTheme) {
      toast.error('Please complete all steps first');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-slides-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          draft_id: draftId,
          outline: outlineData,
          theme_id: selectedTheme,
          brand_id: selectedBrand,
          image_source: imageSource,
          source_type: 'import',
          original_content: extractedContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'complete' && data.presentation_id) {
                toast.success('Presentation created!');
                navigate(`/editor/${data.presentation_id}`);
                return;
              }
            } catch (e) {
              // Continue parsing
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pptx,.ppt,.pdf,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!uploadedFile ? (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                    <p className="text-gray-600 mb-6">or click to browse</p>
                    <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                      Choose File
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      Supported: PPTX, PDF, TXT, MD (max 50MB)
                    </p>
                  </>
                ) : (
                  <div className="py-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{uploadedFile.name}</h3>
                    <p className="text-gray-600 mb-4">{formatFileSize(uploadedFile.size)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Change file
                    </button>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold mb-4">Import Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.preserveFormatting}
                        onChange={(e) => setOptions(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm">Preserve original formatting</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.importImages}
                        onChange={(e) => setOptions(prev => ({ ...prev, importImages: e.target.checked }))}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm">Import images (when available)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.importNotes}
                        onChange={(e) => setOptions(prev => ({ ...prev, importNotes: e.target.checked }))}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm">Import speaker notes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.applyBrand}
                        onChange={(e) => setOptions(prev => ({ ...prev, applyBrand: e.target.checked }))}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm">Apply brand guidelines after import</span>
                    </label>
                  </div>

                  {options.applyBrand && brands.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Brand
                      </label>
                      <select
                        value={selectedBrand || ''}
                        onChange={(e) => setSelectedBrand(e.target.value || null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Choose a brand...</option>
                        {brands.map((brand: any) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Supported Formats</h3>
                <div className="space-y-3">
                  {[
                    { format: 'PowerPoint', ext: '.pptx', icon: '📊' },
                    { format: 'PDF', ext: '.pdf', icon: '📄' },
                    { format: 'Text', ext: '.txt', icon: '📝' },
                    { format: 'Markdown', ext: '.md', icon: '📑' },
                  ].map((item) => (
                    <div key={item.format} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{item.format}</div>
                        <div className="text-xs text-gray-600">{item.ext}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  What happens next?
                </h3>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-600">1.</span>
                    <span>We analyze your file structure</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-600">2.</span>
                    <span>Extract content and organize slides</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-600">3.</span>
                    <span>You review and customize</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-purple-600">4.</span>
                    <span>AI enhances your presentation</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold">{uploadedFile?.name}</h3>
                  <p className="text-sm text-gray-600">Extracted content preview</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {extractedContent.slice(0, 2000)}
                  {extractedContent.length > 2000 && '...'}
                </pre>
              </div>
              
              <p className="text-sm text-gray-500 mt-3">
                {extractedContent.length.toLocaleString()} characters extracted
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Content extracted successfully!</p>
                <p className="text-sm text-green-700">We've created an outline with {outlineData?.slides.length || 0} slides. Continue to review and edit.</p>
              </div>
            </div>
          </div>
        );

      case 'outline':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-xl font-semibold mb-2">{outlineData?.title || 'Your Presentation'}</h3>
              <p className="text-gray-600">{outlineData?.summary}</p>
            </div>

            <div className="space-y-4">
              {outlineData?.slides.map((slide, index) => (
                <div
                  key={slide.slideNumber}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <GripVertical className="w-5 h-5 cursor-move" />
                      <span className="text-sm font-medium w-6">{slide.slideNumber}</span>
                    </div>
                    
                    <div className="flex-1">
                      {editingSlide === slide.slideNumber ? (
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(slide.slideNumber, { title: e.target.value })}
                          onBlur={() => setEditingSlide(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingSlide(null)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                      ) : (
                        <h4 className="font-semibold text-gray-900">{slide.title}</h4>
                      )}
                      
                      <div className="mt-2 space-y-1">
                        {slide.keyPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                      
                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {slide.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingSlide(slide.slideNumber)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddSlide(index)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.slideNumber)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        disabled={outlineData.slides.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-600" />
                Choose your theme
              </h3>
              <p className="text-gray-600 text-sm mt-1">Select a visual style for your presentation</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((theme: any) => {
                const palette = theme.palette_json || {};
                const isSelected = selectedTheme === theme.id;
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-100 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div 
                      className="h-24 rounded-lg mb-3 flex items-center justify-center"
                      style={{ 
                        background: palette.background || '#f8f9fa',
                        color: palette.text || '#1a1a1a'
                      }}
                    >
                      <div className="text-center">
                        <div 
                          className="w-12 h-2 rounded mb-2 mx-auto"
                          style={{ background: palette.primary || '#6b46c1' }}
                        />
                        <div 
                          className="w-8 h-1.5 rounded mx-auto opacity-60"
                          style={{ background: palette.secondary || '#9f7aea' }}
                        />
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                Image Source
              </h3>
              <p className="text-gray-600 text-sm mt-1">Choose where to source images for your slides</p>
            </div>

            <div className="space-y-4">
              {[
                { id: 'pexels', name: 'Pexels', description: 'High-quality free stock photos' },
                { id: 'unsplash', name: 'Unsplash', description: 'Beautiful free images' },
                { id: 'none', name: 'No Images', description: 'Text-only slides' },
              ].map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleImageSourceSelect(source.id as 'pexels' | 'unsplash' | 'none')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    imageSource === source.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{source.name}</h4>
                      <p className="text-sm text-gray-600">{source.description}</p>
                    </div>
                    {imageSource === source.id && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready to Generate!</h3>
              <p className="text-gray-600">
                We'll enhance your imported content into {outlineData?.slides.length || 0} beautiful slides
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h4 className="font-semibold mb-4">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Source</span>
                  <span className="font-medium">{uploadedFile?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Title</span>
                  <span className="font-medium">{outlineData?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slides</span>
                  <span className="font-medium">{outlineData?.slides.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Theme</span>
                  <span className="font-medium">{themes.find((t: any) => t.id === selectedTheme)?.name || 'Default'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images</span>
                  <span className="font-medium capitalize">{imageSource}</span>
                </div>
              </div>
            </div>

            {isGenerating && (
              <div className="mb-8">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Generating your presentation...</p>
              </div>
            )}
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload': return uploadedFile !== null;
      case 'preview': return extractedContent.length > 0;
      case 'outline': return outlineData && outlineData.slides.length > 0;
      case 'theme': return selectedTheme !== null;
      case 'images': return true;
      case 'generate': return !isGenerating;
    }
  };

  const handleNext = () => {
    if (currentStep === 'upload') {
      handleProcessFile();
    } else if (currentStep === 'generate') {
      handleGenerate();
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        handleStepChange(STEPS[nextIndex].id);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      handleStepChange(STEPS[currentStepIndex - 1].id);
    } else {
      navigate('/brews');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Import Presentation</h1>
                <p className="text-gray-600">Upload and enhance your existing content</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 overflow-x-auto">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap ${
                  index === currentStepIndex
                    ? 'bg-purple-600 text-white'
                    : index < currentStepIndex
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              {currentStepIndex === 0 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed() || isProcessing || isGenerating}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : currentStep === 'generate' ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Presentation
                </>
              ) : currentStep === 'upload' ? (
                <>
                  Process File
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
