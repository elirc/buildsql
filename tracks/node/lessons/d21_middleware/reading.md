# Reading - node/d21_middleware

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **middleware as a value**. A middleware is a function
of `(req, res, next)`, which means it can be wrapped, combined, generated and
handed around like any other function — and four of these eight problems are
combinators rather than features. The other four are about the two moments a
middleware does not naturally have access to: *after* the handler has decided
what to send, and *when the request is over*. Express gives you neither directly,
so both are reached the same way — by replacing something on the response object
and calling the original afterwards, or by listening for the events the response
emits when it ends. Once you have seen `res.end` wrapped for a timer and
`res.json` wrapped for a cache, most of the middleware ecosystem stops being
mysterious.

## ex1 — a last word before the headers go out

**What it tested:** knowing that a response has a point of no return, and where
it is.

**The classic mistake:** `res.on("finish", () => res.setHeader(...))`. It reads
correctly — finish is when the response is done — and it is one moment too late:
the headers were serialised and sent before `finish` fired, so the call either
throws `ERR_HTTP_HEADERS_SENT` or is silently discarded. The header simply never
appears, and nothing in the logs says why.

**Model answer:** record the start time in the closure for *this* request, wrap
`res.end` so the header is set on the way past, and guard on `res.headersSent`
so a second call cannot throw.

## ex2 — a combinator, and the missing next()

**What it tested:** that middleware composes, and that "do nothing" is an
action you have to take.

**The classic mistake:** writing the skip branch as a bare `return`. The request
stops dead — no response, no error, no timeout on the server side — and the
client hangs until *its* timeout fires. It is the one express bug that produces
no output at all, which is why it takes people so long to find.

**Model answer:** `next()` to skip, and `middleware(req, res, next)` to run —
handing the outer `next` straight through, so `next(error)` and `next("route")`
keep meaning exactly what the wrapped middleware meant by them.

## ex3 — the chain, rebuilt by hand

**What it tested:** whether you can express "in order, each waiting for the
last" when the waiting is asynchronous and controlled by somebody else's code.

**The classic mistake:** a `for` loop calling each middleware in turn. That runs
all of them immediately, ignores the fact that one might respond, and turns the
second argument of `next(error)` into nothing at all. The subtler version gets
the recursion right and then advances the chain even when it was handed an
error, so a failure quietly becomes a continue.

**Model answer:** a recursive `step(index)` whose `next` inspects its argument —
anything not `undefined` goes to the outer `next` and stops the chain — and
which calls the outer `next()` when it runs off the end, so the composition is a
drop-in for the stack it replaced.

## ex4 — arity is the API

**What it tested:** that express identifies error handlers by counting declared
parameters, and that "handled" and "answered" are different things.

**The classic mistake:** dropping the unused `next` from
`(err, req, res, next)`. The function now takes three arguments, express files
it as ordinary middleware, and it never runs in the error path — while looking
exactly like an error handler in the source. Second place: one handler that
tries to recognise everything, so a new error type gets whatever the last
`else` said.

**Model answer:** a first handler that answers what it knows and calls
`next(error)` for the rest; a last handler that logs the truth and tells the
client nothing; and the `res.headersSent` branch, where the only correct move is
`next(error)` — the response has already begun, so express destroying the
connection is more honest than a second answer appended to the first.

## ex5 — what the parser will and will not tell you

**What it tested:** the boundary of `express.json()`. It refuses two things
loudly and ignores a third completely, and knowing which is which is the whole
question.

**The classic mistake:** assuming a wrong `content-type` produces an error. It
does not — `express.json({ type })` skips a body it was not configured for and
leaves `req.body` as `undefined`, so the first sign of trouble is a handler
reading a property off undefined and a 500 in the logs. The mirror mistake is
treating that `undefined` and the `{}` from an empty body as the same case, when
one is a 415 and the other is a 400.

**Model answer:** switch on `error.type` (`entity.too.large`,
`entity.parse.failed`) in a four-argument handler for what the parser raises,
and write your own guard for the two it does not — checking `req.body ===
undefined` before checking whether it is empty.

## ex6 — 401 and 403 are not synonyms

**What it tested:** the distinction every API gets wrong at least once, and the
header that makes 401 useful.

**The classic mistake:** answering 401 for a permission failure. The client's
correct response to a 401 is "get credentials and retry", so a user who is
already logged in is sent round a login loop that cannot possibly help — and in
a browser client, often literally an infinite one. The other mistake is a 401
with no `WWW-Authenticate`, which is the status code without the part that says
what to do about it.

**Model answer:** `bearerAuth` checks the scheme before the token, awaits
`verify` (async is fine — express 5 forwards a rejected promise on its own), and
attaches the principal; `requireRole` is a separate middleware so a route can
ask for identity without asking for a role, and its 403 carries no challenge
because there is nothing to retry.

## ex7 — a semaphore with a response attached

**What it tested:** the lesson-03 limiter, moved into a place where you do not
control when the work finishes.

**The classic mistake:** releasing the slot after `next()` returns. `next()`
returns as soon as the handler *starts*, not when it finishes, so the limit is
enforced against nothing at all. The runner-up is releasing only on `finish`, so
a client that disconnects mid-request keeps its slot forever and the service
degrades one connection at a time until it accepts nothing.

**Model answer:** listen for `finish` **and** `close` with a `released` boolean
so the pair cannot double-count, and hand a returning slot straight to the
longest waiter rather than decrementing and re-checking — because that gap is
where a brand-new request jumps the queue.

## ex8 — the middleware that has to see the future

**What it tested:** capturing a response from a position that runs before it
exists, and the four policy decisions that separate a cache from a bug.

**The classic mistake:** caching everything that comes back. A stored 404 or 500
outlives its cause: the resource is created, the outage ends, and every client
keeps getting the failure until the ttl expires. Almost as common is never
invalidating, so a client that has just written cannot see its own work — the
single most reported "the site is broken" bug in any cached API.

**Model answer:** wrap `res.json` to record the body while it is still a value;
store only 2xx; key on `req.originalUrl` so the query string is part of the
identity; honour `no-store` by neither reading nor writing; and clear a path's
entries on the way *in* to a write, before the handler runs, so no concurrent
read can repopulate them from data that is about to be wrong.

## Further reading

- [Express: Writing middleware](https://expressjs.com/en/guide/writing-middleware.html) — the signature, and what `next()` means.
- [Express: Error handling](https://expressjs.com/en/guide/error-handling.html) — four-argument handlers, the default handler, and what happens after the headers are sent.
- [Express 5 API: `express.json()`](https://expressjs.com/en/5x/api.html#express.json) — `limit`, `type`, and the errors it raises.
- [Node.js: `http.ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) — `headersSent`, and the `finish` and `close` events ex7 depends on.
- [MDN: 401 vs 403](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403) — and the `WWW-Authenticate` header that belongs on only one of them.
