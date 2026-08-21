## Hint 1

Four beats, and doing them in this order is the whole drill: resolve the
defaults, validate the resolved values, then filter → sort → page, then set the
header and return.

Say the order out loud before you type. Paging before filtering gives a
plausible-looking wrong answer, which is the kind that ships.

## Hint 2

Defaults: `sort ?? "title"`, `page ?? 1`, `size ?? 3`. Collect every problem into
a `Dictionary<string, string[]>` keyed `"sort"`, `"page"`, `"size"`, and return
`TypedResults.ValidationProblem(errors)` if any.

Filter with `string.Equals(b.Author, author, StringComparison.OrdinalIgnoreCase)`
— an identifier a human types should not be case-sensitive.

Materialise the filtered-and-sorted list *before* paging, because the total you
report is the number of matches, not the number you return.

## Hint 3

```csharp
var ordered = order == "year"
    ? matches.OrderBy(b => b.Year).ThenBy(b => b.Title, StringComparer.Ordinal)
    : matches.OrderBy(b => b.Title, StringComparer.Ordinal);

var all = ordered.ToList();
var items = all.Skip((wanted - 1) * perPage).Take(perPage).ToList();

response.Headers["X-Total-Count"] = all.Count.ToString();
return TypedResults.Ok(items);
```

The `ThenBy` on the year sort is not required by the gate and is worth adding
anyway: an `ORDER BY` with ties is an ordering that can change between runs, and
a paged endpoint with an unstable sort can show a client the same row twice.
