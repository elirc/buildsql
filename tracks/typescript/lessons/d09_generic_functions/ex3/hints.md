## Hint 1

Add a third type parameter, `C`, and use it twice: as the combiner's return type
and as the element type of the result. It is never written by the caller -
inference reads it off the arrow they passed in.

## Hint 2

Loop to `Math.min(a.length, b.length)`, which is what "stops at the shorter
input" means, and push `combine(a[i], b[i])`.

Nothing in the body cares what `A`, `B` or `C` are, which is the sign the
signature is right.

Left to you: the index loop, or `a.slice(0, n).map((value, i) => combine(value, b[i]))`.
One of those allocates an extra array; both are defensible.
