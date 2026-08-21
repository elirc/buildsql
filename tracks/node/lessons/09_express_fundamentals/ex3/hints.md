## Hint 1

A middleware is a handler with a third parameter: `(req, res, next)`. It can
read the request, add to it, set response headers, and then either call
`next()` to pass control on, or send a response and *not* call `next()`.

You need three of them:

- one registered with `app.use(...)`, so it runs for every request;
- one registered as an extra argument on the `/trail` route;
- one guarding `/admin`.

## Hint 2

`res.locals` is the per-request scratchpad express gives you - a plain object
that lives as long as the response. Start the trail there in the app-level
middleware, push to it in the route middleware, push again in the handler, and
send it.

Registering a route middleware is just an extra argument before the handler:

```ts
app.get("/trail", markRoute, (req, res) => { ... });
```

The header must appear even on a 404, which only happens if the middleware is
`app.use(...)` and registered **before** the routes. Express runs the stack in
registration order; anything registered after the routes only runs on the way
out.

## Hint 3

The guard:

```ts
const requireApiKey = (req, res, next) => {
  if (req.headers["x-api-key"] !== "let-me-in") {
    res.status(401).json({ error: "unauthorized" });
    return;                 // <- and this is the whole exercise
  }
  next();
};
```

Two decisions left: what the app-level middleware puts in the header, and what
happens after you send the 401. Sending a response *and* calling `next()` is
the classic middleware bug - the handler then runs anyway and tries to send a
second response, and express reports "Cannot set headers after they are sent".
The gate checks the 401 body specifically to catch it.
