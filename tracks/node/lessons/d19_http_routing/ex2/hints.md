## Hint 1

Split both sides into segments and walk them together with one index. Three
kinds of pattern segment — a literal, a `:param`, a `*wildcard` — and each one
either fails, or binds something and moves on.

## Hint 2

The two ends are where this goes wrong.

If the **path** runs out first, you are not automatically finished: it is a
match only if every pattern segment left is optional. If the **pattern** runs
out first, the path must have run out too, or `/orders/:id` matches
`/orders/42/lines` and every nested route becomes unreachable.

The wildcard is the exception to both — it consumes the rest, including nothing
at all, and returns immediately.

Decode the path segments once, at the top, rather than at each use. Doing it
per-branch is how the wildcard ends up as the only part that is still encoded.
