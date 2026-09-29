# Long reading - what a throw actually does, and what it costs

## Two passes, not one

On Windows, .NET exception handling is built on Structured Exception Handling,
and SEH is a **two-pass** model. That single fact explains most of the
behaviour people find surprising.

**Pass one, the search.** Starting at the throwing frame, the runtime walks up
the stack looking for a handler willing to take this exception. For each `catch`
clause it checks the type, and if there is a `when` filter it *runs the filter*
— on the current stack, with every frame between the throw and the filter still
alive. Nothing has been unwound yet.

**Pass two, the unwind.** Once a handler is chosen, the runtime walks the stack
again, this time popping frames and running every `finally` block on the way
down, until it reaches the chosen handler, which then runs.

Consequences worth carrying:

- A `when` filter can see the world as it was at the moment of the throw. Your
  debugger's "break on unhandled exception" also works because of this: the
  decision about whether anything will handle the exception is made before any
  state is destroyed.
- A `finally` deeper in the stack runs *after* a filter higher up. Written as a
  test, that ordering looks wrong until you know about the two passes — and it
  is exactly what ex3 makes you observe.
- Filters run on a stack that has not been unwound, so a filter that throws is
  particularly nasty: that exception is swallowed and the filter is treated as
  returning false.

Unix platforms do not have SEH, and .NET implements the same semantics on top
of the platform's unwinder. The observable behaviour is identical; the
performance profile differs slightly.

## Where the microseconds go

A throw is expensive for four separate reasons, and they add up differently
depending on your code:

1. **Allocating the exception object**, which is cheap, plus whatever your
   constructor does.
2. **Capturing the stack trace.** This is the dominant cost and it scales with
   stack depth. It is captured when the exception is thrown, not when it is
   constructed — which is why `var ex = new Exception()` costs almost nothing
   and `throw ex` costs a lot.
3. **The search pass**, walking frames and consulting exception-handling
   tables, plus running filters.
4. **The unwind pass**, running `finally` blocks and popping frames.

Numbers, order of magnitude, .NET 8 on x64: a throw caught one frame away is
around 5 microseconds; twenty frames deep, several times that; across an async
state machine, more again because the exception is stored in the task, and
resurfaced with `ExceptionDispatchInfo` on the awaiting context.

Compare that to the alternatives: a `bool` return is about a nanosecond, a
`TryParse` failure tens of nanoseconds, a `Result<T>` return a few nanoseconds
plus whatever the type costs. The ratio is between a thousand and ten thousand.

That ratio is why the guidance is what it is — and why the guidance is also
*not* "avoid exceptions". At one exception per HTTP request, on a service doing
a thousand requests a second, you are spending perhaps 20 milliseconds of CPU
per second on exception handling: two percent of one core, for a mechanism that
makes failure impossible to ignore. That is a good trade. At one exception per
row of a million-row import, it is a hundred-times-worse trade and a genuine
outage risk.

## Debugger and first-chance behaviour

Every thrown exception is a **first-chance exception**: the debugger is
notified before the runtime searches for a handler. This is why a debugger
configured to break on all CLR exceptions stops on exceptions your code
catches and handles perfectly. It is also why "exceptions used as control flow"
makes debugging miserable long before it shows up in a profile — the noise
floor drowns the real failures.

In production, first-chance exceptions are visible to profilers and to ETW/
EventPipe traces. A useful diagnostic habit: if a service is slow and nobody
knows why, count first-chance exceptions. A surprisingly large fraction of
mysterious .NET performance problems turn out to be a hot path throwing and
catching thousands of exceptions a second inside a library.

## `AggregateException`, and why `await` hides it

The TPL had to solve a problem the language did not have a word for: a single
operation composed of many can fail in many ways at once.
`AggregateException` was the answer, and `Task.Wait()` and `Task.Result` throw
it, wrapping whatever went wrong — including a single failure, which is why
pre-`async` code is full of `ex.InnerException?.InnerException`.

`await` deliberately does not do that. It rethrows the *first* exception,
unwrapped, using `ExceptionDispatchInfo` so the original stack survives. That
makes ordinary code read naturally at the cost of hiding the other failures.
The other failures are not gone: `task.Exception` is still an
`AggregateException` with all of them, and `AggregateException.Flatten()`
collapses nested aggregates. If you need all of them, you must ask for them
explicitly — which ex6 makes you do.

## Cancellation, and why it wears the same clothes as failure

`OperationCanceledException` is thrown by `token.ThrowIfCancellationRequested()`
and by most cancellable BCL APIs. `TaskCanceledException` derives from it and
is what task-based APIs typically throw. Catching the base type handles both.

The genuinely awkward part is that a **timeout is implemented as
cancellation**: `CancellationTokenSource.CancelAfter`, `HttpClient.Timeout` and
friends cancel a token, so the failure arrives looking identical to a caller
who pressed stop. The distinction only exists in *which* token was cancelled,
which is why the standard shape is:

```csharp
using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
using var linked = CancellationTokenSource.CreateLinkedTokenSource(callerToken, timeout.Token);
try { await DoWork(linked.Token); }
catch (OperationCanceledException) when (callerToken.IsCancellationRequested)
{
    // the caller gave up: not an error
}
catch (OperationCanceledException)
{
    // we ran out of time: this one is an error
}
```

Getting this wrong produces one of two bad outcomes: every client disconnect
logged as an error, or every timeout logged as a client disconnect and
therefore never investigated.

## Result types: the honest trade

`Result<T>` and its relatives make expected failures cheap and explicit, and
they force callers to acknowledge the failure case. They also add ceremony to
every call site, do not compose with the BCL, cannot express "this is a bug",
and — crucially — do not remove exceptions, because the runtime still throws for
null references, division by zero, and everything underneath you.

So the defensible position is a boundary, not a replacement. Expected outcomes
inside a component return results; genuine faults throw; and exactly one place
— the controller, the message handler, the job runner — converts anything that
escapes into a response. A codebase with both channels active everywhere is
strictly worse than either alone, because every caller must handle two.

## When not to catch at all

The strongest guidance in this sector is negative. Do not catch an exception
you cannot do something specific about. A `catch` that logs and rethrows at
every layer produces five entries per failure and no more information than one.
A `catch` that converts a specific exception into a generic one destroys
information. A `catch (Exception)` at a low level turns a bug into a silent
wrong answer, which is the most expensive failure mode there is: it is found
weeks later, in data, by a customer.

Let it propagate. Somewhere near the top there is one place that knows what a
failure means for the user — return a 500, fail the message and retry later,
mark the job failed — and that is where the catching belongs.
