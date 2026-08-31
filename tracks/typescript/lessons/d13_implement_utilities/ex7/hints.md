## Hint 1

One mapped type cannot make *some* keys optional and leave others alone - the
modifier applies to every key it maps. So think in two pieces: the keys in `K`,
and everybody else.

## Hint 2

You have already built the two pieces in lesson 08: one utility keeps only the
named keys, another removes them, and `Partial` loosens whatever it is given.
Apply `Partial` to the `K` half only.

## Hint 3

Glue the two halves with `&`: take `Omit<T, K>` untouched, intersect it with a
`Partial` of `Pick<T, K>`. Left to you: convincing yourself the intersection
really behaves like one object type - try assigning `{ user: "ada" }` to
`PartialBy<Session, "token" | "expiresAt">` and reading `.token` from it.
