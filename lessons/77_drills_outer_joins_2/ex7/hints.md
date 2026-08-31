## Hint 1
Every restriction in this prompt is about which sales count, not about which products you want, so none of them may reach `WHERE` except the two on `products` itself.

## Hint 2
Chain two outer joins, one carrying `oi.quantity = 5` and one carrying the order date, then split the total with `FILTER (WHERE o.status ...)`.

## Hint 3
Think about what happens to a product whose only quantity-5 line belongs to an October order: the line survives the first join, the order is NULL-extended by the second, and `o.status <> 'cancelled'` is then NULL - which is not true, so `FILTER` excludes it from both buckets. That is the behaviour the prompt describes, and the `coalesce` turns the resulting empty sums into zeros.
