// d20_satisfies_asconst / ex1 - freeze a config object.
// See lessons/d20_satisfies_asconst/README.md, "ex1".
//
// The stub annotates the object, which widens every value and
// makes every member writable - the opposite of what is wanted.

export const RETRY: { attempts: number; backoffMs: number; jitter: boolean } = {
  attempts: 3,
  backoffMs: 250,
  jitter: false,
};
