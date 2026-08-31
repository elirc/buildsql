## Hint 1

Count the products per category first. The running total is a window over those six rows, not over the ten thousand product rows.

## Hint 2

`sum(products) OVER (ORDER BY products DESC, category)` - the `ORDER BY` inside `OVER` is what turns a total into a running total.
