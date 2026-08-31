## Hint 1
Four tables again, but the answer has one row per country, so the grouping column comes from the far end of the chain while the measure comes from the middle of it.

## Hint 2
Join customers -> orders -> order_items -> products, filter on the category and the two order predicates, then `GROUP BY c.country`. `<> 'cancelled'` is not the same as `IN ('paid','shipped')` here - pending orders count too.
