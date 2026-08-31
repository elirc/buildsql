## Hint 1

Your code does not know the feature names, so you cannot read them by key. You
can, however, ask a section for its children — each one is a section of its own,
with a `Key` and a value.

The values are booleans, and they are stored as strings.

## Hint 2

```csharp
var children = configuration.GetSection("Dojo:D08:Features").GetChildren().ToList();

var enabled = children
    .Where(c => c.Get<bool>())
    .Select(c => c.Key)
    .OrderBy(k => k, StringComparer.Ordinal)
    .ToList();
```

`c.Get<bool>()` converts; `c.Value` would give you the string `"false"`, which
is *not* falsy in C# — testing it for truthiness leaves every disabled feature
switched on.

`known` counts every child, enabled or not: a feature switched off is still one
the application knows about.
