/**
 * useAuthStore — Zustand store for Supabase Auth state
 *
 * Tracks: session, user, loading, error
 * Actions: initialize, signIn, signUp, signOut
 *
 * Call `useAuthStore.getState().initialize()` once at app boot.
 * Supabase's onAuthStateChange keeps it live after that.
 */

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    // No Supabase client → offline mode, skip silently
    if (!supabase) {
      set({ loading: false });
      return;
    }

    // Restore existing session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    // Keep in sync with Supabase auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    if (!supabase) { set({ error: 'No Supabase connection. Check your .env.local.' }); return false; }
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ loading: false, error: error.message }); return false; }
    set({ loading: false });
    return true;
  },

  signUp: async (email, password) => {
    if (!supabase) { set({ error: 'No Supabase connection. Check your .env.local.' }); return false; }
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { set({ loading: false, error: error.message }); return false; }
    set({ loading: false });
    return true;
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  clearError: () => set({ error: null }),
}));
