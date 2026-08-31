## Hint 1

Without a `const` type parameter (d20 ex6), an array literal argument widens to
an array of a union and the positions are gone before the mapped type ever
runs.

## Hint 2

A mapped type over a tuple stays a tuple: `{ [K in keyof T]: ... }` applied to
`readonly [A, B]` gives `readonly [f<A>, f<B>]`. Add `-readonly` to hand the
caller a mutable tuple, which is what `Promise.all` actually resolves with.

## Hint 3

`Awaited<T[K]>` unwraps a promise and leaves a plain value alone, which is
exactly the rule the prompt describes for mixed inputs - and it handles nesting,
which `T[K] extends Promise<infer U> ? U : T[K]` does not.

Left to you: the body needs one assertion, because `Promise.all`'s own
signature cannot see through your mapped type. Decide where to put it and write
the comment that justifies it.
