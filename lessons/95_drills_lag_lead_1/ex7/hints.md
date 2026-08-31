## Hint 1

Two layers: first turn each customer's event stream into a stream of gaps (LAG partitioned by customer), then take the biggest gap per customer (GROUP BY with max). Neither layer can do the whole job alone.

## Hint 2

In a CTE: `ts - lag(ts) OVER (PARTITION BY customer_id ORDER BY ts) AS gap`, filtered to `customer_id <= 5`. The partition matters - without it, one customer's first event measures a "gap" from a different customer's last event.

## Hint 3

The outer query is plain lesson 07 material: `SELECT customer_id, max(gap) FROM gaps GROUP BY customer_id ORDER BY customer_id`. Each customer's first event carries a NULL gap; `max()` ignores NULLs, so nothing special is needed for it.
