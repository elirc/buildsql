# Reading - node/10_middleware_validation

The three layers every service has: read the input, prove it is what you
asked for, and fail in one place.

## Notes

**Middleware factories are the ecosystem's shape.** `cors(options)`,
`helmet()`, `express.json({ limit })`, `rateLimit({ max })` — every
configurable middleware is a function that returns `(req, res, next)`. The
options live in a closure, which means the middleware carries its
configuration without a global and can be registered twice with different
settings (a strict body limit on one router, a generous one on another). Once
you notice the pattern, reading unfamiliar middleware source becomes easy:
find the returned function, everything above it is setup.

**Where a middleware runs is part of what it does.** Before the routes: it
sees every request on the way in. After the routes: it sees only what nothing
answered — which is how a 404 handler works. With four parameters: only errors.
On a router: only that mount path. There is no other configuration mechanism,
and "why did my middleware not run" is always answered by looking at the
registration order.

**`res.on("finish")` versus `res.on("close")`.** `"finish"` fires when the
response has been fully written; `"close"` fires when the underlying
connection is closed, which also happens when a client disconnects early. A
request logger that only listens for `"finish"` silently misses abandoned
requests — real loggers (morgan, pino-http) listen for both. Knowing the
difference is a good sign in an interview because it shows you have thought
about the failure path.

**Validation is a runtime problem, always.** TypeScript's types are erased
before your program runs, so `req.body as CreateOrder` is a wish. A schema
library re-establishes the guarantee at the boundary. zod's particular
strength is that one declaration produces both the runtime check and the
static type (`z.infer`), so the two cannot drift apart — which is exactly the
failure mode of hand-written validators plus hand-written interfaces.

**Parse, don't validate.** The phrase comes from a well-known essay by
Alexis King. A validator answers a yes/no question and leaves you holding the
original untyped value; a parser returns a *new* value whose type encodes what
was checked. In practice that means assigning `result.data` back, not just
checking `result.success` — and it is why zod strips unknown keys by default,
so a client cannot smuggle `{ "role": "admin" }` into an object you spread
into a database row. (That attack has a name — mass assignment — and stripping
is the structural fix.)

**Errors have an audience.** Two of them: the client, who needs a status code
and a stable machine-readable code; and you, who needs the stack, the inputs
and the context. Conflating them is how stack traces reach browsers and how
"something went wrong" reaches your logs. The split is exactly the
operational/programmer distinction from lesson 04, now with an HTTP response
attached.

**Express 5 changed the async story.** In express 4, a handler returning a
rejected promise was an unhandled rejection: express never saw the error, the
request hung until timeout, and (since Node 15) the process could die. The
workarounds — `express-async-handler`, a hand-rolled `asyncHandler` wrapper,
or `try { } catch (e) { next(e) }` in every route — are all over the internet
and all obsolete in 5, which awaits the handler's return value and routes a
rejection into the error pipeline.

## ex1 — the body parser, and logging at the right moment

`express.json()` is `body-parser` inlined into express. It checks the
`Content-Type`, streams the body with a size limit, parses it, and puts the
result on `req.body`; on failure it calls `next(err)` with an error carrying
`status: 400`, which the default error handler turns into a 400 response. The
default limit is 100 kb, and raising it is a decision with a memory cost —
`limit: "50mb"` means a handful of concurrent uploads can exhaust a small
container.

The logging middleware teaches a subtler thing: **some work belongs after the
response**. At the moment your middleware runs, the status code is not
decided, the body has not been produced, and the duration is zero. Registering
a `"finish"` listener and returning is the shape every request logger, metrics
middleware and tracing integration uses. It is also the moment to record the
duration, which is why the pattern usually starts with
`const started = process.hrtime.bigint()`.

The related production note: log lines should be structured (JSON), include a
request id, and be emitted once per request. A logger that writes on the way
in *and* on the way out doubles your log volume for no extra information.

## ex2 — schemas at the boundary

Three things the exercise is really teaching.

**One schema, two outputs.** `z.infer<typeof schema>` gives you the static
type for free. Write the schema once and use it as the source of truth for
both the runtime check and the compile-time shape; the alternative — an
`interface` next to a validator — is two declarations that drift.

**Report every failure.** `error.issues` is an array. A client rendering a
form wants all of them at once; an API that stops at the first problem forces
one round trip per bad field. The `path` is an array because objects nest
(`["items", 0, "qty"]`), which is why joining it into `"items.0.qty"` is the
usual way to hand it to a form library.

**Stripping is a security feature.** By default zod's object schemas drop keys
you did not declare. That turns "the client sent an extra field" from a
possible privilege-escalation bug into a non-event. `.strict()` rejects
unknown keys instead, and `.passthrough()` keeps them — both are deliberate
choices, and the default is the safe one.

Two things worth knowing beyond the exercise. Query strings are all strings,
so validating them needs coercion (`z.coerce.number()`), which is the honest
place to convert `"2"` into `2`. And the same middleware factory works for
`req.params` and `req.query` — most codebases end up with
`validate({ body, query, params })` taking three optional schemas.

## ex3 — the funnel

A central error handler is the highest-leverage twenty lines in an express
app. It gives you one place to decide the response shape, one place to add a
request id, one place to translate domain errors into status codes, and one
place to make sure nothing internal escapes.

The `AppError` shape — status, code, message — is the minimum. Real ones add a
`details` field (for validation), a `cause` (lesson 04), and often follow
[RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457), which
standardises `type`/`title`/`status`/`detail` and is what the .NET track's
`ProblemDetails` implements. A stable machine-readable `code` matters more
than the message: clients branch on codes, humans read messages, and messages
get rewritten.

The leak the gate checks for is not theoretical. A failed `pg` query throws an
error whose message can contain the connection string; an ORM's error can
contain the SQL and the parameters, which may be personal data. "Return
`error.message` on 500" is a one-line convenience that has put credentials in
browser dev tools more than once.

And the logging asymmetry — log the 500, not the 404 — is what keeps error
logs usable. If every not-found is an error-level log line, the real errors
are invisible by lunchtime. Operational failures belong in your request log
(with their status code); defects belong in your error log with a stack.

## ex4 — the express 5 change, and why it matters

The mechanism: express 5 calls your handler, and if the returned value is a
promise it attaches a rejection handler that funnels into `next(err)`. That is
all. But it removes an entire genre of bug — the route that silently hangs
because someone forgot a `catch` — and an entire genre of boilerplate.

Two things it does **not** do, worth knowing so you do not over-trust it:

- an error thrown inside a callback that express never sees (a `setTimeout`, an
  event listener, a stream `"error"` you did not handle) still escapes. Async
  context does not extend into callbacks you scheduled yourself.
- it does not stop the handler: `await` throws, so the lines after it do not
  run, but any side effect before the failure has already happened. Atomicity
  is your problem, not the framework's.

`next(error)` remains the explicit road, and it is the one to use from a
middleware that is not async — a guard, a permission check, a version
negotiator. Both roads end at the same handler, which is the point: one funnel,
several entrances.

## challenge — rate limiting, and testable time

Rate limiting is the simplest example of a whole category: logic whose
behaviour depends on the clock. The instinct to reach for `Date.now()` inside
the function is what makes such code untestable, and the fix is always the
same — take the clock as a dependency. The gate then moves time in whole
seconds with no `setTimeout`, no fake timers and no flakiness.

Three notes on the algorithm itself:

**Fixed windows have a burst problem.** A client can send `limit` requests in
the last millisecond of one window and `limit` more in the first millisecond
of the next — twice the intended rate. The fixes are a sliding window (count
requests in the trailing `windowMs`, usually approximated) or a token bucket
(tokens refill continuously, which also allows a controlled burst). Naming
this trade-off is a strong answer when an interviewer asks you to design one.

**In-memory state does not survive a second instance.** Two containers behind
a load balancer means two independent counters and twice the limit. Production
limiters keep the counters in Redis, which is also why the atomicity of the
increment matters (`INCR` plus `EXPIRE`, or a Lua script).

**The headers are a protocol.** `X-RateLimit-*` is the widely used convention
and there is now a standards-track `RateLimit` header. `Retry-After` is the
one that is actually specified (RFC 9110), it belongs on a 429 and on a 503,
and a client that respects it is a client that will not make your outage
worse. Sending it costs one line; omitting it makes every client guess.

## Further reading

- [Express error handling](https://expressjs.com/en/guide/error-handling.html) — including the four-argument rule and what changed in express 5.
- [Express: `express.json()`](https://expressjs.com/en/5x/api.html#express.json) — options, limits and what happens on a malformed body.
- [zod: basic usage and `safeParse`](https://zod.dev/) — schemas, issues, `z.infer`, and the object-stripping behaviour.
- [MDN: 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) — and `Retry-After`, the header the challenge sets.
- [MDN: `Response.status` codes overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — the vocabulary the error handler maps onto.
