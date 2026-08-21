## Hint 1

This is ex1 and ex2 again with a different section. Look at `Dojo:Mailer` in
`appsettings.json`, notice it has one key, and read the gate for the two values
that must therefore come from defaults.

The one genuinely new thing is the handler's parameter type. Read it, and ask
what "snapshot" is promising.

## Hint 2

Defaults: `DisplayName` is `"Dojo"` and `RetryCount` is `3`, both written as
property initialisers. `FromAddress` keeps its empty-string initialiser because
configuration supplies it.

Bind with `services.Configure<MailerOptions>(configuration.GetSection("Dojo:Mailer"))`.

`IOptionsSnapshot<T>` exposes the same `.Value` property as `IOptions<T>`, so
the handler body does not change at all — only the lifetime behind it does.

## Hint 3

```csharp
public string DisplayName { get; set; } = "Dojo";
public int RetryCount { get; set; } = 3;
```

and

```csharp
private static IResult GetMailer(IOptionsSnapshot<MailerOptions> options) =>
    TypedResults.Ok(options.Value);
```

Before you move on, answer this out loud: why can a singleton service inject
`IOptions<T>` but not `IOptionsSnapshot<T>`? Lesson 02 has the answer.
