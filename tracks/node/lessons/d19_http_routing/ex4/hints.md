## Hint 1

Walk the pattern's segments and build a list of output segments. A literal
passes through, a `:param` is replaced by its encoded value, and a `*wildcard`
expands into several. Join with `/` at the end rather than concatenating as you
go, and the leading slash takes care of itself.

## Hint 2

`encodeURIComponent` on every value, and *not* on the separators — that is the
whole difference between a param (one segment, so encode all of it, and a `/`
inside it becomes `%2F`) and a wildcard (many segments, so encode each one and
keep the slashes between them).

An optional segment with no value is skipped entirely. The version that emits an
empty string leaves you with `/orders/7/lines/`, and the version that does not
check leaves you with the literal text `undefined` in a URL, which is a bug
report that takes a surprisingly long time to read.

Sort the query keys before you join, or the same link comes out differently
depending on how the object was built. And the error for a missing required
parameter has to contain its name — that message is the only thing the person
debugging will see.
