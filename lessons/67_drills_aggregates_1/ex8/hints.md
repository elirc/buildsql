## Hint 1

Aggregates do not nest: `avg(count(*))` is an error. The count has to finish in an inner query before the average can start on its output.

## Hint 2

Inner query: one row per order with `count(oi.id)` as the line count, using a LEFT JOIN so item-less orders survive with a count of 0. Outer query: the three aggregates over those rows.
