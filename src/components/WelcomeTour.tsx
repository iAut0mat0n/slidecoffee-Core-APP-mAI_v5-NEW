import { useState } from 'react';

export default function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const tourSteps = [
    {
      title: 'Welcome to SlideCoffee! ☕',
      description: 'Let us show you around and help you create your first presentation in minutes.',
      image: '🎉',
    },
    {
      title: 'Create Presentations',
      description: 'Start from scratch, use AI generation, or choose from our template library to get started quickly.',
      image: '📊',
    },
    {
      title: 'Collaborate in Real-time',
      description: 'Invite team members, see live cursors, and work together seamlessly on presentations.',
      image: '👥',
    },
    {
      title: 'Apply Brand Guidelines',
      description: 'Create and save brand guidelines to ensure consistent styling across all your presentations.',
      image: '🎨',
    },
    {
      title: 'Export & Share',
      description: 'Export to PDF, PPT, or share with a link. Your presentations are always accessible.',
      image: '📤',
    },
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="p-12 text-center">
          {/* Image/Icon */}
          <div className="text-8xl mb-6">{step.image}</div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-4">{step.title}</h2>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
            {step.description}
          </p>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-purple-600 w-8'
                    : index < currentStep
                    ? 'bg-purple-300'
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={skipTour}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip Tour
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Previous
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

