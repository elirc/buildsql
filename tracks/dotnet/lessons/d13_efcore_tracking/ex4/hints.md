## Hint 1

A tracking context keeps an identity map: one primary key, at most one
instance. One of EF's query APIs consults that map *before* building SQL; the
LINQ operators never do. The exercise is choosing which fetch goes first and
which API does the recheck.

## Hint 2

Drop both `AsNoTracking()` calls. Load the van tracked with
`FirstOrDefaultAsync` (null means 404), then recheck with
`await db.Vans.FindAsync(id)` - the key is already in the tracker, so Find
answers from memory: same instance, zero extra queries.
