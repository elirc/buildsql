## Hint 1

Give every position in a pattern a score, then compare two patterns position by
position and let the first difference decide. The comparison is over the
**longer** of the two, not the shorter — the interesting cases are the ones
where one pattern has run out.

## Hint 2

Four scores, and the surprising one is third:

- a literal segment — highest
- a `:param`
- **no segment at all** (the pattern has ended)
- a `*wildcard` — lowest

Putting "ended" above "wildcard" is what makes `/orders` beat `/orders/*rest`
while still losing to `/orders/:id`, which is exactly the behaviour you want and
very hard to get by comparing lengths separately.

Two more things the gate checks and a first attempt usually misses: `sort()`
mutates the array it is given, so map to a new array first; and it needs a
tie-break that returns `0`-equivalent ordering for equally specific patterns, or
the routing table quietly reorders itself.
