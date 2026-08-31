## Hint 1

Express matches on path **and** method together. A `DELETE /notes` when only
`GET` and `POST` are registered does not "match `/notes` with the wrong method"
— it matches nothing, and falls through to the 404 like any unknown path. There
is no hook that tells you the difference, so you have to build the knowledge in.

## Hint 2

`app.all(path, handler)` matches that path with **any** method. Register one
after the real methods for that path:

```
app.get("/notes", list);
app.post("/notes", create);
app.all("/notes", methodNotAllowed);   // only reached by the others
```

Express tries registrations in order, so anything that matched above never
arrives here. Everything that does arrive is, by construction, a known path with
an unsupported method.

The final `app.use()` at the bottom then means exactly one thing: no path
matched. That is your 404.

## Hint 3

Three details the gate is strict about.

`Allow` is a sorted, comma-separated list, and it advertises more than you
registered: `OPTIONS` always, and `HEAD` whenever `GET` is there — because
express answers HEAD from the GET handler, so the path really does support it.

`OPTIONS` is a question, not a refusal: answer `204` with the header rather than
`405`. And `HEAD` must reach the real GET handler, which it will, as long as
your `app.all` sits after it.

What is left to you is where the method list should live. Writing it twice —
once as routes, once as data — is a bug waiting to happen the day somebody adds
a verb; a reviewer will want to see it derived from one source.
