"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/utils/supabaseClientBrowser";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  connectionError: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  connectionError: null,
  signIn: async () => { throw new Error("AuthProvider not mounted"); },
  signUp: async () => { throw new Error("AuthProvider not mounted"); },
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;

    const showConnectionError = (message: string) => {
      setConnectionError(message);
      toast.error("Não foi possível conectar ao servidor. Verifique sua conexão.", {
        duration: Infinity,
        id: "supabase-connection-error",
      });
      setLoading(false);
    };

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        showConnectionError("Tempo limite de conexão excedido.");
      }
    }, 8000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);

      if (error) {
        showConnectionError(error.message);
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);

      const message = err instanceof Error ? err.message : "Erro desconhecido";
      showConnectionError(message);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, connectionError, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
