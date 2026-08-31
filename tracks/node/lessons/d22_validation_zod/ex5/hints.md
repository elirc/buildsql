## Hint 1

The same object shape, three times, differing only by one call: nothing (the
default), `.strict()`, and `.passthrough()`. Build the shape once and derive the
three schemas from it, or the exercise becomes a copy-paste question.

## Hint 2

The interesting half is the 400. A strict schema reports one issue with
`code: "unrecognized_keys"`, and that issue carries a `keys` array naming what
it refused — which is what turns "your request was wrong" into "you spelled
`colour` and I expected nothing of the sort".

Narrow on the code before you reach for `keys`: on a `ZodIssue` union, `keys`
only exists on that one member, and a schema can fail for perfectly ordinary
reasons too. The gate posts a body that is simply missing a field to check you
kept the two apart.
