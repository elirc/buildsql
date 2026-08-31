## Hint 1
Two steps: take everything before the `@`, then remove the fixed prefix
from what is left.

## Hint 2
`split_part(email, '@', 1)` gives `user4242`. Removing a literal prefix
is a `replace` with an empty replacement string - two single quotes with
nothing between them.
