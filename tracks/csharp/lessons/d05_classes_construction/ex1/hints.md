## Hint 1

A constructor's job is to make it impossible to hold an invalid object. So the
guards come first, the assignments come last, and anything that fails throws
before a single field is set.

Two exception types, and the distinction matters: `ArgumentException` for input
that is the wrong *shape*, `ArgumentOutOfRangeException` for a value outside
its allowed *range*.

## Hint 2

```csharp
if (string.IsNullOrWhiteSpace(code))
    throw new ArgumentException("A ticket needs a code.", nameof(code));
if (seats < 1)
    throw new ArgumentOutOfRangeException(nameof(seats), "A ticket covers at least one seat.");
```

Note the argument order differs between the two types -
`ArgumentException(message, paramName)` but
`ArgumentOutOfRangeException(paramName, message)`. Getting it backwards
compiles and produces a nonsense message, so it is worth checking once.

Normalise after validating: `code.Trim().ToUpperInvariant()`. Doing it in the
constructor means every reader of `Code` gets the canonical form and nobody
downstream has to remember.

`Code` and `Seats` are get-only auto-properties, which a constructor may assign
and nothing else can.
