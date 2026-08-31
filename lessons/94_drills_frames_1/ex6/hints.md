## Hint 1

Write both columns exactly as given and read the output before trying to explain it. The two frames differ by one keyword.

## Hint 2

`ROWS` counts positions, so with a unique ordering each row's frame ends exactly at that row. `RANGE` counts ordering *values*, so every review with the same rating is a peer and they all see the same frame.

## Hint 3

The `ROWS` window orders by `rating, id` deliberately - a `ROWS` frame over a non-unique ordering would depend on the physical order of tied rows, which PostgreSQL does not promise.
