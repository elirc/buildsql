## Hint 1

`IntersectWith`, `ExceptWith` and `UnionWith` each MUTATE the set you call
them on. So: build a fresh `HashSet<string>` from one day, apply the
operation with the other day, then read the result. Sets have no order -
the A-Z comes from you, on the way out.

## Hint 2

```csharp
HashSet<string> result = new HashSet<string>(day1);
result.IntersectWith(day2);
return result.OrderBy(name => name).ToList();
```

`OnlyFirstDay` swaps in `ExceptWith`; `TotalDistinct` uses `UnionWith` and
returns `Count` - no sorting needed for a number.
