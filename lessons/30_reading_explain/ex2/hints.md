## Hint 1
The scan node's `rows=` in EXPLAIN ANALYZE output is the *actual* count
after the filter (also check the paid row count in dataset_facts.md).
No index on `status` exists, so...

## Hint 2
`SELECT 250472, 'Seq Scan', false;` — but only after you've seen those
three facts in the lab output yourself. The habit being built is
reading, not recalling.
