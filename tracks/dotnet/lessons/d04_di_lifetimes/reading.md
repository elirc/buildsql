# Reading - dotnet/d04_di_lifetimes

## Notes

A lifetime is not a performance setting. It is a statement about **what an
object is allowed to remember**, and every bug in this set is the same bug seen
from a different angle: something remembered longer than it should have, or
shorter.

Three rules cover almost everything. A **singleton** may remember nothing about
any particular request. A **scoped** object may remember everything about one
request and must forget it when the request ends. A **transient** may remember
nothing at all, because it will be thrown away.

The corollary is the rule that catches people: a service may only depend on
things that live **at least as long as it does**. A singleton holding a scoped
service is a captive dependency, and ASP.NET Core refuses to start in
Development rather than let you ship it. A singleton holding a *transient* is
the quiet version of the same mistake — it compiles, it starts, and the
"transient" is a singleton in practice, which is ex2.

## ex1

Three sentences, three lifetimes, and the drill is translating requirements into
registrations without thinking about mechanics. "The whole application shares
one" is singleton. "One object for the whole of this request" is scoped. "Fresh
at every use" is transient.

The classic mistake is registering everything as scoped because it is the safe
middle. It is safe, and it silently makes the expensive cache expensive again on
every request. The model answer chooses each one from the *sentence*, not from
habit.

## ex2

The captive dependency, in its most common form. `ReportBuilder` takes an
`IStamp` in its constructor; the builder is a singleton, so the container
resolves one stamp at startup and the builder holds it forever. The transient
registration is not wrong and the singleton registration is not wrong — the
*capture* is.

The fix is to resolve per call rather than per construction:
`IServiceProvider.GetRequiredService<IStamp>()` inside `Build()`. The classic
mistake is making the builder scoped instead, which "fixes" the symptom by
rebuilding an expensive object per request and still returns one stamp for the
whole request.

Two footnotes worth having. `Func<IStamp>` does **not** work — the built-in
container has no factory support, unlike Autofac. And injecting
`IServiceProvider` is the service locator pattern, which is a smell everywhere
except exactly here: a long-lived object that needs short-lived collaborators.

## ex3

Same shape as ex2, one level harder, because the dependency is *scoped* rather
than transient. A singleton cannot take it in its constructor at all — the
container throws at startup in Development — and it cannot resolve it from the
root provider either, because the root provider has no scope. That second
failure is the error the shipped stub produces, and it is worth reading once:
"Cannot resolve scoped service … from root provider".

The answer is `IServiceScopeFactory`: create a scope per unit of work, resolve
inside it, dispose it. This is precisely how a `BackgroundService` uses a
`DbContext`, and it is the single most useful DI pattern in a hosted-service
codebase.

The `using` matters. A scope you open is a scope you own; forgetting to dispose
it leaks everything created inside it until the process ends.

## ex4

Transient does not mean untracked. When the container creates an `IDisposable`,
the **scope that created it** takes ownership and disposes it when it ends — so
two transient leases resolved during a request are both disposed when the
request finishes. That is the behaviour the gate counts.

Scoped fails the first check (both callers get the same lease). Singleton fails
the second (nothing is ever disposed, because the root scope only ends at
shutdown). Transient is the only lifetime that satisfies both.

The production consequence: a transient `IDisposable` resolved from the **root**
provider — the mistake ex2 and ex3 skirt around — is never disposed until the
application stops, which is a slow memory leak that looks like nothing until it
looks like an outage.

## ex5

Three mechanics, in one exercise. `Add…` **appends** a registration rather than
replacing one. Resolving a single service gives you the **last** registration.
Resolving `IEnumerable<T>` gives you **all** of them, in registration order. And
`TryAdd…` does nothing at all if any registration for that service type already
exists.

That combination is how the framework's own defaults work: libraries `TryAdd`
their implementations so that yours, registered earlier or later with `Add`,
wins. It is also the trap — `TryAdd` in a module that runs *first* means the
library's default silently never appears.

`TryAddEnumerable` is the one to remember for plugin sets: it dedupes by
*implementation* type, so registering the same handler twice from two modules
adds it once.

## ex6

This is why `AddDbContext` registers scoped, and the drill exists so that the
answer is instant in an interview. Two repositories in one request must see the
same unit of work, or a change tracked by one is invisible to the other and a
single `SaveChanges` cannot commit both.

Transient breaks it in the obvious way: three collaborators, three units, three
half-finished transactions. Singleton breaks it in the dangerous way: two
concurrent requests share one unit, one request's uncommitted changes are
visible to another, and `DbContext` is not thread-safe so the failure mode is
corruption rather than a clean error.

## ex7

A singleton that needs per-request data has exactly two honest options: have the
data **passed in** as a method argument, or read it from an ambient accessor.
`IHttpContextAccessor` is the second, and it works because the accessor itself is
a singleton wrapping an `AsyncLocal<HttpContext>` — the value is per async flow,
not per instance.

`AddHttpContextAccessor()` is the missing line, and it is `TryAdd`-based, so
calling it more than once is harmless.

The honest caveat: `IHttpContextAccessor` is ambient state, and ambient state is
hard to test and easy to read from a background thread where it is `null` — which
is why the model answer handles `HttpContext is null` rather than assuming.
Prefer passing the value in when the call site can. Reach for the accessor when
it cannot, as with logging enrichers and telemetry.

## ex8

Four independent decisions with four different observable consequences, which is
the cumulative version of everything above: an expensive object built once
(singleton), a per-request accumulator (scoped), a never-reused token
(transient), and an application-wide counter (singleton).

The failure messages are the point. `parserBuilds` climbing means you are paying
the construction cost you registered a singleton to avoid; two baskets in one
request means the request cannot accumulate anything; a shared ticket means two
callers hold the same token; a `handled` count stuck at 1 means the counter is
rebuilt before it can count.

Read them as symptoms. In real code you never see the registration and the bug
at the same time — you see one of these four symptoms, and the skill is going
straight from the symptom to the line in `Program.cs`.

## Further reading

- [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) — lifetimes, scope validation and the rules for what may depend on what.
- [Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) — captive dependencies, disposal ownership and the service locator anti-pattern.
- [Dependency injection in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) — `IServiceScopeFactory`, `TryAdd`, `TryAddEnumerable` and keyed services.
- [Use scoped services in a BackgroundService](https://learn.microsoft.com/en-us/dotnet/core/extensions/scoped-service) — ex3's pattern as the framework documents it.
- [IHttpContextAccessor](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-context) — accessing the current request from a long-lived service, and when not to.
