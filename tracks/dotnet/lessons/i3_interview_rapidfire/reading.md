# Reading - dotnet/i3_interview_rapidfire

Short lesson, short reading. Each section is the one-paragraph version of the
answer you should be able to give without thinking, plus the follow-up that
comes after it.

## Notes

Spaced repetition works because forgetting is a schedule, not an event. You lose
most of a new fact within days unless it is recalled, and each successful recall
flattens the curve — which is why the review ladder in this dojo is 3, 7, 21 and
60 days rather than "whenever you feel like it". The important detail is that
*retrieval* is what strengthens the memory, not rereading: pulling an answer out
of an empty head is the exercise, and looking at the answer first skips it
entirely. That is why this lesson's five exercises are all review-marked and why
you should run them cold.

## ex1 - the three lifetimes, in one sentence each

Singleton: one instance for the life of the application, so it must be
thread-safe, and it must never hold anything shorter-lived. Scoped: one instance
per scope, which the framework creates per HTTP request, so it is the home for
anything belonging to "this request" — the `DbContext`, the current user, a
correlation id. Transient: a new instance every time anything resolves it, for
cheap stateless helpers, and never for anything that is supposed to accumulate.

The reason the endpoint resolves each service *twice* is that a lifetime has no
observable meaning inside a single resolution. Ask twice within one request and
across two requests, and the four combinations of same/different answer the
question completely. That two-line experiment is also how you find out what an
unfamiliar registration really is.

**↦ The follow-up:** *what happens if a singleton takes a scoped dependency?*
Captive dependency — the scoped instance outlives its request and every later
request sees stale, possibly someone else's, data. In Development the container
refuses to start; the transient-into-singleton version of the same bug starts
cleanly and is just as wrong.

## ex2 - order, in one sentence

The first middleware added is the outermost, so it sees the request first and
the response last; anything that must touch *every* request or response has to be
outside anything that can short-circuit one.

That single rule explains the canonical `Program.cs` ordering and every "why is
my middleware not running" question. Exception handling, correlation, logging and
metrics go near the top because they observe. CORS goes before authentication, or
a rejected preflight comes back without CORS headers and the browser blames the
wrong thing. Authentication goes before authorization, because you cannot decide
whether someone may do something before you know who they are.

**↦ The follow-up:** *what is the difference between `Use`, `Run` and `Map`?*
`Use` adds a link that may call `next`; `Run` adds a terminal with no `next`, so
anything after it is dead code; `Map` splits into a branch that never rejoins,
while `UseWhen` splits into one that does.

## ex3 - tracking, in one sentence

A tracked query snapshots every property, and `SaveChangesAsync` writes the
differences; `AsNoTracking` skips the snapshot, so any change you make afterwards
is invisible to the save — silently, with no exception and no log.

`changes == 0` is the tell, and it is the only one you get. This is the most
expensive quiet bug in EF Core, and the reason to have produced it deliberately
is that you will recognise "the edit didn't stick" instantly the next time you
hear it.

Use `AsNoTracking` for read-only queries, which is most of them; note that a
projection to a non-entity type is untracked anyway, so the flag matters mainly
when you are pulling back whole entities.

**↦ The follow-up:** *what is the identity map, and what does no-tracking do to
it?* Tracking keeps one object per primary key, so the same row appearing twice
in a result is the same instance; `AsNoTracking` materialises a separate object
each time, which costs memory and can leave you holding two divergent copies of
one row. `AsNoTrackingWithIdentityResolution` is the middle option.

## ex4 - the status codes, in one sentence each

**201** — I made something, and `Location` says where. **204** — done, and there
is deliberately no body. **400** — your request is wrong on its face; look at it
and try again. **409** — your request is fine and the current state forbids it;
you could not have known. **404** — nothing lives at this URL, which is also the
right answer when telling you it exists would itself be a leak.

The pair that gets confused is 400 and 409, and the test that separates them is
whether the answer depends on server state. A blank value is a 400 whatever is
in the database; a duplicate is a 409 because it is a fact about the collection,
and the same request might succeed tomorrow.

**↦ The follow-up:** *should DELETE be idempotent?* By the spec, DELETE is
idempotent — the end state is the same however many times you send it — which is
an argument for 204 every time. The counter-argument, and the choice this API
makes, is that "there is nothing here" is information the client can use. Either
is defensible; being inconsistent across your own resources is not.

## review1 - 401 versus 403, in one sentence

401 means *I do not know who you are* — authenticate and try again. 403 means
*I know exactly who you are and the answer is no*.

Neither status code is something you write. The authentication handler
challenges with 401 when there is no identity; the authorization middleware
forbids with 403 when there is one that fails the policy. Writing `if`s in the
handler to produce them means re-deriving that distinction per endpoint and
getting it wrong somewhere.

`AddAuthenticationSchemes` on the policy is the detail worth remembering in an
application with more than one scheme — which, once you have a public API and an
internal one, or a migration in progress, is most real applications.

**↦ The follow-up:** *when would you return 404 instead of 403?* When the
existence of the resource is itself privileged information. A 403 on someone
else's record confirms that the record exists, and an attacker can walk the id
space and map your data without reading any of it. GitHub returns 404 for private
repositories you cannot see, for exactly this reason.

## Further reading

- [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) — lifetimes, scopes and the request scope.
- [Middleware order](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/#middleware-order) — the canonical pipeline, and why each step sits where it does.
- [Tracking vs. no-tracking queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking) — snapshots, the identity map and when to turn tracking off.
- [RFC 9110 §15 — Status codes](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes) — the definitions of 201, 204, 400, 403, 404 and 409.
- [Introduction to authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction) — policies, roles, and where 401 and 403 come from.
