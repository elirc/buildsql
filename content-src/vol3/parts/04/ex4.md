@@PROMPT@@
## Exercise 4 - two faces, one core

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex4.cs`.

A quantity is written `"12kg"`, `"500g"` or `"3lb"`, and normalises to grams.
Build both faces of the API over one core.

- `private static bool TryCore(ReadOnlySpan<char> text, out int grams, out
  string? error)` — never throws, never allocates an exception. Errors:
  `"empty"`, `"missing unit"`, `"unknown unit '{unit}'"`,
  `"'{number}' is not a number"`, `"negative"`.
- `public static int Parse(string text)` — returns the grams or throws
  `FormatException` with the core's error as its message.
- `public static bool TryParse(string? text, out int grams)` — returns false
  instead of throwing. `null` is `false`, not an `ArgumentNullException`.
- `public static int ParseOrDefault(string? text, int fallback)`.
- `Quantity.CoreCalls` and `Quantity.ExceptionsCreated` are counters the gate
  reads.

Conversions: `kg` x 1000, `g` x 1, `lb` x 454 (whole grams, truncating).

```
Parse("12kg")            -> 12000
Parse("500g")            -> 500
Parse("3lb")             -> 1362
Parse("")                -> FormatException "empty"
Parse("7stone")          -> FormatException "unknown unit 'stone'"
TryParse("nope", out _)  -> false
TryParse(null, out _)    -> false
ParseOrDefault("x", 5)   -> 5
```

The gate calls `TryParse` ten thousand times with invalid input and asserts
`ExceptionsCreated == 0`, which fails immediately for anyone who implemented
`TryParse` as `try { Parse(text); } catch { return false; }`.

```
uv run dojo test csharp v3cc04_exception_design ex4
```
@@HINTS@@
## Hint 1

Write the core first and give it no opinion about how failure should be
reported. It returns a bool and an error string; it does not know whether its
caller wants an exception. Both public faces are then three lines each, and the
parsing logic exists once.

## Hint 2

The two faces, once the core exists:

```csharp
public static int Parse(string text) =>
    TryCore(text, out int grams, out string? error)
        ? grams
        : throw new FormatException(error);
```

`throw` is an expression in a conditional since C# 7, which is why this fits on
one line. `TryParse` is the same call discarding the error with `out _`.

## Hint 3

Splitting the number from the unit is the only fiddly part: walk from the start
while the characters are digits, then everything after is the unit. Do it on a
`ReadOnlySpan<char>` and no substring is allocated on the failure path either —
which matters, because the whole point of the `Try` face is that failing is
cheap. Decide what `"12"` with no unit should do, and make the error message
say it.
@@IMPORTANT@@
## Hint 1

Ask who each face is for. `Parse` is for input you believe is valid — a config
file your deployment produced, a value you wrote — where a failure is a genuine
fault and the exception carries the diagnosis. `TryParse` is for input you
expect to be wrong sometimes: a form field, a CSV from a customer. Same logic,
different contract about whether failure is exceptional.

## Hint 2

Why catch-around-`Parse` is a bug and not a shortcut, in numbers: a throw
caught one frame away costs roughly five microseconds. Validating ten thousand
user-supplied rows where a tenth are bad is a thousand throws, so five
milliseconds of pure exception machinery — for outcomes you fully expected. The
BCL's own `int.TryParse` exists for precisely this reason.

## Hint 3

Counting is part of the exercise, so be careful where you increment.
`CoreCalls` goes up once per `TryCore` invocation, including the ones inside
`Parse` — so `Parse` must not call the core twice, which it does if you
validate first and then parse. `ExceptionsCreated` goes up where the exception
is constructed, not where it is caught; if that number is above zero on the
`TryParse` path, the implementation is wrong regardless of what it returns.
@@REF@@
// v3cc04_exception_design / ex4 - two faces, one core.
// See lessons/v3cc04_exception_design/README.md, "Exercise 4".

namespace CSharpDojo.V3CC04_ExceptionDesign;

/// <summary>
/// One parsing core with no opinion about how failure should be reported, and
/// two faces over it: Parse throws, TryParse does not. The Try face never
/// constructs an exception, which is the entire reason the pattern exists.
/// </summary>
public static class Quantity
{
    public static int CoreCalls { get; private set; }

    public static int ExceptionsCreated { get; private set; }

    public static void ResetCounters()
    {
        CoreCalls = 0;
        ExceptionsCreated = 0;
    }

    public static int Parse(string text)
    {
        ArgumentNullException.ThrowIfNull(text);

        if (TryCore(text, out int grams, out string? error))
        {
            return grams;
        }

        ExceptionsCreated++;
        throw new FormatException(error);
    }

    public static bool TryParse(string? text, out int grams)
    {
        // null is a legitimate "no" here, not a caller error: the Try face
        // exists precisely for input that may be anything.
        if (text is null)
        {
            grams = 0;
            return false;
        }

        return TryCore(text, out grams, out _);
    }

    public static int ParseOrDefault(string? text, int fallback) =>
        TryParse(text, out int grams) ? grams : fallback;

    /// <summary>
    /// Never throws, never allocates an exception, and allocates no substring
    /// on the failure path.
    /// </summary>
    private static bool TryCore(ReadOnlySpan<char> text, out int grams, out string? error)
    {
        CoreCalls++;
        grams = 0;

        if (text.IsEmpty)
        {
            error = "empty";
            return false;
        }

        int split = 0;
        while (split < text.Length && char.IsAsciiDigit(text[split]))
        {
            split++;
        }

        ReadOnlySpan<char> number = text[..split];
        ReadOnlySpan<char> unit = text[split..];

        if (number.IsEmpty)
        {
            error = $"'{text.ToString()}' is not a number";
            return false;
        }

        if (unit.IsEmpty)
        {
            error = "missing unit";
            return false;
        }

        if (!int.TryParse(number, out int value))
        {
            error = $"'{number.ToString()}' is not a number";
            return false;
        }

        if (value < 0)
        {
            error = "negative";
            return false;
        }

        int multiplier = unit switch
        {
            "kg" => 1000,
            "g" => 1,
            "lb" => 454,
            _ => 0,
        };

        if (multiplier == 0)
        {
            error = $"unknown unit '{unit.ToString()}'";
            return false;
        }

        grams = value * multiplier;
        error = null;
        return true;
    }
}
