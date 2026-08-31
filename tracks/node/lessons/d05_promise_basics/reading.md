# Reading - node/d05_promise_basics

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is reading `.then` as a **specification** rather than as
a method call. A promise has three states, one transition, and one guarantee:
pending becomes fulfilled or rejected exactly once, and every handler runs
asynchronously no matter when it was attached. Almost everything in this set
falls out of two consequences of that. First, `.then` already does more than
people credit it with — it returns a new promise, converts a thrown handler into
a rejection, adopts a returned promise, and passes an unhandled rejection
along — so four of the eight answers are one line and the work is being certain
enough to write one line. Second, the guarantees you get for free from a native
promise are exactly the guarantees you have to *implement* the moment you build
one by hand, which is what the last two problems are for.

## ex1 — the executor is synchronous

**What it tested:** the one structural fact that makes a deferred possible.
`new Promise(executor)` calls the executor immediately, so `resolve` and
`reject` are available before the constructor returns.

**The classic mistake:** believing the handler will run right after `resolve()`
on the next line. It never does — and that is the point. A function that
sometimes calls back synchronously and sometimes not ("releasing Zalgo") creates
ordering bugs that only appear under load, and promises structurally cannot do
it.

**Model answer:** capture both functions out of the executor, add one boolean so
`settled()` can be answered, and guard both methods with it — even though the
native promise would ignore the second settlement anyway.

## ex2 — four guarantees in one method

**What it tested:** whether you can enumerate what `.then` gives you. New
promise, throw-to-rejection, promise flattening, rejection pass-through.

**The classic mistake:** the explicit construction antipattern — wrapping a
promise you already have in `new Promise((resolve, reject) => ...)`. The
hand-rolled version nearly always drops one of the four rules, most often the
flattening, and the caller ends up awaiting a promise of a promise.

**Model answer:** `promise.then(fn)`. Being able to defend that as complete is
the exercise.

## ex3 — a catch that returns is a recovery

**What it tested:** what a *rejection* handler's return value means. Returning
normally from `.catch` produces a **fulfilled** promise; that is why
`try`/`catch` around an `await` recovers rather than rethrowing.

**The classic mistake:** assuming `.catch` re-raises unless you tell it not to.
It is the opposite: it swallows unless you rethrow, which is the single most
common source of "the error disappeared" in promise code — and the reason ex4
has to rethrow explicitly.

**Model answer:** `promise.catch(fallback)`, and the observation that the
fallback throwing produces a new rejection with no extra work.

## ex4 — observe, then put it back

**What it tested:** the two-handler form of `.then`, and the discipline of
restoring the outcome on both branches.

**The classic mistake:** the rejection handler that logs and returns. It looks
symmetric with the success handler and quietly converts every failure into a
fulfilment of `undefined` — a monitoring wrapper that eats the errors it was
added to report. The other one is wrapping `onSettle` in a `try`/`catch` "to be
safe", which hides a broken logger forever.

**Model answer:** `.then(onOk, onErr)`, return the value on one side, `throw
reason` on the other, and no protective `try` anywhere.

## ex5 — you cannot ask, so you race

**What it tested:** that promise state is deliberately unreadable, and the
standard trick for approximating it.

**The classic mistake:** attaching the success and failure handlers in separate
`.then().catch()` links. The catch then sits one microtask further down the
chain and loses the race with the marker, so every rejected promise reports
"pending". The other one is racing against a timer, which turns an exact answer
into a flaky one.

**Model answer:** one `.then(onOk, onErr)` attached first, one
`Promise.resolve().then(...)` marker attached second, `Promise.race` between
them — the marker settles one hop later, which is exactly the window that
separates "already settled" from "not settled".

## ex6 — creating is starting

**What it tested:** the distinction between calling an async function and
awaiting its promise. `map` calls everything immediately; awaiting afterwards
changes when you look, not when the work began.

**The classic mistake:** `const promises = items.map(step); for (const p of
promises) results.push(await p);` — which reads as sequential, runs as fully
parallel, and passes any test that only checks the results. The gate defeats it
by holding each step open and asserting that only one has *started*.

**Model answer:** `reduce` with a promise accumulator, so the call to `step` for
item n+1 happens inside a handler attached to item n. The index comes free from
`reduce`, which is what makes the error message cheap to build.

## ex7 — the specification is made of edge cases

**What it tested:** the thenable-adoption rules from Promises/A+, which exist
because a "thenable" can be any object anybody wrote, including a hostile one.

**The classic mistake:** `if (typeof value.then === "function") value.then(...)`
— two separate reads of a property that might be a getter. The A+ spec
explicitly requires one read, and the gate counts. Close behind: putting the
`try` around only the *call*, which misses a getter that throws, and forgetting
that `typeof null === "object"`.

**Model answer:** one read into a local, everything inside the `try`, a `settled`
flag so a throw after settling can be distinguished from a throw before, and
`then.call(value, ...)` so the thenable keeps its `this`.

## ex8 — the guarantees, from the implementer's chair

**What it tested:** everything the first seven problems took for granted, now
that nothing gives it to you: asynchronous delivery, ordering, register-before
and register-after, settle-once.

**The classic mistake:** calling the handlers directly from `resolve()`. It
passes a naive test and breaks the guarantee that makes promises composable —
which is why the gate checks the synchronous case first, before it checks
anything useful. The second is delivering handlers registered after settling
*synchronously* from `then`, which is the same bug on the other branch.

**Model answer:** a state variable, a waiting list, and one `deliver` helper
that always goes through `queueMicrotask`. Because microtasks are FIFO,
scheduling in registration order is delivering in registration order, and
nothing more is needed.

## Further reading

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — states, settling rules, and every method used here.
- [MDN: `Promise.prototype.then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) — the four guarantees ex2 and ex3 are made of, stated explicitly.
- [Promises/A+ specification](https://promisesaplus.com/) — short, readable, and the source of every rule in ex7 and ex8.
- [MDN: Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) — including the composition patterns behind ex6.
- [MDN: `queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) — how ex8 keeps its asynchrony guarantee without a timer.
