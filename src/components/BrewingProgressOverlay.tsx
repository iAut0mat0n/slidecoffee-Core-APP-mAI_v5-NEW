import { useEffect, useState } from 'react';

interface BrewingProgressOverlayProps {
  isVisible: boolean;
  currentStep?: string;
  progress?: number;
}

export default function BrewingProgressOverlay({
  isVisible,
  currentStep = 'Brewing your presentation...',
  progress = 0,
}: BrewingProgressOverlayProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setAnimatedProgress((prev) => {
          if (prev >= progress) return prev;
          return Math.min(prev + 2, progress);
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isVisible, progress]);

  if (!isVisible) return null;

  const steps = [
    { id: 1, label: 'Analyzing your prompt', complete: progress > 20 },
    { id: 2, label: 'Generating content structure', complete: progress > 40 },
    { id: 3, label: 'Designing slide layouts', complete: progress > 60 },
    { id: 4, label: 'Adding visual elements', complete: progress > 80 },
    { id: 5, label: 'Finalizing presentation', complete: progress >= 100 },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Coffee Animation */}
        <div className="mb-8 relative">
          <div className="text-9xl animate-bounce">☕</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-white mb-4">
          Brewing Your Presentation
        </h2>
        <p className="text-xl text-purple-200 mb-8">{currentStep}</p>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-4 overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500 ease-out"
            style={{ width: `${animatedProgress}%` }}
          ></div>
        </div>

        {/* Progress Percentage */}
        <div className="text-5xl font-bold text-white mb-12">
          {Math.round(animatedProgress)}%
        </div>

        {/* Steps */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  step.complete
                    ? 'bg-white/20'
                    : 'bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.complete
                    ? 'bg-green-500'
                    : 'bg-white/20'
                }`}>
                  {step.complete ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  )}
                </div>
                <span className={`text-lg ${
                  step.complete ? 'text-white font-medium' : 'text-purple-200'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 text-purple-200 text-sm">
          💡 Did you know? The average presentation takes 4 hours to create manually.
          <br />
          We're doing it in seconds!
        </div>
      </div>
    </div>
  );
}

