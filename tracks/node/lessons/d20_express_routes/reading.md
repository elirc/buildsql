# Reading - node/d20_express_routes

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **the express router as a machine**, not as a place
to hang handlers. Everything in this set follows from two facts. First, express
tries its registrations strictly in the order you made them, matching path *and*
method together, and the first layer to respond ends the request — so ordering
is a design decision and not an accident of how you typed the file. Second, a
request carries three separate namespaces as it travels: parameters (which a
router only sees if you let it), the url (which mounting rewrites), and locals
(which live for exactly one response). Half the bugs in real express codebases
are a value put in the wrong one of those three, and the other half are a layer
registered in the wrong place.

## ex1 — one path, declared once

**What it tested:** that `app.route()` exists and why you would use it — three
verbs on one path with the path written a single time.

**The classic mistake:** none in the routing; the trap is state. Seeding the
store directly from the exported `SEED` array rather than from a copy of it
means the first `PUT` mutates a module-level object, and every later app built
by the factory starts from the mutated data. In a test suite that shows up as a
test which passes alone and fails in company.

**Model answer:** one `app.route("/notes/:id")` chain, a store in the closure
seeded with `SEED.map((note) => ({ ...note }))`, and `res.status(204).end()` for
the delete — because a 204 with a body is a contradiction the client is entitled
to trip over.

## ex2 — the parameter callback

**What it tested:** `app.param()`, which most people have never used, and the
distinction it draws that `app.use()` cannot: run for routes that have this
parameter, and only those.

**The classic mistake:** reaching for `app.use("/notes/:id", loader)` instead.
It looks equivalent and is not — it runs for every method and every sub-path,
including ones that were never meant to load anything, and it cannot be reused
by a second route family with the same parameter name. The other mistake is
calling `next()` after responding with the 404, which sends the request onward
to a handler that will try to respond again.

**Model answer:** one `app.param("id", ...)` that counts, loads, responds on
failure and otherwise hangs the note on `req` — so every route below it is three
lines long and none of them contains the word "find".

## ex3 — mergeParams

**What it tested:** that a `Router` has its own `req.params` and does not
inherit the mount path's parameters unless you ask.

**The classic mistake:** forgetting the option and then filtering by
`undefined`. Nothing throws. The endpoint answers `200` with an empty array, the
client renders "no notes yet", and the bug is reported as a data problem weeks
later. It is the quietest failure in this whole set.

**Model answer:** `express.Router({ mergeParams: true })`, routes written
relative to the mount, and one `router.use()` guard at the top that rejects an
unknown project for the entire subtree — which is only possible because the
router can read a parameter it did not declare.

## ex4 — three ways to say "carry on"

**What it tested:** that `next()`, `next("route")` and `next(err)` travel three
different distances, and that the middle one exists at all.

**The classic mistake:** believing `next("route")` passes a string to the next
handler, or using `return next()` where the intent was to abandon the route.
Written the wrong way round, a guard that means "this is not my request" instead
runs the handler it was guarding, and the second route — the one that was
supposed to answer — never gets a look.

**Model answer:** `app.get(path, guard, handler)` twice on the same path, with
the guard calling `next("route")` on the ids it does not want; the trail lives on
`req` so the gate can watch what ran without a shared array accumulating across
requests.

## ex5 — what mounting actually does

**What it tested:** the three url properties, which is the same question as
"what is a mountable application".

**The classic mistake:** building links from `req.url`, or matching on it
against the full public path. Inside a mount, `req.url` has already had the
mount path removed, so a redirect built from it drops the prefix and sends the
client to a 404. The mirror-image mistake is hard-coding `/api/v2` inside the
sub-app, which works perfectly until somebody mounts it somewhere else.

**Model answer:** `req.baseUrl` for where I am, `req.originalUrl` for what was
asked, `req.url` for what is left to route — and middleware registered on the
sub-app rather than the parent when the intent is "only inside this mount".

## ex6 — three lifetimes

**What it tested:** knowing which of `app.set`, `app.locals` and `res.locals`
outlives what, and that two of express's settings are read at router build time.

**The classic mistake:** the one this exercise is really about — putting
per-request state on the app. `app.locals.tenant = ...` in a middleware works
flawlessly for one user at a time and silently serves the wrong tenant's data
the moment two requests overlap, which is exactly the load a test suite never
produces. Second place: calling `app.set("strict routing", true)` after the
routes are registered, where it changes nothing at all.

**Model answer:** settings first, `app.locals` for what the process knows,
`res.locals` for what this response knows, and `app.get(name)` to read a setting
back — the one-argument form of the same function that registers routes.

## ex7 — routes as data

**What it tested:** whether you can see the shape five hand-written routes have
in common and lift it into a function, without the resource name leaking into
seventeen places.

**The classic mistake:** hoisting anything — the router, the store, an id
counter — out of the function and into module scope, so the second resource
shares the first one's state. Close behind: building the `Location` header from
`req.url` or from a hard-coded string, so mounting the same code at a different
name produces links that 404.

**Model answer:** a fresh `express.Router()` per call, routes written as `"/"`
and `"/:id"`, `app.use("/" + spec.name, router)` for the one place the name
appears, and every handler closing over the `store` it was given.

## ex8 — the code express refuses to guess

**What it tested:** that express matches path and method together, so "wrong
method" and "no such path" are indistinguishable to it — and that you can
recover the distinction by declaring it.

**The classic mistake:** writing the 405 check as a global `app.use` that tries
to work out whether the path exists, usually by re-matching patterns by hand.
That is a router reimplemented badly. The other one is an `Allow` header that
lists only the methods you registered: `OPTIONS` and `HEAD` are supported
whether you wrote them or not, and a client that trusts your header will not
send them.

**Model answer:** one `app.all(path, ...)` per path, registered after that
path's real methods, so express's own ordering does the matching; `OPTIONS`
answered with `204` and the header rather than refused; and a final `app.use`
that now means precisely "no path matched".

## Further reading

- [Express: Routing](https://expressjs.com/en/guide/routing.html) — `app.route()`, route parameters, and handler chains.
- [Express 5 API: `app.param()`](https://expressjs.com/en/5x/api.html#app.param) — the callback, when it fires, and how often.
- [Express 5 API: `express.Router()`](https://expressjs.com/en/5x/api.html#express.router) — `mergeParams`, `strict` and `caseSensitive`.
- [Express 5 API: application settings](https://expressjs.com/en/5x/api.html#app.set) — including `"strict routing"` and `"case sensitive routing"`, and `app.locals` next to `res.locals`.
- [MDN: 405 Method Not Allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/405) — and the `Allow` header it is required to carry.
