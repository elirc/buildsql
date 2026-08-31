## Hint 1

A numeric enum compiles to an object with entries in *both* directions:
`Level.Info` is `20`, and `Level[20]` is `"Info"`. That reverse mapping is the
only reason this exercise wants an enum rather than a literal union.

A string enum does not get one. Neither does an `as const` object.

## Hint 2

`atLeast` is a plain `>=`, which works because the members are numbers in a
deliberate order.

`nameOf` is a single lookup: `Level[level]`.

Left to you: why the numbers are 10, 20, 30, 40 rather than 0, 1, 2, 3. There is
a real reason, and it is about the level somebody will want to add next year.
