@@PROMPT@@
## Exercise 8 - results at the edge

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex8.cs`.

Expected failures return; genuine faults throw; exactly one place converts
between the two.

`readonly record struct Result<T>`:

- `static Result<T> Ok(T value)` and `static Result<T> Fail(string error)`.
- `bool IsOk`, `T? Value`, `string? Error`.
- `Result<TNext> Map<TNext>(Func<T, TNext> map)` — maps on success, passes the
  error through on failure, and never invokes `map` on a failure.
- `T ValueOrThrow()` — the deliberate conversion back to an exception.

`Rules.Check(string code, int quantity)` returns `Result<Order>`, using
failures for the expected cases — an empty code, a quantity outside 1..999 —
and no exceptions at all.

`Edge.Handle(Func<Result<Order>> operation)` is the boundary. It returns
`(int Status, string Body)`:

- a successful result -> `(200, order.Code)`;
- a failed result -> `(400, error)`;
- an exception escaping `operation` -> `(500, "internal error")`, and the
  exception's message is *not* leaked to the body.

`Rules.ExceptionsCreated` counts exception constructions so the gate can hold
the expected path to zero.

```
Rules.Check("A1", 5)        -> Ok, Order("A1", 5)
Rules.Check("", 5)          -> Fail "code is required"
Rules.Check("A1", 0)        -> Fail "quantity must be between 1 and 999"
Edge.Handle(() => Rules.Check("A1", 5))   -> (200, "A1")
Edge.Handle(() => Rules.Check("", 5))     -> (400, "code is required")
Edge.Handle(() => throw new IOException("disk /dev/sda1 offline"))
  -> (500, "internal error")
```

The gate runs ten thousand invalid checks and asserts `ExceptionsCreated == 0`.

```
uv run dojo test csharp v3cc04_exception_design ex8
```
@@HINTS@@
## Hint 1

The design rule is about *where*, not *whether*. Inside the component,
expected failures are values. At the edge — one method — anything that escaped
becomes a status code. A codebase with both channels active everywhere is
worse than either alone, because every caller has to handle two.

## Hint 2

`Map` is what makes results composable rather than a nest of `if`s:

```csharp
Result<string> name = Rules.Check(code, qty).Map(order => order.Code);
```

The important part is that `map` is not called on the failure path — so a
chain of five maps over a failed result does no work at all and carries the
original error to the end.

## Hint 3

`Edge.Handle` is the only place with a `catch`, and it should catch broadly
*and* say so. Note what it must not do: put `ex.Message` in the body. A message
like `"disk /dev/sda1 offline"` tells an attacker about your infrastructure,
and tells the user nothing they can act on. Log it, return a generic body, and
decide whether to include a correlation id — that is the design decision the
gate is silent about and a reviewer would not be.
@@IMPORTANT@@
## Hint 1

Ask which failures belong in which channel before you write anything. A
quantity of zero is expected — a user typed it. A disk going offline is not.
The test is not severity, it is whether the caller could have prevented it and
whether it happens routinely.

## Hint 2

`Result<T>` as a `readonly record struct` gives you equality, deconstruction
and no heap allocation, which is what makes the expected-failure path cheap:

```csharp
public readonly record struct Result<T>(bool IsOk, T? Value, string? Error);
```

If it were a class, ten thousand failures would be ten thousand allocations —
better than ten thousand exceptions, still worse than none.

## Hint 3

`ValueOrThrow` is the one place inside the component that converts back, and
it should be rare enough to notice. Decide what exception it throws — a
generic `InvalidOperationException` with the error as its message is the usual
answer — and be able to explain why calling it in a loop would undo everything
the type was for.
@@REF@@
// v3cc04_exception_design / ex8 - results at the edge.
// See lessons/v3cc04_exception_design/README.md, "Exercise 8".

namespace CSharpDojo.V3CC04_ExceptionDesign;

public readonly record struct Order(string Code, int Quantity);

/// <summary>
/// A struct on purpose: an expected failure costs a return, not an
/// allocation, and certainly not a throw.
/// </summary>
public readonly record struct Result<T>
{
    private Result(bool isOk, T? value, string? error)
    {
        IsOk = isOk;
        Value = value;
        Error = error;
    }

    public bool IsOk { get; }

    public T? Value { get; }

    public string? Error { get; }

    public static Result<T> Ok(T value) => new(true, value, null);

    public static Result<T> Fail(string error)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(error);
        return new Result<T>(false, default, error);
    }

    /// <summary>
    /// Maps on success only: a chain over a failed result does no work and
    /// carries the original error to the end.
    /// </summary>
    public Result<TNext> Map<TNext>(Func<T, TNext> map)
    {
        ArgumentNullException.ThrowIfNull(map);

        return IsOk ? Result<TNext>.Ok(map(Value!)) : Result<TNext>.Fail(Error!);
    }

    /// <summary>The deliberate conversion back. Rare enough to notice.</summary>
    public T ValueOrThrow() =>
        IsOk ? Value! : throw new InvalidOperationException(Error);
}

public static class Rules
{
    public static int ExceptionsCreated { get; private set; }

    public static void ResetCounters() => ExceptionsCreated = 0;

    /// <summary>
    /// Every failure here is expected - a person typed it - so every failure
    /// is a value.
    /// </summary>
    public static Result<Order> Check(string code, int quantity)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return Result<Order>.Fail("code is required");
        }

        if (quantity is < 1 or > 999)
        {
            return Result<Order>.Fail("quantity must be between 1 and 999");
        }

        return Result<Order>.Ok(new Order(code, quantity));
    }
}

public static class Edge
{
    /// <summary>
    /// The one place that converts. Catches broadly on purpose, and never
    /// leaks the exception's message: "disk /dev/sda1 offline" tells an
    /// attacker about the infrastructure and the user nothing they can use.
    /// </summary>
    public static (int Status, string Body) Handle(Func<Result<Order>> operation)
    {
        ArgumentNullException.ThrowIfNull(operation);

        try
        {
            Result<Order> result = operation();
            return result.IsOk
                ? (200, result.Value.Code)
                : (400, result.Error!);
        }
        catch (Exception)
        {
            // A real edge would log the exception here with a correlation id
            // and return that id in the body.
            return (500, "internal error");
        }
    }
}
