## Hint 1

The complement of a filter is not `NOT (filter)`. A three-valued predicate has three outcomes, and `NOT` maps unknown to unknown - so the rows that were dropped for being unknown get dropped again.

## Hint 2

PostgreSQL gives you the exact test you need: `(<predicate>) IS NOT TRUE`. Alternatively, take the `NOT` version and OR in the rows whose NULL made the predicate unknown.
