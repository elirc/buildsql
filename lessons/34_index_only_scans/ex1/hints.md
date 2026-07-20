## Hint 1
The query touches `customer_id` (search) and `total` (output). Both
must live in the index or the heap visit stays. Range on customer_id ->
it leads.

## Hint 2
`CREATE INDEX orders_customer_total_idx ON orders (customer_id, total);`
