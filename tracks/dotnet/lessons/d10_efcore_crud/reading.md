# Reading - dotnet/d10_efcore_crud

## Notes

Two ideas hold this whole set together. The first is the **unit of work**: a
`DbContext` is not a connection, it is a change tracker. You load entities,
assign to their properties, and one `SaveChangesAsync` writes everything at once
inside a transaction. That is why ex6's transfer is safe and why ex8's batch can
be all-or-nothing without you writing a single `BEGIN`.

The second is that **the query and the write are different tools**. Reading is
LINQ that becomes SQL and should fetch only what you need (ex1). Writing is
either "load, change, save" (ex4, ex6, ex7) or, when there is nothing to load,
a set-based `ExecuteUpdateAsync` (ex5). Reaching for the wrong one is the most
common EF Core performance mistake there is.

The habit worth building: after every endpoint, ask *how many round trips did
that cost, and could the database have done it in one?*

## ex1

`Select` before `ToListAsync` and the projection becomes part of the SQL — the
database stops fetching the columns you did not ask for, and nothing is tracked,
because there is no entity to track.

The classic mistake is `ToListAsync()` first and `Select` after, which is a
`SELECT *` and an in-memory transform. It works, and it ships every column of
every row over the wire; the gate reads the raw body for exactly that reason.

And ordering is not optional. A database makes no promise about the order rows
come back in unless you say `OrderBy`, and "it looked sorted in testing" is a bug
waiting for the first index change.

## ex2

`FindAsync` is the primary-key lookup and it has one property nothing else has:
if that entity is already in the change tracker, it answers **without a round
trip**. `FirstOrDefaultAsync` always goes to the database, and it can filter on
anything.

So: `FindAsync` for a key, `FirstOrDefaultAsync` for everything else. The classic
mistake is `First` instead of `FirstOrDefault`, which throws on no match — and a
thrown exception is a 500 for what is really a 404.

## ex3

Three lines: `Add`, `SaveChangesAsync`, read the id. The id does not exist until
the save, because the database generates it — which is why the `Location` header
can only be built afterwards.

The order that matters is validate-then-`Add`. The gate counts rows after three
rejected requests because "return a 400 after calling `Add`" leaves an entity in
the change tracker; nothing has been written *yet*, but the next
`SaveChangesAsync` in that request would write it.

## ex4

There is no `Update` call in the model answer, and that surprises people. The
context tracks the entity you loaded, notices the assignment, and works out the
`UPDATE` itself. `db.Update(entity)` exists for *detached* entities — one that
arrived over the wire rather than out of a query — and using it on a tracked
entity marks every property modified, which writes columns you did not change.

Delete is the same shape: you have to `Remove` an entity, so you have to have
loaded one, which is why deleting something that is not there is a 404 rather
than a silent success.

## ex5

`ExecuteUpdateAsync` (and `ExecuteDeleteAsync`) send one `UPDATE … WHERE`
straight to the database. Nothing is loaded, nothing is tracked, `SaveChanges` is
not involved — and the command count proves it.

The trade is real and worth saying out loud: because nothing is tracked, the
change tracker does not know about it. Entities you already loaded keep their old
values, so a bulk update followed by work on stale entities in the same context
is a genuine footgun. There are no interceptors, no `SaveChanges` overrides and
no automatic audit columns either.

Use it for what it is for: "change this set of rows", where the set may be large
and you never needed the rows themselves.

## ex6

The unit of work, demonstrated. Two entities change, one `SaveChangesAsync`
writes both inside a transaction, and its return value is the number of rows it
touched — which is why the gate can tell a half-done transfer from a whole one.

The subtle part is the validation order. Once you have assigned `sender.Credits
-= amount`, the change tracker is holding that edit; returning a 400 afterwards
without saving is *usually* harmless, because the context dies with the request
— but it is only harmless by accident, and it stops being true the moment
anything else in the request saves. Check first, mutate second.

In a real system this is also where you would think about concurrency: two
transfers from the same account at once both read 120 and both write, and the
answer to that is a rowversion token and `DbUpdateConcurrencyException`.

## ex7

PUT-as-upsert, over a database. The rule is the same as anywhere else: PUT means
"make the resource at this URL be this", and when the **client** names the
resource — an email, a slug, a device id — creating it is legitimate. The 201
versus 204 branch is a statement about what happened, not about what was asked.

The EF-specific part is that "does it exist" is a query, so an upsert is
inherently two round trips. If that matters, databases have a native answer
(`MERGE`, `INSERT … ON CONFLICT`) that EF does not expose, and you reach for raw
SQL. And under real concurrency two simultaneous upserts can both see "not
there" — which is what unique indexes are for.

## ex8

All-or-nothing, and there are two halves to it. `SaveChangesAsync` gives you the
transaction for free: either every `Add` in this batch commits or none does.
What it does *not* give you is the validation discipline — the model answer
checks every item **before** adding any, so a rejection cannot leave half a batch
staged in the change tracker.

The check the gate insists on is the one people miss: a duplicate *within the
batch*. Comparing each item against the database misses two items in the same
request claiming the same email, because neither of them is in the database yet.
The fix is to accumulate as you validate.

And the error names the **index**. "One of your 500 rows is wrong" is not an
error message anybody can act on.

## Further reading

- [Saving data in EF Core](https://learn.microsoft.com/en-us/ef/core/saving/) — the change tracker, `SaveChanges`, and what it does in one transaction.
- [ExecuteUpdate and ExecuteDelete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete) — set-based writes, and everything they deliberately skip.
- [Efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) — projection, tracking, and counting round trips.
- [Disconnected entities](https://learn.microsoft.com/en-us/ef/core/saving/disconnected-entities) — when `Update` is the right call and when it writes too much.
- [Handling concurrency conflicts](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) — the ex6 follow-up an interviewer will ask.
