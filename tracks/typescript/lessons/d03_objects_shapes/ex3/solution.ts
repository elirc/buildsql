// d03_objects_shapes / ex3 - readonly members, and a copy on every change.
// See lessons/d03_objects_shapes/README.md, "ex3".
//
// Two `readonly` modifiers are missing below. Find them, then never mutate.

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
}

export function addTrack(playlist: Playlist, title: string): Playlist {
  throw new Error("ex3: addTrack() is not implemented yet - edit this file.");
}
