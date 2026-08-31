## Hint 1

The filter is optional, so the query has to be built in two steps. Nothing runs
until you materialise it, which means a `Where` added halfway through still ends
up in the SQL.

Keep a local variable for the query and add to it.

## Hint 2

```csharp
var query = db.Students.AsQueryable();

if (!string.IsNullOrWhiteSpace(country))
{
    query = query.Where(s => s.Country == country);
}

var names = await query.OrderBy(s => s.Name).Select(s => s.Name).ToListAsync();
```

`ToListAsync` is the execution boundary: everything before it becomes SQL,
everything after it happens in your process.

A country nobody is from is a 200 with an empty array — the collection exists
and has nothing in it.
