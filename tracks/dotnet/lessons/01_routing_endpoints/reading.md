# Reading - dotnet/01_routing_endpoints

Routing is the part of ASP.NET Core that decides *which of your methods runs*,
and it does a surprising amount of work before your code sees a request. This
page is about that work, and about the status codes you spent the lesson
choosing.

## Notes

**Two-phase routing.** ASP.NET Core matches in two steps. `UseRouting` (added
for you by `WebApplication`) looks at the incoming path and method, walks a
prebuilt tree of every route template in the app, and selects an `Endpoint` —
or none. Everything after that point in the pipeline can *see* which endpoint
was selected, which is how authorisation knows whether the target needs a
token before your handler runs. Then `UseEndpoints`, at the very end, actually
executes it. That gap between "we know where this is going" and "we go there"
is where middleware does its most useful work, and lesson 03 lives in it.

**Route constraints are matching, not validation.** `{id:int}` says the
template only matches when that segment parses as an integer. A request that
fails a constraint has not been rejected; it has simply not matched, and if no
other route matches either you get a 404. This is why `/l01/orders/banana` was
a 404 and not a 400 — and why constraints are a poor place to express business
rules. `{id:int:min(1)}` is fine because it is still a statement about the
shape of the URL. "Only ids belonging to this customer" is not, and belongs in
your handler where you can answer 403.

**Ambiguity and precedence.** Templates are scored, not tried in order:
literal segments beat parameters, and constrained parameters beat unconstrained
ones. So `/l01/orders/count` and `/l01/orders/{id:int}` can coexist and the
literal wins for `/l01/orders/count`. When two routes are genuinely equally
specific, the app throws an `AmbiguousMatchException` on that request rather
than picking silently — a loud failure you will meet the first time you map
`{id}` twice.

**PUT versus POST, and idempotency.** POST is not idempotent: send it twice,
get two orders. PUT is defined to be idempotent — sending the same PUT ten
times must leave the resource in the same state as sending it once — which is
why PUT usually takes the *whole* new representation and why the challenge's
PUT returns 204 rather than a body. This is one of the most common interview
questions on REST, and the interesting follow-up is "so how do you make a
create idempotent?" (an `Idempotency-Key` header the server remembers, or
letting the client choose the id and using PUT).

**204 is not 200 with an empty body.** A 204 tells the client, at the protocol
level, that there is no content and none is coming; it must not have a message
body at all. A 200 with a zero-length body says "here is your representation,
and it is empty", which is a different claim. Small distinction, but caches,
proxies and generated clients act on it.

## ex1 - the parameter, the constraint and the 404

The whole exercise is three lines, and the interesting one is the last:
returning `TypedResults.NotFound()` instead of `TypedResults.Ok(null)`. The
temptation to return 200-with-null is strong because it makes the handler's
type simpler, and it is always wrong. A 404 is a *fact about the world* — this
identifier names nothing — that the client can act on: stop retrying, show an
empty state, remove the stale link. A 200 with null forces every caller to
re-derive that fact from the body, and half of them will forget.

The other thing worth internalising is the difference between the two failures
the gate checks. `/l01/orders/99` reaches your handler, which decides there is
no such order: your 404. `/l01/orders/banana` never reaches your handler:
routing's 404. Same status, two entirely different code paths, and knowing
which one you are looking at is the difference between a five-minute and a
fifty-minute debugging session.

## ex2 - groups, and the shape of a resource

`MapGroup` looks like string concatenation and is not. A `RouteGroupBuilder` is
a real object that carries *conventions* down to its children: call
`group.RequireAuthorization()` and every endpoint in the group needs a token;
call `group.AddEndpointFilter<ValidationFilter>()` and every endpoint gets
validated. That is why grouping by resource rather than by verb is the
convention — the things you want to apply in bulk (auth, rate limits,
versioning, OpenAPI tags) are almost always per-resource.

The design decision hiding in this exercise is the 404 for an unknown
customer. A defensible alternative exists: if `/l01/customers/{name}/orders` is
read as "the collection of orders filtered by name", an unknown name is just an
empty collection, and 200 with `[]` is correct. The rule that settles it is
whether the URL names a *sub-resource of an entity that must exist*. Here it
does — there is no Zoe — so 404. If the route were `/l01/orders?customer=Zoe`,
the empty list would be right, because the collection exists and the filter
matched nothing. Being able to argue both sides of this is worth more in an
interview than knowing one answer.

## ex3 - 201, Location, and who chooses the initial state

Three separate ideas got compressed into one small handler.

The **201** says a resource came into existence. The **Location header** says
where, and it is not optional in spirit even though nothing enforces it: a
client that just created something needs a URL to fetch, update or delete it,
and if you do not give one it has to guess from your docs. In a real app you
would build that URL from the route name rather than a string literal —
`TypedResults.CreatedAtRoute("GetOrder", new { id })` — so that changing the
route template does not silently break every `Location` you emit.

The third idea is the one that becomes a security bug: **the client does not
choose the initial state.** You ignored any `status` in the request body and
wrote `"pending"` yourself. The general form of this rule is called
*mass assignment* — if you bind a request body straight onto your domain object
and save it, a caller can set `IsAdmin`, `Balance` or `Status` just by adding a
field to their JSON. Lesson 07 gives it its proper treatment (DTOs in, entities
out) and lesson 09 gates it. The habit starts here: enumerate the fields you
accept, do not accept the object.

## ex4 - optional parameters, and the difference between absent and wrong

`string? status` has three states and the exercise turns on all three: absent
(null, so no filter), valid, and present-but-nonsense. Collapsing the first and
third — treating an unknown status as "no filter" — produces the worst possible
API, one that answers 200 with plausible data to a request that made no sense.
Collapsing them the other way, and 400-ing on absence, breaks every caller who
wanted everything.

`Results<Ok<List<Order>>, BadRequest<string>>` is doing real work here, not
decoration. The compiler now refuses a `TypedResults.NotFound()` in this
method, because you did not promise one; and tooling can generate an OpenAPI
document that lists both a 200 and a 400 with their body types, from the
signature alone, without executing anything. The cost is that the signature
gets long, which is a fair trade at two outcomes and a bad one at five — the
challenge, with four, is written against plain `IResult` for exactly that
reason. Knowing where that line is, and being able to say why, is the answer
interviewers are listening for when they ask about `IResult` versus
`Results<>`.

## challenge - the order of the checks is the design

Reorder the four checks and you get four different APIs, most of them leaky.
Check the status value before the id, and `PUT /l01/orders/99/status` with a
typo answers 400 — hiding the fact that order 99 does not exist. Check the
cancelled state before the status value, and a nonsense status on a cancelled
order reports 409, telling the client the state is the problem when their
payload was garbage.

The rule that produces the ordering you were asked for: **check from the
outside in**. Does the thing exist (404)? Is the request well formed (400)? Does
the current state allow it (409)? Each layer only runs when the previous one
passed, so each answer is about exactly one problem. This is the same ordering
you will see in every mature API, and it is worth being able to justify out
loud.

The 409 itself is the piece most people have never used. Its definition — the
request conflicts with the current state of the target resource — covers
optimistic-concurrency failures (`If-Match` didn't match), duplicate creates,
and illegal state transitions like this one. Its cousin, 422 Unprocessable
Content, is for a request that is syntactically fine and semantically
impossible; teams argue about the boundary, and the useful position is that 400
is for "I could not parse or bind this", 422 for "I understood every field and
the combination is invalid", and 409 for "the problem is the resource, not your
payload".

## review1 - the same shape, unfamiliar data

Products are keyed by a string sku rather than an int id, which quietly removes
the `{id:int}` constraint and with it routing's free 404 for junk input. Nothing
breaks — every string is a valid sku as far as routing is concerned — but the
"does it exist" check in your handler is now the only line of defence, which is
the normal situation for anything keyed by a slug, a code or a username.

Sorting by `PriceCents` rather than by the key is the other half: the order of
a collection is part of your API's contract even when nobody wrote it down.
Return them in whatever order LINQ happened to produce and a client will build
a UI on it, and your next refactor will break them.

## Further reading

- [Routing in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing) — templates, constraints, precedence and the two-phase model.
- [Route constraint reference](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing#route-constraint-reference) — the full list, including `min`, `length`, `alpha` and `regex`.
- [Route groups in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/route-handlers#route-groups) — `MapGroup` and how conventions flow to children.
- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) — `TypedResults`, `Results<T1,T2>` unions and the full helper catalogue.
- [RFC 9110 §15 — HTTP status codes](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes) — the actual definitions of 201, 204, 400, 404 and 409, in the words that settle arguments.
