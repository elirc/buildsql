# Reading - node/11_rest_capstone

Assembling the pieces is its own skill. This page is about the decisions that
only show up once the pieces are together.

## Notes

**Layering is not ceremony.** Three layers — HTTP, validation, store — each
with one job and one direction of dependency. The store does not know it is
being served over HTTP; the routes do not know the store is an array. That is
what makes the store testable without a server, the routes testable with a
fake store, and the database swap a change in one file. When people say a
codebase is "hard to test", they almost always mean these layers are fused.

**REST, as much of it as matters.** Resources are nouns (`/tasks`), the method
is the verb, and the status code is the outcome. `GET` is safe (no side
effects) and idempotent; `PUT` and `DELETE` are idempotent (doing it twice
leaves the same state); `POST` is neither. Idempotency is not academic — it is
what decides whether a client may safely retry after a timeout, which is the
retry question from lesson 03 arriving in HTTP form.

**`PATCH` versus `PUT`.** `PUT` replaces the whole resource: fields you leave
out are cleared. `PATCH` is a partial update: fields you leave out are
untouched. Most APIs that say `PUT` mean `PATCH`, and the resulting "why did
my description disappear when I renamed it?" bug is common enough to be worth
naming. The distinction shows up in your schema: the create schema requires a
title, the patch schema requires nothing.

**Status codes are an API.** 201 with `Location` says "made it, here it is".
204 says "done, nothing to say" — and must have no body. 400 is "your request
is malformed", 404 "no such thing", 409 "that conflicts with the current
state", 422 "well-formed but semantically wrong" (some teams use it for
validation; 400 is also fine as long as you are consistent). 500 is "we broke,
it is not your fault". A client can be written against those; it cannot be
written against a 200 that sometimes contains `{"error": ...}`.

**Envelopes.** Returning `{ items, total }` rather than a bare array leaves
room to add `page`, `nextCursor` or `warnings` without breaking every client,
and it keeps the top level of the JSON an object. Consistency matters more
than the specific choice: pick a collection shape and use it everywhere.

**In-memory state is a teaching device.** It is genuinely fine for a cache, a
rate-limit counter or a test double, and genuinely wrong for anything that
must survive a restart or be shared between instances. The moment there are
two containers, module-level state is two different truths. Everything above
the store in this lesson would be unchanged by a real database; that is the
point of writing it this way.

## ex1 — the repository, and defensive copying

A repository is an object that owns a collection and exposes the operations
you are allowed to perform on it. The value is not the abstraction for its own
sake; it is that all the rules about the data live in one place — id
generation, defaults, what "update" means — so no route can invent its own.

The copy rule deserves its own paragraph because it is the one that gets
skipped. JavaScript objects are references. If `get` returns the internal
object, every caller holds a live handle to your state: a route that "just
tidies up the title before rendering" has silently written to your store, and
the change is invisible in a diff because there is no assignment to the store
anywhere. A shallow `{ ...task }` fixes it here; for nested data you need
`structuredClone` (built in since Node 17) or an immutable structure.

Two design notes worth carrying:

**`undefined` versus throwing.** The store returns `undefined` for "not
found", and the HTTP layer converts that to a 404. If the store threw a
`NotFoundError`, it would be making an HTTP decision from inside the data
layer — fine in a small app, and the reason "domain errors" tend to grow their
own hierarchy in a bigger one.

**The `update` semantics.** `if (patch.title !== undefined)` is the difference
between a partial update and an accidental erasure. A spread — `{ ...task,
...patch }` — looks equivalent and is not: an explicit `undefined` in the
patch overwrites the existing value. The distinction between "absent" and
"present but undefined" is a real and annoying part of JavaScript, and this is
where it bites.

## ex2 — reads, and the shape of a collection

The interesting decision here is answering 400 for `?status=elephant` rather
than an empty list. Both are defensible and one is better: an empty list tells
the client "there are no tasks with that status", which is false — there is no
such status. Silent coercion of bad input into a plausible answer is the
category of bug that ends with a user staring at an empty screen and a support
ticket that nobody can reproduce.

The catch-all 404 middleware has a placement rule with a memorable failure. It
matches every path, so registering it *before* your routes makes every route
unreachable, and the resulting "all my endpoints 404" is confusing exactly
because the routes look correct. Registration order is the configuration
(lesson 09), and this is the sharpest instance of it.

One thing this exercise does not do, and a production API would: pagination.
An endpoint that returns every row works until the table is big, at which
point it becomes both a performance problem and a memory problem — for you and
for the client. The lesson-09 challenge built the machinery; the rule is that
any collection endpoint whose size you do not control needs a default limit.

## ex3 — writes, and parsing as a security boundary

Three separate things are being taught, and the third one is the one worth
repeating at interview.

**Status codes for writes.** 201 plus `Location` for creation is the part
people forget: the client did not choose the id, so you have to tell it where
the thing now lives. 204 for delete means "no content" and Node will not let
you send a body with it.

**Partial updates.** The patch schema makes every field optional, and the
handler applies only what is present. That is the entire difference between
`PATCH` and `PUT`, expressed as two schemas.

**Mass assignment, and why stripping fixes it.** The gate patches with
`{"id":"hacked"}`. Nothing in the handler checks for it; the schema simply
never mentioned `id`, so zod removed it before the handler ran. Spread that
raw body into a database row instead and the client picks its own primary key
— or, in the classic version of this vulnerability, sets `"role": "admin"` on
a user-update endpoint. Rails had this exact bug famously in 2012; it recurs
in every ecosystem where objects are spread without being parsed. "Parse,
don't validate" is a security posture, not just a typing convenience.

## ex4 — the assembly, and the two things it adds

Everything in ex4 exists in an earlier lesson except the composition, and
composition is where two habits become visible.

**Routes throw, one handler answers.** Once errors go up rather than out, the
routes get shorter (a `find()` helper that throws is one line at the call
site), the error shape is uniform by construction, and adding a field to every
error response — a request id, a documentation URL, a trace id — is a change
in one function. The ordering detail the hint warns about is real: a
`ValidationError` extending `AppError` matches both `instanceof` checks, so
the specific branch must come first. That is a general rule for any
error-handling chain.

**Observability costs four lines.** A per-request id, set by the first
middleware, echoed on every response including errors, and logged with every
log line. When a user says "it failed at 14:32", an id in the error body turns
an archaeology exercise into a single log query. Real systems go further —
`traceparent` headers, OpenTelemetry spans, propagating the id to downstream
calls — but the first four lines deliver most of the value.

The natural interview follow-up to this exercise: "what would you add before
putting this in production?" A strong list: persistence, pagination and
limits, authentication and authorisation, request logging with the id, metrics
and health checks, graceful shutdown on `SIGTERM` (lesson 04), a body size
limit (lesson 08/10), CORS if browsers call it, and an OpenAPI description so
clients can be generated. Naming that list is often worth more than any single
implementation detail.

## Further reading

- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) — safe, idempotent, and what `PATCH` actually means.
- [MDN: 201 Created](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201) — and the `Location` header that belongs with it.
- [Express: routing and `app.route`](https://expressjs.com/en/guide/routing.html) — for organising the four handlers of a resource.
- [zod: object schemas](https://zod.dev/) — stripping, `.strict()`, `.partial()` and how the patch schema is usually derived from the create schema.
- [Node.js: `structuredClone()`](https://nodejs.org/api/globals.html#structuredclonevalue-options) — the deep-copy answer when a shallow spread is not enough.
