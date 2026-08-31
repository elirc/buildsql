## Hint 1

CUBE produces four grouping levels; the report wants only the two one-dimensional ones. GROUPING() is how a HAVING clause can tell the levels apart.

## Hint 2

GROUPING(col) is 1 when the row aggregates that column away. A marginal row rolls up exactly one of the two dimensions, so the two GROUPING() values sum to 1.

## Hint 3

HAVING GROUPING(c.country) + GROUPING(o.status) = 1 keeps the country rows and the status rows, discarding the 8 detail rows and the grand total. (The reference gets the same rows by asking for them directly with GROUPING SETS - once you can write both, you understand both.)
