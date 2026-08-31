// d03_objects_shapes / ex6 - drop the optional members that are not there.
// See lessons/d03_objects_shapes/README.md, "ex6".
//
// The return type below promises less than the function delivers: every key it
// keeps has a real string behind it.

export interface TrackMeta {
  genre?: string;
  mood?: string;
  era?: string;
}

export function presentTags(meta: TrackMeta): Record<string, unknown> {
  throw new Error("ex6: presentTags() is not implemented yet - edit this file.");
}
