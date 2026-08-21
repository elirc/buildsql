## Hint 1

This is assembly, not invention: every piece exists in a file you have already
written. What is new is that the routes stop answering errors themselves and
start *throwing* them, and one handler at the bottom turns every throw into a
response.

Build it in this order and run the gate after each step:

1. the request-id middleware, first in the stack;
2. `express.json()`;
3. the four routes from ex2 and ex3;
4. the "no such route" middleware;
5. the error handler, last.

## Hint 2

The shape that makes the routes short: a helper that finds a task or throws.

```ts
function find(tasks: Task[], id: string): Task {
  const task = tasks.find((candidate) => candidate.id === id);
  if (task === undefined) throw new AppError(404, "not_found", "no such task");
  return task;
}
```

Now `GET /tasks/:id` is one line, and the 404 rule lives in exactly one place.

Validation failures need a *different* body from other errors -
`{ error: "validation_failed", details: [...] }` rather than
`{ error, message }` - so either subclass `AppError` with the details attached
(the reference does this) or check for a `ZodError` in the handler. Both are
respectable; pick one and make the handler read cleanly.

## Hint 3

The error handler:

```ts
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (/* a validation failure? */) { /* 400 + details */ return; }
  if (error instanceof AppError) { /* its status, code and message */ return; }
  res.status(500).json({ error: "internal_error", message: "internal server error" });
});
```

Two decisions left: how you recognise a validation failure, and the order of
the branches (a subclass matches `instanceof AppError` too, so the specific
test has to come first - get this backwards and your details silently
disappear). Check the request-id header on an error response before you call
it done: it is set by the first middleware in the stack, so it should be there
whatever happens afterwards.
