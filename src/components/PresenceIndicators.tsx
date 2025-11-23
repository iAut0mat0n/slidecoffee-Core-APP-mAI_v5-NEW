import { useState, useEffect, useCallback } from 'react';
import { Users, Circle } from 'lucide-react';
import { commentsAPI, type Presence } from '../lib/api-comments';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface PresenceIndicatorsProps {
  presentationId: string;
  currentSlideIndex: number;
  currentActivity: 'viewing' | 'editing' | 'commenting' | 'idle';
}

export default function PresenceIndicators({
  presentationId,
  currentSlideIndex,
  currentActivity
}: PresenceIndicatorsProps) {
  const [activeUsers, setActiveUsers] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);

  // Load active collaborators
  const loadPresence = useCallback(async () => {
    try {
      const users = await commentsAPI.getActiveCollaborators(presentationId);
      setActiveUsers(users);
      setLoading(false);
    } catch (err) {
      console.error('Error loading presence:', err);
      setLoading(false);
    }
  }, [presentationId]);

  // Update own presence (heartbeat)
  const updateOwnPresence = useCallback(async () => {
    try {
      await commentsAPI.updatePresence(presentationId, {
        activityType: currentActivity,
        currentSlideIndex
      });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [presentationId, currentActivity, currentSlideIndex]);

  useEffect(() => {
    loadPresence();

    // 🔥 REALTIME: Subscribe to presence changes via Supabase
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, realtime presence disabled');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const channel = supabase
      .channel(`presence:${presentationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'v2_presence',
          filter: `presentation_id=eq.${presentationId}`
        },
        (payload) => {
          console.log('👥 Realtime presence update:', payload);
          loadPresence();
        }
      )
      .subscribe();

    // Send heartbeat every 10 seconds
    const heartbeat = setInterval(() => {
      updateOwnPresence();
    }, 10000);

    // Send initial presence
    updateOwnPresence();

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [presentationId, loadPresence, updateOwnPresence]);

  // Update presence when activity or slide changes
  useEffect(() => {
    updateOwnPresence();
  }, [currentActivity, currentSlideIndex, updateOwnPresence]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'editing':
        return 'bg-purple-500 ring-purple-200';
      case 'commenting':
        return 'bg-green-500 ring-green-200';
      case 'viewing':
        return 'bg-blue-500 ring-blue-200';
      case 'idle':
        return 'bg-gray-400 ring-gray-200';
      default:
        return 'bg-gray-400 ring-gray-200';
    }
  };

  const getActivityLabel = (activity: string) => {
    switch (activity) {
      case 'editing':
        return 'Editing';
      case 'commenting':
        return 'Commenting';
      case 'viewing':
        return 'Viewing';
      case 'idle':
        return 'Idle';
      default:
        return 'Active';
    }
  };

  if (loading && activeUsers.length === 0) {
    return null;
  }

  // Filter out current user and show only other users
  const otherUsers = activeUsers.filter(user => {
    // Try to get current user ID from localStorage
    const session = localStorage.getItem('sb-supabase-auth-token');
    if (!session) return true;
    
    try {
      const parsed = JSON.parse(session);
      return user.user_id !== parsed.user?.id;
    } catch {
      return true;
    }
  });

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Avatars */}
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(user.activity_type)} ring-2 bg-white text-white text-xs font-medium`}
            title={`${user.user_name} - ${getActivityLabel(user.activity_type)}${user.current_slide_index !== null && user.current_slide_index !== undefined ? ` on slide ${user.current_slide_index + 1}` : ''}`}
          >
            {getInitials(user.user_name)}
            {/* Activity Indicator Dot */}
            <Circle
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-current ${
                user.activity_type === 'editing' ? 'text-purple-500' :
                user.activity_type === 'commenting' ? 'text-green-500' :
                user.activity_type === 'viewing' ? 'text-blue-500' :
                'text-gray-400'
              }`}
            />
          </div>
        ))}
        {otherUsers.length > 5 && (
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white text-gray-600 text-xs font-medium">
            +{otherUsers.length - 5}
          </div>
        )}
      </div>

      {/* Collaborators Tooltip/Dropdown */}
      <div className="relative group">
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Users className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* Dropdown */}
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-3 border-b border-gray-200">
            <h4 className="font-semibold text-sm">Active Collaborators ({otherUsers.length})</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {otherUsers.map((user) => (
              <div key={user.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${getActivityColor(user.activity_type)} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                    {getInitials(user.user_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.user_name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Circle className={`w-1.5 h-1.5 fill-current ${
                        user.activity_type === 'editing' ? 'text-purple-500' :
                        user.activity_type === 'commenting' ? 'text-green-500' :
                        user.activity_type === 'viewing' ? 'text-blue-500' :
                        'text-gray-400'
                      }`} />
                      <span>{getActivityLabel(user.activity_type)}</span>
                      {user.current_slide_index !== null && user.current_slide_index !== undefined && (
                        <>
                          <span>•</span>
                          <span>Slide {user.current_slide_index + 1}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
