## Hint 1

The state is two variables in the closure: the value, and a version number the
ETag is built from. Every successful write moves the version, and every response
that carries the value carries the ETag that goes with it.

## Hint 2

The three answers to a PUT, in this order:

- no `If-Match` header at all → **428**, because the client never read
- an `If-Match` that is neither `*` nor the current ETag → **412**, and nothing
  changes
- otherwise → write, bump the version, answer with the **new** ETag

An ETag is a quoted string on the wire: the value is `"v1"` including the two
double quotes, and the `If-Match` header carries them too, so the comparison is
between two strings that both have quotes in them. `*` is the wildcard meaning
"whatever is there now".

Read the request body before you answer, even on the paths that reject it.
