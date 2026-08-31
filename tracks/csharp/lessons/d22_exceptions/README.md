# d22 - Exceptions drills

Eight problems on failing well: what `finally` guarantees, an exception type of
your own with the cause attached, exception filters, the difference `throw ex;`
makes, disposal order, catch ordering and `AggregateException`, a retry policy
that retries only what is worth retrying, and turning an exception into a value.
They drill lesson 12 - reread `12_exceptions` if `when` on a `catch` is
unfamiliar.

Every file lives in `src/Lessons/D22_Exceptions/`. Nothing here depends on
anything else here.

## Exercise 1 - try, catch, finally, in that order

`Runner.Attempt(action, log)` returns `"ok"` when the action completes and
`"caught:<message>"` when it throws an `InvalidOperationException`. Any other
exception escapes. In all three cases `"cleanup"` is the last entry added to
the log, and the success path also logs `"done"` while the caught path logs
`"caught"`.

Edit `src/Lessons/D22_Exceptions/Ex1.cs`.

```
uv run dojo test csharp d22_exceptions ex1
```

## Exercise 2 - an exception of your own, with the cause attached

`ImportException` carries a 1-based `Line` and an inner exception.
`Importer.SumLines(lines)` sums the lines as integers; the first line that is
not a number throws an `ImportException` with the message `"bad line 2"`, that
line number, and the `FormatException` as its `InnerException`.

Edit `src/Lessons/D22_Exceptions/Ex2.cs`.

```
uv run dojo test csharp d22_exceptions ex2
```

## Exercise 3 - a catch that can say no

`Filters.Classify(call, log)` returns what the call returned, or
`"handled:503"` when it threw a `HttpLikeException` with a status of 500 or
more. A lower status escapes unchanged, and so does any other exception type.
The decision must be made by an exception **filter**, and the filter adds
`"filter:<status>"` to the log as it decides - which is how the gate checks it
ran before the stack unwound.

Edit `src/Lessons/D22_Exceptions/Ex3.cs`.

```
uv run dojo test csharp d22_exceptions ex3
```

## Exercise 4 - rethrowing without destroying the evidence

`Rethrow.Losing` is written for you and uses `throw ex;`.
`Rethrow.Keeping(action, log)` logs the same line and rethrows so the original
stack trace survives. `Rethrow.Wrapping(action)` replaces the exception with an
`InvalidOperationException` whose message is `"wrapped"` and whose
`InnerException` is the original.

Edit `src/Lessons/D22_Exceptions/Ex4.cs`.

```
uv run dojo test csharp d22_exceptions ex4
```

## Exercise 5 - cleanup that happens anyway

`Resources.Use(name, log, body)` opens a `Probe`, runs the body, and disposes
the probe whatever happens, returning `"ok"` or `"failed:<message>"`.
`Resources.UseTwo(log, body)` opens `"outer"` then `"inner"`, runs the body,
disposes both - inner first - and lets any exception escape afterwards.

Edit `src/Lessons/D22_Exceptions/Ex5.cs`.

```
uv run dojo test csharp d22_exceptions ex5
```

## Exercise 6 - catching the right thing, in the right order

`Sorting.Kind(action)` returns `"ok"`, `"null-arg"`, `"arg"`, `"format"` or
`"other"` depending on what the action threw. `Sorting.Leaves(exception)`
returns the messages of every leaf exception inside an `AggregateException`,
however deeply nested, comma-joined in order.

Edit `src/Lessons/D22_Exceptions/Ex6.cs`.

```
uv run dojo test csharp d22_exceptions ex6
```

## Exercise 7 - retry the retryable, and only that

`Retry.Run(operation, attempts, log)` logs `"attempt:1"` before each try and
returns the first success. Only a `TransientException` is retried; anything
else escapes at once. When the last attempt also fails it throws an
`InvalidOperationException` with the message `"gave up after 3 attempts"` and
the last `TransientException` as its `InnerException`. An `attempts` below 1 is
an `ArgumentOutOfRangeException`, thrown before anything is tried.

Edit `src/Lessons/D22_Exceptions/Ex7.cs`.

```
uv run dojo test csharp d22_exceptions ex7
```

## Exercise 8 - an exception turned into a value, and back

`Safely.Capture(function)` returns a successful `Attempt<T>` or a failed one
carrying the exception's message - except `OperationCanceledException`, which
must escape. `Safely.Unwrap(attempt)` returns the value or throws an
`InvalidOperationException` whose message is the recorded error.
`Safely.Then(attempt, next)` runs `next` on the value only when the attempt
succeeded, capturing anything it throws, and otherwise passes the original
error through untouched.

Edit `src/Lessons/D22_Exceptions/Ex8.cs`.

```
uv run dojo test csharp d22_exceptions ex8
```

## The gate

This is the entire gate class, `tests/Gates/D22_ExceptionsTests.cs`:

```csharp
using System.Runtime.CompilerServices;

using CSharpDojo.D22_Exceptions;

namespace CSharpDojo.Gates;

public class D22_ExceptionsTests
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void BoomDeepInside()
    {
        throw new InvalidOperationException("boom");
    }

    [Fact]
    public void Ex1_TryCatchFinallyInThatOrder()
    {
        List<string> happy = new List<string>();
        Teach.Equal("ok", Runner.Attempt(() => happy.Add("ran"), happy),
            "Nothing was thrown, so the try block finished and the method returned ok - reread "
                + "README ex1.");
        Teach.Equal("ran|done|cleanup", string.Join("|", happy),
            "The finally block runs on the way out of a SUCCESSFUL try as well - it is not a "
                + "catch - reread README ex1.");

        List<string> caught = new List<string>();
        Teach.Equal("caught:no",
            Runner.Attempt(() => throw new InvalidOperationException("no"), caught),
            "The catch handled it and its return value is what the caller sees - reread "
                + "README ex1.");
        Teach.Equal("caught|cleanup", string.Join("|", caught),
            "The try block never reached its own log line, the catch ran, and the finally ran "
                + "last - reread README ex1.");

        List<string> escaping = new List<string>();
        Teach.Throws<FormatException>(
            () => Runner.Attempt(() => throw new FormatException("wrong type"), escaping),
            "Only InvalidOperationException is caught here, so a FormatException goes straight "
                + "past. Catching Exception to be safe would have swallowed it - reread "
                + "README ex1.");
        Teach.Equal("cleanup", string.Join("|", escaping),
            "...and the finally STILL ran, on the way out. That is what makes finally worth "
                + "having: it does not need to know whether anything was handled - reread "
                + "README ex1.");
    }

    [Fact]
    public void Ex2_AnExceptionOfYourOwnWithTheCauseAttached()
    {
        Teach.Equal(6, Importer.SumLines(new[] { "1", "2", "3" }), "Three good lines add up.");
        Teach.Equal(0, Importer.SumLines(Array.Empty<string>()), "No lines total zero.");
        Teach.Equal(-1, Importer.SumLines(new[] { "-4", "3" }), "Negative numbers are fine.");

        ImportException failure = Teach.Throws<ImportException>(
            () => Importer.SumLines(new[] { "1", "two", "3" }),
            "A line that is not a number is an import problem, and the import layer's own "
                + "exception type is what a caller can usefully catch - reread README ex2.");

        Teach.Equal("bad line 2", failure.Message,
            "The message names the 1-based line number, so the person reading the log can find "
                + "it - reread README ex2.");
        Teach.Equal(2, failure.Line,
            "...and the same number is available as data, so a caller does not have to parse "
                + "the message - reread README ex2.");
        Teach.True(failure.InnerException is FormatException,
            "The FormatException that int.Parse threw is kept as the InnerException. Throwing "
                + "the new exception without it destroys the only evidence of what actually went "
                + "wrong - reread README ex2.");

        ImportException first = Teach.Throws<ImportException>(
            () => Importer.SumLines(new[] { "x", "y" }),
            "The FIRST bad line is the one reported - the method stops there.");
        Teach.Equal(1, first.Line, "...which is line 1 here.");
    }

    [Fact]
    public void Ex3_ACatchThatCanSayNo()
    {
        List<string> quiet = new List<string>();
        Teach.Equal("fine", Filters.Classify(() => "fine", quiet), "A call that works just works.");
        Teach.Equal(0, quiet.Count, "...and the filter is never consulted.");

        List<string> server = new List<string>();
        Teach.Equal("handled:503",
            Filters.Classify(() => throw new HttpLikeException(503), server),
            "503 is 500 or more, so the filter said yes and the catch ran - reread README ex3.");
        Teach.Equal("filter:503", string.Join("|", server), "...having logged its decision.");

        List<string> client = new List<string>();
        HttpLikeException notFound = Teach.Throws<HttpLikeException>(
            () => Filters.Classify(() => throw new HttpLikeException(404), client),
            "404 is below 500, so the filter said no and the exception carried on past this "
                + "catch - reread README ex3.");
        Teach.Equal(404, notFound.Status, "...unchanged, with its own type and data intact.");
        Teach.Equal("filter:404", string.Join("|", client),
            "The filter still ran, and still logged - it is asked before the decision is made - "
                + "reread README ex3.");

        List<string> order = new List<string>();
        Teach.Equal("handled:500",
            Filters.Classify(
                () =>
                {
                    try
                    {
                        throw new HttpLikeException(500);
                    }
                    finally
                    {
                        order.Add("inner-finally");
                    }
                },
                order),
            "A 500 is handled.");
        Teach.Equal("filter:500|inner-finally", string.Join("|", order),
            "And here is the reason filters exist: the filter is evaluated BEFORE the stack "
                + "unwinds, so it ran before the callee's finally did. A catch-and-rethrow would "
                + "have unwound first and the order would be the other way round - reread "
                + "README ex3.");

        List<string> other = new List<string>();
        Teach.Throws<FormatException>(
            () => Filters.Classify(() => throw new FormatException("nope"), other),
            "A different exception type never reaches the filter at all.");
        Teach.Equal(0, other.Count, "...so nothing was logged.");
    }

    [Fact]
    public void Ex4_RethrowingWithoutDestroyingTheEvidence()
    {
        List<string> lost = new List<string>();
        InvalidOperationException fromLosing = Teach.Throws<InvalidOperationException>(
            () => Rethrow.Losing(BoomDeepInside, lost),
            "The supplied version does rethrow - the exception reaches the caller.");
        Teach.Equal("seen:boom", string.Join("|", lost), "...and it logged on the way past.");
        Teach.True(fromLosing.StackTrace is not null && !fromLosing.StackTrace.Contains("BoomDeepInside"),
            "But the method that actually threw is no longer in the stack trace: `throw ex;` "
                + "starts the trace again from the rethrow. That is the whole bug - reread "
                + "README ex4.");

        List<string> kept = new List<string>();
        InvalidOperationException fromKeeping = Teach.Throws<InvalidOperationException>(
            () => Rethrow.Keeping(BoomDeepInside, kept),
            "The same exception reaches the caller...");
        Teach.Equal("seen:boom", string.Join("|", kept), "...and the same log line was written...");
        Teach.True(fromKeeping.StackTrace is not null && fromKeeping.StackTrace.Contains("BoomDeepInside"),
            "...but this time the frame where it was thrown is still there, because a bare "
                + "`throw;` rethrows the exception in flight rather than throwing it afresh - "
                + "reread README ex4.");

        InvalidOperationException wrapped = Teach.Throws<InvalidOperationException>(
            () => Rethrow.Wrapping(BoomDeepInside),
            "Wrapping replaces the exception with one of its own - reread README ex4.");
        Teach.Equal("wrapped", wrapped.Message, "...with its own message...");
        Teach.True(wrapped.InnerException is InvalidOperationException,
            "...and the original hanging off InnerException. Wrapping WITHOUT passing the "
                + "original is the version of this that loses everything - reread README ex4.");
        Teach.Equal("boom", wrapped.InnerException!.Message, "...message and all.");

        List<string> clean = new List<string>();
        Rethrow.Keeping(() => { }, clean);
        Teach.Equal(0, clean.Count, "An action that does not throw is not logged and not rethrown.");
    }

    [Fact]
    public void Ex5_CleanupThatHappensAnyway()
    {
        List<string> happy = new List<string>();
        Teach.Equal("ok", Resources.Use("db", happy, probe => { }), "The body finished.");
        Teach.Equal("open:db|dispose:db", string.Join("|", happy),
            "The probe was opened and then disposed, without anybody writing the Dispose call - "
                + "reread README ex5.");

        List<string> sad = new List<string>();
        Teach.Equal("failed:no disk", Resources.Use("db", sad, probe => throw new Exception("no disk")),
            "The body threw and the catch turned it into a return value - reread README ex5.");
        Teach.Equal("open:db|dispose:db", string.Join("|", sad),
            "...and the probe was disposed anyway. That is what `using` compiles into: a "
                + "try/finally around the block - reread README ex5.");

        Probe? captured = null;
        List<string> checkLog = new List<string>();
        Resources.Use("x", checkLog, probe => captured = probe);
        Teach.True(captured is not null && captured.Disposed,
            "The probe really is disposed by the time Use returns - reread README ex5.");

        List<string> two = new List<string>();
        Resources.UseTwo(two, () => { });
        Teach.Equal("open:outer|open:inner|dispose:inner|dispose:outer", string.Join("|", two),
            "Nested usings dispose in reverse order - last opened, first closed - which matters "
                + "the moment the inner resource depends on the outer one - reread README ex5.");

        List<string> twoFailing = new List<string>();
        Teach.Throws<FormatException>(
            () => Resources.UseTwo(twoFailing, () => throw new FormatException("bad")),
            "UseTwo does not catch, so the exception escapes - reread README ex5.");
        Teach.Equal("open:outer|open:inner|dispose:inner|dispose:outer", string.Join("|", twoFailing),
            "...and both probes were still disposed, in the same order, on the way out - reread "
                + "README ex5.");
    }

    [Fact]
    public void Ex6_CatchingTheRightThingInTheRightOrder()
    {
        Teach.Equal("ok", Sorting.Kind(() => { }), "Nothing thrown.");
        Teach.Equal("null-arg", Sorting.Kind(() => throw new ArgumentNullException("x")),
            "ArgumentNullException derives from ArgumentException, so its catch has to come "
                + "FIRST - the other order would compile and never reach this branch - reread "
                + "README ex6.");
        Teach.Equal("arg", Sorting.Kind(() => throw new ArgumentException("bad")),
            "...and a plain ArgumentException still finds the second catch - reread README ex6.");
        Teach.Equal("arg", Sorting.Kind(() => throw new ArgumentOutOfRangeException("n")),
            "ArgumentOutOfRangeException also derives from ArgumentException, and nothing more "
                + "specific was offered, so it lands here - reread README ex6.");
        Teach.Equal("format", Sorting.Kind(() => throw new FormatException("f")), "An unrelated type.");
        Teach.Equal("other", Sorting.Kind(() => throw new TimeoutException("t")),
            "...and the catch-all is last, because a catch of Exception before any of the others "
                + "would not compile - reread README ex6.");

        AggregateException flat = new AggregateException(
            new Exception("one"), new Exception("two"));
        Teach.Equal("one,two", Sorting.Leaves(flat), "Two failures, both reported - reread README ex6.");

        AggregateException nested = new AggregateException(
            new Exception("one"),
            new AggregateException(new Exception("two"), new Exception("three")));
        Teach.Equal("one,two,three", Sorting.Leaves(nested),
            "Flatten pulls the nested aggregate's children up to the top level, which is why you "
                + "almost always want it before looking at InnerExceptions - reread README ex6.");

        Teach.Equal("solo", Sorting.Leaves(new AggregateException(new Exception("solo"))),
            "One failure is still a list of one.");
    }

    [Fact]
    public void Ex7_RetryTheRetryableAndOnlyThat()
    {
        List<string> first = new List<string>();
        Teach.Equal("value", Retry.Run(() => "value", 3, first),
            "An operation that works first time returns its value - reread README ex7.");
        Teach.Equal("attempt:1", string.Join("|", first),
            "...after exactly one attempt: a retry policy must not retry a success - reread "
                + "README ex7.");

        List<string> eventual = new List<string>();
        int calls = 0;
        Teach.Equal("late", Retry.Run(
            () =>
            {
                calls++;
                if (calls < 3)
                {
                    throw new TransientException($"blip {calls}");
                }

                return "late";
            },
            5,
            eventual),
            "Two failures then a success, inside the budget - reread README ex7.");
        Teach.Equal("attempt:1|attempt:2|attempt:3", string.Join("|", eventual),
            "...and it stopped as soon as it worked, rather than using all five - reread "
                + "README ex7.");

        List<string> exhausted = new List<string>();
        InvalidOperationException gaveUp = Teach.Throws<InvalidOperationException>(
            () => Retry.Run<string>(() => throw new TransientException("still down"), 3, exhausted),
            "Three failures and no attempts left - reread README ex7.");
        Teach.Equal("gave up after 3 attempts", gaveUp.Message, "...reported as such...");
        Teach.True(gaveUp.InnerException is TransientException,
            "...with the LAST failure attached, so the log still says what went wrong. A retry "
                + "loop that swallows the cause is worse than no retry loop - reread README ex7.");
        Teach.Equal("still down", gaveUp.InnerException!.Message, "...message and all.");
        Teach.Equal("attempt:1|attempt:2|attempt:3", string.Join("|", exhausted), "Three tries.");

        List<string> fatal = new List<string>();
        Teach.Throws<FormatException>(
            () => Retry.Run<string>(() => throw new FormatException("malformed"), 3, fatal),
            "A malformed request will be just as malformed next time, so anything that is not "
                + "transient must escape at once - retrying everything is how a client turns one "
                + "failure into three - reread README ex7.");
        Teach.Equal("attempt:1", string.Join("|", fatal), "...after one attempt only.");

        List<string> nonsense = new List<string>();
        Teach.Throws<ArgumentOutOfRangeException>(
            () => Retry.Run(() => "x", 0, nonsense),
            "Zero attempts is a caller mistake, and the check happens before anything runs - "
                + "reread README ex7.");
        Teach.Equal(0, nonsense.Count, "...so nothing was attempted or logged.");
    }

    [Fact]
    public void Ex8_AnExceptionTurnedIntoAValueAndBack()
    {
        Attempt<int> ok = Safely.Capture(() => 42);
        Teach.True(ok.Ok, "The function returned, so the attempt succeeded - reread README ex8.");
        Teach.Equal(42, ok.Value, "...carrying its value...");
        Teach.True(ok.Error is null, "...and no error.");

        Attempt<int> bad = Safely.Capture<int>(() => throw new FormatException("not a number"));
        Teach.True(!bad.Ok, "The function threw, so the attempt failed - reread README ex8.");
        Teach.Equal("not a number", bad.Error, "...carrying the message...");
        Teach.Equal(0, bad.Value, "...and default(T) as the value, which is exactly why Ok exists: "
            + "for an int there is no null to distinguish a failure from a real zero.");

        Teach.Throws<OperationCanceledException>(
            () => Safely.Capture<int>(() => throw new OperationCanceledException()),
            "A cancellation is not a failure to be recorded and reported - it means the caller "
                + "asked to stop, so it must escape rather than being turned into a value. "
                + "Catching Exception without that exclusion is the bug - reread README ex8.");

        Teach.Equal(42, Safely.Unwrap(ok), "Unwrapping a success gives the value - reread README ex8.");
        InvalidOperationException thrown = Teach.Throws<InvalidOperationException>(
            () => Safely.Unwrap(bad),
            "Unwrapping a failure is where the exception comes back - reread README ex8.");
        Teach.Equal("not a number", thrown.Message, "...still carrying the original message.");

        Attempt<string> chained = Safely.Then(ok, value => $"n={value}");
        Teach.True(chained.Ok, "The first step succeeded, so the second ran - reread README ex8.");
        Teach.Equal("n=42", chained.Value, "...on its value.");

        int ran = 0;
        Attempt<string> skipped = Safely.Then(bad, value =>
        {
            ran++;
            return "never";
        });
        Teach.True(!skipped.Ok, "A failure passes straight through...");
        Teach.Equal("not a number", skipped.Error,
            "...with its original error, not a new one - reread README ex8.");
        Teach.Equal(0, ran,
            "...and the next step was never called. Short-circuiting on failure is the whole "
                + "point of chaining - reread README ex8.");

        Attempt<string> failsLate =
            Safely.Then<int, string>(ok, value => throw new FormatException("second step"));
        Teach.True(!failsLate.Ok, "A step that throws fails the chain...");
        Teach.Equal("second step", failsLate.Error,
            "...and its exception is captured the same way the first one was - reread README ex8.");

        Attempt<int> deep = Safely.Then(Safely.Then(ok, v => v * 2), v => v + 1);
        Teach.Equal(85, Safely.Unwrap(deep), "Chains compose: 42, then 84, then 85.");
    }
}
```
