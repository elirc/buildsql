## Hint 1

`as` and `satisfies` look similar in the source and do opposite things. One
says "treat this as a `Settings`"; the other says "check that this *is* a
`Settings`, and carry on knowing what it really is".

## Hint 2

Note which fields keep their literal types and which do not. `mode` keeps
`"strict"` because the target wanted a union of literals there; `retries` widens
to `number` because that is what the target asked for. `satisfies` preserves as
much as the target allows, not everything.

Left to you: whether `as const satisfies Settings` would be better here. It
changes one of the gate's assertions - work out which before you try it.
