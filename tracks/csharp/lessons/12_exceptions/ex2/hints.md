## Hint 1

Two things to fix. One of the `ConfigurationException` constructors quietly
loses its `inner` argument — look at what it passes to `base`. And `LoadPort`
has to catch what `int.Parse` throws and rethrow it wrapped.

`int.Parse` throws two different things here: `FormatException` for `"abc"`,
`ArgumentNullException` for `null`. The gate checks both.

## Hint 2

The base `Exception` class has a constructor taking a message **and** an inner
exception. Passing the inner one through is a one-word change:

```csharp
public ConfigurationException(string message, Exception inner)
    : base(message, inner)
{
}
```

In `LoadPort`, catch, build the message, and throw yours with the original
attached:

```csharp
catch (Exception original) when (original is FormatException or ArgumentNullException)
{
    throw new ConfigurationException($"bad port: {text ?? "null"}", original);
}
```

`text ?? "null"` is what produces `"bad port: null"` rather than `"bad port: "`.

## Hint 3

Two catch blocks (one per exception type) work just as well as the single
filtered one above, and are arguably clearer. What you must *not* do is
`catch (Exception)` with no filter: that would also swallow an
`OutOfMemoryException` and report it as a bad port number.

Why keep the inner exception at all? Because your `ConfigurationException`'s
stack trace starts where *you* threw it. The inner one remembers where the
failure actually happened, and every logger prints the chain. Throwing away the
cause is the single most common way a team ends up staring at
"Configuration error" with no idea which line produced it.

Left to you: whether the caught variable should be named `original`, `ex`, or
`inner`. Small thing; the code reads differently for each.
