# Reading - dotnet/d20_auth_jwt

## Notes

A JWT is a signed statement by somebody else about who is calling. Everything in
this set follows from taking that sentence literally: **signed** (so the
signature must be checked), **by somebody else** (so the issuer must be one you
trust), **about who is calling** (so the claims are the only source of identity,
never the request body).

The four questions a bearer token has to answer before a single claim in it may
be believed:

1. Was it signed with a key I trust? (`ValidateIssuerSigningKey` +
   `IssuerSigningKey`)
2. Was it minted by an issuer I trust? (`ValidateIssuer` + `ValidIssuer`)
3. Was it minted **for me**? (`ValidateAudience` + `ValidAudience`)
4. Is it still in date? (`ValidateLifetime`)

Then the two distinctions that everything else in the set is built on.
**Authentication is not authorization**: 401 means "I do not know who you are",
403 means "I know, and no". And **403 is not always the right refusal**: when
the caller may not learn that a resource exists, a 404 is what they get, and it
has to be the same 404 an absent resource gets.

One mechanical note that matters throughout: this lesson registers a *named*
scheme, `d20-bearer`, rather than changing the application's default. Other
lessons in this track authenticate too, and a scheme that claims the default
would change how they behave.

## ex1

What this was really testing: that each validation parameter answers a different
question, and that turning them all off is a single-line mistake with four
separate consequences.

The shipped configuration is not fictional. `SignatureValidator` is the exact
hook people reach for when a signature check is failing and the deadline is
today - it replaces the whole verification with "parse it and trust it", and the
comment above it always says "temporary". The other three flags get switched off
one at a time for equally reasonable-sounding reasons.

Each one alone is a full compromise. No signature check: anyone can mint a token
saying whatever they like. No issuer check: any system that shares your signing
key - a sibling environment, a copied secret - can mint tokens for you. No
audience check: a *genuine* token issued for a different API can be replayed at
yours. No lifetime check: a token is a password that cannot be revoked.

The model answer's reasoning: turn every check on and give it the value it needs.
"Enabled" without a `ValidIssuer` fails closed, which is at least safe; enabled
with the wrong value fails everything, which is why the gate checks the happy
path too.

## ex2

What this was really testing: that the policy, not the handler, is the right
place for both refusals - and that they are different refusals.

401 means the request carried no usable identity: authenticate and try again.
403 means the identity is fine and does not permit this. The practical
consequence is in the client: an HTTP client that handles 401 by refreshing its
token and retrying will loop forever against an endpoint that answers 401 for
"not an admin".

The classic mistake is doing the role check in the handler and returning
`Unauthorized()` because that is the method whose name sounds right.
`Unauthorized()` is 401. The one that means "not allowed" is `Forbid()`.

The model answer's reasoning: the requirement is declarative, so declare it -
`RequireAuthorization(D20Policies.Keeper)` produces both statuses correctly with
no code in the handler at all.

## ex3

What this was really testing: that identity comes from the token and from
nowhere else. `NewEntry.Owner` exists purely as bait, and honouring it is a
one-line vulnerability that no amount of validation catches, because the value
is perfectly well-formed.

The classic mistake is to accept it "for flexibility, admins might need it" -
and then never gate that flexibility. The result is an endpoint where any caller
can create rows belonging to anyone, which reads as a feature in the code and as
a breach in the report.

The model answer's reasoning: `user.Identity?.Name` is the subject (because the
scheme sets `NameClaimType = "sub"`), the body's `Owner` is never read, and the
property is left in the DTO only so the gate can prove it is ignored.

## ex4

What this was really testing: that 403 leaks. A 403 on somebody else's entry
confirms that entry exists; a 404 does not. An attacker with one valid token can
walk the id space and map the size and shape of your data from the difference
alone - no exploit required, just arithmetic.

The rule: when the caller is not entitled to know a resource exists, "not yours"
and "not there" must be indistinguishable - same status, same body, ideally the
same timing.

The classic mistake is a helpful two-step: look it up, 404 if missing, then check
ownership and 403. Both branches read correctly and together they publish the id
space. The model answer collapses them into one condition so the two cases
cannot drift apart later.

The honest caveat: this is not universal. Inside a team's own admin tool, 403 is
more useful and nothing is leaked that the caller could not look up anyway. The
skill is knowing which of the two you are building.

## ex5

What this was really testing: that scopes are a vocabulary of whole words, and
that `Contains` on the raw claim is a privilege escalation.

The `scope` claim is one space-separated string - that is how OAuth 2.0 defines
it - so `"entries:read"` and `"entries:read entries:write"` are both single
claim values. `claim.Contains("entries:write")` is true for `"entries:writer"`,
for `"not-entries:write"`, and for anything else that happens to contain those
characters. Split on spaces and compare whole words; `D20Scopes.Has` is given so
the drill is about *using* it.

The other half is ordering. The scope check answers "is this operation permitted
at all", which is true or false before any particular entry is involved - so it
comes first, and a read-only token gets 403 whether or not the entry would have
been visible.

## ex6

What this was really testing: optional authentication, which needs a different
mechanism from everything else in the set. An endpoint with no
`RequireAuthorization` is never authenticated, so `ClaimsPrincipal` arrives
empty even when the request carried a perfectly good token.

`HttpContext.AuthenticateAsync(scheme)` runs the handler on demand and hands
back an `AuthenticateResult`. Two details matter. `Succeeded` has to be checked
- a forged or expired token produces a failed result, and reading `Principal`
without looking would treat it as anonymous at best and as authenticated at
worst. And the outcome is a *richer answer*, not a 401: the contract says this
resource is public, and the token only decides how much of it you see.

The classic mistake is to add `RequireAuthorization` and then special-case
anonymous callers, which cannot work - they never reach the handler.

## ex7

What this was really testing: putting the identity into the query rather than
into a check. `Where(e => keeper || e.Owner == name)` cannot return a row the
caller may not see; `load everything, then filter, then serialize` can, and does
the first time somebody adds a branch that returns early.

Two policies in one endpoint is the realistic shape: a *scope* decides whether
the operation is allowed at all, and a *role* decides how much of the data the
answer contains. Neither implies the other, which is why a write-only token is
refused a read.

The `X-Result-Scope` header is the small piece of honesty: a client that got two
rows does not otherwise know whether that is all of them or all of *its* ones.

## ex8

What this was really testing: the order of the checks, which is a security
property rather than a style preference.

What the token permits (403), then what it may see (404), then what it sent
(400). Running validation first tells a caller with no rights at all which of
their fields were malformed - a small oracle, and one that also means a
403-worthy request can produce a 400 and look like a client bug.

The last assertion is ex3's rule again, on the update path, and it is the one
that gets forgotten. Creation is where people remember to take the owner from
the token; replacement is where a mapper quietly copies every field of the DTO
onto the entity and hands the row to somebody else - or takes theirs.

## Further reading

- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/) - schemes, defaults, and what `AddAuthentication` actually registers.
- [Configure JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) - `TokenValidationParameters` and every flag in ex1.
- [Introduction to authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction) - policies, roles, and 401 against 403.
- [Claims-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims) - reading claims, and why scopes are not roles.
- [RFC 6749 section 3.3](https://www.rfc-editor.org/rfc/rfc6749#section-3.3) - the `scope` parameter as a space-delimited list.
- [Authorize with a specific scheme](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/limitingidentitybyscheme) - named schemes, and `AuthenticateAsync` for the ex6 case.
