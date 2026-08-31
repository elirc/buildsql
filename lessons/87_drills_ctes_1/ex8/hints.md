## Hint 1

You cannot select a product name in the same query that computes the minimum average per category - a category has one minimum but many names. So compute the minimum separately and then find the rows that carry it.

## Hint 2

CTE one: `product_id`, `count(*)`, `round(avg(rating), 3)` from `reviews`. CTE two: that joined to `products` for `category`, `id`, `name`. CTE three: `SELECT category, min(avg_rating) FROM <two> GROUP BY category`.

## Hint 3

The final `JOIN` matches on both `category` and `avg_rating`, which is what lets two products tied on the same rounded average both come back.
