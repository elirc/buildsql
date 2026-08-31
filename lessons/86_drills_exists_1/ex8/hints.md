## Hint 1

Two hops down the org chart, and neither hop needs to produce output - only to exist.

## Hint 2

An `EXISTS` over the direct reports, with a second `EXISTS` nested inside it over that report's own reports. The inner one correlates on `r.id`, not on `s.id`.

## Hint 3

Doing this with two joins instead would return one row per grandchild, so that spelling needs `DISTINCT`. Nested `EXISTS` gives you one row per manager for free.
