@@PROMPT@@
## Exercise 1 - an exception worth catching

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex1.cs`.

`ImportFailedException` is a `sealed` exception with:

- the two conventional constructors: `(string message)` and
  `(string message, Exception inner)`;
- `required int Line { get; init; }` and `required string Field { get; init; }`;
- `string Describe()` returning `"line {Line}: {Field} - {Message}"`.

`ImportRules.Validate(int line, string field, string value)` throws it when a
rule fails, with the data filled in and a message that names the offending
value:

- an empty or whitespace `value` -> `"'{field}' is empty"`
- `field` is `"qty"` and `value` does not parse as a non-negative integer ->
  `"'{value}' is not a quantity"`
- `field` is `"code"` and `value` is longer than 8 characters ->
  `"'{value}' is longer than 8 characters"`

`ImportRules.ValidateAll(IEnumerable<(int Line, string Field, string Value)>
rows)` validates every row and throws a single `AggregateException` holding
every `ImportFailedException`, in row order, or returns quietly when all pass.

```
Validate(7, "qty", "-3")
  -> ImportFailedException { Line = 7, Field = "qty", Message = "'-3' is not a quantity" }
  -> Describe() == "line 7: qty - '-3' is not a quantity"

Validate(1, "code", "ABC")   // no throw
ValidateAll([(1, "qty", "x"), (2, "code", "TOO-LONG-CODE")])
  -> AggregateException with 2 inner ImportFailedExceptions, lines 1 then 2
```

```
uv run dojo test csharp v3cc04_exception_design ex1
```
@@HINTS@@
## Hint 1

Design for the person catching it. They will want to know *which line* and
*which field* without parsing your sentence, so those are properties. They will
want to catch exactly this failure and not everything, so it is a specific
sealed type. The message is for a human, and it should contain the value that
caused the problem.

## Hint 2

`required` on an `init` property makes the compiler enforce what a constructor
parameter would, without a constructor explosion:

```csharp
throw new ImportFailedException($"'{value}' is not a quantity")
{
    Line = line,
    Field = field,
};
```

Omit either property at a throw site and it will not compile — which is exactly
the guarantee you want for data a caller is going to branch on.

## Hint 3

`ValidateAll` must run every row before throwing, so callers see all the
failures rather than the first. Collect into a list, and decide what to do when
that list has exactly one entry — an `AggregateException` wrapping a single
exception is still an aggregate, and choosing deliberately between "always
aggregate" and "rethrow the single one" is the design decision the gate checks.
@@IMPORTANT@@
## Hint 1

Ask what you would not do. You would not create a base `AppException` that
everything derives from — everyone would catch it, and it would be
`catch (Exception)` with extra ceremony. You would not put a `Code` string on it
in place of a type. Knowing the anti-designs is half of knowing the design.

## Hint 2

The message-and-inner constructor exists for wrapping, and it is not optional
even though nothing here uses it yet:

```csharp
catch (FormatException ex)
{
    throw new ImportFailedException("row could not be read", ex) { Line = n, Field = f };
}
```

Without that constructor there is no way to attach the original cause, and a
wrapper without an inner exception has destroyed the only record of what
actually failed.

## Hint 3

Write the validation rules as separate small checks in a fixed order and make
that order explicit, because a value can break more than one rule — an empty
`"qty"` is both empty and unparseable. Decide which message wins, and note that
the gate checks the message text, so "whichever check happens to be first" is
not good enough as an answer.
@@REF@@
// v3cc04_exception_design / ex1 - an exception worth catching.
// See lessons/v3cc04_exception_design/README.md, "Exercise 1".

namespace CSharpDojo.V3CC04_ExceptionDesign;

/// <summary>
/// A specific type callers can catch, structured data they can branch on, and
/// a message a human can act on. Sealed: there is no hierarchy to justify.
/// </summary>
public sealed class ImportFailedException : Exception
{
    public ImportFailedException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Not optional, even when nothing wraps yet: without it there is no way
    /// to attach the original cause.
    /// </summary>
    public ImportFailedException(string message, Exception inner)
        : base(message, inner)
    {
    }

    public required int Line { get; init; }

    public required string Field { get; init; }

    public string Describe() => $"line {Line}: {Field} - {Message}";
}

public static class ImportRules
{
    public static void Validate(int line, string field, string value)
    {
        ArgumentNullException.ThrowIfNull(field);
        ArgumentNullException.ThrowIfNull(value);

        // Emptiness first: an empty "qty" is both empty and unparseable, and
        // the more specific complaint would be the less useful one.
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ImportFailedException($"'{field}' is empty") { Line = line, Field = field };
        }

        if (field == "qty" && (!int.TryParse(value, out int quantity) || quantity < 0))
        {
            throw new ImportFailedException($"'{value}' is not a quantity") { Line = line, Field = field };
        }

        if (field == "code" && value.Length > 8)
        {
            throw new ImportFailedException($"'{value}' is longer than 8 characters")
            {
                Line = line,
                Field = field,
            };
        }
    }

    /// <summary>
    /// Every row is validated before anything is thrown: a caller fixing an
    /// import wants the whole list, not the first line of it. Always an
    /// aggregate, even for one failure, so the caller's handling is uniform.
    /// </summary>
    public static void ValidateAll(IEnumerable<(int Line, string Field, string Value)> rows)
    {
        ArgumentNullException.ThrowIfNull(rows);

        List<Exception> failures = new();
        foreach ((int line, string field, string value) in rows)
        {
            try
            {
                Validate(line, field, value);
            }
            catch (ImportFailedException ex)
            {
                failures.Add(ex);
            }
        }

        if (failures.Count > 0)
        {
            throw new AggregateException("the import has invalid rows", failures);
        }
    }
}
