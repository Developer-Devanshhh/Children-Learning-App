/**
 * AssessmentConsent.tsx — Parent/Guardian Consent & Privacy Transparency Screen
 *
 * Clearly distinguishes:
 *   Screening & Performance Profiling ≠ Clinical Diagnosis.
 * Explains:
 *   - Purpose of the assessment
 *   - Data collected (child nickname, age/grade, interaction timing, accuracy)
 *   - Privacy guarantee (no third-party data sharing)
 *   - Child experience (low-stress, game-based, no clinical labels)
 */

import { useState } from 'react';
import { ShieldCheck, Info, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import type { DbChild } from '@/lib/supabase';

interface AssessmentConsentProps {
  child: DbChild;
  onConsentGranted: () => void;
  onBack: () => void;
}

export function AssessmentConsent({ child, onConsentGranted, onBack }: AssessmentConsentProps) {
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [agreedDataCollection, setAgreedDataCollection] = useState(false);

  const canProceed = agreedDisclaimer && agreedDataCollection;

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-6 gap-6 animate-fade-in" style={{ minHeight: '100dvh' }}>
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all active:scale-95 touch-target"
          style={{ background: 'hsl(225 15% 94%)', color: 'var(--color-ink-muted)' }}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: 'var(--color-sky-light)', color: 'var(--color-sky-dark)' }}
          >
            {child.name} ({child.age_band} yrs)
          </span>
          <Lyra size={42} />
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-2 text-center">
        <div className="w-14 h-14 mx-auto bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-ink)' }}>
          Reading Assessment Consent
        </h1>
        <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-ink-muted)' }}>
          Please review the educational purpose and data guidelines before {child.name} begins the Reading Adventure.
        </p>
      </div>

      {/* Key Disclaimer Callout Banner */}
      <div
        className="p-4 rounded-3xl border-2 space-y-2"
        style={{
          background: 'var(--color-sun-light, #fef3c7)',
          borderColor: 'var(--color-sun, #f59e0b)',
          color: 'var(--color-ink)',
        }}
      >
        <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-sun-dark, #b45309)' }}>
          <Info size={18} className="shrink-0" />
          <span>Important Screening Notice</span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          This assessment is an <strong>educational screening and performance profiling tool</strong>. It identifies relative reading strengths and areas where your child may benefit from personalized practice. <strong>It is not a clinical or medical diagnosis of dyslexia.</strong> An official diagnosis requires a comprehensive multidisciplinary evaluation by a licensed specialist.
        </p>
      </div>

      {/* Information Cards */}
      <div className="space-y-3 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <span className="text-base">⏱️</span> 30–40 Minutes Duration
          </h3>
          <p className="leading-relaxed">
            The assessment contains 10 short, engaging game sections designed for children. A structured rest break is provided around the halfway point to prevent fatigue.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Lock size={16} className="text-purple-600" /> Transparent Data Collection
          </h3>
          <p className="leading-relaxed">
            We collect only functional assessment data: task response selections, reaction latency in milliseconds, attempts, and audio replay counts. No personal biometric data or video is ever stored.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <span className="text-base">🧒</span> Child-Friendly Experience
          </h3>
          <p className="leading-relaxed">
            Your child will see an adventure guided by Lyra the Owl. They will <strong>never see test scores, dyslexia labels, error counts, or competitive rankings</strong> during the adventure.
          </p>
        </div>
      </div>

      {/* Checkbox Confirmations */}
      <div className="space-y-2.5 pt-2">
        <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition select-none bg-white shadow-sm">
          <input
            type="checkbox"
            checked={agreedDisclaimer}
            onChange={(e) => setAgreedDisclaimer(e.target.checked)}
            className="w-5 h-5 mt-0.5 text-purple-600 rounded focus:ring-purple-400"
          />
          <span className="text-xs font-semibold text-slate-700 leading-snug">
            I understand that this is an educational screening for learning personalization, not a medical or clinical diagnosis.
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition select-none bg-white shadow-sm">
          <input
            type="checkbox"
            checked={agreedDataCollection}
            onChange={(e) => setAgreedDataCollection(e.target.checked)}
            className="w-5 h-5 mt-0.5 text-purple-600 rounded focus:ring-purple-400"
          />
          <span className="text-xs font-semibold text-slate-700 leading-snug">
            I consent to recording {child.name}'s task interaction responses to personalize their learning activities.
          </span>
        </label>
      </div>

      {/* Consent Action Button */}
      <button
        onClick={onConsentGranted}
        disabled={!canProceed}
        className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-97 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: canProceed
            ? 'linear-gradient(135deg, var(--color-sky, #38bdf8), var(--color-lavender, #c084fc))'
            : 'hsl(225 15% 80%)',
        }}
      >
        <span>Continue to Assessment Overview</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
