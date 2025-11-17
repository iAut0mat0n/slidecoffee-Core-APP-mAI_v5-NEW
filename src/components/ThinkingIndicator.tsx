import { useState, useEffect } from 'react';
import { Coffee, Loader2 } from 'lucide-react';
import { getRandomThinkingMessage, AI_AGENT } from '../config/aiAgent';

export default function ThinkingIndicator() {
  const [message, setMessage] = useState(getRandomThinkingMessage());

  useEffect(() => {
    // Rotate thinking messages every 2 seconds
    const interval = setInterval(() => {
      setMessage(getRandomThinkingMessage());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
        <Coffee className="w-5 h-5 text-purple-600" />
      </div>

      {/* Thinking Bubble */}
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-600 mb-1">
          {AI_AGENT.name}
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
          <span className="text-sm text-gray-700">{message}</span>
        </div>
      </div>
    </div>
  );
}

