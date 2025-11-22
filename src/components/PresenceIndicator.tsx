import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users } from 'lucide-react'

interface PresenceUser {
  userId: string
  userName: string
  userAvatar?: string
  onlineAt: string
}

interface PresenceIndicatorProps {
  projectId: string
  currentUserId: string
  currentUserName?: string
  currentUserAvatar?: string | null
}

export function PresenceIndicator({ projectId, currentUserId, currentUserName, currentUserAvatar }: PresenceIndicatorProps) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!projectId || !currentUserId) return

    // Create a unique channel for this project
    const projectChannel = supabase.channel(`project:${projectId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    projectChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = projectChannel.presenceState()
        const users: PresenceUser[] = []

        Object.keys(presenceState).forEach((key) => {
          const presences = presenceState[key]
          if (presences && presences.length > 0) {
            const presence = presences[0] as any
            users.push({
              userId: key,
              userName: presence.userName || 'Anonymous',
              userAvatar: presence.userAvatar,
              onlineAt: presence.onlineAt,
            })
          }
        })

        setActiveUsers(users.filter((u) => u.userId !== currentUserId))
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence with real user data
          await projectChannel.track({
            userId: currentUserId,
            userName: currentUserName || 'Anonymous',
            userAvatar: currentUserAvatar,
            onlineAt: new Date().toISOString(),
          })
        }
      })

    return () => {
      if (projectChannel) {
        projectChannel.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, currentUserId])

  if (activeUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
      <Users className="w-4 h-4 text-green-600" />
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((user) => (
          <div
            key={user.userId}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
            title={user.userName}
          >
            {user.userAvatar ? (
              <img
                src={user.userAvatar}
                alt={user.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.userName.charAt(0).toUpperCase()
            )}
          </div>
        ))}
      </div>
      <span className="text-sm text-green-700 font-medium">
        {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} viewing
      </span>
    </div>
  )
}
