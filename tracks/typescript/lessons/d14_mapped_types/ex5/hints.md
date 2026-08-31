## Hint 1

Deleting a member is done in the key position: remap the key to `never` and the
member vanishes. The decision - keep or drop - is a conditional on `T[K]`.

## Hint 2

`[K in keyof T as T[K] extends V ? K : never]: T[K]`. Put the conditional in
the key position, not the value position - the wrong spot keeps every key and
turns the losers into `never` values instead of removing them.
