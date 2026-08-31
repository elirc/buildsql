## Hint 1
Two conditions of opposite sign about the same customer: something must exist, and something else must not. Neither one can be expressed by joining and filtering, because a customer with both a book order and a laptop order would pass on the strength of the book row alone.

## Hint 2
One `EXISTS` for the orders and one `NOT EXISTS` for the electronics purchases, both correlated on `o.customer_id = c.id`, both in the `WHERE` clause of the outer query.

## Hint 3
The reason the `EXISTS` half is needed at all: a customer with no orders whatsoever has bought no electronics either, so the `NOT EXISTS` alone would sweep all of them in. The prompt asks for people who shop with us, just never for electronics.
