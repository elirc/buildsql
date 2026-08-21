# Reading - node/07_streams_2

Transforms are where streams stop being plumbing and become a programming
model. `pipeline()` is where they stop leaking.

## Notes

**A Transform is a Duplex with a rule.** Its writable side accepts chunks, its
readable side emits chunks, and the contract is that the second is produced
from the first. Node implements `_read` for you: it calls your `_transform`
when the consumer wants more, which is why backpressure works through a chain
of transforms without you doing anything. Each stage has its own buffer and
its own `highWaterMark`, so a slow sink eventually stops the source — the
signal travels back up the chain one buffer at a time.

**One in does not mean one out.** `callback()` with no value emits nothing;
`this.push()` called three times emits three chunks. That is what lets one
transform be a splitter (one chunk in, many lines out), a batcher (many in,
one array out), or a filter (some in, fewer out). The mental model is not
"map"; it is "a function with a queue on each side".

**`flush` is the end-of-input hook.** Anything you were buffering has to come
out there, or it is silently lost — the classic bug in a hand-written parser
is a file whose last line has no trailing newline and simply vanishes. There
is also `_final` on writables (called before `"finish"`) and `_destroy` for
cleanup; `flush` is the transform-specific one.

**`.pipe()` is a footgun and the docs say so.** It does not forward errors,
and it does not destroy the other streams when one fails. The failure mode:
`source.pipe(gzip).pipe(fileStream)` where the source errors leaves `gzip` and
`fileStream` open, the file half-written, and — if the source was an HTTP
response — a socket held until it times out. `pipeline()` handles error
propagation and destruction for every stage, and the promise form makes it
`await`-able. There is also `stream.finished()` for observing a single stream's
completion.

**Async generators as stages.** Since Node 10, `pipeline` accepts async
generator functions in the middle and async functions at the end. This is the
biggest ergonomic improvement in the streams API: a `for await ... yield` loop
is readable in a way a `_transform` state machine is not, it uses ordinary
`try`/`catch` and `return`, and it participates in backpressure naturally
because the generator only runs when someone pulls. Reach for a `Transform`
class when you need `flush`, object-mode asymmetry, or to hand the stage to
something that expects a stream object; reach for a generator otherwise.

**Object mode is a different currency.** `objectMode: true` makes the
`highWaterMark` count items rather than bytes (default 16), and lets any value
travel through. A parser is asymmetric — `writableObjectMode` false,
`readableObjectMode` true — and getting that pair backwards produces the
confusing error "The 'chunk' argument must be of type string or an instance of
Buffer", which is Node telling you a byte-mode stream just received an object.

## ex1 — transform plus flush

The exercise is deliberately small so that the two callback shapes and the
flush hook are the only things to think about. The counter is closure state,
which is the normal way to give a stream memory: the `Transform` object could
hold it as a property, but a `let` in the factory function is simpler and
cannot be poked at from outside.

The caveat named in the hints is worth repeating: uppercasing chunk by chunk
is only safe for ASCII. `toUpperCase()` on half a multi-byte character
produces a replacement character exactly like the ex3 case, so a real
text-processing transform decodes with `StringDecoder` first. The reason the
gate does not test that here is that ex3 tests it properly; the reason the
hints mention it is that "this works on my ASCII test data" is how the bug
ships.

The interview-adjacent question: "what is the difference between
`callback(null, value)` and `this.push(value)`?" They are the same push;
`callback` also signals readiness. You use `push` when one input produces
several outputs, and `callback(null, value)` when it produces exactly one.

## ex2 — why pipeline exists

`.pipe()` was designed in 2010 and returns its destination so you can chain,
which is elegant and hides the fact that errors are per-stream events with no
routing. Every "pipe with error handling" utility in the ecosystem
(`pump`, and then `pipeline` in core) exists because the naive version leaks.

What `pipeline` does for you, precisely: it attaches error handlers to every
stage, calls `destroy()` on all of them when any one errors or the consumer
goes away, waits for the sink to emit `"finish"` (not merely for the source to
end), and gives you one place — a rejection — to handle all of it. That last
distinction matters: a source that has finished reading does not mean a sink
that has finished writing, and code that resolves on `"end"` rather than
`"finish"` reports success before the bytes are on disk.

The array form (`pipeline([a, ...middles, b])`) is the one to remember when the
number of stages is dynamic, which is exactly the exercise's signature.

## ex3 — the most reusable thirty lines here

Framing — turning a byte stream into records — is the fundamental job in
network and file processing, and the line splitter is its simplest instance.
The structure generalises exactly: keep a `pending` buffer, look for
delimiters, emit complete records, keep the remainder, and flush whatever is
left at the end. Swap the delimiter for a length prefix and you have the frame
parser from lesson 06 review1. Swap it for `\r\n\r\n` and you are parsing HTTP
headers.

Three details the exercise forces you to meet:

**`StringDecoder`.** Decoding per chunk is wrong; buffering all the bytes and
decoding at the end defeats streaming. The decoder is the third option: it
emits everything decodable and retains a partial character across calls. Call
`decoder.end()` in `flush` to get any final bytes.

**Carriage returns.** Files written on Windows end lines with `\r\n`. A
splitter that only splits on `\n` leaves a `\r` at the end of every line,
which then shows up as an invisible character in your parsed data and a very
confusing string comparison failure. `line.endsWith("\r")` is the whole fix.

**The last line.** `"a\nb"` has two lines; `"a\nb\n"` also has two.
`split("\n")` gives you three pieces for the second one, the last being empty
— which is why `lines.pop()` (keep the remainder) plus "emit it in flush only
if non-empty" gets both cases right without a special case.

## ex4 — the modern form

Async generators are the answer to "why is stream code so verbose". The whole
of ex1's transform, minus the flush, is three lines as a generator, and the
error handling is ordinary `try`/`catch` rather than a callback convention.

Two limitations worth knowing so you can choose deliberately. A generator
stage has no `flush` hook — though code after the `for await` loop runs at the
end, which is the same thing. And a generator is not a stream object: you
cannot attach listeners to it, pass it where a `Readable` is expected, or
`unpipe` it. `Readable.from(generator)` converts when you need an actual
stream, and `stream.compose()` (newer) builds a single stream out of several
stages.

The reason `String(item)` appears in the reference is worth a sentence: inside
a byte-mode pipeline the values arriving are `Buffer`s, and `String(buffer)`
calls `buffer.toString()`. In an object-mode pipeline they are whatever was
pushed. A stage that must work in both is a stage that converts explicitly.

## challenge — the shape of every ETL job

Read, split, parse, filter, format, write. Every batch job you will ever be
asked to write is that list with different verbs, and the reason to build it
as a pipeline rather than a loop is that the memory cost is the buffers, not
the data.

The counters are the interesting design question. They live in the closure
around the transform, mutated as rows go past, and read after `await pipeline`
resolves. That is safe here for the reason single-threaded JavaScript is
always safe: nothing else can interleave. It is also the reason returning
statistics from a stream pipeline feels awkward — the pipeline's value is
"done", not a result — and why bigger systems emit a summary event or write a
report row instead.

Two production notes the exercise skips. Real CSV is not `split(",")`: quoted
fields can contain commas and newlines, so use a parser
(`csv-parse` streams natively) unless you control the format. And a real job
needs to decide what a malformed row means — skip and count, or fail the whole
run — which is a business decision, not a technical one, and should be in the
function's signature rather than buried in a `catch`.

## review1 — failing a stream on purpose

The rule this exercise drills: **never throw out of `_transform`**. The stream
machinery calls your function from inside its own internals; an exception
there does not reach the caller's `try`, does not become an `"error"` event
reliably, and in older Node versions could take the process down. The
supported failure channel is `callback(error)`, which destroys the stream,
emits `"error"`, and — under `pipeline` — tears the chain down and rejects the
promise you awaited.

The `return` after `callback(error)` is not decoration. Calling the callback
twice for one chunk raises `ERR_MULTIPLE_CALLBACK`, and falling through from a
`catch` into the success path is the easiest way to do it. This is the same
"exactly once" discipline as the error-first callback convention in lesson 04
— the same rule, a different API.

The last assertion in the gate is worth noticing: records that were emitted
before the failure still arrive. A stream pipeline is not a transaction. If
your job needs all-or-nothing semantics, the atomicity has to come from
somewhere else — write to a temp file and rename, or wrap the sink in a
database transaction — which is the same lesson as `buildIndex` in 05.

## Further reading

- [`stream.pipeline()`](https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-callback) — including the async generator forms and the array form.
- [Implementing a Transform stream](https://nodejs.org/api/stream.html#implementing-a-transform-stream) — `_transform`, `_flush`, and the object-mode options.
- [`string_decoder`](https://nodejs.org/api/string_decoder.html) — the API ex3 turns on, with the partial-character example.
- [MDN: async generators (`for await...of`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) — the language feature behind ex4.
- [Stream: Choosing an API style](https://nodejs.org/api/stream.html#choose-one-api-style) — the official "pick one consumption style" warning.
