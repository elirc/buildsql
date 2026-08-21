## Hint 1

As written, `keyof typeof ROUTES` is `string` - the annotation gave the object
an index signature, so every route name in the world typechecks and typos are
invisible. The gate checks that `ROUTES` has exactly two known keys and that
each `path` keeps its literal type.

Two operators fix it, and you have met both.

## Hint 2

`as const satisfies Record<string, { method: Method; path: string }>` does the
whole job: `as const` freezes the values and keeps them literal, and `satisfies`
still checks every entry against the shape - so a route with
`method: "PATCH"` is a compile error.

The annotation has to go: an annotation and a `satisfies` clause on the same
declaration means the annotation wins.

## Hint 3

Drop the `: Record<...>` annotation, append
`as const satisfies Record<string, { method: Method; path: string }>`, and
implement the function as a lookup returning `` `${route.method} ${route.path}` ``.

Left to you: whether to keep `Record<string, ...>` as the constraint or narrow
it further. Ask what you are protecting against - a bad `method`, a missing
`path`, or a misspelled route name - and note which of the three each spelling
catches.
