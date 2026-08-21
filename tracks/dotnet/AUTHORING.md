# Authoring an ASP.NET Core lesson

Read `BUILD_SPEC.md` §7 (exercise anatomy), §8 (hints) and §12 (quality bar)
first — they apply verbatim. This file covers only what is specific to the
`.NET` track. It is the C# track's layout (`tracks/csharp/AUTHORING.md` — read
that one too, the naming and `.reference` rules are identical) plus one big
difference: the learner's code is not a library of static methods, it is *part
of a running web application*, and the gates are HTTP requests against it.

There is no demo lesson in this track yet; `tracks/csharp/lessons/00_hello_dojo/`
is the shape to copy, and the conventions below are what make it work here.

## File layout

```
tracks/dotnet/
├── src/Api/
│   ├── Program.cs                     composition root - you rarely touch it
│   ├── LessonModules.cs               the registration convention (harness)
│   └── L01_RoutingEndpoints/          learner-edited code, one folder per lesson
│       ├── Endpoints.cs
│       ├── Ex1.cs
│       └── Ex2.cs
├── tests/Gates/
│   ├── DojoWebFactory.cs              boots src/Api in-process (harness)
│   ├── Teach.cs                       assertion helpers (harness)
│   └── L01_RoutingEndpointsTests.cs   the gate, one class per lesson
└── lessons/01_routing_endpoints/
    ├── README.md  reading.md
    └── ex1/{hints.md,.reference/Ex1.cs}   ex2/ ... challenge/ review1/
```

Naming derives from the slug exactly as in the C# track:
`05_efcore_basics` → folder `L05_EfcoreBasics`, namespace
`DotnetDojo.Api.L05_EfcoreBasics`, gate class `L05_EfcoreBasicsTests`,
`--filter` prefix `L05_`. Test methods are `Ex1_...`, `Ex2_...`,
`Challenge_...`, `Review1_...` — **underscore after the exercise key**, or the
harness cannot map the result back to an exercise.

## The registration convention

`Program.cs` is a composition root and nothing else. It never grows a route
per lesson. Instead, each lesson folder ships a class implementing
`IEndpointMapper`, and `LessonModules` discovers every one of them by
reflection at startup, in a stable order (namespace, then type name):

```csharp
// src/Api/L01_RoutingEndpoints/Endpoints.cs
using DotnetDojo.Api;

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Endpoints : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/l01");

        group.MapGet("/orders/{id:int}", (int id) =>
            throw new NotImplementedException("ex1: not implemented yet - edit this file."));
    }
}
```

When a lesson needs services in the container, add a second class implementing
`IServiceRegistrar` in the same folder:

```csharp
public class Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IOrderStore, InMemoryOrderStore>();
    }
}
```

Both interfaces require a public, non-abstract class with a parameterless
constructor; that is the whole contract. Three consequences worth designing
around:

- **Namespace your routes.** Give every lesson its own prefix
  (`app.MapGroup("/l01")`) so lesson 07's `/orders` cannot collide with lesson
  05's. Say the prefix in the README and in the gate.
- **A lesson's mistakes stay in that lesson.** One unregistered service does
  not stop the other lessons' endpoints from mapping.
- **Registration order is deterministic**, so a later lesson may deliberately
  re-register a service to demonstrate replacement — but do not rely on it
  accidentally.

For a lesson about the pipeline itself (`03_middleware`), an `IEndpointMapper`
is not enough, because middleware order is set on the `WebApplication`, not on
the endpoint builder. Give that lesson an `IServiceRegistrar` that registers
the learner's middleware type, and have the gate assert on observable
behaviour through HTTP — headers added, short-circuits taken — rather than on
the pipeline object.

## How gates reach the learner's code

Through HTTP, in-process, with no sockets:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L01_RoutingEndpointsTests(DojoWebFactory factory)
    : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_ReturnsTheOrder()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l01/orders/1");

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l01/orders/1 should return 200 with the order - reread README ex1.");

        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal("Ada", order!.Customer,
            "The route parameter has to select the order, not be ignored.");
    }
}
```

`DojoWebFactory` is `WebApplicationFactory<Program>`: it builds the same
pipeline `dotnet run` would, wired to an in-memory transport. `IClassFixture`
shares one factory per gate class, which keeps a lesson's gates fast.

Assert on **status codes, headers and body**, never on internals. A gate that
reaches into the service container to check a registration teaches the learner
to satisfy the gate; a gate that proves a scoped service really is one
instance per request teaches them DI.

For EF Core lessons use SQLite in-memory (`Microsoft.EntityFrameworkCore.Sqlite`
is already referenced). Keep the connection open for the lifetime of the
factory — an in-memory SQLite database is destroyed when its last connection
closes — and override the `DbContext` registration inside a
`WithWebHostBuilder(...)` block in the gate, not in `Program.cs`.

## Assertions that teach

`Teach` (in `tests/Gates/Teach.cs`):

- `Teach.Equal(expected, actual, because)`
- `Teach.True(condition, because)`
- `await Teach.Status(expectedStatus, response, because)` — prints the status
  it got *and the response body*, which is usually where the real message is.

## Stubs, `.reference/`, and verify

Identical to the C# track:

- Stubs compile and fail — `throw new NotImplementedException("exN: ...")`
  inside the handler, or a handler that returns the wrong result on purpose.
- `lessons/<slug>/exN/.reference/<File>.cs` mirrors the learner file of the
  same name in `src/Api/<Folder>/`.
- `dojo verify dotnet <slug>` backs the learner files up, overlays the
  references (stamping mtimes so MSBuild recompiles), runs the gates green,
  restores the stubs in a `finally`, and reruns them red.

Never hand-roll the overlay: `shutil.copy2` preserves mtimes and MSBuild will
happily skip the rebuild, grading stubs while reporting on references.

## Prose requirements (lint-enforced)

- `README.md` quotes every `[Fact]` declaration line verbatim — paste the
  whole gate class.
- `reading.md` needs `## Notes` (≥25 words), a `## exN` section per manifest
  exercise (≥25 words), and `## Further reading` with ≥3 links, preferring
  `learn.microsoft.com`.
- `hints.md` per exercise, 2–3 `## Hint N` tiers.
- Keep `tracks/dotnet/curriculum.py` in step with the exercises you ship.

## Running it

```
uv run dojo test dotnet 01_routing_endpoints        # whole lesson
uv run dojo test dotnet 01_routing_endpoints ex2    # one exercise
uv run dojo verify dotnet 01_routing_endpoints      # lint + reference + pristine
uv run dojo verify dotnet                           # every authored lesson
```

`tests/Gates/HarnessSmokeTests.cs` boots the app and hits `/health`. It has no
lesson prefix on purpose, so no `--filter` picks it up — but if it fails, the
scaffold is broken and no lesson gate will make sense until it passes.
