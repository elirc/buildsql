## Hint 1

Resolve first, judge second. Any check you perform on the raw segments can be
written around — `..%2f`, `....//`, a segment that is itself absolute. Once
`path.resolve()` has produced one normalised absolute path there is nothing left
to smuggle.

## Hint 2

The judgement is: is `target` the same as `base`, or below it? `path.relative(base,
target)` tells you in one call — an empty answer means "the same place", and an
answer that climbs starts with a `..` segment.

Note the word *segment*. `relative.startsWith("..")` is the tempting one-liner
and it is wrong: it also rejects `..config`, which is an ordinary directory
name. Split on `path.sep` and look at the first element.

## Hint 3

`path.resolve(base, "/etc/passwd")` is `/etc/passwd` — resolve discards
everything to the left of an absolute argument. That is not a bug to work
around; it is the reason the containment check goes **after** the resolve rather
than instead of it. What is left for you to decide is whether an absolute
segment should be rejected outright or simply allowed to fail the containment
test; the gate only cares about the answer, not the route.
