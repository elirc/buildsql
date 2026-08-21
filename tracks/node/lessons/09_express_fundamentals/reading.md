# Reading - node/09_express_fundamentals

Express is twelve hundred lines of routing over `node:http`. Knowing which
twelve hundred is what makes it predictable.

## Notes

**The stack is the whole design.** An express app holds an array of layers.
Each layer has an optional path pattern, an optional method, and a function.
On each request express walks the array in order; a layer whose path and
method match gets called; calling `next()` advances to the next match; sending
a response ends the walk. Routers are nested arrays with a mount path. That is
genuinely all of it — no dependency injection, no lifecycle hooks, no
decorators.

**Express 5, and what changed from 4.** The differences worth knowing:

- **Async errors are forwarded.** In express 4, a rejected promise from a
  handler was an unhandled rejection and the request hung; you needed
  `try`/`catch` plus `next(err)`, or a wrapper like `express-async-handler`.
  In express 5 a handler that returns a rejecting promise routes the error to
  your error-handling middleware automatically. Lesson 10 grades this.
- **Path syntax is stricter** (path-to-regexp v8). A bare `*` is no longer a
  pattern; wildcards must be named — `/*splat`. Optional segments are
  `{/:id}` rather than `/:id?`, and regex fragments inside a path string are
  gone. If a tutorial's route pattern throws at startup, this is why.
- `req.query` is a getter, computed once; `req.params` is not writable.
- Long-deprecated helpers (`res.sendfile`, `res.json(status, body)`,
  `app.del`) are removed.

**`res.locals` versus attaching to `req`.** Both are used in the wild for
per-request state. `res.locals` is the documented one (it is also what view
engines read) and it disappears when the response does. Attaching to `req`
works but needs TypeScript declaration merging to type properly. Either way,
per-request state must live on the request/response objects — never in a
module-level variable, because that variable is shared by every concurrent
request in the process. That is the single most dangerous mistake in a Node
server, and it is *possible* precisely because modules are singletons (lesson
01 ex3).

**Handlers are matched, not searched.** Registration order decides. `/orders/
:id` registered before `/orders/summary` means `summary` is treated as an id
forever. There is no specificity ranking like a CSS selector or a modern
framework's file-based router. Register specific routes first.

**`app.use` is not "global setup".** It is a layer at the position where you
wrote it. Registered before the routes it runs before them; registered after
it runs only for requests no route answered (which is how a custom 404 handler
works) and after `next()` is called from a route (which is how error handlers
work). Position *is* configuration.

## ex1 — the factory pattern

The most important line in this exercise is the one that is not there:
`app.listen()`. An app that listens as a side effect of being imported cannot
be tested without a port, cannot be started twice, and cannot be configured by
its caller. Splitting `createApp()` from the process that runs it is the
standard shape of a testable Node service, and supertest is built around it.

`res.json` does four things: serialises with `JSON.stringify`, sets
`content-type: application/json; charset=utf-8`, sets `Content-Length`, and
ends the response. It also applies the app's `json replacer`/`json spaces`
settings if configured, and — relevant later — sets an ETag by default, which
is why express responses support conditional GETs without you doing the work
you did in lesson 08 ex4.

The built-in 404 is worth understanding rather than replacing by reflex. When
the stack is exhausted with no response, express's final handler responds
404 with an HTML body. For an API you usually *do* want to replace it with
JSON, and the way to do that is a `app.use` **after** all routes — which is
exactly the shape lesson 10 builds.

## ex2 — the shape of untrusted input

`req.params` values are always strings, because URLs have no types. So is
everything in `req.query` — or an array, if the client repeats the key, or
`undefined` if it is absent. In TypeScript that shows up as
`string | string[] | undefined`, which is annoying and honest: it is exactly
what can arrive.

The `NaN` trap in this exercise is worth internalising because it generalises.
`Number("abc")` is `NaN`; `NaN` compares `false` against everything, including
itself; `Array.prototype.slice(0, NaN)` treats it as 0 and returns nothing.
So the naive version answers `[]` — a plausible, wrong, silent answer. The
fix is to validate the *converted* value (`Number.isInteger`,
`Number.isFinite`) rather than the raw string, and to answer 400 rather than
guess.

This is the argument for schema validation in one paragraph, and it is why
lesson 10 introduces zod: doing this by hand for four parameters is fine;
doing it by hand for forty is where the bugs live.

## ex3 — order, and the two ways to end a request

The trail array makes the stack visible. In production the same technique is
how request tracing works: a middleware at the top attaches an id, every layer
logs with it, and you can reconstruct one request's path through the system
from the logs.

The `x-request-id`-on-a-404 assertion is the structural one. A header that
appears even when no route matched can only have been set by a layer that runs
for every request — which is what `app.use` means and what a route-level
middleware cannot do. That is the gate proving *where* you registered
something, not just what it does.

The guard teaches the exit rule: **respond, or call `next()`, never both.**
After a response is sent, the response object is closed; calling `next()`
lets the next layer try to send another one, and express raises
`ERR_HTTP_HEADERS_SENT`. The idiom that prevents it is `return` immediately
after every `res.*` that ends a response — which is why every reference
solution in this course does it.

Two related things worth knowing: `next("route")` skips the remaining handlers
of the *current* route and moves to the next matching route, and `next(err)`
jumps straight to the error handlers, skipping everything in between. Both are
rare; both are useful to recognise.

## ex4 — routers, and why they are how apps are organised

A router is a mini-app with its own stack, mounted at a path. The mounting is
what gives you scoping: middleware on the router runs only for requests that
matched the mount path, so `api.use(authenticate)` protects an entire area
without a single `if (req.path.startsWith("/api"))`.

Two details that come up:

- Inside a mounted router, `req.baseUrl` is the mount path and `req.path` is
  the remainder, while `req.originalUrl` is the whole thing. Useful when
  building links.
- By default a router does not inherit the parameters of its mount path —
  `express.Router({ mergeParams: true })` turns that on, which is what you
  need for nested resources like `/orders/:orderId/lines`.

The convention this leads to is one router per resource in its own file, each
exporting a factory that takes its dependencies (`createOrdersRouter(store)`),
mounted in `createApp()`. That is dependency injection without a framework,
and it is what makes each router testable on its own — you will use the shape
in lesson 11.

## challenge — everything a list endpoint owes its client

Filter, sort, paginate, and report the total. Getting the order right matters:
filter first (it decides the total), then sort (over the filtered set), then
slice (the page you actually send).

Three production notes the exercise is a scale model of:

**Cap the page size.** Without a maximum, `?perPage=1000000` is a legal way to
ask for your whole table, and someone will. Every real API has a cap, usually
50–200, and returns 400 (or silently clamps, which is worse because the client
cannot tell).

**Offset pagination has a known flaw.** `page`/`perPage` is easy and it
breaks under concurrent inserts: if a row is added while a user is reading,
page 2 can repeat a row page 1 already showed. The alternative is cursor
pagination — "give me the 20 after id X" — which is stable and cannot jump to
an arbitrary page. Knowing that trade-off by name is a good interview answer.

**Sorting on an allowlist, never on user input.** `sort=amount` is validated
against a fixed set here for the same reason it must be in SQL: interpolating
a user-supplied column name into a query is an injection. Even without SQL, an
allowlist means an unknown field is a clear 400 instead of a mysterious
`undefined` comparison that silently returns the input order.

And one JavaScript detail: `Array.prototype.sort` sorts **in place** and
returns the same array. Sorting a shared module-level fixture reorders it for
every subsequent request in the process — a bug that only appears on the
second call, and one of the reasons "why did the order change?" is such a
common report. Copy first.

## Further reading

- [Express 5: routing](https://expressjs.com/en/guide/routing.html) — route paths, parameters, `express.Router`, and the current path syntax.
- [Using middleware](https://expressjs.com/en/guide/using-middleware.html) — the five kinds of middleware and where each one goes in the stack.
- [Migrating to Express 5](https://expressjs.com/en/guide/migrating-5.html) — the definitive list of what changed, including async error handling and path matching.
- [`req.query` and `req.params`](https://expressjs.com/en/5x/api.html#req.params) — the API reference for what arrives and in what type.
- [MDN: `Number.isInteger()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger) — the check that closes the `NaN` hole in ex2.
