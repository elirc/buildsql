## Hint 1

Two questions, two queries: how many are there, and what is on this page. Build
the ordered query once and use it for both.

Resolve and validate the paging values before you touch the database.

## Hint 2

```csharp
var query = db.Enrolments.OrderBy(e => e.Id);

int total = await query.CountAsync();

var items = await query
    .Skip((wanted - 1) * perPage)
    .Take(perPage)
    .Select(e => new EnrolmentItem(e.Id, e.Score))
    .ToListAsync();
```

Order before `Skip`/`Take` — paging an unordered query is undefined, and the
database is free to hand you the same row on two different pages.

`ToListAsync().Count` instead of `CountAsync()` would be one command instead of
two, and would fetch the whole table to get it.
