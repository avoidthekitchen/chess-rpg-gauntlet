/** Player sound preferences, saved on this device. Levels run from 0 to 1. */
export interface AudioSettings {
  muted: boolean;
  music: number;
  ambience: number;
  effects: number;
  voices: number;
}
export type AudioChannel = Exclude<keyof AudioSettings, 'muted'>;
export const AUDIO_CHANNELS: AudioChannel[] = ['music', 'ambience', 'effects', 'voices'];

export const AUDIO_KEY = 'pawnshire-audio';
/** Defaults from docs/design/systems.md#tuning-values. */
export const DEFAULT_AUDIO: AudioSettings = { muted: false, music: 0.6, ambience: 0.5, effects: 0.8, voices: 0.9 };

const level = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback);

/** Reads saved settings, falling back to defaults for anything missing or malformed. */
export function parseAudioSettings(raw: string | null): AudioSettings {
  let saved: Partial<Record<keyof AudioSettings, unknown>> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object') saved = parsed as typeof saved;
  } catch { /* defaults */ }
  return {
    muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULT_AUDIO.muted,
    music: level(saved.music, DEFAULT_AUDIO.music),
    ambience: level(saved.ambience, DEFAULT_AUDIO.ambience),
    effects: level(saved.effects, DEFAULT_AUDIO.effects),
    voices: level(saved.voices, DEFAULT_AUDIO.voices),
  };
}

/**
 * Slider position to gain. Ears hear loudness logarithmically, so a squared curve
 * makes the middle of the slider sound like the middle.
 */
export const sliderGain = (v: number) => v * v;
