# 04 — Configuration and the options pattern

Look back at what you have hard-coded so far: `"dojo-key"` as an API key, a
page size that does not exist yet, a rate limit you have not written. Every one
of those is a value that will need to differ between your laptop, the staging
environment and production — and every one of them is currently a string
literal that only a redeploy can change.

Configuration is ASP.NET Core's answer, and it is a nicer answer than "read an
environment variable". The framework builds one `IConfiguration` out of a
*stack* of sources — JSON files, environment-specific JSON files, user secrets,
environment variables, command-line arguments — where later sources override
earlier ones by key. Your code asks for a value; it never asks where the value
came from. That is what lets the same binary run in three environments without
a single `if (production)` in it.

On top of that sits the **options pattern**: instead of reading loose strings
out of a dictionary all over your codebase, you bind a section once into a
class, and everything downstream injects the class.

## Concept — the stack, the section, the class

`WebApplication.CreateBuilder(args)` sets up these sources, in this order:

```
appsettings.json
appsettings.{Environment}.json      ← Development / Staging / Production
user secrets                        ← Development only, stored outside the repo
environment variables               ← e.g. Dojo__Catalog__PageSize=50
command-line arguments              ← --Dojo:Catalog:PageSize=50
```

**Later wins.** That single rule is the whole design: a value in
`appsettings.json` is a default, and anything further down the stack overrides
it for one environment, one machine, or one run. Note the double underscore in
the environment-variable form — many shells will not accept a colon in a
variable name, so `__` is the portable spelling of the `:` separator.

Configuration itself is flat. Even though `appsettings.json` looks like a tree,
what the providers produce is a dictionary of colon-separated paths:

```
Dojo:Catalog:Title      = "Dojo Catalog"
Dojo:Catalog:PageSize   = "25"
Dojo:Catalog:Currency   = "EUR"
```

Every value is a **string** — `PageSize` is `"25"`, not `25` — because an
environment variable cannot be an integer. Conversion happens when you bind.

You can read a value directly:

```csharp
string? title = configuration["Dojo:Catalog:Title"];
```

…and for one-off reads at startup that is fine. For anything a service depends
on, bind a section to a class instead:

```csharp
public class ExampleOptions
{
    public string Title { get; set; } = "";
    public int PageSize { get; set; } = 20;      // ← a default
}

// in IServiceRegistrar.Register:
services.Configure<ExampleOptions>(configuration.GetSection("Dojo:Example"));

// anywhere else:
private static IResult Handler(IOptions<ExampleOptions> options) =>
    TypedResults.Ok(options.Value.PageSize);
```

Binding is by **property name matching the key**, and it only writes properties
it finds keys for. Everything else keeps whatever the class's initialiser gave
it — which is how "sensible default, overridable in configuration" works, and
why your options classes should have real defaults rather than relying on
`0` and `null`.

Three interfaces deliver options, and the difference is a favourite interview
question:

| interface | lifetime | reads configuration |
|---|---|---|
| `IOptions<T>` | singleton | once, on first use — never again |
| `IOptionsSnapshot<T>` | scoped | once per request |
| `IOptionsMonitor<T>` | singleton | live, with a change callback, and `Get(name)` for named options |

`IOptions<T>` is the right default. Reach for `IOptionsSnapshot<T>` when a
value should be able to change without a restart, and `IOptionsMonitor<T>` when
a singleton needs the current value, or when you have several *named*
configurations of one class — the challenge.

## Exercise 1 — bind a section

Open `src/Api/appsettings.json` and read the `Dojo` section; every expected
value in this lesson comes from there.

Edit `src/Api/L04_ConfigurationOptions/Ex1.cs`. Register `CatalogOptions`
against the `Dojo:Catalog` section, and implement `GetCatalogOptions` so that
`GET /l04/catalog-options` answers **200** with the bound values:

```json
{"title":"Dojo Catalog","pageSize":25,"currency":"EUR"}
```

The class is already written. Notice that `PageSize` is an `int` while the
configuration value is the string `"25"` — the binder does that conversion, and
it will throw a clear exception at startup if it cannot.

```
uv run dojo test dotnet 04_configuration_options ex1
```

## Exercise 2 — defaults, and what a partial section leaves alone

Edit `src/Api/L04_ConfigurationOptions/Ex2.cs`. The `Dojo:Reports` section
contains exactly one key, `MaxRows`. Give `ReportOptions` these defaults —
`MaxRows = 100`, `Format = "csv"`, `IncludeHeaders = true` — bind the class to
the section, and implement `GetReportOptions`.

The result should be `maxRows` **500** (configuration wins), `format` **"csv"**
and `includeHeaders` **true** (your defaults survive, because configuration says
nothing about them).

This is the property that makes the options pattern pleasant to live with: your
class is the complete specification of what a feature needs, configuration only
carries the deltas, and a deployment file that says nothing is a deployment
file that gets your defaults.

```
uv run dojo test dotnet 04_configuration_options ex2
```

## Exercise 3 — which environment am I?

Edit `src/Api/L04_ConfigurationOptions/Ex3.cs`. Implement `GetEnvironment` so
that `GET /l04/environment` answers **200** with:

- `name` — the current environment's name
- `isDevelopment` — whether that environment is Development, asked via
  `IHostEnvironment`'s own method rather than by comparing strings yourself
- `catalogTitle` — `Dojo:Catalog:Title`, read straight from `IConfiguration`
  with its colon-separated key

The gate boots the app twice: once normally, where the environment is
`Development`, and once with the environment forced to `Staging`. Anything
hard-coded will pass the first and fail the second.

`IHostEnvironment` is how a well-behaved app decides to show a detailed error
page, seed test data, or refuse to start with a development connection string.
The environment name is not magic: it is just the `ASPNETCORE_ENVIRONMENT`
variable, and `Development`, `Staging` and `Production` are conventions with
helper methods, not a closed set.

```
uv run dojo test dotnet 04_configuration_options ex3
```

## Challenge — named options

Honest difficulty note: the loop in `Register` is three lines; knowing that
`IOptionsMonitor.Get(name)` never fails is the part that catches people.

Edit `src/Api/L04_ConfigurationOptions/Challenge.cs`. `Dojo:Feeds` holds two
child sections, `primary` and `fallback`, each with the shape of `FeedOptions`.
Register one **named** options instance per child — without hard-coding the
names — and implement `GET /l04/feeds/{name}` to answer **200** with that
feed's settings, or **404** when no such feed is configured.

`services.Configure<FeedOptions>(name, section)` registers a named instance;
`monitor.Get(name)` retrieves one. The trap is that `Get` on an unknown name
does not throw and does not return null — it hands back a `FeedOptions` full of
your defaults, which would make `/l04/feeds/nope` a cheerful 200 describing a
feed that does not exist. So ask configuration whether the section is there
before you answer.

```
uv run dojo test dotnet 04_configuration_options challenge
```

## Review

`review1` is not part of finishing this lesson; the scheduler brings it back
later. Edit `src/Api/L04_ConfigurationOptions/Review1.cs`: give `MailerOptions`
the defaults `DisplayName = "Dojo"` and `RetryCount = 3`, bind it to
`Dojo:Mailer` (which sets only `FromAddress`), and implement `GetMailer`. Note
the parameter type — `IOptionsSnapshot<T>` rather than `IOptions<T>` — and be
able to say what that changes.

## The gate

This is the entire gate class, `tests/Gates/L04_ConfigurationOptionsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;

namespace DotnetDojo.Gates;

public class L04_ConfigurationOptionsTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_CatalogOptionsComeFromAppsettings()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/catalog-options");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/catalog-options must answer 200 - reread README ex1.");

        var body = await response.Content.ReadFromJsonAsync<CatalogDto>();
        Teach.Equal("Dojo Catalog", body?.Title,
            "Title comes from Dojo:Catalog:Title in appsettings.json. An empty string means "
                + "nothing was bound - check the section path you passed to GetSection.");
        Teach.Equal(25, body?.PageSize,
            "PageSize is 25 in appsettings.json, and it is written there as a number, which "
                + "the binder converts to an int for you.");
        Teach.Equal("EUR", body?.Currency,
            "Currency is EUR. If Title bound and this did not, the property name does not "
                + "match the key.");
    }

    [Fact]
    public async Task Ex2_APartialSectionLeavesTheDefaultsAlone()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/report-options");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/report-options must answer 200 - reread README ex2.");

        var body = await response.Content.ReadFromJsonAsync<ReportDto>();
        Teach.Equal(500, body?.MaxRows,
            "Dojo:Reports sets MaxRows to 500, so the configured value must win over your "
                + "default of 100.");
        Teach.Equal("csv", body?.Format,
            "Dojo:Reports says nothing about Format, so your default has to survive. The "
                + "binder only writes properties it finds keys for; it does not blank the "
                + "rest.");
        Teach.Equal(true, body?.IncludeHeaders,
            "IncludeHeaders is not in configuration either, and its default is true. A false "
                + "here means you left it as the type's default rather than setting one.");
    }

    [Fact]
    public async Task Ex3_TheAppKnowsWhichEnvironmentItIsRunningIn()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/environment");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/environment must answer 200 - reread README ex3.");

        var body = await response.Content.ReadFromJsonAsync<EnvironmentDto>();
        Teach.Equal("Development", body?.Name,
            "The gate boots the app in the Development environment, so IHostEnvironment "
                + "reports \"Development\".");
        Teach.Equal(true, body?.IsDevelopment,
            "IHostEnvironment has a method that answers this question - do not compare the "
                + "name to a string literal yourself.");
        Teach.Equal("Dojo Catalog", body?.CatalogTitle,
            "Read Dojo:Catalog:Title straight out of IConfiguration with the colon-separated "
                + "key. Configuration is a flat dictionary of paths, not a tree of objects.");

        using var staging = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Staging"));
        using var stagingClient = staging.CreateClient();

        var stagingBody = await stagingClient.GetFromJsonAsync<EnvironmentDto>("/l04/environment");
        Teach.Equal("Staging", stagingBody?.Name,
            "The same code, booted with a different environment name, must report that name. "
                + "A hard-coded \"Development\" passes the first check and fails here.");
        Teach.Equal(false, stagingBody?.IsDevelopment,
            "Staging is not Development, so IsDevelopment() is false.");
    }

    [Fact]
    public async Task Challenge_EachFeedGetsItsOwnNamedOptions()
    {
        using var client = factory.CreateClient();

        var primary = await client.GetAsync("/l04/feeds/primary");
        await Teach.Status(HttpStatusCode.OK, primary,
            "GET /l04/feeds/primary must answer 200 - reread README challenge.");
        var primaryBody = await primary.Content.ReadFromJsonAsync<FeedDto>();
        Teach.Equal("https://primary.example/feed", primaryBody?.Url,
            "The \"primary\" name has to select the Dojo:Feeds:primary section.");
        Teach.Equal(5, primaryBody?.TimeoutSeconds,
            "primary's timeout is 5 seconds.");

        var fallback = await client.GetFromJsonAsync<FeedDto>("/l04/feeds/fallback");
        Teach.Equal("https://fallback.example/feed", fallback?.Url,
            "…and \"fallback\" has to select a different section. Two names, two option "
                + "instances, one options class.");
        Teach.Equal(30, fallback?.TimeoutSeconds,
            "fallback's timeout is 30 seconds. Getting 5 here means both names resolve to "
                + "the same registration.");

        var unknown = await client.GetAsync("/l04/feeds/nope");
        await Teach.Status(HttpStatusCode.NotFound, unknown,
            "There is no Dojo:Feeds:nope section. IOptionsMonitor.Get(\"nope\") happily "
                + "returns an unbound object with default values, so the endpoint has to ask "
                + "configuration whether the name exists before trusting it.");
    }

    [Fact]
    public async Task Review1_MailerOptionsBindAndDefault()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l04/review/mailer");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l04/review/mailer must answer 200 - reread README review.");

        var body = await response.Content.ReadFromJsonAsync<MailerDto>();
        Teach.Equal("dojo@example.com", body?.FromAddress,
            "Dojo:Mailer:FromAddress is the one value configuration supplies.");
        Teach.Equal("Dojo", body?.DisplayName,
            "DisplayName is not configured, so your default of \"Dojo\" has to show up.");
        Teach.Equal(3, body?.RetryCount,
            "RetryCount is not configured either; its default is 3, not 0.");
    }

    private sealed record CatalogDto(string? Title, int PageSize, string? Currency);

    private sealed record ReportDto(int MaxRows, string? Format, bool IncludeHeaders);

    private sealed record EnvironmentDto(string? Name, bool IsDevelopment, string? CatalogTitle);

    private sealed record FeedDto(string? Name, string? Url, int TimeoutSeconds);

    private sealed record MailerDto(string? FromAddress, string? DisplayName, int RetryCount);
}
```

In plain English: ex1 and ex2 read values that live in `appsettings.json`, so
they prove binding actually happened rather than that you typed the right
constants. ex3 boots the application a second time with
`WithWebHostBuilder(… UseEnvironment("Staging") …)` — a whole second host, in
memory, in the same test — which is how you assert that behaviour really does
follow the environment. The challenge checks that two names give two different
answers, and that an unconfigured name is a 404 rather than a bag of defaults.

## The teaching point

The rule to carry out of this lesson: **anything that differs between
environments is configuration, and anything that is configuration gets a
default in code.** Connection strings, external URLs, timeouts, feature flags,
page sizes, retry counts. Not secrets in `appsettings.json`, though — that file
is in source control, and the answer for a real secret is user secrets locally
and environment variables or a key vault in production.

The options pattern's quieter benefit is that it turns "what does this feature
need?" into a class you can read. A new colleague can open `CatalogOptions` and
see the complete list of knobs, with their defaults, in one place — which is a
much better answer than grepping for `configuration[`.

Next: **05_efcore_basics**, where the data stops being a static list and starts
being a database, and everything you know about SQL becomes relevant again.
