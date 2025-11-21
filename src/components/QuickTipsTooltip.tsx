import { useState, useEffect } from 'react';

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetSelector?: string;
}

interface QuickTipsTooltipProps {
  tips: Tip[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function QuickTipsTooltip({ tips, onComplete, autoStart = true }: QuickTipsTooltipProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const currentTip = tips[currentTipIndex];
  const isLastTip = currentTipIndex === tips.length - 1;

  useEffect(() => {
    if (!isActive || !currentTip?.targetSelector) return;

    const updatePosition = () => {
      const target = document.querySelector(currentTip.targetSelector!);
      if (target) {
        const rect = target.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const offset = 16;

        let top = 0;
        let left = 0;

        switch (currentTip.position) {
          case 'top':
            top = rect.top - tooltipHeight - offset;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'bottom':
            top = rect.bottom + offset;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - offset;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + offset;
            break;
        }

        setPosition({ top, left });

        // Highlight target element
        target.classList.add('quick-tip-highlight');
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      const target = document.querySelector(currentTip.targetSelector!);
      if (target) {
        target.classList.remove('quick-tip-highlight');
      }
    };
  }, [currentTip, isActive]);

  const handleNext = () => {
    if (isLastTip) {
      handleComplete();
    } else {
      setCurrentTipIndex(currentTipIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(currentTipIndex - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onComplete?.();
  };

  const handleComplete = () => {
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive || !currentTip) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />

      {/* Tooltip */}
      <div
        className="fixed z-50 animate-slide-up"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '320px',
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-purple-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTip.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{currentTip.title}</h3>
                <p className="text-xs text-purple-100">
                  Tip {currentTipIndex + 1} of {tips.length}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentTip.description}
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentTipIndex === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {/* Progress Dots */}
            <div className="flex gap-1">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentTipIndex ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg"
            >
              {isLastTip ? 'Got it!' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Arrow Pointer */}
        <div
          className={`absolute w-4 h-4 bg-white border-2 border-purple-600 transform rotate-45 ${
            currentTip.position === 'top' ? 'bottom-[-10px] left-1/2 -translate-x-1/2' :
            currentTip.position === 'bottom' ? 'top-[-10px] left-1/2 -translate-x-1/2' :
            currentTip.position === 'left' ? 'right-[-10px] top-1/2 -translate-y-1/2' :
            'left-[-10px] top-1/2 -translate-y-1/2'
          }`}
        />
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .quick-tip-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 0 8px rgba(147, 51, 234, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}

// Example usage component
export function QuickTipsExample() {
  const [showTips, setShowTips] = useState(false);

  const tips: Tip[] = [
    {
      id: 'create-button',
      title: 'Create Your First Presentation',
      description: 'Click here to start creating a new presentation. You can use AI to generate slides, paste content, or import existing files.',
      icon: '✨',
      position: 'bottom',
      targetSelector: '[data-tip="create-button"]',
    },
    {
      id: 'workspace-switcher',
      title: 'Switch Workspaces',
      description: 'Use this dropdown to switch between different workspaces. Each workspace has its own projects, brands, and settings.',
      icon: '🏢',
      position: 'bottom',
      targetSelector: '[data-tip="workspace-switcher"]',
    },
    {
      id: 'search',
      title: 'Quick Search',
      description: 'Search across all your presentations, templates, and brands. Use keyboard shortcut Cmd+K for quick access.',
      icon: '🔍',
      position: 'bottom',
      targetSelector: '[data-tip="search"]',
    },
    {
      id: 'brands',
      title: 'Manage Your Brands',
      description: 'Create and manage brand guidelines including colors, fonts, and logos. Apply them consistently across all presentations.',
      icon: '🎨',
      position: 'right',
      targetSelector: '[data-tip="brands"]',
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowTips(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
      >
        Show Quick Tips
      </button>

      {showTips && (
        <QuickTipsTooltip
          tips={tips}
          onComplete={() => {
            setShowTips(false);
            // Save to localStorage that user has seen tips
            localStorage.setItem('quick-tips-seen', 'true');
          }}
        />
      )}
    </>
  );
}

