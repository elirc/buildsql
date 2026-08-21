## Hint 1

One type parameter, not two: the elements go in and the same elements come out,
so there is nothing for a second one to describe. The key function is what
varies, and it always produces a string.

The behaviour to pin down before coding: which of two items with the same key
survives, and in what order the survivors come back.

## Hint 2

`Set` is generic too - `new Set<string>()` - and `has`/`add` are the two methods
you need. Walk the items once, compute each key, and skip anything whose key
you have already seen.

Keeping the *first* occurrence and preserving input order falls out naturally
from that loop. Any other rule needs deliberate extra work, which is a hint
about which rule to choose.

## Hint 3

Signature: `uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[]`.
Body: a `Set<string>` of seen keys, a `T[]` accumulator, one loop, push when
the key is new.

Left to you: what happens if the key function is expensive or has side effects.
Your loop calls it exactly once per item if you store the result - it is worth
checking that yours does.
