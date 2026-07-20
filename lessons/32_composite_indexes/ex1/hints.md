## Hint 1
Both predicates are equalities, so either order technically serves this
query - but `(customer_id, status)` also gives you the customer-alone
prefix for free (rule 3). Pick that.

## Hint 2
`CREATE INDEX orders_customer_status_idx ON orders (customer_id, status);`
