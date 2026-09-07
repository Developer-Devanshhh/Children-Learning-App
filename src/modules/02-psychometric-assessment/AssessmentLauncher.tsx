/**
 * AssessmentLauncher.tsx — Entry Card & Banner for Psychometric Reading Adventure
 *
 * Displays on the child's home screen / LetterSelector dashboard.
 * Provides a gentle, engaging invitation to start or view the 10-domain screening adventure.
 */

import { Sparkles, Compass, Award, ArrowRight } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import type { DbChild } from '@/lib/supabase';

interface AssessmentLauncherProps {
  child?: DbChild | null;
  onLaunchAssessment: () => void;
  onViewReport?: () => void;
  hasCompletedAssessment?: boolean;
}

export function AssessmentLauncher({
  child,
  onLaunchAssessment,
  onViewReport,
  hasCompletedAssessment = false,
}: AssessmentLauncherProps) {
  const childName = child?.name ?? 'Little Explorer';

  return (
    <div
      className="w-full rounded-3xl p-5 mb-5 border-2 relative overflow-hidden transition-all shadow-md animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 60%, #fef3c7 100%)',
        borderColor: '#bae6fd',
      }}
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-500" />
            <span>Reading Adventure</span>
          </div>

          <h2 className="text-lg font-black text-slate-900 leading-tight">
            {hasCompletedAssessment
              ? `${childName}'s Reading Superpowers 🌟`
              : `Discover ${childName}'s Superpowers! 🚀`}
          </h2>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {hasCompletedAssessment
              ? 'Your personalized learning profile is ready! You can review domain insights or replay the adventure.'
              : 'Join Lyra on a 10-island reading quest (30–40 min) to unlock custom learning paths!'}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
            <Lyra size={42} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
        <button
          onClick={onLaunchAssessment}
          className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-97 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #0284c7, #9333ea)',
          }}
        >
          <Compass size={15} />
          <span>{hasCompletedAssessment ? 'Retake Adventure' : 'Start Adventure'}</span>
          <ArrowRight size={14} />
        </button>

        {hasCompletedAssessment && onViewReport && (
          <button
            onClick={onViewReport}
            className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-white text-slate-800 border border-slate-300 shadow-sm transition-all flex items-center gap-1.5 active:scale-97 cursor-pointer hover:bg-slate-50"
          >
            <Award size={15} className="text-amber-600" />
            <span>View Superpower Report</span>
          </button>
        )}
      </div>
    </div>
  );
}
