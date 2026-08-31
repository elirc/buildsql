// d13_implement_utilities / ex3 - rebuild Record<K, V> from scratch.
// See lessons/d13_implement_utilities/README.md, "ex3".
//
// An index signature accepts ANY string key. The real Record demands
// exactly the keys in K - no more, no fewer.

export type MyRecord<K extends PropertyKey, V> = { [key: string]: V };
