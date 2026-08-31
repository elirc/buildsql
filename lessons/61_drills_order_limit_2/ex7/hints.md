## Hint 1
Three keys, and the NULL modifier belongs to the first one only.

## Hint 2
`NULLS LAST` is already the default for `ASC` here, so the modifier
changes nothing today. Write it anyway: it documents the intent, and it
survives someone flipping the direction later.

## Hint 3
Assemble it left to right and check after each key. Sort by `manager_id`
alone and confirm the NULL row is last; add `salary DESC` and confirm the
pay now falls inside each manager's block; add `id`. If the twenty rows
change between two identical runs, a tie-break is missing.
