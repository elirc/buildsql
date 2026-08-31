## Hint 1

`SelectMany` takes a selector that returns a *sequence* for each item, and
concatenates the results. That is the entire operator, and `All` is the case
where the selector does nothing at all.

`Letters` works because a `string` already is an `IEnumerable<char>`.

## Hint 2

```csharp
groups.SelectMany(group => group)      // the selector is the identity
words.SelectMany(word => word)         // a string IS a sequence of chars
lefts.SelectMany(left => rights, (left, right) => $"{left}-{right}")
```

The cross product is the same operator with a selector that ignores its
argument and hands back the whole right-hand sequence every time. The nesting
order falls out of that: the first left is paired with every right before the
second left appears - identical to two nested `foreach` loops, which is worth
writing out once if the order surprises you.

An empty inner sequence contributes nothing rather than a gap, which is why the
empty group in the first test does not show up as a null.
