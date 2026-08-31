// d13_implement_utilities / ex7 - Partial, but only for the keys you name.
// See lessons/d13_implement_utilities/README.md, "ex7".
//
// PartialBy<Session, "expiresAt"> should make expiresAt optional and leave
// user and token exactly as they were. Returning T loosens nothing.

export type PartialBy<T, K extends keyof T> = T;
