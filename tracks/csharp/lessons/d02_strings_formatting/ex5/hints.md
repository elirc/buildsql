## Hint 1

`==` on strings is an ordinal, case-sensitive comparison. Everything else -
ignoring case, using the current culture, using the invariant culture - is a
`StringComparison` you pass explicitly to `string.Equals`, `StartsWith`,
`IndexOf` or `Compare`.

`Ordinal` compares code units, which is fast and never changes with the
machine's locale. That is what you want for identifiers, keys and file names.

## Hint 2

```csharp
string.Equals(a.Trim(), b.Trim(), StringComparison.OrdinalIgnoreCase);
```

Handle the nulls before that line, and handle both of them: two nulls are
equal, one null is not. Writing it as a single expression is possible but the
explicit guard reads better and cannot dereference a null.

`ToUpperInvariant()` rather than `ToUpper()` for the sort key, and upper rather
than lower: upper-casing is the round-trip-safe direction for the small number
of characters where the two are not symmetric (the Turkish dotless i is the
usual example, which is also why `ToUpper()` on a Turkish machine is a real
bug and not a curiosity).
