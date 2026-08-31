## Hint 1

Narrowing asks *what type is this*. Coercion asks *what number could this
become*. The prompt wants the first: a numeric-looking string is still a string
and contributes nothing.

## Hint 2

One accumulator, one loop, one `typeof value === "number"` guard. Seed the
accumulator at `0` so the empty input needs no special case.

Left to you: the loop, or a `filter` followed by `reduce`. In TypeScript 5.5 and
later the `filter` version can infer the narrowing for you - say whether you
would rely on that.
