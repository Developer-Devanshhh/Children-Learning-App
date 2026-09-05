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

type PersistedChild = { selectedChild: DbChild | null };

export const useChildStore = create(
  persist<ChildState, [], [], PersistedChild>(
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
        const list = (data ?? []) as DbChild[];
        set({ children: list, loading: false });

        // Re-validate selectedChild if it came from persisted storage
        const current = get().selectedChild;
        if (current && !list.find((c) => c.id === current.id)) {
          set({ selectedChild: null });
        }
      },

      selectChild: (child) => set({ selectedChild: child }),
      clearChild: () => set({ selectedChild: null }),

      addChild: async (parentId, name, ageBand) => {
        if (!supabase) return null;
        set({ loading: true, error: null });

        type ChildInsert = { parent_id: string; name: string; age_band: DbChild['age_band']; avatar_seed: string };
        const insertPayload: ChildInsert = {
          parent_id: parentId,
          name: name.trim(),
          age_band: ageBand,
          avatar_seed: 'lyra',
        };

        const { data, error } = await (supabase
          .from('children') as any)
          .insert(insertPayload)
          .select()
          .single();

        if (error) { set({ loading: false, error: (error as { message: string }).message }); return null; }
        const child = data as DbChild;
        set((s) => ({ children: [...s.children, child], loading: false }));
        return child;
      },
    }),
    {
      name: 'lyralearn-child',
      partialize: (state) => ({ selectedChild: state.selectedChild }),
    },
  ),
);
