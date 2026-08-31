## Hint 1

Return `T[]`, take `readonly T[]` - which also rules out `splice`, since that
would modify the caller's array.

Then handle the empty list before any arithmetic: `x % 0` is `NaN`, and
`slice(NaN)` quietly returns the whole array.

## Hint 2

`-1 % 3` is `-1` in JavaScript, so a bare remainder gives you a negative offset.
`((by % len) + len) % len` lands in range for both directions and for values far
larger than the list.

Two slices and a spread finish it: everything from the offset on, then
everything before it.

Left to you: two slices, or `concat`. Same allocation count - pick the one that
reads as one sentence.
