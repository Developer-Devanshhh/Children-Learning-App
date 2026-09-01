/**
 * audioEngine — Howler.js wrapper for tracing sound effects
 *
 * Sounds used:
 *   draw       — a soft pencil/crayon scratching loop while the child is drawing
 *   waypoint   — a small "ding" chime when a waypoint is crossed
 *   strokeDone — a warm "thunk" when a stroke is lifted
 *   success    — a rising arpeggio fanfare on "amazing/great"
 *   encourage  — a gentle "you can do it" tone on "getting-there/together"
 *
 * We generate all sounds programmatically via the Web Audio API so there are
 * zero external file dependencies. Howler handles cross-browser unlock,
 * spatial audio support, and sprite management for us.
 *
 * Usage:
 *   import { audioEngine } from '@/modules/audio/audioEngine';
 *   audioEngine.playWaypoint();
 */

import { Howl, Howler } from 'howler';

// ── Web Audio tone generator ───────────────────────────────────────────────
// We build tiny PCM WAV buffers at runtime so we need zero audio files.

function noteToFreq(note: number): number {
  // MIDI note → Hz. Middle C (60) = 261.63 Hz
  return 440 * Math.pow(2, (note - 69) / 12);
}

type WaveType = 'sine' | 'triangle' | 'square' | 'sawtooth';

function buildToneWav(
  freqs: number[],
  durationSecs: number,
  waveType: WaveType = 'sine',
  attack = 0.02,
  release = 0.1,
  volume = 0.4,
): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSecs);
  const totalSamples = numSamples;
  const buf = new Float32Array(totalSamples);

  const freqsPerSeg = Math.max(1, Math.floor(totalSamples / freqs.length));

  for (let i = 0; i < totalSamples; i++) {
    const segIdx = Math.min(Math.floor(i / freqsPerSeg), freqs.length - 1);
    const freq = freqs[segIdx];
    const t = i / sampleRate;

    let sample = 0;
    if (waveType === 'sine') {
      sample = Math.sin(2 * Math.PI * freq * t);
    } else if (waveType === 'triangle') {
      const phase = (freq * t) % 1;
      sample = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
    } else if (waveType === 'square') {
      sample = Math.sin(2 * Math.PI * freq * t) >= 0 ? 1 : -1;
    } else {
      sample = 2 * ((freq * t) % 1) - 1;
    }

    // Envelope
    const env_attack = Math.min(i / (attack * sampleRate), 1);
    const env_release = Math.min((totalSamples - i) / (release * sampleRate), 1);
    buf[i] = sample * Math.min(env_attack, env_release) * volume;
  }

  // Build WAV
  const numBytes = totalSamples * 2;
  const wavBuf = new ArrayBuffer(44 + numBytes);
  const view = new DataView(wavBuf);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  function write16(offset: number, val: number) { view.setUint16(offset, val, true); }
  function write32(offset: number, val: number) { view.setUint32(offset, val, true); }

  writeStr(0, 'RIFF');
  write32(4, 36 + numBytes);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  write32(16, 16);           // chunk size
  write16(20, 1);            // PCM
  write16(22, 1);            // mono
  write32(24, sampleRate);
  write32(28, sampleRate * 2);
  write16(32, 2);            // block align
  write16(34, 16);           // bits per sample
  writeStr(36, 'data');
  write32(40, numBytes);

  for (let i = 0; i < totalSamples; i++) {
    const s = Math.max(-1, Math.min(1, buf[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const blob = new Blob([wavBuf], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// ── Note constants ─────────────────────────────────────────────────────────
const C4 = noteToFreq(60);
const D4 = noteToFreq(62);
const E4 = noteToFreq(64);
const G4 = noteToFreq(67);
const A4 = noteToFreq(69);
const C5 = noteToFreq(72);
const E5 = noteToFreq(76);
const G5 = noteToFreq(79);

// ── Build sound URLs (lazy, once) ──────────────────────────────────────────
let _waypointUrl:   string | null = null;
let _strokeDoneUrl: string | null = null;
let _successUrl:    string | null = null;
let _encourageUrl:  string | null = null;
let _drawTickUrl:   string | null = null;

function getWaypointUrl()   { return _waypointUrl   ??= buildToneWav([E5], 0.12, 'sine', 0.005, 0.08, 0.35); }
function getStrokeDoneUrl() { return _strokeDoneUrl ??= buildToneWav([G4, E4], 0.25, 'triangle', 0.01, 0.12, 0.25); }
function getSuccessUrl()    { return _successUrl    ??= buildToneWav([C4, E4, G4, C5, E5, G5, C5], 0.75, 'sine', 0.01, 0.15, 0.4); }
function getEncourageUrl()  { return _encourageUrl  ??= buildToneWav([E4, G4, A4, G4], 0.5, 'sine', 0.02, 0.15, 0.3); }
function getDrawTickUrl()   { return _drawTickUrl   ??= buildToneWav([D4], 0.04, 'triangle', 0.005, 0.03, 0.06); }

// ── AudioEngine class ──────────────────────────────────────────────────────
class AudioEngine {
  private enabled = true;
  private drawTickThrottle = 0;
  private readonly DRAW_TICK_INTERVAL_MS = 120;

  /** Globally enable/disable audio */
  setEnabled(val: boolean) {
    this.enabled = val;
    Howler.mute(!val);
  }

  /** Light "tick" while the pen moves — throttled so it isn't annoying */
  playDrawTick(now: number) {
    if (!this.enabled) return;
    if (now - this.drawTickThrottle < this.DRAW_TICK_INTERVAL_MS) return;
    this.drawTickThrottle = now;
    new Howl({ src: [getDrawTickUrl()], volume: 0.15, format: ['wav'] }).play();
  }

  /** Chime when a waypoint is crossed */
  playWaypointHit() {
    if (!this.enabled) return;
    new Howl({ src: [getWaypointUrl()], volume: 0.5, format: ['wav'] }).play();
  }

  /** Soft thunk when pen is lifted */
  playStrokeDone() {
    if (!this.enabled) return;
    new Howl({ src: [getStrokeDoneUrl()], volume: 0.4, format: ['wav'] }).play();
  }

  /** Rising fanfare for amazing/great result */
  playSuccess() {
    if (!this.enabled) return;
    new Howl({ src: [getSuccessUrl()], volume: 0.6, format: ['wav'] }).play();
  }

  /** Gentle encouragement for getting-there/together result */
  playEncourage() {
    if (!this.enabled) return;
    new Howl({ src: [getEncourageUrl()], volume: 0.5, format: ['wav'] }).play();
  }

  /** Play the right sound based on score band */
  playResultSound(band: 'amazing' | 'great' | 'getting-there' | 'together') {
    if (band === 'amazing' || band === 'great') {
      this.playSuccess();
    } else {
      this.playEncourage();
    }
  }
}

export const audioEngine = new AudioEngine();
