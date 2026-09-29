@@PROMPT@@
## Exercise 2 - guards, in one line each

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex2.cs`.

`Ledger.Post(string account, decimal amount, int sequence)` currently has
hand-rolled guards. Replace them with the .NET 8 helpers so that:

- `account` null throws `ArgumentNullException` with `ParamName` `"account"`;
- `account` empty or whitespace throws `ArgumentException` with the same
  `ParamName`;
- `amount` zero or negative throws `ArgumentOutOfRangeException` with
  `ParamName` `"amount"` and `ActualValue` equal to the amount;
- `sequence` less than the ledger's `NextSequence` throws
  `ArgumentOutOfRangeException` with `ParamName` `"sequence"`;
- posting to a disposed ledger throws `ObjectDisposedException`.

None of the guards may contain the string `"account"`, `"amount"` or
`"sequence"` as a literal — the parameter names must come from
`CallerArgumentExpression`.

Then write the domain guard:

- `Require.Balanced(decimal debits, decimal credits)` throws
  `InvalidOperationException($"unbalanced: {debits} != {credits}")` when they
  differ, and the throw itself lives in a private
  `[DoesNotReturn] static void ThrowUnbalanced(...)` so the guard stays small
  enough to inline.
- `Require.NotBlank(string? value)` throws `ArgumentException` naming the
  *caller's* expression — so `Require.NotBlank(customer.Name)` reports
  `"customer.Name"`.

```
Post(null!, 5m, 1)        -> ArgumentNullException, ParamName "account"
Post("cash", -1m, 1)      -> ArgumentOutOfRangeException, ActualValue -1
Require.NotBlank(customer.Name)  -> ArgumentException, ParamName "customer.Name"
Require.Balanced(10m, 10m)       -> no throw
```

```
uv run dojo test csharp v3cc04_exception_design ex2
```
@@HINTS@@
## Hint 1

Every guard you are replacing has the same three parts: a condition, an
exception type, and a parameter name. The helpers supply the second and third,
so what is left at the call site is only the condition — and often not even
that.

## Hint 2

The five you need are all static methods on the exception types themselves:

```csharp
ArgumentNullException.ThrowIfNull(source);
ArgumentException.ThrowIfNullOrWhiteSpace(name);
ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
ArgumentOutOfRangeException.ThrowIfLessThan(sequence, minimum);
ObjectDisposedException.ThrowIf(disposed, this);
```

Note the ordering trap: `ThrowIfNullOrWhiteSpace` covers null as well, so a
separate null check before it is redundant — but the *exception type* differs
(`ArgumentNullException` versus `ArgumentException`), and the gate checks
which one you produce for null.

## Hint 3

For your own helper, the attribute goes on an optional last parameter:

```csharp
public static void NotBlank(string? value,
    [CallerArgumentExpression(nameof(value))] string? expression = null)
```

The compiler fills it in with the caller's source text. Decide what to do if a
caller passes the expression explicitly — they can, it is just a parameter — and
whether that is a problem worth guarding against.
@@IMPORTANT@@
## Hint 1

The reason to care is a refactor. A hand-rolled guard says
`nameof(accountId)`; someone renames the parameter to `account` and the
`nameof` follows, or does not, depending on whether they used the string form.
`CallerArgumentExpression` cannot drift, because it is captured at the call
site by the compiler.

## Hint 2

`[DoesNotReturn]` is not decoration. It tells the compiler's flow analysis that
control never comes back:

```csharp
[DoesNotReturn]
private static void ThrowUnbalanced(decimal debits, decimal credits) =>
    throw new InvalidOperationException($"unbalanced: {debits} != {credits}");
```

Without it, nullable analysis after the call assumes execution continues, and
you get spurious "may be null" warnings in the code that follows a guard.

## Hint 3

Notice why the BCL splits guards this way at all: a method containing
`throw new ...` carries the exception construction in its body, which makes it
bigger and less likely to be inlined. Moving the throw into a separate
`[DoesNotReturn]` method leaves the guard as a comparison and a call. Measure
it if you like — this is the same reasoning the benchmarking sector will teach
you to check rather than assume.
@@REF@@
// v3cc04_exception_design / ex2 - guards, in one line each.
// See lessons/v3cc04_exception_design/README.md, "Exercise 2".

using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace CSharpDojo.V3CC04_ExceptionDesign;

public sealed class Ledger : IDisposable
{
    private bool disposed;

    public int NextSequence { get; private set; } = 1;

    public decimal Total { get; private set; }

    public void Post(string account, decimal amount, int sequence)
    {
        ObjectDisposedException.ThrowIf(disposed, this);

        // Null first: ThrowIfNullOrWhiteSpace would also catch null, but it
        // throws ArgumentException, and null deserves ArgumentNullException.
        ArgumentNullException.ThrowIfNull(account);
        ArgumentException.ThrowIfNullOrWhiteSpace(account);

        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
        ArgumentOutOfRangeException.ThrowIfLessThan(sequence, NextSequence);

        Total += amount;
        NextSequence = sequence + 1;
    }

    public void Dispose() => disposed = true;
}

public static class Require
{
    /// <summary>
    /// The condition stays here; the throw lives in its own method so this one
    /// is small enough for the JIT to inline into its caller.
    /// </summary>
    public static void Balanced(decimal debits, decimal credits)
    {
        if (debits != credits)
        {
            ThrowUnbalanced(debits, credits);
        }
    }

    /// <summary>
    /// Reports the caller's own expression: Require.NotBlank(customer.Name)
    /// names "customer.Name", which no nameof at this level could produce.
    /// </summary>
    public static void NotBlank(
        string? value,
        [CallerArgumentExpression(nameof(value))] string? expression = null)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("must not be blank", expression);
        }
    }

    [DoesNotReturn]
    private static void ThrowUnbalanced(decimal debits, decimal credits) =>
        throw new InvalidOperationException($"unbalanced: {debits} != {credits}");
}
