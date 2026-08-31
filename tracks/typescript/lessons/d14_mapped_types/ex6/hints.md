## Hint 1

A mapped type can iterate any union of names - `[P in K]` walks
`"audio" | "video"` directly, no `keyof` required. Then rename each `P` with
`as` on the way through.

## Hint 2

The new name is `` `has${Capitalize<P>}` `` - `Capitalize` raises just the
first letter, which is the difference between `hasAudio` and the `hasAUDIO`
that `Uppercase` would give you.
