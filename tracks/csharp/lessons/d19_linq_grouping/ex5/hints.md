## Hint 1

`Aggregate` comes in three shapes:

```
Aggregate(func)                          // starts from the first element
Aggregate(seed, func)                    // starts from a seed you supply
Aggregate(seed, func, resultSelector)    // ...and converts the state at the end
```

The summaries say which one each method wants. Match them up before writing
anything - the difference between them is entirely about the empty sequence.

## Hint 2

`TotalLength` is the seeded form: `parts.Aggregate(0, (total, part) => total +
part.Length)`. The seed is what an empty sequence returns, which is why 0 is
the right one.

`Deepest` is the seedless form: `paths.Aggregate((best, path) => ...)`. With
nothing to start from, an empty sequence has no answer, and the operator throws
`InvalidOperationException` for you - no check needed. Use `>` rather than
`>=` in the comparison so the first of two equally deep paths wins.

## Hint 3

`Summarise` needs a state carrying four numbers, and a value tuple is the
cheapest way to hold one:

```csharp
numbers.Aggregate(
    (Count: 0, Min: int.MaxValue, Max: int.MinValue, Sum: 0),
    (state, number) => ( /* the four updated fields */ ),
    state => /* turn it into a Summary, or throw */);
```

The seed's `Min` starts at `int.MaxValue` so the first real number always beats
it, and `Max` starts at `int.MinValue` for the same reason - a trick worth
knowing, and also the reason the empty case has to be caught explicitly: the
seed alone would report a minimum of `int.MaxValue`, which is nonsense. The
result selector is where you notice `Count` is still zero.
