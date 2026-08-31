// d03_objects_shapes / ex2 - defaults that fire only for undefined.
// See lessons/d03_objects_shapes/README.md, "ex2".

export interface AlbumInput {
  title: string;
  year?: unknown;
  label?: unknown;
}

export function describeAlbum(input: AlbumInput): string {
  throw new Error("ex2: describeAlbum() is not implemented yet - edit this file.");
}
