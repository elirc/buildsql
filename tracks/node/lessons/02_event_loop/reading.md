# Reading - node/02_event_loop

The event loop is the most-asked and least-understood topic in Node
interviews. What follows is the model that survives contact with the runtime,
including the parts most explanations get wrong.

## Notes

**The loop is libuv, not V8.** V8 executes JavaScript and owns the microtask
queue; libuv owns the phases, the timers, the I/O polling and the thread pool.
Node glues them together: after every callback libuv hands control back
through Node, which drains the nextTick queue and then asks V8 to drain its
microtask queue before anything else runs. That division explains why
`process.nextTick` (Node's own queue) is served before promise callbacks
(V8's queue) — Node drains its own list first, then calls `runMicrotasks()`.

**The phases, and what actually lives in them.** *timers* runs `setTimeout`
and `setInterval` callbacks whose threshold has elapsed. *pending callbacks*
runs a small set of deferred system callbacks (some TCP errors). *poll* is
where the loop spends its idle time: it computes how long it may block, waits
for I/O events, and runs their callbacks. *check* runs `setImmediate`. *close
callbacks* runs `'close'` handlers. Everything else you can schedule —
promises, `nextTick`, `queueMicrotask` — is not a phase; it is a checkpoint
that runs between callbacks.

**Timers are a floor, not a promise.** `setTimeout(fn, 100)` means "not
before 100 ms", and Node clamps a `0` to `1`. If a callback in an earlier
phase runs for 250 ms, your 100 ms timer fires at 250-something. This is why
timing-based tests are flaky and why nothing in this course's gates measures a
clock: a correct program can be late, so lateness cannot be the assertion.

**`setImmediate` vs `setTimeout(fn, 0)`.** Inside an I/O callback the answer
is deterministic: you are in the poll phase, check comes next, so
`setImmediate` wins. At the top level it is genuinely a race between how long
start-up took and the 1 ms clamp, and you can observe both orders on the same
machine. If an interviewer asks, the correct answer names the context; the
answer "immediate is always first" is wrong, and so is "timeout is always
first".

**Starvation is real and silent.** `process.nextTick` is drained to empty
before the loop continues, so a nextTick that schedules a nextTick never lets
the loop breathe. The same applies to promises: a recursive
`Promise.resolve().then(loop)` starves I/O just as effectively. Node's own
docs call `nextTick` a footgun for exactly this reason and recommend
`setImmediate` for "run this soon, but let the loop keep going". The pattern
you actually want in application code is the one in ex4.

**Context changes the checkpoint order.** This is the subtlety the gate is
built around. The rule "nextTick queue before microtask queue" describes what
happens when the runtime reaches a checkpoint from a callback — a timer, an
I/O completion, an immediate. If you are *already inside* a microtask drain,
new microtasks are appended to the drain in progress and run before control
returns to Node, so the nextTick queue waits. The top level of an ES module is
such a place: ESM evaluation is performed as a promise job, so a script whose
body schedules both will see promises win. The same file written as CommonJS
sees `nextTick` win, because a CommonJS main module is evaluated
synchronously. Try it — it takes two minutes and it will stay with you:

```js
// probe.cjs  ->  tick, promise        (classic order)
// probe.mjs  ->  promise, tick        (already inside a microtask drain)
process.nextTick(() => console.log("tick"));
Promise.resolve().then(() => console.log("promise"));
```

Do not build anything on that difference. Do know it exists, because it is
the reason two blog posts can show contradictory output and both be honest.

## ex1 — the base case

Five labels, three of them deferred, and the whole answer comes from one
sentence: synchronous code runs to completion, then the checkpoint, then the
loop. Nothing in the snippet is concurrent — there is no parallelism here at
all, just a single thread deciding what to run next.

What this exercise is really testing is whether you read `setTimeout(fn, 0)`
as "run this later" rather than "run this now-ish". Scheduling functions
return immediately; they are cheap bookkeeping. Beginners read the source top
to bottom and assume execution follows the same path, which is exactly the
model that fails on the first callback.

The classic interview version adds a fourth queue and asks you to write the
output on a whiteboard. If you can say *why* each one is where it is —
"nextTick is Node's own queue and it is drained first; promise callbacks are
V8 microtasks and they come next; timers are a phase of the loop, so they are
a whole turn away" — you have answered better than most candidates, who
memorise the order and cannot defend it.

## ex2 — queues that refill

The nested case is where the model earns its keep. Three rules, in the order
they bite:

1. **The nextTick queue is drained to empty, not one-at-a-time.** A nextTick
   scheduled from inside a nextTick callback joins the same drain, so
   `tick-1-nested` runs before any promise callback, even though it was
   scheduled after all of them.
2. **The microtask queue behaves the same way.** `promise-1-inner` is queued
   while the drain is running and still runs in that drain — after
   `microtask-2`, which was already waiting.
3. **A nextTick queued during the microtask drain does not interrupt it.** The
   microtasks finish, then Node notices its own queue has refilled and drains
   it again. That is why `tick-from-promise` runs after `promise-1-inner` but
   still before the timer.

Rule 3 is the one that makes the "checkpoint" a loop rather than two steps,
and it is the rule that makes the challenge exercise interesting.

The production version of this knowledge is debugging an "impossible"
ordering: state that was updated in a `.then` and read in a `nextTick` and
appeared stale, or a log line that came out before the operation it describes.
Once you can name the queues, those stop being mysteries and become one
sentence: "the nextTick fired before the microtask that set it".

## ex3 — the same knowledge, pointed the other way

Predicting an order proves you can read; producing one proves you can write.
The constraint that makes this exercise more than a syntax drill is the gate's
own microtask, queued *before* your function is called. Since both of your
callbacks are queued after it, source order cannot possibly decide the result.
Only the choice of queue can.

That is the daily-work version of this lesson. You do not usually care whether
a callback runs in position three or four; you care about questions like
"should this run before or after the current stack finishes?", "should this
happen before the response is written?", "does this need to wait for I/O to
get a chance?" Those are queue questions, and they have three answers:
`process.nextTick` (before everything else, use sparingly),
`queueMicrotask`/promises (before the loop moves on, the default for anything
promise-shaped), and `setImmediate`/`setTimeout` (after the loop gets a turn,
for anything that must not block).

## ex4 — the yield that actually yields

Chunking a long job is the single most common practical fix for a blocked
event loop, and the trap is right there in the code review: `await` looks like
yielding. It is not. `await Promise.resolve()` — or any already-settled
promise — suspends your function and resumes it in the microtask drain, which
happens *before* the loop is allowed to continue. Nothing else gets a turn. If
you have ever added an `await` inside a hot loop to "let other things run" and
seen no improvement, this is why.

A real yield goes through a macrotask:

```ts
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
```

`setImmediate` is the right primitive here because the check phase runs right
after poll, so pending I/O gets served on the way past. `setTimeout(fn, 0)`
also works and costs at least 1 ms per yield, which adds up over thousands of
batches.

Two follow-ups worth having ready. "When would you not do this?" — when the
work is genuinely CPU-heavy rather than merely long, in which case chunking
just spreads the pain and the answer is `worker_threads` or a separate
process. And "how do you know the loop is blocked in production?" — measure
event-loop delay (`perf_hooks`'s `monitorEventLoopDelay`, or the lag metric
every APM exports) and alert on the p99; a healthy Node process sits under a
few milliseconds.

## challenge — the model, as code

Writing the simulator forces every hand-wave into a decision. You cannot
"sort by priority" because a task can schedule another task mid-drain; you
cannot run the checkpoint once because the queues refill; you cannot run all
the timers and then the checkpoint, because Node runs the checkpoint after
*each* timer callback.

That last rule is worth stating in interview form: "if two `setTimeout(fn, 0)`
callbacks are pending and the first one calls `process.nextTick`, does the
tick run before or after the second timer?" — before. The checkpoint runs
between callbacks, not between phases. A surprising number of otherwise strong
candidates get that wrong, because the common diagram of the loop shows phases
and hides the checkpoints.

The one simplification your simulator is allowed: it treats the timer list as
a plain queue. Real Node keeps timers grouped by duration in a min-heap of
lists, and a `setTimeout(fn, 0)` scheduled *during* the timers phase does not
run in that same phase — it expires a millisecond later. For the scenarios
here the observable order is identical, which is why the gate can hold your
simulator to the real runtime's behaviour.

## review1 — async functions are scheduling

The point of the review variant is that `async`/`await` is not a different
mechanism; it is the same two queues with nicer syntax. An `async` function
runs synchronously up to its first `await`. The `await` suspends it and queues
the continuation as a microtask. Returning from the function resolves the
promise it returned, which queues *that* promise's `.then` callbacks — as
microtasks, joining the back of the queue that is currently draining.

The detail people miss is `await null`. `await` on a non-promise still
suspends: the value is wrapped and the continuation is scheduled, so there is
always at least one microtask hop. This is why `await` inside a tight loop is
expensive in a way a plain function call is not, and why "just add await" is
never free.

Say it as a rule and it becomes portable: **calling an async function starts
it; awaiting it waits for it.** Two separate acts, and the gap between them is
where concurrency lives — which is exactly what lesson 03 is about.

## Further reading

- [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — the official walk through the phases, including the `setImmediate` vs `setTimeout` section.
- [Do not block the event loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) — the practical companion to ex4, with the cost of common blocking operations.
- [`process.nextTick()`](https://nodejs.org/api/process.html#processnexttickcallback-args) — the API docs, including the starvation warning.
- [MDN: the JavaScript event loop and microtasks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) — the language-level half of the story, which is the part the browser shares.
- [MDN: `queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) — when to reach for it instead of `Promise.resolve().then()`.
