# Reading - node/d07_concurrency_control

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **choosing the right amount of parallelism and
enforcing it exactly**. All eight answers are variations on one structure: a
counter or a set of permits, a FIFO queue of parked `resolve` functions, and a
release path that must run on every outcome. What changes between them is the
unit being limited — permits (ex1), identical calls (ex2), submissions (ex3),
groups (ex4), array items (ex5), keys (ex6), objects (ex7) — and what happens on
failure or cancellation. The single most common bug across the whole family is a
release that only runs on the success path: the limit silently shrinks with
every error until the system stops entirely, and the stack trace when it does
points at nothing. Every one of these gates has an assertion for it.

## ex1 — permits, and the double release

**What it tested:** the primitive itself, plus the ownership question: who is
allowed to give a permit back, and how many times?

**The classic mistake:** a single shared `release` per semaphore, or a release
with no guard. A caller that releases in both a `.then` and a `finally` — an
easy mistake, and a common one after a refactor — hands back two permits for one
acquire, and the limit is silently raised for the rest of the process.

**Model answer:** a factory that builds a fresh release closure per acquire,
each with its own `returned` flag, and a release that hands the permit straight
to the next waiter rather than incrementing and re-checking.

## ex2 — the stampede, and why this is not a cache

**What it tested:** single-flight de-duplication, and the discipline to clear
the slot on *both* outcomes.

**The classic mistake:** clearing only on success, which turns a transient
failure into a permanently cached rejection — every caller for the rest of the
process gets an error from a request that happened once. The opposite mistake is
keeping the value after it settles, which is a cache, and a cache needs an
invalidation story this function does not have.

**Model answer:** hold the promise, share it, and clear it in a `.finally` —
guarded by `inFlight === flight` so a landing flight cannot cancel the one that
replaced it.

## ex3 — one bad task must not stop the pipeline

**What it tested:** a queue whose callers own their own outcomes. The queue is
infrastructure; a task's failure is the submitter's problem, not the queue's.

**The classic mistake:** releasing the concurrency slot only when a task
succeeds. Each failure permanently reduces the effective concurrency by one, so
a service degrades over hours and eventually stops processing anything — with no
error at the moment it wedges. Almost as common: letting the task's rejection
propagate into the queue's own bookkeeping promise, which makes the whole queue
unusable after the first error.

**Model answer:** route each task's settlement to its own `resolve`/`reject`, and
hang the slot release on `.finally` so it runs whatever happened.

## ex4 — a batch is a barrier

**What it tested:** the thing a limiter is often mistaken for, asked for on
purpose. Sometimes the group *is* the unit — one bulk insert, one multi-get —
and then the barrier is the feature.

**The classic mistake:** starting the next group when the first member of the
current one finishes. That is a limiter, not a batch, and it breaks the
guarantee callers rely on: that everything in group *n* has landed before
anything in group *n+1* begins.

**Model answer:** `slice`, `map` into `Promise.all`, `await`, append. And the
matching sentence: this wastes capacity whenever the items are independent,
because every group takes as long as its slowest member.

## ex5 — the pool, with failures as data

**What it tested:** the limiter pattern proper — a shared cursor, `limit`
runners, results by index — with `allSettled` semantics bolted on.

**The classic mistake:** putting the `try`/`catch` around the whole runner or
around the final `Promise.all`. Either turns "keep going and report" back into
"stop on the first error". The catch belongs around the single `await
worker(...)` inside the loop, which is exactly what lets the loop take another
index.

**Model answer:** `const index = next; next += 1;` with no `await` between the
two lines — safe here precisely because JavaScript is single threaded, which is
the sentence an interviewer is listening for.

## ex6 — chaining onto a tail

**What it tested:** per-key serialisation, which is what you actually want
almost every time somebody asks for "a lock" — a global one would serialise
unrelated work and destroy your throughput.

**The classic mistake:** storing the caller's own result promise as the tail. If
`fn` rejects, the tail is a rejected promise, and the next waiter either
inherits the previous caller's error or never runs at all — the key is locked
forever. The other mistake is never deleting the map entry, so `held` is true
for every key ever seen and the map is a memory leak.

**Model answer:** store a promise that settles the same way for both outcomes,
return the real one to the caller, and delete the entry only if the tail you are
holding is still the current one.

## ex7 — a semaphore that remembers what it lent you

**What it tested:** lazy creation, a hard ceiling, and FIFO hand-off.

**The classic mistake:** creating a resource for every acquire until `max`, even
when idle ones are sitting right there — the reuse that makes it a pool never
happens. And the serious one: no double-release guard, so the same connection
ends up lent to two callers, who interleave statements on it and produce a bug
report about the database.

**Model answer:** idle list first, then create-if-under-max, then queue; and on
release, hand straight to a waiter rather than via the idle list, because a
round trip through the list is a chance for somebody else to take it.

## ex8 — cancellation has three separate jobs

**What it tested:** that "abortable" is not one behaviour. Refusing to start when
already aborted, refusing to start *more* once aborted, and unblocking the
caller immediately are three requirements, and an implementation can satisfy any
two of them and still be useless.

**The classic mistake:** checking the signal only at the top. The call then runs
to completion after the user has cancelled, and the rejection — if any — arrives
whenever the last worker happens to finish. Nearly as common: forgetting to
remove the abort listener, which accumulates one per call on a long-lived signal
until Node prints `MaxListenersExceededWarning`.

**Model answer:** the ex5 pool with `while (!signal.aborted)` as the loop
condition, raced against a promise that rejects on the abort event, with the
listener removed in a `finally` — and the signal handed to the worker, because
stopping the scheduling does not stop the requests already in flight.

## Further reading

- [MDN: `Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) — the ordering and fail-fast guarantees ex4 and ex5 lean on.
- [MDN: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — the cancellation model of ex8, including `AbortSignal.abort()` and `signal.reason`.
- [MDN: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) — `aborted`, the `abort` event, and `throwIfAborted()`.
- [Node.js: Dont block the event loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) — why unbounded concurrency is a problem even when nothing is CPU bound.
- [`p-limit`](https://github.com/sindresorhus/p-limit) — the library version of ex5, worth reading now that you have written it.
