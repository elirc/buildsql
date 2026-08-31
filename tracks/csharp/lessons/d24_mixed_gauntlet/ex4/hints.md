## Hint 1

A `Dictionary<string, Func<string, string>>` holds the handlers and a
`List<string>` remembers the registration order - a dictionary promises nothing
about the order it enumerates in, so you cannot get `Names` from it.

`Run` has two different failures to report, and they must not look the same.

## Hint 2

"No such command" is the caller asking for something that does not exist:
`KeyNotFoundException`, from a `TryGetValue` that came back false.

"The handler threw" is a different thing entirely - the command exists and
failed at its job - so it is caught and wrapped:

```csharp
catch (Exception ex)
{
    throw new InvalidOperationException($"command failed: {name}", ex);
}
```

Passing `ex` is what keeps the distinction useful: the caller can tell a
dispatch problem from a handler problem *and* still see what the handler
actually did.

In `Register`, check `ContainsKey` first and throw before touching either
collection, so a refused registration leaves the name list alone too.
