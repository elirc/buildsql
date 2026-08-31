# Reading - node/d24_mixed_gauntlet

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **composition** — and the thing that makes it a skill
rather than an exam is that the individual pieces are all familiar. Every
problem here is two or three drills you have already done, wired together, and
the difficulty is never in the pieces; it is in the seam. A retry loop and a
concurrency limit are each five lines, and where you put one relative to the
other decides whether a burst of failures is absorbed or amplified. A schema and
a Transform are each obvious, and the choice of pushing the parsed value rather
than the raw chunk is the whole reason for the schema. A stream and an HTTP
response are each routine, and the order in which you set the content type
against the first write decides whether the endpoint works at all. Read every
problem for its seam.

## ex1 — filesystem, paths, and a value nobody can quietly edit

**What it tested:** three habits at once — ENOENT as the one error that means
"nothing has happened", a recursive merge that knows what is mergeable, and a
freeze that goes all the way down.

**The classic mistake:** `{ ...base, ...overlay }`. It reads as a merge and is a
replacement: the overlay's `server` object overwrites the base's wholesale, so
the port that only the base mentioned disappears and the service starts on 0.
Second: a shallow `Object.freeze`, which protects exactly the keys nobody was
going to overwrite anyway.

**Model answer:** a recursive merge guarded by a plain-object test that excludes
arrays and `null`, a recursive freeze applied bottom-up, and two distinct
failures — missing base and unparseable file — that each name their file.

## ex2 — where the retry goes

**What it tested:** the interaction between two limits, not either one of them.
Retrying and limiting are both easy; only their arrangement is interesting.

**The classic mistake:** implementing the retry by pushing the item back onto
the queue. Every runner is then free to pick up a fresh item while the failed
one waits, so under a burst of failures the number of calls in flight is `limit`
plus everything retrying — a retry storm aimed at a service that is already
struggling. The other one: sleeping after the final failure, which delays the
rejection by a backoff nobody is waiting for.

**Model answer:** the retry loop lives inside the runner, before it takes its
next index, so a retrying item costs exactly the one slot it already had; a
shared `failed` flag stops the other runners from taking new work; and `sleep`
is a parameter, so the test suite never waits.

## ex3 — reading a file from the wrong end

**What it tested:** `FileHandle.read` with an explicit position — the API you
reach for when a stream is the wrong shape — plus the buffer discipline from
lesson 06.

**The classic mistake:** decoding each block as it is read. Blocks are cut at
byte offsets and characters are not one byte, so a boundary lands inside a
multi-byte sequence and both halves decode to replacement characters. It is
invisible in ASCII test data and appears the first time somebody logs a name.
Nearly as common: stopping after `n` newlines rather than `n + 1`, which returns
a truncated first line.

**Model answer:** walk backwards prepending Buffers, count `0x0a` bytes as you
go, stop when there is one more newline than lines wanted, and decode the
concatenation exactly once.

## ex4 — a stream error with an address on it

**What it tested:** that `pipeline` gives you teardown and nothing else. Progress
and attribution are yours to add, and both are small once you see them as
streams and listeners rather than as bookkeeping.

**The classic mistake:** counting at the source. "Read 10,000 rows" is a
comforting number and a useless one — on a run that fails at the sink it is an
overstatement of exactly the amount that was lost. The second: catching the
pipeline's rejection and rethrowing `new Error(error.message)`, which discards
the stack and the `code` and leaves the on-call engineer with a sentence.

**Model answer:** a counting Transform immediately before the sink, an `error`
listener per stage recording the first name to fire, and a wrapper error built
with `{ cause }` so nothing is lost.

## ex5 — validation as a stage, not a gate

**What it tested:** that a schema in a stream has two legitimate policies —
report and continue, or stop — and that the choice belongs to the caller.

**The classic mistake:** pushing the original chunk instead of `result.data`,
which throws away the stripping, defaults and coercion that were the entire
point of validating. And counting only the records that got through, so the
index in the error report does not match any line in the file the operator is
looking at.

**Model answer:** `safeParse` per chunk; push `result.data`; keep an index that
counts every arrival; `callback(error)` — never `throw` — for fail-fast, and
`callback()` with nothing pushed to drop a record.

## ex6 — the request is a stream, and it is not yours to buffer

**What it tested:** an HTTP route that must not use a body parser, a byte limit
enforced on what actually arrived, and a filesystem write that leaves nothing
behind when it goes wrong.

**The classic mistake:** trusting `content-length`. A chunked upload does not
send one and a hostile client will happily send a small one, so the limit has to
be the running total of the chunks you have counted. Second: destroying the
request the moment you go over, which the client sees as a connection reset
rather than as your 413. Third: answering before the write stream's callback,
which lets a reader following your Location header find a short file.

**Model answer:** count in `data`, stop writing but keep draining once over the
limit, answer from inside `end(callback)`, and remove the partial file before
sending 413.

## ex7 — two mechanisms, one function

**What it tested:** single-flight de-duplication and circuit breaking sharing a
call path, with every decision derived from an injected clock so the whole thing
is testable without waiting.

**The classic mistake:** storing the state as a string and keeping it in step
with a timer. Two sources of truth, one of which fires whether or not anybody is
calling — and a `setTimeout` in a client is a handle somebody has to clean up.
The other is releasing the whole backlog the instant the cooldown expires, which
is the thundering herd that knocks the recovering service straight back down.

**Model answer:** `state()` computed from `openedAt` and `now()`, the in-flight
map cleared on both outcomes, and a `probing` flag so exactly one call decides
for everybody.

## ex8 — everything, in the order express runs it

**What it tested:** the assembly. A guard above the router so it also covers the
404, routes ordered so a literal beats a parameter, a streamed response, and one
error handler that is the only place a failure chooses a status.

**The classic mistake:** registering `/orders/:id` before `/orders/export`, so
`export` becomes an id and the endpoint 404s for the rest of its life — a bug
that survives review because the code looks tidy. Close behind: letting the
upstream error's message reach the client, which in the gate's case ships an
internal address and a database user to whoever asked.

**Model answer:** guard, router, catch-all, error handler, in that order; the
upstream call wrapped in an error type the handler can recognise so 502 and 500
are distinguishable; and the export written as an async generator piped into the
response, so the content type is set before the first byte and the client can
start parsing before the server has finished.

## Further reading

- [Node.js: `stream.pipeline()`](https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-callback) — the teardown guarantee ex4 and ex8 lean on, including the array form.
- [Node.js: `FileHandle.read()`](https://nodejs.org/api/fs.html#filehandlereadbuffer-offset-length-position) — positional reads, which is how ex3 gets to the end of a file without passing through the front of it.
- [MDN: `Error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) — wrapping without losing, used by ex4 and ex8.
- [Express: error handling](https://expressjs.com/en/guide/error-handling.html) — the four-argument handler, and express 5 forwarding rejected promises without a wrapper.
- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html) — the pattern ex7 implements, including why half-open lets exactly one request through.
