# Reading - dotnet/d11_efcore_queries

## Notes

An EF Core query is a **description** until you make it run. `db.Enrolments` is
an `IQueryable`, and every `Where`, `OrderBy`, `Select`, `Skip` and `Take` you
chain onto it adds to an expression tree that has not touched the database. The
moment you call `ToListAsync`, `CountAsync`, `FirstOrDefaultAsync` — or write a
`foreach` — the tree is translated into SQL and executed.

Every problem in this set turns on where that line falls. Filter before the line
and the database filters; filter after it and you fetched everything and threw
most of it away. The answers look identical, which is exactly why half these
gates count SQL commands instead of just checking values.

Three habits come out of it. **Compose, then execute once.** **Project to what
the caller needs**, so the SELECT lists three columns rather than every one.
And **count the round trips** — an endpoint that is correct at seed size and
issues one query per row is an outage waiting for real data.

## ex1

Conditional filters are the everyday case, and the shape that works is a local
`IQueryable` you add to:

```csharp
var query = db.Students.AsQueryable();
if (…) { query = query.Where(…); }
```

Nothing runs until `ToListAsync`, so the `WHERE` is in the SQL whether the
parameter arrived or not. The classic mistake is `ToListAsync()` first and
`.Where(…)` after, which is correct and reads the whole table.

The empty-versus-missing rule from d03 applies here too: a country nobody is
from is a 200 with `[]`.

## ex2

`Select` before the execution boundary changes the SQL. The database really does
send three columns, nothing is tracked (there is no entity to track), and the
response cannot leak a field you forgot to strip.

The classic mistake is projecting after materialising — same JSON, every column
fetched — which is invisible until the table has fifty columns or one of them is
a blob. The gate reads the raw body because that is the only symptom you can see
from outside.

## ex3

`GroupBy` over an `IQueryable` becomes a real `GROUP BY`: the counting and
summing happen in the database and two rows come back. `GroupBy` after
`ToListAsync` fetches every row and does the arithmetic in your process — same
answer, whole table.

Two restrictions worth knowing, because both produce the same wall of text.

EF only translates a `GroupBy` whose result is *projected to an aggregate*.
`GroupBy(…).ToListAsync()` — grouping without aggregating — cannot be expressed
in SQL at all, and EF will tell you so rather than doing it silently, which is a
deliberate and welcome change from the days of silent client evaluation.

And the projection out of a group has to be an **anonymous type or an object
initialiser**, not a constructor call: `.Select(g => new SubjectTotals(g.Key,
g.Count(), …))` throws, while the same aggregates projected into `new { … }`
translate fine. Build the record from the materialised rows afterwards — two
rows have already arrived by then, so it costs nothing.

## ex4

`CountAsync` and `AverageAsync` push the aggregate into SQL, so nothing is
materialised. The trap is the empty set: `AverageAsync` on no rows throws
`InvalidOperationException`, because there is no average of nothing.

The fix is a cast — `Select(e => (int?)e.Score).AverageAsync()` — which lets the
database's `NULL` come back as `null` and turns the crash into a `?? 0`. That is
the same trick you need for `MaxAsync` and `MinAsync`, and it is a good thing to
have in your fingers before an interviewer asks why a report endpoint 500s at
the start of every month.

## ex5

A page and its total are two queries: one `COUNT`, one `SELECT … LIMIT`. There is
no way to get both in one round trip through EF, and the gate insists on exactly
two so that "materialise everything and count the list" is caught.

The other rules are the ones from d03's search: order **before** `Skip`/`Take`
(paging an unordered query is undefined), cap the page size rather than trusting
the client, and report the total so the client can draw page numbers.

The honest alternative worth naming: fetching `size + 1` rows and reporting only
"there is more" costs one query instead of two, and keyset pagination
(`WHERE id > lastSeen`) beats `Skip` outright once the offsets get large.

## ex6

The N+1, in the shape you will actually meet: a loop that fetches a parent for
each child. Seventeen commands for eight rows here; eight thousand for four
thousand rows in production, at which point the endpoint's latency is a function
of the network rather than the data.

The fix is one projection. `e.Student!.Name` is a **join expressed as a property
access**: the `!` is a message to the compiler, not a dereference, because
nothing in that lambda runs in your process — the whole thing is an expression
tree EF translates.

The follow-up to have ready is "how would you catch this before production", and
the answer is the gate you just ran: count the commands. Turn on the
`Microsoft.EntityFrameworkCore.Database.Command` category at Information, or
assert a query count in a test around the hot endpoint.

## ex7

`Include` + `ThenInclude` is one query with JOINs, which duplicates the root
row's columns once per related row. With one collection that is fine. With two
collections on the same root it is a **cartesian explosion** — ten orders and ten
addresses become a hundred rows — and that is what `AsSplitQuery()` exists for:
one query per collection, so nothing multiplies.

The trade is round trips against row volume, and there is a correctness footnote
that matters: split queries are **not** executed in one transaction by default,
so another writer can change the data between them. Single query is the default
for that reason.

Also worth having: `AsSplitQuery()` per query, or
`UseSqlite(…, o => o.UseQuerySplittingBehavior(…))` for the whole context.

## ex8

Everything at once, and the shape is worth memorising because almost every list
endpoint you ever write is this: compose the filters onto an `IQueryable`, count
it, order it, page it, project it, execute.

Two decisions carry the weight. The **sort whitelist** keeps your column names
out of the API surface, makes every supported sort indexable, and — in a system
where sorts are built by string concatenation — is the difference between an API
and a SQL injection. And the **tie-break on a unique column** makes paging
stable: an `ORDER BY` with ties can return rows in a different order on the next
request, and a client paging through them will see one row twice and miss
another.

The command count is the proof that composition worked. Two: one for the total,
one for the page.

## Further reading

- [Querying data with EF Core](https://learn.microsoft.com/en-us/ef/core/querying/) — how a LINQ query becomes SQL, and when it stops being one.
- [Efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) — projection, N+1, cartesian explosion and counting round trips.
- [Single vs. split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries) — the trade-off in ex7, including the transaction caveat.
- [Client vs. server evaluation](https://learn.microsoft.com/en-us/ef/core/querying/client-eval) — why EF refuses to translate some queries instead of doing them quietly in memory.
- [Complex query operators](https://learn.microsoft.com/en-us/ef/core/querying/complex-query-operators) — `GroupBy`, `SelectMany` and what does and does not translate.
