/**
 * AssessmentIntro.tsx — Child & Parent Reading Adventure Introduction Screen
 *
 * Child-facing, friendly overview of the 10 mini-adventures with Lyra.
 * Includes:
 *   - Welcoming owl animation & encouraging mission briefing
 *   - Audio/Speaker check button to ensure sound is clear
 *   - Low-stress reminders (no timer pressure, breaks included)
 *   - Direct transition to warm-up practice
 */

import { useState } from 'react';
import { Volume2, Sparkles, ArrowLeft, ArrowRight, Compass, Coffee, CheckCircle2 } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import type { DbChild } from '@/lib/supabase';

interface AssessmentIntroProps {
  child: DbChild;
  onStartPractice: () => void;
  onBack: () => void;
}

export function AssessmentIntro({ child, onStartPractice, onBack }: AssessmentIntroProps) {
  const [audioTested, setAudioTested] = useState(false);

  const handleTestAudio = () => {
    audioEngine.playSuccess();
    setAudioTested(true);
    
    // Also use Web Speech API if supported for interactive voice greeting
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Hello ${child.name}! Welcome to the Reading Adventure!`);
      utterance.rate = 0.95;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-6 gap-6 animate-fade-in" style={{ minHeight: '100dvh' }}>
      {/* Top Navigation */}
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

        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: 'var(--color-sky-light, #e0f2fe)', color: 'var(--color-sky-dark, #0369a1)' }}
          >
            Explorer: {child.name}
          </span>
        </div>
      </div>

      {/* Lyra Hero Header */}
      <div className="flex flex-col items-center text-center gap-3 pt-2">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e0f2fe, #f3e8ff)' }}
          >
            <Lyra size={72} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md">
            <Sparkles size={16} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-ink)' }}>
            Welcome, {child.name}! 🌟
          </h1>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-muted)' }}>
            Join Lyra on a fun 10-island Reading Adventure!
          </p>
        </div>
      </div>

      {/* Adventure Highlights Cards */}
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Compass size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">10 Fun Island Games</h3>
            <p className="text-slate-500 leading-relaxed">
              We'll explore letter sounds, secret words, story puzzles, and memory games. No timers on screen—just do your best!
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Coffee size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Picnic Rest Break Included</h3>
            <p className="text-slate-500 leading-relaxed">
              After Island 5, Lyra will give us a refreshing mini-break with fun stretches to relax your eyes.
            </p>
          </div>
        </div>

        {/* Audio Check Widget */}
        <div
          className="p-4 rounded-3xl border-2 transition-all space-y-2"
          style={{
            background: audioTested ? '#f0fdf4' : '#faf5ff',
            borderColor: audioTested ? '#86efac' : '#d8b4fe',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
              <Volume2 size={18} className="text-purple-600" />
              <span>Sound & Speaker Check</span>
            </div>
            {audioTested && (
              <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={13} /> Ready!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Make sure your tablet or computer volume is turned up so you can hear Lyra speak.
          </p>
          <button
            onClick={handleTestAudio}
            className="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-97"
            style={{
              background: audioTested ? 'white' : '#9333ea',
              color: audioTested ? '#15803d' : 'white',
              border: audioTested ? '1.5px solid #86efac' : 'none',
              boxShadow: audioTested ? 'none' : '0 2px 8px rgba(147, 51, 234, 0.25)',
            }}
          >
            <Volume2 size={15} />
            <span>{audioTested ? 'Sound is Working! (Tap to replay)' : 'Tap Here to Test Sound'}</span>
          </button>
        </div>
      </div>

      {/* Gentle Tips Box */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 text-slate-600 text-xs text-center space-y-0.5">
        <p className="font-semibold text-slate-700">💡 Tip for Explorers & Parents:</p>
        <p>You can tap the speaker button on any island to hear instructions again!</p>
      </div>

      {/* Start Warm-Up Practice Action Button */}
      <div className="pt-2">
        <button
          onClick={onStartPractice}
          className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--color-sky, #38bdf8), var(--color-lavender, #c084fc))',
          }}
        >
          <span>Start Warm-Up Practice</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
