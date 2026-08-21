# Reading - node/03_async_patterns

Three generations of async style, four combinators, and the three patterns
(limit, timeout, retry) that every production service ends up with.

## Notes

**Why callbacks first, and why they lost.** Node predates promises, so its
entire standard library was designed around a convention rather than a type:
the last argument is a function, it is called exactly once, its first argument
is an error or `null`. The convention is fine; what killed it is composition.
Running two callback operations in sequence nests; running ten in sequence
nests ten deep; adding error handling means repeating `if (error) return
cb(error)` at every level, and forgetting it once silently swallows a failure.
Promises made async operations *values* — things you can put in an array, pass
to a function, and combine — and `async`/`await` made the syntax linear again.

**A promise is a value with three states and one guarantee.** Pending,
fulfilled, rejected; once settled it never changes; every handler you attach
runs asynchronously, even if the promise settled an hour ago. That last part
is what makes promise code predictable: a function that sometimes calls its
callback synchronously and sometimes not — "releasing Zalgo", in the old
essay — creates race conditions that only appear under load. Promises cannot
do that.

**Concurrency is not parallelism.** Node runs your JavaScript on one thread,
so nothing you write here executes at the same time as anything else you
write. What overlaps is the *waiting*: three HTTP requests can all be
in-flight while your thread does nothing. This is why the combinators help
enormously with I/O and not at all with computation, and why the answer to
"how do I make this CPU-heavy loop faster" is never `Promise.all` — it is
`worker_threads`, a child process, or a different language for that one job.

**Errors are one system.** Inside an `async` function, a rejected promise you
`await` throws, and a `throw` becomes a rejection of the promise the function
returned. So `try`/`catch` works, and — crucially — `try`/`catch` does *not*
work around a call you did not await:

```ts
try {
  doAsyncThing();          // not awaited: the rejection escapes this block
} catch { /* never runs */ }
```

That is the single most common way an unhandled rejection gets into a
codebase, and lesson 04 covers what the process does about it.

**Cancellation is not built in.** A promise cannot be cancelled: once the work
has started, `withTimeout` only stops you *waiting* for it, it does not stop
the work. If the underlying operation supports cancellation it does so through
an `AbortSignal` (`fetch`, `fs/promises`, most modern APIs take a `signal`
option), and the grown-up version of ex4 passes a signal as well as racing a
timer. Worth knowing before an interviewer asks "and does the request actually
stop?" — the honest answer is "only if I pass an AbortSignal".

## ex1 — the convention, made into a type

Writing `promisify` by hand is a rite of passage because it forces you to
separate three things people usually blur: the function that *builds* the
wrapper, the wrapper itself, and the callback the wrapper passes in.
`promisifyOne` runs once and does no work; the wrapper runs per call and
creates the promise; the callback runs last and decides the promise's fate.

The `new Promise(...)` constructor gets a bad reputation because of the
"explicit construction antipattern" — wrapping something that is already a
promise. That is not what is happening here: converting a callback API is
exactly the case the constructor exists for, and you should reach for it
without guilt.

Two production notes. Node's real `util.promisify` respects a symbol
(`util.promisify.custom`) that lets a library supply its own promise version —
which is how `setTimeout` from `timers/promises` exists. And it handles
multi-argument callbacks badly by design (you get the first value only),
because the convention never said what a second value means.

The interview follow-up is usually "now write `callbackify`", or "what happens
if the callback is called twice?" A promise ignores the second settlement
silently — resolving an already-settled promise is a no-op — which is
convenient here and a real problem in the callback world, where calling a
callback twice runs the continuation twice. You will build the guard for that
in the interview drills.

## ex2 — when partial success is the truth

`Promise.all`'s fail-fast behaviour is right far more often than people
expect: if you needed all three pieces to render the page, one failure means
the page fails, and getting the answer 200 ms sooner is a bonus.
`allSettled` is for the genuinely different case where the operations are
independent — sending notifications, uploading a batch, warming caches — and
the caller wants a report rather than a verdict.

The shape of the report matters. `{ status: "fulfilled", value }` versus
`{ status: "rejected", reason }` is a *discriminated union*: TypeScript
narrows on `status`, which is why the reference can touch `.value` in one
branch and `.reason` in the other with no casts. (If that phrase is new, the
TypeScript track's `04_unions_narrowing` is where it lives.)

Note the deliberate detail in the gate: the failing task rejects
*immediately*, while the other two stay pending. `allSettled` still waits for
all three. If your mental model says "one rejection ends it", this is where it
gets corrected.

The concurrency check is the more valuable half of the exercise. Counting
in-flight tasks is a technique worth stealing for your own tests: it turns
"is this concurrent?" from a timing question — inherently flaky — into a
counting question, which is exact.

## ex3 — the limit, and why batching is not it

A concurrency limiter is the most-requested small Node exercise there is, and
the chunked version is the most common wrong answer. It is not wrong because
it breaks; it is wrong because it wastes. With chunks, every chunk takes as
long as its slowest member and the fast workers idle. A pool keeps all `limit`
slots busy until there is nothing left to do.

The reference's trick is the shared cursor: `const index = next; next += 1;`
happens *before* any `await`, so no two runners can claim the same index. That
is safe here for a reason worth naming — JavaScript's single thread means the
two statements cannot be interleaved. The identical code in Java or Go needs
an atomic increment or a mutex. Single-threaded is not only a constraint; it
is also a guarantee, and this is the exercise where you can feel it.

Two refinements you would want in production and which the gate does not ask
for: an error policy (does one worker's rejection abort the rest, or should it
be collected like ex2?) and an `AbortSignal` so the pool can be cancelled.
Libraries like `p-limit` and `p-map` are the standard answer, and knowing what
they do internally is exactly what this exercise is for.

## ex4 — a timeout is a race plus a cleanup

The race is the obvious half. The cleanup is the half that separates people
who have shipped Node from people who have read about it, and it has two
distinct consequences.

First, **the process will not exit**. Node keeps the loop alive while a timer
is registered, so a stray `setTimeout(fn, 30000)` keeps a CLI hanging for
thirty seconds after it has finished. (`unref()` on the timer is the other
fix: it tells the loop not to count this handle.)

Second, **the rejection may become unhandled**. A `Promise.race` whose loser
rejects later still has a rejection with nobody listening — race attaches
handlers to all inputs, so it is fine, but hand-rolled versions frequently are
not.

The `return await` inside `try`/`finally` is the other detail. Without the
`await`, the function returns the racing promise immediately, `finally` runs
straight away, and you clear the timer before it can ever fire. Most linters
flag `return await` as redundant; inside `try` it is not, and this is the
canonical counterexample.

## challenge — retry, and the failure mode of retries

Retrying is easy to write and easy to write badly. Three rules keep it honest.

**Only retry what can succeed on a retry.** A 500 or a connection reset,
yes. A 400, a 401, a validation error — never; the same request will fail the
same way, and you have tripled your load for nothing. That is what
`isRetryable` is for, and in real code it usually inspects an error code or an
HTTP status.

**Back off exponentially.** Fixed-interval retries from many clients arrive in
a synchronised wave, which is exactly what a recovering service cannot
survive — a "retry storm" or "thundering herd". Doubling the wait spreads
them out, and adding *jitter* (a random fraction of the delay) breaks the
synchronisation properly. Every production retry helper you will meet has
jitter; the gate leaves it out only because a random number cannot be asserted
on.

**Report the last error.** The caller needs to know how it finally failed,
with a stack that reflects the final attempt. Swallowing the errors and
throwing `new Error("retries exhausted")` throws away the diagnosis.

The classic follow-up: "what if the operation is not idempotent?" Retrying a
payment because you did not get a response can charge a customer twice. The
answer is idempotency keys — the client generates a unique key per logical
operation and the server deduplicates — and knowing that is the difference
between a retry helper and a retry incident.

## review1 — failover, and the combinator nobody remembers

`Promise.any` is the newest of the four and the least used, which makes it a
good review target: it is the one people forget exists and reimplement badly
with `race` plus counting.

The semantics to keep: it ignores rejections until there are no more chances,
then rejects with an `AggregateError` whose `.errors` array holds every
rejection in input order. Compare that with `race`, which settles on the first
*settlement* — so a task that fails in 5 ms beats one that succeeds in 50 ms,
and your "failover" always returns the fastest failure. That distinction is a
good interview question precisely because it sounds like a detail and is
actually the whole behaviour.

The implementation detail worth noticing in the reference is the `.catch` that
records the message and **rethrows**. Swallowing there would turn a rejection
into a fulfilment with `undefined`, and `Promise.any` would happily resolve
with nothing at all. A `catch` that does not rethrow is a decision, not a
formality.

## Further reading

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — the reference for all four combinators, with the settling rules stated precisely.
- [MDN: `Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) — the result shape from ex2, including the discriminated union.
- [`util.promisify()`](https://nodejs.org/api/util.html#utilpromisifyoriginal) — what the real one does, including the custom symbol.
- [Discover promises in Node.js](https://nodejs.org/en/learn/asynchronous-work/discover-promises-in-nodejs) — the official tour, callbacks through async/await.
- [MDN: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — the cancellation half that ex4 deliberately leaves out.
