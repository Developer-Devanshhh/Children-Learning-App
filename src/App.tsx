/**
 * App.tsx — ReadQuest root router & shell
 *
 * Screen state machine:
 *   'home'                → AdventureLandingHero        (Vibrant colourful landing page matching mockup)
 *   'consent'             → AssessmentConsent           (Parental consent & screening disclaimer)
 *   'assessment-intro'    → AssessmentIntro             (Adventure mission briefing & audio check with Lyra)
 *   'assessment-practice' → AssessmentPractice          (Interactive warm-up tutorial)
 *   'assessment'          → AssessmentRunner            (10-stage psychometric screening adventure)
 *   'assessment-results'  → AssessmentResultsDashboard  (Scores & Superpowers Trophy Room)
 *   'alphabet-hub'        → LetterSelector              (A–Z / 0–9 Haptic Tracing Hub - unlocked after assessment)
 *   'practise'            → PractiseScreen              (Haptic alphabet tracing canvas)
 *   'pick-child'          → ChildSelector               (Child profile manager)
 *   'auth'                → AuthScreen                  (Parent login/signup)
 */

import { useEffect, useState, useCallback } from 'react';
import { GRAPHEMES, getGrapheme } from '@/data/letter-corpus/graphemes';
import { AdventureLandingHero } from '@/modules/02-psychometric-assessment/AdventureLandingHero';
import { LetterSelector } from '@/modules/05-session-orchestrator/LetterSelector';
import { PractiseScreen } from '@/modules/05-session-orchestrator/PractiseScreen';
import { AuthScreen } from '@/modules/06-auth/AuthScreen';
import { ChildSelector } from '@/modules/07-child-profiles/ChildSelector';
import { AssessmentConsent } from '@/modules/02-psychometric-assessment/AssessmentConsent';
import { AssessmentIntro } from '@/modules/02-psychometric-assessment/AssessmentIntro';
import { AssessmentPractice } from '@/modules/02-psychometric-assessment/AssessmentPractice';
import { AssessmentRunner } from '@/modules/02-psychometric-assessment/AssessmentRunner';
import { AssessmentResultsDashboard } from '@/modules/02-psychometric-assessment/AssessmentResultsDashboard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChildStore } from '@/stores/useChildStore';
import { useAssessmentStore } from '@/stores/useAssessmentStore';
import { registerOutboxSyncListener } from '@/lib/offlineOutbox';
import { scoreAssessmentSession, type MultidimensionalAssessmentResult } from '@/lib/psychometricScorer';
import type { DbChild } from '@/lib/supabase';

type Screen =
  | 'loading'
  | 'auth'
  | 'pick-child'
  | 'home'
  | 'alphabet-hub'
  | 'practise'
  | 'consent'
  | 'assessment-intro'
  | 'assessment-practice'
  | 'assessment'
  | 'assessment-results';

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
  const { startAssessment, finishAssessment, reset: resetAssessment, itemResponses } = useAssessmentStore();

  const [screen, setScreen] = useState<Screen>('loading');
  const [selectedId, setSelectedId] = useState<string>('A');
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [assessmentResults, setAssessmentResults] = useState<MultidimensionalAssessmentResult | null>(null);

  const activeChild = selectedChild ?? GUEST_CHILD;

  // ── Boot ─────────────────────────────────────────────────────────────
  useEffect(() => {
    void initialize();
    const unregister = registerOutboxSyncListener();
    return unregister;
  }, [initialize]);

  // ── Routing ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!HAS_SUPABASE) {
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

  const handleSelectGrapheme = useCallback((id: string) => {
    setSelectedId(id);
    setScreen('practise');
  }, []);

  const handleBackToAlphabetHub = useCallback(() => {
    setScreen('alphabet-hub');
  }, []);

  const handleNextGrapheme = useCallback(() => {
    const currentIdx = GRAPHEMES.findIndex((g) => g.id === selectedId);
    const nextIdx = (currentIdx + 1) % GRAPHEMES.length;
    setSelectedId(GRAPHEMES[nextIdx].id);
    setScreen('practise');
  }, [selectedId]);

  // ── Assessment Flow Handlers ──────────────────────────────────────────
  const handleStartAdventure = useCallback(() => {
    if (!hasConsented) {
      setScreen('consent');
    } else {
      setScreen('assessment-intro');
    }
  }, [hasConsented]);

  const handleTryDemo = useCallback(async () => {
    await startAssessment(activeChild);
    setScreen('assessment-practice');
  }, [startAssessment, activeChild]);

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

  const handleFinishAssessmentCheckpoint = useCallback(async () => {
    const scoredResults = scoreAssessmentSession(itemResponses, activeChild.age_band);
    setAssessmentResults(scoredResults);
    await finishAssessment(activeChild, scoredResults.overallProfileSummary);
    setScreen('assessment-results');
  }, [itemResponses, activeChild, finishAssessment]);

  const handleStartPersonalizedLearning = useCallback((graphemes: string[]) => {
    const focusLetter = graphemes[0]?.toUpperCase() || 'A';
    setSelectedId(focusLetter);
    setScreen('practise');
  }, []);

  const handleOpenAlphabetHub = useCallback(() => {
    setScreen('alphabet-hub');
  }, []);

  const handleExitToHome = useCallback(() => {
    resetAssessment();
    setScreen('home');
  }, [resetAssessment]);

  const grapheme = getGrapheme(selectedId) || getGrapheme('A')!;

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
      {/* Decorative top rainbow stripe */}
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

      {/* ── 1. Front Colorful Landing Page (ReadQuest Hero) ── */}
      {screen === 'home' && (
        <AdventureLandingHero
          child={activeChild}
          onStartAdventure={handleStartAdventure}
          onTryDemo={handleTryDemo}
          onOpenParentTeacher={() => setScreen('pick-child')}
        />
      )}

      {/* ── 2. Parental Consent & Disclaimer Screen ── */}
      {screen === 'consent' && (
        <AssessmentConsent
          child={activeChild}
          onConsentGranted={handleConsentGranted}
          onBack={handleExitToHome}
        />
      )}

      {/* ── 3. Adventure Briefing & Audio Check ── */}
      {screen === 'assessment-intro' && (
        <AssessmentIntro
          child={activeChild}
          onStartPractice={handleStartPractice}
          onBack={() => setScreen(hasConsented ? 'home' : 'consent')}
        />
      )}

      {/* ── 4. Interactive Warm-up Tutorial ── */}
      {screen === 'assessment-practice' && (
        <AssessmentPractice
          child={activeChild}
          onCompletePractice={handleCompletePractice}
          onBack={() => setScreen('assessment-intro')}
        />
      )}

      {/* ── 5. 10-Stage Island Psychometric Screening ── */}
      {screen === 'assessment' && (
        <AssessmentRunner
          child={activeChild}
          onFinishAssessment={handleFinishAssessmentCheckpoint}
          onExitToHome={handleExitToHome}
        />
      )}

      {/* ── 6. Scores & Superpowers Trophy Room ── */}
      {screen === 'assessment-results' && assessmentResults && (
        <AssessmentResultsDashboard
          child={activeChild}
          results={assessmentResults}
          onStartPersonalizedLearning={handleStartPersonalizedLearning}
          onReturnHome={handleOpenAlphabetHub}
        />
      )}

      {/* ── 7. Haptic Alphabet Learning Hub (Unlocked after Assessment) ── */}
      {screen === 'alphabet-hub' && (
        <div className="w-full">
          <div className="max-w-md mx-auto pt-3 px-4 flex justify-between items-center">
            <button
              onClick={handleExitToHome}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer active:scale-95 transition"
            >
              ← Back to Adventure Hub
            </button>
            <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              Alphabet Tracing Studio ✍️
            </span>
          </div>
          <LetterSelector
            child={activeChild}
            onSelect={handleSelectGrapheme}
            onSwitchProfile={() => setScreen('pick-child')}
            onLaunchAssessment={handleStartAdventure}
          />
        </div>
      )}

      {/* ── 8. Active Haptic Canvas Tracing Session ── */}
      {screen === 'practise' && (
        <PractiseScreen
          key={selectedId}
          grapheme={grapheme}
          onBack={handleBackToAlphabetHub}
          onNext={handleNextGrapheme}
        />
      )}
    </main>
  );
}
