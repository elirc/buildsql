## Hint 1

`string.Join(separator, items)` and `string.Split(separator)` are the two
halves. The work in both directions is the filtering: trim each field and drop
the ones that are blank once trimmed.

`string.IsNullOrWhiteSpace` answers "null, empty or spaces" in one call, which
is exactly the test both methods need.

## Hint 2

Build a `List<string>` of the survivors and hand it to `string.Join` - do not
try to filter inside the join.

```csharp
foreach (string? field in fields)
    if (!string.IsNullOrWhiteSpace(field))
        kept.Add(field.Trim());
```

Note that the compiler knows `field` is not null inside that `if`, because
`IsNullOrWhiteSpace` is annotated with `[NotNullWhen(false)]` - so `.Trim()`
draws no warning.

`Split` takes the same shape. `line.Split(',')` on a blank line gives you one
blank field, which your filter removes anyway - but the explicit
null-or-blank guard at the top says what you mean.
