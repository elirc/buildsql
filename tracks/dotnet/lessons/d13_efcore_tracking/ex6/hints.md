## Hint 1

`ExecuteUpdate` changes rows, not objects. The list the stub loaded before the
bump is a snapshot from before the bump, and nothing will ever update it. Get
the order of operations right and the staleness problem disappears.

## Hint 2

Bump first: `ExecuteUpdateAsync` returns how many rows it hit, and `0` is your
404 - no separate existence query needed. Then build the response with a
`Select(v => new DepotVan(...))` projection: projections are never tracked, so
they always read what the database holds now. That is two round trips of the
three you are allowed.
