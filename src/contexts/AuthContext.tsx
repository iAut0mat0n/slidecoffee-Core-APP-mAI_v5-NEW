import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, type User, getCurrentUser } from '../lib/supabase'

type AuthContextType = {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  isOnboarded: boolean
  refreshUser: () => Promise<void>
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
    console.log('🔄 loadUser() called')
    try {
      console.log('1️⃣ Fetching user from database...')
      let userData = await getCurrentUser()
      console.log('1️⃣ getCurrentUser() result:', userData ? `User found: ${userData.email}` : 'No user found')
      
      // If user record doesn't exist but we have a Supabase auth session,
      // create the user record via backend endpoint (uses service role to bypass RLS)
      if (!userData) {
        console.log('2️⃣ No user record found, checking for auth session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('2️⃣ Session status:', session ? `Session exists for ${session.user?.email}` : 'No session')
        
        if (session?.access_token) {
          console.log('3️⃣ Creating missing user record via backend...')
          
          try {
            const createUserUrl = '/api/auth/create-user'
            console.log('3️⃣ Calling create-user endpoint...')
            
            const response = await fetch(createUserUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
            
            console.log('3️⃣ Response status:', response.status, response.statusText)
            
            if (response.ok) {
              const result = await response.json()
              console.log('✅ User record created successfully:', result)
              // Fetch the newly created user
              console.log('4️⃣ Re-fetching user from database...')
              userData = await getCurrentUser()
              console.log('4️⃣ User after creation:', userData ? `Found: ${userData.email}` : 'Still not found')
            } else {
              const errorText = await response.text()
              console.error('❌ Failed to create user record:', response.status, errorText)
            }
          } catch (fetchError) {
            console.error('❌ Error calling create-user endpoint:', fetchError)
          }
        } else {
          console.log('⚠️ No session token available, cannot create user')
        }
      } else {
        console.log('✅ User already exists, skipping creation')
      }
      
      setUser(userData)
      
      // Check if user has completed onboarding by checking for default workspace
      if (userData) {
        const hasWorkspace = !!userData.default_workspace_id
        setIsOnboarded(hasWorkspace)
        
        // Cache onboarding status
        if (hasWorkspace) {
          localStorage.setItem(`onboarded_${userData.id}`, 'true')
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
      refreshUser: loadUser,
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

