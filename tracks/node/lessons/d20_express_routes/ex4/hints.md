## Hint 1

Express has three different "carry on" signals and they go three different
distances:

- `next()` — the next handler **in this route**;
- `next("route")` — skip the rest of this route, try the next **route** that
  matches the path;
- `next(err)` — skip everything until an error handler.

## Hint 2

Register the two routes on the same path, in order. The first one is
`app.get(path, guard, handler)`; the guard decides. `next("route")` is the
literal string `"route"` — passing anything else is an error, which is exactly
the confusion this exercise exists to clear up.

Keep the trail on `req`, not in a variable in `createApp()`: the gate makes
several requests to the same app and a shared array would accumulate across all
of them.
