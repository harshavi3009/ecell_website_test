"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// Full-page version of the PixelSwap "boxes" effect the owner asked for,
// without PixelSwap's own duplicate-content-tree approach (that would mean
// mounting a second copy of the entire page underneath every route, fighting
// the Core Committee page's GSAP ScrollTriggers, and being heavy on phones —
// see CLAUDE.md's phone-first rule). Instead: a light grid of flat-colour
// tiles is dropped over the page's background showing the *old* theme's
// colour, the real theme flips underneath (hidden behind the tiles), then
// the tiles dissolve away one by one to reveal the new theme already in
// place. Same visual idea, none of the duplicated content.
//
// This sits BEHIND everything else on the page (a negative z-index — see
// the "-z-10" class below), not on top of it: images, text and the nav bar
// all stay exactly where/how they are the whole time, and only the empty
// background around them visibly does the box effect. The nav bar in
// particular has its own explicit stacking order (see PillNav.tsx's
// "z-[1000]") and a solid, non-transparent black background, so it's never
// covered by this regardless — it stays black throughout.
//
// Mounted once by ThemeProvider, which calls play() via this ref right
// before it flips the theme.

export interface ThemeTransitionOverlayHandle {
  play: (fromColor: string) => void;
}

interface Tile {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
}

const TILE_SIZE = 96; // px — bigger, chunkier boxes
const MAX_TILES = 240; // keeps the grid light on phones with tall viewports
const TILE_DURATION_MS = 700; // each box's own fade/shrink, slowed down
const STAGGER_MS = 1100; // total spread of when boxes start, slowed down

// Every tile's delay is based on how far it sits from the centre of the
// grid, so the box in the middle goes first and each ring further out
// follows a little later — a ripple spreading outward, layer by layer,
// rather than a random scatter.
function buildTiles(viewportWidth: number, viewportHeight: number): Tile[] {
  let size = TILE_SIZE;
  let columns = Math.max(1, Math.ceil(viewportWidth / size));
  let rows = Math.max(1, Math.ceil(viewportHeight / size));

  if (columns * rows > MAX_TILES) {
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_TILES));
    columns = Math.max(1, Math.ceil(viewportWidth / size));
    rows = Math.max(1, Math.ceil(viewportHeight / size));
  }

  const centerCol = (columns - 1) / 2;
  const centerRow = (rows - 1) / 2;
  const maxDistance = Math.hypot(centerCol, centerRow) || 1;

  const tiles: Tile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const distance = Math.hypot(col - centerCol, row - centerRow);
      tiles.push({
        id: row * columns + col,
        left: col * size,
        top: row * size,
        size,
        delay: (distance / maxDistance) * STAGGER_MS,
      });
    }
  }
  return tiles;
}

const ThemeTransitionOverlay = forwardRef<ThemeTransitionOverlayHandle>(function ThemeTransitionOverlay(
  _props,
  ref,
) {
  const [tiles, setTiles] = useState<Tile[] | null>(null);
  const [color, setColor] = useState("#0a0a0a");
  const clearTimer = useRef<number | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    play(fromColor: string) {
      if (typeof window === "undefined") return;
      window.clearTimeout(clearTimer.current);
      setColor(fromColor);
      setTiles(buildTiles(window.innerWidth, window.innerHeight));
      clearTimer.current = window.setTimeout(
        () => setTiles(null),
        TILE_DURATION_MS + STAGGER_MS + 60,
      );
    },
  }));

  if (!tiles) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {tiles.map((tile) => (
        <span
          key={tile.id}
          className="absolute"
          style={{
            left: tile.left,
            top: tile.top,
            width: tile.size,
            height: tile.size,
            backgroundColor: color,
            animation: `theme-tile-dissolve ${TILE_DURATION_MS}ms ease-out ${tile.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
});

export default ThemeTransitionOverlay;
