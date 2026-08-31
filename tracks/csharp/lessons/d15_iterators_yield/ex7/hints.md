## Hint 1

Same manual-enumerator setup as ex6, different loop logic. Invariant: each
side's `Current` is its smallest unconsumed value (the inputs are sorted).
So while BOTH sides have items: yield the smaller `Current` and advance
ONLY that side. Afterwards, drain whichever side still has items.

## Hint 2

The comparison is `a.Current <= b.Current` - the `<=` keeps duplicates from
both sides and takes the left one first, which is what the gate's
"1, 2, 4, 4, 9, 30" expects.

## Hint 3

The skeleton is: two `using` enumerators, two `hasX = MoveNext()` primers, a
`while (hasA && hasB)` doing the compare-yield-advance, then two drain loops
(`while (hasA) { yield...; hasA = a.MoveNext(); }` and the same for B). Do
not ToList anything - the gate meters the pulls. What remains yours: getting
the advance-only-the-consumed-side detail right inside the main loop.
