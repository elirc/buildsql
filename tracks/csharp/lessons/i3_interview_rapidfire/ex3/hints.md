## Hint 1

Two one-liners-ish, both about *when* code runs rather than what it computes.

`Above` must stay a query, so no `ToList`. `Indexes` must keep its `for` loop
and still produce 0, 1, 2 — which means fixing the capture rather than the loop.

## Hint 2

```csharp
return numbers.Where(number => number > threshold());
```

`Where` is deferred, and the lambda calls `threshold()` afresh on every element
every time the query is enumerated — which is exactly what the doc comment asks
for.

For the loop, one extra line inside the body:

```csharp
for (int i = 0; i < 3; i++)
{
    int captured = i;
    functions.Add(() => captured);
}
```

## Hint 3

Be able to say both mechanisms in one sentence each.

**Deferred execution**: a LINQ query holds the source and the lambdas and runs
nothing until enumerated — so it sees the world as it is at that moment, and
re-runs on every enumeration.

**Capture**: a lambda captures the *variable*, not its value. A `for` loop has
one variable for the whole loop, so three lambdas share it; declaring a fresh
local inside the body gives each iteration its own.

Left to you: the gate enumerates the same query twice with a changed threshold.
Work out what would have happened if `Above` had ended in `.ToList()` — and why
that is sometimes exactly what you want.
