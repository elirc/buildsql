## Hint 1

Each parameter has three cases and you must treat them differently: `null`
means "not sent, do nothing", a known value means "apply it", and anything else
means 400. Write the two rejections at the top and the query underneath.

Careful with the order of operations in the query itself — the gate checks that
`?status=shipped&sort=total` returns three orders and not five.

## Hint 2

`Catalog.Statuses` is the list of legal status values, so `Contains` answers
the first validation question. The legal `sort` values are only `"id"` and
`"total"`, and there is no constant for them.

For the query, start from `Catalog.Orders.AsEnumerable()` and keep reassigning
the variable: apply `Where` only when there is a filter, then apply exactly one
`OrderBy` at the end. Both branches of that sort must exist — `id` is the
default, not the absence of sorting.

The return type is a union, so `return TypedResults.BadRequest("...")` and
`return TypedResults.Ok(list)` both convert automatically; nothing else will.

## Hint 3

The shape is:

```csharp
if (status is not null && !Catalog.Statuses.Contains(status))
{
    return TypedResults.BadRequest($"unknown status '{status}'");
}
// … the same idea for sort …

var query = Catalog.Orders.AsEnumerable();
if (status is not null)
{
    query = query.Where(/* … */);
}

query = sort == "total" ? query.OrderBy(/* … */) : query.OrderBy(/* … */);
return TypedResults.Ok(query.ToList());
```

The 400 body has to contain the offending value, which is why the message is
interpolated rather than a constant string.
