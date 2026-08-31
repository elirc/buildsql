## Hint 1

Two requirements pull apart: one row per customer from the stream (DISTINCT ON), and keep customers who never appear in the stream (an outer join, lesson 09). Neither construct alone does both.

## Hint 2

Build the one-per-customer picks as a subquery - DISTINCT ON (customer_id) ... ORDER BY customer_id, ts DESC - and LEFT JOIN customers to it. Filtering c.id <= 10 belongs to the customers side, so it can sit in the outer WHERE without killing the outer join.

## Hint 3

The order of operations matters: the subquery picks each customer's last event first, then the LEFT JOIN attaches it (or NULLs). A LEFT JOIN to raw events followed by DISTINCT ON would also work but drags three million rows through the join to keep one each. Lesson 48's LEFT JOIN LATERAL ... LIMIT 1 is the third spelling - the reference uses it.
