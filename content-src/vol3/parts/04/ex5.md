@@PROMPT@@
## Exercise 5 - preserving the evidence

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex5.cs`.

Four ways to send an exception onward, and the gate can tell them apart.

`Deep.Fail(int depth)` recurses `depth` times and then throws
`InvalidOperationException("bottom")`, so the trace has frames worth losing.

Implement `Rethrower` with four methods, each catching that exception and
sending it on differently:

- `Preserve(int depth)` — `throw;`. Same instance, trace intact, and the trace
  still names `Fail`.
- `Reset(int depth)` — `throw ex;`. Same instance, trace now starts at your
  line; `Fail` is gone from it.
- `Wrap(int depth)` — `throw new ImportFailedException("could not import", ex)
  { Line = depth, Field = "source" }`. New type, original hanging off
  `InnerException`.
- `Dispatch(int depth)` — capture with
  `ExceptionDispatchInfo.Capture(ex)`, return from the catch block, and throw
  it **outside** the catch. Same instance, trace preserved.

Then `TraceReport.Describe(Action work)` runs an action, catches whatever
comes out, and returns
`(string Type, string? InnerType, bool MentionsFail)` where `MentionsFail` is
whether the outermost exception's own `StackTrace` still contains `"Fail"`.

```
Describe(() => Rethrower.Preserve(5))
  -> ("InvalidOperationException", null, true)
Describe(() => Rethrower.Reset(5))
  -> ("InvalidOperationException", null, false)
Describe(() => Rethrower.Wrap(5))
  -> ("ImportFailedException", "InvalidOperationException", false)
Describe(() => Rethrower.Dispatch(5))
  -> ("InvalidOperationException", null, true)
```

```
uv run dojo test csharp v3cc04_exception_design ex5
```
@@HINTS@@
## Hint 1

The question each variant answers is "what will the person reading the log
see?". `throw;` shows them where it really happened. `throw ex;` shows them
your catch block. Wrapping shows them your meaning with the truth underneath.
Dispatch is `throw;` for when you are no longer inside the catch.

## Hint 2

The two that look identical and are not:

```csharp
catch (Exception ex)
{
    throw;      // the exception in flight continues; frames below are kept
    throw ex;   // the same object, rethrown from here; StackTrace overwritten
}
```

`throw ex;` is legal, compiles without a warning in most configurations, and is
the single most common way a .NET stack trace becomes useless.

## Hint 3

`Dispatch` has a shape the others do not: capture inside the catch, throw
outside it.

```csharp
ExceptionDispatchInfo? captured = null;
try { ... } catch (Exception ex) { captured = ExceptionDispatchInfo.Capture(ex); }
captured?.Throw();
```

Note that the compiler cannot see that `Throw()` never returns, so you may need
a `return default;` or a `throw` after it to satisfy definite assignment.
Decide how to express "unreachable" and whether `[DoesNotReturn]` from ex2
would have helped here.
@@IMPORTANT@@
## Hint 1

Think about the wrapping case as a layer boundary. Inside your import
component, a `FormatException` from a number parse is meaningful. To your
caller it is noise — they do not know you parse numbers. `ImportFailedException`
with the original inside translates without destroying, and that is the only
justification for wrapping at all.

## Hint 2

`ExceptionDispatchInfo` is not an exotic API — it is what the runtime itself
uses. When you `await` a faulted task, the exception was stored in the task
earlier, possibly on another thread, and has to be rethrown on yours with its
original trace: that is exactly `ExceptionDispatchInfo.Capture(...).Throw()`.
Recognising it in a stack trace ("End of stack trace from previous location")
tells you an async boundary was crossed.

## Hint 3

For `Describe`, be careful what you read. `ex.StackTrace` on the outer
exception is the outer one's trace only — an `ImportFailedException` wrapping a
deep failure has a short trace of its own, and the interesting frames are on
`ex.InnerException.StackTrace`. That distinction is why `MentionsFail` is
false for the wrapping case even though the information is not lost, and being
able to explain that sentence is the exercise.
@@REF@@
// v3cc04_exception_design / ex5 - preserving the evidence.
// See lessons/v3cc04_exception_design/README.md, "Exercise 5".

using System.Runtime.CompilerServices;
using System.Runtime.ExceptionServices;

namespace CSharpDojo.V3CC04_ExceptionDesign;

public static class Deep
{
    /// <summary>Recurses so the stack trace has frames worth losing.</summary>
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void Fail(int depth)
    {
        if (depth > 0)
        {
            Fail(depth - 1);
            return;
        }

        throw new InvalidOperationException("bottom");
    }
}

public static class Rethrower
{
    /// <summary>The exception in flight continues; the frames below survive.</summary>
    public static void Preserve(int depth)
    {
        try
        {
            Deep.Fail(depth);
        }
        catch (InvalidOperationException)
        {
            throw;
        }
    }

    /// <summary>
    /// The same object, rethrown from here - which overwrites StackTrace and
    /// deletes every frame between the original throw and this line.
    /// </summary>
    public static void Reset(int depth)
    {
        try
        {
            Deep.Fail(depth);
        }
        catch (InvalidOperationException ex)
        {
            throw ex;
        }
    }

    /// <summary>
    /// Translation at a layer boundary: a new type that means something to the
    /// caller, with the original cause attached rather than discarded.
    /// </summary>
    public static void Wrap(int depth)
    {
        try
        {
            Deep.Fail(depth);
        }
        catch (InvalidOperationException ex)
        {
            throw new ImportFailedException("could not import", ex)
            {
                Line = depth,
                Field = "source",
            };
        }
    }

    /// <summary>
    /// `throw;` for when you are no longer inside the catch - the same
    /// machinery await uses to resurface a faulted task's exception.
    /// </summary>
    public static void Dispatch(int depth)
    {
        ExceptionDispatchInfo? captured = null;

        try
        {
            Deep.Fail(depth);
        }
        catch (InvalidOperationException ex)
        {
            captured = ExceptionDispatchInfo.Capture(ex);
        }

        captured?.Throw();
    }
}

public static class TraceReport
{
    public static (string Type, string? InnerType, bool MentionsFail) Describe(Action work)
    {
        ArgumentNullException.ThrowIfNull(work);

        try
        {
            work();
        }
        catch (Exception ex)
        {
            // The OUTER exception's own trace. A wrapper has a short one of
            // its own; the interesting frames are on InnerException.
            bool mentionsFail = ex.StackTrace?.Contains("Fail", StringComparison.Ordinal) == true;
            return (ex.GetType().Name, ex.InnerException?.GetType().Name, mentionsFail);
        }

        throw new InvalidOperationException("the action was expected to throw");
    }
}
