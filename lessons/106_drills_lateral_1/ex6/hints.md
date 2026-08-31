## Hint 1

Identical shape to ex2 with LIMIT 3 instead of 1, on a table six times the size of orders. This is where the per-group LIMIT stops being style and starts being the reason LATERAL exists: it never ranks the whole stream.

## Hint 2

Inside the LATERAL: WHERE e.customer_id = c.id ORDER BY e.ts DESC LIMIT 3. Event timestamps are unique (they increase strictly with id), so no extra tie-break is needed.
