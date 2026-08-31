## Hint 1

A conditional aggregate whose condition is a pattern match. Product names
are capitalised, so a case-sensitive test would find nothing.

## Hint 2

`count(*) FILTER (WHERE name ~* '^[aeiou]')` - the `~*` operator is the
case-insensitive match. `lower(name) ~ '^[aeiou]'` is the other correct
spelling.
