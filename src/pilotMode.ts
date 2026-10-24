/** The original pilot stays available as a development-only reference. */
export const pilotEnabled = import.meta.env.DEV && new URLSearchParams(location.search).get('ambush') === 'r2-two-at-once';
export const legacyEnabled = import.meta.env.DEV && new URLSearchParams(location.search).get('legacy') === '1';
