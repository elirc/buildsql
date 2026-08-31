## Hint 1

Same construct as ex1 with a row filter in front: WHERE runs before DISTINCT ON picks survivors, so cancelled orders must be gone before "latest" is decided.

## Hint 2

DISTINCT ON (customer_id) with WHERE customer_id <= 25 AND status <> 'cancelled', then ORDER BY customer_id, created_at DESC, id DESC. Filtering after the pick (in an outer query) would return nothing at all for a customer whose latest order happened to be cancelled - a different report.
