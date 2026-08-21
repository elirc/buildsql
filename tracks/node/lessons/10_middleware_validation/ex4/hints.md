## Hint 1

Three routes and one registration of the provided `errorHandler` at the
bottom. The whole exercise is about how an error gets from a route to that
handler, and there are two roads.

The first road is the one that changed in express 5: an `async` handler whose
promise rejects is forwarded automatically. You write the happy path and
nothing else - no `try`, no `catch`, no `next(error)`.

## Hint 2

```ts
app.get("/slow-dependency", async (_req, res) => {
  const prices = await fetchPrices();     // this rejects
  res.json(prices);                       // never runs
});
```

That is the entire handler. In express 4 the same code hangs the request
forever and prints an unhandled-rejection warning, which is why every 4.x
codebase has a `asyncHandler(fn)` wrapper or a `try`/`catch` in every route.

The second road is explicit: a middleware that calls `next(error)` instead of
`next()`. Express skips every remaining handler for that request and goes
straight to the error handlers.

## Hint 3

For `/queued`, register two functions on the same route:

```ts
app.get(
  "/queued",
  (_req, _res, next) => { next(/* what? */); },
  (_req, res) => { res.json({ queued: true }); },   // must NOT run
);
```

Two decisions left: what the first middleware passes to `next`, and where
`app.use(errorHandler)` goes. It has to be after every route - an error
handler registered before the routes is simply never reached, and it is worth
proving that to yourself by moving it up and rerunning the gate.
