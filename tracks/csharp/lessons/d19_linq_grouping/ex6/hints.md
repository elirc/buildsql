## Hint 1

`GroupBy` has more than one overload, and two of them are the exercise:

```
GroupBy(keySelector, elementSelector)      // groups hold projected items
GroupBy(keySelector, resultSelector)       // your lambda gets (key, members)
```

The summaries say which method wants which. The third method uses the plain
one-argument form.

## Hint 2

```csharp
staff.GroupBy(e => e.Department, e => e.Name)     // an IGrouping<string, string>
```

Because the group now holds strings, `string.Join(",", group)` takes the group
directly - an `IGrouping<TKey, TElement>` *is* an `IEnumerable<TElement>`.

```csharp
staff.GroupBy(e => e.Department, (department, members) => new { ... })
```

Here nothing of type `IGrouping` is ever handed back at all; your lambda gets
the key and the sequence of members and returns the finished row.

Neither overload is faster in any way you would notice at this size. They are
both about saying what you meant with fewer nested lambdas - which is worth
having in your fingers, because the version everybody writes first nests three
of them.
