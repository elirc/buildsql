## Hint 1

A CTE does not have to read a table. `VALUES` rows are a perfectly good source, and column names can be declared next to the CTE's name.

## Hint 2

`WITH tiers(tier, lo, hi) AS (VALUES ('budget', 0, 100), ...)`, then `LEFT JOIN products p ON p.price >= t.lo AND p.price < t.hi` and group by `t.tier, t.lo`. Count `p.id`, not `*` - only `count(p.id)` reports zero for a band that matched nothing.
