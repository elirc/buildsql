## Hint 1

The shape of almost every list endpoint you will ever write: resolve and
validate the parameters, compose the filters onto an `IQueryable`, count it,
order it, page it, project it, execute.

Do the validation first — a bad sort should not cost a database round trip.

## Hint 2

Filters compose the same way as ex1:

```csharp
var query = db.Enrolments.AsQueryable();
if (!string.IsNullOrWhiteSpace(subject)) { query = query.Where(e => e.Course!.Subject == subject); }
if (minScore is not null) { query = query.Where(e => e.Score >= minScore); }

int total = await query.CountAsync();
```

The sort is a `switch` over the whitelist, and every branch ends with
`.ThenBy(e => e.Id)`.

Then `Skip`/`Take`/`Select`/`ToListAsync`, exactly as in ex5.

## Hint 3

The two decisions worth being able to defend:

**The whitelist.** Only `score`, `student` and `course` are sortable, so your
column names never become API surface and every supported sort can be indexed.
In a codebase where sorts are built by string concatenation, this is also the
line between an API and a SQL injection.

**The tie-break.** `ThenBy(e => e.Id)` on a unique column makes the ordering
total. An `ORDER BY` with ties can come back in a different order on the next
request, and a client paging through an unstable sort sees one row twice and
never sees another.

Left for you: the switch, and predicting the command count before you run it.
(Two.)
