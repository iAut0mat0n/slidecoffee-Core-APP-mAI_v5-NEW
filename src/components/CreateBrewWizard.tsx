import { useState } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from './Button';
import { useBrands, useCreateProject, useGenerateOutline } from '../lib/queries';

type WizardStep = 'topic' | 'outline' | 'theme' | 'images' | 'generate';

const WIZARD_STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 'topic', label: 'Topic', description: 'What do you want to present?' },
  { id: 'outline', label: 'Outline', description: 'Review and edit your outline' },
  { id: 'theme', label: 'Theme', description: 'Choose your design' },
  { id: 'images', label: 'Images', description: 'Select image sources' },
  { id: 'generate', label: 'Generate', description: 'Create your presentation' },
];

export default function CreateBrewWizard({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('topic');
  const [wizardData, setWizardData] = useState({
    topic: '',
    description: '',
    brand_id: null as string | null,
    outline_draft_id: null as string | null,
    theme_id: null as string | null,
    image_source: 'pexels' as 'pexels' | 'unsplash' | 'none',
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
    // This will be implemented when we connect to backend endpoints
    console.log('Generating presentation with data:', wizardData);
    onClose();
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

function OutlineStep({ onNext, onBack }: any) {
  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Review your outline</h3>
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <p className="text-gray-600">Outline editor will be implemented here</p>
        <p className="text-sm text-gray-500 mt-2">This will show the AI-generated outline that you can edit</p>
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

function ThemeStep({ onNext, onBack }: any) {
  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Choose your theme</h3>
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <p className="text-gray-600">Theme picker will be implemented here</p>
        <p className="text-sm text-gray-500 mt-2">This will show the 6 standard themes to choose from</p>
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

function ImagesStep({ data, onUpdate, onNext, onBack }: any) {
  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Select image sources</h3>
      <div className="space-y-4 mb-6">
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
          <input
            type="radio"
            name="image_source"
            value="pexels"
            checked={data.image_source === 'pexels'}
            onChange={(e) => onUpdate({ image_source: e.target.value })}
            className="w-4 h-4 text-purple-600"
          />
          <div>
            <div className="font-medium">Pexels (Recommended)</div>
            <div className="text-sm text-gray-600">High-quality stock photos</div>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
          <input
            type="radio"
            name="image_source"
            value="unsplash"
            checked={data.image_source === 'unsplash'}
            onChange={(e) => onUpdate({ image_source: e.target.value })}
            className="w-4 h-4 text-purple-600"
          />
          <div>
            <div className="font-medium">Unsplash</div>
            <div className="text-sm text-gray-600">Beautiful free images</div>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
          <input
            type="radio"
            name="image_source"
            value="none"
            checked={data.image_source === 'none'}
            onChange={(e) => onUpdate({ image_source: e.target.value })}
            className="w-4 h-4 text-purple-600"
          />
          <div>
            <div className="font-medium">No images</div>
            <div className="text-sm text-gray-600">Create slides without images</div>
          </div>
        </label>
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

function GenerateStep({ data, onGenerate, onBack }: any) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold mb-4">Ready to brew your presentation!</h3>
      <p className="text-gray-600 mb-8">
        We'll use AI to generate beautiful slides based on your topic, outline, and selected theme.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h4 className="font-semibold mb-3">Review your choices:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Topic:</span>
            <span className="font-medium">{data.topic}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Image Source:</span>
            <span className="font-medium capitalize">{data.image_source}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={onGenerate} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700">
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Presentation
        </Button>
      </div>
    </div>
  );
}
