## Hint 1

Three one-liners. `Distinct` works on the values themselves, so `UniqueOwners`
has to project to the owner *before* de-duplicating.

For `OnePerOwner` you want the whole ticket, not the owner - which is a
different operator, added in .NET 6 precisely for this.

## Hint 2

```csharp
tickets.Select(t => t.Owner).Distinct()          // values
tickets.DistinctBy(t => t.Owner)                 // whole items, compared by key
tickets.OrderBy(t => t.Priority).ThenBy(t => t.Id, StringComparer.Ordinal)
```

Both `Distinct` and `DistinctBy` keep the **first** occurrence and preserve the
order the items arrived in. Neither one sorts, however sorted the result looks.

`ThenBy` takes an `IComparer<string>` as an optional second argument, and
`StringComparer.Ordinal` is the one that compares by code unit rather than by
culture - the only kind of string ordering that means the same thing on every
machine your code runs on.
