# Reading - csharp/v3cc04_exception_design

## Notes

**An exception is an API with three surfaces.** The type is what a caller
catches; the properties are what they branch on; the message is what a human
reads. Design all three. The commonest failure is a rich message and no type —
`throw new Exception($"line {n} is bad")` — which forces callers to catch
everything and parse strings, and forces the person on call to guess.

**Catch what you can handle, and nothing else.** "Handle" means you can do
something specific: retry, substitute a default, translate for a caller, or
report and continue. If none of those apply, letting the exception through is
the correct behaviour, because the layer above may know something you do not,
and because an unhandled exception with a full trace beats a swallowed one.

**`when` filters run before the stack unwinds.** A `catch (X) { ... throw; }`
first unwinds to your frame, then decides; a `catch (X) when (p)` evaluates `p`
with the original frames still live. That has two practical effects: a debugger
breaking on "unhandled exception" still sees the real stack, and a `finally`
further down has not run yet when your filter is evaluated — which is
observable, and which ex3 makes you observe.

**`throw;` versus `throw ex;` is the one-word difference that costs an
outage.** `throw ex;` resets the stack trace to that line, deleting every frame
between the original throw and here. `throw;` preserves it.
`ExceptionDispatchInfo.Capture(ex).Throw()` is the third option, for rethrowing
outside a `catch` block, and it is exactly what `await` does when it resurfaces
a faulted task's exception.

**Wrap to add meaning, never to hide.** A new exception type is right when it
means something to your caller that the original did not — `ImportFailedException`
rather than `FormatException` — and only when the original is attached as
`InnerException`. Wrapping without the inner is destroying evidence.

**Cancellation is not failure.** `OperationCanceledException` means "you asked
me to stop, and I did". Logging it as an error fills your dashboards with
noise on every client disconnect. The subtlety is that a *timeout* also arrives
as an `OperationCanceledException`, so distinguishing the two requires knowing
which token was cancelled — which is the entire point of
`CreateLinkedTokenSource`.

**The cost is real and specific.** Roughly 5-20 microseconds for a
caught-and-handled throw on .NET 8, against nanoseconds for a return. Stack
trace capture dominates, and the depth of the stack matters. This does not make
exceptions bad; it makes them unsuitable for outcomes that happen routinely.

## ex1

Really testing: whether you design for the catcher. The three constructors are
convention — message; message and inner; and often parameterless — and the
`required` properties are what turn "something went wrong" into something a
caller can branch on without regular expressions. The classic mistake is a
single `AppException` carrying a string code: everyone catches it, so it is
`catch (Exception)` with extra steps. Also note the message: it should name the
offending value, because the message is the only part that reaches a log by
default.

## ex2

Really testing: that guard clauses are a solved problem in .NET 8.
`ArgumentNullException.ThrowIfNull(x)` uses `CallerArgumentExpression` to
capture `"x"` as the parameter name at the call site — no `nameof`, no
mismatch when the parameter is renamed. The classic mistake is a hand-rolled
guard whose `nameof` names the wrong parameter after a refactor, which produces
an exception that actively misleads. The secondary point is inlining: methods
containing `throw new` are larger, so the BCL moved the throwing into
`[DoesNotReturn]` helpers to keep the happy path inlineable, and
`[DoesNotReturn]` is what tells the compiler's flow analysis that code after
the call is unreachable.

## ex3

Really testing: that a filter is not a catch. Filters answer "is this mine?"
without taking the exception, so a `false` leaves the exception completely
untouched — same object, same trace, still in flight — which a
catch-and-rethrow cannot claim. The classic mistake is filtering on
`ex.Message.Contains("timeout")`, which breaks the moment a message is
localised or reworded; filter on a property or a type. Also worth knowing:
filters can be used for side effects (`when (Log(ex))` returning false) to log
without handling, which is either elegant or too clever depending on your team.

## ex4

Really testing: the `Try` pattern as a design, not a convenience.
`TryParse` must not be `try { Parse(); } catch { return false; }` — that is the
exact anti-pattern the pattern exists to avoid, and it costs microseconds per
call on the failure path. Both faces share one core that *returns* an outcome;
`Parse` turns a failure into a throw, `TryParse` turns it into `false`. The
classic mistake is duplicating the parsing logic in both, which then drifts.

## ex5

Really testing: what the caller sees in their log. `throw ex;` gives them a
trace starting at your catch block, which points investigation at the wrong
file. Wrapping gives them your type plus the original underneath — the right
answer when you are adding context at a layer boundary.
`ExceptionDispatchInfo` gives them the original with its trace intact from
outside a catch block. The classic mistake is choosing by habit rather than by
what the caller needs to know.

## ex6

Really testing: where an async method's exception actually goes. An exception
thrown before the first `await` still faults the returned task rather than
throwing synchronously — because the method's body runs inside the state
machine — which surprises people writing argument validation in an `async`
method. And `await Task.WhenAll(...)` throws only the *first* exception, while
`task.Exception` is an `AggregateException` holding all of them. The classic
mistake is reporting one failure out of five and calling it a diagnosis.

## ex7

Really testing: telling two identical-looking exceptions apart.
`OperationCanceledException` carries a `CancellationToken`, so after catching
you can ask which token was cancelled: the caller's, or the timeout's linked
one. The classic mistake is `catch (OperationCanceledException) { log.Error(...) }`,
which turns every client disconnect into an alert. `TaskCanceledException`
derives from `OperationCanceledException`, so catching the base handles both;
catching only the derived one misses cancellations from `token.ThrowIfCancellationRequested()`.

## ex8

Really testing: putting the exception boundary in exactly one place. A
`Result<T>` on the hot path means an expected failure costs a return, and the
edge — a controller, a message handler, a job runner — converts anything that
escapes into a result or a response, once. The classic mistake is a `Result`
type used everywhere *and* exceptions thrown underneath it, giving you two
error channels and handling code that must cover both. Pick where the boundary
is and be strict about it.

## Further reading

- [Best practices for exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions) - the design guidance, in the BCL team's own words.
- [Exception filters (when)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements#the-when-exception-filter) - evaluation before unwinding.
- [CallerArgumentExpression](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/caller-information) - how ThrowIfNull knows the name.
- [ExceptionDispatchInfo](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.exceptionservices.exceptiondispatchinfo) - rethrowing outside a catch with the trace intact.
- [Task.WhenAll](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.whenall) - the one-exception-out-of-many behaviour.
- [Cancellation in managed threads](https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads) - tokens, linked sources, and what cancellation means.
