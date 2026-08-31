## Hint 1

Two joins, two keys: items hang off orders by `order_id`, and each item names a product by `product_id`. Chain them in one `FROM` clause.

## Hint 2

The price to use is the one recorded on the item row, not the product's current price - that is why `order_items` carries a price column at all.
