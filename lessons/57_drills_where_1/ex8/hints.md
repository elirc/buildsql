## Hint 1
There is a negated form of the range predicate, and it is spelled exactly
how you would guess.

## Hint 2
`price NOT BETWEEN 50 AND 450` is `NOT (price >= 50 AND price <= 450)`,
which by De Morgan is `price < 50 OR price > 450`. Note that both endpoints
flip to strict comparisons.

## Hint 3
If you write the `OR` form by hand, bracket it. Without brackets, `AND`
binds tighter than `OR` and the category test attaches to only one half of
the range, letting in every cheap product in the catalog. Compare your row
count against the `NOT BETWEEN` version - they must agree exactly.
