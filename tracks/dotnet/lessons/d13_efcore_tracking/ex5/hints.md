## Hint 1

The payload carries every column, so the SELECT buys you nothing - you are
about to overwrite whatever it returns. Build the `Van` from the request with
its `Id` set, and tell the context it is a modified entity that exists
elsewhere. The 404 comes from the UPDATE itself, not from a lookup.

## Hint 2

`db.Vans.Update(van)` on an *untracked* instance with a non-zero key attaches
it in the Modified state: SaveChanges sends one UPDATE. When that UPDATE
matches zero rows, EF throws - the exception name starts with
`DbUpdateConcurrency` - and catching it is your 404.

## Hint 3

Validate first (blank strings, negative mileage) and return 400 before
touching the context. Then: construct the entity, `Update`, and wrap only the
`SaveChangesAsync` call in `try/catch (DbUpdateConcurrencyException)`
returning `TypedResults.NotFound()`. Success falls through to `NoContent()`.
