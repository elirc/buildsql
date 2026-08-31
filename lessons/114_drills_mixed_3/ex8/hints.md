## Hint 1

The full weld: parse the product id out of every view and purchase payload, pivot the two counts per product, join the catalogue for name and category, then rank by views with a deterministic cut.

## Hint 2

One grouped pass with two FILTER counts (WHERE event_type IN ('view', 'purchase') then FILTER each) beats two scans. The conversion is 100.0 * purchases / views rounded to 1 - guard the division with NULLIF(views, 0) even though every top page has views; habits are for the day the data changes.

## Hint 3

If you build views and purchases in separate CTEs instead, the purchases side must come through a LEFT join with COALESCE - a heavily viewed page with zero purchases is a conversion of 0.0, not a missing row. That silent row loss is this exercise's real trap.
