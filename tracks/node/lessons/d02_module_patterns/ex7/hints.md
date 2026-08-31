## Hint 1

Three collections: the registered factories, the built instances, and — the one
people forget — the **stack of names currently being built**. The first two give
you singleton behaviour; the third is the only way to notice a loop before the
call stack does.

`resolve` in order: cache hit? registered? already on the stack? then build.

## Hint 2

The message has to be a path, so the stack has to be an array you can join, not
a `Set`. When you find `name` already on it, slice from its first occurrence to
the end and append `name` again — that is what turns `["left","right"]` plus
`"left"` into `left -> right -> left`.

## Hint 3

The last assertion is the one that separates a working container from a
plausible one: after the cycle throws, `resolve("db")` still has to work.

That means the push and the pop must be balanced *even when the factory
throws*, which is a `try`/`finally` — and it means the pop belongs in the
`finally`, not after the successful return. What you cache on the failure path
is a separate decision, and worth being deliberate about.
