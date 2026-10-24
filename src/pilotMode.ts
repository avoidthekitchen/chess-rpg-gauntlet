/** Staging opens the pilot directly; local development opts in with a query. */
export const pilotEnabled = import.meta.env.MODE === 'staging' ||
  (import.meta.env.DEV && new URLSearchParams(location.search).get('ambush') === 'r2-two-at-once');
