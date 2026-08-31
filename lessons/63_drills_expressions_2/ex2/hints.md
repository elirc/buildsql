## Hint 1
`coalesce(a, b)` returns the first argument that is not NULL. The catch
is that `a` and `b` must have a common type.

## Hint 2
`coalesce(manager_id, 'ROOT')` will not compile: an `integer` and a text
literal cannot be reconciled. Cast the column to `text` first, then supply
the text fallback.
