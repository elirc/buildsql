## Hint 1

The whole colon-separated path is the key — configuration is a flat dictionary,
so there is nothing to navigate into. Three reads, three fallbacks.

Two of the three values are not strings, and every configuration value is stored
as one.

## Hint 2

```csharp
string title = configuration["Dojo:D08:Site:Title"] ?? "(untitled)";
int pageSize = configuration.GetValue("Dojo:D08:Site:PageSize", 10);
bool beta = configuration.GetValue("Dojo:D08:Site:Beta", false);
```

The indexer gives you `string?`; `GetValue<T>(key, default)` converts and falls
back in one call.

Avoid `int.Parse(configuration["…"]!)`: it throws on a missing key, and it
throws at the moment the value is *used* rather than at startup, which is the
worst possible time to find out.
