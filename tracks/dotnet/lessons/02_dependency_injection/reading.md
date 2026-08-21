# Reading - dotnet/02_dependency_injection

Dependency injection is two ideas wearing one name: *inversion of control*
(your class declares what it needs instead of constructing it) and a
*container* (something that knows how to build the graph). ASP.NET Core ships
with a container, wires it into everything, and asks you for exactly one
decision per registration — the lifetime. This page is mostly about that
decision.

## Notes

**What the container actually stores.** `IServiceCollection` is a list of
`ServiceDescriptor`s, and each one is a triple: the service type you ask for,
how to build it (a concrete type, a factory delegate, or an already-built
instance), and a lifetime. `builder.Build()` freezes that list into an
`IServiceProvider`, which compiles resolution plans for the graph. Two
consequences that catch people out: registering the same service type twice
does not replace anything — the *last* registration wins for a single
`GetService<T>` call, while `GetServices<T>` returns all of them in
registration order — and nothing is built at registration time, so a typo in a
factory delegate is a runtime failure.

**Scopes are not requests; requests happen to open scopes.**
`IServiceProvider.CreateScope()` makes a scope. ASP.NET Core calls it once per
HTTP request and disposes it when the response completes. Nothing else does.
In a `BackgroundService`, a message-queue consumer or a startup task, there is
no ambient scope, so injecting a scoped service into a singleton hosted service
is a genuine error — the fix is to inject `IServiceScopeFactory`, call
`CreateScope()` for each unit of work, and resolve inside it. That is one of
the highest-value things you can know about this container.

**Disposal is ownership.** The container disposes what it *created*, when the
scope that created it ends: scoped and transient services resolved from a
request scope are disposed with the request, singletons at application
shutdown. It does *not* dispose an instance you registered yourself with
`AddSingleton(new Thing())` — you gave it an object, so you kept the ownership.
And a transient `IDisposable` resolved from the root provider is held until the
application exits, which is a slow, real memory leak: transient plus disposable
plus long-lived scope is a combination to be suspicious of.

**Constructor injection is the norm; the alternatives are not.** Prefer
constructor parameters, because they make dependencies visible in the type and
impossible to forget. `[FromServices]` on a handler parameter (or just the bare
parameter, as in this lesson) is the minimal-API equivalent. Reaching for
`IServiceProvider` and calling `GetRequiredService` yourself — the *service
locator* pattern — hides the dependency from every caller and every test, and
is worth avoiding except in the handful of places (factories, background
scopes) where it is genuinely the only option.

**Keyed services, if you need to choose at runtime.** Since .NET 8,
`AddKeyedSingleton<IPaymentGateway, StripeGateway>("stripe")` plus
`[FromKeyedServices("stripe")]` lets several implementations of one interface
coexist and be picked by name. Useful and worth knowing exists; the
`IEnumerable<T>` approach from ex4 is still the right answer when you want
*all* of them rather than *one*.

## ex1 - a lifetime is only visible over time

The reason this exercise makes two requests is that a lifetime has no
observable meaning inside one. Ask the container for a service once, and
singleton, scoped and transient all give you an object; the difference only
exists in what happens *the next time you ask*, and where the boundary between
"times" falls.

The two `IIdGenerator` parameters are the sharpest version of that.
`GetTicket(ITicketSource, IIdGenerator, IIdGenerator)` resolves three services,
and the last two are the same service type resolved twice within one scope.
Transient hands back two objects; scoped or singleton would hand back one
object twice. If you ever want to know what a registration really is, that
one-line experiment answers it faster than reading the registration.

The classic mistake in the other direction is making everything transient
"to be safe". Transient is not safer; it is just more allocation, and it
silently breaks anything that was supposed to accumulate — a cache that is
rebuilt per resolution is not a cache, and a counter that resets is not a
counter.

## ex2 - what a scope is for

Scoped is the lifetime that has no equivalent in a console application, and it
exists because request handling has a natural unit of work. Everything touching
one request — the database context and its transaction, the identity of the
caller, a correlation id, an accumulated list of domain events — should be one
object for that request and gone afterwards. `AddScoped` is how you say that.

The two failure modes the gate checks are the two directions you can get it
wrong, and they fail differently. Transient is the *silent* one: your code
works, nothing throws, and then two components that both "have the repository"
turn out to have two repositories with two transactions and two change
trackers, and a save in one is invisible to the other. Singleton is the *loud*
one, eventually: shared mutable state across concurrent requests, which under
load produces data belonging to one user appearing in another user's response.
If you only remember one thing from this lesson, make it that second sentence.

## ex3 - one of each, which is what real code looks like

Almost every service you write is a mixture. The interesting shape here is a
short-lived value flowing into a long-lived collaborator: the correlation id
belongs to the request, the audit trail belongs to the application, and the
handler is the thing that has both and puts one into the other.

Note what `AuditTrail` had to do to be a singleton: lock. Every request in the
process is inside a singleton at the same time, so any mutable state in it is
shared mutable state, and the ordinary `List<T>` is not thread-safe — concurrent
`Add` calls can corrupt its internal array or throw. `lock`,
`Interlocked`, a `Concurrent*` collection or immutability are the four ways
out. "Singletons must be thread-safe" is one of those sentences that sounds
like trivia until the first time a production service returns nonsense under
load.

The other half of the pair is that `Correlation` needs *no* thread safety at
all, because a scoped object is only ever touched by the one request that owns
it. Lifetime and concurrency are the same conversation.

## ex4 - registering the same interface many times

`services.AddScoped<IOrderRule, PositiveTotalRule>()` three times over, with
three implementations, gives the container three descriptors for one service
type. Ask for `IOrderRule` and you get the last one registered; ask for
`IEnumerable<IOrderRule>` and you get all three, in registration order. That
second behaviour is the foundation of every plug-in point in ASP.NET Core
itself — validators, model binder providers, authentication handlers,
`IHostedService`s are all resolved as collections.

The design pattern it enables is worth naming: this is the open/closed
principle with a container behind it. Adding a fourth rule means writing a
class and registering it; no existing file changes, no `switch` grows a case,
and the endpoint does not know how many rules exist. Compare it with the
alternative — an `if` per rule inside the handler — and notice what got better:
each rule is independently testable, and the *order* of the rules stopped being
encoded in the shape of the code.

The sort in the endpoint is not decoration. Registration order is deterministic
but it is not *meaningful*, and letting it leak into your response makes your
API's contract depend on the order of lines in a file nobody reading the API
can see.

## challenge - the captive dependency, and how to fix it without breaking the singleton

The bug is entirely in one constructor parameter. `Dispatcher` is registered as
a singleton, so the container builds it exactly once, at the first request that
needs it, and to build it, it must resolve an `IRequestToken` — once. That
token is now a field on an object that will live until the process exits, and
every request for the rest of the application's life gets told about a request
that finished long ago.

The two wrong fixes are worth naming because both are common.

*Make the dispatcher scoped.* This makes the token correct and destroys the
thing the dispatcher was for — the count restarts at 1 every request, because
the counter is now per-request state. The gate checks `handled` precisely to
catch this. In real code the equivalent is downgrading a cache or a connection
pool to scoped to silence a validation error, quietly turning an optimisation
into overhead.

*Resolve the token inside the singleton from a captured `IServiceProvider`.*
This looks like it decouples things and does not: resolving a scoped service
from the root provider either throws (`Cannot resolve scoped service … from
root provider`, which is what .NET's scope validation is for) or, with
validation off, hands you a root-scoped instance that is captive in exactly the
same way.

The fix that works is the boring one: **pass it in**. `Dispatch(IRequestToken
token)` lets a singleton operate on per-request data without ever holding it.
Generalised: when a long-lived component needs short-lived data, that data is an
argument, not a field. The same reasoning is why `HttpContext` is not injectable
into your services and why `IHttpContextAccessor` — which is the "hold it
anyway" escape hatch, backed by an `AsyncLocal` — is a smell more often than it
is a solution.

Worth knowing for interviews: the scoped-into-singleton form of this bug is
caught at startup in Development because `WebApplication.CreateBuilder` turns on
`ValidateScopes` and `ValidateOnBuild`. The transient-into-singleton form, which
is what you just fixed, is *not* caught, because it is legal by the rules the
validator checks. "Why didn't the validator catch it?" is the classic follow-up
question.

## review1 - when does a scope end?

`disposedBefore` reading 0, 1, 2 across three requests is a direct measurement
of the request scope's lifetime. The container created the unit of work when
the handler asked for it, kept it for the rest of that request, and called
`Dispose()` on it when the response finished — after your handler returned,
which is why the count you observe is always the number of *previous* requests
rather than the current one.

Registered as a singleton, `Dispose()` is called exactly once, at application
shutdown, so the count stays 0 for the entire life of the app. That is not a
crash and not a wrong number in the usual sense; it is a connection that is
never returned to the pool, a transaction that is never committed, a file
handle that is never closed. Resource leaks caused by a lifetime that is too
long are the second-most-common DI bug after captive dependencies, and they
never show up in a test that makes one request.

## Further reading

- [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) — the framework view, including how the request scope is created.
- [Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) — captive dependencies, disposal ownership and the anti-patterns, straight from the docs.
- [Service lifetimes](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#service-lifetimes) — singleton, scoped and transient with the rules for combining them.
- [Keyed services](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#keyed-services) — choosing between several implementations of one interface by name.
- [Use scoped services in a BackgroundService](https://learn.microsoft.com/en-us/dotnet/core/extensions/scoped-service) — the `IServiceScopeFactory` pattern for code that lives outside a request.
