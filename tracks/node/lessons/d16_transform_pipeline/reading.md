# Reading - node/d16_transform_pipeline

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **the transform callback**, and what it actually
means. It is not "here is my output" — `push()` is that, and you may call it
zero times or twenty. The callback means "I have finished with this chunk, send
me another", which makes it the only lever a stage has over how much work is in
flight and how much data is buffered ahead of it. Every problem in this set is
that one idea from a different angle: not calling it stalls the stream (ex2),
calling it too early interleaves output (ex4) or lets an unbounded fan-out
happen (ex5, ex7), and calling it with an error is the only way a failure inside
your code becomes a failure the caller can catch (ex1). The other half of the
set is teardown. A pipeline that fails has to leave nothing open, and the two
fan-out problems exist because that is where people forget.

## ex1 — a throw is not a stream error

**What it tested:** that you know who calls `transform()`. Not you — the stream
machinery does, from inside its own tick.

**The classic mistake:** letting `fn` throw. The exception unwinds into Node's
internals and comes out as an uncaught exception on a later tick, where no
`try`/`catch` around `pipeline()` and no `.catch()` on its promise can see it.
The process dies, and the stack trace points at a stream file nobody wrote.

**Model answer:** wrap the call, `callback(error)` on the way out — and note the
two-argument form, `callback(null, value)`, which pushes and continues in one
line.

## ex2 — dropping is not pushing

**What it tested:** that emission and completion are separate signals, which is
the fact that makes a filter possible at all.

**The classic mistake:** forgetting the callback on the dropped path. The stream
stalls at the first dropped item and never recovers — and a stall is the worst
failure mode there is, because it looks exactly like a slow upstream. Nothing
throws, nothing logs, the process just sits there.

**Model answer:** `push` conditionally, `callback()` unconditionally, and keep
the counters in the closure so a caller cannot reach in and reset them.

## ex3 — the remainder is the exercise

**What it tested:** `_flush`, the last word a stage gets before the stream ends,
and the one place a buffered remainder can escape.

**The classic mistake:** no flush at all, so the final partial batch is silently
dropped. It passes every test with a round number of items and loses the last
seventeen rows of every real import. The mirror-image mistake is a flush with no
guard, which emits an empty array whenever the count divides exactly, and every
consumer downstream grows a defensive `if` because of it.

**Model answer:** accumulate, push and reassign a **new** array when full — not
`length = 0`, which mutates the array downstream now owns — and push from flush
only if there is something in it.

## ex4 — drain before you accept the next one

**What it tested:** that `push()` is not once per `transform()`, and that
"finished with this chunk" has to mean finished, including everything the chunk
expanded into.

**The classic mistake:** pushing the array instead of its elements, which is a
map wearing an expand's name. After that: calling the callback before an async
iterable has been drained, so the next input starts producing while yours is
still going and the two outputs interleave — an ordering bug that only appears
when the source is fast enough to have a queue.

**Model answer:** `Array.isArray` to pick the loop, `for await` to drain the
async case completely, and the callback strictly after.

## ex5 — the generator stage

**What it tested:** that `pipeline()` takes an async generator function as a
stage, and that `for await` gives you sequencing, ordering and cancellation
without any bookkeeping of your own.

**The classic mistake:** starting everything and collecting afterwards —
mapping the source into an array of promises and then yielding them. It is
subtly wrong three ways: it is an unbounded fan-out, the rejection arrives long
after the source has been fully drained, and by then the "stop consuming"
guarantee is worthless because there was nothing left to consume.

**Model answer:** `for await (const item of source) yield await fn(item);` —
and the sentence that earns the point is *why* the order is free, not that it is.

## ex6 — a stream is consumed by reading it

**What it tested:** that fan-out is not a thing streams do natively. Two
consumers of one readable share the data; they do not each get all of it.

**The classic mistake:** `source.pipe(a); source.pipe(b)` — which actually does
work for the simple case, because `pipe` broadcasts, and then fails the moment
one sink is slower than the other, since `pipe` pauses the source for the
slowest and no longer tells you which sink that was. Worse is the teardown: a
failing sink leaves the source and the other sink open for ever.

**Model answer:** a `PassThrough` per sink, one `pipeline()` per branch, and a
`Promise.all` whose catch destroys everything — with a placeholder `.catch()` on
each promise first, because teardown makes all of them reject.

## ex7 — the slot is freed by the head, not by the winner

**What it tested:** the only genuinely hard idea in the set. Concurrency and
ordering are both about *which promise you wait on*, and it is the same lever
for both.

**The classic mistake:** freeing the slot when any worker finishes — `Promise.
race` over the in-flight set. That gives you the limit and destroys the order,
and the resulting bug is invisible until a slow item happens to be followed by a
fast one, which is to say: in production, once. Emitting on completion instead
of on retirement is the same mistake spelled differently.

**Model answer:** a FIFO of started promises; when the queue reaches `limit`,
await `queue[0]`, push its value, shift it off, and only then call the callback —
so the callback count is the in-flight count and the queue order is the output
order.

## ex8 — lazily, once, and closed afterwards

**What it tested:** three separate lifecycle rules at once — open per key rather
than per item, end every sink and wait for `finish` before resolving, and
destroy rather than end when anything fails.

**The classic mistake:** resolving when the source runs out. `end()` says "no
more data", not "the data is on the disk", so the caller reads the file, finds
it short, and files a bug about lost records. Second: opening a sink per item,
which is fine in a test with three rows and produces four million files in
production. Third: ending sinks on the failure path, which turns a crashed
export into a set of files that all look complete.

**Model answer:** a `Map` for the routing table, one `finished()` promise per
sink collected as it opens, `allSettled` at the end so the first real error wins
over the teardown noise — and `destroy()`, not `end()`, when anything goes wrong.

## Further reading

- [Node.js: Implementing a Transform stream](https://nodejs.org/api/stream.html#implementing-a-transform-stream) — `_transform`, `_flush`, and the exact meaning of the callback's two arguments.
- [Node.js: `stream.pipeline()`](https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-callback) — what counts as a stage, including the async generator form ex5 uses, and what it destroys on failure.
- [Node.js: `stream.finished()`](https://nodejs.org/api/stream.html#streamfinishedstream-options) — the difference between a stream being ended and a stream being finished, which is the whole of ex8.
- [Node.js: Streams in object mode](https://nodejs.org/api/stream.html#object-mode) — why every stage in this set sets `objectMode: true` and what changes when you do.
- [MDN: `for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) — the loop ex5 and ex8 are built on, and what it does to the iterator when the body throws.
