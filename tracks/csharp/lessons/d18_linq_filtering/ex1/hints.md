## Hint 1

Two operators, in the order the sentence describes them: keep the long words,
then change what is left. `Where` takes a predicate and `Select` takes a
projection, and both hand back a new sequence - so the method ends with
`.ToList()`.

For `Numbered`, look for a `Select` overload you have probably not used.

## Hint 2

```csharp
return words
    .Where(word => word.Length >= minLength)
    .Select(word => word.ToUpperInvariant())
    .ToList();
```

`Select` has a second overload whose lambda takes `(item, index)`. The index is
zero-based, so the display number is `index + 1`.

Filter before you project. It does not matter here, because `Length` survives
the upper-casing - but the moment a projection drops a field the filter needed,
the other order stops compiling, and it is easier to have the habit than to
notice.
