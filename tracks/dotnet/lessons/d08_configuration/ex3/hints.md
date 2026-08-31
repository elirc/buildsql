## Hint 1

An array in `appsettings.json` is stored as keys named `0`, `1`, `2`. The binder
knows that, so a section binds straight to a `List<string>` — you do not have to
loop over indices yourself.

An absent section is not an error. Decide what it becomes before you write the
response.

## Hint 2

```csharp
var mirrors = configuration.GetSection("Dojo:D08:Mirrors").Get<List<string>>() ?? [];
```

`Get<List<string>>()` returns `null` for a section that is not there, and the
gate wants an empty list and a 200 — an application with no mirrors configured is
not a broken application.

Worth knowing while you are here: because the keys are indices, a later
configuration layer overwrites an array *element by element*. It cannot make the
list shorter, which is a real source of stale values in layered configuration.
