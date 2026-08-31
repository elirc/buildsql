## Hint 1

Read the prompt again: "an order that contains electronics and contains no books". The subject of both conditions is one order, and the customer only has to own one such order.

## Hint 2

The outer `EXISTS` walks the customer's orders. Inside it, join `order_items` to `products` for the electronics test, and nest a second `NOT EXISTS` correlated on `o.id` for the books test.

## Hint 3

The inner `NOT EXISTS` must correlate on `oi2.order_id = o.id`, not on the customer - correlating it on the customer asks "has never bought books at all", which is a different and much stricter question.
