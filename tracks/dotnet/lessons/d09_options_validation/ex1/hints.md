## Hint 1

One line. The endpoint already asks for `IOptions<ArchiveOptions>` and always
gets one — the question is whether anything ever told it which configuration
section to read.

That silence is the point: nothing throws, you just get defaults.

## Hint 2

```csharp
services.AddOptions<ArchiveOptions>().BindConfiguration("Dojo:D09:Archive");
```

`services.Configure<ArchiveOptions>(configuration.GetSection("Dojo:D09:Archive"))`
is the older spelling and does the same job; `BindConfiguration` resolves
`IConfiguration` from the container itself, which is why it needs no second
argument.

The class defaults survive whatever the section does not mention — the binder
only writes properties it found keys for.
