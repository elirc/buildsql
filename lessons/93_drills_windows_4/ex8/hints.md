## Hint 1

Revenue per product first, from `order_items` alone - no join to `products` is needed for any of the output columns.

## Hint 2

`ntile(4) OVER (ORDER BY revenue DESC, product_id)` in a second CTE, then group by the quartile and use `sum(sum(revenue)) OVER ()` for the grand total.

## Hint 3

Products never ordered have no `order_items` rows, so they never enter the CTE and are not bucketed. That is what the prompt intends - do not add a `LEFT JOIN` from `products`.
