## Hint 1

Three routes, and each one is the same three steps: parse the input, find the
row (or not), answer with the right status code.

Do not forget `app.use(express.json())` at the top, or `req.body` is
`undefined` and every schema fails with an unhelpful message about expecting
an object.

The schemas are provided. Note there are two of them: creating requires a
title, patching requires nothing at all - which is exactly what makes PATCH
different from PUT.

## Hint 2

The status codes carry meaning and the gate checks each one:

- **201** for a create, with a `Location` header pointing at the new resource
  (`/tasks/task-1`). The body is the created task, including the id the server
  chose.
- **200** for a successful patch, with the *new* value of the resource.
- **204** for a successful delete: no body at all (`res.status(204).end()`),
  because there is nothing left to describe.
- **404** when the id does not exist - for both patch and delete.

Since both write endpoints validate, a small helper that either returns the
parsed value or answers 400 and returns `null` will save you writing the same
eight lines twice.

## Hint 3

```ts
const input = parseOr400(createTaskSchema, req.body, res);
if (input === null) return;      // the helper already answered
```

Two decisions left. First, the order inside PATCH: validate before you look
the task up, or look it up first? Either passes the gate - but think about
which error a client would rather see when they send a bad body *and* a bad
id, and be able to defend your answer.

Second, the forged-id case. The gate patches with `{ id: "hacked" }` and
expects the id to be untouched. You do not need a check for it: the schema
does not mention `id`, so parsing removes it before your code runs. That is
"parse, don't validate" doing security work for free.
