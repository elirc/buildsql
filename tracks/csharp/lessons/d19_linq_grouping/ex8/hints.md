## Hint 1

`ErrorReport` needs two different aggregates from the same group: a `Count`
with a predicate for the errors, and a `Max` over *every* entry for the slowest.
So project the whole group into a row first, and only then filter and order.

Filtering the entries down to errors before you group would give you the
slowest error rather than the slowest request.

## Hint 2

```csharp
logs.GroupBy(entry => entry.Service)
    .Select(group => new
    {
        Service = group.Key,
        Errors = group.Count(entry => entry.Level == "error"),
        Slowest = group.Max(entry => entry.Millis),
    })
    .Where(row => row.Errors > 0)
```

`Where` after the projection is what removes the services that logged no
errors - and the gate deliberately gives one of those the slowest request of
the whole set, so a version that filters in the wrong place is easy to spot.

## Hint 3

The histogram is a different problem, and the trap is that `GroupBy` cannot
solve it. It produces a group for a key something landed in and no group at
all for a key nothing did - so a bucket with zero entries simply is not in the
result, and a report whose rows depend on the data is not a report.

State the three bucket names yourself and look each one up:

```csharp
string[] buckets = { "fast", "normal", "slow" };
```

Build a `Dictionary<string, int>` of the counts that do exist, then project the
`buckets` array through it with `TryGetValue` and a zero default. Decide for
yourself where the boundary function lives - the gate checks 99, 100, 999 and
1000, so being sure which side each one falls on is worth a moment.
