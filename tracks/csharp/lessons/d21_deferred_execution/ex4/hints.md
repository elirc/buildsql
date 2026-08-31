## Hint 1

The tidy version - `source.Count()`, `source.First()`, `source.Last()` - is
three separate enumerations. This source allows one.

So take that one enumeration yourself, and answer all three questions from what
you kept.

## Hint 2

```csharp
List<int> items = source.ToList();
```

Then `items.Count`, `items[0]` and `items[items.Count - 1]` are all free, and
the empty check is `items.Count == 0`.

This is what `ToList` is *for*. It is not a performance tweak or a way to make
the compiler happy; it is the statement "I need to look at this more than once,
so I am taking a copy now."

The general habit worth forming: if a method takes an `IEnumerable<T>` and uses
it twice, either materialise it on the first line or change the parameter to an
`IReadOnlyList<T>` and make the caller decide. The analyser CA1851 will point
these out if you turn it on.
