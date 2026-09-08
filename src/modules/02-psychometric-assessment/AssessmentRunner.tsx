/**
 * AssessmentRunner.tsx — Master Orchestrator for Psychometric Assessment Stages
 *
 * Coordinates:
 *   - Stages 01–04: Phonological & Reading Foundations
 *   - Stage 05: Reading Fluency
 *   - Midway Break: Rest & Relaxation Screen
 *   - Stages 06–07: Reading Comprehension & Spelling
 *   - Stages 08–10: Cognitive & Executive Functions (RAN, Working Memory, Attention)
 *   - Inter-island celebration cheer cards
 *   - Exit confirmation safeguards
 */

import { useState } from 'react';
import { Sparkles, ArrowRight, Home, Trophy, Award } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import { useAssessmentStore } from '@/stores/useAssessmentStore';
import { Stage01LetterKnowledge } from './stages/Stage01LetterKnowledge';
import { Stage02PhonologicalAwareness } from './stages/Stage02PhonologicalAwareness';
import { Stage03PhonologicalDecoding } from './stages/Stage03PhonologicalDecoding';
import { Stage04WordRecognition } from './stages/Stage04WordRecognition';
import { Stage05ReadingFluency } from './stages/Stage05ReadingFluency';
import { MidwayBreakScreen } from './stages/MidwayBreakScreen';
import { Stage06ReadingComprehension } from './stages/Stage06ReadingComprehension';
import { Stage07Spelling } from './stages/Stage07Spelling';
import { Stage08RapidNaming } from './stages/Stage08RapidNaming';
import { Stage09WorkingMemory } from './stages/Stage09WorkingMemory';
import { Stage10AttentionProcessing } from './stages/Stage10AttentionProcessing';
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
  'Midway Picnic Rest Break 🥪',
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
    const nextStageName = STAGE_NAMES[currentStageIndex + 1] ?? 'Final Adventure Hub';
    const isAllCompleted = currentStageIndex >= 10;

    return (
      <div className="flex flex-col items-center justify-center min-h-[85dvh] max-w-md mx-auto p-6 text-center gap-6 animate-scale-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center shadow-lg">
            <Lyra size={72} />
          </div>
          <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow">
            {isAllCompleted ? <Trophy size={18} /> : <Sparkles size={18} />}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full">
            {isAllCompleted ? 'Grand Quest Accomplished! 🏆' : 'Island Quest Complete! 🌟'}
          </span>
          <h2 className="text-2xl font-black text-slate-800 pt-1">
            Super Explorer, {child.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            You completed <strong>{completedStageName}</strong>!
          </p>
        </div>

        {isAllCompleted ? (
          <div className="space-y-4 w-full pt-2">
            <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-xs text-emerald-950 leading-relaxed font-medium text-left space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-emerald-800 text-sm">
                <Award size={18} />
                <span>All 10 Reading & Cognitive Islands Explored!</span>
              </div>
              <p>
                Your complete learning adventure responses have been safely saved. Let's look at your personalized learning map!
              </p>
            </div>
            <button
              onClick={onFinishAssessment}
              className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-grass, #22c55e), var(--color-sky, #38bdf8))',
              }}
            >
              <span>Unlock My Learning Adventure Map!</span>
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

      {/* Stage 01: Letter Knowledge */}
      {currentStageIndex === 0 && (
        <Stage01LetterKnowledge onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 02: Phonological Awareness */}
      {currentStageIndex === 1 && (
        <Stage02PhonologicalAwareness onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 03: Phonological Decoding */}
      {currentStageIndex === 2 && (
        <Stage03PhonologicalDecoding onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 04: Word Recognition */}
      {currentStageIndex === 3 && (
        <Stage04WordRecognition onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 05: Reading Fluency */}
      {currentStageIndex === 4 && (
        <Stage05ReadingFluency onStageComplete={handleStageCompleted} />
      )}

      {/* Midway Picnic Rest Break */}
      {currentStageIndex === 5 && (
        <MidwayBreakScreen child={child} onContinue={handleContinueNextStage} />
      )}

      {/* Stage 06: Reading Comprehension */}
      {currentStageIndex === 6 && (
        <Stage06ReadingComprehension onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 07: Spelling */}
      {currentStageIndex === 7 && (
        <Stage07Spelling onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 08: Rapid Automatized Naming (RAN) */}
      {currentStageIndex === 8 && (
        <Stage08RapidNaming onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 09: Working Memory */}
      {currentStageIndex === 9 && (
        <Stage09WorkingMemory onStageComplete={handleStageCompleted} />
      )}

      {/* Stage 10: Sustained Attention & Processing Speed */}
      {currentStageIndex === 10 && (
        <Stage10AttentionProcessing onStageComplete={handleStageCompleted} />
      )}

      {/* Completion Fallback */}
      {currentStageIndex > 10 && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center gap-4 animate-fade-in">
          <h3 className="text-xl font-black text-slate-800">
            All 10 Adventure Islands Completed! 🌟
          </h3>
          <button
            onClick={onFinishAssessment}
            className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            Unlock Learning Profile
          </button>
        </div>
      )}
    </div>
  );
}
