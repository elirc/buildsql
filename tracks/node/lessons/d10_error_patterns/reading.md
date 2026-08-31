# Reading - node/d10_error_patterns

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **handling a failure without destroying the evidence**.
JavaScript lets you throw anything, so the first job of any error-handling code
is to get back to a real `Error` (ex1) — and the second is to stop there, because
everything past that point is a temptation to lose something. The three things
worth protecting, and the three things these problems keep taking away from a
careless implementation, are: the original object (rethrow it, do not rebuild
it), the stack trace on it (do not construct a new error where you meant to
forward one), and the `cause` chain (wrap, never overwrite). The other half of
the set is about the *timing* of failures — a callback called twice, a throw that
escapes before a promise exists, a handler that fails while handling — because
those are the failures that never show up in a stack trace at all.

## ex1 — anything can be thrown

**What it tested:** that `catch (e)` gives you `unknown` for a real reason, and
that normalising it is a four-branch decision rather than a cast.

**The classic mistake:** `new Error(String(thrown))` for everything, including
things that already *were* errors. The stack trace then points at your
normaliser instead of at the failure, and every error in the system looks like it
originated in one file. Second: forgetting `typeof null === "object"` and
reading `.message` off `null`.

**Model answer:** `instanceof Error` first and return the same object; a string
becomes the message; a `{ message: string }` object donates its message and is
kept as `cause`; everything else is `String()`-ed and kept as `cause`.

## ex2 — calling back twice runs everything twice

**What it tested:** the callback-era hazard that promises made impossible.
Settling a promise twice is a silent no-op; calling a callback twice runs the
entire continuation twice.

**The classic mistake:** incrementing the "already called" flag *after* invoking
the callback. A callback that re-enters the API it was passed to then finds the
guard still open. The other one is throwing on the second call — satisfying, and
usually wrong, because the offender is somebody else's library and crashing it
does not fix their bug.

**Model answer:** flag set before the call, later calls counted rather than
thrown, and the counter exposed so a nonzero value is a diagnostic instead of a
mystery.

## ex3 — sometimes-sync is worse than always-slow

**What it tested:** whether you can name the guarantee and produce it in one
line. A function that usually returns a promise but occasionally throws
synchronously cannot be used safely: the caller's `.catch()` never sees the
throw.

**The classic mistake:** `try { return fn(...) } catch (e) { return
Promise.reject(e) }`, which works and is four times as long, or
`Promise.resolve(fn(...))`, which does **not** work — `fn` is called before
`Promise.resolve` gets a chance, so a synchronous throw still escapes.

**Model answer:** an `async` arrow. `async` converts every throw in the body into
a rejection of the promise it has already returned, and adopts a returned
promise rather than nesting it.

## ex4 — walking a chain that might be a circle

**What it tested:** reading `cause` correctly — it holds `unknown`, and only an
`Error` counts as another link — plus loop safety.

**The classic mistake:** `while (current.cause) current = current.cause`, which
walks straight into a plain-object cause and then crashes reading `.message` off
it. And no visited set, which turns any accidental cycle into a hang — the worst
possible failure mode for an error reporter, because it takes the process with
it while you are already debugging something else.

**Model answer:** a `Set` keyed by identity, an `instanceof Error` test on the
cause, and `root` being whatever the walk was holding when it stopped.

## ex5 — wrap, do not edit

**What it tested:** adding context to an error, and the `return await` rule.

**The classic mistake:** `error.message = context + ": " + error.message` and
rethrowing the same object. It looks efficient and it mutates something three
other frames may be holding — including a retry loop that will now log the
context three times. Second, and subtler: `return fn(...args)` inside the `try`.
The promise is returned before it rejects, the `try` block has already ended, and
the catch never runs. The linter will tell you `return await` is redundant; here
it is the entire mechanism.

**Model answer:** `return await` inside the try, a brand-new `Error` with the
composed message and `{ cause: error }`, and a message reader that copes with a
non-Error rejection.

## ex6 — the fallback that hid the fire

**What it tested:** narrowing a catch, and keeping the rethrow faithful.

**The classic mistake:** one `catch` returning the fallback for anything. The
config loader that was supposed to tolerate a missing file now tolerates a
permissions failure, a corrupted disk and a bug in its own parser — and reports
all of them as "using defaults". The subtler mistake is rethrowing the
*normalised* error rather than the original, which quietly replaces the stack.

**Model answer:** normalise for the predicate's benefit, decide, and then either
return the fallback or `throw error` — the original binding, untouched.

## ex7 — errors are a tree, not a list

**What it tested:** that modern failures branch. `Promise.any` produces an
`AggregateError`; wrapping produces a `cause`; both can nest, and the useful
information is at the bottom.

**The classic mistake:** recursing into links that were already visited. The
recursion terminates thanks to the visited set, but the node that closed the
cycle is left "having children" and never counts as a leaf — so a two-error loop
reports nothing at all. The fix is to filter to *unvisited* links before asking
whether any remain.

**Model answer:** a `linksBelow` helper covering both link kinds, a `Set` doing
double duty as deduplicator and loop guard, and leaves recorded when nothing new
lies below.

## ex8 — the handler that has to survive its own handlers

**What it tested:** the top-level routing decision, with three asymmetric
guards. This is the shape of a `process.on("uncaughtException")` handler, an
Express error middleware, or a job runner's last resort.

**The classic mistake:** wrapping everything uniformly — including `onFatal`.
When the last handler in the chain fails there is nowhere left to send anything,
and catching it there loses both errors in complete silence. Almost as common:
reporting the *classifier's* error when `classify` throws, which buries the
error somebody actually has to fix under a complaint about your own code.

**Model answer:** normalise, `try` around `classify` falling back to fatal with
the **original** error, `try` around `onOperational` routing its failure to
`onFatal`, and `onFatal` deliberately unguarded.

## Further reading

- [MDN: `Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) — the constructor options, including `cause`.
- [MDN: `Error.prototype.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) — the chain ex4 and ex7 walk.
- [MDN: `AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) — the other branching link in a failure tree.
- [Node.js: `process` events](https://nodejs.org/api/process.html#event-uncaughtexception) — `uncaughtException` and `unhandledRejection`, which are where ex8 usually gets installed.
- [Node.js: Error handling guide](https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks) — the callback conventions ex2 exists because of.
