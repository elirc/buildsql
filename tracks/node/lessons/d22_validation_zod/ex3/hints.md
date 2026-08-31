## Hint 1

A rule that reads two fields cannot live on either of them, so it goes on the
object: `.superRefine((value, ctx) => { ... })` runs after the fields have been
parsed and gets the whole value.

`.refine()` is the shorter form and it can only add one issue. Two independent
rules want `.superRefine`, which can call `ctx.addIssue` as many times as it
likes.

## Hint 2

`ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...], message })` — the
`path` is the part everybody forgets. Leave it out and the issue attaches to the
object itself, arriving at the client with an empty path and nowhere to be
displayed.

For "end after start" the path is obvious. For "email or phone" it is a choice:
neither field is wrong on its own, so pick one deliberately and say why in a
comment. Note also that `superRefine` still runs when a field underneath it has
already failed — which is what lets a bad `seats` and both cross-field problems
come back in one response instead of three.
