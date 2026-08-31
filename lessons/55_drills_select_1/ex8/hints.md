## Hint 1
`%` is the modulo operator and it works on `numeric`, not just integers.
Subtracting the remainder from the value is the classic way to round *down*
to a multiple of something.

## Hint 2
Compute the band as an expression inside the SELECT list, then let
`DISTINCT` de-duplicate the pairs. Do not compute it in a `WHERE` clause -
there is nothing to filter here.

## Hint 3
The two ideas stack in one direction only: expressions are evaluated for
every row first, and `DISTINCT` de-duplicates what comes out. So the answer
has at most one row per (category, band) pair even though thousands of
products feed each one. If you get thousands of rows back, check whether an
extra column - `id`, or `price` itself - crept into your SELECT list.
