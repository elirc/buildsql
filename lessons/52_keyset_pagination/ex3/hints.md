## Hint 1
Nothing about the technique changes when the feed runs newest-first — only
the direction of travel. The cursor is still the last row you showed, and
the page you want is the rows that come *after* it in the display order.
"After" in a descending feed means older, which means smaller `ts`.

## Hint 2
So the comparison flips with the `ORDER BY`: ascending pages read
`WHERE key > cursor`, descending pages read `WHERE key < cursor`. Keep
`ORDER BY ts DESC` and `LIMIT 20`; drop the `OFFSET`. The index is declared
ascending and that is fine — a B-tree is walked in either direction, and the
plan will say `Index Only Scan Backward`.

## Hint 3
The README gives the cursor: page 10,000 of the newest-first feed ends at
`ts = 2023-11-12 14:40:01+00`. Write one `WHERE` clause against the bare
`ts` column with the operator hint 2 argues for, and decide for yourself
whether the boundary needs to be strict — the cursor row was already shown.
