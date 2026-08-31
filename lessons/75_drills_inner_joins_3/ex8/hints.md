## Hint 1
Two measures here come from the sales path (buyers, units) and one comes from a completely different branch (reviews). Ask yourself what one row of the joined result would look like before you total anything.

## Hint 2
If you join sales and reviews in the same `FROM`, each sales line is repeated once per review of that product - so `sum(oi.quantity)` silently reports a hundred times the truth. `count(DISTINCT ...)` can rescue a count, but nothing can rescue a `sum`.

## Hint 3
Aggregate the sales side down to one row per product first - in a subquery or a CTE - and only then attach the review information. The `>= 2 buyers` restriction is a condition on that aggregate, so it belongs in a `HAVING` inside the subquery or a `WHERE` outside it.
