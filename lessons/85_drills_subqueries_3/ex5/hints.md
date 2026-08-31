## Hint 1

Two separate questions: which customer placed the most orders, and then what are that customer's orders. Answer the first in a subquery and let the second use the answer.

## Hint 2

The inner query groups `orders` by `customer_id`, sorts by `count(*) DESC, customer_id`, and takes `LIMIT 1` - one row, one column, so it can sit on the right of `WHERE customer_id = (...)`.
