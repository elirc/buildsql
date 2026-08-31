# Reading - node/d06_async_await

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is reading `await` as **two separate events**: a call
that starts work, and a suspension that waits for it. Written as `await f()`
they look like one thing, and almost every mistake in this set comes from that
blurring — sequential where parallel was free (ex2, ex6), a call outside the
`try` that was supposed to protect it (ex3), a cleanup that was not waited for
(ex4). The other half of the set is about what `await` does to control-flow
constructs you thought you knew: `try`/`finally` swallows the error you cared
about (ex4), `break` in a `for await` closes a resource for you (ex5, ex7), and
an ordinary `for` loop plus an array is all a transaction unwinder needs (ex8).
Separate calling from waiting, and every one of these becomes obvious.

## ex1 — the await that has to be there

**What it tested:** recognising a genuine data dependency. `findTeam` needs
`user.teamId`; there is no arrangement of these two calls that overlaps them.

**The classic mistake:** none, in the code — this is the calibration problem. Its
job is to fix the shape in your head *before* ex2 asks you to break it, so that
"await one at a time" stops being a habit and becomes a decision you can defend.

**Model answer:** two awaits and a returned literal, with no `try`/`catch` at
all: an un-caught rejection inside an `async` function is already a rejection of
the promise it returns.

## ex2 — calling is starting

**What it tested:** that a promise begins its work when it is *created*, not
when it is awaited — so hoisting the calls above the awaits is the whole fix.

**The classic mistake:** `const a = await first(); const b = await second();`.
Both round trips are now end to end, and on anything network-shaped that is
double the latency for no reason. The gate catches it by counting how many were
in flight at the same moment.

**Model answer:** call both, then `Promise.all`. Not `[await a, await b]` —
that also overlaps the work, but leaves the second promise unobserved while the
first is being awaited, so a rejection there is briefly an unhandled rejection.

## ex3 — the call belongs inside the try

**What it tested:** that a function returning `Promise<T>` can still throw
*synchronously*, and that `catch` in TypeScript hands you `unknown` for a
reason.

**The classic mistake:** `const p = fn(); try { return [null, await p] } catch
{...}`. Argument validation typically throws at the call, which is now outside
the protected region, so the helper that exists to never throw... throws. The
second mistake is assuming the caught value is an `Error` — `throw "nope"` is
legal and libraries do it.

**Model answer:** call and await inside the same `try`, and normalise in the
catch so the caller can always read `.message`.

## ex4 — finally is the wrong tool when cleanup can fail

**What it tested:** the interaction between `finally` and an in-flight
exception. A `throw` from `finally` **replaces** the original — so the tidy
version of this function destroys the only error worth reading.

**The classic mistake:** exactly that, plus its quieter cousin: calling
`cleanup()` without awaiting it. The function then resolves while the cleanup is
still running, and the next thing the caller does races it. In fs code the
symptom is a temp directory that disappears mid-test.

**Model answer:** two paths written separately — a defensive cleanup then a
rethrow on the failure path, a plain awaited cleanup on the success path — so
the "which error wins" rule is visible in the structure rather than implied.

## ex5 — break closes things

**What it tested:** that `for await` is a resource-management construct, not
just sugar. Leaving it early calls the iterator's `return()`, which is how a
source releases its file handle, socket or cursor.

**The classic mistake:** driving the iterator by hand —
`while (true) { const { value, done } = await it.next(); ... }` — and breaking
out of that. Nothing calls `return()`, and a database cursor stays open until
the process ends. The gate counts the `return()` calls precisely so the two
loops are distinguishable.

**Model answer:** `for await`, sentinel checked before the addition, `break`. And
the observation that a loop which ends naturally does *not* get a `return()`,
because the iterator closed itself.

## ex6 — the same lesson as ex2, N wide

**What it tested:** the object-shaped version of the sequential-await bug, plus
keeping keys aligned with values across the round trip.

**The classic mistake:** `for (const [k, v] of Object.entries(record)) result[k]
= await fn(v, k);` — perfectly readable, and N times slower than it needs to be.
The other one is rebuilding the object from a `Promise.all` result without
holding onto the key order, which silently transposes values between keys when
the input has more than a couple of entries.

**Model answer:** keys once, `keys.map(...)` into `Promise.all`, then zip back by
index — relying on `Promise.all` preserving input order, which is a guarantee
worth being able to quote.

## ex7 — three links in a cleanup chain

**What it tested:** writing an async generator, and understanding what happens
to it when the consumer walks away.

**The classic mistake:** reusing the chunk array (`chunk.length = 0`) after
yielding it. The consumer is holding that exact array, so it empties under them
— a bug that looks like data loss and is really aliasing. Close behind:
yielding an empty trailing chunk when the source length divides evenly.

**Model answer:** accumulate, yield, replace the array, and a final `if` for the
remainder. The cleanup requirement needs no code at all: breaking the outer loop
closes the generator, which unwinds the `for await` inside it, which closes the
source.

## ex8 — unwind in reverse, and tell the truth

**What it tested:** the saga/compensation pattern, and error hygiene under a
failing cleanup.

**The classic mistake:** rolling back the stage that threw. It did not complete,
so undoing it is at best a no-op and at worst a second failure. Nearly as
common: letting a rollback failure escape, which replaces the real error with a
message about the cleanup — so the incident report says "rollback a failed" and
nobody ever learns what caused the rollback.

**Model answer:** push onto the completed list only after `run()` returns, unwind
backwards with a `try` per rollback, collect the rollback failures onto the
original error, and throw the original. The caller then has both facts: what
broke, and that the undo was incomplete.

## Further reading

- [MDN: `async function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) — what the syntax compiles to, and how throws become rejections.
- [MDN: `await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) — including the note that the expression is evaluated before the suspension, which is the whole of ex2.
- [MDN: `for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) — the closing behaviour ex5 and ex7 depend on.
- [MDN: async generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*) — the construct ex7 is built from.
- [Node.js: Discover promises in Node.js](https://nodejs.org/en/learn/asynchronous-work/discover-promises-in-nodejs) — the platform-level tour, callbacks through async/await.
