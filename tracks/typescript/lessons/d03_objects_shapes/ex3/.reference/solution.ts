// d03_objects_shapes / ex3 - reference solution (author only).

export interface Playlist {
  readonly id: string;
  name: string;
  readonly tracks: readonly string[];
}

export function addTrack(playlist: Playlist, title: string): Playlist {
  return { ...playlist, tracks: [...playlist.tracks, title] };
}
