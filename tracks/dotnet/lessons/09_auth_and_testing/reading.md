# Reading - dotnet/09_auth_and_testing

Security is the one area where a bug that never fires is still a bug, and where
"it works" and "it is correct" can be very far apart. This page is about the
mechanisms underneath the five exercises, and about the handful of decisions
that come up in every code review of a protected endpoint.

## Notes

**Schemes, handlers and the two middlewares.**
`AddAuthentication("Bearer").AddJwtBearer(...)` registers a *scheme*: a name plus
a handler that knows how to turn a request into a `ClaimsPrincipal`.
`UseAuthentication()` runs the default scheme's handler and assigns
`HttpContext.User`; it does not reject anything. `UseAuthorization()` looks at
the selected endpoint's metadata and, if it demands authorization, evaluates the
policy against `HttpContext.User` — challenging (401) when there is no identity
and forbidding (403) when there is one that fails. Both are added automatically
by `WebApplication` when the corresponding services are present, in that order,
after routing and before the endpoint. Authorization needs routing to have run
first, because until an endpoint is selected there is nothing to know the
requirements of.

**Claims are just key/value pairs.** A `ClaimsPrincipal` holds one or more
`ClaimsIdentity`, each holding claims. `user.Identity.Name` and
`user.IsInRole(...)` are conveniences over "find the claim whose type is the
configured name/role type" — which is why `NameClaimType` and `RoleClaimType`
matter, and why turning `MapInboundClaims` off (so `sub` stays `sub` instead of
becoming a long XML-schema URI) makes everything more legible.

**Roles versus policies versus resource-based checks.** Roles are coarse and
static (`admin`, `support`). Policies are named, composable rules evaluated
against the principal — claims, assertions, or custom requirements with
handlers — and are what you should reach for by default, because the rule lives
in one place. Neither can express "may this user edit *this note*", because that
depends on data the authorization system has not loaded. That is
**resource-based authorization**, and it either lives in your handler (as in the
challenge) or uses `IAuthorizationService.AuthorizeAsync(user, resource, policy)`
after you have fetched the resource.

**Access tokens are short-lived on purpose.** Validation is stateless, so there
is no list of revoked tokens to consult — a token is valid until `exp`. The
industry answer is a short-lived access token (minutes) plus a long-lived refresh
token held somewhere revocable, and a token-revocation list only for the cases
that truly need it. "How do you log someone out immediately?" is a favourite
follow-up; the honest answer is that with pure JWT you cannot, and that you
either accept the window or keep server-side state.

**Where the token lives in a browser matters.** `localStorage` is readable by any
script on the page, so one XSS is total account compromise. An `HttpOnly`,
`Secure`, `SameSite` cookie is not readable by script, but reintroduces CSRF,
which is why cookie auth needs antiforgery tokens and bearer auth does not. There
is no free option; there is only knowing which attack you have chosen to defend
against.

**CORS is not authorization.** `AddCors`/`UseCors` tells a *browser* which
origins may read a response. It stops nothing else — curl, a server, a mobile app
and a proxy all ignore it — and a permissive CORS policy is not a vulnerability
by itself, while a missing authorization check is. The classic mistake is
`AllowAnyOrigin()` together with credentials, which the spec forbids and the
runtime will refuse. `UseCors` also has to run before authentication, or a
browser preflight gets a 401 with no CORS headers on it and the browser reports a
CORS failure for what is really an auth ordering bug.

**HTTPS or nothing.** A bearer token in a header over plain HTTP is a password in
cleartext. `UseHttpsRedirection` and HSTS are the minimum, and in production TLS
usually terminates at the load balancer — in which case `UseForwardedHeaders`
matters so the app sees the real scheme and client IP.

## ex1 - each validation flag is an attack it stops

The four rejected tokens map one-to-one onto the four `Validate…` settings, and
it is worth being able to say what each one prevents.

**Signature** (`ValidateIssuerSigningKey`): without it, anyone can base64 a
payload saying `"role": "admin"` and be believed. The historic version of this
bug is the `alg: none` attack, where a library accepted a token that declared it
had no signature; modern libraries refuse, but the lesson is that the *token
says* which algorithm to use and you must not simply obey it.

**Lifetime** (`ValidateLifetime`): without it, a token leaked from a log file two
years ago still works. Note the default five minutes of clock skew, which is why
the gate expires its token by two hours rather than by one minute.

**Issuer** (`ValidateIssuer`): without it, any system sharing your signing key —
another service of yours, a partner, a test environment — can mint credentials
for production.

**Audience** (`ValidateAudience`): without it, a token your identity provider
issued for a *different* one of your APIs is accepted here. This is the one
people skip most often, and it is how privilege escalates sideways between
services.

The 500-before-401 detail is worth understanding too. `RequireAuthorization()`
adds metadata to the endpoint; `EndpointMiddleware` checks that some authorization
middleware actually ran, and throws if not. That is deliberate: silently serving
an endpoint you asked to protect would be far worse than a loud failure.

## ex2 - the framework produces both status codes

You wrote no status codes in this exercise, and that is the point. The
authentication handler's `ChallengeAsync` produces the 401 (with a
`WWW-Authenticate: Bearer` header saying how to authenticate); the authorization
middleware's `ForbidAsync` produces the 403. Handling these yourself with `if`s
in the handler means re-deriving, per endpoint, a distinction the framework
already models — and getting it wrong somewhere.

The naming really is unfortunate. 401 "Unauthorized" means *unauthenticated*; 403
"Forbidden" means *unauthorized*. Everyone gets this wrong once, and the way to
keep it straight is the sentence in the README: 401 says *try again with
credentials*, 403 says *credentials will not help*.

`AddAuthorizationBuilder().AddPolicy(name, …)` is the modern registration API.
The reason to name a policy rather than write `RequireRole("admin")` at each call
site is that "who may see reports" is a business rule that will change, and when
it does you want one edit and not a grep. It is also what lets a policy grow from
a role check to "role admin, or the support team during business hours" without
touching a single endpoint.

## ex3 - the filter has to come from the credential

`store.All().Where(n => n.Owner == user.Identity!.Name)` looks trivial, and the
class of bug it avoids is the most commonly exploited one in web APIs. OWASP
calls it **Broken Object Level Authorization**, and it is number one on their API
Security Top 10 for a reason: it is invisible in code review unless you are
looking for it, and every test that checks only status codes passes.

Three versions of the mistake, in increasing subtlety:

- Return everything. The endpoint is authenticated, so it *feels* protected.
- Filter by `?owner=ada` from the query string. Now the client picks, and
  `?owner=grace` works.
- Filter by an id taken from the request body or a header the client controls.
  Same bug, better disguised.

The rule: **anything that scopes data to a caller must come from the signed
token**, not from anywhere the caller can write. In a real codebase the more
robust version pushes it lower — an EF Core global query filter driven by the
current user, so that forgetting the `Where` is impossible rather than merely
discouraged.

The empty-list-and-200 case matters too: a caller with no notes has not failed at
anything, and 404 would be a lie about a collection that exists.

## ex4 - trust the token, never the payload

`NewNote.Owner` exists in this exercise purely to be ignored. That is the shape
of the real bug: a DTO acquires a field because some internal caller needed it,
and nobody notices that the field decides who owns the resulting row.

The general rule covers more than ownership. Any field that answers *who are
you*, *what may you do*, *what tier are you on*, *how much is this*, or *which
tenant is this* must be derived server-side, from the token or from your own
database. The request body is a statement of intent from an untrusted party.
"But our frontend always sends the right value" is not a control — the frontend
is not the only client, and anyone can send a request.

This is the same family as lesson 07's mass assignment, and the same defence
works: enumerate what you accept, and construct the entity yourself.

## challenge - when 404 is the right answer to "not allowed"

The instinct is 403, and for most resources 403 is right and friendlier. The
exception is when *the existence of the resource is itself privileged
information*, and then a 403 is an oracle: an attacker walks `/notes/1`,
`/notes/2`, `/notes/3` and learns exactly which ids exist and roughly how much
data you hold, without reading a single note. GitHub does this deliberately —
a private repository you cannot see returns 404, not 403 — and so does every
system where "does account X exist" is worth knowing.

So the test is: *would telling this caller "it exists but you may not have it"
give them something they should not have?* For a document in a shared workspace,
no — 403, and they can go and ask for access. For another tenant's record, yes —
404, always.

The other decision in the challenge is that validation comes first. Checking the
payload before the lookup means a malformed request gets the same answer whoever
sent it, which keeps the endpoint's behaviour explainable and avoids a subtler
oracle: if a blank body returned 400 for notes you own and 404 for notes you do
not, the *validation* would leak existence.

The admin override is deliberately a role check rather than a special case in the
ownership test, because it is exactly the kind of rule that grows. Today it is
`admin`; tomorrow it is `admin` or the note's workspace moderator, and at that
point the check wants to be a policy or an `IAuthorizationService` call against
the loaded resource rather than a boolean in a handler.

## Further reading

- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/) — schemes, handlers, and how `HttpContext.User` gets populated.
- [Introduction to authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction) — simple, role-based, claims-based and policy-based, with the differences spelled out.
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) — requirements, handlers, and `IAuthorizationService` for resource-based checks.
- [Integration tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests) — `WebApplicationFactory`, and the patterns behind this lesson's gate.
- [Enable CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors) — what CORS does and, more importantly, what it does not.
