/**
 * ChildSelector — pick or create a child profile
 *
 * Shows all children belonging to the signed-in parent.
 * "Add child" card opens an inline form.
 * Selecting a child advances the app to the home screen.
 */

import { useState, useEffect } from 'react';
import { Plus, User, ChevronRight, Loader } from 'lucide-react';
import { Lyra } from '@/modules/04-attention-agent/Lyra';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChildStore } from '@/stores/useChildStore';
import type { DbChild } from '@/lib/supabase';

const AGE_BANDS: DbChild['age_band'][] = ['6-7', '8-9', '10-12'];

const AVATAR_COLORS = [
  'var(--color-sky)',
  'var(--color-grass)',
  'var(--color-sun)',
  'var(--color-lavender)',
  'var(--color-coral)',
];

interface ChildSelectorProps {
  onChildSelected: () => void;
}

export function ChildSelector({ onChildSelected }: ChildSelectorProps) {
  const { user, signOut } = useAuthStore();
  const { children, selectedChild, loading, error, loadChildren, selectChild, addChild } = useChildStore();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<DbChild['age_band']>('6-7');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) void loadChildren(user.id);
  }, [user, loadChildren]);

  const handleSelect = (child: DbChild) => {
    selectChild(child);
    onChildSelected();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    const child = await addChild(user.id, name, ageBand);
    setSaving(false);
    if (child) {
      setShowForm(false);
      setName('');
      handleSelect(child);
    }
  };

  // Allow offline access — skip child selection when no Supabase
  const isOffline = !import.meta.env.VITE_SUPABASE_URL;

  return (
    <div
      className="flex flex-col items-center min-h-dvh w-full px-5 py-8"
      style={{ background: 'var(--color-cloud)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 w-full max-w-sm">
        <Lyra size={56} />
        <div className="flex-1">
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-ink)' }}>Who's practising?</h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.82rem', marginTop: 2 }}>
            {user?.email ?? 'Offline mode'}
          </p>
        </div>
        <button
          onClick={() => void signOut()}
          style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Sign out
        </button>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">

        {loading && (
          <div className="flex justify-center py-6">
            <Loader size={28} style={{ color: 'var(--color-sky)' }} className="animate-spin" />
          </div>
        )}

        {error && (
          <p style={{ color: 'hsl(10 75% 45%)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
        )}

        {/* Existing child cards */}
        {!loading && children.map((child, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const isSelected = selectedChild?.id === child.id;
          return (
            <button
              key={child.id}
              onClick={() => handleSelect(child)}
              className="flex items-center gap-4 rounded-3xl p-4 transition-all active:scale-97 text-left"
              style={{
                background: isSelected ? `${color}15` : 'var(--color-surface)',
                border: `2.5px solid ${isSelected ? color : 'hsl(225 15% 90%)'}`,
                boxShadow: isSelected ? `0 4px 20px ${color}33` : '0 2px 10px hsl(225 15% 18% / 0.05)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{ width: 52, height: 52, background: `${color}22`, border: `2px solid ${color}55` }}
              >
                <User size={24} style={{ color }} />
              </div>
              <div className="flex-1">
                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-ink)' }}>{child.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', marginTop: 1 }}>
                  Age {child.age_band} years
                </p>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--color-ink-muted)', flexShrink: 0 }} />
            </button>
          );
        })}

        {/* Add child card / form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-4 rounded-3xl p-4 transition-all active:scale-97"
            style={{
              background: 'transparent',
              border: '2.5px dashed hsl(225 15% 82%)',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ width: 52, height: 52, background: 'hsl(225 15% 94%)', border: '2px dashed hsl(225 15% 80%)' }}
            >
              <Plus size={22} style={{ color: 'var(--color-ink-muted)' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-ink-muted)' }}>Add a child profile</p>
          </button>
        ) : (
          /* Inline add form */
          <form
            onSubmit={handleAdd}
            className="rounded-3xl p-5 flex flex-col gap-4"
            style={{
              background: 'var(--color-surface)',
              border: '2.5px solid var(--color-sky)',
              boxShadow: '0 4px 20px hsl(200 80% 60% / 0.12)',
            }}
          >
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-ink)' }}>New child profile</p>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Child's first name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aryan"
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '2px solid hsl(225 15% 88%)',
                  background: 'hsl(225 20% 97%)',
                  fontSize: '0.95rem',
                  color: 'var(--color-ink)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Age group
              </label>
              <div className="flex gap-2">
                {AGE_BANDS.map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setAgeBand(band)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 12,
                      border: `2px solid ${ageBand === band ? 'var(--color-sky)' : 'hsl(225 15% 88%)'}`,
                      background: ageBand === band ? 'var(--color-sky-light)' : 'transparent',
                      color: ageBand === band ? 'var(--color-sky-dark)' : 'var(--color-ink-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {band} yr
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setName(''); }}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: 14,
                  border: '2px solid hsl(225 15% 88%)',
                  background: 'transparent',
                  color: 'var(--color-ink-muted)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                style={{
                  flex: 2,
                  padding: '11px 14px',
                  borderRadius: 14,
                  border: '2px solid var(--color-sky)',
                  background: 'var(--color-sky)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: saving || !name.trim() ? 0.6 : 1,
                }}
              >
                {saving ? <Loader size={16} className="animate-spin" /> : 'Save & Start'}
              </button>
            </div>
          </form>
        )}

        {/* Offline skip */}
        {isOffline && !loading && (
          <button
            onClick={onChildSelected}
            style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-sky)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}
          >
            Continue without a profile (offline mode)
          </button>
        )}

      </div>
    </div>
  );
}
