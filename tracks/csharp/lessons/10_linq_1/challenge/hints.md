## Hint 1

One chain, five steps, and then one decision at the end.

The chain is everything you did in ex1 and ex4 in a row: filter to the year,
order by amount (biggest first, customer as tie-break), take `count`, project
each row to text.

The decision is what to return when the chain produced nothing.

## Hint 2

Materialise the projected lines into a `List<string>` before you join them, so
you can ask whether it is empty:

```csharp
List<string> lines = orders
    .Where(order => order.Year == year)
    // ... order, take, select ...
    .ToList();

return lines.Count == 0 ? "(none)" : string.Join(" | ", lines);
```

Each line is `$"{order.Customer}: {order.Amount}"`, and the separator is a
space, a pipe, a space.

## Hint 3

`string.Join` over an empty sequence gives `""`, not `"(none)"` — which is why
the empty case needs you rather than the library. That is the same
"the empty case is a design decision" point as lesson 02's countdown, one level
up.

Left to you: whether to check `lines.Count == 0` or use `Any()` on the query
before materialising. The first reads better here; the second is what you would
want if the source were a database and you did not want to fetch rows twice.
Note that asking a *query* `Any()` and then enumerating it is exactly the
double-enumeration ex3 warned about.
