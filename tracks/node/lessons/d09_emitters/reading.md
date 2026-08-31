# Reading - node/d09_emitters

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **listener ownership**. An `EventEmitter` is a shared
object with no notion of scope: whoever attaches a listener owns it forever
unless they remove it, and whoever removes listeners can remove somebody else's.
Nearly every problem here turns on that — keeping the exact function reference so
it can be removed (ex2, ex3, ex8), cleaning up on the failure path as well as the
success path (ex2, ex5), copying the list before dispatching so a listener can
unsubscribe itself mid-call (ex4, ex6). The second theme is the seam between
**push and pull**: an emitter pushes whenever it likes, while promises and
iterators are pulled, and every adapter between them needs a buffer, a way to
wake a sleeping consumer, and a decision about what happens to events nobody was
there to hear (ex4, ex5, ex7).

## ex1 — an event for something that did not happen

**What it tested:** subclassing `EventEmitter`, and the discipline of emitting
only on real transitions.

**The classic mistake:** emitting `"change"` on every `set`. A config poller
writing the same value every ten seconds then re-renders the UI every ten
seconds, and the fix always arrives as a diff somewhere downstream instead of
here, where the information is. The other mistake is reading the previous value
after overwriting it, which quietly reports the new value twice.

**Model answer:** capture `previous`, compare, and return early — being careful
that "the key was never set" is different from "the key holds `undefined`",
which is what `Map.has` is for.

## ex2 — cleanup on both paths

**What it tested:** turning several events into one promise, and removing every
listener afterwards.

**The classic mistake:** attaching inline arrow functions and having nothing to
pass to `off`. The listeners then live as long as the emitter does — and because
a settled promise ignores later settlements, everything still *works*, which is
why this leak survives review. Node's `MaxListenersExceededWarning` at eleven
listeners is the only thing that will ever tell you.

**Model answer:** collect `[event, listener]` pairs, one `cleanup()` walking
them, called from every settling path — including the `"error"` handler, which
exists mainly to stop the emitter throwing.

## ex3 — remove exactly what you added

**What it tested:** whether "unsubscribe" means what you think it means.

**The classic mistake:** `source.removeAllListeners(event)`. It passes the
obvious test and destroys unrelated subscriptions belonging to code you have
never read — the gate registers one on purpose and checks it is still there. Its
sibling: calling `off` with a newly written arrow function that looks identical
to the one registered. Different function, no removal, no error.

**Model answer:** build each listener into a variable, keep the pairs, and have
the returned closure remove precisely those.

## ex4 — the subscribe-too-late race

**What it tested:** the sticky/replay pattern, which exists because "ready" often
fires before the thing that cares about it has finished constructing.

**The classic mistake:** replaying the backlog to *every* new listener. That is a
log, not an emitter, and the second subscriber gets a burst of ancient events it
has no context for. The other one is dispatching over the live listener array,
so a listener that unsubscribes itself makes the loop skip the next one.

**Model answer:** buffer whole argument lists while the listener list is empty,
detect "I am the first" by checking the length before pushing, delete the backlog
before replaying it, and always iterate a copy.

## ex5 — attach eagerly, iterate lazily

**What it tested:** the push-to-pull adapter, and one specific trap about
generators.

**The classic mistake:** writing `iterateEvents` as an `async function*`. Its
body does not run until the consumer's first `next()`, so the listeners are
attached late and every event emitted in between is gone — which the gate
catches by emitting twice before the consumer gets a turn. The second mistake is
checking the error flag before draining the queue, which throws away values that
had already arrived.

**Model answer:** an ordinary function that attaches the three listeners and
returns an object whose `[Symbol.asyncIterator]` is the generator — with the
loop draining the queue first, and cleanup in a `finally` so an early `break`
releases the emitter too.

## ex6 — the one event that throws

**What it tested:** the `"error"` special case, which is the single most
consequential rule in the whole `EventEmitter` API.

**The classic mistake:** treating `"error"` like any other event and returning
`false` when nobody is listening. Node deliberately throws instead, because a
failure nobody is watching should be loud — it is exactly why an unhandled
stream error crashes the process rather than leaving it wedged. Second mistake:
removing a `once` registration *after* calling it, so a listener that re-emits
its own event finds itself still registered and runs twice.

**Model answer:** one registry of `{ listener, once }`, dispatch over a copy,
remove `once` entries before invoking them, and on `"error"` with an empty list
throw the argument itself when it is an `Error` so the stack trace stays real.

## ex7 — a window, not a debounce

**What it tested:** the distinction between "wait until things go quiet" and
"deliver at most once per window".

**The classic mistake:** re-arming the timer on every push. That is a debounce,
and under a producer that never pauses it never delivers at all — the batching
window exists precisely to bound how long a value can sit unsent. The other
mistake is `flush()` that delivers without cancelling the timer, so the batch
goes out twice.

**Model answer:** arm the timer only when none is armed, one `deliver()` shared
by the timer and `flush()`, an empty-buffer guard, and a fresh array rather than
emptying the one the listeners are holding.

## ex8 — two listeners, one promise, two removals

**What it tested:** combining an emitter with an `AbortSignal`, and cleaning up
both sides.

**The classic mistake:** removing the emitter listener and forgetting the abort
listener. Request-scoped signals outlive dozens of these calls, so one leak per
call is how the warning appears in production. Nearly as common: attaching
listeners before checking `signal.aborted`, so an already-cancelled caller still
touches the emitter.

**Model answer:** early return on an aborted signal, two named handlers sharing
one `cleanup()`, and `signal.reason` as the rejection on both abort paths.

## Further reading

- [Node.js: Events](https://nodejs.org/api/events.html) — the whole API, including the `"error"` rule and `captureRejections`.
- [Node.js: The Node.js event emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) — the short introduction, worth rereading after ex6.
- [Node.js: `events.on()` and `events.once()`](https://nodejs.org/api/events.html#eventsonemitter-eventname-options) — the built-in versions of ex5 and ex8, including their `signal` options.
- [MDN: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) — `aborted`, `reason`, and the `abort` event ex8 listens for.
- [MDN: `Symbol.asyncIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) — the protocol ex5 implements by hand.
