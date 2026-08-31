## Hint 1

The grouping key is not a column - it is the first word of one. Compute it,
group by it, count, and take the top five.

## Hint 2

`split_part(name, ' ', 1)` returns the first space-separated field.
Alternatively `left(name, position(' ' IN name) - 1)` cuts at the first
space.

## Hint 3

Order by the count descending *and* by the adjective ascending: several
adjectives will tie, and without the second key the five rows you get back
are not reproducible.
