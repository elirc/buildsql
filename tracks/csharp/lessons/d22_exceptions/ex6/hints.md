## Hint 1

Catch blocks are tried in source order, and the first one whose type the
exception is assignable to wins. So the order of your four catches decides
which ones are reachable at all.

Check the inheritance: `ArgumentNullException` and
`ArgumentOutOfRangeException` both derive from `ArgumentException`.

## Hint 2

Most specific first:

```
ArgumentNullException  ->  "null-arg"
ArgumentException      ->  "arg"
FormatException        ->  "format"
Exception              ->  "other"
```

Put `ArgumentException` first and the null case can never be reached - and
unlike a `catch (Exception)` in the wrong place, the compiler will not warn you
about that one.

For `Leaves`, an `AggregateException` is a tree: its `InnerExceptions` may
themselves be aggregates. `Flatten()` returns a new `AggregateException` whose
`InnerExceptions` are only the leaves, in order - so the whole method is one
`Flatten`, one `Select` for the messages and a `string.Join`.
