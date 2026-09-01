/**
 * LetterSelector — home screen with Alphabets / Numbers tabs
 *
 * Two tab pages:
 *   A–Z  — uppercase letters (26 cards)
 *   0–9  — digits (10 cards)
 *
 * Each tab shows a scrollable grid of tactile letter cards.
 * Tabs have a sliding indicator underline animation.
 */

import { useState } from 'react';
import { GRAPHEMES } from '@/data/letter-corpus/graphemes';
import { Lyra } from '@/modules/04-attention-agent/Lyra';

interface LetterSelectorProps {
  onSelect: (id: string) => void;
}

type Tab = 'letters' | 'numbers';

const LETTERS = GRAPHEMES.filter(g => /^[A-Z]$/.test(g.id));
const NUMBERS  = GRAPHEMES.filter(g => /^[0-9]$/.test(g.id));

export function LetterSelector({ onSelect }: LetterSelectorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('letters');
  const items = activeTab === 'letters' ? LETTERS : NUMBERS;

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto px-4 pt-5 pb-10 animate-fade-in" style={{ minHeight: '100dvh' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Lyra size={60} />
        <div>
          <h1 className="text-3xl" style={{ color: 'var(--color-ink)', lineHeight: 1.1 }}>
            LyraLearn
          </h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.85rem', marginTop: 2 }}>
            Pick something to practise
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex rounded-2xl p-1 mb-5 flex-shrink-0"
        style={{ background: 'hsl(225 15% 92%)' }}
        role="tablist"
      >
        {(['letters', 'numbers'] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'letters' ? 'A – Z' : '0 – 9';
          const desc  = tab === 'letters' ? 'Alphabets' : 'Numbers';
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-xl py-2 flex flex-col items-center gap-0.5 transition-all active:scale-97"
              style={{
                background: isActive ? 'var(--color-surface)' : 'transparent',
                color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.85rem',
                boxShadow: isActive ? '0 2px 10px hsl(225 25% 18% / 0.08)' : 'none',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.01em' }}>{label}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{desc}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        className="grid gap-3 flex-1"
        style={{
          gridTemplateColumns: activeTab === 'letters' ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)',
          alignContent: 'start',
          overflowY: 'auto',
        }}
        role="tabpanel"
      >
        {items.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            aria-label={`Practise ${g.id}`}
            style={{
              aspectRatio: '1 / 1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'var(--color-surface)',
              border: `2.5px solid ${g.color}`,
              borderRadius: 16,
              boxShadow: `0 3px 12px ${g.color}33`,
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.92)'; }}
            onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <span
              style={{
                fontSize: activeTab === 'numbers' ? '1.9rem' : '1.7rem',
                fontWeight: 900,
                color: g.color,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {g.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
