## Hint 1

Three rules, tried in order, and the order is the exercise:

1. an error you built deliberately - it has a numeric `status` and a string
   `code` - answers with all three of its own values;
2. an error from the system - a `code` like `ECONNREFUSED` or `ENOENT` -
   becomes a 502 with a *generic* message;
3. anything else is a 500 with a fixed body.

And before all of them: if it is not an `Error` at all, it is rule 3.

## Hint 2

Rule 2 is where the security lives. The real message is
`connect ECONNREFUSED 10.0.0.7:5432` - an internal host and port, handed
straight to whoever made the request. A database error can contain the
connection string, an ORM error can contain the SQL and its parameters. So a
system error keeps its status mapping and loses its message.

Recognising a system code: a string of capitals starting with `E`. A regular
expression is the compact way (`/^E[A-Z]+$/`), and the same test appears in
i1 ex3.

## Hint 3

```ts
if (!(error instanceof Error)) return INTERNAL;
const candidate = error as Error & { status?: unknown; code?: unknown };

if (typeof candidate.status === "number" && typeof candidate.code === "string") {
  return { status: candidate.status, body: { error: /* ? */, message: /* ? */ } };
}
```

Two decisions left: the two values in that first branch, and where the generic
500 lives (defining it once as a constant means the two paths that produce it
cannot drift apart). The follow-up an interviewer asks next: what do you log?
The real error, with its stack, and the request id you sent back - so the
generic message the client sees can still be traced to the exact failure.
