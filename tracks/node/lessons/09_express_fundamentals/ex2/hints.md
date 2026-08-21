## Hint 1

Two routes. `/orders/:id` reads `req.params.id` - always a string, because a
URL has no types. `/orders` reads `req.query.limit`, which is `undefined` when
the parameter is absent and a string when it is present.

Both routes have a failure case, and both failure cases are the client's
fault, so both are 4xx with a JSON body rather than an exception.

## Hint 2

The lookup:

```ts
const order = ORDERS.find((candidate) => candidate.id === req.params.id);
if (order === undefined) {
  res.status(404).json({ error: "not found" });
  return;
}
res.json(order);
```

`res.status(code).json(body)` is the chainable form, and the `return` after it
matters exactly as much as it did in lesson 08 - express will happily let you
try to send a second response and then throw.

For `limit`: absent means "no limit". Present means convert and validate.
`Number("abc")` is `NaN`, and `NaN` passes every `<` and `>` comparison you
might think to guard with, so check with `Number.isInteger` (or
`Number.isFinite`) rather than a comparison.

## Hint 3

```ts
const raw = req.query.limit;
if (raw === undefined) { /* everything */ }

const limit = Number(raw);
if (/* not a usable limit? */) {
  res.status(400).json({ error: "limit must be a positive number" });
  return;
}
res.json(ORDERS.slice(0, limit));
```

Two decisions left: the validity test, and the order of your two route
registrations. Express matches in registration order, and `/orders/:id` will
not match `/orders` - but if you ever add `/orders/summary` alongside
`/orders/:id`, the specific one has to be registered first or `:id` swallows
it. Worth knowing before it bites you.
