## Hint 1

Change detection compares each tracked entity against the snapshot taken when
it was loaded. Assigning a property the value it already has is not a change,
and SaveChanges will not write anything for it. Your job is to stop defeating
that - and to report what SaveChanges did.

## Hint 2

Remove the `db.Vans.Update(van)` line: it stamps every property modified and
forces an UPDATE even when nothing differs. Then look at the return value of
`await db.SaveChangesAsync()` - it is the number of rows written, and
`written > 0` is your `ChangeReport`.
