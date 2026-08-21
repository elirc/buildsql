## Hint 1

This is ex2 and ex3 wearing a different hat: a two-slot tuple return, and a
parameter that has to accept an array the caller has promised not to change.
Both annotations are missing or too narrow in the stub.

## Hint 2

A one-element input is the case people get wrong. `firstAndLast(["only"])`
returns the same string twice - there is no rule that says the two slots must
differ, and no reason to special-case it if you index correctly.

Reach for `values[values.length - 1]`, or `values.at(-1)` if you are happy to
deal with what `at` says it can return.

## Hint 3

Widen the parameter to `readonly string[]`, annotate the return as
`[first: string, last: string]`, and return an array literal with the two
lookups in it.

If you used `.at(-1)`, TypeScript hands you `string | undefined` and your
annotation will not accept it. Deciding what to do about that - switch to
bracket indexing, or handle the `undefined` - is the last decision, and lesson
04 is where the second option stops feeling like a chore.
