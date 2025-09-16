// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://budlyqnloyiyexsocpbb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZGx5cW5sb3lpeWV4c29jcGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzM0NDksImV4cCI6MjA3MTUwOTQ0OX0.5vPCIu5yvtEossIEYfMGqha5Xj1eEwEDmvU-g-rUttw'

// Определяем базовый URL в зависимости от окружения
const getBaseUrl = () => {
  // В production (Netlify)
  if (window.location.hostname !== 'localhost') {
    return window.location.origin
  }
  
  // В разработке
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL
  }
  
  return 'http://localhost:3000'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: getBaseUrl(),
    autoRefreshToken: true,
    persistSession: true
  }
})

// Helper функции для аутентификации
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: getBaseUrl()
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
  if (error) throw error
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
      return { error }
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