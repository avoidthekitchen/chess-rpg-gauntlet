# Pawnshire alpha archive

Play the frozen original at https://unformedideas.com/alpha-chess-rpg/.
The current game lives at https://unformedideas.com/chess-rpg/.

This preserves the original RPG's UX, art, presentation, battles, town, and army systems.
Its source baseline is `95786fe5f21f21d080be3655f612a38a7c42d4e8`, tagged `pawnshire-original-live-2026-10-24`.
That baseline rebuilds the original live JavaScript byte for byte.
Original Cloudflare version: `103297be-5973-497f-9c12-67c806b85b20`.

The archive changes only storage isolation, deployment paths, and accompanying tests and documentation.
Every browser storage key is prefixed with `pawnshire-alpha:`.
Archive play and reset cannot overwrite the original campaign, current journey, staging journey, or shared piece preferences.
Existing progress is not imported automatically.

## Rebuild

Check out tag `pawnshire-alpha-2026-10-24` in a separate checkout, then run:

```sh
npm ci
npm run ci
npm run deploy
```

This tag's deployment targets Worker `chess-rpg-alpha` and only the `/alpha-chess-rpg` routes, including `www`.
The current game's deployments use a separate Worker.
Do not merge new game changes into this frozen archive.

The GitHub release retains the unmodified original build, isolated archive build, and SHA-256 manifests.
Generated builds remain outside Git.
