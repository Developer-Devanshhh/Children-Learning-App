/**
 * MidwayBreakScreen.tsx — Halfway Rest & Relaxation Island (Between Island 5 & 6)
 *
 * Child-friendly break to prevent cognitive fatigue and eye strain:
 *   - Lyra having a cozy picnic snack
 *   - Guided deep breathing & gentle eye-relaxation stretch exercises
 *   - Encouraging, stress-free pacing with no forced countdown
 */

import { useState } from 'react';
import { Sparkles, ArrowRight, Eye, Heart, Sun } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import type { DbChild } from '@/lib/supabase';

interface MidwayBreakScreenProps {
  child: DbChild;
  onContinue: () => void;
}

export function MidwayBreakScreen({ child, onContinue }: MidwayBreakScreenProps) {
  const [breathingStep, setBreathingStep] = useState<'breathe-in' | 'breathe-out'>('breathe-in');

  const handleContinue = () => {
    audioEngine.playSuccess();
    onContinue();
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-6 gap-6 animate-fade-in" style={{ minHeight: '100dvh' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥪</span>
          <div>
            <h2 className="text-sm font-black text-slate-800">Midway Picnic Break</h2>
            <p className="text-[11px] font-semibold text-amber-600">Rest & Recharge Time</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          Halfway Point! 5/10 Islands
        </span>
      </div>

      {/* Lyra Picnic Hero */}
      <div className="flex flex-col items-center text-center gap-3 pt-2">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fed7aa)' }}
          >
            <Lyra size={72} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            <Sun size={16} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Great Job, {child.name}! 🌟
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            You've explored 5 islands! Let's take a quick 2-minute stretch break.
          </p>
        </div>
      </div>

      {/* Interactive Gentle Relaxation Cards */}
      <div className="space-y-3 text-xs sm:text-sm">
        {/* Breathing Exercise */}
        <div
          onClick={() => setBreathingStep(s => s === 'breathe-in' ? 'breathe-out' : 'breathe-in')}
          className="p-4 rounded-3xl border-2 cursor-pointer transition-all bg-emerald-50 border-emerald-200 flex items-center gap-3.5 shadow-sm"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Heart size={20} className="animate-pulse text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-emerald-950">
              {breathingStep === 'breathe-in' ? 'Breathe In Deeply... 🌬️' : 'Slowly Breathe Out... 😌'}
            </h3>
            <p className="text-emerald-700 text-xs">
              Tap here to practice deep calming breaths with Lyra.
            </p>
          </div>
        </div>

        {/* Eye Stretch Tip */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Eye size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Relax Your Eyes</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Look away from the screen at something far across the room and blink 5 times.
            </p>
          </div>
        </div>

        {/* Wing Stretch Tip */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-purple-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Stretch Your Owl Wings</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Roll your shoulders backward and reach your arms up high to the sky!
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--color-grass, #22c55e), var(--color-sky, #38bdf8))',
          }}
        >
          <span>I'm Refreshed & Ready for Island 6!</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
