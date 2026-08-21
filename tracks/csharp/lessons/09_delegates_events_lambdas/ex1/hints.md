## Hint 1

All three methods are loops you have written before. The only new thing is that
part of the work arrives as a parameter, and you call it like a method.

A `Func<T, T>` is "give me a T, get a T back". A `Func<T, bool>` is a question
about a T. An `Action<int>` takes an int and returns nothing — you call it for
what it *does*, not for what it gives you.

## Hint 2

Calling one looks exactly like calling a method:

```csharp
T changed = transform(item);
if (predicate(item)) { ... }
action(i);
```

`Apply` collects the results into a `List<T>` and returns it. `CountWhere`
counts the items the predicate says yes to. `Repeat` loops from 1 to `times`
**inclusive** — read the gate if you are unsure which end is which.

## Hint 3

Nothing here inspects the delegate, checks it for null, or cares what it does.
That indifference is the point: `Apply` works for doubling ints and trimming
strings without knowing about either.

Left to you: whether to guard against a null `transform`. Production library
code would (`ArgumentNullException.ThrowIfNull(transform)` is the one-liner);
the gate never passes null. Deciding when a guard is worth its line is a real
judgement call, not a rule.
