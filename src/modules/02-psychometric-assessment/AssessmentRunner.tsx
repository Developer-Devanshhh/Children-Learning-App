/**
 * AssessmentRunner.tsx — Master Orchestrator for Psychometric Assessment Stages
 *
 * Coordinates:
 *   - Current stage mounting (Stages 01–04 in Phase 3, subsequent stages in Phases 4-5)
 *   - Inter-island celebration cheer cards
 *   - Exit confirmation safeguards
 *   - Assessment store stage advancement
 */

import { useState } from 'react';
import { Sparkles, ArrowRight, Home } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import { useAssessmentStore } from '@/stores/useAssessmentStore';
import { Stage01LetterKnowledge } from './stages/Stage01LetterKnowledge';
import { Stage02PhonologicalAwareness } from './stages/Stage02PhonologicalAwareness';
import { Stage03PhonologicalDecoding } from './stages/Stage03PhonologicalDecoding';
import { Stage04WordRecognition } from './stages/Stage04WordRecognition';
import type { DbChild } from '@/lib/supabase';

interface AssessmentRunnerProps {
  child: DbChild;
  onFinishAssessment: () => void;
  onExitToHome: () => void;
}

const STAGE_NAMES = [
  'Island 1: Letter Forest 🌳',
  'Island 2: Sound River 🌊',
  'Island 3: Alien Word Cave 👾',
  'Island 4: Word Safari 🦁',
  'Island 5: Fluency Falls 🏄',
  'Picnic Rest Break 🥪',
  'Island 6: Story Castle 🏰',
  'Island 7: Spell Forge ⚒️',
  'Island 8: Speed Mountain ⚡',
  'Island 9: Memory Grove 🧠',
  'Island 10: Star Focus 🔭',
];

export function AssessmentRunner({
  child,
  onFinishAssessment,
  onExitToHome,
}: AssessmentRunnerProps) {
  const { currentStageIndex, advanceStage } = useAssessmentStore();
  const [showStageCheer, setShowStageCheer] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleStageCompleted = () => {
    audioEngine.playSuccess();
    setShowStageCheer(true);
  };

  const handleContinueNextStage = () => {
    setShowStageCheer(false);
    advanceStage();
  };

  // ── Inter-Stage Cheer Screen ──────────────────────────────────────────
  if (showStageCheer) {
    const completedStageName = STAGE_NAMES[currentStageIndex] ?? `Island ${currentStageIndex + 1}`;
    const nextStageName = STAGE_NAMES[currentStageIndex + 1] ?? 'Next Island';
    const isPhase3Cap = currentStageIndex >= 3; // Cap after Stage 04 in Phase 3

    return (
      <div className="flex flex-col items-center justify-center min-h-[85dvh] max-w-md mx-auto p-6 text-center gap-6 animate-scale-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center shadow-lg">
            <Lyra size={72} />
          </div>
          <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full">
            Island Quest Complete! 🌟
          </span>
          <h2 className="text-2xl font-black text-slate-800 pt-1">
            Super Explorer, {child.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            You completed <strong>{completedStageName}</strong>!
          </p>
        </div>

        {isPhase3Cap ? (
          <div className="space-y-4 w-full pt-2">
            <div className="p-4 rounded-3xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed font-medium">
              🎉 <strong>Phases 3 Milestones (Stages 01–04) Completed & Logged!</strong><br />
              Stages 05–10 and the scoring engine will unlock in the upcoming phases.
            </div>
            <button
              onClick={onFinishAssessment}
              className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-grass, #22c55e), var(--color-sky, #38bdf8))',
              }}
            >
              <span>Finish Assessment Checkpoint</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleContinueNextStage}
            className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-sky, #38bdf8), var(--color-lavender, #c084fc))',
            }}
          >
            <span>Sail to {nextStageName}</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    );
  }

  // ── Render Active Stage ────────────────────────────────────────────────
  return (
    <div className="w-full relative">
      {/* Top Exit button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-2 rounded-xl bg-white/80 backdrop-blur border border-slate-200 text-slate-400 hover:text-slate-700 transition active:scale-95 cursor-pointer shadow-sm"
          aria-label="Exit adventure to home"
        >
          <Home size={16} />
        </button>
      </div>

      {/* Exit Safeguard Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center animate-scale-in">
            <h3 className="text-lg font-black text-slate-800">
              Pause Reading Adventure?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your completed islands are safely saved in your local outbox. You can resume anytime!
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer"
              >
                Keep Playing
              </button>
              <button
                onClick={onExitToHome}
                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-red-500 text-white hover:bg-red-600 active:scale-95 cursor-pointer shadow-md"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStageIndex === 0 && (
        <Stage01LetterKnowledge onStageComplete={handleStageCompleted} />
      )}

      {currentStageIndex === 1 && (
        <Stage02PhonologicalAwareness onStageComplete={handleStageCompleted} />
      )}

      {currentStageIndex === 2 && (
        <Stage03PhonologicalDecoding onStageComplete={handleStageCompleted} />
      )}

      {currentStageIndex === 3 && (
        <Stage04WordRecognition onStageComplete={handleStageCompleted} />
      )}

      {currentStageIndex > 3 && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center gap-4 animate-fade-in">
          <h3 className="text-xl font-black text-slate-800">
            Stages 01–04 Completed! 🌟
          </h3>
          <button
            onClick={onFinishAssessment}
            className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            Return to Learning Hub
          </button>
        </div>
      )}
    </div>
  );
}
