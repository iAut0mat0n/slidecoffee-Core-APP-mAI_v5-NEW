import { useState } from 'react';

interface ShortcutGroup {
  category: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: 'General',
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Ctrl', 'K'], description: 'Quick search' },
        { keys: ['Ctrl', 'N'], description: 'New presentation' },
        { keys: ['Ctrl', 'S'], description: 'Save changes' },
        { keys: ['Esc'], description: 'Close dialog' },
      ],
    },
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['G', 'D'], description: 'Go to Dashboard' },
        { keys: ['G', 'P'], description: 'Go to Projects' },
        { keys: ['G', 'B'], description: 'Go to Brands' },
        { keys: ['G', 'T'], description: 'Go to Templates' },
      ],
    },
    {
      category: 'Editor',
      shortcuts: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['Ctrl', 'C'], description: 'Copy' },
        { keys: ['Ctrl', 'V'], description: 'Paste' },
        { keys: ['Ctrl', 'D'], description: 'Duplicate slide' },
        { keys: ['Delete'], description: 'Delete slide' },
      ],
    },
    {
      category: 'Presentation',
      shortcuts: [
        { keys: ['F'], description: 'Enter fullscreen' },
        { keys: ['P'], description: 'Present mode' },
        { keys: ['←', '→'], description: 'Navigate slides' },
        { keys: ['Ctrl', 'E'], description: 'Export presentation' },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Share presentation' },
      ],
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Keyboard shortcuts (?)"
      >
        <span className="text-xl">⌨️</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                <p className="text-gray-600 mt-1">Work faster with these shortcuts</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {shortcutGroups.map((group) => (
                  <div key={group.category}>
                    <h3 className="font-semibold text-lg mb-4 text-purple-600">
                      {group.category}
                    </h3>
                    <div className="space-y-3">
                      {group.shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <span key={keyIndex}>
                                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="mx-1 text-gray-400">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Tip */}
              <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-semibold mb-1">Pro Tip</h4>
                    <p className="text-sm text-gray-700">
                      Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">?</kbd>{' '}
                      anytime to open this shortcuts menu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

