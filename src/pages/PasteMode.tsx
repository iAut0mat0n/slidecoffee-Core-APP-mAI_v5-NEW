import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, FileText, Check, ChevronRight, Palette, Image as ImageIcon, GripVertical, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBrands, useThemes } from '../lib/queries';
import CollapsibleSidebar from '../components/CollapsibleSidebar';

type Step = 'paste' | 'outline' | 'theme' | 'images' | 'generate';

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

const STEPS: { id: Step; label: string }[] = [
  { id: 'paste', label: 'Paste Content' },
  { id: 'outline', label: 'Review Outline' },
  { id: 'theme', label: 'Choose Theme' },
  { id: 'images', label: 'Image Source' },
  { id: 'generate', label: 'Generate' },
];

export default function PasteMode() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDraftId = searchParams.get('draft');
  
  const [currentStep, setCurrentStep] = useState<Step>('paste');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'pexels' | 'unsplash' | 'none'>('pexels');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(urlDraftId);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [options, setOptions] = useState({
    autoDetectHeadings: true,
    createTitleSlide: true,
    addSlideNumbers: false,
    smartFormatting: true,
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
            setContent(draft.source_content);
          }
          const stepMap: Record<number, Step> = { 1: 'paste', 2: 'outline', 3: 'theme', 4: 'images', 5: 'generate' };
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

  const handleAnalyzeContent = async () => {
    if (!content.trim()) {
      toast.error('Please paste some content first');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/brews/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content,
          options: {
            autoDetectHeadings: options.autoDetectHeadings,
            createTitleSlide: options.createTitleSlide,
            smartFormatting: options.smartFormatting,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      setOutlineData(data.outline);
      setDraftId(data.draft_id);
      setSearchParams({ draft: data.draft_id });
      handleStepChange('outline');
      toast.success('Content analyzed! Review your outline.');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
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
    const stepMap: Record<Step, number> = { paste: 1, outline: 2, theme: 3, images: 4, generate: 5 };
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
          source_type: 'paste',
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
      case 'paste':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Your Content
                </h3>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Paste your content here...

You can paste:
• Meeting notes
• Articles or blog posts
• Reports or documents
• Bullet points or outlines
• Research findings

We'll automatically detect headings, sections, and key points to create slides.`}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    {content.length.toLocaleString()} characters | {content.split('\n').filter(line => line.trim()).length} lines
                  </div>
                  <button
                    onClick={() => setContent('')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply Brand (Optional)
                </label>
                <select
                  value={selectedBrand || ''}
                  onChange={(e) => handleBrandSelect(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">No brand</option>
                  {brands.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.autoDetectHeadings}
                      onChange={(e) => setOptions(prev => ({ ...prev, autoDetectHeadings: e.target.checked }))}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">Auto-detect headings</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.createTitleSlide}
                      onChange={(e) => setOptions(prev => ({ ...prev, createTitleSlide: e.target.checked }))}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">Create title slide</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.addSlideNumbers}
                      onChange={(e) => setOptions(prev => ({ ...prev, addSlideNumbers: e.target.checked }))}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">Add slide numbers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.smartFormatting}
                      onChange={(e) => setOptions(prev => ({ ...prev, smartFormatting: e.target.checked }))}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">Smart formatting</span>
                  </label>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Tips
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Use # for main headings (slide titles)</li>
                  <li>• Use ## for subheadings</li>
                  <li>• Bullet points become slide content</li>
                  <li>• Empty lines separate sections</li>
                  <li>• We'll optimize layout automatically</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-3">Example Format</h3>
                <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap">
{`# Q4 Results

## Revenue Growth
- 25% increase YoY
- $5M total revenue
- 1000+ new customers

## Key Achievements
- Launched new product
- Expanded to 3 markets`}
                </pre>
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
                    {theme.description && (
                      <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                    )}
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
                We'll create your presentation with {outlineData?.slides.length || 0} slides
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h4 className="font-semibold mb-4">Summary</h4>
              <div className="space-y-2 text-sm">
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
      case 'paste': return content.trim().length > 50;
      case 'outline': return outlineData && outlineData.slides.length > 0;
      case 'theme': return selectedTheme !== null;
      case 'images': return true;
      case 'generate': return !isGenerating;
    }
  };

  const handleNext = () => {
    if (currentStep === 'paste') {
      handleAnalyzeContent();
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
                <h1 className="text-2xl font-bold">Paste Content</h1>
                <p className="text-gray-600">Transform your content into a presentation</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
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
                  <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
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
              disabled={!canProceed() || isAnalyzing || isGenerating}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
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
              ) : currentStep === 'paste' ? (
                <>
                  Analyze Content
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
