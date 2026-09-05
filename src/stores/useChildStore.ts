/**
 * useChildStore — Zustand store for child profile management
 *
 * State: children[], selectedChild, loading, error
 * Actions: loadChildren, selectChild, addChild, clearChild
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type DbChild } from '@/lib/supabase';

interface ChildState {
  children: DbChild[];
  selectedChild: DbChild | null;
  loading: boolean;
  error: string | null;

  loadChildren: (parentId: string) => Promise<void>;
  selectChild: (child: DbChild) => void;
  clearChild: () => void;
  addChild: (parentId: string, name: string, ageBand: DbChild['age_band']) => Promise<DbChild | null>;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChild: null,
      loading: false,
      error: null,

      loadChildren: async (parentId: string) => {
        if (!supabase) return;
        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', parentId)
          .order('created_at', { ascending: true });

        if (error) { set({ loading: false, error: error.message }); return; }
        set({ children: (data ?? []) as DbChild[], loading: false });

        // Re-validate selectedChild if it came from persisted storage
        const current = get().selectedChild;
        if (current && !(data ?? []).find((c) => c.id === current.id)) {
          set({ selectedChild: null });
        }
      },

      selectChild: (child) => set({ selectedChild: child }),
      clearChild: ()  => set({ selectedChild: null }),

      addChild: async (parentId, name, ageBand) => {
        if (!supabase) return null;
        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from('children')
          .insert({ parent_id: parentId, name: name.trim(), age_band: ageBand, avatar_seed: 'lyra' })
          .select()
          .single();

        if (error) { set({ loading: false, error: error.message }); return null; }
        const child = data as DbChild;
        set((s: ChildState) => ({ children: [...s.children, child], loading: false }));
        return child;
      },
    }),
    {
      name: 'lyralearn-child',
      // Only persist the selected child (avoid stale list)
      partialize: (state) => ({ selectedChild: state.selectedChild }) as any,
    }
  )
);
