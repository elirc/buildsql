## Hint 1

`Partial<T>` makes every member optional, which is exactly what a patch is: some
members, maybe none.

The gate checks with `in`, so an unchanged member has to be **absent** rather
than present holding `undefined`.

## Hint 2

Start from `{}` and write only the members that differ. Comparing with `!==`
means `false` counts as a change when the old value was `true`.

Assigning through a `keyof Posting` variable does not typecheck on its own -
TypeScript cannot line up the key and the value when the key is a union of
several at once - so one narrow cast at the assignment is the accepted answer.

Left to you: the loop with a cast, or four explicit `if`s with no cast at all.
The second is longer, needs editing when the interface grows, and is completely
honest.
