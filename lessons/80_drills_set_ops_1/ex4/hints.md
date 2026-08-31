## Hint 1
Everything that has been reviewed, minus everything that has ever been sold. Set subtraction, in one operator.

## Hint 2
`SELECT product_id FROM reviews EXCEPT SELECT product_id FROM order_items`. Notice what this is: an anti-join written as arithmetic on sets. `EXCEPT` also deduplicates, so a product reviewed forty times and never sold still comes back once.
