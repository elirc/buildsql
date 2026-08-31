## Hint 1

There is an operator that filters a sequence down to the items of one type, and
a different one that insists every item already is that type. You want the
filtering one.

`string.IsNullOrWhiteSpace` handles all three of null, empty and spaces in a
single call.

## Hint 2

`OfType<int>()` keeps what matches and drops the rest, nulls included.
`Cast<int>()` would throw an `InvalidCastException` on the first string - that
is the whole difference, and picking the wrong one produces a crash on data you
believed you had excluded.

`Meaningful` filters and then projects, and the compiler needs help on the
projection: after the `Where` it still thinks the entry might be null, so
`entry!.Trim()` (or a pattern that reassures it) is what gets you past the
nullable warning.

For `Describe`, a `switch` expression inside `Select` reads best. Put the
`null` arm **first**: a type pattern like `int number` never matches null, so
without it the discard arm would call `GetType()` on a null reference.
