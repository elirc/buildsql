## Hint 1

One row per customer, no matter how many qualifying orders they have - which rules out an ordinary join to `orders`.

## Hint 2

Both conditions describe the same order, so both belong inside one `EXISTS`, alongside the correlation `o.customer_id = c.id`.
