## Hint 1

The endpoint receives `IEnumerable<IOrderRule>` — every registered
implementation, not one. So the body is a LINQ pipeline: keep the rules the
total does *not* satisfy, take their names, sort, return.

Watch the polarity. `IsSatisfiedBy` returns true when the rule is *happy*, and
you want the unhappy ones.

## Hint 2

Registering the same interface again does not replace the previous
registration; the container keeps all of them and `IEnumerable<T>` hands them
over together. So the fix is two more `AddScoped<IOrderRule, …>()` lines with
the other two implementations.

For the body: `Where`, then `Select`, then `OrderBy`, then `ToList`, then
`TypedResults.Ok(new RuleResponse(...))`.

## Hint 3

```csharp
var violations = rules
    .Where(r => !r.IsSatisfiedBy(totalCents))
    .Select(r => r.Name)
    .OrderBy(name => name, StringComparer.Ordinal)
    .ToList();
```

Sorting matters because registration order is not part of your API's contract.
And when nothing is violated the list is empty rather than null — `ToList()`
already guarantees that, so there is no special case to write.
