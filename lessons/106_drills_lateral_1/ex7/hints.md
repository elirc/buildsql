## Hint 1

The lateral subquery is a whole query, not just a lookup: it may join, filter, group, and only then sort and limit. Here it computes units per product for one category and keeps the best three.

## Hint 2

Inside the LATERAL, join products to order_items to orders, filter WHERE p.category = c.category AND o.created_at >= '2023-10-01', GROUP BY p.id, p.name, ORDER BY the summed units DESC with p.id as tie-break, LIMIT 3.

## Hint 3

The window alternative computes units for every product in every category and ranks them all before discarding the losers - correct, and what the reference does. With a per-category LIMIT the lateral only ever keeps three per driving row; compare both shapes and notice they must agree row for row.
