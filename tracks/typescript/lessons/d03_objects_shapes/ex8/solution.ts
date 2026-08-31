// d03_objects_shapes / ex8 - diff two open records.
// See lessons/d03_objects_shapes/README.md, "ex8".
//
// The return type below says "some string arrays". Name the three.

export interface MetaRecord {
  [key: string]: string | number;
}

export function diffMeta(before: MetaRecord, after: MetaRecord): Record<string, string[]> {
  throw new Error("ex8: diffMeta() is not implemented yet - edit this file.");
}
