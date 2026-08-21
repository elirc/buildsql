## Hint 1
"Latest row per key" is one of the three or four queries you will be asked
for by name. Number the rows inside each customer, newest first, and keep
number one.

## Hint 2
`row_number() OVER (PARTITION BY o.customer_id ORDER BY o.created_at DESC,
o.id DESC)` in a CTE, then `WHERE rn = 1` outside it. The country filter
joins `customers` and belongs in the CTE, not after the ranking.

## Hint 3
Know the second answer too, because interviewers like it: `SELECT DISTINCT
ON (customer_id) ... ORDER BY customer_id, created_at DESC, id DESC` does
the same job in one pass -- PostgreSQL-specific, taught in lesson 49. Both
need the same tie-break; without `id DESC` a customer with two orders at the
same instant returns an arbitrary one.
