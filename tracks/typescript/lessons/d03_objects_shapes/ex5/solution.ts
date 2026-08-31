// d03_objects_shapes / ex5 - an index signature over object values.
// See lessons/d03_objects_shapes/README.md, "ex5".

export interface PlayedTrack {
  artist: string;
  seconds: number;
}

export interface ArtistTotals {
  [artist: string]: unknown;
}

export function byArtist(tracks: readonly PlayedTrack[]): ArtistTotals {
  throw new Error("ex5: byArtist() is not implemented yet - edit this file.");
}
