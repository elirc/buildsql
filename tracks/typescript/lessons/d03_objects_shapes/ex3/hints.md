## Hint 1

`readonly` on the `id` stops it being reassigned. `readonly` on `tracks` stops
the *property* being reassigned - which is not the same as stopping the array
from being pushed to. For that, the array's own type has to be readonly.

Read the two `@ts-expect-error` lines in the type gate: they tell you exactly
which two errors are expected.

## Hint 2

`readonly tracks: readonly string[]` is the double you need. Once it is there
the compiler will refuse `push`, so the body has to build a new array.

Two spreads do the whole job: one for the object, one for the array.

Left to you: `[...playlist.tracks, title]` or `playlist.tracks.concat(title)`.
Both make a new array - pick the one whose intent is obvious at a glance.
