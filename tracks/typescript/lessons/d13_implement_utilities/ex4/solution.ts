// d13_implement_utilities / ex4 - rebuild Parameters<F> from scratch.
// See lessons/d13_implement_utilities/README.md, "ex4".
//
// The argument tuple is sitting inside the function type. infer pulls it out;
// unknown[] is what not pulling it out looks like.

export type MyParameters<F extends (...args: any[]) => unknown> = unknown[];
