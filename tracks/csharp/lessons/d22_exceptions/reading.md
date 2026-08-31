# Reading - csharp/d22_exceptions

## Notes

The skill being drilled is deciding what a failure *means* before deciding what
to do about it. Almost every bad exception-handling decision comes from
skipping that step: a `catch (Exception)` that swallows a bug, a retry loop
that hammers a server over a malformed request, a wrapper that throws away the
stack trace that would have explained everything.

The pattern uniting these eight problems is **preserve the evidence and
classify honestly**. `throw;` rather than `throw ex;`; the inner exception
passed to every wrapper you construct; a filter that says no rather than a
catch that guesses; a retry that distinguishes "try again" from "this will
never work". None of that costs anything at runtime, and all of it is the
difference between a log entry that explains an outage and one that says
`InvalidOperationException` at a line inside your own error handling.

The third thread is `finally`, which is the only construct here that makes an
unconditional promise. It runs on success, on a handled failure and on an
exception heading for the caller - which is why `using` compiles into one, and
why cleanup should almost never live in a `catch`.

## ex1

Really testing: the order of the three blocks, including the case nobody tests
- an exception this method does not handle. `finally` runs on the way past, so
the cleanup happens even though the method is not returning normally and has
not caught anything. The classic mistake is putting cleanup at the end of the
`try`, where a throw skips it, or in the `catch`, where a success skips it.
The other thing worth noticing is that catching only `InvalidOperationException`
lets the `FormatException` through, which is the correct behaviour: a `catch
(Exception)` "to be safe" is how a bug gets logged as a warning and forgotten.

## ex2

Really testing: writing an exception type that is worth catching. Three
properties make it useful - a specific type, so a caller can catch exactly this
and nothing else; structured data (`Line`), so the caller does not have to
parse the message; and the `InnerException`, so the original cause survives.
The classic mistake is `catch (FormatException) { throw new
ImportException("bad line"); }` - the new exception looks tidier and has
destroyed the only record of what actually went wrong. Note also that the
constructor passes the inner exception to `base(message, inner)`; there is no
other way to set it.

## ex3

Really testing: exception filters, and the thing that makes them different
from a catch-and-rethrow. A filter is evaluated *before* the stack unwinds, so
at the moment it runs the original frames are still alive - which is why the
gate can see the filter's log entry appear before the callee's `finally`. That
matters for debugging: with a filter, a debugger breaking on an unhandled
exception still sees the real stack. The other lesson is that a filter
returning false leaves the exception completely untouched: same object, same
type, same trace, still in flight - which a `catch (X) { ... throw; }` cannot
claim.

## ex4

Really testing: the single most costly one-word difference in C#. `throw ex;`
rethrows the exception object but resets its stack trace to the current line,
so the frames between the original throw and here are gone for ever. `throw;`
rethrows the exception in flight and keeps them. The wrapping case is the third
option, and it is the right one whenever you are adding context: a new
exception type that means something to your caller, with the original hanging
off `InnerException`. (`ExceptionDispatchInfo.Capture(ex).Throw()` is the
fourth, for rethrowing outside the catch block, which is what `await` does with
a faulted task.)

## ex5

Really testing: `using` as a `try`/`finally` with better manners, and the order
two of them dispose in. Nested `using` blocks dispose in reverse - last opened,
first closed - which is not an arbitrary rule: the inner resource may well
depend on the outer one still being alive. The gate checks the disposal happens
even when the body throws and even when the exception is on its way to the
caller, which is the case people forget when they hand-roll the try/finally.
Note the `Disposed` guard in the supplied `Probe`: `Dispose` may legally be
called more than once, and it has to be harmless.

## ex6

Really testing: catch ordering, and `AggregateException`. Catch blocks are
tried in source order and the first *assignable* one wins, so a base type
before a derived one makes the derived one unreachable - the compiler catches
that for `Exception` first but not for `ArgumentException` before
`ArgumentNullException`, which is the trap. `AggregateException` is the other
half: it is a tree, because the tasks it collects may themselves have collected
tasks, and `Flatten()` turns that tree into one list. Reading
`InnerExceptions` without flattening finds the aggregates and misses the real
failures.

## ex7

Really testing: a retry policy that classifies. The distinction between
transient and permanent is the entire value of the exercise: retrying a
`FormatException` turns one bad request into three, and in a busy system that
is how a small outage becomes a large one. The other two details are the
budget - `attempts` counts total tries, not extra tries, and the loop stops at
the first success - and the give-up path, which must keep the last failure as
its `InnerException`. A retry loop that exhausts its budget and throws a bare
"gave up" tells the on-call engineer nothing at all. (A real policy adds
backoff and jitter; this one is deterministic so it can be tested.)

## ex8

Really testing: the exception-to-value conversion that turns up in every
codebase eventually. `Capture` has to catch broadly - the caller wants a value,
not a throw - which is exactly why the `OperationCanceledException` exclusion
matters: a cancellation means somebody asked to stop, and recording it as a
failure and carrying on is the wrong response. That exclusion is the one detail
people forget, and it is why `Task` treats cancellation as a separate state
rather than a fault. `Then` is the other half: it short-circuits on a failure,
so a chain of five steps runs no further than the first problem, and the error
that comes out is the first one rather than a cascade. Note also why `Ok` is a
separate field: `default(T)` is `0` for an int, so the value alone cannot tell
a failure from a real zero.

## Further reading

- [Exceptions and exception handling](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/) - the whole model, briefly.
- [`try`-`finally`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements#the-try-finally-statement) - what finally guarantees, and what it does not.
- [Exception filters](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements#the-when-exception-filter) - and why they run before the unwind.
- [Creating and throwing exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/creating-and-throwing-exceptions) - including the inner-exception convention.
- [`AggregateException.Flatten`](https://learn.microsoft.com/en-us/dotnet/api/system.aggregateexception.flatten) - the tree, and how to level it.
- [`ExceptionDispatchInfo`](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.exceptionservices.exceptiondispatchinfo) - rethrowing with the trace intact from outside a catch block.
