## Hint 1

Two different populations in one row: all customers of the country, and the
subset of them with a paid order. The second is a conditional count, but of
customers - not of orders.

## Hint 2

A `LEFT JOIN` from `customers` to `orders` multiplies each customer by their
order count, so a plain `count(*)` is wrong for both columns. Either count
distinct customer ids, or reduce `orders` to one row per paying customer in a
CTE first and then join that.

## Hint 3

With the CTE version the outer query is ordinary: `count(*)` for customers,
`count(p.customer_id)` for the ones that matched (`count` of a column skips
NULLs), and the ratio built from those two with a `100.0` numerator.
