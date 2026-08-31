## Hint 1

All three parts of an `OVER` clause at once: which rows belong together, in what order, and how far back to look.

## Hint 2

`avg(revenue) OVER (PARTITION BY status ORDER BY week ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)`. Frames never reach across a partition boundary, so each status warms up independently.
