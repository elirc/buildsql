// d03_objects_shapes / ex1 - an object parameter with one optional member.
// See lessons/d03_objects_shapes/README.md, "ex1".
//
// `unknown` accepts every value ever written. Say what an explicit flag is.

export interface Track {
  title: string;
  artist: string;
  seconds: number;
  explicit?: unknown;
}

export function trackLine(track: Track): string {
  throw new Error("ex1: trackLine() is not implemented yet - edit this file.");
}
