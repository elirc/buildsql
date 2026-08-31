// d13_implement_utilities / ex6 - rebuild Awaited<T> from scratch.
// See lessons/d13_implement_utilities/README.md, "ex6".
//
// One await unwraps one promise. This type has to keep unwrapping until
// there is no promise left - and pass everything else through untouched.

export type MyAwaited<T> = T;
