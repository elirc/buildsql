# Reading - node/d15_readable_writable

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **demand-driven production**. A Readable is not a
loop that emits; it is a `read()` callback the machinery invokes when a consumer
wants more, plus one obligation — `push(null)` when there is no more. Every
problem here turns on who moves first: the range stream that must end an empty
range unprompted, the taker that must stop a source mid-flow, the concat that
must not start source two early, the paged source that must not fetch ahead of
demand. The recurring instrument is the async iterator: `for await` subscribes,
converts errors to rejections, and — the part people forget — destroys the
stream when you `break`. Where the iterator is the wrong tool (the merge, the
pair), the answer is hand-built Readables fed by `push`, with a counter or a
flag doing the bookkeeping the iterator would have done.

## ex1 — push(null) is the contract

**What it tested:** the minimal hand-built source: object mode, a cursor in a
closure, and the end signal.

**The classic mistake:** treating `push(null)` as something that happens when
data runs out mid-stream, and never considering the range that was empty from
the start. The first `read()` then pushes nothing, the machinery waits politely
for a push that never comes, and the consumer hangs with no error anywhere. The
lesser mistake is forgetting `objectMode`, which coerces every number into a
Buffer and turns `[2, 4, 6, 8]` into byte soup.

**Model answer:** check "past the end" **before** producing, so the empty range
hits `push(null)` on the very first read — the same line handles both endings.

## ex2 — a partial success is a failure in disguise

**What it tested:** consuming a stream you did not build, with the error path
treated as seriously as the data path.

**The classic mistake:** the `data`/`end` listener pair without `error`, which
resolves with whatever had arrived when the stream broke. A caller receives two
of five records and no signal that three are missing — the worst outcome a
consumer can produce, because it is indistinguishable from success. Adding the
`error` listener but forgetting to remove the others on each terminal path is
the second version of the same bug.

**Model answer:** `for await` — subscription, cleanup, and error-to-rejection
conversion in one keyword; the pending `next()` rejects with the stream's real
error.

## ex3 — fail the write, not the process

**What it tested:** the Writable side of the contract: `callback(error)` is how
a sink refuses, and refusal must be precise about what was and was not taken.

**The classic mistake:** counting the chunk before checking it, so `bytes()`
claims the sink accepted data it refused — an off-by-one-chunk that matters the
moment anyone reconciles the count against what was stored. The other is
throwing from `write()` instead of passing the error to the callback, which
crashes instead of propagating through the stream's error machinery to the
`pipeline()` that fed it.

**Model answer:** test `accepted + chunk.length > limit` before adding —
strictly greater, so landing exactly on the budget is allowed — and put the
number in the message.

## ex4 — break is a shutdown, not just an exit

**What it tested:** early termination as a first-class operation. Taking three
items from a hundred-item source must cost three items, not a hundred.

**The classic mistake:** collecting with a `data` listener and detaching after
`n` items. Detaching does not stop a flowing stream — production continues into
the void, and for a file or socket source the handle stays open until the
source ends on its own. The gate counts productions precisely to catch the
version that "works" while draining everything.

**Model answer:** `for await` with `break`: the loop's exit calls the
iterator's `return()`, which destroys the Readable — laziness and cleanup in
one keyword.

## ex5 — a generator is lazy by construction

**What it tested:** sequencing sources without starting them early. Attaching a
listener, resuming, or iterating a stream *is* starting it, and starting all
sources at once means holding every underlying resource open from the first
read.

**The classic mistake:** subscribing to all sources up front and switching a
"current" pointer between them. The gate plants a flag inside the second
source's `read()`, and any eager subscription trips it while source one is
still open. The subtler miss is the error path: catching a source's failure and
just ending the joined stream presents a broken transfer as a short one.

**Model answer:** an async generator looping `yield* source`, wrapped in
`Readable.from()` — the code that would start source two literally has not run
until source one's loop finishes, and a source error becomes the joined
stream's destruction for free.

## ex6 — demand drives the fetches

**What it tested:** adapting a pull-based API to a stream without turning it
into a download. Two independent disciplines: never two fetches in flight, and
never fetching far ahead of the consumer.

**The classic mistake:** ignoring that `read()` can be called again while your
fetch is still pending — without an in-flight guard the same cursor is fetched
twice and the gate's cursor log shows the duplicate. Second: leaving the
default object-mode `highWaterMark` of 16, which makes the machinery call
`read()` until sixteen items are buffered — for two-item pages, that is the
whole API fetched before the consumer touches item one.

**Model answer:** three closure variables — cursor, finished, inFlight — a
`highWaterMark` of 1, and `destroy(error)` on a rejected fetch rather than a
quiet early end.

## ex7 — the end is a countdown

**What it tested:** the one shape where every source *should* flow at once, and
the bookkeeping that makes the combined stream honest about ending and failing.

**The classic mistake:** ending the merge when the first source ends — the
survivors keep producing into a stream that has already pushed null, and their
items are silently lost. On the error path, forgetting to destroy the other
sources leaves them producing into a dead stream; forgetting the guard boolean
lets a second failure destroy an already-destroyed stream with a different
reason.

**Model answer:** a counter of open sources decremented on each `end`, null
pushed at zero; on the first error, destroy the survivors, destroy the merge
with that error, and ignore everything after.

## ex8 — a Duplex is two independent halves

**What it tested:** that the readable and writable halves of a Duplex are
separate machines, and that "wiring" means crossing them: A's `write()` pushes
into B's readable half.

**The classic mistake:** pushing into your **own** readable half, which builds
two echo chambers instead of a channel — each side hears itself and the gate's
directional assertions catch it immediately. The advanced miss is the
half-close: not implementing `final()`, so ending side A never tells side B the
data has stopped, and any consumer waiting for B's `end` event waits forever.

**Model answer:** two hand-built Duplexes whose `write()` pushes into the other
side and whose `final()` pushes null into the other side — `shutdown(SHUT_WR)`
in stream form, with the reverse direction untouched.

## Further reading

- [Node.js: implementing a Readable](https://nodejs.org/api/stream.html#implementing-a-readable-stream) — `read()`, `push()`, object mode and `highWaterMark`, for ex1 and ex6.
- [Node.js: implementing a Writable](https://nodejs.org/api/stream.html#implementing-a-writable-stream) — `write(chunk, encoding, callback)` and failing a write, for ex3.
- [Node.js: streams and async iterators](https://nodejs.org/api/stream.html#streams-compatibility-with-async-generators-and-async-iterators) — why `for await` and `Readable.from()` carry ex2, ex4 and ex5.
- [Node.js: duplex and transform streams](https://nodejs.org/api/stream.html#duplex-and-transform-streams) — the two-halves model behind ex8.
- [MDN: `for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) — the loop's `return()` semantics that make breaking out of a stream destroy it.
