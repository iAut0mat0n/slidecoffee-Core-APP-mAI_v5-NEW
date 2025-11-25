import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ChevronRight, ChevronLeft, Sparkles, Loader2, GripVertical, Plus, Trash2, Edit2, Palette, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Button from './Button';
import { useBrands, useCreateProject, useGenerateOutline, useThemes, useUpdateOutlineDraft } from '../lib/queries';

type WizardStep = 'topic' | 'outline' | 'theme' | 'images' | 'generate';

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

interface WizardData {
  topic: string;
  description: string;
  brand_id: string | null;
  project_id: string | null;
  outline_draft_id: string | null;
  outline_data: OutlineData | null;
  theme_id: string | null;
  image_source: 'pexels' | 'unsplash' | 'none';
}

const WIZARD_STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 'topic', label: 'Topic', description: 'What do you want to present?' },
  { id: 'outline', label: 'Outline', description: 'Review and edit your outline' },
  { id: 'theme', label: 'Theme', description: 'Choose your design' },
  { id: 'images', label: 'Images', description: 'Select image sources' },
  { id: 'generate', label: 'Generate', description: 'Create your presentation' },
];

export default function CreateBrewWizard({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('topic');
  const [wizardData, setWizardData] = useState<WizardData>({
    topic: '',
    description: '',
    brand_id: null,
    project_id: null,
    outline_draft_id: null,
    outline_data: null,
    theme_id: null,
    image_source: 'pexels',
  });

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleUpdateData = (data: Partial<typeof wizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleGenerate = async () => {
    console.log('Generating presentation with data:', wizardData);
    
    if (!wizardData.outline_draft_id) {
      toast.error('No outline to generate from. Please try again.');
      throw new Error('No outline to generate from');
    }

    // Get auth token for SSE request
    const { supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error('Session expired. Please log in again.');
      throw new Error('Session expired');
    }

    // Call the SSE endpoint to generate slides from outline
    // Backend expects { draftId } not { outline_draft_id }
    const response = await fetch('/api/brews/generate-from-outline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        draftId: wizardData.outline_draft_id,
        themeId: wizardData.theme_id,
        imageSource: wizardData.image_source,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Generation failed' }));
      toast.error(error.message || 'Failed to generate slides');
      throw new Error(error.message || 'Failed to generate slides');
    }

    // Parse SSE stream for completion/error events
    // SSE format: event: <name>\ndata: <json>\n\n
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let presentationId: string | null = null;
    let buffer = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep incomplete message in buffer
        
        for (const message of messages) {
          const lines = message.split('\n');
          let eventName = '';
          let eventData: any = null;
          
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                eventData = JSON.parse(line.slice(6));
              } catch (e) {
                // Not JSON, continue
              }
            }
          }
          
          // Process the event
          if (eventName === 'complete' && eventData?.presentationId) {
            presentationId = eventData.presentationId;
            console.log('✅ Generation complete, presentation:', presentationId);
          }
          if (eventName === 'error') {
            toast.error(eventData?.message || 'Generation failed');
            throw new Error(eventData?.message || 'Generation failed');
          }
        }
      }
    }

    // Only navigate if we successfully got a presentationId
    if (!presentationId) {
      toast.error('Generation incomplete. Please try again.');
      throw new Error('Generation incomplete - no presentation ID received');
    }

    // Navigate to the project editor with the project ID
    if (wizardData.project_id) {
      toast.success('Presentation created! Opening editor...');
      onClose();
      navigate(`/projects/${wizardData.project_id}/editor`);
    } else {
      toast.error('No project created. Please try again.');
      throw new Error('No project ID available');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Brew</h2>
              <p className="text-sm text-gray-600">Follow the steps to create your AI-powered presentation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        isCompleted
                          ? 'bg-purple-600 text-white'
                          : isActive
                          ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-500 hidden md:block">{step.description}</div>
                    </div>
                  </div>

                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-full mx-2 ${
                        isCompleted ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {currentStep === 'topic' && (
            <TopicStep
              data={wizardData}
              onUpdate={handleUpdateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 'outline' && (
            <OutlineStep
              data={wizardData}
              onUpdate={handleUpdateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'theme' && (
            <ThemeStep
              data={wizardData}
              onUpdate={handleUpdateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'images' && (
            <ImagesStep
              data={wizardData}
              onUpdate={handleUpdateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'generate' && (
            <GenerateStep
              data={wizardData}
              onGenerate={handleGenerate}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Real step components with backend integration
function TopicStep({ data, onUpdate, onNext }: any) {
  const [loading, setLoading] = useState(false);
  const { data: brandsData } = useBrands();
  const createProject = useCreateProject();
  const generateOutline = useGenerateOutline();
  
  const brands = brandsData || [];

  const handleGenerateOutline = async () => {
    if (!data.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create project
      console.log('🎯 Creating project:', { name: data.topic, brand_id: data.brand_id });
      const project = await createProject.mutateAsync({
        name: data.topic.trim(),
        description: data.description || '',
        brand_id: data.brand_id || null,
      });

      console.log('✅ Project created:', project.id);

      // Step 2: Generate outline
      console.log('🎯 Generating outline for project:', project.id);
      const outlineResponse: any = await generateOutline.mutateAsync({
        topic: data.topic.trim(),
        description: data.description,
        brand_id: data.brand_id,
      });

      console.log('✅ Outline generated:', outlineResponse.draft?.id);

      // Update wizard data
      onUpdate({
        project_id: project.id,
        outline_draft_id: outlineResponse.draft?.id,
        outline_data: outlineResponse.outline_draft || outlineResponse.draft,
      });

      toast.success('Outline generated successfully!');
      onNext();
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">What's your presentation about?</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic *
          </label>
          <input
            type="text"
            value={data.topic}
            onChange={(e) => onUpdate({ topic: e.target.value })}
            placeholder="e.g., Q4 Marketing Strategy"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={500}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add more details about your presentation..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={1000}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand (optional)
          </label>
          <select
            value={data.brand_id || ''}
            onChange={(e) => onUpdate({ brand_id: e.target.value || null })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">No brand</option>
            {brands.map((brand: any) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleGenerateOutline}
            disabled={!data.topic.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating outline...
              </>
            ) : (
              <>
                Generate Outline
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OutlineStep({ data, onUpdate, onNext, onBack }: { data: WizardData; onUpdate: (d: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [localOutline, setLocalOutline] = useState<OutlineData | null>(data.outline_data);
  const updateOutlineDraft = useUpdateOutlineDraft();

  const handleSlideChange = (slideIndex: number, field: string, value: any) => {
    if (!localOutline) return;
    
    const updatedSlides = [...localOutline.slides];
    if (field === 'title') {
      updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], title: value };
    } else if (field === 'keyPoints') {
      updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], keyPoints: value };
    }
    
    setLocalOutline({ ...localOutline, slides: updatedSlides });
  };

  const handleAddSlide = () => {
    if (!localOutline) return;
    
    const newSlide: OutlineSlide = {
      slideNumber: localOutline.slides.length + 1,
      title: 'New Slide',
      type: 'content',
      keyPoints: ['Add your first point'],
    };
    
    setLocalOutline({ ...localOutline, slides: [...localOutline.slides, newSlide] });
  };

  const handleRemoveSlide = (slideIndex: number) => {
    if (!localOutline || localOutline.slides.length <= 1) return;
    
    const updatedSlides = localOutline.slides
      .filter((_, i) => i !== slideIndex)
      .map((slide, i) => ({ ...slide, slideNumber: i + 1 }));
    
    setLocalOutline({ ...localOutline, slides: updatedSlides });
  };

  const handleSaveAndContinue = async () => {
    if (!localOutline || !data.outline_draft_id) {
      onNext();
      return;
    }

    try {
      await updateOutlineDraft.mutateAsync({
        id: data.outline_draft_id,
        data: { outline_structure: localOutline },
      });
      onUpdate({ outline_data: localOutline });
      toast.success('Outline saved!');
      onNext();
    } catch (error: any) {
      console.error('Failed to save outline:', error);
      toast.error('Failed to save outline');
    }
  };

  if (!localOutline) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading outline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">{localOutline.title}</h3>
          <p className="text-gray-600 text-sm">{localOutline.summary}</p>
        </div>
        <button
          onClick={handleAddSlide}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      <div className="space-y-3 mb-6 max-h-[400px] overflow-auto">
        {localOutline.slides.map((slide, index) => (
          <div
            key={index}
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
              editingSlide === index ? 'ring-2 ring-purple-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-4 h-4 cursor-move" />
                <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center justify-center">
                  {slide.slideNumber}
                </span>
              </div>
              
              <div className="flex-1">
                {editingSlide === index ? (
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    autoFocus
                    onBlur={() => setEditingSlide(null)}
                  />
                ) : (
                  <div 
                    className="font-medium text-gray-900 cursor-pointer hover:text-purple-600"
                    onClick={() => setEditingSlide(index)}
                  >
                    {slide.title}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                    {slide.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {slide.keyPoints.length} point{slide.keyPoints.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <ul className="mt-2 space-y-1">
                  {slide.keyPoints.slice(0, 3).map((point, pIndex) => (
                    <li key={pIndex} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                  {slide.keyPoints.length > 3 && (
                    <li className="text-sm text-gray-400">+{slide.keyPoints.length - 3} more...</li>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingSlide(editingSlide === index ? null : index)}
                  className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveSlide(index)}
                  disabled={localOutline.slides.length <= 1}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSaveAndContinue} 
          className="flex-1"
          disabled={updateOutlineDraft.isPending}
        >
          {updateOutlineDraft.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ThemeStep({ data, onUpdate, onNext, onBack }: { data: WizardData; onUpdate: (d: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  const { data: themesData, isLoading } = useThemes();
  const themes = themesData || [];

  const handleSelectTheme = (themeId: string) => {
    onUpdate({ theme_id: themeId });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading themes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-600" />
          Choose your theme
        </h3>
        <p className="text-gray-600 text-sm mt-1">Select a visual style for your presentation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {themes.map((theme: any) => {
          const palette = theme.palette_json || {};
          const isSelected = data.theme_id === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
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
              <p className="text-xs text-gray-500 capitalize">{theme.category}</p>
              
              <div className="flex gap-1 mt-2">
                {['primary', 'secondary', 'accent', 'background'].map((colorKey) => (
                  <div
                    key={colorKey}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ background: palette[colorKey] || '#ccc' }}
                    title={colorKey}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg mb-6">
          <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No themes available</p>
          <p className="text-sm text-gray-500">Default styling will be applied</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ImagesStep({ data, onUpdate, onNext, onBack }: { data: WizardData; onUpdate: (d: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  const imageOptions = [
    {
      id: 'pexels' as const,
      name: 'Pexels',
      description: 'High-quality stock photos, curated for professionals',
      recommended: true,
    },
    {
      id: 'unsplash' as const,
      name: 'Unsplash',
      description: 'Beautiful free images from photographers worldwide',
      recommended: false,
    },
    {
      id: 'none' as const,
      name: 'No Images',
      description: 'Create text-focused slides without images',
      recommended: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-purple-600" />
          Select image sources
        </h3>
        <p className="text-gray-600 text-sm mt-1">Choose where to source images for your slides</p>
      </div>

      <div className="space-y-4 mb-6">
        {imageOptions.map((option) => {
          const isSelected = data.image_source === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onUpdate({ image_source: option.id })}
              className={`w-full flex items-center gap-4 p-5 border-2 rounded-xl transition-all text-left ${
                isSelected
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{option.name}</span>
                  {option.recommended && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{option.description}</p>
              </div>

              {isSelected && (
                <Check className="w-5 h-5 text-purple-600" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function GenerateStep({ data, onGenerate, onBack }: { data: WizardData; onGenerate: () => void; onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const { data: themesData } = useThemes();
  const themes = themesData || [];
  
  const selectedTheme = themes.find((t: any) => t.id === data.theme_id);
  const slideCount = data.outline_data?.slides?.length || 0;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-4">Ready to brew your presentation!</h3>
      <p className="text-gray-600 mb-8">
        We'll use AI to generate beautiful slides based on your topic, outline, and selected theme.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h4 className="font-semibold mb-4 text-gray-900">Review your choices:</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Topic</span>
            <span className="font-medium text-gray-900 max-w-[60%] truncate">{data.topic}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Slides</span>
            <span className="font-medium text-gray-900">{slideCount} slides</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Theme</span>
            <span className="font-medium text-gray-900 flex items-center gap-2">
              {selectedTheme ? (
                <>
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ background: selectedTheme.palette_json?.primary || '#6b46c1' }}
                  />
                  {selectedTheme.name}
                </>
              ) : 'Default'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Images</span>
            <span className="font-medium text-gray-900 capitalize">{data.image_source}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1" disabled={generating}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleGenerate} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
