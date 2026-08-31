## Hint 1

Both the part and the whole are aggregates over the same scan, so the percentage is one expression built from two aggregate calls - no subquery, no second pass over the table.

## Hint 2

Round only at the very end of each column. Rounding the numerator and the denominator first and then dividing gives a subtly different answer.
