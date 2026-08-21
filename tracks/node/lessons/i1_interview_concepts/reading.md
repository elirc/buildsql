# Reading - node/i1_interview_concepts

The question bank. Fifty-five questions, grouped by topic, tagged by how often
they come up, each with the answer a strong candidate gives out loud.

## Notes

**How to use this.** Cover the answers. Take one topic at a time, read the
question, and say your answer to the empty room before you look. Judge
yourself on whether you *produced* the answer, not whether you recognised it —
recognition is worth nothing at 10am in front of a stranger. Where you
fumbled, the lesson to redo is named in the answer, and `dojo review` will
bring the ⭐⭐⭐ material back at 3, 7, 21 and 60 days.

**How the answers are written.** Three to six sentences, one concrete example,
and the follow-up the interviewer asks next. That length is deliberate: long
enough to show you understand the mechanism, short enough that they can steer.
The strongest answers name a trade-off rather than reciting a fact — compare
"`nextTick` runs before promises" with "`nextTick` runs before promises, which
makes it useful for library authors and a starvation risk in application
code". Borrow the second voice.

**Rating key:** ⭐⭐⭐ expect it · ⭐⭐ common · ⭐ occasional.

## The event loop and scheduling

**1. What is the event loop? ⭐⭐⭐**
Node runs your JavaScript on one thread. The event loop is libuv's cycle:
check for expired timers, poll the operating system for completed I/O, run the
callbacks, and go round again. Your code never waits for a disk or a socket —
it registers a callback and returns to the loop, which is why one process can
hold tens of thousands of connections. The corollary is that anything slow and
synchronous stops *everything*. → lesson 02.
*Follow-up: "so what happens if a callback takes 500 ms?" Every other pending
callback waits 500 ms, including your health check.*

**2. Name the phases. ⭐⭐**
Timers (expired `setTimeout`/`setInterval`), pending callbacks, poll (where
the loop waits for I/O), check (`setImmediate`), close callbacks. Between
every callback — not between phases — Node drains the `process.nextTick` queue
and then the promise microtask queue. Knowing that the checkpoint sits between
individual callbacks is worth more than reciting the phase names. → lesson 02.
*Follow-up: "where does an `await` continuation run?" In the microtask queue,
so before the loop moves on at all.*

**3. `process.nextTick` vs `queueMicrotask`/promises? ⭐⭐⭐**
Both run before the loop continues, but `nextTick` is Node's own queue and is
drained *first*, to empty, before V8's microtask queue. That makes `nextTick`
the sharper tool: a `nextTick` that schedules another `nextTick` starves the
loop forever with no error. Application code should prefer promises or
`setImmediate`; `nextTick` is for library authors who need to run after the
current operation but before anything else. → lesson 02.
*Follow-up: "have you ever seen nextTick starvation?" The honest answer
describes a recursive tick, a CPU at 100% and a server answering nothing.*

**4. `setTimeout(fn, 0)` vs `setImmediate(fn)`? ⭐⭐⭐**
`setTimeout(fn, 0)` is clamped to 1 ms and runs in the timers phase;
`setImmediate` runs in the check phase, right after poll. Inside an I/O
callback the answer is deterministic — you are in poll, check is next, so
`setImmediate` wins. At the top level it depends on how long the process took
to start, and you can observe both orders on the same machine. → lesson 02.
*Follow-up: "which would you use to yield to the loop?" `setImmediate`,
because it runs after pending I/O gets served rather than a millisecond later.*

**5. Predict the output of this snippet. ⭐⭐⭐**
Work through it in passes: synchronous lines first, then the nextTick queue
drained to empty, then microtasks drained to empty, then one timer, then the
checkpoint again, then the next timer. The mistake that separates answers is
forgetting that the checkpoint runs after *each* callback, so a `nextTick`
queued by the first timer runs before the second timer. → lesson 02, ex1 here.
*Follow-up: "and if this ran at the top level of an ES module?" Module
evaluation is itself a promise job, so microtasks can drain before nextTicks.*

**6. Is Node single-threaded? ⭐⭐⭐**
Your JavaScript is. The process is not: libuv keeps a thread pool (four by
default) for file I/O, DNS, `zlib` and some `crypto`, and V8 has its own
helper threads. So "single-threaded" means "one thread runs your code, and you
never need a mutex around your own data" — not "one thread exists". → lesson
02, reading.
*Follow-up: "what shares that pool?" `fs`, `dns.lookup`, `crypto.pbkdf2`,
`zlib` — which is why a burst of hashing can slow down file reads.*

**7. How do you handle CPU-bound work? ⭐⭐**
Get it off the loop. `worker_threads` for in-process parallelism with
`SharedArrayBuffer` or message passing; a child process or a job queue when
the work is big or bursty enough to isolate. Chunking with `setImmediate`
(ex2) keeps the server responsive but does not make the work faster — it
spreads the pain rather than removing it. → lesson 02.
*Follow-up: "when is `worker_threads` not worth it?" When the data you would
have to copy across the boundary costs more than the computation.*

**8. What is `cluster` for, and how does it differ from worker threads? ⭐⭐**
`cluster` forks whole processes that share a listening socket, so you use all
your cores for *I/O-bound* work and get isolation — one crash takes down one
worker. Worker threads share memory within one process and are for CPU work.
In containerised deployments people often skip `cluster` entirely and run one
process per container, letting the orchestrator do the multiplying. → lesson
02, reading.
*Follow-up: "how do cluster workers share state?" They do not — you need
Redis, a database or the primary process as a broker.*

**9. What does "blocking the event loop" look like in production? ⭐⭐**
Latency on *every* endpoint rises together, including ones doing no work; CPU
is pinned to one core; and event-loop lag (from `perf_hooks`'
`monitorEventLoopDelay`, or any APM's lag metric) climbs from under a
millisecond to hundreds. Usual culprits: a big `JSON.parse`, synchronous
`fs`, a regex with catastrophic backtracking, unbounded `crypto`. → lesson 02.
*Follow-up: "how would you find it?" `--cpu-prof`, `clinic doctor`, or a
flame graph — and the lag metric to know you have one at all.*

**10. Why does my Node process not exit? ⭐⭐**
Because the loop still has a referenced handle: an open server, an interval, a
pending timer, an open socket or file. `timer.unref()` tells the loop not to
count that handle, `server.close()` releases the listener, and
`process.getActiveResourcesInfo()` will tell you what is left. A stray
`setTimeout` from a timeout helper you forgot to clear is the classic. →
lesson 03 ex4.
*Follow-up: "and why does it exit too early?" Usually a floating promise
nobody awaited.*

## Async: promises, callbacks, concurrency

**11. What is the difference between concurrency and parallelism here? ⭐⭐⭐**
Concurrency is many operations in flight; parallelism is many operations
executing at the same instant. Node gives you the first without the second:
three HTTP requests can all be waiting at once, but your JavaScript still runs
one statement at a time. That is why `Promise.all` speeds up I/O and does
nothing for a loop over a million rows. → lesson 03.
*Follow-up: "so when does Node actually run things in parallel?" In libuv's
thread pool and in worker threads — never in your handler code.*

**12. `Promise.all` vs `allSettled` vs `race` vs `any`? ⭐⭐⭐**
`all` resolves with every value or rejects on the first failure — the default,
and right when the caller needs all of it. `allSettled` waits for everything
and reports per-item status, for when partial success is a real outcome.
`race` settles on the first settlement, success or failure, which is how you
build a timeout. `any` settles on the first *fulfilment* and only rejects if
all fail, which is failover. → lesson 03 ex2, review1.
*Follow-up: "which would you use for three mirrors?" `any` — `race` would
return the fastest failure.*

**13. Why is `await` in a loop a problem? ⭐⭐⭐**
Because it serialises work that could overlap: three 100 ms calls take 300 ms
instead of 100. Start them all (`items.map(fetchOne)`) and await the array
instead. The exception is when each iteration depends on the previous one, or
when you deliberately want to limit concurrency — in which case you want a
pool, not a loop. → lesson 03 ex3.
*Follow-up: "so is `for await` always wrong?" No — over a stream it is
correct, because the items genuinely arrive one at a time.*

**14. How would you limit concurrency to N? ⭐⭐⭐**
Start N workers over a shared cursor: each takes the next index, awaits the
work, stores the result by index, and loops until the input is exhausted; then
`Promise.all` the workers. Results come back in input order because they are
stored by index, and a slot is refilled the moment it frees rather than at the
end of a batch. That last part is why chunking is the wrong answer. → lesson
03 ex3.
*Follow-up: "why not just chunk into groups of N?" Every chunk takes as long
as its slowest member, so workers idle.*

**15. Write `promisify`. ⭐⭐**
Return a function that returns `new Promise((resolve, reject) => fn(...args,
(error, value) => error ? reject(error) : resolve(value)))`. The subtlety is
that it must forward *all* arguments and only wrap the final callback, and
that a callback called twice is harmlessly ignored by the promise — settling
is one-shot. → lesson 03 ex1.
*Follow-up: "what does `util.promisify` add?" Support for
`util.promisify.custom`, so libraries can supply a better promise version.*

**16. How do you implement a timeout? ⭐⭐⭐**
`Promise.race` between the work and a promise that rejects on a `setTimeout` —
then `clearTimeout` in a `finally`, or the pending timer keeps the process
alive after the work has finished. And be honest that racing does not
*cancel*: the underlying request is still running unless you also pass an
`AbortSignal`. → lesson 03 ex4.
*Follow-up: "how do you actually cancel it?" `AbortController`, which `fetch`,
`fs/promises` and most modern APIs accept.*

**17. What is an unhandled rejection and what happens? ⭐⭐⭐**
A promise that rejects with no handler attached. Since Node 15 the default is
to treat it as an uncaught exception, so the process crashes. You can listen
for `unhandledRejection` to log first, but you should still exit — the
rejection means some code path was abandoned in an unknown state. The usual
cause is a floating promise: a call you forgot to `await`. → lesson 04.
*Follow-up: "how do you catch these in review?" A lint rule for floating
promises, and `void` in front of the deliberate ones.*

**18. Does `try`/`catch` work with async code? ⭐⭐**
Around an `await`, yes: a rejected promise throws at that line. Around a call
you did *not* await, no — the function returns a promise immediately, the
`try` block ends, and the rejection escapes later with nobody watching. Same
for a `throw` inside a `setTimeout` callback: the stack that scheduled it is
long gone. → lesson 03, reading.
*Follow-up: "so how do you catch an error in a timer callback?" Put the
`try`/`catch` inside the callback, or promisify the wait.*

**19. What does `async` actually do to a function? ⭐⭐**
It makes the function return a promise, always — even `async () => 7` returns
`Promise<7>` — and it lets you use `await`, which suspends the function and
resumes it as a microtask. A `throw` inside becomes a rejection of that
promise; returning a promise flattens rather than nesting. Calling an async
function *starts* it; awaiting it *waits* for it, and the gap between those
two acts is where concurrency lives. → lesson 00 ex3, lesson 02 review1.
*Follow-up: "what does `await` on a non-promise do?" It still suspends for one
microtask hop.*

**20. What is an async generator good for? ⭐**
Producing a sequence lazily over time, with backpressure for free: the body
only advances when the consumer pulls the next value. That makes it the
neatest way to write a stream stage — Node's `pipeline` accepts async
generator functions directly — and a clean way to paginate an API without
holding every page in memory. → lesson 07 ex4.
*Follow-up: "how does that compare to a Transform stream?" Same semantics,
much less ceremony, but no `flush` hook and it is not a stream object.*

## Errors and the process lifecycle

**21. Operational vs programmer errors? ⭐⭐⭐**
An operational error is a correct program meeting a wrong world: a refused
connection, a missing file, bad user input. Handle it — retry, return a 400,
log and continue. A programmer error is a bug: reading a property of
`undefined`, a bad argument. Nothing sensible can be done at run time, because
the process is in a state its author never intended, so the honest response is
to log with the stack and let it crash. → lesson 04 ex3, ex3 here.
*Follow-up: "isn't crashing bad for uptime?" Not with a supervisor: a restart
is 200 ms of one instance, versus serving corrupt state to everyone.*

**22. Is `uncaughtException` a recovery mechanism? ⭐⭐⭐**
No. Use it to log, flush metrics, stop accepting connections, and then exit
non-zero. Continuing after one means running with violated invariants —
half-updated objects, a transaction neither committed nor rolled back — and
the next failure will be far stranger than the first. → lesson 04, reading.
*Follow-up: "what restarts it?" systemd, Kubernetes, PM2 — something outside
the process, with backoff.*

**23. What is the error-first callback convention? ⭐⭐**
The last argument is a function called exactly once, with an `Error` (or
`null`) first and the value second. Three rules make a callback API
well-behaved: call it once, pass a real `Error`, and always call it
asynchronously — an API that is sometimes synchronous produces bugs that
appear only on the error path. → lesson 04 ex2.
*Follow-up: "what if it is called twice?" Wrap it in a once-guard (ex3 here);
otherwise your continuation runs twice.*

**24. Why subclass `Error`? ⭐⭐**
So a `catch` can branch on `instanceof` instead of matching message text, and
so you can carry data — a field name, a status code, a `code`. Set `name` in
the constructor or every log line says "Error", and remember that ES5
transpilation used to break `instanceof`, which is why old codebases contain
`Object.setPrototypeOf(this, new.target.prototype)`. → lesson 04 ex3.
*Follow-up: "how do you keep the original error?" `new Error(msg, { cause })`,
standard since ES2022.*

**25. `error.code` vs `error.message`? ⭐⭐**
Codes are API, messages are prose. `ENOENT`, `ECONNREFUSED`,
`ERR_MODULE_NOT_FOUND` are stable and safe to branch on; message text changes
between versions and is written for humans. Branching on a message is how a
Node upgrade silently breaks error handling. → lesson 05 ex4.
*Follow-up: "give me three codes and what they mean." `ENOENT` no such file,
`EACCES` permission denied, `EADDRINUSE` port already bound.*

**26. What does the `"error"` event do on an EventEmitter? ⭐⭐⭐**
It is the one event name with special behaviour: emitting `"error"` with no
listener registered throws, which usually takes the process down. That is
deliberate — a silently ignored error is worse than a crash — and it is why
every stream, socket and server needs an error listener. → lesson 04.
*Follow-up: "how does that interact with `pipeline`?" `pipeline` wires the
error handling and destruction for you, which is why it replaced `.pipe()`.*

**27. How do you shut down gracefully? ⭐⭐**
On `SIGTERM`: stop accepting new connections (`server.close()`), let in-flight
requests finish with a deadline, close the database pool and other resources,
then `process.exit(0)` — with a hard timeout that exits anyway if something
hangs. Without it every deploy drops the requests that were in flight. →
lesson 04, reading.
*Follow-up: "what sends SIGTERM?" Kubernetes before SIGKILL, systemd on stop,
Docker on `docker stop`.*

**28. Where do you put a `try`/`catch` in an express app? ⭐⭐**
Ideally almost nowhere. Routes throw; one error-handling middleware with four
parameters, registered last, turns errors into responses. In express 5 that
includes rejected promises from async handlers, so the `try`/`catch`-per-route
pattern from express 4 is obsolete. Catch locally only when you can genuinely
recover — a fallback value, a retry. → lesson 10 ex3, ex4.
*Follow-up: "what does the handler send for an unknown error?" A 500 with a
generic body; the real message goes to the logs, because it can contain
credentials.*

**29. A callback is called twice. What breaks and how do you defend? ⭐⭐**
Your continuation runs twice: a duplicate write, a doubled charge, a second
response attempt that throws `ERR_HTTP_HEADERS_SENT`. The defence is a
once-guard — a boolean in a closure, set *before* forwarding — which is what
promises do for you for free, since settling is one-shot. → ex3 here.
*Follow-up: "is that a real bug or a hypothetical?" Real: it is a classic in
hand-written callback code with an early `return` missing.*

**30. How do you log errors well? ⭐**
Structured (JSON), one line per event, with a request id that also goes back
to the client, the error's `code` and `stack`, and the `cause` chain. Log
operational failures at warn with their status; log defects at error with the
stack. Never log the whole request body by reflex — that is how personal data
and tokens end up in a log aggregator. → lesson 10, lesson 11.
*Follow-up: "which library?" `pino` for speed, `winston` for flexibility; the
choice matters less than the structure.*

## Streams, buffers and I/O

**31. What is a stream and why use one? ⭐⭐⭐**
A sequence of chunks over time with a protocol for flow control. The reason is
memory that does not depend on input size: streaming a 2 GB file uses a buffer
at a time, while `readFile` needs 2 GB. The second reason is time to first
byte — you can start producing output before the input has finished. → lesson
06.
*Follow-up: "when would you not stream?" Small payloads where the complexity
is not worth it — a 2 KB JSON body.*

**32. What is backpressure? ⭐⭐⭐**
The mechanism by which a slow consumer tells a fast producer to wait.
`writable.write()` returns `false` once its internal buffer passes
`highWaterMark`; you stop writing and resume on `"drain"`. Ignore it and the
data queues in memory without limit — which is how an export job uses 8 GB.
`.pipe()` and `pipeline()` implement the loop for you; you only write it by
hand when you are generating the chunks. → lesson 06 challenge.
*Follow-up: "what is the default highWaterMark?" 64 KB for byte streams, 16
objects in object mode.*

**33. `pipeline()` vs `.pipe()`? ⭐⭐⭐**
`.pipe()` does not forward errors and does not destroy the other streams when
one fails, so a failure leaves file handles and sockets open and a
half-written output. `pipeline` propagates errors, destroys every stage, and
in its promise form gives you one `await` to handle it all. Use `pipeline`. →
lesson 07 ex2.
*Follow-up: "what does it resolve on?" The destination finishing — not merely
the source ending.*

**34. Why can you not decode each chunk to a string? ⭐⭐**
UTF-8 is variable-length, so a chunk boundary can fall in the middle of a
character and each half decodes to a replacement character. Collect `Buffer`s
and decode once, or use `StringDecoder`, which holds an incomplete sequence
back until the rest arrives. The bug is intermittent by nature, because the
chunk boundaries are decided by the kernel. → lesson 06 ex2, lesson 07 ex3.
*Follow-up: "when does this actually bite?" Any non-ASCII input — names,
emoji, anything European.*

**35. What is a Buffer? ⭐⭐**
A fixed-length array of bytes outside the JavaScript heap, and since ES6 a
subclass of `Uint8Array`. It exists because JavaScript strings are UTF-16 text
and cannot hold arbitrary binary. Use `Buffer.byteLength` rather than
`string.length` for anything with a size limit — `"café"` is four characters
and five bytes. → lesson 06 ex1.
*Follow-up: "`alloc` vs `allocUnsafe`?" `allocUnsafe` skips zero-filling and
can expose recycled memory if you do not overwrite all of it.*

**36. What is object mode? ⭐**
A stream carrying arbitrary JavaScript values instead of bytes, with a
`highWaterMark` counting items rather than bytes. It is what makes a stream a
data pipeline — a parser is byte-mode in, object-mode out — and the asymmetry
is configured per side (`readableObjectMode`/`writableObjectMode`). → lesson
07 ex3.
*Follow-up: "what error tells you you got it wrong?" "The 'chunk' argument
must be of type string or an instance of Buffer" — an object hit a byte
stream.*

**37. How would you process a 10 GB CSV? ⭐⭐⭐**
Stream it: read stream, a splitter that turns bytes into lines, a parser that
turns lines into records, a filter or transform, and a writable sink — wired
with `pipeline`. Memory stays flat because only a few chunks exist at once,
and the counters live in the closure around the transforms. Use a real CSV
parser, because quoted fields can contain commas and newlines. → lesson 07
challenge.
*Follow-up: "how do you handle a bad row?" Decide deliberately: skip and
count, or fail the run — and put the choice in the function's signature.*

**38. How do you read a request body in plain Node? ⭐⭐**
The request *is* a `Readable`: collect `"data"` chunks into an array, join on
`"end"`, parse. And bound it — count the bytes and refuse past a limit with
413, or one client can hand you a body the size of your heap. That is exactly
what `express.json({ limit })` does for you. → lesson 08 ex3.
*Follow-up: "what if the client disconnects mid-upload?" `"end"` never fires;
`"close"`/`"aborted"` does, and any work you started needs cancelling.*

**39. What is a Transform, and what is `flush` for? ⭐⭐**
A Duplex whose readable side is produced from its writable side: you implement
`transform(chunk, encoding, callback)`, and one chunk in may produce zero, one
or many chunks out. `flush` runs after the last chunk and is your only chance
to emit what you were buffering — the final partial line, a closing bracket, a
summary. Forget it and the last record silently disappears. → lesson 07 ex1,
ex3.
*Follow-up: "how do you fail a transform?" `callback(error)` — never throw.*

**40. Node streams or web streams? ⭐**
Node streams are the native currency of `fs`, `http` and `zlib`; web streams
(`ReadableStream`) are the WHATWG API that `fetch` uses and that runs in
browsers and edge runtimes. Node supports both and converts with
`Readable.fromWeb`/`toWeb`. For server code today, Node streams; for portable
code, web streams. → lesson 06, reading.
*Follow-up: "does backpressure work the same?" Conceptually yes, through a
different API.*

## Modules and packaging

**41. CommonJS vs ESM? ⭐⭐⭐**
CommonJS loads synchronously — `require()` reads, evaluates and returns right
there — which is why you can `require` conditionally, and why it cannot be
tree-shaken. ESM is resolved and linked statically before anything runs, which
enables tree-shaking and top-level `await` and means `import` must be at the
top level with a literal specifier. Both cache: a module is evaluated once per
process. → lesson 01.
*Follow-up: "how do you load a module conditionally in ESM?" `await
import(specifier)` — the function form.*

**42. How do you use `require` from ESM? ⭐⭐**
`createRequire(import.meta.url)` builds a real `require` anchored at that
file. It is the supported bridge for CommonJS-only dependencies, for reading
JSON synchronously at start-up, and for a package's own `package.json`. →
lesson 01 ex2.
*Follow-up: "and the other direction?" A CommonJS file can only reach ESM
through dynamic `import()`, which is async — you cannot `require()` an ESM
module (though newer Node versions can, for modules with no top-level await).*

**43. How do you get `__dirname` in ESM? ⭐⭐⭐**
`path.dirname(fileURLToPath(import.meta.url))`. `import.meta.url` is a URL,
not a path — percent-encoded, with a leading slash before a Windows drive —
so string surgery breaks on the first user whose folder has a space in it.
Recent Node also offers `import.meta.dirname`. → lesson 01 ex1.
*Follow-up: "why did they not just keep `__dirname`?" ESM is specified in
terms of URLs; a module need not have come from a filesystem at all.*

**44. What is the require cache? ⭐⭐**
A map from resolved absolute filename to the evaluated module, so the body
runs once and every `require` after the first is a lookup. You can delete an
entry to force re-evaluation, and you almost never should: everyone holding
the old exports keeps them, so the process now has two versions of one module.
ESM's registry is not exposed at all. → ex4 here.
*Follow-up: "so how do test runners isolate modules?" A fresh registry per
test file — which is what vitest does.*

**45. Every module is a singleton. Why does that matter? ⭐⭐⭐**
Because a module-level `let` is shared by every request in the process. A
database pool exported from `db.ts` is a feature; a `let currentUser` is a
security incident, because two concurrent requests overwrite each other while
one is awaiting. Per-request state belongs in the call frame, on `req`/`res`,
or in `AsyncLocalStorage`. → lesson 01 ex3, review1 here.
*Follow-up: "how would you catch that in review?" Any mutable module-level
binding that is not a cache or a connection is a smell.*

**46. What do `dependencies`, `devDependencies` and `peerDependencies` mean? ⭐**
Runtime needs, build/test-time needs, and "the host app must supply this"
(typical of plugins, so you do not end up with two copies of a framework).
`package-lock.json` pins the exact resolved tree; `npm ci` installs exactly
that, which is what CI should use. → lesson 01, reading.
*Follow-up: "what does `^1.2.3` allow?" Anything below 2.0.0.*

**47. What is `"type": "module"`? ⭐⭐**
It makes `.js` files in that package ESM instead of CommonJS. `.mjs` is always
ESM and `.cjs` always CommonJS regardless, which is why library authors use
the explicit extensions. Adding that one line to a `package.json` can break
every file in the directory, which is the most common cause of "Cannot use
import statement outside a module". → lesson 01.
*Follow-up: "how does a package ship both?" The `exports` map, with separate
`import` and `require` entries.*

## HTTP, express and services

**48. What does `http.createServer` give you, and what does it not? ⭐⭐**
It parses the request line and headers and hands you a `Readable` request and
a `Writable` response. It does not parse bodies, query strings, cookies or
routes, and it has no opinion about status codes — every framework is those
things built on top. → lesson 08.
*Follow-up: "what happens if you never call `res.end()`?" The request hangs
until the client times out.*

**49. What is middleware? ⭐⭐⭐**
A function `(req, res, next)` in an ordered list. It can read or augment the
request, set headers, and then either send a response or call `next()` to pass
control on. Everything — body parsing, auth, logging, CORS, rate limiting,
error handling — is that shape, and *where* you register it is part of what it
does. → lesson 09 ex3.
*Follow-up: "what happens if you respond and call `next()`?" The next handler
tries to respond too and express throws
`ERR_HTTP_HEADERS_SENT`.*

**50. How does error handling work in express? ⭐⭐⭐**
An error handler is middleware with four parameters, registered last. Errors
reach it from a synchronous `throw`, from `next(error)`, and — in express 5 —
from a rejected promise returned by an async handler. Map your own error types
to statuses; send a generic 500 for anything else and log the real one. →
lesson 10 ex3, ex4.
*Follow-up: "what changed in express 5?" Async rejections are forwarded
automatically, so the `asyncHandler` wrapper is no longer needed.*

**51. Why validate input if you have TypeScript? ⭐⭐⭐**
Because types are erased before the program runs, so `req.body as CreateOrder`
is a wish, not a check. A schema (zod, valibot, ajv) re-establishes the
guarantee at the boundary and gives you the static type from the same
declaration. Parsing also *strips* unknown keys, which turns mass assignment
from a vulnerability into a non-event. → lesson 10 ex2, lesson 11 ex3.
*Follow-up: "where do you validate?" At the edge, once — not scattered
through the handler.*

**52. Which status codes, and when? ⭐⭐**
201 with `Location` for a create; 204 with no body for a delete; 400 for a
malformed request, 401 unauthenticated, 403 authenticated but not allowed, 404
no such thing, 405 with `Allow` for a wrong method, 409 conflict, 413 too
large, 429 with `Retry-After`, 500 for our fault. Being precise here is most
of what makes an API debuggable by someone who is not you. → lesson 08, 11.
*Follow-up: "400 or 422 for validation?" Either, consistently; 422 says
"well-formed but semantically wrong".*

**53. How would you structure a Node service? ⭐⭐⭐**
Three layers: a thin HTTP layer (routes, status codes, headers), a validation
boundary where untrusted input becomes typed data, and a store/repository that
owns the data. Dependencies are injected — the app is a `createApp()` factory,
not a module-level singleton — so everything is testable in-process with
supertest and no port. → lesson 11.
*Follow-up: "how do you test it?" supertest against the app object for the
HTTP layer, direct unit tests for the store, and a fake store for the routes.*

**54. How do you test an HTTP API without binding a port? ⭐⭐**
Export a factory that returns the app and let supertest start it on an
ephemeral port for the duration of the request. That keeps tests independent
and parallelisable, and it is why `listen()` belongs in `server.ts` rather
than `app.ts`. → lesson 09 onwards.
*Follow-up: "how do you handle time in tests?" Inject the clock — the way the
rate limiter in lesson 10 takes a `now()`.*

**55. What would you add before putting a service in production? ⭐⭐**
Persistence, pagination with a maximum page size, authentication and
authorisation, structured request logging with a request id echoed to the
client, metrics and a health endpoint, graceful shutdown on `SIGTERM`, body
size limits, timeouts on every outbound call, and an OpenAPI description.
Naming that list is often worth more than any single implementation. → lesson
11.
*Follow-up: "which first?" Whichever failure would hurt most — usually
timeouts and limits, because they are what turn a dependency's bad day into
yours.*

## ex1 — the whiteboard question

This is the most frequently asked Node interview question, and it is asked
because it is a proxy for the whole runtime model. Getting the phases right
shows you know the loop exists; getting the checkpoint-after-every-callback
rule right shows you have actually reasoned about it rather than memorised a
diagram.

The specific trap here is the `process.nextTick` scheduled *inside* a timer
callback. Candidates who think of the checkpoint as happening "between phases"
put it after both timers; it actually runs after each individual callback, so
it lands between them. Being able to explain *why* — that Node drains its own
queue and then V8's microtask queue after every callback returns — is the
answer that ends the question.

Practise saying the four rules out loud as a list before you trace the code.
An interviewer watching you narrate "sync first, then nextTick, then
microtasks, then one timer, then the checkpoint again" is watching a method,
not a memory.

## ex2 — the loop is blocked

The setup is always some version of "this endpoint makes the whole service
slow — why, and what do you do?" The answer has two halves. Why: one thread
runs your JavaScript, so a long synchronous loop delays every other callback,
including other requests' handlers and your health check. What: chunk the work
and yield between chunks, move it to a worker thread, or push it out to a job
queue.

The near-miss that the gate catches is worth carrying: `await
Promise.resolve()` is not a yield. Microtasks drain before the loop
continues, so nothing else gets a turn — the code *looks* asynchronous and
blocks exactly as hard. `setImmediate` (or `setTimeout(…, 0)`) is the real
yield because it puts your continuation behind the loop's own work.

And be ready to say what chunking does *not* do: it does not make the work
faster. If the work is genuinely CPU-bound, spreading it out just spreads the
pain, and the correct answer becomes `worker_threads` or a different process.
Knowing which fix matches which problem is the point.

## ex3 — the two error questions

`guardOnce` answers "what happens if a callback is called twice?" — a question
that sounds theoretical until you have debugged a double-charged payment. The
implementation is a boolean in a closure, and the detail that matters is
setting the flag *before* forwarding, so a re-entrant call is caught too.
Promises give you this for free, since a promise settles exactly once, and
saying that is part of a complete answer.

`isOperational` answers the taxonomy question, and the ordering of the rules
is the interesting part. Non-`Error` first, because a thrown string has no
stack and is itself a bug. Explicit marking next, because an error you
constructed knows more about itself than any heuristic. Built-in bug types
excluded explicitly. And only then the system-error code, which is the
heuristic that covers everything libuv hands you.

The default — unknown means programmer error — is a deliberate stance: errors
are guilty until proven innocent, because assuming a mystery is harmless is
how a corrupted process stays up serving nine hundred other users.

## ex4 — the require cache

The question is usually "what happens if you `require` the same module twice?"
and the answer is that the body runs once, the result is cached by resolved
filename, and every later `require` is a lookup. That single fact explains
accidental singletons, why a module with side effects is a liability, and why
two copies of a library at different versions produce `instanceof` failures.

Clearing the cache — `delete require.cache[require.resolve(specifier)]` — is
the follow-up, and the complete answer includes why you should not. Anything
already holding the old exports keeps them, so you end up with two live
versions of one module: two connection pools, two registries, two class
identities. Test runners avoid the whole problem by giving each test file a
fresh registry rather than evicting modules.

The ESM half is worth having ready: there is no supported way to unload an ES
module, because the registry is not exposed. That is a deliberate consequence
of static linking, and it is why "how do I hot-reload?" has no good answer
beyond restarting the process or using a loader hook.

## review1 — per-request state

This is the highest-value bug in the whole bank because it passes every test
you are likely to write and fails only under concurrency. A module-level
`let currentUser` is fine with one request at a time; the moment two overlap,
the second overwrites the first while it is suspended at an `await`, and user
A gets user B's data. It is a data-leak class of bug, not a crash, so nothing
alerts you.

The fix is that per-request state lives in the call frame — a `const` inside
the handler, closed over by whatever needs it — or on `req`/`res`, which
express provides for exactly this. Both are just "this value belongs to this
invocation".

The senior answer names `AsyncLocalStorage` (from `node:async_hooks`): a way
to carry a per-request context through a deep call stack without threading an
argument through every function, which is how request ids and trace contexts
are propagated in real systems. Mention it and you have answered a question
most candidates have never heard of — but only after you have said the simple
thing first, because the simple thing is what the interviewer is checking.

## Further reading

- [The Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — the source of truth for questions 1–10.
- [Don't block the event loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) — the official version of the ex2 answer, with costs of common operations.
- [Error handling in Node.js](https://nodejs.org/en/learn/error-handling/error-handling-in-nodejs) — operational vs programmer errors, in the docs.
- [Backpressuring in streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) — questions 31–34, at length.
- [Express: error handling](https://expressjs.com/en/guide/error-handling.html) — including what changed in express 5.
- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — the combinator semantics behind questions 11–20.
