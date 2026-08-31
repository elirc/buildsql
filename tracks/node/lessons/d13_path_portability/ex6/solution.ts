// d13_path_portability / ex6 - where a build puts the file it just read.
// See lessons/d13_path_portability/README.md, "Problem 6".

export interface OutputOptions {
  /** The tree the input file lives in. */
  srcRoot: string;
  /** The tree the output file belongs in. */
  outRoot: string;
  /** New extension, with or without its dot. Omitted means keep the old one. */
  ext?: string;
}

/**
 * The place under `outRoot` that mirrors `file`'s place under `srcRoot`, or
 * `null` when `file` is not strictly below `srcRoot`.
 */
export function outputPathFor(file: string, options: OutputOptions): string | null {
  throw new Error("ex6: outputPathFor() is not implemented yet - edit this file.");
}
