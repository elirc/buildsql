## Hint 1

Nothing here is new. It is ex2's projection, ex4's cursor, ex3's problem
document and one rule of your own, in one app. Build it in that order and test
each piece as you add it rather than writing all six routes and then debugging
the whole thing at once.

## Hint 2

Give yourself one `sendProblem(res, req, { title, status, detail, type? })`
helper and route **every** failure through it — the 404s, the 400s, the
conflict, and the unmatched route at the bottom. An API that answers
problem+json on one path and bare JSON on another breaks every client that
believed the first one.

The seed arrives through `deps`, and it should be copied rather than used: a
caller that keeps a reference to the array it passed in should not be able to
reach into your service and edit it. Copy the subtask arrays too, or the copy is
only one level deep.

## Hint 3

The business rule is the interesting status code. "This task cannot be done
while a subtask is open" is not a malformed request — the JSON was perfect and
the client did nothing wrong syntactically. It is the *state of the resource*
that refuses, and that is what 409 means.

Give that one a `type` URI of its own rather than leaving it `about:blank`. A
client that wants to say "close the subtasks first" has to recognise this
specific problem, and matching on the title with a regular expression breaks the
day somebody rewords it.

Left to you: whether `PATCH { status: "open" }` on a task with open subtasks
should also be checked. The gate does not ask, and the answer depends on whether
your rule is about the transition or about the state.
