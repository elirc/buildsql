## Hint 1

Two routes and a fallback, in that order. The data can be a plain array
seeded from `SEED` (copy it - mutating the exported constant would leak state
between apps), or your ex1 store copied into this file. Either is fine; the
gate only talks HTTP.

Write `GET /tasks/:id` first: find, 404 if missing, `res.json` if found. Then
the collection, which has the interesting part.

## Hint 2

The collection response is an *envelope*: `{ items, total }` rather than a
bare array. Two reasons, and both come up in code review. It leaves room to
add pagination fields later without breaking clients, and it is not a
top-level JSON array, which used to be an XSS vector and is still a habit
worth keeping.

`?status=` needs validating against the allowed set before you use it.
Remember `req.query.status` is `string | string[] | undefined`, so check
`typeof status === "string"` before comparing, and answer 400 with the exact
body the gate asks for when it is not one of the three.

## Hint 3

```ts
app.get("/tasks", (req, res) => {
  const status = req.query.status;
  if (status !== undefined && /* not an allowed status? */) {
    res.status(400).json({ error: "invalid_status", message: /* ? */ });
    return;
  }
  const items = /* all of them, or the filtered ones */;
  res.json({ items, total: /* which length? */ });
});
```

Two decisions left: the validation test, and where the final "no such route"
middleware goes. It must be registered *after* both routes - a catch-all
registered first answers everything, which is a mistake that produces a
gloriously confusing "all my routes 404" bug.
