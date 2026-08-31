// d03_objects_shapes / ex1 - reference solution (author only).

export interface Track {
  title: string;
  artist: string;
  seconds: number;
  explicit?: boolean;
}

export function trackLine(track: Track): string {
  const suffix = track.explicit === true ? " [E]" : "";
  return `${track.title} - ${track.artist} (${track.seconds}s)${suffix}`;
}
