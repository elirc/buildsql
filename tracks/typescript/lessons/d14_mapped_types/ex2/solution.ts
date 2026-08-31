// d14_mapped_types / ex2 - readonly AND required, in one pass.
// See lessons/d14_mapped_types/README.md, "ex2".
//
// Half the job is done: this locks every member but faithfully preserves
// every question mark. Two modifiers can ride on one mapped type.

export type Locked<T> = { readonly [K in keyof T]: T[K] };
