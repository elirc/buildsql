## Hint 1

Two steps, and keeping them separate is most of the exercise: turn `?fields=`
into either "everything" or a validated list of field names, and then project a
task through that list. The same pair serves the single resource and the
collection, which is the point.

## Hint 2

The list of legal fields has to be a **whitelist you own**, not
`Object.keys(task)`. Deriving it from the object means the day somebody adds a
`passwordHash` to the record, `?fields=passwordHash` starts working.

Three cases the gate pins down: `id` is always in the answer even when it was
not asked for; asking for it explicitly must not produce it twice; and an
unknown name is a 400 that says *which* name, because a client that gets a
silent 200 with a missing key will wait for it forever.

An empty `?fields=` is a real request too. Decide what it means, and note that
"no fields at all" and "every field" are the only two answers that are not
absurd.
