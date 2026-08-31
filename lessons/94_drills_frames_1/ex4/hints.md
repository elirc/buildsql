## Hint 1

Frames can point the other way. Swap which end is unbounded.

## Hint 2

`ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING`, with `sum(revenue)` for the money and `count(*)` for the number of months. Both use the same frame, so they stay consistent with each other.
