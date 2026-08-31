## Hint 1

One row per customer, whether or not that customer ever ordered - so the
join direction is fixed, and the earliest order is an aggregate over the
right-hand side.

## Hint 2

`LEFT JOIN orders` and `min(o.created_at)`, grouped by the customer; or
reduce `orders` to one row per customer in a CTE and left-join that. Both
give NULL for the customers with no orders.

## Hint 3

Do not patch the NULLs. `NULL - date` is NULL, which is the honest answer
for `days_to_first` when there is no first order; a `coalesce(..., 0)` would
claim they ordered on the day they signed up.
