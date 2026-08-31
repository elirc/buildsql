## Hint 1

Two topics: mapped types (d14) and conditional types (d15). The value position
of a mapped type may be any type expression, including a conditional on `T[K]`.

## Hint 2

The runtime half has to agree with the type half exactly: `typeof entry ===
"number"` is the same question `T[K] extends number` asks, and if the two ever
disagree the type is a lie.

Left to you: whether `NaN` should convert. `typeof NaN` is `"number"`, so it
does - to the string `"NaN"`. Decide whether that is what you want before a
receipt says so.
