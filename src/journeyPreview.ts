import { COURSE_REGIONS } from './game/curriculum';
import { newJourney, type JourneySave } from './game/journey';

/** Preview shortcuts are explicitly disabled in the normal production build. */
export function requestedPreviewRegion(search: string, enabled: boolean): string | null {
  if (!enabled) return null;
  const value = new URLSearchParams(search).get('region');
  const id = value && /^[1-5]$/.test(value) ? `r${value}` : value;
  return COURSE_REGIONS.some(region => region.id === id) ? id : null;
}

export const previewRegion = requestedPreviewRegion(
  typeof location === 'undefined' ? '' : location.search,
  import.meta.env.DEV || import.meta.env.MODE === 'staging',
);

/** Only prerequisites are marked complete; the requested chapter still starts unsolved. */
export function preparePreviewSave(save: JourneySave, regionId: string): JourneySave {
  const index = COURSE_REGIONS.findIndex(region => region.id === regionId);
  if (index < 0) return save;
  const preview = newJourney(save.difficulty, save.starter);
  preview.completed = COURSE_REGIONS.slice(0, index).flatMap(region => region.lessons);
  preview.currentRegion = regionId;
  return preview;
}
