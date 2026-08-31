## Hint 1

Carry a fourth column through the recursion, the way `depth` is carried, and extend it at every step.

## Hint 2

Anchor: `name::text AS path`. Step: `o.path || ' > ' || s.name`. The cast in the anchor is what fixes the column's type for the whole CTE.
