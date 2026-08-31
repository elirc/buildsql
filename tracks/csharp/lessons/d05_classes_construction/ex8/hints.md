## Hint 1

A fluent builder is just methods that end with `return this;`. The state lives
in private fields - a nullable host, a list of segments, and something ordered
for the query parameters.

`Build` is where the string gets assembled, and where the "you never set a
host" error belongs.

## Hint 2

The query parameters need insertion order *and* replace-in-place, which a plain
`Dictionary<,>` does not promise. A `List<KeyValuePair<string, string>>` with a
linear scan is honest and fine at this size:

```csharp
for (int i = 0; i < _query.Count; i++)
    if (_query[i].Key == trimmed) { _query[i] = new(trimmed, value); return this; }
_query.Add(new(trimmed, value));
```

The separator rule appears twice, and it is d02 ex4's rule again: `'?'` for the
first parameter and `'&'` for the rest.

Note the exception types. A blank argument is `ArgumentException` - the caller
passed something wrong. Building with no host is `InvalidOperationException` -
every argument was fine, but the object is not in a state where the operation
makes sense. Interviewers ask about that distinction surprisingly often.

Left to you: whether `Build()` may be called twice, and whether a builder is
reusable afterwards. Nothing here forbids it; decide what you would document.
