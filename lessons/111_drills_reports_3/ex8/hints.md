## Hint 1

"Bought together" means two lines of the same order landing in two different categories - a self-join of order_items on order_id, with each side joined to products for its category.

## Hint 2

The pair must be unordered and counted once: category-a < category-b (the same dedupe trick as tag pairs and teammate pairs). And an order with three books and two toys is still ONE books-toys basket - count DISTINCT order_id, not join rows.

## Hint 3

The cleaner shape reduces first: a CTE of DISTINCT (order_id, category) pairs, self-joined with a.category < b.category, then a plain count(*) - the distinct work happens once instead of inside the aggregate. Fifteen possible pairs, all present; ordered by orders DESC with the pair as tie-break.
