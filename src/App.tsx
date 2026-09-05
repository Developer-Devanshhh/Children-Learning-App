/**
 * App.tsx — root router / shell
 *
 * Phase 2 four-screen state machine:
 *   'auth'       → AuthScreen         (parent signs in)
 *   'pick-child' → ChildSelector      (select / create child profile)
 *   'home'       → LetterSelector     (A–Z / 0–9 tabs)
 *   'practise'   → PractiseScreen     (tracing session)
 *
 * On load:
 *   no Supabase URL          → skip auth+child → 'home'  (offline/dev mode)
 *   session == null          → 'auth'
 *   session && child == null → 'pick-child'
 *   session && child         → 'home'
 */

import { useEffect } from 'react';
import { useState, useCallback } from 'react';
import { GRAPHEMES, getGrapheme } from '@/data/letter-corpus/graphemes';
import { LetterSelector } from '@/modules/05-session-orchestrator/LetterSelector';
import { PractiseScreen } from '@/modules/05-session-orchestrator/PractiseScreen';
import { AuthScreen } from '@/modules/06-auth/AuthScreen';
import { ChildSelector } from '@/modules/07-child-profiles/ChildSelector';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChildStore } from '@/stores/useChildStore';
import { registerOutboxSyncListener } from '@/lib/offlineOutbox';

type Screen = 'loading' | 'auth' | 'pick-child' | 'home' | 'practise';

const HAS_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL);

export default function App() {
  const { session, loading: authLoading, initialize } = useAuthStore();
  const { selectedChild } = useChildStore();

  const [screen, setScreen]       = useState<Screen>('loading');
  const [selectedId, setSelectedId] = useState<string>('A');

  // ── Boot ─────────────────────────────────────────────────────────────
  useEffect(() => {
    void initialize();
    // Register offline outbox flush on reconnect
    const unregister = registerOutboxSyncListener();
    return unregister;
  }, [initialize]);

  // ── Routing ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return; // wait for Supabase session restore

    if (!HAS_SUPABASE) {
      // Dev / offline mode — skip auth entirely
      if (screen === 'loading') setScreen('home');
      return;
    }

    if (!session) {
      setScreen('auth');
    } else if (!selectedChild) {
      setScreen('pick-child');
    } else if (screen === 'loading' || screen === 'auth') {
      setScreen('home');
    }
  }, [authLoading, session, selectedChild, screen]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAuthenticated = useCallback(() => {
    setScreen('pick-child');
  }, []);

  const handleChildSelected = useCallback(() => {
    setScreen('home');
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setScreen('practise');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('home');
  }, []);

  const handleNext = useCallback(() => {
    const currentIdx = GRAPHEMES.findIndex((g) => g.id === selectedId);
    const nextIdx = (currentIdx + 1) % GRAPHEMES.length;
    setSelectedId(GRAPHEMES[nextIdx].id);
    setScreen('practise');
  }, [selectedId]);

  const grapheme = getGrapheme(selectedId)!;

  // ── Render ────────────────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--color-cloud)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-sky)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-dvh w-full" style={{ background: 'var(--color-cloud)' }}>
      {/* Decorative top stripe */}
      <div
        className="w-full h-2 flex-shrink-0"
        style={{ background: 'linear-gradient(90deg, var(--color-sky), var(--color-lavender), var(--color-sun), var(--color-grass))' }}
      />

      {screen === 'auth' && (
        <AuthScreen onAuthenticated={handleAuthenticated} />
      )}

      {screen === 'pick-child' && (
        <ChildSelector onChildSelected={handleChildSelected} />
      )}

      {screen === 'home' && (
        <LetterSelector
          onSelect={handleSelect}
          onSwitchProfile={() => setScreen('pick-child')}
        />
      )}

      {screen === 'practise' && (
        <PractiseScreen
          key={selectedId}
          grapheme={grapheme}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}
    </main>
  );
}
