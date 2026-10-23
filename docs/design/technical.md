# Technical design and licensing

[Design overview](../design.md) · [Art direction](art.md)

## Tech stack and deployment

Use a web stack built on TypeScript, not Godot, because the chess tools (rules, engine, puzzle data) are all JavaScript-friendly.

| Layer | Choice | Notes |
| --- | --- | --- |
| Build | Vite + TypeScript | Static output, instant reloads |
| Game screens | Phaser 4 | Region map, town and board all drawn on the canvas |
| Long text and settings | HTML overlay | Settings, dialogue logs and accessibility text sit on top of the canvas |
| Chess rules | chess.js (BSD) | Legal moves, FEN, game state |
| AI | Stockfish lite WASM, single-threaded | Runs in a Web Worker; the prototype's engine file is 1.8 MB |
| Enemy personalities | Choice among Stockfish's candidate moves | Picks within a centipawn window, so weak enemies make human-looking mistakes |
| Puzzles | Lichess puzzle database (CC0) | Pre-filter to tens of thousands, split into small JSON files at build time |
| Hosting | Cloudflare static assets, free tier | 25 MiB per-file limit |
| iOS | Capacitor | Wraps the same web build |
| Saves | Local storage first | Cloud sync later if needed |

**Why Phaser.** The region map and town are drawn on the canvas, not just the board, so a full game framework pays off: scenes for map, town and battle, asset loading, input, tweens, particles, camera shake and zoom, and sound. Phaser 4 is the current version (4.2.1 as of October 2026).

**Board scene behind one interface.** The game rules (`src/game`) contain no screen code. The battle scene talks to them through a small interface: show a position, animate a move, highlight squares, play a capture. If 3D is wanted later, only the battle scene's board is rebuilt.

**Three.js later, if 3D is worth it.** Deferred: the game is 2D for now (see [3D exploration](art.md#3d-exploration-deferred)). A 3D look could be "HD-2D" (the same 2D figurines in a lit 3D diorama with a moving camera) or full 3D models. Phaser keeps running the map and town; the battle board would be drawn by Three.js on a second canvas layered with Phaser's. Rules, menus and art carry over. Because the pieces are statues on bases, they need no skeletons or character animation; AI image-to-3D services can make the models.

**Why not Godot.** A slow export step, bridging to Stockfish yourself, a bigger web download, and every menu built in Godot's UI system.

## Licensing

Decided: the game is open source under GPL-3, so Stockfish ships with it.

| Asset | License | What it means for us |
| --- | --- | --- |
| Lichess puzzle database | CC0 (public domain) | Free to use and ship |
| chess.js | BSD-2 | Free to use, keep the notice |
| Stockfish | GPL-3 | Game source must be published under GPL-3 if we ship it |
| chessground (Lichess board UI) | GPL-3 | Same as Stockfish; or write our own board |
| Lichess site code (lila) | AGPL-3 | Don't copy code unless the game is AGPL too |
| Lichess Practice studies | Cleared for use (confirmed by the owner, 2026-10-22) | Their positions can be used in warm-ups, tip cards and the library. Lesson text is still our own, in the companion's voice, for consistency rather than licensing. Credit Lichess in the game's credits |
| Published courses (Steps Method, Bain, Silman, Polgar, Yusupov) | Copyrighted | Borrow the order of topics only, never their exercises or text |

- GPL apps can ship on the App Store: the official Lichess mobile app is GPL-3 and on the App Store.
- Every build ships Stockfish's license file; the prototype already does.
- Keep "Lichess" out of the game's name and branding. The canonical code repo is lichess-org/lila; the alexbarrett/lichess link looks like an old copy.
