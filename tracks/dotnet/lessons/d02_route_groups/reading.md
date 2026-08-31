# Reading - dotnet/d02_route_groups

## Notes

A route group is two things at once, and keeping them apart is most of this
lesson. It is a **prefix** — `MapGroup("/d02/recipes")` means every endpoint
below it starts there — and it is a **place to hang conventions**: filters,
metadata, authorization, anything that applies to a set of endpoints rather than
to one.

The prefix half is mechanical. The convention half is where the design payoff
is: a rule written on a group applies to endpoints that do not exist yet. That
is the difference between security (or validation, or versioning) that is
opt-out and security that is opt-in, and opt-in is the one that eventually ships
with a hole in it.

Endpoint filters are the mechanism, and they compose like an onion:
group filters wrap endpoint filters, outer groups wrap inner groups, and within
one builder the first filter added is the outermost. Every filter gets to act on
the way in, on the way out, or both — and any of them can decline to call `next`
and become the response.

## ex1

Really testing one thing: the group root is `""`, not the prefix again. Writing
`group.MapGet("/recipes", …)` inside a group that already says `/recipes` gives
you `/d02/recipes/recipes` and a 404 that looks like the group did not work. The
model answer maps `""` and `"/{id:int}"`, and the prefix appears exactly once, in
exactly one place — which is the reason to use a group at all.

## ex2

Nesting concatenates, and nothing else. `MapGroup` on a group returns another
group whose prefix is the parent's plus its own, so three levels give you three
segments. The classic mistake is hanging the inner group off `app` out of habit,
which still compiles, still maps, and quietly produces `/d02/recipes/count`
instead of `/d02/admin/recipes/count`.

The other check is worth noticing: `/d02/admin/recipes` is a 404 because nothing
is mapped there. A group is a prefix, not a resource — it never answers on its
own.

## ex3

A group prefix is a route template like any other, so it can carry parameters,
and those parameters bind into every handler underneath by name. This is the
tidy way to express a nested resource: say `{course}` once, and every endpoint
below is scoped to it.

The model answer's reasoning: the same route value has to *narrow* both
endpoints, so both handlers take `string course` and neither has to know it came
from a group. The classic mistake is reading it out of `HttpContext.RouteValues`
by hand, which works and throws away the binding, the nullability and the
compiler's help.

## ex4

The drill is the shape of a guard: read something, decide, and either return
your own result or `await next(context)`. Returning a result *without* awaiting
`next` is what short-circuiting means, and the gate checks the body is empty
precisely because "set the status and carry on anyway" is the classic mistake —
the work you were trying to prevent still happens.

The reason this belongs on the group is the sentence in the failure message: the
next endpoint someone adds is guarded by default. Per-endpoint guards are one
forgotten line away from a hole.

## ex5

`EndpointFilterInvocationContext.GetArgument<T>(index)` gives a filter the
arguments the handler is about to receive, already bound and converted. That is
what makes filters a validation layer rather than a header-inspection layer: you
can reject `id = 101` without re-parsing the URL.

The status code is the teaching point. A route constraint could have kept 101
out, but it would have produced a 404 — "no such endpoint" — when what you mean
is "that id is out of range", which is a 400. Choose the layer by the answer you
want to give.

Positional arguments are the sharp edge: `GetArgument<T>(0)` is a promise about
the handler's signature that the compiler cannot check, so a reordered parameter
list breaks the filter silently. In a larger codebase, prefer reading the route
value or using a filter factory that inspects the method's parameters.

## ex6

The ordering rules, stated once and worth memorising: **group filters run
outside endpoint filters**, an **outer group runs outside an inner group**, and
within one builder **the first filter added is the outermost**. So marks appear
in the order you added them and unwind in reverse — `a>,b>,c>,handler,c<,b<,a<`.

The classic mistake is assuming the last one added wins, by analogy with
`services.Add…` replacements. Filters do not replace each other; they nest.

The practical consequence: put the things that must always happen — correlation
ids, exception handling, timing — outermost, because a filter that returns early
takes every filter inside it with it.

## ex7

A filter sees the handler's return value as `object?` and may return something
else, which makes response shaping a cross-cutting concern rather than eight
copies of the same wrapper. This is how envelopes, HATEOAS links and
compatibility shims get added to an existing API without touching a handler.

The model answer's important line is the `is List<string>` test. A filter that
wraps *everything* it sees also wraps the 400s, the 404s and the health check,
and every one of those is a client-visible break. Narrow what you transform, and
pass the rest through by returning the object you were given.

## ex8

Everything at once: two nested groups, a filter on each, a parameterised inner
prefix, and a route value that has to narrow the data rather than decorate the
URL.

The check that matters is the last one. When the outer filter returns without
awaiting `next`, the inner filter never runs — proved here by the absent
`X-Kitchen-Checked` header. That is the property you rely on when you put
authentication outermost: everything inside it is unreachable to an
unauthenticated caller, including code written next year by someone who never
read this file.

The other judgement call is the 404 for recipe 1 in the south kitchen. It exists,
but not *here*, and answering 404 rather than 403 avoids telling a caller that a
resource they may not see exists — the same reasoning that makes per-user
filtering a 404 rather than a leak.

## Further reading

- [Route groups in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/route-handlers#route-groups) — `MapGroup`, nesting, and what a group does to metadata.
- [Filters in minimal API apps](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters) — `IEndpointFilter`, `EndpointFilterInvocationContext`, short-circuiting and ordering.
- [Routing in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing) — how prefixes and templates combine into the route table.
- [Parameter binding in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding) — why a group's route parameter binds into a handler by name.
