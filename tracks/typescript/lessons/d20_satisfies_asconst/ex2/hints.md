## Hint 1

An array literal is inferred as an array. A const assertion on the same literal
makes it a readonly tuple - which is what the caller needs to destructure it
without an index check.

## Hint 2

Leave the return type off the function entirely and let it be inferred from the
returned expression. Writing `readonly [number, number]` by hand also works and
duplicates a fact the body already states.

Left to you: the empty case. The prompt says take what `Math.min` and
`Math.max` give you; a version that throws on an empty list is also defensible,
and is a different function.
