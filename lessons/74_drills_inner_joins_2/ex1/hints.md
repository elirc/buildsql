## Hint 1

Each additional table needs one `ON` condition connecting it to a table already in the query: items to orders by `order_id`, products to items by `product_id`.

## Hint 2

The result has one row per item line, so orders with several lines appear several times. That is the join doing its job, not a mistake.
