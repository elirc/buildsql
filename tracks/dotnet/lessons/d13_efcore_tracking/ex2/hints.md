## Hint 1

You cannot answer 404, and you cannot compare against the current reading,
without the current row in hand. This endpoint is the two-trip pattern on
purpose: load, then decide, then save.

## Hint 2

`FirstOrDefaultAsync` the van (null means 404), reject a lower reading with
400, then assign `van.Mileage` and `await db.SaveChangesAsync()`. No
`Update()` call anywhere - the change tracker saw the assignment, and the
UPDATE it emits touches only the mileage column, which is why the plate
survives.
