// d03_objects_shapes / ex5 - reference solution (author only).

export interface PlayedTrack {
  artist: string;
  seconds: number;
}

export interface ArtistTotals {
  [artist: string]: { count: number; seconds: number };
}

export function byArtist(tracks: readonly PlayedTrack[]): ArtistTotals {
  const totals: ArtistTotals = {};
  for (const track of tracks) {
    const entry = (totals[track.artist] ??= { count: 0, seconds: 0 });
    entry.count += 1;
    entry.seconds += track.seconds;
  }
  return totals;
}
