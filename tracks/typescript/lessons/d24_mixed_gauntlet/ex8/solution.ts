// d24_mixed_gauntlet / ex8 - the pipeline, typed all the way through.
// See lessons/d24_mixed_gauntlet/README.md, "ex8".
//
// The stub returns the input type unchanged and promises unknown,
// so the chain is neither walked nor run.

export type PipeResult<T, Fns extends readonly unknown[]> = T;

export function pipeAsync<T, Fns extends readonly ((arg: never) => unknown)[]>(
  input: T,
  ...fns: Fns
): Promise<unknown> {
  throw new Error("ex8: pipeAsync() is not implemented yet - edit this file.");
}
