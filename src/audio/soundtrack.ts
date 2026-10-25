/** Where the player is, for choosing music and ambience. */
export type SoundPlace = 'title' | 'setup' | 'map' | 'story' | 'interlude' | 'ending' | 'lesson' | 'review';

export interface Soundscape {
  music: string | null;
  bed: string | null;
  /** Occasional sounds scattered over the bed, so it never loops audibly. */
  spots: string[];
  /** Ambience sits further back while the player is thinking. */
  ambienceLevel: number;
  /** Music level within the music channel: thinking music sits lower than the map. */
  musicLevel: number;
}

const REGIONS = ['r1', 'r2', 'r3', 'r4', 'r5', 'finale'];
const SPOTS: Record<string, string[]> = {
  r1: ['spot-frog', 'spot-frogs', 'spot-plop', 'spot-heron'],
  r2: ['spot-hooves', 'spot-crow', 'spot-lark', 'spot-cart'],
  r3: ['spot-chime', 'spot-drip', 'spot-door'],
  r4: ['spot-flag', 'spot-drum', 'spot-armor', 'spot-horn'],
  r5: ['spot-owl', 'spot-bones', 'spot-gate', 'spot-crow'],
  finale: ['spot-toll', 'spot-gust', 'spot-ember'],
};

/** Music and ambience for a place in the journey. Unknown regions borrow the Bog's. */
export function soundscape(place: SoundPlace, regionId: string): Soundscape {
  const region = REGIONS.includes(regionId) ? regionId : 'r1';
  const home = { bed: 'bed-home', spots: [], ambienceLevel: 0.7 };
  switch (place) {
    case 'title':
    case 'setup': return { music: 'theme-main', musicLevel: 1, ...home };
    case 'ending': return { music: 'ending', musicLevel: 1, ...home };
    case 'interlude': return { music: 'map-finale', musicLevel: 0.85, bed: 'bed-finale', spots: SPOTS.finale, ambienceLevel: 0.8 };
    case 'story': return { music: 'story', musicLevel: 1, bed: `bed-${region}`, spots: [], ambienceLevel: 0.6 };
    case 'map': return { music: `map-${region}`, musicLevel: 0.9, bed: `bed-${region}`, spots: SPOTS[region], ambienceLevel: 1 };
    case 'lesson': return { music: `lesson-${region}`, musicLevel: 0.75, bed: `bed-${region}`, spots: SPOTS[region], ambienceLevel: 0.55 };
    case 'review': return { music: `review-${region}`, musicLevel: 0.8, bed: `bed-${region}`, spots: SPOTS[region], ambienceLevel: 0.5 };
  }
}

/** Seconds between scattered ambience sounds. */
export const SPOT_GAP = { min: 7, max: 19 };
/** Seconds of quiet after a track ends before it starts again. */
export const MUSIC_REST = 9;
