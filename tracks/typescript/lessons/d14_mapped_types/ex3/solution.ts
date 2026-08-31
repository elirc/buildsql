// d14_mapped_types / ex3 - wrap every value in a box.
// See lessons/d14_mapped_types/README.md, "ex3".
//
// Each member should become { value: <what it was> }. This map copies
// the value through unboxed.

export type Boxed<T> = { [K in keyof T]: T[K] };
