## Hint 1
Five tables in one path: the customer, their orders, the lines on those orders, the products on those lines, and finally every review written about those products - by anyone, not just by customer 17.

## Hint 2
The chain is `customers -> orders -> order_items -> products -> reviews`, joined on the obvious keys, with `c.id = 17` and `r.rating = 1` in `WHERE`.

## Hint 3
The last hop is the one that catches people: `reviews` joins on `product_id`, not on anything to do with the customer. And if customer 17 bought the same product on two different orders, every review of it arrives twice - the prompt asks for each review once.
