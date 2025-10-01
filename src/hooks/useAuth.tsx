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
          // Очищаем поврежденную сессию
          await supabase.auth.signOut();
        } else if (session?.user) {
          // Просто восстанавливаем сессию без проверок
          // Проверка удаления будет только при явном входе
          console.log('Session restored for user:', session.user.email);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Session error:', error);
        // При критической ошибке очищаем все
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      // Обрабатываем только события SIGNED_IN и SIGNED_OUT
      // Игнорируем INITIAL_SESSION чтобы избежать дублирования с getInitialSession
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        // Проверяем профиль только при явном входе
        const isDeleted = await checkIfProfileDeleted(session.user.id);

        if (isDeleted) {
          console.log('Profile is deleted, preventing login...');
          await supabase.auth.signOut();
          alert('Váš profil bol zmazaný. Nemôžete sa prihlásiť.');
        } else {
          setSession(session);
          setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setSession(null);
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // При обновлении токена просто обновляем сессию без дополнительных проверок
        console.log('Token refreshed for user:', session.user?.email);
        setSession(session);
        setUser(session.user);
      }
    }));

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