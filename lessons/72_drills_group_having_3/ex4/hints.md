## Hint 1

`WHERE rating = 5` first, so that `count(*)` counts only five-star reviews; then a `HAVING` threshold on that count.

## Hint 2

`ORDER BY` can use the output alias or repeat the aggregate - both work here. What it cannot do is leave the tie-break out.
