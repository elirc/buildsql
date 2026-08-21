## Hint 1

Express tells an error handler apart from ordinary middleware by counting
parameters: **four** means error handler.

```ts
app.use((error, req, res, next) => { ... });
```

It must be registered **last**, after every route, because express only
reaches it by skipping forward from wherever the error happened.

Getting there happens two ways: `throw` inside a handler (express catches
synchronous throws for you), or `next(error)` from anywhere.

## Hint 2

The handler branches on what kind of error arrived:

- an `AppError` is one you produced deliberately - it already carries the
  status the client should see, a code, and a message that is safe to show.
  Use all three.
- anything else is a bug or an unknown failure. **Log it** (that is what the
  `logError` argument is for) and answer 500 with a fixed, generic body. Never
  send `error.message` from an unknown error: the `/boom` route throws one
  with a database URL and a password in it, which is exactly how credentials
  end up in a client-side error toast.

For the unmatched-path case, register a middleware after your routes that
calls `next(new AppError(404, ...))`, so 404s use the same JSON shape as
everything else.

## Hint 3

```ts
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(/* which status? */).json({ error: /* ? */, message: /* ? */ });
    return;
  }
  logError(error);
  res.status(500).json({ error: "internal_error", message: "internal server error" });
});
```

Two decisions left: the three values from the `AppError`, and where the
`logError` call goes. Note it is only on the unknown branch - a 404 is not a
defect and logging one as an error is how a log becomes noise nobody reads.
The `_next` parameter is unused and must still be declared: remove it and
express sees a three-argument function and treats it as ordinary middleware,
which is the single most confusing failure in express error handling.
