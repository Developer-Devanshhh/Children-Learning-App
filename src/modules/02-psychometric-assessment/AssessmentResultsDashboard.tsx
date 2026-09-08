/**
 * AssessmentResultsDashboard.tsx — Dual-View Learning Profile & Superpower Report
 *
 * Child Superpower View:
 *   - Playful badge celebration & exploration trophies
 *   - No clinical labels, no stress rankings
 *
 * Parent / Educator Multi-Domain Learning Profile View:
 *   - Multi-Domain breakdown across 10 cognitive & literacy dimensions
 *   - Support levels (Level 1–4), Accuracy (%), Speed consistency (Latency CV)
 *   - Evidence quality badges ('high', 'moderate', 'limited_evidence')
 *   - Prominent educational disclaimer (Screening Profile ≠ Clinical Diagnosis)
 *   - Direct action bridge to personalized haptic tracing learning activities
 */

import { useState } from 'react';
import {
  Trophy,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Zap,
} from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { DOMAIN_METADATA } from '@/lib/psychometricScorer';
import type { DbChild } from '@/lib/supabase';
import type { MultidimensionalAssessmentResult } from '@/lib/psychometricScorer';

interface AssessmentResultsDashboardProps {
  child: DbChild;
  results: MultidimensionalAssessmentResult;
  onStartPersonalizedLearning: (graphemes: string[]) => void;
  onReturnHome: () => void;
}

export function AssessmentResultsDashboard({
  child,
  results,
  onStartPersonalizedLearning,
  onReturnHome,
}: AssessmentResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'child_trophies' | 'parent_profile'>('child_trophies');
  const { domainScores, overallProfileSummary, personalizationProfile } = results;

  const supportLevelBadge = (level: string) => {
    switch (level) {
      case 'level_1':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">Level 1 · Independent</span>;
      case 'level_2':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">Level 2 · Core Solid</span>;
      case 'level_3':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Level 3 · Targeted Practice</span>;
      case 'level_4':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">Level 4 · Guided Scaffolding</span>;
      default:
        return null;
    }
  };

  const evidenceBadge = (grade: string) => {
    switch (grade) {
      case 'high':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">High Evidence</span>;
      case 'moderate':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Moderate Evidence</span>;
      case 'limited_evidence':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Limited Evidence (Few trials / skips)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-6 gap-6 animate-fade-in" style={{ minHeight: '100dvh' }}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-md shrink-0">
            <Lyra size={36} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {child.name}'s Adventure Profile
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              10 Exploration Islands Completed & Analyzed
            </p>
          </div>
        </div>

        {/* View Switcher Tab */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('child_trophies')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'child_trophies'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏆 Superpowers
          </button>
          <button
            onClick={() => setActiveTab('parent_profile')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'parent_profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Parent / Educator View
          </button>
        </div>
      </div>

      {/* ── CHILD SUPERPOWER VIEW ────────────────────────────────────────── */}
      {activeTab === 'child_trophies' && (
        <div className="space-y-5 animate-scale-in">
          {/* Main Celebration Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xl space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Trophy size={36} className="text-amber-100" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Master Explorer Badge
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                You Discovered 10 Reading Superpowers! 🌟
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Lyra noticed you have super sharp hearing, great story focus, and awesome memory skills!
              </p>
            </div>
          </div>

          {/* Superpower Trophy Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-200 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-emerald-950">Sound Detective</h3>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  You can hear rhymes and blend sounds together like a pro!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-sky-50 border-2 border-sky-200 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Zap size={20} className="text-sky-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-sky-950">Speedy Explorer</h3>
                <p className="text-xs text-sky-700 font-medium leading-relaxed">
                  Super fast recognition on symbols, colors, and words!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-purple-50 border-2 border-purple-200 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Brain size={20} className="text-purple-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-purple-950">Memory Champion</h3>
                <p className="text-xs text-purple-700 font-medium leading-relaxed">
                  You remember sequences and backward puzzle clues with ease!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-amber-950">Story Knight</h3>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  You understand stories and spot clues in passages!
                </p>
              </div>
            </div>
          </div>

          {/* Action Card: Direct Bridge to Haptic Tracing & Phonics */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-500 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2 font-black text-base">
              <Award size={22} className="text-amber-300" />
              <span>Next Stage: Let's Learn Alphabets! ✍️</span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              Based on your adventure, Lyra prepared special haptic multi-sensory tracing activities for focus letters:{' '}
              <span className="font-black text-white bg-white/20 px-2.5 py-0.5 rounded-lg text-sm tracking-wider">
                {personalizationProfile.recommended_graphemes.join(', ').toUpperCase()}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => onStartPersonalizedLearning(personalizationProfile.recommended_graphemes)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-slate-900 bg-white shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                <span>Let's Learn Focus Letters! ✍️</span>
                <ArrowRight size={18} className="text-purple-600" />
              </button>
              <button
                onClick={onReturnHome}
                className="py-4 px-5 rounded-2xl font-bold text-xs text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition active:scale-95 cursor-pointer text-center"
              >
                Explore All A–Z Alphabets 🔤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PARENT & EDUCATOR MULTI-DOMAIN VIEW ────────────────────────── */}
      {activeTab === 'parent_profile' && (
        <div className="space-y-5 animate-scale-in">
          {/* Clinical Disclaimer Alert Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3 text-xs leading-relaxed text-amber-950">
            <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                Educational Screening Notice
              </span>
              <p>
                This screening report creates an individualized reading and cognitive support profile. It does
                <strong> NOT </strong> make a clinical diagnosis of dyslexia or any learning disability.
              </p>
            </div>
          </div>

          {/* Summary Overview Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Profile Summary & Recommendations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500">Top Strengths:</span>
                <p className="font-semibold text-slate-800">
                  {overallProfileSummary.strongestDomains.join(' · ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500">Priority Learning Focus:</span>
                <p className="font-semibold text-indigo-700">
                  {personalizationProfile.priority_learning_path}
                </p>
              </div>
            </div>
          </div>

          {/* All 10 Multi-Domain Breakdown Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              10 Domain Measurement Breakdown
            </h3>

            {Object.values(domainScores).map((score) => {
              const meta = DOMAIN_METADATA[score.domain_id];
              return (
                <div
                  key={score.domain_id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">{score.domain_name}</h4>
                      <p className="text-[11px] text-slate-500">{meta?.description}</p>
                    </div>
                    {supportLevelBadge(score.support_level)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Accuracy:</span>
                      <span className="text-slate-900 font-bold">{score.accuracy_percentage}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Median RT:</span>
                      <span className="text-slate-900 font-bold">{score.median_response_time_ms} ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Latency CV:</span>
                      <span className="text-slate-900 font-bold">{score.latency_cv || 0}</span>
                    </div>
                    <div>{evidenceBadge(score.evidence_quality)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onReturnHome}
              className="flex-1 py-3.5 rounded-2xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-97 cursor-pointer"
            >
              Return to Learning Hub
            </button>
            <button
              onClick={() => onStartPersonalizedLearning(personalizationProfile.recommended_graphemes)}
              className="flex-1 py-3.5 rounded-2xl font-black text-xs text-white shadow-md active:scale-97 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-grass, #22c55e), var(--color-sky, #38bdf8))',
              }}
            >
              Start Personalized Tracing Studio ✍️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
