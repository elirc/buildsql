# Reading - node/d17_backpressure

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **making the fast end wait**. Node gives you exactly
three levers and no more: the boolean `write()` returns, the moment you call a
`_read` or a transform callback, and `pause()`/`resume()`. Everything in this
set is one of those three, and every wrong answer is the same wrong answer —
accepting work you are not ready for, so that the queue moves from somewhere
visible into your own process. That is why none of these problems is graded by
how long anything took. `writableLength` and "how many were started" are the
measurements that matter, because the symptom of getting this wrong is never
slowness; it is a heap that grows until the process dies, on the one day the
consumer is slower than usual. The other thread running through the set is that
waiting has to be cancellable and observable: a wait with no error listener is a
hang, and a hang is worse than a crash.

## ex1 — true does not mean written

**What it tested:** the meaning of the return value, which almost everybody gets
half right. `true` means *there is room for more*, not *this chunk has been
written* — the gate's sink is still holding the chunk when the promise resolves.

**The classic mistake:** ignoring the boolean entirely, which is the bug the
whole lesson exists for. After that, the subtler one: listening for `drain` and
nothing else. A stream that errors or is destroyed never emits `drain`, so the
promise is never settled, and an upload hangs for ever with nothing in the logs
— which is strictly worse than the crash it replaced.

**Model answer:** resolve on the fast path with no listeners at all, and on the
slow path attach `drain`, `error` and `close` with one shared cleanup, because
`once()` only removes the listener that actually fired.

## ex2 — _read means "I have room"

**What it tested:** which direction `_read()` points. It is not "produce your
data"; it is the stream asking, and Node stops asking when its buffer is full.

**The classic mistake:** looping inside `_read` and pushing everything. The
right items come out in the right order and the test passes — and the entire
input is now in the stream's buffer, so you have written a very elaborate array.
The gate measures it directly: produced minus consumed has to stay inside the
highWaterMark.

**Model answer:** push one item per call and return. Doing so means you never
have to look at what `push()` returns, which is the same conversation running in
the other direction.

## ex3 — losing data is a design, not a failure

**What it tested:** that backpressure is a choice with an alternative, and that
the alternative is legitimate. Metrics, traces and access logs should never
stall a request path; the right answer there is to drop.

**The classic mistake:** a "lossy" sink that still buffers — capping the array
but letting the stream's own queue grow, so the memory you were worried about
just moved one layer down. Second: dropping the newest instead of the oldest
without deciding to. Both ends are defensible, and the recent end is usually
worth more, but it has to be a decision somebody made.

**Model answer:** call the write callback synchronously, so `write()` never
returns false, and keep a bounded array with an honest `dropped()` counter — a
drop nobody can count is a drop nobody knows about.

## ex4 — the callback is the throttle

**What it tested:** that the transform callback is a backpressure signal and not
a formality. The number of chunks in flight is exactly the number of callbacks
you have called without finishing the work.

**The classic mistake:** `fn(chunk).then((v) => this.push(v)); callback();`. It
produces correct output in correct order, which is why it survives review. It
also announces that you are ready for the next chunk before you have started
this one, so the whole source pours through: every item in flight at once
against whatever `fn` talks to, and the entire input in memory behind it.

**Model answer:** call the callback inside the `then`, pass a rejection to it as
an error, and let `highWaterMark` decide how many may queue in front of you.

## ex5 — one threshold flaps, two do not

**What it tested:** `pause()` and `resume()`, and the fact that there is no
event for "the buffer got a bit smaller".

**The classic mistake:** resuming on `drain`. `drain` fires only when the buffer
is completely empty, which is not what `resumeBelow` asked for, and on a busy
sink it may not fire for a long time. The other one is pausing and resuming at
the same number, which flaps once per chunk — and a pause is not free.

**Model answer:** the per-chunk write callback, `sink.write(chunk, cb)`, is the
hook that fires exactly when the length has just gone down; check the resume
threshold there and the pause threshold after each write.

## ex6 — cancelling a wait, not just a loop

**What it tested:** that "abortable" has two halves. Stop starting new work, and
stop waiting for work already started — and an implementation can do the first
and still hang for ever.

**The classic mistake:** checking `signal.aborted` only between chunks. The
moment the sink stalls you are parked on a `drain` that is never coming, and the
signal is checked again only after it arrives. Nearly as common: creating the
abort listener inside the loop, so a thousand-chunk write attaches a thousand
listeners and Node starts warning at eleven.

**Model answer:** one abort promise created before the loop, raced against every
drain wait, with a placeholder `.catch()` so an abort on the happy path is not
an unhandled rejection — and `removeEventListener` in a `finally`.

## ex7 — the wait is free capacity

**What it tested:** that a sink being busy is not dead time. Items arriving
during it can be collected and sent as one write, which is how log shippers and
bulk inserts get their throughput.

**The classic mistake:** no cap. A long stall collects everything, and the
"batch" that eventually goes out is the whole backlog in one object — you have
moved the unbounded buffer from the sink into your own array and called it a
feature. Second: resolving `end()` when the last write callback fires rather
than when the sink emits `finish`, so the final batch is still in flight when
the caller thinks it is done.

**Model answer:** one `flush()` reading `busy`, `pending` and `ended`, called
from both `write()` and the write callback, with `splice(0, maxBatch)` doing the
capping and `sink.end(cb)` settling the promise.

## ex8 — measure the consumers, do not schedule them

**What it tested:** that `writableLength` is readable at any moment, and that
this makes adaptive routing about three lines long.

**The classic mistake:** round-robin. It hands the stalled consumer exactly as
much as the healthy one, so one slow sink slows everything to its own pace and
the backlog is invisible until it is a memory graph. The second mistake is
writing to a saturated set anyway rather than awaiting — which is the one the
gate catches by holding both sinks and checking the source was barely read.

**Model answer:** pick the smallest `writableLength`; when every sink is at its
own `writableHighWaterMark`, await the first `drain` from any of them with a
cleanup that removes all the listeners — and let the `for await` loop's
suspension carry the backpressure back up to the source.

## Further reading

- [Node.js: `writable.write()`](https://nodejs.org/api/stream.html#writablewritechunk-encoding-callback) — the return value, the per-chunk callback ex5 and ex7 are built on, and when `drain` is emitted.
- [Node.js: Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) — the guide that walks through what happens when you ignore all of this.
- [Node.js: `readable._read()`](https://nodejs.org/api/stream.html#readable_readsize) — who calls it, when it stops being called, and what `push()` returning false means.
- [Node.js: `stream.Writable` class](https://nodejs.org/api/stream.html#class-streamwritable) — `writableLength`, `writableHighWaterMark` and `writableEnded`, the three properties this whole set is graded on.
- [MDN: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) — `aborted`, `reason`, and `AbortSignal.abort()` for the already-cancelled case in ex6.
