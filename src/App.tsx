/**
 * App.tsx — root router / shell
 *
 * Phase 1 state machine (no router library needed yet):
 *   'home'     → LetterSelector
 *   'practise' → PractiseScreen
 *
 * Handles letter cycling (Next → advance through corpus order).
 */

import { useState, useCallback } from 'react';
import { GRAPHEMES, getGrapheme } from '@/data/letter-corpus/graphemes';
import { LetterSelector } from '@/modules/05-session-orchestrator/LetterSelector';
import { PractiseScreen } from '@/modules/05-session-orchestrator/PractiseScreen';

type Screen = 'home' | 'practise';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedId, setSelectedId] = useState<string>('A');

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setScreen('practise');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('home');
  }, []);

  const handleNext = useCallback(() => {
    const currentIdx = GRAPHEMES.findIndex(g => g.id === selectedId);
    const nextIdx = (currentIdx + 1) % GRAPHEMES.length;
    setSelectedId(GRAPHEMES[nextIdx].id);
    // Stay on practise screen — PractiseScreen will re-render with the new grapheme
    setScreen('practise');
  }, [selectedId]);

  const grapheme = getGrapheme(selectedId)!;

  return (
    <main className="flex flex-col items-center min-h-dvh w-full" style={{ background: 'var(--color-cloud)' }}>
      {/* Decorative top bar */}
      <div
        className="w-full h-2 flex-shrink-0"
        style={{ background: `linear-gradient(90deg, var(--color-sky), var(--color-lavender), var(--color-sun), var(--color-grass))` }}
      />

      {screen === 'home' && (
        <LetterSelector onSelect={handleSelect} />
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
