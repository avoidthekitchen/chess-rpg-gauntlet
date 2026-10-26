import { describe, expect, it } from 'vitest';
import { COURSE_LESSONS, COURSE_REGIONS } from '../game/curriculum';
import { companionReaction, courseIntro, courseMoveSpeaker } from '../ui/coursePresentation';
import manifest from './audioManifest.json';
import { SFX_NAMES } from './engine';
import { DEFAULT_AUDIO, parseAudioSettings, sliderGain } from './settings';
import { soundscape, type SoundPlace } from './soundtrack';
import { pieceVoice, storyVoice, voiceKey } from './voiceRoles';
import { voiceScript } from './voiceScript';
import type { Move } from 'chess.js';

import cast from '../../audio/voices.json';

// Paths of every shipped audio file (relative to public/audio), and the game's own source.
const shipped = new Set(Object.keys(import.meta.glob('../../public/audio/**/*.mp3')).map((p) => p.replace('../../public/audio/', '')));
const has = (role: string | undefined, line: string) => !!role && (manifest.voices as Record<string, string[]>)[role]?.includes(voiceKey(role, line));

describe('audio settings', () => {
  it('falls back to defaults for missing or malformed saves', () => {
    expect(parseAudioSettings(null)).toEqual(DEFAULT_AUDIO);
    expect(parseAudioSettings('not json')).toEqual(DEFAULT_AUDIO);
    expect(parseAudioSettings('[1,2]')).toEqual(DEFAULT_AUDIO);
  });

  it('keeps saved levels within 0 to 1 and ignores wrong types', () => {
    expect(parseAudioSettings(JSON.stringify({ muted: true, music: 2, ambience: -1, effects: '0.5', voices: 0.25 })))
      .toEqual({ muted: true, music: 1, ambience: 0, effects: DEFAULT_AUDIO.effects, voices: 0.25 });
  });

  it('maps slider positions to gain on a curve that ends at silence and full', () => {
    expect(sliderGain(0)).toBe(0);
    expect(sliderGain(1)).toBe(1);
    expect(sliderGain(0.5)).toBeLessThan(0.5);
  });
});

describe('soundscapes', () => {
  const places: SoundPlace[] = ['title', 'setup', 'map', 'story', 'interlude', 'ending', 'lesson', 'review'];

  it('name only music and ambience that ship, in every chapter', () => {
    for (const place of places) for (const region of COURSE_REGIONS) {
      const s = soundscape(place, region.id);
      if (s.music) expect(manifest.music, `${place} ${region.id}`).toContain(s.music);
      if (s.bed) expect(manifest.beds, `${place} ${region.id}`).toContain(s.bed);
      for (const spot of s.spots) expect(manifest.spots).toContain(spot);
    }
  });

  it('gives each chapter its own map, lesson and review music', () => {
    const ids = (place: SoundPlace) => new Set(COURSE_REGIONS.map((r) => soundscape(place, r.id).music));
    for (const place of ['map', 'lesson', 'review'] as const) expect(ids(place).size).toBe(COURSE_REGIONS.length);
  });

  it('keeps thinking music and ambience below the map', () => {
    const map = soundscape('map', 'r1'), lesson = soundscape('lesson', 'r1');
    expect(lesson.musicLevel).toBeLessThan(map.musicLevel);
    expect(lesson.ambienceLevel).toBeLessThan(map.ambienceLevel);
  });

  it('falls back to the Bog for an unknown chapter', () => {
    expect(soundscape('map', 'r9').music).toBe('map-r1');
  });
});

describe('voices', () => {
  const script = voiceScript();

  it('casts every role in the script', () => {
    for (const { role } of script) expect(cast.roles, role).toHaveProperty(role);
  });

  it('has a recording of every scripted line, and none for lines that no longer exist', () => {
    const missing = script.filter(({ role, line }) => !has(role, line)).map(({ role, line }) => `${role}: ${line}`);
    expect(missing, 'Re-record with scripts/audio/generate-voices.mjs, then process-audio.mjs voices').toEqual([]);
    const scripted = new Set(script.map(({ role, line }) => `${role}/${voiceKey(role, line)}`));
    const recorded = Object.entries(manifest.voices).flatMap(([role, keys]) => keys.map((k) => `${role}/${k}`));
    expect(recorded.filter((k) => !scripted.has(k))).toEqual([]);
  });

  it('voices the lines the lesson screen actually shows', () => {
    for (const lesson of COURSE_LESSONS) for (const starter of ['n', 'b', 'r'] as const) {
      for (const info of courseIntro(lesson, starter)) expect(has(info.voice, info.line), `${lesson.id} ${info.name}`).toBe(true);
    }
    for (const starter of ['n', 'b', 'r'] as const) for (const event of ['win', 'miss', 'wave'] as const) {
      const info = companionReaction(starter, event);
      expect(has(info.voice, info.line)).toBe(true);
    }
    for (const region of COURSE_REGIONS) for (const piece of ['p', 'n', 'b', 'r', 'q', 'k'] as const) {
      const info = courseMoveSpeaker({ color: 'b', piece } as Move, 'w', [], region.id);
      expect(has(info.voice, info.line), `${region.id} ${piece}`).toBe(true);
    }
  });

  it('keeps the player\'s own king silent and gives bosses their king piece', () => {
    expect(pieceVoice('ally', 'k', 'r1')).toBeUndefined();
    expect(pieceVoice('foe', 'k', 'r1')).toBe('grubnak');
    expect(pieceVoice('foe', 'k', 'finale')).toBe('lich');
    expect(pieceVoice('foe', 'p', 'unknown')).toBe('r2-p');
    expect(storyVoice('Sir Hob', 'n')).toBe('hob');
    expect(storyVoice('Sir Hob', 'b')).toBeUndefined();
    expect(storyVoice('The Lich King', 'r')).toBe('lich');
  });

  it('keys recordings by role and exact text', () => {
    expect(voiceKey('hob', 'Hop to it!')).toBe(voiceKey('hob', 'Hop to it!'));
    expect(voiceKey('hob', 'Hop to it!')).not.toBe(voiceKey('hob', 'Hop to it.'));
    expect(voiceKey('hob', 'Hop to it!')).not.toBe(voiceKey('ollie', 'Hop to it!'));
  });
});

describe('shipped audio', () => {
  it('ships every effect the game can play, and only those', () => {
    expect(Object.keys(manifest.sfx).sort()).toEqual([...SFX_NAMES].sort());
  });

  it('ships exactly the files in the manifest: none missing, none orphaned', () => {
    const expected = [
      ...manifest.music.map((id) => `music/${id}.mp3`),
      ...[...manifest.beds, ...manifest.spots].map((id) => `ambience/${id}.mp3`),
      ...Object.entries(manifest.sfx).flatMap(([name, n]) => Array.from({ length: n }, (_, i) => `sfx/${name}-${i + 1}.mp3`)),
      ...Object.entries(manifest.voices).flatMap(([role, keys]) => keys.map((k) => `voice/${role}/${k}.mp3`)),
    ];
    expect([...shipped].sort()).toEqual(expected.sort());
  });
});
