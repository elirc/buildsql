## Hint 1
Two steps that have to happen in order: each category's average price, and then a count of that category's products above it. Six averages, six counts.

## Hint 2
Compute the averages once, in a derived table or CTE grouped by category. Selecting from that gives you six rows, and a correlated subquery over `products` can then reference `d.avg_price` as an ordinary column.

## Hint 3
The tempting one-liner - `FROM products p WHERE p.price > (SELECT avg(price) FROM products p2 WHERE p2.category = p.category)` grouped by category - gives the same answer and re-runs that aggregate once per product, for every product in the table. Correlating from the six-row side instead of the whole-table side is the whole trick.
