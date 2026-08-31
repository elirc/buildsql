## Hint 1

Write the steps as sentences first: which orders, what each line is worth, which category the line belongs to, and then the totals.

## Hint 2

Carry `customer_id` all the way through the chain. `count(DISTINCT customer_id)` cannot be assembled from per-product counts, so the customer must still be visible at the final grouping.

## Hint 3

`revenue_per_buyer` divides the raw `sum(line_revenue)` by the distinct buyer count and rounds once, at the end - dividing two already-rounded values gives a different number.
