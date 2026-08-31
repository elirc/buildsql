## Hint 1

Two problems stacked: first build the driving set (top five spenders - an aggregate, sorted and limited, in a CTE), then run a per-row lookup against it.

## Hint 2

The CTE groups non-cancelled orders by customer, sums total, and keeps the top five by revenue with customer_id as tie-break. The LATERAL then fetches that customer's newest non-cancelled order: ORDER BY created_at DESC, id DESC LIMIT 1.

## Hint 3

Keep the status filter in both places. Dropping it from the lateral quietly lets a cancelled order be somebody's "last order", and the two halves of the report would disagree about which orders exist.
