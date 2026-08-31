## Hint 1
The grain of the answer is the category, but the measures live on the line (`quantity`, `price`) and the filter lives on the order (`created_at`). All three tables have to be in the query even though only one of them supplies the grouping column.

## Hint 2
Join the three tables first, then `GROUP BY p.category`. Revenue for a line is `quantity * price` on `order_items` - the line remembers the price it was sold at, so do not reach for `products.price`.
