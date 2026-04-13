import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'student' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isStudent: boolean;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const checkRole = async (userId: string) => {
    const { data: isAdminData } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (isAdminData) {
      setRole('admin');
      return;
    }
    const { data: isStudentData } = await supabase.rpc('has_role', { _user_id: userId, _role: 'student' });
    if (isStudentData) {
      setRole('student');
      return;
    }
    setRole(null);
  };

  const applySession = async (session: Session | null) => {
    try {
      if (session?.user) {
        await checkRole(session.user.id);
      } else {
        setRole(null);
      }
    } catch {
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Never await Supabase RPC/queries inside this callback — it can deadlock the auth
      // client and hang all later requests (e.g. admin saves) until refresh. See supabase-js#2013.
      setTimeout(() => {
        void applySession(session);
      }, 0);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      void applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    setRole(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session, user,
      isAdmin: role === 'admin',
      isStudent: role === 'student',
      role, loading,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
