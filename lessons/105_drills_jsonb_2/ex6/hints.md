## Hint 1

A histogram over a number that lives inside a document: extract the value, cast it, and integer-divide by 100 so 0-99 become band 0, 100-199 become band 1, and so on.

## Hint 2

GROUP BY (payload ->> 'value')::int / 100 - the whole expression, spelled the same in SELECT. Two measures per band: count(*) and count(DISTINCT customer_id). Band 10 exists and is tiny: only the exact value 1000 lands there.
