/**
 * AssessmentPractice.tsx — Interactive Warm-Up Tutorial (Stage 00)
 *
 * Teaches the child the 3 primary interactive mechanics used in the screening:
 *   1. Tap / Selection (e.g. tap the glowing star)
 *   2. Audio Listening (e.g. tap the speaker to hear a prompt, then choose)
 *   3. Drag / Matching (e.g. drag the key to the lock)
 *
 * Ensures:
 *   - Child understands how to interact with the device
 *   - Eliminates interface unfamiliarity confounders from cognitive scores
 *   - Provides warm, low-stress encouragement from Lyra
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Star, Key, Lock } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import type { DbChild } from '@/lib/supabase';

interface AssessmentPracticeProps {
  child: DbChild;
  onCompletePractice: () => void;
  onBack: () => void;
}

type PracticeStep = 1 | 2 | 3 | 'done';

export function AssessmentPractice({ child, onCompletePractice, onBack }: AssessmentPracticeProps) {
  const [step, setStep] = useState<PracticeStep>(1);
  const [stepSuccess, setStepSuccess] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [dragOverLock, setDragOverLock] = useState(false);
  const [dragCompleted, setDragCompleted] = useState(false);

  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    mountTimeRef.current = Date.now();
    setStepSuccess(false);
  }, [step]);

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── Step 1: Tap the Star ──────────────────────────────────────────────────
  const handleTapStar = () => {
    if (Date.now() - mountTimeRef.current < 250) return; // accidental bounce guard
    audioEngine.playSuccess();
    setStepSuccess(true);
    playSpeech('Awesome tap! You found the star!');
    setTimeout(() => {
      setStep(2);
    }, 1200);
  };

  // ── Step 2: Audio Listen & Select ─────────────────────────────────────────
  const handlePlaySoundPrompt = () => {
    audioEngine.playWaypointHit();
    setAudioPlayed(true);
    playSpeech('Listen carefully! Pick the sunny sunflower!');
  };

  const handleSelectFlower = (isCorrect: boolean) => {
    if (!audioPlayed) {
      audioEngine.playEncourage();
      playSpeech('First tap the purple speaker to hear the clue!');
      return;
    }
    if (isCorrect) {
      audioEngine.playSuccess();
      setStepSuccess(true);
      playSpeech('Splendid! You picked the sunflower!');
      setTimeout(() => {
        setStep(3);
      }, 1200);
    } else {
      audioEngine.playEncourage();
      playSpeech('Try the sunny sunflower!');
    }
  };

  // ── Step 3: Drag & Match (or Tap Alternative) ────────────────────────────
  const handleDragSuccess = () => {
    audioEngine.playSuccess();
    setDragCompleted(true);
    setStepSuccess(true);
    playSpeech('Hooray! The lock is open!');
    setTimeout(() => {
      setStep('done');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-6 gap-5 animate-fade-in" style={{ minHeight: '100dvh' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all active:scale-95 touch-target cursor-pointer"
          style={{ background: 'hsl(225 15% 94%)', color: 'var(--color-ink-muted)' }}
          aria-label="Back"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="w-7 h-2 rounded-full transition-all duration-300"
              style={{
                background:
                  step === 'done' || (typeof step === 'number' && step >= num)
                    ? 'var(--color-grass, #22c55e)'
                    : 'hsl(225 15% 85%)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Lyra size={38} />
        </div>
      </div>

      {/* Lyra Guidance Bubble */}
      <div
        className="p-4 rounded-3xl border-2 flex items-center gap-3.5 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff, #faf5ff)',
          borderColor: '#bae6fd',
        }}
      >
        <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
          <Sparkles size={22} className="text-amber-500" />
        </div>
        <div className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
          {step === 1 && "Warm-Up Step 1: Let's practise tapping! Tap the shining gold star below."}
          {step === 2 && "Warm-Up Step 2: Tap the speaker to hear the secret clue, then choose!"}
          {step === 3 && "Warm-Up Step 3: Drag the golden key to unlock the treasure chest!"}
          {step === 'done' && `Super work, ${child.name}! You are ready to start Island 1!`}
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Step 1: Tap the Star */}
        {step === 1 && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tap the Star</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  audioEngine.playEncourage();
                  playSpeech('Almost! Tap the golden star!');
                }}
                className="w-24 h-24 rounded-3xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-3xl transition-transform active:scale-90 hover:border-slate-300 cursor-pointer"
                aria-label="Cloud button"
              >
                ☁️
              </button>

              <button
                onClick={handleTapStar}
                className="w-24 h-24 rounded-3xl border-3 border-amber-400 bg-amber-50 flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105 cursor-pointer animate-pulse"
                aria-label="Golden Star button"
              >
                <Star size={48} className="text-amber-500 fill-amber-400" />
              </button>
            </div>
            {stepSuccess && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 animate-bounce">
                <CheckCircle2 size={18} /> Nice Tap!
              </div>
            )}
          </div>
        )}

        {/* Step 2: Listen & Choose */}
        {step === 2 && (
          <div className="flex flex-col items-center gap-5 w-full max-w-xs animate-fade-in">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Listen & Choose</p>
            
            <button
              onClick={handlePlaySoundPrompt}
              className="px-5 py-3 rounded-2xl font-bold text-sm text-white flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{ background: audioPlayed ? '#10b981' : '#8b5cf6' }}
            >
              <Volume2 size={20} />
              <span>{audioPlayed ? 'Tap to Hear Clue Again 🔊' : 'Tap to Listen 🔊'}</span>
            </button>

            <div className="grid grid-cols-2 gap-4 w-full pt-2">
              <button
                onClick={() => handleSelectFlower(false)}
                className="p-4 rounded-3xl border-2 border-slate-200 bg-slate-50 flex flex-col items-center gap-1 hover:border-slate-300 active:scale-95 cursor-pointer transition"
              >
                <span className="text-4xl">🍎</span>
                <span className="text-xs font-bold text-slate-600">Apple</span>
              </button>

              <button
                onClick={() => handleSelectFlower(true)}
                className="p-4 rounded-3xl border-2 border-purple-200 bg-purple-50 flex flex-col items-center gap-1 hover:border-purple-300 active:scale-95 cursor-pointer transition"
              >
                <span className="text-4xl">🌻</span>
                <span className="text-xs font-bold text-purple-700">Sunflower</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Drag & Match */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drag to Match</p>

            <div className="flex items-center justify-around w-full max-w-xs">
              {/* Draggable Key */}
              <div
                draggable={!dragCompleted}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', 'key')}
                onClick={handleDragSuccess} // Support direct tap for accessibility
                className={`w-20 h-20 rounded-3xl border-2 flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing active:scale-95 transition-all shadow-md ${
                  dragCompleted ? 'opacity-40 border-slate-200 bg-slate-50' : 'border-amber-400 bg-amber-50 hover:scale-105'
                }`}
              >
                <Key size={32} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700">Key</span>
              </div>

              <div className="text-slate-300 text-xl font-black">➔</div>

              {/* Target Lock */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverLock(true);
                }}
                onDragLeave={() => setDragOverLock(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverLock(false);
                  handleDragSuccess();
                }}
                onClick={handleDragSuccess}
                className={`w-20 h-20 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                  dragCompleted
                    ? 'border-green-500 bg-green-50'
                    : dragOverLock
                    ? 'border-purple-500 bg-purple-100 scale-110'
                    : 'border-slate-300 bg-slate-50'
                }`}
              >
                <Lock size={32} className={dragCompleted ? 'text-green-600' : 'text-slate-500'} />
                <span className="text-[10px] font-bold text-slate-600">{dragCompleted ? 'Unlocked!' : 'Drop Here'}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              (Drag the key or tap it to unlock)
            </p>
          </div>
        )}

        {/* Practice Complete Screen */}
        {step === 'done' && (
          <div className="flex flex-col items-center text-center gap-4 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-md">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-800">Warm-Up Complete! 🏅</h2>
              <p className="text-xs text-slate-500">
                You know how to tap, listen, and match! You are ready for Island 1.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Completion Action */}
      {step === 'done' && (
        <button
          onClick={onCompletePractice}
          className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--color-grass, #22c55e), var(--color-sky, #38bdf8))',
          }}
        >
          <span>Begin Reading Adventure!</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
