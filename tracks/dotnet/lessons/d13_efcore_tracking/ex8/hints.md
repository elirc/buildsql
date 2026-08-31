## Hint 1

Two disciplines at once: nothing may be written until the *whole* batch is
known good, and the batch may be read in exactly one query - one SELECT for
everything the batch mentions, followed by a single save. The per-item loop
breaks both.

## Hint 2

One query: `db.Vans.Where(v => ids.Contains(v.Id)).ToDictionaryAsync(v => v.Id)`
with `ids` extracted from the items. Validate every item against that
dictionary - missing key first (404 + index), then backwards mileage (409 +
index) - returning before any assignment.

## Hint 3

Only after both validation passes: loop the items assigning
`vans[item.Id].Mileage`, then ONE `await db.SaveChangesAsync()` at the end.
That single save emits one UPDATE per changed row (the SQLite provider does
not merge them), so a three-item batch costs 1 SELECT + 3 UPDATEs; the error
paths never reach the save at all.
