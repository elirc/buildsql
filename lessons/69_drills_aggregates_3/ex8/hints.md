## Hint 1

After the outer join, a customer with no orders still contributes one row, with every `orders` column NULL. That is why `count(*)` would over-count orders and `count(DISTINCT c.id)` is the only trustworthy customer count.

## Hint 2

`count(o.id)` counts only the rows that matched, which is exactly the number of orders. The gap between `customers` and `buyers` is the population that never bought.
