## Hint 1

The natural implementation is three LINQ calls — `Any()`, `Count()`, `Sum()` —
and it is wrong for a reason that has nothing to do with the answer it
produces. The gate counts how many times the sequence is walked.

You need the count and the total, and there is no operator that gives you both.

## Hint 2

One `foreach`, two accumulators:

```csharp
int count = 0;
int total = 0;
foreach (int number in numbers)
{
    count++;
    total += number;
}
```

Then one conditional for the empty case. `count == 0` answers "was it empty?"
without a second pass.

## Hint 3

The other correct answer is `var list = numbers.ToList();` followed by
`list.Count` and `list.Sum()`. That is also one walk of the source, and it is
what you would write in production when the code afterwards is more than two
lines — materialise once at the boundary, then use the data freely.

Which to prefer depends on the size: `ToList` allocates a copy of everything,
the `foreach` allocates nothing. Both are correct; picking deliberately is the
point.

Left to you: what happens if `numbers` is a lazy query that hits a database and
you call this method twice? (Two more round trips, each time. Nothing about the
method changed — the caller's source did.)
