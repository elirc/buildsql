## Hint 1

The exception type is already declared for you to fill in: a constructor that
takes the message, the line and the cause, and a get-only `Line`. The cause
does not get its own field - `Exception` already has somewhere to put it.

`SumLines` needs a counter, because the line number is part of the report.

## Hint 2

```csharp
public ImportException(string message, int line, Exception inner)
    : base(message, inner)
{
    Line = line;
}
```

`base(message, inner)` is the only way to set `InnerException`; there is no
setter.

In `SumLines`, wrap just the parse:

```csharp
catch (FormatException ex)
{
    throw new ImportException($"bad line {number}", number, ex);
}
```

Passing `ex` is not decoration. Without it the only record of what actually
failed - which parse, on what input, from where - is gone, and all anyone will
ever see is your own message.
