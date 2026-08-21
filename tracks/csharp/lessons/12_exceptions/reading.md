# Reading - csharp/12_exceptions

## Notes

**What an exception costs.** Throwing is not just a jump: the runtime captures a
stack trace, walks the stack looking for a handler, and runs any `finally`
blocks on the way. That is measured in microseconds, not nanoseconds — fine for
something that happens when a request fails, terrible for something that happens
per row of a million-row import. This is the concrete reason behind "don't use
exceptions for control flow", and the reason `TryParse`, `TryGetValue` and
`TryDequeue` all exist.

**The exception hierarchy, in the bit you need.** Everything derives from
`Exception`. `SystemException` and its descendants (`ArgumentException`,
`InvalidOperationException`, `NullReferenceException`, `FormatException`) come
from the framework. `ApplicationException` was meant to be the base for yours and
is now explicitly *not* recommended — derive from `Exception` directly. A few
are special: `OutOfMemoryException` and `StackOverflowException` cannot be
meaningfully handled (the latter cannot be caught at all), and
`OperationCanceledException` is the polite one you will meet in lesson 13.

**Which exception to throw.** `ArgumentNullException` for a null argument,
`ArgumentOutOfRangeException` for one outside a valid range,
`ArgumentException` for anything else wrong with an argument,
`InvalidOperationException` when the *object* is not in a state where the call
makes sense, `NotSupportedException` for an operation this implementation will
never support. Using the right one lets callers write a specific catch — and
tells the reader what kind of mistake was made.

**`throw;` versus `throw ex;`.** `throw;` rethrows the current exception,
preserving the original stack trace. `throw ex;` throws the same object with the
stack trace reset to *this* line, so the log now says the failure happened in
your catch block. There is almost never a reason for the second. If you need to
add context, wrap: `throw new MyException("...", ex);`.

**Where exceptions should be caught.** Usually not where they are thrown.
Low-level code should let failures out; some boundary — a request handler, a
message consumer, a `Main` — should catch, log, and turn it into a response.
That is exactly what ASP.NET Core's exception middleware does, and it is why the
.NET track spends a lesson on it. A `try/catch` in every method is a sign
nobody decided where the boundary is.

## ex1

The diary in `Trace` makes the control flow visible. Two things worth noticing.
`"after"` never runs on the throwing path — a `throw` abandons the rest of the
block immediately, which is why "clean up at the bottom of the try" is a bug.
And `"finally"` runs on *both* paths, which is the guarantee that makes cleanup
possible at all.

`finally` also runs when the `try` block `return`s — the return value is
computed first, then the `finally` runs, then the method actually returns. That
occasionally surprises people writing `finally` blocks that modify the variable
being returned; the returned value was already captured.

`SafeDivide` is the exercise being deliberately artificial. In real code
`if (b == 0)` is faster, clearer, and does not pay for a stack trace. The
version worth writing is whichever makes the *reason* obvious: a check when the
condition is expected, a catch when the failure is genuinely surprising.

One detail worth having: integer division by zero throws, but floating-point
division by zero does **not** — `1.0 / 0.0` is `double.PositiveInfinity`, and
`0.0 / 0.0` is `NaN`. Same operator, two completely different failure models,
because IEEE 754 says so.

## ex2

Custom exceptions earn their place when a caller might want to catch *that*
specifically. If nobody will ever write `catch (ConfigurationException)`, a
plain `InvalidOperationException` with a good message is fine, and one more type
in the codebase is a cost with no benefit.

The inner exception is the part that gets dropped and the part that matters. Your
`ConfigurationException`'s stack trace starts at the line where you threw it —
which is the catch block, not the failure. The inner exception remembers where
the parse actually blew up, and every logger and every debugger prints the chain.
Dropping it produces the log entry everyone has seen: a friendly message with no
information in it.

The other half is the message. `"bad port: abc"` names the offending value;
`"Configuration error"` does not, and someone will have to reproduce the failure
locally to find out which setting was wrong. The rule of thumb: put in the
message whatever you would want to grep for.

`int.Parse(null)` throwing `ArgumentNullException` rather than `FormatException`
is a small trap the gate checks deliberately. Two failure types from one call is
normal in .NET, and a catch that handles only the one you thought of leaves the
other escaping raw.

## ex3

Exception filters are a C# 6 feature that people underuse. Beyond the obvious —
splitting one type by its data — the mechanism matters: a `when` clause runs
**before** the stack unwinds, in a first pass over the handlers. If it returns
false, the exception carries on from its original throw point with everything
intact, and a debugger breaking on unhandled exceptions still stops at the real
site.

Catch-and-rethrow does not have that property. `catch (X) { if (...) throw; }`
has already unwound the stack by the time it decides, so any `finally` blocks
between the throw and the catch have already run. For a logging filter this is a
genuine trick people use: `catch (Exception ex) when (Log(ex))`, where `Log`
returns false — it logs at the throw site and never catches anything.

The "do not catch what you cannot handle" rule is the real lesson here though.
The catch-all version of `Attempt` would classify a `NullReferenceException` in
your own code as `"give up"` and return normally, and the bug would never
surface. The narrower each catch is, the smaller the set of failures your code
can hide.

## ex4

The two orderings in this exercise are the whole reason `using` exists. On the
failure path, `Dispose` runs as the stack unwinds, before any outer catch — so
the file is closed before the code that decides what to tell the user runs. Get
that wrong (cleanup after the catch, or at the bottom of the `try`) and you leak
a handle exactly when things are going badly, which is when leaks hurt most.

`using` is `try/finally` with less typing: the compiler rewrites
`using X x = ...;` into a `try` whose `finally` calls `x.Dispose()`. The
declaration form (no braces) disposes at the end of the enclosing block; the
statement form (`using (...) { }`) disposes at the end of its own block, which
is what you want when the resource's life should be shorter than the method's.

Idempotent `Dispose` is part of the documented contract:
"If an object's Dispose method is called more than once, the object must ignore
all calls after the first." That is not pedantry — nested `using`s, a `Dispose`
called explicitly before the block ends, or a container disposing something you
also disposed all produce a second call.

The full disposal pattern (`protected virtual void Dispose(bool disposing)` plus
a finaliser) exists only for types owning *unmanaged* resources directly — a raw
handle, a pointer. If your class merely holds other `IDisposable`s, the simple
version you wrote is correct and the finaliser is actively harmful, because it
delays collection by a generation. `IAsyncDisposable` is the async sibling, and
lesson 13's world is where it belongs.

## challenge

Retry is where "which failures are worth retrying" stops being philosophy. A
timeout, a 503, a deadlocked transaction: retry. A 400, a null reference, a
parse failure: retrying just produces the same failure more slowly. The policy
belongs in one place, and everything it does not recognise must pass straight
through.

The filter `catch (TransientException) when (attempt < maxAttempts)` is the
elegant part. Without it you need an `if` inside the catch and a way to
distinguish "loop again" from "give up", and it is easy to end up with an
off-by-one — which is why the gate counts calls rather than trusting the
returned number.

Real retry adds two things this challenge deliberately omits. **Backoff**:
waiting longer between attempts, usually exponentially, so a struggling service
is not hammered by every client at once. **Jitter**: randomising that wait, so
ten thousand clients do not all retry at the same instant — the thundering-herd
problem. Polly is the .NET library that implements all of it, and by now you can
read its source.

The testability note in the hints is worth repeating: a real delay would make
this gate slow and flaky. Put the clock behind an interface (lesson 05 ex4) and
the policy stays instantly testable — which is why every serious retry library
takes an abstraction for time.

## Further reading

- [Exceptions and exception handling](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/) — the language mechanics, including filters and rethrow.
- [Best practices for exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions) — when to throw, which type to pick, and what not to catch.
- [Creating and throwing exceptions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/creating-and-throwing-exceptions) — the standard constructors your own type should offer.
- [Implement a Dispose method](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose) — the simple case and the full pattern, with guidance on which you need.
- [`using` statement](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/using) — the declaration form, the statement form, and what each compiles to.
