# Reading - dotnet/d13_efcore_tracking

## Notes

Every problem in this set is the same question asked eight ways: **which
objects does this DbContext remember, and what will it do about them?** A
tracked entity is compared against a snapshot at SaveChanges time; anything
different gets written, whether you meant it or not (ex1). The tracker is also
an identity map: within one context, one primary key maps to at most one
instance, which makes a second fetch free (ex4) and makes a "fresh" re-query
lie to you (ex7). And everything the tracker does costs or saves round trips,
which is why half these gates count SQL commands: the response body can be
right while the query plan is a disaster.

The working rules: reads that only render should not track; writes that start
from a loaded entity should let change detection do the work; writes that start
from a payload do not need the load at all; and anything that bypasses the
tracker - `ExecuteUpdate`, another process, raw SQL - leaves tracked instances
stale until you deliberately read past them.

## ex1

This problem was really testing whether you know that *mutating a tracked
entity is a write waiting to happen*. The handler only wanted to uppercase a
string for a display board, but the vans were tracked, and the audit-row
`SaveChanges` faithfully flushed the "formatting".

The classic mistake is thinking SaveChanges only writes "what you saved". It
writes every detected change on every tracked entity. The model answer reads
the vans with `AsNoTracking()` (projecting into `BoardRow` before formatting is
even better), so the display mutation is invisible to the context and the audit
insert is the only change in the room.

## ex2

The drill is the bread-and-butter update: load, assign, save - and the trap is
`Update()` on a fabricated entity. `db.Update(new Van { Id = id, Mileage = m })`
marks *every* property modified, so the columns you never set are written too,
as `""` and `0`. That is how a mileage correction erases a plate.

The model answer loads the row (which also makes 404 and the
no-going-backwards rule answerable), assigns one property, and saves. The
tracker diffs against the snapshot and the UPDATE touches one column, in
exactly two round trips.

## ex3

What this tests: change detection is a *comparison*, not a recording of your
assignments. Assigning the value a property already has produces no change, no
UPDATE, no transaction - and `SaveChangesAsync` returns `0`, which is precisely
the `ChangeReport`.

The classic mistake is calling `Update(van)` on an already-tracked entity "to
be safe". That stamps every property modified, turns the no-op into a full
UPDATE, and reports a change that never happened. The model answer assigns
unconditionally and reports `written > 0` - the framework already knows whether
anything changed; ask it.

## ex4

The identity map drill. `FirstOrDefaultAsync` tracks the van under its key;
`FindAsync` *checks the tracker first* and only queries when the key is
unknown - so the second fetch costs nothing and returns the very same
instance.

The classic mistake is the reverse order of operations, or `AsNoTracking` on
either fetch: untracked results are never registered, so every fetch pays a
round trip and every result is a distinct object. The rule to keep: `Find` is
the only query API that can answer from memory, and it only helps if the first
read was tracked.

## ex5

The disconnected update. When the payload carries the entire resource, loading
the row first is a round trip that buys you nothing - you are about to
overwrite every column anyway. The model answer builds the entity from the
payload, attaches it as modified (`db.Vans.Update(van)` on an untracked
instance with a set key), and saves: one UPDATE.

The 404 is the interesting half: with no SELECT, "does it exist?" is answered
by the UPDATE's row count, which EF surfaces as `DbUpdateConcurrencyException`
when zero rows matched. Catch it, answer 404. The classic mistake is assuming
you must read before you write; the second mistake is forgetting the catch and
letting the 404 case become a 500.

## ex6

`ExecuteUpdate` goes straight to SQL: nothing is loaded, nothing is tracked,
and - the point of this exercise - nothing already materialised is updated.
The shipped stub loads the vans, bulk-updates, and reports the stale list.

The model answer flips the order: run the `ExecuteUpdate` first and use its
row count as the existence check (0 rows hit means 404 - no separate `Any`
query needed), then read the report with a *projection*, which is never
tracked and therefore always reflects the database. Bulk operations and the
change tracker live in different worlds; pick an order that never needs them
to agree.

## ex7

The hard version of ex6's lesson: the stub *does* re-query after the
calibration, and the SQL really returns the new mileage - then EF throws those
values away, because the row is already tracked and the identity map's job is
to give you one consistent instance per key. A stale one, in this case.

The classic mistake is believing a re-query refreshes a tracked entity. It
does not; only `Entry(...).Reload()`, clearing the tracker, or reading
untracked does. The model answer never tracks the van at all: an
`AsNoTracking` existence check, then the calibration, then a projection for
the report - the identity map cannot serve you stale data about a row it
never met.

## ex8

The cumulative problem: batch semantics (all or nothing), tracking (assign,
save once), and round-trip budgeting (one `Contains` SELECT for the whole
batch, one SaveChanges call). The gate fails the two halves separately, so you can
tell *which* discipline slipped.

The classic mistake is the friendly-looking loop: find item, validate item,
save item. It costs two round trips per item, and worse, by the time item 3
fails validation, items 1 and 2 are committed - the gate checks exactly that.
The model answer's reasoning: validate everything against one dictionary of
loaded vans *before* the first assignment, so the only save that ever happens
is the one that writes the whole batch.

## Further reading

- [Change tracking in EF Core](https://learn.microsoft.com/en-us/ef/core/change-tracking/) - snapshots, DetectChanges, and what SaveChanges actually writes.
- [Tracking vs. no-tracking queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking) - AsNoTracking, identity resolution, and when query results are discarded.
- [Disconnected entities](https://learn.microsoft.com/en-us/ef/core/saving/disconnected-entities) - Attach, Update, and updating without a prior load.
- [ExecuteUpdate and ExecuteDelete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete) - bulk writes that bypass the change tracker, and their interaction with tracked entities.
- [DbUpdateConcurrencyException](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) - zero rows affected as a signal, not just a race.
