## Hint 1

Group by both dimensions, then let the window put the country's total next to each of its four status rows.

## Hint 2

`sum(count(*)) OVER (PARTITION BY c.country)` is the country's order count. Multiply by `100.0`, not `100`, or integer division will round every share down to zero.
