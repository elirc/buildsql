## Hint 1

One loop over the three part names, each with its own optional schema. Collect
issues as you go and only decide at the end whether to answer or call `next()` —
returning inside the loop is what makes a client fix `params`, then discover
`query` was wrong too, then discover `body` was.

## Hint 2

Two details carry the exercise.

The **paths** have to say which part they came from: prefix zod's own
`issue.path.join(".")` with the part name, so the client gets `body.title` and
`query.limit` rather than two things both called `title`. An issue whose path is
empty (an object-level rule) is just the part name.

The **destination** is not `req.query`. In express 5 that is a getter and
assigning to it throws a `TypeError`, which your handler will see as a 500 with
a confusing stack. Put the parsed values somewhere new — `req.valid` — and read
them there.
