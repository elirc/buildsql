## Hint 1

Nothing is being walked here - the recursion is producing rows that do not exist in any table, one month at a time.

## Hint 2

Anchor: `SELECT date_trunc('month', min(created_at)) AS month FROM orders`. Step: `SELECT month + INTERVAL '1 month' FROM months WHERE month < (SELECT date_trunc('month', max(created_at)) FROM orders)`.

## Hint 3

Aggregates are allowed in the anchor but not in the recursive term, which is why the upper bound has to be a subquery. Then `LEFT JOIN orders` on `date_trunc('month', o.created_at) = m.month` and count `o.id`, not `*`.
