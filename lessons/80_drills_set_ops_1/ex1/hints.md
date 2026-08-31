## Hint 1
Two lists of customer ids, combined into one, with anybody who qualifies on both counts appearing only once.

## Hint 2
`SELECT ... UNION SELECT ...` and a single `ORDER BY id` at the very end - the ordering applies to the combined result, not to either branch. Plain `UNION` removes duplicates for you; you do not need `DISTINCT` as well.
