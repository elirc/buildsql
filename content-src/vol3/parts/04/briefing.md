# V3·C4 — Exceptions: designing them, throwing them, and what they cost

You already know the mechanics: `try`, `catch`, `finally`, `throw;` versus
`throw ex;`, and that a `finally` runs on the way past. This sector is about
the decisions those mechanics serve. Which exception type should exist at all.
What a caller is supposed to *do* with the one you threw. Whether a failure is
exceptional or expected. And what the whole apparatus costs, so that "don't use
exceptions for control flow" becomes a number rather than a slogan.

The organising idea: **an exception is an API**. It has a type a caller can
catch, data a caller can branch on, and a message a human reads at three in the
morning. If none of those three are useful, you have thrown noise.

## Design the type, not the message

```csharp
public sealed class ImportFailedException : Exception
{
    public ImportFailedException(string message) : base(message) { }
    public ImportFailedException(string message, Exception inner) : base(message, inner) { }

    public required int Line { get; init; }
    public required string Field { get; init; }
}
```

Three properties make an exception worth catching. A **specific type**, so a
caller can catch exactly this and nothing else. **Structured data** — `Line`,
`Field` — so the caller does not have to parse your message with a regular
expression. And an **inner exception** wherever you wrap, so the original cause
survives.

What not to do: a single `AppException` with a string code. Everyone ends up
catching it, which is the same as catching `Exception`, and the code becomes a
second type system nobody checks.

## The guard clause got a lot shorter

```csharp
public void Take(string name, int count)
{
    ArgumentNullException.ThrowIfNull(name);
    ArgumentOutOfRangeException.ThrowIfNegative(count);
    ObjectDisposedException.ThrowIf(disposed, this);
    ...
}
```

Each of these is one line, throws the right type, and — via
`CallerArgumentExpression` — fills in the parameter name for you without a
`nameof`. They also keep the throwing code out of the method body, which lets
the JIT inline the happy path; a method containing a `throw new` is bigger and
harder to inline, which is why the BCL moved all of its guards into throw
helpers.

## The cost, honestly

Throwing an exception is roughly **three to five orders of magnitude** more
expensive than returning a value: capturing a stack trace, walking the frames
looking for a handler, running any filters, and unwinding. On .NET 8 a
caught-and-handled throw is in the region of 5 to 20 microseconds against a
handful of nanoseconds for a return.

Which means two things, both true:

- In a loop running a million times, exceptions as control flow are a
  catastrophe.
- At a request boundary handling a thousand requests a second, one exception
  per failed request is invisible.

The rule that follows is not "never throw". It is **do not use exceptions for
outcomes you expect**. A parse that fails on user input is expected. A database
that is down is not.

## Exercise 1 - an exception worth catching

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex1.cs`. Design
`ImportFailedException`: sealed, the conventional constructors, structured
`Line` and `Field` properties, and a message that names the offending value.
Then `ImportRules.Validate` throws it with the data filled in.

```
uv run dojo test csharp v3cc04_exception_design ex1
```

## Exercise 2 - guards, in one line each

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex2.cs`. Rewrite a method's hand-rolled
guards using the `ThrowIf` helpers, then write your own `[DoesNotReturn]`
helper for a domain rule and see what `CallerArgumentExpression` puts in the
parameter name for free.

```
uv run dojo test csharp v3cc04_exception_design ex2
```

## Exercise 3 - filters decide before unwinding

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex3.cs`. `when` clauses that branch on
*structured data*, not on parsed messages, plus the observable difference: a
filter runs before the stack unwinds, so a `finally` further down the stack has
not run yet when the filter is evaluated. The log proves it.

```
uv run dojo test csharp v3cc04_exception_design ex3
```

## Exercise 4 - two faces, one core

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex4.cs`. Implement `Quantity.Parse`
and `Quantity.TryParse` over a single core routine, where the `Try` form
allocates no exception at all. The gate counts core invocations and exception
constructions, so catch-around-`Parse` fails visibly.

```
uv run dojo test csharp v3cc04_exception_design ex4
```

## Exercise 5 - preserving the evidence

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex5.cs`. Four ways to re-throw —
`throw;`, `throw ex;`, wrapping with an inner exception, and
`ExceptionDispatchInfo` — and the gate inspects the resulting inner-exception
chain and stack traces to tell which one you used.

```
uv run dojo test csharp v3cc04_exception_design ex5
```

## Exercise 6 - what async does to a failure

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex6.cs`. An exception thrown before
the first `await` versus one thrown inside the task; `await` surfacing only the
first failure of a `Task.WhenAll` while `task.Exception` holds them all; and
collecting every failure honestly.

```
uv run dojo test csharp v3cc04_exception_design ex6
```

## Exercise 7 - cancellation is not failure

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex7.cs`. Distinguish a caller's
cancellation from a timeout — both arrive as `OperationCanceledException` — using
a linked token source, and classify the outcome so that a cancelled request is
never logged as an error.

```
uv run dojo test csharp v3cc04_exception_design ex7
```

## Exercise 8 - results at the edge

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex8.cs`. A small `Result<T>` type, a
hot path that never throws, and a boundary that converts exceptions to results
exactly once. The gate counts exception constructions across ten thousand
operations and holds you to zero on the expected-failure path.

```
uv run dojo test csharp v3cc04_exception_design ex8
```

## Challenge

`FailurePipeline` classifies each failure as transient, permanent or cancelled,
retries only the transient ones on a deterministic backoff schedule, never
retries a cancellation, and aggregates the permanent failures. It is the shape
of every resilient client you will ever write, with the classification made
explicit instead of buried in a `catch`.

## Review

`review1` reads handling code and asks what the *caller* actually observes:
the exception type, the message, and the chain of inner exceptions in order.
Then you fix the rethrow that destroyed the trace. Predicting the observable
result of error handling is the skill that makes production logs legible.
