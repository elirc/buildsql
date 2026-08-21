# 12 — Exceptions

Every method you have written so far assumed things went well. This lesson is
about the other path — and, more importantly, about the judgement call that
comes first: **is this failure exceptional at all?**

You have already met both answers. `int.TryParse` returns `false` because text
from a user is expected to be wrong sometimes. `int.Parse` throws because a
malformed number in code you control is a bug. `Withdraw` in lesson 03 returned
`false` for an overdraft and threw for a negative amount — the same distinction,
in one class. The rule teams settle on: **an exception is for a situation the
caller could not reasonably have anticipated or handled.** Everything else is a
return value.

Get that wrong in the cheap direction and you get code where the happy path is
buried in error handling. Get it wrong in the expensive direction — swallowing
exceptions with `catch (Exception) { }` — and you get a system that fails
silently, which is the worst kind of failure there is.

## Concept — throw, catch, filter, clean up

```csharp
try
{
    return a / b;
}
catch (DivideByZeroException)
{
    return fallback;
}
finally
{
    // runs on the way out, whichever way you leave
}
```

**Catch the specific type.** `catch (Exception)` catches configuration errors,
your own bugs, and out-of-memory alike, and reports them all as the same thing.
The narrower the catch, the more the code says.

**`finally` always runs** — normal exit, `return`, or exception. It is where
"whatever happens, undo this" goes.

**Exception filters** split one type by its data, and are evaluated *before*
the stack unwinds:

```csharp
catch (TransientException e) when (e.StatusCode >= 500) { ... }
catch (TransientException) { ... }
```

**Rethrowing:** `throw;` continues the current exception with its stack trace
intact. `throw ex;` resets the stack trace to this line and destroys the
evidence. The difference is one word and it costs debugging hours.

**Your own exception types** are worth it when a caller might want to catch
*that* specifically. Derive from `Exception`, offer the standard constructors,
and — this is the part people skip — pass the original exception as the
**inner** one when you wrap:

```csharp
catch (FormatException original)
{
    throw new ConfigurationException($"bad port: {text}", original);
}
```

**`IDisposable` and `using`.** Anything holding something the garbage collector
cannot clean up — a file, a socket, a database connection — implements
`IDisposable`, and `using` guarantees `Dispose()` runs even if the block throws:

```csharp
using Resource resource = new Resource();   // disposed at the end of the enclosing block
```

That guarantee is why cleanup written at the bottom of a `try` block is a bug
waiting for its first exception.

## Exercise 1 — the three blocks

Edit `src/Lessons/L12_Exceptions/Ex1.cs`. `SafeDivide(a, b, fallback)` returns
`a / b`, catching `DivideByZeroException` and returning the fallback.

`Trace(shouldThrow)` writes a diary: `"try"` at the top of the `try`, a thrown
`InvalidOperationException` when asked, `"after"` on the path where nothing was
thrown, `"catch"` in the catch, `"finally"` in a `finally`. Return the log.

Predict both diaries before you run the gate. The question worth asking
yourself: does `"finally"` appear on the path where nothing went wrong?

```
uv run dojo test csharp 12_exceptions ex1
```

## Exercise 2 — your own exception, with the cause attached

Edit `src/Lessons/L12_Exceptions/Ex2.cs`. `ConfigurationException` has two
constructors, and one of them quietly drops its `inner` argument on the way to
`base` — fix it. Then implement `Configuration.LoadPort(text)`: parse the
number, and turn any parse failure into a `ConfigurationException` whose message
is `"bad port: abc"` (or `"bad port: null"`) and whose `InnerException` is
whatever `int.Parse` actually threw.

`int.Parse` throws `FormatException` for `"abc"` and `ArgumentNullException` for
`null`, and the gate checks that *both* arrive with the right inner exception.

```
uv run dojo test csharp 12_exceptions ex2
```

## Exercise 3 — catching the right thing

Edit `src/Lessons/L12_Exceptions/Ex3.cs`. `Classifier.Attempt(work)` reports
`"ok"` when nothing was thrown, `"retry"` for a `TransientException` with a
status of 500 or more, `"give up"` for any other `TransientException` — and
lets everything else through untouched.

That last clause is written by *not* writing a catch. A catch-all here would
report your own `NullReferenceException` as "give up", and the bug would live
in production for months.

```
uv run dojo test csharp 12_exceptions ex3
```

## Exercise 4 — cleanup that happens anyway

Edit `src/Lessons/L12_Exceptions/Ex4.cs`. Implement `Resource.Dispose()` — it
logs `"dispose"`, but only the first time, because disposing twice must be
harmless. Then implement `Session.Run(shouldThrow)`: open a `Resource` in a
`using`, `Use()` it, throw when asked, catch that exception *outside* the using,
and return the log.

The two logs come out in a different order, and that difference is the lesson:
on the failure path the resource is released while the stack unwinds, before
the catch block runs.

```
uv run dojo test csharp 12_exceptions ex4
```

## Challenge — retry the retryable

Edit `src/Lessons/L12_Exceptions/Challenge.cs`. `Resilient.Run(work, maxAttempts)`
calls `work` until it succeeds or until it has failed `maxAttempts` times with a
`TransientException`, returning `(attempts, value, "ok")` or
`(maxAttempts, 0, "exhausted")`. Anything that is not transient must escape
immediately, without another attempt.

Honest difficulty note: the loop is easy and the exit conditions are fiddly.
The gate counts calls, so "one attempt too many" and "gave up one early" both
show up as an exact number. The neat solution uses an exception filter to say
"transient, *and* there are attempts left".

```
uv run dojo test csharp 12_exceptions challenge
```

## The gate

This is the entire gate class, `tests/Gates/L12_ExceptionsTests.cs`:

```csharp
using CSharpDojo.L12_Exceptions;

namespace CSharpDojo.Gates;

public class L12_ExceptionsTests
{
    [Fact]
    public void Ex1_FinallyRunsOnBothPaths()
    {
        Teach.Equal(5, Basics.SafeDivide(10, 2, -1), "10 / 2 is 5 - the ordinary path.");
        Teach.Equal(-1, Basics.SafeDivide(10, 0, -1),
            "Integer division by zero throws DivideByZeroException; catching it and returning "
                + "the fallback is the whole method - reread README ex1.");

        Teach.Equal("try, after, finally", string.Join(", ", Basics.Trace(shouldThrow: false)),
            "With nothing thrown, the catch block never runs and finally still does - reread "
                + "README ex1.");

        Teach.Equal("try, catch, finally", string.Join(", ", Basics.Trace(shouldThrow: true)),
            "The throw skips the rest of the try block - \"after\" never happens - then the "
                + "catch runs, and finally runs last either way - reread README ex1.");
    }

    [Fact]
    public void Ex2_YourExceptionKeepsTheOriginalCause()
    {
        Teach.Equal(8080, Configuration.LoadPort("8080"), "A good value parses normally.");

        ConfigurationException bad = Teach.Throws<ConfigurationException>(
            () => Configuration.LoadPort("abc"),
            "Unparseable configuration should surface as YOUR exception type, not as a raw "
                + "FormatException from somewhere deep inside - reread README ex2.");

        Teach.Equal("bad port: abc", bad.Message,
            "The message names the offending value, so a log line is enough to diagnose it.");
        Teach.True(bad.InnerException is FormatException,
            "The original FormatException must be kept as the InnerException. Dropping it "
                + "throws away the stack trace that says where it actually happened - pass it "
                + "to the base constructor - reread README ex2.");

        ConfigurationException missing = Teach.Throws<ConfigurationException>(
            () => Configuration.LoadPort(null),
            "Null is also unparseable configuration.");

        Teach.Equal("bad port: null", missing.Message,
            "With no text at all the message says \"null\" rather than being blank.");
        Teach.True(missing.InnerException is ArgumentNullException,
            "int.Parse(null) throws ArgumentNullException, not FormatException - and whatever "
                + "it threw is what the InnerException must be. If this failed, you caught one "
                + "specific type and missed the other.");
    }

    [Fact]
    public void Ex3_FiltersDecideWhichCatchWins()
    {
        Teach.Equal("ok", Classifier.Attempt(() => { }),
            "Nothing thrown, nothing to classify - reread README ex3.");

        Teach.Equal("retry", Classifier.Attempt(() => throw new TransientException("busy", 503)),
            "503 is 500 or above, so this one is worth retrying. A `when` filter on the catch "
                + "clause is how you split one exception type by its data - reread README ex3.");

        Teach.Equal("give up", Classifier.Attempt(() => throw new TransientException("bad request", 400)),
            "400 is the caller's fault and will not fix itself. Same type, different answer, "
                + "decided by the filter - reread README ex3.");

        Teach.Throws<InvalidOperationException>(
            () => Classifier.Attempt(() => throw new InvalidOperationException("bug")),
            "Anything that is not a TransientException must travel on untouched. A catch-all "
                + "here would swallow real bugs and report them as \"give up\" - reread "
                + "README ex3.");
    }

    [Fact]
    public void Ex4_DisposeHappensWhateverElseDoes()
    {
        Teach.Equal("open, use, finished, dispose", string.Join(", ", Session.Run(shouldThrow: false)),
            "A `using` declaration disposes at the end of its enclosing block - so \"finished\" "
                + "comes first and the cleanup last - reread README ex4.");

        Teach.Equal("open, use, dispose, caught", string.Join(", ", Session.Run(shouldThrow: true)),
            "When the throw happens, the resource is disposed as the stack unwinds - BEFORE "
                + "the catch outside it runs. That ordering is the whole reason using exists - "
                + "reread README ex4.");

        List<string> log = new List<string>();
        Resource resource = new Resource(log);
        resource.Dispose();
        resource.Dispose();

        Teach.Equal("open, dispose", string.Join(", ", log),
            "Dispose must be safe to call twice: the second call does nothing at all. Guard on "
                + "a bool field - reread README ex4.");
    }

    [Fact]
    public void Challenge_RetryOnlyWhatIsWorthRetrying()
    {
        (int attempts, int value, string outcome) = Resilient.Run(() => 42, 3);

        Teach.Equal(1, attempts, "It worked first time - reread README challenge.");
        Teach.Equal(42, value, "...and the value comes back with it.");
        Teach.Equal("ok", outcome, "Success is reported as \"ok\".");

        int calls = 0;
        (int lateAttempts, int lateValue, string lateOutcome) = Resilient.Run(
            () =>
            {
                calls++;
                if (calls < 3)
                {
                    throw new TransientException("busy", 503);
                }

                return 7;
            },
            5);

        Teach.Equal(3, lateAttempts, "Two failures then a success is three attempts.");
        Teach.Equal(7, lateValue, "The value from the attempt that worked.");
        Teach.Equal("ok", lateOutcome, "Recovering counts as success.");

        int hopeless = 0;
        (int outAttempts, int outValue, string outOutcome) = Resilient.Run(
            () =>
            {
                hopeless++;
                throw new TransientException("still busy", 503);
            },
            3);

        Teach.Equal(3, hopeless, "maxAttempts means exactly that many calls - not one more, "
            + "not one fewer - reread README challenge.");
        Teach.Equal(3, outAttempts, "The attempt count comes back so a caller can log it.");
        Teach.Equal(0, outValue, "There is no value to report.");
        Teach.Equal("exhausted", outOutcome, "Giving up is reported, not thrown.");

        int fatalCalls = 0;
        Teach.Throws<InvalidOperationException>(
            () => Resilient.Run(
                () =>
                {
                    fatalCalls++;
                    throw new InvalidOperationException("bug");
                },
                5),
            "A non-transient failure is a bug, and retrying a bug five times just makes five "
                + "identical stack traces. Let it out - reread README challenge.");
        Teach.Equal(1, fatalCalls,
            "...and let it out IMMEDIATELY: the work must have been called exactly once.");
    }
}
```

In plain English: `Ex1` divides both ways and reads both diaries. `Ex2` parses a
good port and two bad ones, checking the message and the inner exception type
each time. `Ex3` runs four kinds of work and checks the fourth escapes. `Ex4`
compares the two orderings and calls `Dispose` twice. `Challenge` runs work that
succeeds immediately, work that recovers on the third try, work that never
recovers, and work that fails fatally — counting the calls each time.

## The teaching point

The two rules that survive contact with production:

**Catch what you can do something about.** A `catch` that logs and rethrows is
fine. A `catch` that returns a default value is fine *if* the default is
genuinely correct. A `catch (Exception) { }` is almost never fine, and the
version with a comment saying "should never happen" is the one that eventually
hides a real outage.

**Preserve the evidence.** `throw;` not `throw ex;`. Inner exceptions when you
wrap. Enough context in the message to identify the input. The person reading
that log at 3am has only what you decided to keep — and it is often you.

The third thing, which the challenge hints at: exceptions are for *exceptional*
control flow, and they are not free. Throwing captures a stack trace, and doing
it in a loop over ten thousand items is measurably slow. When failure is
routine — parsing user input, looking up a key that might be absent, checking
whether a file exists — the `Try...` pattern exists so you do not pay for it.

Next: **13_async_await**, where the failure and the cleanup both have to work
across time.
