/** Coordinates for a single ordered trail. A taller phone map keeps every stop readable. */
export function journeyTrail(count: number) {
  if (!Number.isInteger(count) || count < 1) throw new Error('A chapter needs at least one encounter.');
  const desktop = Array.from({ length: count }, (_, i) => [
    count === 1 ? 50 : 12 + i * 76 / (count - 1),
    i === count - 1 ? 20 : i % 2 ? 66 : 30,
  ]);
  const phoneHeight = Math.max(430, count * 140 + 120);
  const phone = Array.from({ length: count }, (_, i) => [
    count === 1 ? 50 : i % 2 ? 70 : 30,
    (52 + i * 140) / (phoneHeight - 44) * 100,
  ]);
  return { desktop, phone, phoneHeight };
}

export const journeyRoute = (points: number[][]) =>
  points.map(([x, y]) => `${x * 10},${y * 10}`).join(' ');
