## Hint 1

Three storage places, three lifetimes:

- `app.set(name, value)` / `app.get(name)` — express **settings**. Some of them,
  including `"strict routing"` and `"case sensitive routing"`, change how the
  router matches paths.
- `app.locals` — your values, application-wide, alive for the whole process.
- `res.locals` — your values, alive for exactly one response.

## Hint 2

The settings have to be applied **before** the routes are registered. Express
reads them when it lazily builds the router, so an `app.set("strict routing",
true)` underneath your `app.get(...)` calls is a line that does nothing and
looks like it works.

`app.get` is two functions wearing one name: with a path and a handler it
registers a route, with a single string it reads a setting back. That is not a
trick question — it is the API, and knowing it is the exercise.

Anything that differs per request belongs in `res.locals` (or on `req`). The
moment it goes in `app.locals` it is shared by every user on the server at once.
