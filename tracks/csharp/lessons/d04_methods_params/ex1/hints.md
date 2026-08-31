## Hint 1

An optional parameter is one with a default in the signature - and the default
must be a compile-time constant, which is why `string? source = null` works and
`= new object()` would not.

Both methods are a single interpolated string. The only decision in `Line` is
what to do when `source` is null.

## Hint 2

```csharp
return source is null ? $"[{level}] {message}" : $"[{level}] ({source}) {message}";
```

`new string(' ', indent)` builds the indent without a loop, and it gives `""`
for an indent of 0 rather than needing a special case.

The gate calls these methods with named arguments - `Log.Line("started",
source: "db")` - which is a caller-side feature you do not have to write
anything for. It works because the parameter is named `source`, which is why
renaming a public parameter is a breaking change even though nothing about the
type has changed.
