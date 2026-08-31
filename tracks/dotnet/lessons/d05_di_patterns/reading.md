# Reading - dotnet/d05_di_patterns

## Notes

Lifetimes decide *how long* an object lives. This set is about the other half of
a registration: **what the container builds, and out of what**. Every problem
here is a different answer to "the default `AddScoped<IFoo, Foo>()` cannot
express this".

The pattern that unites them is composition at the composition root. A strategy
set, a decorator chain, an open generic and a keyed lookup are all ways of
saying "the shape of this dependency is decided in one place, at startup, and
the code that uses it stays ignorant". That ignorance is the payoff: the handler
in ex8 has no idea it is talking to two decorators, and it never needs to.

The one thing worth internalising about the built-in container: it is
deliberately small. No `Func<T>`, no automatic decoration, no assembly scanning,
no property injection. Everything in this lesson is done with the four
primitives it does have — a type, a factory lambda, an open generic, and a key —
and knowing exactly where that ceiling is tells you when a third-party container
or Scrutor actually earns its dependency.

## ex1

Registering the same service type more than once is not a mistake — it builds a
**set**. `IEnumerable<INotifier>` gets every registration in order, which is how
strategies, validation rules, health checks and pipeline stages get plugged in
without a central list anyone has to remember to edit.

The classic mistake is expecting the second `Add` to replace the first. It never
does; the *single* resolve takes the last one, and the enumerable takes all of
them. Here that shows up as a 404 for `sms`, because only one notifier was
registered.

The model answer's other decision: `FirstOrDefault` and a 404, rather than
`First` and a 500. An unknown channel is a client mistake, not a server one.

## ex2

Sometimes the constructor needs a **value**, not a service — a rate, a
connection string, a size limit — and the container has no way to guess it. The
factory overload, `AddSingleton<IPricer>(sp => …)`, is the escape hatch: you get
the provider, you resolve what you need, you build the object yourself.

The classic mistake is hard-coding the value in the registration to make it
compile, which is exactly what the shipped stub does. It works, it passes a
smoke test, and it silently ignores the configured rate forever.

Worth knowing: the factory runs **once per instance created**, respecting the
lifetime you registered — so a singleton factory runs once, a scoped factory
once per request. And whatever the factory returns is owned by the container: if
it is `IDisposable`, the scope will dispose it.

## ex3

A decorator implements the same interface it wraps, so callers cannot tell the
difference. Caching, retries, logging, metrics, authorization checks and audit
trails are all decorators, and none of them belong inside the class doing the
real work.

Composing them by hand in a factory lambda is the honest way to do it in the
built-in container: `new AuditSink(new UppercaseSink(new CoreSink()), trail)`.
It reads inside-out, which is the usual source of the classic mistake — getting
the nesting backwards, so the audit trail records the shouted message instead of
the original one.

Two things to notice in the gate. The order shows up in the *result string*, and
also in *what the audit layer saw* — a decorator's position decides which
version of the data it observes. That is exactly why an authorization decorator
goes outside a caching one, and a retry decorator goes inside a timeout one.

## ex4

`services.AddScoped(typeof(IRepository<>), typeof(InMemoryRepository<>))` is the
open-generic registration: one line that the container closes on demand for
`IRepository<Widget>`, `IRepository<Gadget>` and anything else asked for later.
This is how `ILogger<T>`, `IOptions<T>` and `IValidator<T>` are registered.

The classic mistake is registering closed forms one at a time, which compiles,
works for the types you remembered, and produces a runtime "unable to resolve"
for the one you did not — usually in the feature added six months later.

Note the non-generic overload: open generics cannot be expressed with the
generic `AddScoped<TService, TImplementation>()` form, and they cannot use a
factory lambda either. Type arguments only.

One aside worth having, because it bites hard the first time. The handler's
parameters carry `[FromServices]` explicitly. Without it, minimal APIs infer the
binding source by asking the container whether the type is a service — and a
type it has never heard of is inferred as the request **body**. A `GET` endpoint
with an inferred body is a *startup* failure, not a request failure, so one
missing registration takes the whole application down with a message about
bodies rather than about DI. Being explicit turns that into an ordinary
"unable to resolve service" 500 on the one endpoint that is broken.

## ex5

Keyed services (.NET 8+) let one interface have several registrations
distinguished by a key, without an enumerable and without a marker interface per
implementation. `[FromKeyedServices("email")]` picks one at *composition* time;
`GetKeyedService<T>(key)` picks one at *request* time.

The distinction the gate draws is worth keeping: the pinned parameter never
changes, the runtime lookup does. Reach for the attribute when the choice is
structural ("this handler always uses the primary database") and the runtime
lookup when the key comes from data.

The classic mistake is `GetRequiredKeyedService` for a key that came from user
input — that throws, and a thrown exception is a 500 for what is really a 404.
`KeyedService.AnyKey` is the wildcard for "give me all of them regardless of
key", which is how you enumerate a keyed set.

## ex6

`Add` appends unconditionally, `TryAdd` does nothing if *any* registration
exists for the service type, and `TryAddEnumerable` adds only if that exact
**implementation type** is not already registered. The third is the one for
plugin sets, and it exists because the first two both get it wrong: `Add`
duplicates, and `TryAdd` would stop the second, different check from registering
at all.

The practical failure this prevents is not academic. Two modules that both
depend on "the disk check" and both register it means the check runs twice —
twice the log lines, twice the load, and a health endpoint that reports the same
component twice.

`ServiceDescriptor.Singleton<TService, TImplementation>()` is how you build the
descriptor `TryAddEnumerable` wants; it needs the descriptor, not the type
arguments, because it has to compare implementation types.

## ex7

`ActivatorUtilities.CreateInstance<T>(provider, args)` builds a type that is
**not registered**, filling constructor parameters from the container and
matching the extra arguments you pass by type. That is the standard answer to
"half of this object's constructor is DI and half is runtime data" — a job with
a label, a strategy with a tenant id, a command with its payload.

The classic mistake is `new ExportJob(new FixedClock(), label)`, which works
until the clock has dependencies, or the singleton matters, or a test wants to
replace it. The gate checks the clock is the container's instance for exactly
that reason.

Worth knowing: `ActivatorUtilities.CreateFactory` pre-compiles the same thing
when you are going to build many instances, and that the type must have a public
constructor — this is not a way around encapsulation.

## ex8

The hardest one, and the most useful. You are handed a registration you did not
write and must wrap it without knowing what it names. The move is: find the
`ServiceDescriptor` in the collection, remove it, and register a factory that
builds the original from that descriptor and wraps the result.

Building the original is the fiddly part, because a descriptor can carry an
*instance*, a *factory*, or an *implementation type* — the model answer handles
all three, and `ActivatorUtilities.CreateInstance` covers the last one because
the type is no longer registered for the container to resolve.

Applying `Decorate` twice gives you `counting>shouting>core`: each call wraps
whatever the previous one left, so the **last** decorator applied is the
outermost. That is the same nesting rule as d02's endpoint filters, and getting
it backwards is the classic mistake.

This is precisely what Scrutor's `services.Decorate<IFoo, FooDecorator>()` does,
and having written it once is the reason to be comfortable reaching for it.

## Further reading

- [Dependency injection in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) — factory registrations, open generics, `IEnumerable<T>` and multiple registrations.
- [Keyed dependency injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#keyed-services) — `AddKeyed*`, `[FromKeyedServices]` and `KeyedService.AnyKey`.
- [Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) — what the built-in container deliberately does not do, and when to replace it.
- [ActivatorUtilities](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.activatorutilities) — constructing unregistered types with a mix of DI and explicit arguments.
- [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) — `TryAdd`, `TryAddEnumerable` and the service descriptor model.
