## Hint 1

Same shape as ex2: resolve the defaults, collect errors keyed by parameter name,
return them all at once, then do the work.

Three parameters, three possible error keys — `"sort"`, `"page"`, `"size"` — and
the gate checks the key, so the names matter.

## Hint 2

Defaults first: `sort ?? "name"`, `page ?? 1`, `size ?? 3`. Validate the
resolved values, not the raw nullable ones.

For the query, branch on the sort before you page:

```csharp
IQueryable<Widget> query = order == "price"
    ? db.Widgets.OrderBy(w => w.PriceCents).ThenBy(w => w.Name)
    : db.Widgets.OrderBy(w => w.Name);
```

…then `Skip`, `Take`, `Select` into the DTO, `ToListAsync`. The count is its own
`CountAsync()` query.

## Hint 3

The header is set through the `HttpResponse response` parameter, and it has to
happen before you return:

```csharp
response.Headers["X-Total-Count"] = total.ToString();
return TypedResults.Ok(items);
```

A tie-breaker on the price sort is worth adding even though the seed data has no
ties — an `ORDER BY` with ties is an ordering that can change between runs, and
a paged endpoint with an unstable sort can show a client the same row twice.
