## Hint 1

The stub's re-query genuinely executes SQL and genuinely gets the new mileage
back - and then EF discards those values, because the van is already tracked
and one key maps to one instance. A tracked entity does not refresh by being
queried again.

## Hint 2

The cleanest fix: never track the van. Check existence with
`AsNoTracking().AnyAsync(...)`, call `D13Calibration.Apply` once, then read
the report through a projection (`Select(v => new TuneupReport(...))`) - a
projection has no entity to go stale.

## Hint 3

If you do keep a tracked instance, you must explicitly refresh it:
`await db.Entry(van).ReloadAsync()` before reporting. Either approach passes;
what cannot work is `FirstAsync` again on the same context and hoping.
