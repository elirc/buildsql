## Hint 1
`order_id` is searched, so it is the key. `price` is only returned, so
it belongs in `INCLUDE (...)`.

## Hint 2
`CREATE INDEX order_items_order_price_incl_idx ON order_items (order_id) INCLUDE (price);`
