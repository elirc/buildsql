# Reading - node/06_buffers_streams

Buffers are Node's answer to "JavaScript has no bytes". Streams are its answer
to "the data is bigger than your memory, and it arrives over time".

## Notes

**Why `Buffer` exists.** When Node was written, JavaScript had no typed
arrays, and a string was the only container for data — which is useless for
binary, because a string is a sequence of UTF-16 code units and any byte
sequence you round-trip through one comes back changed. `Buffer` was invented
to be a byte array, and when `Uint8Array` arrived in ES6 `Buffer` was
re-based on it. Today `Buffer extends Uint8Array`, so anything that accepts a
typed array accepts a Buffer; the extra methods are the read/write helpers
(`readUInt16BE`, `writeInt32LE`, …), the encodings (`toString("hex")`), and
`Buffer.concat`.

**Bytes versus characters, one more time.** `"café".length === 4` counts
UTF-16 code units; `Buffer.byteLength("café") === 5` counts UTF-8 bytes. For
anything with a length prefix, a size limit, or a byte offset, the second
number is the one that matters. This is also why a "1 MB request body limit"
enforced on `text.length` is not a 1 MB limit at all — an attacker sends
multi-byte characters and gets three times the budget.

**`allocUnsafe` is not a micro-optimisation to sprinkle around.**
`Buffer.alloc(n)` zero-fills; `allocUnsafe(n)` hands you recycled memory from
an internal pool. It is measurably faster and it has leaked private data in
real CVEs when the code that used it did not overwrite every byte. Use
`alloc`, and reach for `allocUnsafe` only when you are about to fill the whole
thing immediately.

**Streams are a state machine with an event API.** A `Readable` is in flowing
or paused mode; `.pipe()`, `for await` and a `"data"` listener each put it in
flowing mode, and mixing two of those mechanisms on one stream is how chunks
get lost. Pick one consumption style per stream. `for await` is the one to
default to: it handles pause/resume, propagates errors as rejections, and
destroys the stream if you `break`.

**Backpressure is the whole design.** Every writable keeps an internal buffer
and a `highWaterMark` (64 KB for byte streams, 16 *objects* in object mode).
`write()` returns `false` once the buffer is over that mark; `"drain"` fires
when it has emptied. `.pipe()` and `pipeline()` implement this loop for you.
Doing it by hand is only necessary when you are the one generating chunks — a
loop over database rows, say — and that is exactly when people forget, which
is why "the export job used 8 GB" is such a common incident.

**Object mode.** A stream with `objectMode: true` carries arbitrary
JavaScript values instead of bytes, and its `highWaterMark` counts items, not
bytes. This is what makes streams usable as a data pipeline (rows, parsed
records, log entries) rather than only as a byte pipe — you will use it
throughout lesson 07.

**Web streams exist too.** Node supports `ReadableStream`/`WritableStream`
from the WHATWG spec (the ones `fetch` uses), and `Readable.fromWeb` /
`Readable.toWeb` convert between the two worlds. Node streams remain the
native currency of `fs`, `http` and `zlib`; know that the other family exists
and that they are convertible.

## ex1 — a header is a contract about bytes

Binary framing is how nearly every wire protocol works — HTTP/2, WebSocket,
Postgres, Redis — and they all share this shape: a fixed-size header that
tells you how much variable-size body follows. Writing the encoder and decoder
by hand once makes every protocol document readable afterwards.

Big-endian is called network byte order because that is what the internet
standardised on; `readUInt16BE`/`writeUInt16BE` are the ones you will use for
anything on a wire, and the `LE` variants for file formats that came from x86
(and for anything where a spec says so). Getting it backwards is a classic
bug: 5 written little-endian and read big-endian is 1280, and your parser will
try to read 1280 bytes of payload that are not there.

The "trailing junk" assertion is not a trick. A TCP socket gives you whatever
has arrived — half a frame, one frame, three frames and a bit — so a parser
that assumes "the buffer is exactly one message" works in tests and fails on
the network. The correct shape is exactly what review1 makes you write: a
cursor, a header read, a length-bounded slice, repeat. And in production you
also need the other half, which is buffering the *incomplete* tail until more
bytes arrive.

## ex2 — the split-character bug

This is the single most common streaming bug in Node, and it is invisible
until your input contains a non-ASCII character in an unlucky position. The
chunk boundary is decided by the kernel, the network MTU and the filesystem —
not by your data — so this failure is inherently intermittent, which is the
worst kind.

Two correct answers. Collect Buffers and `Buffer.concat` before decoding —
right when you need the whole thing anyway (a JSON body, a small file). Or use
`node:string_decoder`'s `StringDecoder`, which keeps incomplete multi-byte
sequences in an internal buffer and emits them once the continuation bytes
arrive — right when you want to process text as it streams. Lesson 07's line
splitter is where the second one earns its keep.

A production note on `collect`: it is exactly what a body parser does, and it
is also exactly how you accidentally hold an unbounded amount of data in
memory. Every real implementation adds a limit — count the bytes as you go and
reject with a 413 past the threshold — which is the shape you will build for
real in lesson 08.

## ex3 — being a source

Implementing `_read` teaches the contract from the other side: the stream
machinery calls it when the consumer wants data, you `push` chunks, and
`push(null)` ends it. The return value of `push` matters in bigger sources —
`false` means "the read buffer is full, stop pushing until `_read` is called
again" — which is the reading half of backpressure.

Two things worth knowing beyond the exercise. `Readable.from(iterable)` builds
a stream out of any iterable or async generator, and for most real cases it is
the better tool: an async generator is far easier to read than a `_read` state
machine, and it gets backpressure right by construction because the generator
is only pulled when the consumer wants more. And `stream.Readable` is an
`EventEmitter`, so a source that fails should `destroy(error)` rather than
throw — that emits `"error"` on the stream, which is where consumers are
listening.

## ex4 — being a sink

The `callback` in `_write` is the entire flow-control protocol, and forgetting
it produces the most confusing failure in the streams API: everything works
for exactly one chunk and then stops, silently, forever. No error, no
timeout — the stream is simply waiting for you.

Calling it with an error (`callback(err)`) is how a sink reports failure; the
stream emits `"error"` and, if you used `pipeline`, the whole chain is torn
down. There is also `_final(callback)` for flush-on-end work (close a file
handle, write a footer) and `_destroy` for cleanup — worth knowing they exist
when you write a sink that owns a resource.

`text()` being a function rather than a property is a small design lesson:
snapshot accessors that are evaluated eagerly are wrong for anything that
accumulates. The same reasoning applies to `res.locals`, to metrics counters,
and to any getter over mutable state.

## challenge — the loop `.pipe()` writes for you

The six lines you wrote are the core of `.pipe()`. Writing them explains three
things that otherwise look arbitrary.

Why `.pipe()` is better than a `"data"` listener that writes: the listener
version ignores the return value of `write`, so a slow sink buffers without
limit. Why `pipeline()` is better than `.pipe()`: `.pipe()` does *not*
propagate errors or destroy the other streams when one fails, leaving leaked
file handles and sockets — `pipeline()` cleans up, and lesson 07 makes you use
it. And why `highWaterMark` is tunable: it is the memory-versus-syscalls
trade-off, so a stream of tiny chunks over a fast link wants a bigger mark and
a memory-constrained process wants a smaller one.

The interview question this maps to is "what is backpressure and how does Node
implement it?" A strong answer names the boolean, the `"drain"` event, the
`highWaterMark`, and the observation that `pipe`/`pipeline` implement the loop
so most code never sees it — plus the case where you *do*: when you are
generating the chunks yourself.

## review1 — the parser loop, again

Reading several frames from one buffer is the shape of every length-prefixed
protocol parser, and the reason to write it twice is that the cursor
arithmetic is where the bugs live. Naming `start = offset + 3` instead of
scattering `offset + 3` through the slice call is the small discipline that
makes it right the first time.

The empty-payload case is deliberate. A frame with a zero-length body is
legitimate — a heartbeat, an acknowledgement, an end-of-stream marker — and a
loop that stops when the length is zero silently drops it. Interviewers who
ask you to write a parser tend to feed it exactly that.

The next question, which the exercise does not ask but the network will: what
do you do when the buffer ends *mid-frame*? A real parser keeps the leftover
bytes and prepends them to the next chunk, which is why a stream parser is
usually a `Transform` with an internal buffer — precisely the structure of the
line splitter in lesson 07.

## Further reading

- [`Buffer` — Node.js API docs](https://nodejs.org/api/buffer.html) — the whole surface, including the alloc/allocUnsafe discussion and every encoding.
- [Stream — Node.js API docs](https://nodejs.org/api/stream.html) — long, and the sections on implementing `_read`/`_write` are the ones to read now.
- [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) — the official essay behind the challenge exercise.
- [`string_decoder`](https://nodejs.org/api/string_decoder.html) — the correct way to decode text as it streams, and the other answer to ex2.
- [MDN: `Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) — what a Buffer actually is underneath.
