## Hint 1

One row per customer, one column per event type. The shape is exactly ex3's
with a different dimension on the columns.

## Hint 2

Filter to `customer_id <= 10` in `WHERE`, group by `customer_id`, and write
five conditional counts. Watch the column names: the `add_to_cart` events go
into a column called `carts`.
