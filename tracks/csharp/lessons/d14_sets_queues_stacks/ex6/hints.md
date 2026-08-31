## Hint 1

All three are one-liners over a `HashSet` built from the first argument:
`Overlaps` (any shared member?), `IsSupersetOf` (contains them all?), and
`SetEquals` (same membership, order and duplicates ignored). Each accepts a
plain `IEnumerable`, so only one side needs to become a set.

## Hint 2

```csharp
return new HashSet<string>(userRoles).Overlaps(anyOf);
```

Predict the empty cases before running: `Overlaps` with an empty `anyOf` is
false (nothing exists to share), `IsSupersetOf` an empty `allOf` is true
(nothing is missing). The gate asserts both directions.
