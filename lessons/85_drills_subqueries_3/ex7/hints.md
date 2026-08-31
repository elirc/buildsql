## Hint 1

Build one row per customer first - country, customer id, order count - and give that result a name. Every later question is asked of those rows, not of `orders`.

## Hint 2

With that CTE in place, group it by `country` for `buyers` and `avg_orders`, and add a scalar subquery that counts the CTE's rows for the same country whose `orders` exceed a second, nested subquery computing that country's average.

## Hint 3

The nested comparison must use the raw average, not the rounded `avg_orders` column - and the inner subquery correlates on the outer group's `country`, so it is evaluated once per country rather than once per customer.
