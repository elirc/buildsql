## Hint 1

Write the return type first: an object type with three number members, spelled
out inline in the signature. Once it is there, the compiler names every place
your object is missing a key or has invented one.

## Hint 2

One pass is enough for all three numbers: carry `min`, `max` and `sum` as you
walk, then divide at the end. Seed `min` and `max` from `values[0]`, never from
`0` - a list of negatives would otherwise come back wrong.

The empty list has no minimum and no mean, so it needs its own early return
before you touch index 0.

Left to you: one pass with three accumulators, or three small helpers. The
first is faster, the second reads better - be able to say which you chose.
