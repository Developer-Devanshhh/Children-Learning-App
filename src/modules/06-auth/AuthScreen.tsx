/**
 * AuthScreen — Parent / Caregiver sign-in and sign-up
 *
 * Two tabs: Sign In / Create Account
 * This screen is NOT child-facing — tone is calm and professional.
 * Design is warm and on-brand with the app palette.
 */

import { useState, useCallback } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { useAuthStore } from '@/stores/useAuthStore';

type AuthTab = 'signin' | 'signup';

interface AuthScreenProps {
  /** Called after successful auth so App.tsx can advance the screen */
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [tab, setTab]         = useState<AuthTab>('signin');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    clearError();

    if (tab === 'signup' && password !== confirm) {
      setLocalErr('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setLocalErr('Password must be at least 6 characters.');
      return;
    }

    const ok = tab === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (ok) {
      onAuthenticated();
    }
  }, [tab, email, password, confirm, signIn, signUp, clearError, onAuthenticated]);

  const displayError = localErr ?? error;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-dvh w-full px-5 py-8"
      style={{ background: 'var(--color-cloud)' }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <Lyra size={72} />
        <h1 className="text-3xl font-black" style={{ color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
          LyraLearn
        </h1>
        <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
          Parent & caregiver portal
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
        style={{
          background: 'var(--color-surface)',
          boxShadow: '0 8px 40px hsl(225 25% 18% / 0.10)',
          border: '1.5px solid hsl(225 15% 90%)',
        }}
      >
        {/* Tab bar */}
        <div
          className="flex rounded-2xl p-1"
          style={{ background: 'hsl(225 15% 93%)' }}
        >
          {(['signin', 'signup'] as AuthTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setLocalErr(null); clearError(); }}
              className="flex-1 rounded-xl py-2 text-sm font-bold transition-all"
              style={{
                background: tab === t ? 'var(--color-surface)' : 'transparent',
                color: tab === t ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                boxShadow: tab === t ? '0 2px 8px hsl(225 25% 18% / 0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-xs font-bold" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Email
            </label>
            <div className="relative">
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)', pointerEvents: 'none' }} />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 14,
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderRadius: 14,
                  border: '2px solid hsl(225 15% 88%)',
                  background: 'hsl(225 20% 97%)',
                  fontSize: '0.95rem',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-xs font-bold" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)', pointerEvents: 'none' }} />
              <input
                id="auth-password"
                type="password"
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 14,
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderRadius: 14,
                  border: '2px solid hsl(225 15% 88%)',
                  background: 'hsl(225 20% 97%)',
                  fontSize: '0.95rem',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Confirm (sign-up only) */}
          {tab === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-confirm" className="text-xs font-bold" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)', pointerEvents: 'none' }} />
                <input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    paddingLeft: 40,
                    paddingRight: 14,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 14,
                    border: '2px solid hsl(225 15% 88%)',
                    background: 'hsl(225 20% 97%)',
                    fontSize: '0.95rem',
                    color: 'var(--color-ink)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {displayError && (
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-3"
              style={{ background: 'hsl(10 85% 96%)', border: '1.5px solid hsl(10 85% 80%)', color: 'hsl(10 75% 40%)' }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{displayError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="touch-target w-full rounded-2xl font-bold text-white transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: 'var(--color-sky)',
              border: '2px solid var(--color-sky)',
              boxShadow: '0 4px 16px hsl(200 80% 60% / 0.35)',
              fontSize: '0.95rem',
            }}
          >
            {loading
              ? <Loader size={18} className="animate-spin" />
              : tab === 'signin'
                ? <><LogIn size={17} /> Sign In</>
                : <><UserPlus size={17} /> Create Account</>
            }
          </button>
        </form>

        {/* Skip (offline / dev mode) */}
        {!import.meta.env.VITE_SUPABASE_URL && (
          <p className="text-center" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            No Supabase project yet? The app works offline without signing in.{' '}
            <button
              type="button"
              onClick={onAuthenticated}
              style={{ color: 'var(--color-sky)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Continue offline
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
