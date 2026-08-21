# Reading - node/i3_interview_rapidfire

Four ⭐⭐⭐ concepts in short form, plus why spaced repetition is the mechanism
this whole part of the course runs on.

## Notes

**Why the same material again.** You have passed a gate on every idea in this
lesson. That is not the same as being able to produce it, cold, while
explaining yourself to someone who is evaluating you. Recognition decays much
more slowly than recall, which is exactly why re-reading feels productive and
does so little: the feeling of familiarity is not the skill being tested.

**How the ladder works.** Passing all the core exercises in a lesson schedules
its `review1` variant, which comes back at 3, 7, 21 and 60 days
(`dojo review` shows what is due). Getting it right pushes it out; getting it
wrong brings it back. Since all three interview lessons ship review variants
and they are all built on ⭐⭐⭐ concepts, the highest-frequency material is the
material that surfaces most often — which is the entire design.

**How to do a review properly.** Cold, out loud, no hints, no peeking at the
earlier lesson. If you cannot do it, that is information: redo the lesson it
came from rather than the review. The point of the ladder is to find the gaps
while they are cheap.

**On speed.** None of these should take ten minutes. If one does, it is not
that you are slow — it is that a decision you thought was automatic is not
yet. Note which one and give it a second pass next week.

## ex1 — the queue order, in five labels

The compressed version of everything lesson 02 taught. Three facts do all the
work: an `async` function body runs synchronously to its first `await`; the
`process.nextTick` queue is drained before the microtask queue when the
runtime reaches a checkpoint from a callback; and the microtask queue is
first-in-first-out.

That third one is what decides this snippet. The async function's continuation
is queued the instant it reaches `await Promise.resolve()`, which happens
during the synchronous pass — *before* the `queueMicrotask` on the line below
has run at all. Source order and queue order are different things, and this is
the smallest snippet that shows it.

The interview version of the mistake: candidates say "the `queueMicrotask` is
above the log, so it runs first" — reasoning about the text rather than about
the timeline. The fix is to narrate the synchronous pass as a sequence of
*queueing events*, then serve the queues.

## ex2 — backpressure in ten lines

`write()` returns a boolean and almost nobody looks at it. The consequence is
not subtle: a fast producer and a slow sink means the sink's internal buffer
grows without limit, which is how an export job that "worked fine on staging"
uses eight gigabytes in production.

The mechanics to be able to state: `write()` always accepts the chunk; the
`false` return means the buffer is now over `highWaterMark`; `"drain"` fires
when it has emptied enough to continue. `.pipe()` and `pipeline()` implement
the loop for you, so you only write it by hand when you are the one producing
the chunks — a loop over database rows, a generator, an API paginator.

The gate measures `writableLength` inside the sink rather than timing
anything, which is worth stealing as a testing technique: it turns "is this
efficient?" into an exact number instead of a stopwatch.

The follow-up: "what if the sink errors while you are waiting for drain?"
`await once(dest, "drain")` never settles, and the honest answer is to use
`pipeline()`, which handles error propagation and destruction — or to race
the drain against the `"error"` event.

## ex3 — the timeout, and what it does not do

Two halves, and the second is the one people skip. The race is obvious. The
cleanup is what stops a five-second timer keeping the process alive after the
work finished in twenty milliseconds — the reason a CLI hangs before exiting
and a test suite takes an extra thirty seconds.

`return await` inside `try`/`finally` is the syntactic detail worth
remembering. Without the `await`, the function returns the racing promise
immediately, `finally` runs at once, and the timer is cleared before it can
fire — so nothing ever times out and the bug is invisible until something is
genuinely slow.

Tagging the error with `code: "ETIMEDOUT"` follows the convention Node uses
for everything else: codes are API, messages are prose. A caller that wants to
retry timeouts but not validation failures needs something stable to branch
on.

And the caveat to volunteer: **racing does not cancel**. The slow request is
still in flight, still holding a connection, still going to arrive. If it must
actually stop, the underlying operation needs an `AbortSignal` — which `fetch`,
`fs/promises` and most modern APIs accept. Saying that unprompted is the
difference between "I have used a timeout" and "I understand what a timeout
is".

## ex4 — the taxonomy, as HTTP

This is the error-handling question in the form it takes at the top of a
service: something was thrown, and now a client is waiting for an answer.
Three rules, in order, and each one exists for a reason.

**Your own errors already know.** An error you constructed with a status and a
code is one you designed for this moment — its message was written to be read
by a client. Use all three fields and get out of the way.

**System errors keep their meaning and lose their words.** `ECONNREFUSED`
means a dependency is down, which is a 502 — the client should retry later,
and it is not their fault. But the message contains an internal host and port.
The same reasoning covers database errors that quote the SQL, ORM errors that
quote the parameters, and file errors that quote absolute paths.

**Everything else is a 500 with a fixed body.** No message, no stack, no
class name. Anything you have not deliberately shaped for a client is
something you have not thought about, and the safe default is to say nothing.

The other half of the answer, which the exercise cannot check: log the real
error with its stack and the request id you sent back. The generic response
and the specific log are two audiences for the same event, and getting that
split right is what makes an API both safe and debuggable.

## review1 — the chained then, and the checkpoint after every callback

The review variant folds in the two most-missed details of the event-loop
model.

**A chained `.then` is queued late.** `p.then(a).then(b)` does not queue `b`
when you write the chain; it queues `b` when the promise returned by
`.then(a)` settles, which is during the drain. So `b` joins the back of the
queue that is currently draining and runs in the same pass. Candidates who
imagine both callbacks queued up front get the order right by accident here
and wrong as soon as anything else is interleaved.

**The checkpoint runs after each callback, not each phase.** The
`process.nextTick` scheduled inside the timer callback runs before the loop
moves on — before any other timer, before the check phase. The common diagram
of the event loop shows six phases in a circle and hides the checkpoints
between callbacks, which is why so many people learn a model that predicts
this one wrong.

If you can state those two sentences and trace a snippet with them, you can
answer any version of this question an interviewer invents, including ones
that are not in this course. That is the goal — not the seven labels.

## Further reading

- [The Node.js event loop, timers and process.nextTick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — for ex1 and review1, one more time.
- [Backpressuring in streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) — the long version of ex2.
- [MDN: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — the cancellation that ex3 deliberately does not do.
- [Node.js errors: system errors](https://nodejs.org/api/errors.html#class-systemerror) — the `code` values ex4 branches on.
- [MDN: 502 Bad Gateway](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502) — why a failed dependency is not a 500.
