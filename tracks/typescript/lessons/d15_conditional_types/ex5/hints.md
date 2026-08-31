## Hint 1

`"ready" extends string` is true - the literal type is a subtype of its base
type. Answering `string` in that branch is the whole widening step.

## Hint 2

The final fallthrough is `T` itself, not `never` and not `unknown`: anything
that is not a primitive literal comes back exactly as it went in, and the gate
checks that with an object type.

Left to you: whether `boolean` needs its own branch at all, given that
`Widen<true>` distributes. Work out what `true extends boolean ? boolean : T`
gives you before deciding.
