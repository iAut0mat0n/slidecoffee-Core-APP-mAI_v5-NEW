import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, type User, getCurrentUser } from '../lib/supabase'

type AuthContextType = {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  isOnboarded: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnboarded, setIsOnboarded] = useState(false)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        loadUser()
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        loadUser()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUser = async () => {
    try {
      let userData = await getCurrentUser()
      
      // If user record doesn't exist but we have a Supabase auth session,
      // create the user record (this handles the missing database trigger)
      if (!userData) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          console.log('📝 Creating missing user record for:', authUser.email)
          
          // Create the user record
          const { data: newUser, error } = await supabase
            .from('v2_users')
            .insert({
              id: authUser.id,
              email: authUser.email!,
              name: authUser.user_metadata?.name || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (error) {
            console.error('Failed to create user record:', error)
            // If it's a duplicate key error, try to fetch the user again
            if (error.code === '23505') {
              userData = await getCurrentUser()
            }
          } else {
            userData = newUser
            console.log('✅ User record created successfully')
          }
        }
      }
      
      setUser(userData)
      
      // Check if user has completed onboarding by checking for workspaces
      if (userData) {
        const { data: workspaces, error } = await supabase
          .from('v2_workspaces')
          .select('id')
          .eq('owner_id', userData.id)
          .limit(1)
        
        if (error) {
          console.error('Failed to check onboarding status:', error)
          // Default to not onboarded on error (safer)
          setIsOnboarded(false)
        } else {
          const hasWorkspace = !!workspaces && workspaces.length > 0
          setIsOnboarded(hasWorkspace)
          
          // Cache onboarding status
          if (hasWorkspace) {
            localStorage.setItem(`onboarded_${userData.id}`, 'true')
          }
        }
      } else {
        setIsOnboarded(false)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setUser(null)
      setIsOnboarded(false)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/verify-email`;
    console.log('🔐 Signing up with redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        }
      }
    })
    
    console.log('📧 Signup response:', { 
      user: data.user?.email, 
      session: !!data.session,
      error: error?.message 
    });
    
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      isOnboarded,
      signIn,
      signUp,
      signOut,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

