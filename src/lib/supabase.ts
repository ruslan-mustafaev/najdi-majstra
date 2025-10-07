// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

console.log('📦 SUPABASE: Module loading...');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔑 SUPABASE: Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  urlValid: supabaseUrl === 'https://budlyqnloyiyexsocpbb.supabase.co'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-budlyqnloyiyexsocpbb-auth-token'
  }
})

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('masters').select('id').limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Connection check exception:', error);
    return false;
  }
};

// Helper функции для аутентификации
export const signUp = async (email: string, password: string, userData?: any) => {
  const redirectTo = window.location.origin;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: redirectTo
    }
  })
  
  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  // Don't throw error - signOut clears local session even if server session is invalid
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Auth helper functions (для совместимости со старым кодом)
export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData?: any) => {
    try {
      const data = await signUp(email, password, userData)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    try {
      const data = await signIn(email, password)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      await signOut()
      return { error: null }
    } catch (error) {
      // Always return success for logout to ensure graceful client-side cleanup
      return { error: null }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const user = await getCurrentUser()
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}