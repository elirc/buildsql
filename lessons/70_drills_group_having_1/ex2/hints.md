## Hint 1

The restriction is on individual review rows, not on the groups they end up in, so it belongs in `WHERE`.

## Hint 2

`WHERE rating >= 4 ... GROUP BY rating` - a filter on the grouping column itself is still a row filter, and putting it in `HAVING` would make PostgreSQL do all the work first and throw most of it away.
