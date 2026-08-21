// 03_objects_interfaces / ex4 - optional in, required out.
// See lessons/03_objects_interfaces/README.md, "Exercise 4".
//
// RunOptions is finished. ResolvedOptions is not, and resolveOptions() has to
// turn one into the other.

export interface RunOptions {
  retries?: number;
  verbose?: boolean;
  label?: string;
}

export interface ResolvedOptions {
  retries: number;
}

export function resolveOptions(options: RunOptions): ResolvedOptions {
  throw new Error("ex4: resolveOptions() is not implemented yet - edit this file.");
}
