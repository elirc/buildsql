# Reading - node/d03_event_loop_order

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is a single mental object: **the checkpoint**. Between
any two callbacks the runtime runs, it does the same thing — drain the
`nextTick` queue completely, drain the microtask queue completely, and if either
refilled, go round again. Only when both are empty does the event loop advance
to a phase: timers, then poll, then check. Every prediction here is that
sentence applied carefully, and every piece of code here is a choice about which
queue to put work in. The pattern that unites them: a microtask is *not* a turn
of the loop. Anything that only ever queues microtasks — `await`,
`process.nextTick`, `.then` — is still holding the thread, and nothing else in
the process can happen. That is why ex5 and ex8 exist next to five prediction
problems.

## ex1 — the order, without any complications

**What it tested:** the base case. Synchronous code, then `nextTick`, then
microtasks, then the loop's own phases.

**The classic mistake:** putting the timer before the microtask because
`setTimeout(..., 0)` reads like "right now", or putting `queueMicrotask` before
`process.nextTick` because microtasks are the standard and `nextTick` is the
Node oddity. Node drains its own queue first, deliberately, and that is one of
the few places Node departs from the browser.

**Model answer:** both synchronous logs first — nothing scheduled can start
while the function that scheduled it is still running — then C, D, B.

## ex2 — the checkpoint is a loop, not a sequence

**What it tested:** what happens when a callback adds to a queue while the
checkpoint is running, and whether you know which queues have already been
drained at that moment.

**The classic mistake:** expecting `micro-from-tick` to run immediately after
`tick-1`, as though queueing a microtask from inside a `nextTick` callback
interrupted the drain. It does not: the tick queue empties first, and the
microtask joins the ones already waiting, behind `micro-1`.

**Model answer:** sync, both ticks, both microtasks in queueing order, and then
the tick queued from a microtask — which only runs because the checkpoint goes
round again after finding its queue refilled.

## ex3 — awaiting a promise costs an extra hop

**What it tested:** the translation from `async`/`await` to microtasks, and the
one detail almost nobody has right: `await` on a plain value resumes in one
microtask, but `await` on a *promise* has to adopt that promise first, and
adoption costs an extra hop.

**The classic mistake:** predicting `outer-end` immediately after `inner-end`.
It reads that way — `inner()` finished, so `outer` continues — but `then-1` was
queued during the synchronous run and gets there first, because `outer` is still
one hop behind.

**Model answer:** three synchronous labels, then `inner-end`, then `then-1`,
then `outer-end`, then `then-2`. If your model predicted six labels in the right
order and one in the wrong place, your model is one hop off, and it is worth
fixing rather than memorising.

## ex4 — writing into a queue on purpose

**What it tested:** the inverse of the prediction problems. Given a required
order, choose the mechanism — which is the form the question actually takes at
work.

**The classic mistake:** treating `setImmediate` and `setTimeout(fn, 0)` as
interchangeable. They race unpredictably at the top level of a program, which is
why everybody has seen both orders and concluded it is random. It is not: from
inside an I/O or timer callback, the check phase of *this* turn comes before the
timers phase of the *next* one, so `setImmediate` wins every time.

**Model answer:** five lines, one per mechanism, and the ability to say why the
last two are deterministic in this context and not in general.

## ex5 — the difference that matters in production

**What it tested:** whether "yield to the event loop" means something specific
to you. A recursive `process.nextTick` loop is the classic accidental denial of
service: the process is not blocked in the CPU sense, yet no timer fires, no
socket is read, and no health check is answered.

**The classic mistake:** believing `await` fixes it. Awaiting an
already-resolved promise queues a microtask, which the checkpoint drains before
the loop advances — so an `await`-per-item loop starves exactly as thoroughly as
a `nextTick`-per-item loop, just with nicer syntax.

**Model answer:** one driver parameterised by the scheduler, `process.nextTick`
for the starving version and `setImmediate` for the fair one — and the first
item handled synchronously, so the yields land between items rather than in
front of them.

## ex6 — a queue with no fixed length

**What it tested:** that the `nextTick` drain is `while (queue.length)`, not a
pass over a snapshot. Everything pushed during the drain is drained in the same
pass.

**The classic mistake:** predicting `tick-1`, `micro`, `tick-2`, … — imagining
the queues alternate one entry at a time. They do not; each is emptied before
the next is touched, and "emptied" includes whatever arrived in the meantime.

**Model answer:** the three ticks run back to back with nothing between them,
then the microtask, then the timer. Three is a demo; a few thousand is an
incident, and that is the entire content of the warning in Node's docs.

## ex7 — one microtask per link

**What it tested:** the bookkeeping. Nine labels, four schedulers, and no rule
you have not already used — which is exactly what makes it the interview
version.

**The classic mistake:** treating `.then(a).then(b).then(c)` as a block of three
microtasks queued together. Only `a` is queued up front; `b` is queued when `a`
returns and the intermediate promise settles. Everything else waiting in the
queue runs in between, which is why `q1`, `q2` and `a-1` all land inside the
chain.

**Model answer:** write the queue as a list, append as you go, and process it
front to back. The moment you stop trying to hold it in your head, the problem
becomes mechanical.

## ex8 — chunking, with the yield in the right place

**What it tested:** ex5's lesson applied to a real shape — processing a large
array without making the process unresponsive — plus an off-by-one that the
gate pins down precisely.

**The classic mistake:** two of them. Yielding with `await Promise.resolve()`,
which does not yield at all; and yielding after every chunk including the last,
which adds a pointless turn of the loop before resolving and makes the count
wrong. The gate catches the first with a probe position and the second with a
number.

**Model answer:** yield at the top of every iteration except the first. That
places the gaps between chunks by construction, so the count is just the number
of gaps and there is nothing to adjust at the end.

## Further reading

- [Node.js: The event loop, timers, and `process.nextTick()`](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — the phases, and the official explanation of why `nextTick` is drained first.
- [Node.js: Dont block the event loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) — the production framing of ex5 and ex8.
- [MDN: In depth — microtasks and the JavaScript runtime](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth) — the microtask queue as the specification defines it.
- [MDN: `queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) — when to reach for it instead of `Promise.resolve().then`.
- [MDN: `await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) — including the note about how many ticks resuming costs, which is the whole of ex3.
