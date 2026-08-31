## Hint 1

`app.param(name, callback)` registers a callback for a **route parameter**, not
for a path. It gets `(req, res, next, value)` and express runs it once per
request, before any handler of any route whose path contains `:name` — and never
for a route that does not.

## Hint 2

That "and never for a route that does not" is what makes it different from
`app.use()`. A middleware mounted at `/notes` would also run for
`GET /notes` itself; the param callback only fires when there is an `:id` to
load. The gate proves this by counting.

The callback owns the failure case: if the note is missing it *responds* rather
than calling `next()`, and every route underneath is spared the check. Put what
you loaded on `req` (a property of your own naming) so the handlers can read it.

TypeScript will want an interface extending `Request` with your extra property
— an `interface LoadedRequest extends Request { note?: Note }` and a cast at the
handlers is the cheapest way through.
