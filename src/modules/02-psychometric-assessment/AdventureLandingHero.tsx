/**
 * AdventureLandingHero.tsx — Vibrant, Child-Friendly ReadQuest Adventure Landing Page
 *
 * Replaces the initial A-Z grid on first open.
 * Leads the child and parent directly into the reading screening adventure.
 * Features Lyra the owl companion, soft pastel gradients, playful badges, and clear actions.
 */

import { Sparkles, ArrowRight, Heart, Brain, Gamepad2 } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { audioEngine } from '@/modules/audio/audioEngine';
import type { DbChild } from '@/lib/supabase';

interface AdventureLandingHeroProps {
  child: DbChild;
  onStartAdventure: () => void;
  onTryDemo: () => void;
  onOpenParentTeacher: () => void;
}

export function AdventureLandingHero({
  child,
  onStartAdventure,
  onTryDemo,
  onOpenParentTeacher,
}: AdventureLandingHeroProps) {
  const handleStart = () => {
    audioEngine.playSuccess();
    onStartAdventure();
  };

  const handleDemo = () => {
    audioEngine.playWaypointHit();
    onTryDemo();
  };

  return (
    <div
      className="w-full min-h-[calc(100dvh-8px)] flex flex-col justify-between px-5 sm:px-10 py-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 10% 10%, #fef08a 0%, transparent 40%), radial-gradient(circle at 90% 15%, #e9d5ff 0%, transparent 45%), #f8fafc',
      }}
    >
      {/* Decorative ambient background sparkles & cloud blurs */}
      <div className="absolute top-12 left-1/3 w-72 h-72 rounded-full bg-amber-100/40 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-28 right-10 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl pointer-events-none -z-10" />

      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <header className="flex items-center justify-between w-full max-w-6xl mx-auto z-10">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center shadow-md shadow-amber-200/60 border border-amber-200">
            <span className="text-2xl font-black text-slate-800 tracking-tight">L</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">ReadQuest</span>
              <span className="text-xs">✨</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 tracking-wide">Learn • Explore • Grow</p>
          </div>
        </div>

        {/* Parent / Teacher Pill Button */}
        <button
          onClick={onOpenParentTeacher}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 cursor-pointer"
        >
          <span className="text-sm">🧑‍🏫</span>
          <span>Parent / Teacher</span>
        </button>
      </header>

      {/* ── Main Hero Content Area ───────────────────────────────────────── */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-6 my-auto z-10">
        {/* Left Column: Heading, Pitch, & Action Buttons */}
        <div className="lg:col-span-7 space-y-6 text-left animate-fade-in">
          {/* Top Pill Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 shadow-sm text-xs font-black text-amber-900">
            <Sparkles size={14} className="text-amber-600" />
            <span>A reading adventure made for {child.name || 'YOU'}!</span>
          </div>

          {/* Large Welcoming Title */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500">
                ReadQuest!
              </span>{' '}
              <span className="inline-block animate-bounce-subtle">🌈</span>
            </h1>
          </div>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
            Explore magical worlds, discover letters and sounds, solve word puzzles, read stories, and
            learn what makes your learning journey special.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleStart}
              className="px-7 py-4 rounded-2xl font-black text-base text-white shadow-xl shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              }}
            >
              <span className="text-lg">🚀</span>
              <span>Start Adventure</span>
              <ArrowRight size={18} className="ml-0.5" />
            </button>

            <button
              onClick={handleDemo}
              className="px-6 py-4 rounded-2xl font-black text-sm text-slate-700 bg-white/90 backdrop-blur-md border-2 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Gamepad2 size={18} className="text-purple-600" />
              <span>Try Demo</span>
            </button>
          </div>

          {/* Trust & Methodology Badges */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <Brain size={16} className="text-pink-500" />
              <span>Research-informed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gamepad2 size={16} className="text-indigo-500" />
              <span>Game-based</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={16} className="text-amber-500 fill-amber-500" />
              <span>Child-friendly</span>
            </div>
          </div>
        </div>

        {/* Right Column: Lyra Companion Inside Gradient Sphere */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative animate-scale-in">
          {/* Main Glowing Mascot Circle */}
          <div
            className="w-72 h-72 sm:w-88 sm:h-88 rounded-full flex items-center justify-center relative shadow-2xl transition-transform duration-500 hover:scale-102"
            style={{
              background: 'linear-gradient(135deg, #fbcfe8 0%, #fed7aa 50%, #c4b5fd 100%)',
            }}
          >
            {/* Subtle floating cloud elements */}
            <div className="absolute -top-3 left-4 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-xs font-bold text-slate-500 flex items-center gap-1">
              <span>☁️</span>
              <span className="text-[10px]">Cloud 9</span>
            </div>

            <div className="absolute top-16 -right-4 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-xs font-bold text-slate-500 flex items-center gap-1">
              <span>⭐️</span>
              <span className="text-[10px]">Star Valley</span>
            </div>

            {/* Lyra Companion Character */}
            <div className="relative z-10 transform -translate-y-2">
              <Lyra size={180} />
            </div>

            {/* Floating Speech Bubble Card at Bottom Right */}
            <div className="absolute -bottom-5 right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-0.5 max-w-[210px] z-20 animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900">Hi! I'm Lyra</span>
                <span className="text-base">🦉</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-snug">
                I'll be your guide on today's adventure!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold text-slate-400 gap-2 z-10">
        <div>
          Active Explorer: <strong className="text-slate-600">{child.name}</strong> ({child.age_band} Years)
        </div>
        <div>
          Screening & Learning Exploration Protocol v1.0
        </div>
      </footer>
    </div>
  );
}
