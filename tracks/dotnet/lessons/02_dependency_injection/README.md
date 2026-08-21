# 02 — Dependency injection and lifetimes

Every handler you have written so far reached out and took what it needed:
`Catalog.Orders`, a static list, right there in the same assembly. That works
exactly until the data lives in a database, or behind an HTTP call, or has to
be a fake in a test — at which point a static reference is a hard-wired
decision your handler is no longer allowed to change.

Dependency injection turns that around. Your handler declares what it needs as
a *parameter*, and something else — the container — decides which
implementation to hand over and how long that object should live. You have
already used it without noticing: the gate boots your app, and ASP.NET Core
builds an `IServiceProvider` before the first request. This lesson is about
putting your own things in it.

And it is really about the second half of that sentence: **how long**. Getting
the type right is easy; getting the *lifetime* right is where .NET services
break in ways that only show up under concurrency, on the second request, in
production, on a Friday. Every exercise below is graded by making two requests
and comparing what came back, because that is the only honest way to see a
lifetime.

## Concept — three lifetimes, and the scope

Registration happens in a class implementing `IServiceRegistrar`, which this
course's `LessonModules` calls before the container is built:

```csharp
public class ExampleServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<IOrderRepository, SqlOrderRepository>();
        services.AddTransient<IEmailBuilder, EmailBuilder>();
    }
}
```

Read `AddScoped<IOrderRepository, SqlOrderRepository>()` as: *when someone asks
for `IOrderRepository`, give them a `SqlOrderRepository`, and reuse the same one
for everything in the current scope.* The first type is what callers depend on;
the second is what actually gets built.

The three lifetimes differ only in when the container builds a new object:

| lifetime | a new instance… | use it for |
|---|---|---|
| `AddSingleton` | once, for the life of the application | caches, configuration, counters, anything expensive and stateless-per-request |
| `AddScoped` | once per scope — in a web app, once per **request** | database contexts, unit of work, the current user, anything that belongs to "this request" |
| `AddTransient` | every single time it is resolved | cheap, stateless helpers |

The word doing the work is **scope**. ASP.NET Core creates one
`IServiceScope` per HTTP request, resolves your handler's parameters from it,
and disposes it when the response is finished. So "scoped" means "one per
request" *because* the framework happens to open a scope per request — the
container itself knows nothing about HTTP. That distinction matters the first
time you resolve services from a background job, where nobody opens a scope for
you and you have to do it yourself with `IServiceScopeFactory`.

Once a service is registered, a minimal API handler gets it by declaring a
parameter:

```csharp
private static IResult Example(IClock clock) =>
    TypedResults.Ok(new { now = clock.UtcNow });
```

ASP.NET Core sees a parameter whose type is a registered service and resolves
it instead of trying to bind it from the request. That is why an unregistered
interface produces `Unable to resolve service for type 'IClock'` at request
time — and why one of the failures in this lesson is a 500 rather than a wrong
value.

### The rule you have to know

**A service may depend on things that live at least as long as it does, never
on things that live less.** A singleton holding a scoped object keeps that
object alive forever, long after its request has ended — one request's data,
served to everybody. That bug has a name, *captive dependency*, and it is the
challenge below.

.NET tries to protect you: in the Development environment the container
validates on build and refuses to start an app whose singleton takes a scoped
constructor parameter. What it cannot see through is a singleton that captures
a **transient** — perfectly legal to build, just as wrong at runtime — or one
that resolves a scoped service out of a `IServiceProvider` it was handed. So
the validator is a seatbelt, not a substitute for knowing the rule.

## Exercise 1 — singleton and transient, told apart

Edit `src/Api/L02_DependencyInjection/Ex1.cs`. Two things to do.

Implement `GetTicket` so that `GET /l02/ticket` answers **200** with
`{"ticket": …, "first": …, "second": …}` — the `ITicketSource`'s `Ticket`, and
the `Value` of each of the two `IIdGenerator` parameters.

Then fix the registrations, which are both currently `AddTransient`, so that:

- every request sees the **same** `ticket`, and
- the two `IIdGenerator` parameters *within one request* see **different**
  values.

Two parameters of the same type is not a typo. The container is asked twice,
and what you get back the second time is the whole definition of a lifetime.

```
uv run dojo test dotnet 02_dependency_injection ex1
```

## Exercise 2 — one per request, and only per request

Edit `src/Api/L02_DependencyInjection/Ex2.cs`. Implement `GetScope` to answer
**200** with `{"first": …, "second": …}` from its two `IRequestScope`
parameters, then choose the registration that makes both of these true at once:

- within one request, `first` and `second` are the **same** value
- across two requests, they are **different**

Exactly one of the three lifetimes can do that, and neither of the two you used
in ex1 is it.

```
uv run dojo test dotnet 02_dependency_injection ex2
```

## Exercise 3 — two lifetimes, working together

Edit `src/Api/L02_DependencyInjection/Ex3.cs`. `ICorrelation` is an id that
identifies one request; `IAuditTrail` is a log that outlives all of them. Both
registrations are currently wrong, in opposite directions.

Implement `Audit` so that `GET /l02/audit` records this request's correlation
id in the trail and answers **200** with
`{"correlationId": …, "seen": …}`, where `seen` is the number `Record` gave you
back. Then fix both lifetimes so that:

- the first request reports `seen: 1`, the second reports `seen: 2`
- the two requests report **different** correlation ids

`AuditTrail` is given code and is already thread-safe; do not change it. This
pair — a per-request value written into an application-wide store — is the
single most common shape in a real service, and it needs one of each lifetime.

```
uv run dojo test dotnet 02_dependency_injection ex3
```

## Exercise 4 — many implementations of one interface

Edit `src/Api/L02_DependencyInjection/Ex4.cs`. Three classes implement
`IOrderRule`; only one of them is registered. Register the other two, then
implement `CheckRules` so that `GET /l02/rules?totalCents=…` answers **200**
with `{"violations": [ … ]}` — the `Name` of every rule the total does *not*
satisfy, sorted A–Z.

So `?totalCents=0` gives `["PositiveTotalRule"]`, `?totalCents=99999` gives
`["MaximumTotalRule","WholeCurrencyRule"]`, and `?totalCents=2500` gives `[]`.

Registering the same interface more than once is not an error and does not
overwrite anything. `IEnumerable<IOrderRule>` gets you all of them, in
registration order — which is why the endpoint sorts, so the answer does not
depend on the order you happened to type. This is how validation pipelines,
notification channels and export formats are normally built: add a class,
register it, and every caller picks it up without being edited.

```
uv run dojo test dotnet 02_dependency_injection ex4
```

## Challenge — the captive dependency

Honest difficulty note: the fix is a handful of lines, but it requires changing
an interface, which people are strangely reluctant to do.

Edit `src/Api/L02_DependencyInjection/Challenge.cs`. `Dispatcher` is a
singleton — it counts every dispatch the application has ever made — and it
takes an `IRequestToken` in its constructor so it can report which request it
is working on. That constructor parameter is the bug: the container builds the
singleton once, hands it one token, and that token is now the answer forever.

Make `GET /l02/dispatch` answer **200** with
`{"token": …, "echo": …, "handled": …}` such that:

- `handled` counts across requests: 1, then 2 — the dispatcher stays a
  singleton, so "make it scoped" is not the fix
- `token` is **different** on every request
- `token` equals `echo`, the token the container gave the handler — and the
  handler asks for `IRequestToken` twice, so the request's token must be one
  object for the whole request

The move is to stop *holding* the short-lived thing and start *receiving* it:
a singleton can be handed per-request data as a method argument all day long.
You are allowed — expected — to change `IDispatcher`.

```
uv run dojo test dotnet 02_dependency_injection challenge
```

## Review

`review1` is not part of finishing this lesson; the scheduler brings it back
later. Edit `src/Api/L02_DependencyInjection/Review1.cs`: implement
`GetUnitOfWork` to answer **200** with `{"id": …, "disposedBefore": …}` — the
unit of work's `Id` and the disposal log's current `Count` — and give
`IUnitOfWork` a lifetime that makes `disposedBefore` read 0, then 1, then 2 over
three requests. The question underneath: *when does the container dispose the
things it built, and what does that tell you about when a scope ends?*

## The gate

This is the entire gate class, `tests/Gates/L02_DependencyInjectionTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L02_DependencyInjectionTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_OneServiceIsSharedAndTheOtherIsNot()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/ticket");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/ticket must answer 200. \"Unable to resolve service\" in the body means "
                + "the container was never told about the interface - reread README ex1.");

        var a = await first.Content.ReadFromJsonAsync<TicketDto>();
        var b = await (await client.GetAsync("/l02/ticket")).Content.ReadFromJsonAsync<TicketDto>();

        Teach.True(a!.Ticket != Guid.Empty,
            "\"ticket\" is missing from the response body. Return the ITicketSource's Ticket.");

        Teach.Equal(a.Ticket, b!.Ticket,
            "Two separate requests saw two different tickets, so ITicketSource is being "
                + "built again every time. One value shared by the whole application is a "
                + "singleton.");

        Teach.True(a.First != a.Second,
            "Both IIdGenerator parameters in ONE request came back with the same value, so "
                + "the container is reusing an instance. A fresh object per resolution is "
                + "transient.");

        Teach.True(a.First != b.First,
            "The two requests got the same generated id. Transient means a new instance "
                + "every time anyone asks - across requests as well as within one.");
    }

    [Fact]
    public async Task Ex2_ScopedIsOnePerRequestAndNotOnePerApplication()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/scope");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/scope must answer 200 - reread README ex2.");

        var a = await first.Content.ReadFromJsonAsync<ScopeDto>();
        var b = await (await client.GetAsync("/l02/scope")).Content.ReadFromJsonAsync<ScopeDto>();

        Teach.True(a!.First != Guid.Empty,
            "\"first\" is missing from the response body. Return both parameters' Id.");

        Teach.Equal(a.First, a.Second,
            "The container was asked for IRequestScope twice while handling ONE request and "
                + "handed back two different objects. That is transient behaviour; a request "
                + "scope has to be one instance for the whole request.");

        Teach.True(a.First != b!.First,
            "Two different requests shared one IRequestScope, which is singleton behaviour. "
                + "A scope ends when the request ends.");
    }

    [Fact]
    public async Task Ex3_ARequestScopedIdIsRecordedInAnApplicationWideTrail()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/audit");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/audit must answer 200 - reread README ex3.");

        var a = await first.Content.ReadFromJsonAsync<AuditDto>();
        var b = await (await client.GetAsync("/l02/audit")).Content.ReadFromJsonAsync<AuditDto>();

        Teach.Equal(1, a!.Seen,
            "The first request to reach the trail is the first thing it has ever recorded, "
                + "so Record must give back 1. If you got 0, you are not calling Record; if "
                + "you got something larger, the trail is not fresh.");

        Teach.Equal(2, b!.Seen,
            "The second request pushed the total to 2. Getting 1 again means every request "
                + "builds its own AuditTrail - that is scoped, and an audit trail that "
                + "forgets everything at the end of the request is not an audit trail.");

        Teach.True(a.CorrelationId != b.CorrelationId,
            "Both requests reported the same correlation id, so ICorrelation is shared by "
                + "the whole application. A value that identifies one request has to be born "
                + "and die with that request.");
    }

    [Fact]
    public async Task Ex4_EveryRegisteredRuleGetsAVote()
    {
        using var client = factory.CreateClient();

        var free = await client.GetAsync("/l02/rules?totalCents=0");
        await Teach.Status(HttpStatusCode.OK, free,
            "GET /l02/rules?totalCents=0 must answer 200 - reread README ex4.");
        Teach.Equal("PositiveTotalRule", await Violations(free),
            "A total of 0 breaks exactly one rule: it is not positive.");

        var huge = await client.GetAsync("/l02/rules?totalCents=99999");
        Teach.Equal("MaximumTotalRule,WholeCurrencyRule", await Violations(huge),
            "99999 is over the maximum and is not a whole unit of currency, so two rules "
                + "object - sorted A-Z. Seeing an empty list means those two rules were "
                + "never registered, so IEnumerable<IOrderRule> only ever contained one.");

        var fine = await client.GetAsync("/l02/rules?totalCents=2500");
        Teach.Equal("", await Violations(fine),
            "2500 satisfies all three rules, so the violations list is empty - not null.");
    }

    [Fact]
    public async Task Challenge_TheSingletonReportsThisRequestsToken()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/dispatch");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/dispatch must answer 200 - reread README challenge.");

        var a = await first.Content.ReadFromJsonAsync<DispatchDto>();
        var b = await (await client.GetAsync("/l02/dispatch")).Content.ReadFromJsonAsync<DispatchDto>();

        Teach.Equal(1, a!.Handled,
            "The dispatcher counts every dispatch the application has made, so the first "
                + "one is 1.");
        Teach.Equal(2, b!.Handled,
            "The count went back to 1, so the dispatcher is being rebuilt per request. It "
                + "is meant to be a singleton - fixing the captive dependency must not mean "
                + "making the singleton scoped.");

        Teach.True(a.Token != b.Token,
            "Both requests were dispatched under the same token. The dispatcher captured one "
                + "IRequestToken when it was constructed and has been holding it ever since - "
                + "that is a captive dependency.");

        Teach.Equal(a.Token, a.Echo,
            "The token the dispatcher reported is not the one the container gave this "
                + "handler. The dispatcher must work on the token belonging to the request "
                + "it is handling, and the request's token must be one object for the whole "
                + "request.");
    }

    [Fact]
    public async Task Review1_AScopedServiceIsDisposedWhenTheRequestEnds()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/review/unit-of-work");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/review/unit-of-work must answer 200 - reread README review.");

        var a = await first.Content.ReadFromJsonAsync<UnitOfWorkDto>();
        var b = await (await client.GetAsync("/l02/review/unit-of-work")).Content
            .ReadFromJsonAsync<UnitOfWorkDto>();
        var c = await (await client.GetAsync("/l02/review/unit-of-work")).Content
            .ReadFromJsonAsync<UnitOfWorkDto>();

        Teach.Equal(0, a!.DisposedBefore,
            "Nothing has been disposed before the very first request.");
        Teach.Equal(1, b!.DisposedBefore,
            "By the second request, the first request's unit of work should have been "
                + "disposed. A count stuck at 0 means the container never owned a "
                + "per-request instance to dispose.");
        Teach.Equal(2, c!.DisposedBefore,
            "One disposal per finished request - the container disposes what it created "
                + "when the scope it created it in ends.");

        Teach.True(a.Id != b.Id,
            "Every request should get its own unit of work; these two shared one.");
    }

    private static async Task<string> Violations(HttpResponseMessage response)
    {
        var body = await response.Content.ReadFromJsonAsync<RuleDto>();
        return string.Join(",", body?.Violations ?? []);
    }

    private sealed record TicketDto(Guid Ticket, Guid First, Guid Second);

    private sealed record ScopeDto(Guid First, Guid Second);

    private sealed record AuditDto(Guid CorrelationId, int Seen);

    private sealed record RuleDto(List<string>? Violations);

    private sealed record DispatchDto(Guid Token, Guid Echo, int Handled);

    private sealed record UnitOfWorkDto(Guid Id, int DisposedBefore);
}
```

In plain English: every test here makes **two** requests and compares. That is
deliberate — a lifetime is invisible in a single request, and almost every
real-world lifetime bug is a "works on my machine, wrong on the second call"
bug. Note also that nothing reaches into the container to inspect a
registration. The gate only knows what a client can see, which means passing it
means the behaviour is right, not that the registration looks right.

## The teaching point

Ask "how long should this live?" every time you register something, and answer
it with a sentence about *ownership* rather than performance. A database
context belongs to one request because a transaction does. A cache belongs to
the application because the whole point is that it outlives requests. A
`StringBuilder`-shaped helper belongs to nobody, so make it transient and stop
thinking about it.

Two rules of thumb worth carrying: **singletons must be thread-safe**, because
every request will be inside them at once — `AuditTrail` locks for exactly that
reason. And **a longer-lived service must never hold a shorter-lived one**, but
it may happily *receive* one as an argument. Almost every captive dependency in
the wild is fixed by moving a constructor parameter into a method signature.

Next: **03_middleware**, where you find out what runs before your handler, in
what order, and what happens when one of them decides not to call the next.
