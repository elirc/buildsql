## Hint 1

The first CTE never mentions `products`; it only needs `order_items`. The category arrives in the second step.

## Hint 2

`WITH per_product AS (SELECT product_id, sum(quantity) AS units FROM order_items GROUP BY product_id), per_category AS (SELECT p.category, sum(u.units) ... )` - the second CTE joins the first to `products` and groups again.
