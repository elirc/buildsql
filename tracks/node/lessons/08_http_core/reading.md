# Reading - node/08_http_core

The HTTP module is small, unopinionated, and the thing every Node framework is
standing on. An afternoon here saves years of framework mysteries.

## Notes

**What `http.createServer` actually gives you.** A `Server` that is an
`EventEmitter`; the callback you pass is registered as a `"request"` listener.
Node parses the request line and headers for you, hands you an
`IncomingMessage` before the body has necessarily arrived, and hands you a
`ServerResponse` you write into. It does not parse bodies, routes, cookies,
query strings, or form data, and it does not have opinions about status codes.
Everything else in the web-framework world is built from those two objects.

**`IncomingMessage` is a Readable and `ServerResponse` is a Writable.** That
is not a metaphor — everything from lessons 06 and 07 applies. You can
`pipeline(req, parser, sink)`. You can pipe a file straight into `res`. A
proxy is `pipeline(clientReq, upstreamReq)` and `pipeline(upstreamRes, res)`,
which is why a Node proxy is twenty lines and uses constant memory.

**Header handling.** Request header names arrive lowercased in `req.headers`
(HTTP header names are case-insensitive; Node normalises so you do not have to
guess). Duplicate headers are joined with `, ` except `set-cookie`, which is
always an array. On the response, `setHeader`/`getHeader`/`removeHeader` work
until the headers are flushed; after that they throw, because the bytes are
gone.

**The one-response rule.** A response is a status line, then headers, then a
body, in that order, once. `writeHead` twice throws `ERR_HTTP_HEADERS_SENT`,
and it is nearly always caused by a missing `return` after an error response —
which is why the reference solutions in this lesson return after every
`sendJson`. Frameworks hit the same wall; express's version of this bug is
"Cannot set headers after they are sent to the client".

**Keep-alive and why `end()` matters.** Modern HTTP reuses the TCP connection
for several requests, so the client knows a response is over either from
`Content-Length` or from chunked framing. Calling `end()` is what closes the
frame; without it the client waits, holding the socket, until a timeout. This
is also why setting `Content-Length` (as the reference's `sendJson` does) is
slightly better than letting Node fall back to chunked encoding for small
bodies — one fewer thing for the client to reason about.

**The URL class is the parser.** `url.parse` from `node:url` is the legacy
API, still everywhere in old code, and deprecated. Use `new URL(req.url,
base)` — it is the same WHATWG URL you have in browsers, it decodes
percent-escapes, and `URLSearchParams` handles repeated keys properly. If you
need the real host, build the base from `req.headers.host` — and treat that
header as untrusted input, because it comes from the client.

**Bodies need limits, always.** `req` will hand you as many bytes as the
client sends. Without a cap, one request can exhaust your heap, and it costs
the attacker nothing. Every framework's body parser has a limit (express
defaults to 100 KB for JSON) and every hand-rolled parser needs one. The
correct production shape is: check `Content-Length` if present, count bytes as
they arrive, and respond `413` *and* destroy the socket the moment the limit
is passed.

## ex1 — routing is an `if`

Seeing routing as a chain of conditionals is the point. `app.get("/health",
h)` is a registration that makes the framework run the same comparison later.
When a route "does not match" in express, the cause is always one of the
things you can see in your own version: the method is different, the path has
a trailing slash, the pathname includes a query string, or an earlier
middleware already sent the response.

The 404 fallthrough is worth noticing as a design. There is no "no route
matched" event in `http` — if you send nothing, the request hangs. So every
server ends with a default, and in express that default is the built-in final
handler that produces the HTML "Cannot GET /nope" page. Yours produces JSON,
which is what an API should do: an API that answers HTML on the error path
breaks every client that assumed JSON.

The `content-type` header matters more than it looks. Without it, browsers
sniff, some proxies transform, and `fetch().json()` still works only because
it does not check. Sending it is one line and it is part of being correct.

## ex2 — the query string, and the shape of user input

`URLSearchParams` gets three things right that hand-rolled parsers get wrong:
percent-decoding (`%20`, `+` in form encoding), repeated keys, and empty
values. The repeated-key case is the one people meet in production —
`?tag=a&tag=b` is a perfectly normal way to send a list, and `get()` silently
returns only the first — which is why express's `req.query` sometimes hands
you a string and sometimes an array, a type that has caused a great deal of
grief.

The other lesson is that everything is a string. There is no type information
in a query string, so `limit=2` is `"2"`, `flag=false` is the truthy string
`"false"`, and `id=1e3` is a perfectly valid number if you `Number()` it.
Conversion and validation belong at the edge — one place, immediately — which
is exactly the argument for the zod schemas you will write in lesson 10.

The interview version: "how would you handle `?limit=abc`?" The answer worth
giving names the choice — 400 with a message, or fall back to the default —
and points out that silently coercing to `NaN` and then using it in a slice is
the one option that is definitely wrong.

## ex3 — the body, and the first security decision in this course

Three things happen in this exercise and all three are load-bearing.

**The handler answers from a callback.** Because the body arrives over time,
the response is produced inside `"end"`. This is where the "release Zalgo"
discipline from lesson 04 pays off: the request path is uniformly
asynchronous, so there is no version of the code that sometimes answers
synchronously.

**The limit protects memory.** Counting as you go and dropping bytes past the
limit means your worst case is bounded regardless of the client. Checking
`Content-Length` first is a useful optimisation — you can reject before
reading anything — but it cannot replace counting, because the header is
supplied by the client and a chunked request has no length at all.

**The status codes are a vocabulary.** 400 for malformed input, 405 with
`Allow` for a wrong method, 413 for too much data. Getting these right is what
makes an API debuggable by someone who is not you: a 500 says "the server
broke", and using it for a bad request sends the reader looking in the wrong
logs.

The follow-up question an interviewer asks here: "what happens if the client
disconnects mid-upload?" The `"end"` event never fires, `"aborted"`/`"close"`
does, and any work you started needs cancelling — which is why long-running
handlers check `req.destroyed` or listen for `"close"`.

## ex4 — conditional GETs, the cheapest optimisation in HTTP

An ETag is an opaque version identifier for a representation. The server sends
it; the client stores it; the next request offers it back in `If-None-Match`;
the server compares and either sends the whole body or a 304 with no body at
all. Same round trip, a fraction of the bytes, and the client's cache stays
correct because the server decides.

Three details worth carrying:

- **Strong vs weak.** `W/"abc"` is a *weak* ETag: the representations are
  semantically equivalent but maybe not byte-identical. Express's built-in
  ETag is weak by default, computed from a hash of the body.
- **`Cache-Control: no-cache` does not mean "do not cache".** It means "cache
  it, but revalidate before every use" — which is exactly what makes the
  conditional GET happen. The header for "never store this" is `no-store`.
- **A 304 must have no body**, and Node enforces it. It should carry the
  headers a 200 would have carried for caching purposes, which is why the
  reference sets `ETag` and `Cache-Control` before the branch.

The related mechanism, worth knowing by name: `Last-Modified` plus
`If-Modified-Since`, which is the same protocol keyed on a timestamp with
one-second resolution. ETags are strictly better when you can compute them.

## challenge — what a router is

A router is a list of (method, pattern, handler) plus a matcher. Everything
else real routers add — parameter type constraints, wildcards, regular
expressions, precedence rules, nested routers, per-route middleware — is
elaboration on that.

Two design points in the exercise are worth naming because they recur.

**Registration-time work beats request-time work.** Splitting the pattern into
segments once, at registration, is the same instinct as compiling a regex once
or preparing a SQL statement once. Express (and its path-to-regexp) goes
further and compiles each pattern into a regular expression at registration.

**"Nothing matched" is two different answers.** A path that no route claims is
a 404. A path that routes claim under other methods is a 405, and the spec
*requires* the `Allow` header so the client can discover what is possible.
Getting this right is a small thing that separates an API that feels
considered from one that does not — and it only falls out if your dispatch
loop keeps looking after the first path match fails on method.

The natural follow-up: "what about ordering and conflicts?" With `/orders/new`
and `/orders/:id` both registered, first-match-wins means registration order
decides, which is why express tells you to register specific routes before
parameterised ones. A router that scores specificity instead (like most modern
frameworks) is the alternative, and knowing that the trade-off exists is the
answer.

## Further reading

- [`node:http`](https://nodejs.org/api/http.html) — `createServer`, `IncomingMessage`, `ServerResponse`; the reference for everything in this lesson.
- [Anatomy of an HTTP transaction](https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction) — the official walkthrough, and the best single page on the subject.
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — the table from the Concept section, with the precise semantics of each.
- [MDN: HTTP conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests) — ETags, `If-None-Match`, and where 304 fits.
- [MDN: `URL` and `URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URL) — the parser ex2 is built on.
