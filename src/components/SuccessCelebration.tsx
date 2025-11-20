import { useEffect, useState } from 'react';

interface SuccessCelebrationProps {
  message: string;
  subtitle?: string;
  onClose?: () => void;
  autoClose?: number;
}

export default function SuccessCelebration({
  message,
  subtitle,
  onClose,
  autoClose = 3000,
}: SuccessCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
        {/* Confetti Animation */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        {subtitle && (
          <p className="text-gray-600 mb-6">{subtitle}</p>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

// Onboarding Checklist Component
export function OnboardingChecklist() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Create your first presentation', completed: false },
    { id: 2, title: 'Invite a team member', completed: false },
    { id: 3, title: 'Set up brand guidelines', completed: false },
    { id: 4, title: 'Export your first presentation', completed: false },
  ]);

  const [isMinimized, setIsMinimized] = useState(false);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 w-80">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div>
          <h3 className="font-semibold">Getting Started</h3>
          <p className="text-sm text-gray-600">{completedCount} of {tasks.length} completed</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Progress Bar */}
          <div className="px-4 pt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Task List */}
          <div className="p-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  task.completed
                    ? 'bg-purple-600 border-purple-600'
                    : 'border-gray-300'
                }`}>
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          {completedCount === tasks.length && (
            <div className="p-4 bg-purple-50 border-t border-purple-200">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <span className="text-xl">🎉</span>
                <span className="font-medium">All done! You are ready to go!</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

