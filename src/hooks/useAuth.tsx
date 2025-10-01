import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Функция проверки, удален ли профиль мастера
  const checkIfProfileDeleted = async (userId: string): Promise<boolean> => {
    try {
      const { data: master, error } = await supabase
        .from('masters')
        .select('is_deleted, deleted_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking master profile:', error);
        return false;
      }
      
      // Если профиль помечен как удаленный
      if (master && (master.is_deleted === true || master.deleted_at !== null)) {
        console.log('Profile is marked as deleted');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in checkIfProfileDeleted:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          // Только логируем ошибку, не очищаем сессию автоматически
          console.warn('Session error, but keeping existing session:', error.message);
        } else if (session?.user) {
          console.log('Session restored for user:', session.user.email);
          
          // Проверяем валидность сессии
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            console.log('🕐 Session expired, refreshing...');
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Failed to refresh session:', refreshError);
              console.warn('Session refresh failed, but keeping session');
            }
          }
          
          setSession(session);
          setUser(session.user);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Session error:', error);
        // Только логируем критические ошибки, не выходим автоматически
        console.warn('Critical session error, but preserving user session');
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in successfully');
        const isDeleted = await checkIfProfileDeleted(session.user.id);

        if (isDeleted) {
          console.log('Profile is deleted, preventing login...');
          await supabase.auth.signOut();
          alert('Váš profil bol zmazaný. Nemôžete sa prihlásiť.');
        } else {
          // Очищаем только кеш мастеров, не трогаем auth данные
          console.log('🧹 Clearing masters cache on login...');
          localStorage.removeItem('masters_cache');
          localStorage.removeItem('masters_cache_timestamp');
          setSession(session);
          setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Очищаем только при явном выходе
        console.log('🧹 Clearing cache on explicit sign out...');
        Object.keys(localStorage).forEach(key => {
          if (key.includes('cache') || key.includes('recently-viewed')) {
            localStorage.removeItem(key);
          }
        });
        setSession(null);
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed for user:', session.user?.email);
        setSession(session);
        setUser(session.user);
      } else if (event === 'USER_UPDATED' && session) {
        console.log('User updated:', session.user?.email);
        setSession(session);
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true);
    const result = await auth.signUp(email, password, userData);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Сначала пытаемся войти
      const result = await auth.signIn(email, password);
      
      if (result.data?.user) {
        // Проверяем, не удален ли профиль
        const isDeleted = await checkIfProfileDeleted(result.data.user.id);
        
        if (isDeleted) {
          // Если профиль удален, выходим и возвращаем ошибку
          await supabase.auth.signOut();
          setLoading(false);
          return {
            data: null,
            error: { 
              message: 'Váš profil bol zmazaný. Vytvorte si nový účet.' 
            }
          };
        }
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    const result = await auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};