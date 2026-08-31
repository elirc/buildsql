## Hint 1

`app.route(path)` returns a Route object whose `.get()`, `.put()` and
`.delete()` each return the same object, so they chain. The path string is
written once, which is the point: three `app.get("/notes/:id", ...)`-style
registrations are three chances to typo the path.

## Hint 2

The store lives in the closure `createApp()` returns, so each call to the
factory gets its own notes — that is what lets the gate run a fresh app per
test. Seed it with a **copy** (`SEED.map((note) => ({ ...note }))`), or the
first test to mutate a note changes the module-level array for every test after
it.

Two details the gate checks: `PUT` needs `express.json()` mounted before the
route or `req.body` is undefined, and a `204` must have no body at all —
`res.status(204).end()`, never `.json()`.
