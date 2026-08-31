// d14_mapped_types / ex4 - rename the keys on the way through.
// See lessons/d14_mapped_types/README.md, "ex4".
//
// Every member should become a `<key>Changed` callback taking the old value
// type. This version builds the callbacks but forgets to rename anything.

export type Watchers<T> = { [K in keyof T]: (value: T[K]) => void };
