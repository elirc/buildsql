# Reading - dotnet/d01_routing

## Notes

Every problem in this set is the same question asked eight ways: *what does the
route table do before your handler exists?* Routing runs first. It picks one
endpoint out of every candidate template, and by the time your code is called
the decision is already made — which is why so many "my endpoint is not being
hit" bugs are not bugs in the endpoint at all.

The two ideas that unify the set are **matching** and **precedence**.
Constraints, verbs, optional segments and catch-alls all change what a template
*matches*; when two templates match the same URL, precedence decides which one
wins, and it is never "whichever I wrote first". Keep those two words separate
in your head and the whole subsystem stops being mysterious.

The corollary worth memorising: a route constraint can only ever produce a
**404 or a 405**, never a 400. If your API needs to tell a client that a value
was the wrong shape, that is validation, and validation happens in the handler.

## ex1

What this was really testing: that a route parameter is *data* your handler
receives, and that a missing row is a 404 rather than a 200 carrying null. The
classic mistake is returning `Ok(stop)` unconditionally, which serialises
`null` and hands the client a 200 that means "not found" — a distinction no HTTP
client can recover. The model answer looks the stop up, and the `is null` branch
is the whole answer.

The second thing this drills is that `{id:int}` is not validation. `CEN` does
not produce a 400 and never reaches you; it simply fails to match the template,
and routing has nothing else to try, so it is a 404.

## ex2

Two route values, and both of them have to narrow the result — filtering by only
one is the classic mistake, because with this data it still returns something
plausible. The other half of the drill is the 404-versus-empty distinction: a
line the network does not run is a 404, and a line that runs but is quiet at
midday is a 200 with `[]`. Those are different claims about the world, and
clients branch on them.

`range(0,23)` is the model answer's third teaching point. Hour 24 is a 404
because the constraint is part of *matching*; wanting a 400 there means wanting
validation, which means an unconstrained `{hour:int}` and an explicit check.

## ex3

The verb is part of the route key, so `PUT /watch` and `DELETE /watch` are two
endpoints on one path. The payoff is what you get for free: because *something*
maps that path, an unmapped `POST` gets **405 Method Not Allowed** with an
`Allow` header, not a 404. The classic mistake is reaching for `MapMethods` or
`Map` to "handle everything and switch on the method", which throws that away
and makes your API answer 404 for a request that was merely addressed to the
wrong verb.

## ex4

`{day?}` makes the last segment optional, so one template matches two URLs, and
the absent value arrives as `null`. The model answer's first line is
`day ?? "weekday"` — resolve the default *once*, at the top, then work with a
non-null value. The classic mistake is scattering `day == null` checks through
the rest of the method and getting one of them wrong.

Note the deliberate contrast with ex2: `tuesday` is a 400, because your handler
received it and refused it, while hour 24 was a 404, because routing refused to
call you. Same "bad input", different layer, different code.

## ex5

`{**path}` is the catch-all, and it is the only route parameter that can contain
a `/`. The single-star form `{*path}` is the legacy spelling that does not
re-encode slashes on the way out; prefer the double star. The classic mistake is
`{path}`, which matches exactly one segment, so `a/b/c.png` 404s and the fix
looks like a data problem rather than a template problem.

Also worth keeping: a catch-all matches **zero** segments too, so the bare
prefix is a 200 with an empty string — which is why the model answer coalesces
to `""` before splitting rather than assuming a value is there.

## ex6

Precedence, stated once: routing scores each segment, and a **literal beats a
parameter**, which beats a catch-all. Registration order is not a tiebreaker,
which is why the exercise registers `{zone}` first and `all` still wins. The
classic mistake is believing order matters and "fixing" a precedence problem by
shuffling `MapGet` calls — it works by accident in frameworks that match
top-down, and teaches a rule that is false here.

The model answer's second decision is the 404 for zone `Z`: a zone with no stops
is not an empty zone, it is not a zone, and saying so with a 404 keeps the
resource model honest.

## ex7

`WithName` makes an endpoint *addressable*, and `LinkGenerator.GetPathByName`
turns a name plus values into a URL from the route table itself. The point is
not convenience, it is that the template becomes changeable: move
`/d01/routes/{id}` tomorrow and every generated link moves with it, while every
string you concatenated by hand quietly rots.

Two details in the model answer. Names must be unique across the whole
application — that is why this one is `d01-route` and not `route`. And `next` is
`null` on the last route rather than a link to a 404: absence of a link is how a
client learns it has reached the end, which is the whole idea behind hypermedia
controls, `Link` headers and the `next` field in every paged API you have used.

## ex8

Minimal APIs infer binding sources, and the inference is good enough that people
forget it exists — until a name does not line up. `q` in the URL and `term` in
C# are different names, so `[FromQuery(Name = "q")]` is the only thing that
connects them; without it the parameter silently binds to a query parameter
called `term` that nobody sends, and you get `null` and no error. Headers are
worse: they are *never* inferred, so `zone` binds from nothing at all unless you
write `[FromHeader]`.

The model answer's reasoning is "make every source explicit at the boundary".
The classic mistake is trusting the inference on a public API and discovering
the mismatch in production, where a silently-null filter looks like a data bug.

## Further reading

- [Routing in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing) — templates, constraints, precedence and URL generation, in one place.
- [Route constraint reference](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing#route-constraint-reference) — every built-in constraint, including `range`, `alpha` and `regex`.
- [Parameter binding in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding) — the inference rules and the `[From*]` attributes that override them.
- [Routing in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/routing) — route groups, named endpoints and `LinkGenerator`.
- [RFC 9110 §15.5.6 — 405 Method Not Allowed](https://www.rfc-editor.org/rfc/rfc9110.html#name-405-method-not-allowed) — what the status actually promises, and the `Allow` header it owes the client.
