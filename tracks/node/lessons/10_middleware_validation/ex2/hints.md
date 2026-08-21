## Hint 1

`validateBody` is a middleware *factory*: it takes a schema and returns a
middleware. The same shape as every configurable middleware in the ecosystem -
`cors(options)`, `express.json({ limit })`, `rateLimit({ max })`.

Inside the middleware there are exactly two outcomes: the body matches the
schema, in which case you replace `req.body` with the parsed value and call
`next()`, or it does not, in which case you answer 400 and stop.

## Hint 2

`schema.safeParse(value)` returns a discriminated union rather than throwing:

```ts
const result = schema.safeParse(req.body);
result.success;        // boolean - narrows the type of what follows
result.data;           // the parsed value, when success is true
result.error.issues;   // an array of problems, when it is false
```

Each issue has a `path` (an **array** of keys, because objects nest) and a
`message`. The gate wants `path` as a string, so join it with `"."`.

Note that zod reports *every* problem, not just the first. Passing them all
back is what lets a form highlight three fields at once instead of one per
round trip.

## Hint 3

```ts
const result = schema.safeParse(req.body);
if (!result.success) {
  res.status(400).json({
    error: "validation failed",
    details: result.error.issues.map((issue) => ({
      path: /* the array, as a string */,
      message: issue.message,
    })),
  });
  return;
}

req.body = /* which property? */;
next();
```

Two decisions left, and the second one is the point of the exercise. Assigning
the *parsed* value back means the handler downstream is working with data that
provably matches the schema - unknown keys stripped, types checked. Skipping
that line leaves the handler holding whatever the client sent, and the gate
notices, because the `extra` key survives.
