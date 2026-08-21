## Hint 1

`GroupBy` turns a sequence of rows into a sequence of *groups*. Each group is
itself a little sequence, with a `Key` — so after grouping you can run any of
lesson 10's operators on each group.

Both methods here are "group, then turn each group into one thing". The
difference is only what that one thing is and how the results come out.

## Hint 2

```csharp
sales.GroupBy(sale => sale.Category)     // IEnumerable<IGrouping<string, Sale>>
     .Select(group => new { Category = group.Key, Total = group.Sum(s => s.Amount) })
```

That anonymous type gives you two named values to order by before you format
them — order first, format last, exactly as in lesson 10.

`ToDictionary(keySelector, valueSelector)` turns the groups into the dictionary
the second method promises: `group => group.Key` and `group => group.Count()`.

## Hint 3

`group.Sum(...)` and `group.Count()` are the aggregates operating *inside* one
group. `sales.Count()` would count every sale in the whole sequence — the same
mistake as putting `count(*)` outside a `GROUP BY` in SQL.

Note that grouping an empty sequence produces no groups at all, not one empty
group. That is why the empty case needs no special handling here, and it is the
same behaviour SQL has.

Left to you: `GroupBy` has an overload taking both a key selector and an element
selector, so you can group and project in one call. Worth finding in the docs;
it makes the first method a little shorter.
