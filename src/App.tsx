/**
 * App.tsx — root router / shell
 *
 * Screen state machine:
 *   'auth'                → AuthScreen              (parent signs in)
 *   'pick-child'          → ChildSelector           (select / create child profile)
 *   'home'                → LetterSelector          (A–Z / 0–9 tabs + Assessment launcher)
 *   'practise'            → PractiseScreen          (tracing session)
 *   'consent'             → AssessmentConsent       (parental consent & screening disclaimer)
 *   'assessment-intro'    → AssessmentIntro         (adventure mission briefing & audio check)
 *   'assessment-practice' → AssessmentPractice      (warm-up tutorial for tap, listen, drag)
 *   'assessment'          → Active Assessment Stage (Phases 3-5)
 *
 * On load:
 *   no Supabase URL          → skip auth+child → 'home'  (offline/dev mode)
 *   session == null          → 'auth'
 *   session && child == null → 'pick-child'
 *   session && child         → 'home'
 */

import { useEffect, useState, useCallback } from 'react';
import { GRAPHEMES, getGrapheme } from '@/data/letter-corpus/graphemes';
import { LetterSelector } from '@/modules/05-session-orchestrator/LetterSelector';
import { PractiseScreen } from '@/modules/05-session-orchestrator/PractiseScreen';
import { AuthScreen } from '@/modules/06-auth/AuthScreen';
import { ChildSelector } from '@/modules/07-child-profiles/ChildSelector';
import { AssessmentConsent } from '@/modules/02-psychometric-assessment/AssessmentConsent';
import { AssessmentIntro } from '@/modules/02-psychometric-assessment/AssessmentIntro';
import { AssessmentPractice } from '@/modules/02-psychometric-assessment/AssessmentPractice';
import { AssessmentRunner } from '@/modules/02-psychometric-assessment/AssessmentRunner';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChildStore } from '@/stores/useChildStore';
import { useAssessmentStore } from '@/stores/useAssessmentStore';
import { registerOutboxSyncListener } from '@/lib/offlineOutbox';
import type { DbChild } from '@/lib/supabase';

type Screen =
  | 'loading'
  | 'auth'
  | 'pick-child'
  | 'home'
  | 'practise'
  | 'consent'
  | 'assessment-intro'
  | 'assessment-practice'
  | 'assessment';

const HAS_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL);

// Fallback guest explorer profile for offline / demo mode
const GUEST_CHILD: DbChild = {
  id: 'guest-explorer-001',
  parent_id: 'guest-parent',
  name: 'Explorer',
  age_band: '6-7',
  avatar_seed: 'explorer-1',
  created_at: new Date().toISOString(),
};

export default function App() {
  const { session, loading: authLoading, initialize } = useAuthStore();
  const { selectedChild } = useChildStore();
  const { startAssessment, reset: resetAssessment } = useAssessmentStore();

  const [screen, setScreen] = useState<Screen>('loading');
  const [selectedId, setSelectedId] = useState<string>('A');
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  const activeChild = selectedChild ?? GUEST_CHILD;

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

  // ── Assessment Flow Handlers ──────────────────────────────────────────
  const handleLaunchAssessment = useCallback(() => {
    if (!hasConsented) {
      setScreen('consent');
    } else {
      setScreen('assessment-intro');
    }
  }, [hasConsented]);

  const handleConsentGranted = useCallback(() => {
    setHasConsented(true);
    setScreen('assessment-intro');
  }, []);

  const handleStartPractice = useCallback(async () => {
    await startAssessment(activeChild);
    setScreen('assessment-practice');
  }, [startAssessment, activeChild]);

  const handleCompletePractice = useCallback(() => {
    setScreen('assessment');
  }, []);

  const handleExitAssessment = useCallback(() => {
    resetAssessment();
    setScreen('home');
  }, [resetAssessment]);

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
          child={activeChild}
          onSelect={handleSelect}
          onSwitchProfile={() => setScreen('pick-child')}
          onLaunchAssessment={handleLaunchAssessment}
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

      {screen === 'consent' && (
        <AssessmentConsent
          child={activeChild}
          onConsentGranted={handleConsentGranted}
          onBack={handleExitAssessment}
        />
      )}

      {screen === 'assessment-intro' && (
        <AssessmentIntro
          child={activeChild}
          onStartPractice={handleStartPractice}
          onBack={() => setScreen(hasConsented ? 'home' : 'consent')}
        />
      )}

      {screen === 'assessment-practice' && (
        <AssessmentPractice
          child={activeChild}
          onCompletePractice={handleCompletePractice}
          onBack={() => setScreen('assessment-intro')}
        />
      )}

      {screen === 'assessment' && (
        <AssessmentRunner
          child={activeChild}
          onFinishAssessment={handleExitAssessment}
          onExitToHome={handleExitAssessment}
        />
      )}
    </main>
  );
}
