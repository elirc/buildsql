# Reading - dotnet/d21_authorization_policies

## Notes

By the time any of this runs, the token is already valid - d20 dealt with that.
This set is about the **policy**: the object that turns a valid identity into a
yes or a no, and where that object lives.

The model has four pieces, and knowing which is which is most of the skill.

- A **policy** is a named bundle of requirements. Every requirement in it must
  be satisfied, so a policy is an **AND**.
- A **requirement** is a marker: a small object saying what has to hold. It
  contains data (`MinimumGradeRequirement.Grade`), never logic.
- A **handler** decides one requirement. Several handlers may look at the same
  requirement, and it is satisfied when **any** of them succeeds - so a
  requirement is an **OR** over its handlers.
- **`context.Fail()`** is a veto. It is not the opposite of `Succeed`; silence
  is. Fail overrides every success, from any handler, in any order.

Two more distinctions the set drills. A requirement that needs the *request* -
a route value, a query string - reaches it through
`AuthorizationHandlerContext.Resource`, which in an endpoint-routing application
is the `HttpContext`. And a requirement that needs the *thing being acted on* -
this shift, this document - cannot run at the endpoint at all, because the
resource has not been loaded yet; that is what `IAuthorizationService.AuthorizeAsync(user,
resource, policy)` inside the handler is for.

Finally: 401 and 403 are produced by the policy, not by you. A refused policy
answers 403 when the caller authenticated and 401 when they did not, and a
handler that returns `Unauthorized()` from inside an endpoint is nearly always
wrong.

## ex1

What this was really testing: the difference between "has a token" and "meets
the requirement". `RequireAuthenticatedUser()` asks only the first, and it is
the line people leave a policy at because it makes the 401 work and the endpoint
stop being open.

The token in the gate is genuine and belongs to somebody real at head office who
has no ward. Nothing about it is suspicious; it simply does not describe
somebody who should be reading a ward roster. `RequireClaim(ward)` is the whole
fix, and it asks for presence rather than a value - which is what you want when
any ward will do.

The model answer's reasoning: write down the requirement the business actually
has, not the one that makes the endpoint compile.

## ex2

What this was really testing: a requirement about the **request**, and the
difference between AND and OR in policy-speak.

Two `RequireX` calls are an AND, and the rule here is an OR - your own ward *or*
being the charge nurse - so it is one `RequireAssertion` rather than two
requirements. That is the shape people get backwards, and the symptom is a
charge nurse who can only see her own ward.

The other half is reaching the route value. Authorization runs inside the
endpoint pipeline, so `context.Resource` is the `HttpContext`, and
`Request.RouteValues["ward"]` is there for the reading. The classic mistake is
to give up and do the check in the handler instead - which works, and moves the
rule out of the place where it can be reused, audited and applied to a group.

## ex3

What this was really testing: writing a handler, and specifically that the
requirement holds the **data** and the handler holds the **logic**. The bound
comes from `requirement.Grade`, so the same handler serves a policy that wants 5
and one that wants 8.

The shipped handler calls `Succeed` unconditionally, which is exactly the state a
half-finished handler is left in - and it is worse than no policy at all,
because the endpoint now looks protected.

Two details the gate pins. A caller with no grade claim must fail:
`D21Claims.GradeOf` returns 0 for that, so it needs no special case, which is
the point of reading a claim through one helper. And exactly 5 must pass -
"minimum" is inclusive, and off-by-one on an authorization bound is a bug you
find in production.

Note what the handler does *not* do: it never calls `Fail`. Not succeeding says
"I am not a reason to allow this"; failing says "nobody may allow this", and
those are very different claims. ex7 is the case where the second one is right.

## ex4

What this was really testing: that a requirement is an OR over its handlers.
Two ways to be a ward lead, two handlers, both registered against
`IAuthorizationHandler`, and the requirement is met as soon as either succeeds.

The classic mistake is to put the second condition inside the first handler with
an `||`. It works, and it means every new way of being a ward lead edits the
code that implements the old ones - so the file grows a chain of unrelated
business rules and nobody dares touch it. Separate handlers can be added,
removed and tested independently, and the one that comes from a different team
does not have to be merged into yours.

Worth knowing: handlers are resolved from DI, so they can take dependencies -
a database, an options object, a clock - which is the other reason not to
collapse them into assertions.

## ex5

What this was really testing: resource-based authorization, which is the case an
endpoint-level policy structurally cannot handle. "May this caller edit **this**
shift" needs the shift, and the shift is not loaded until the handler runs.

The shape is `AuthorizationHandler<TRequirement, TResource>` - three parameters
instead of two - plus an explicit
`IAuthorizationService.AuthorizeAsync(user, resource, policyName)` call inside
the endpoint. Applying that policy with `RequireAuthorization` would silently
never succeed, because the middleware passes the `HttpContext` as the resource
and the typed handler would not match.

The ordering is the other half. 404 first, because there is nothing to authorize
against; then authorization; then validation - so a caller with no rights is not
told which of their fields were malformed. The gate checks that with a request
that is both unauthorized and invalid.

## ex6

What this was really testing: where a policy is applied. Per-endpoint
`RequireAuthorization` is correct on the day it is written and wrong on the day
somebody adds the ninth endpoint and forgets - and the failure is silent, wide
open, and invisible in review because the surrounding lines all look right.

A policy on the group is a property of the group: every endpoint added under it
is protected the moment it exists. The same argument scales up to
`AddAuthorization(options => options.FallbackPolicy = ...)`, which makes the
whole application authenticated by default and turns forgetting into an
`AllowAnonymous` you have to write on purpose.

## ex7

What this was really testing: `context.Fail()`, and the fact that it is not the
opposite of `Succeed`.

Handlers only ever *add* reasons to allow something. Not succeeding is neutral;
it declines to be such a reason. So a lock handler that quietly says nothing
cannot stop the charge nurse, whose handler has already succeeded on the very
same requirement - and the gate proves it with exactly that request.

`Fail()` is the veto, and it wins unconditionally: order does not matter, and no
later success can undo it. That is what makes it the right tool for a rule that
must hold for everybody - a locked record, a suspended account, a legal hold -
and the wrong tool for "I have nothing to say about this caller".

Worth knowing: `AuthorizationOptions.InvokeHandlersAfterFailure` defaults to
true, so every handler still runs after a failure. That matters when handlers
have side effects like auditing, and it is why `Fail` must be a decision rather
than an early exit.

## ex8

What this was really testing: composition, and the trap this whole part of the
track keeps returning to.

The policy is an AND of two things a token either says or does not -
`RequireClaim` for one, a one-line `RequireAssertion` for the other. No handler
is needed: a rule that depends only on the caller's own claims and on nothing
else does not need the machinery, and reaching for `IAuthorizationRequirement`
when a lambda will do is how policy files become unreadable.

And the trap: `NewShift.Ward` is ignored. The policy has just insisted the
caller has a ward claim, and that claim is the ward the shift goes on. Taking it
from the body would let a senior nurse on cardio place shifts on neuro - which
is not a rule anybody wrote down, and would be the only place in the system
where the ward claim did not mean what it says.

## Further reading

- [Policy-based authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) - requirements, handlers, `Succeed`, `Fail`, and multiple handlers per requirement.
- [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased) - `AuthorizationHandler<TRequirement, TResource>` and `IAuthorizationService`.
- [Claims-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims) - `RequireClaim` and what a claim requirement actually asks.
- [Simple authorization and RequireAuthorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/simple) - applying policies to endpoints and to route groups.
- [Route groups in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/route-handlers#route-groups) - why metadata on a group is inherited by everything in it.
- [Differentiate 401 from 403](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction) - what the authorization middleware emits, and when.
