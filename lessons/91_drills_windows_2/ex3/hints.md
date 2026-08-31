## Hint 1

The query is grouped by month, so by the time the window runs there are only thirteen rows. The denominator is the sum of those thirteen.

## Hint 2

`sum(sum(total)) OVER ()` - the inner `sum` is the month's revenue, the outer one totals the grouped rows. `sum(total) OVER ()` will be rejected, because `total` is not a grouped column.
