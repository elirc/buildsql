## Hint 1

An aggregate over zero rows still produces one row. `count` answers 0 there; every other aggregate answers NULL, because there is nothing to add up or compare.

## Hint 2

Wrap the sum you want defaulted in `coalesce(..., 0)`. Note that this is a different query from `sum(coalesce(total, 0))`, which would still be NULL here.
