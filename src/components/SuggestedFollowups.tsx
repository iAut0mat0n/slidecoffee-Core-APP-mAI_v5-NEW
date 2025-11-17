// React imported via JSX transform;
import { ArrowRight } from 'lucide-react';

interface SuggestedFollowupsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export default function SuggestedFollowups({ suggestions, onSelect }: SuggestedFollowupsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-gray-500 px-1">
        Suggested follow-ups:
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="group flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span>{suggestion}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

