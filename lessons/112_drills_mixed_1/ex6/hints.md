## Hint 1

Two averages living at different grains: price is per product, rating is per review. Averaging both over one big join quietly weights product prices by how many reviews each product has.

## Hint 2

Aggregate each measure in its own CTE - products grouped by category, reviews joined to products grouped by category - then join the two six-row results. This is lesson 14's answer to every fan-out bug.

## Hint 3

If you want to see the bug you avoided: join products to reviews first and take avg(p.price) - it drifts from the true per-product average wherever review counts are uneven. Aggregate first, join after, whenever two fact tables meet one dimension.
