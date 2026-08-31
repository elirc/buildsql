## Hint 1

`z.discriminatedUnion("type", [...])` takes the name of the tag and a list of
object schemas, each of which pins that tag with `z.literal(...)`. Zod reads the
tag first, picks the one branch it names, and judges the body against that
branch alone.

## Hint 2

The two failures you have to tell apart both arrive as issues, and the `code`
is what separates them:

- `invalid_union_discriminator` — the tag matched no branch. Nothing was even
  attempted, and the useful answer names the field that decides.
- anything else — the tag was fine and the branch it chose was not satisfied.
  The paths point at the branch's own fields.

A plain `z.union()` would have tried all three and handed you every branch's
complaints at once, which is why the response could not tell the client
anything useful. That is the whole reason the discriminated form exists.
