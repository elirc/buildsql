# d08 — Configuration drills

Eight problems on `IConfiguration`: reading keys, binding sections, arrays,
connection strings, missing sections, walking keys you did not write, the
binder's conversions, and an environment-aware override chain. They drill lesson
**04_configuration_options** — go back to it if "configuration is a flat
dictionary" is not yet how you picture it.

Every endpoint is under `/d08/…` and takes `IConfiguration` (and, in ex8,
`IHostEnvironment`) as a handler parameter. The gate boots the application with
its own in-memory settings for each exercise, which is also the answer to "how
do I test configuration-dependent code".

## Exercise 1 — read three keys

Edit `src/Api/D08_Configuration/Ex1.cs`. `GET /d08/site` → **200** with
`{"title": …, "pageSize": …, "beta": …}` from `Dojo:D08:Site:Title`,
`:PageSize` and `:Beta`.

Missing values fall back to `(untitled)`, `10` and `false`.

```
uv run dojo test dotnet d08_configuration ex1
```

## Exercise 2 — bind a section onto an object

Edit `src/Api/D08_Configuration/Ex2.cs`. `GET /d08/mailer` → **200** with
`{"from": …, "retries": …}` bound from `Dojo:D08:Mailer` onto `MailerSettings`.

Keys the section does not mention must keep the class defaults.

```
uv run dojo test dotnet d08_configuration ex2
```

## Exercise 3 — arrays

Edit `src/Api/D08_Configuration/Ex3.cs`. `GET /d08/mirrors` → **200** with
`{"mirrors": [ … ], "count": …}` from `Dojo:D08:Mirrors`, in configuration
order. No section at all is an empty list and a count of 0 — never null, never a
404.

```
uv run dojo test dotnet d08_configuration ex3
```

## Exercise 4 — connection strings

Edit `src/Api/D08_Configuration/Ex4.cs`. `GET /d08/connections/{name}` →
**200** with `{"name": …, "value": …}` for a connection string this application
has, **404** for one it does not.

```
uv run dojo test dotnet d08_configuration ex4
```

## Exercise 5 — a section that is not there

Edit `src/Api/D08_Configuration/Ex5.cs`. `GET /d08/limits` → **200** with
`{"section": …, "maxItems": …, "timeoutSeconds": …}`:

- `section` — whether `Dojo:D08:Limits` exists at all
- `maxItems` — `Dojo:D08:Limits:MaxItems`, or **50**
- `timeoutSeconds` — `Dojo:D08:Limits:TimeoutSeconds`, or **30**

```
uv run dojo test dotnet d08_configuration ex5
```

## Exercise 6 — walk keys you did not write

Edit `src/Api/D08_Configuration/Ex6.cs`. `Dojo:D08:Features` maps feature names
to booleans, and nothing in your code knows the names. `GET /d08/features` →
**200** with `{"enabled": [ … ], "known": …}` — the true ones, sorted A–Z, and a
count of every key in the section.

```
uv run dojo test dotnet d08_configuration ex6
```

## Exercise 7 — one bind, a whole tree

Edit `src/Api/D08_Configuration/Ex7.cs`. Bind `Dojo:D08:Feed` onto
`FeedSettings` in **one** call — an enum, two `TimeSpan`s, a list of objects and
a nested object — and report it as
`{"mode": …, "intervalSeconds": …, "endpoints": ["url|weight", …], "retryCount": …, "backoffSeconds": …}`.

Anything configuration does not mention keeps its default, at every depth.

```
uv run dojo test dotnet d08_configuration ex7
```

## Exercise 8 — the environment picks the override

Edit `src/Api/D08_Configuration/Ex8.cs`. `GET /d08/effective/{key}` → **200**
with `{"key": …, "value": …, "source": …, "environment": …}`, where the value is
the first of these configuration actually has:

1. `Dojo:D08:Overrides:{environment}:{key}` → source `environment`
2. `Dojo:D08:Overrides:Default:{key}` → source `default`
3. neither → value `none`, source `none`

The environment name comes from `IHostEnvironment`, never from a literal — the
gate boots the same configuration twice, as Staging and as Development.

```
uv run dojo test dotnet d08_configuration ex8
```

## The gate

This is the entire gate class, `tests/Gates/D08_ConfigurationTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace DotnetDojo.Gates;

public class D08_ConfigurationTests
{
    [Fact]
    public async Task Ex1_ValuesComeOutOfAFlatDictionaryOfPaths()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D08:Site:Title"] = "Dojo",
            ["Dojo:D08:Site:PageSize"] = "25",
            ["Dojo:D08:Site:Beta"] = "true",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/site");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/site must answer 200 - reread README ex1.");

        var body = await response.Content.ReadFromJsonAsync<SiteDto>();
        Teach.Equal("Dojo", body?.Title,
            "The key is the whole colon-separated path, Dojo:D08:Site:Title. Configuration is "
                + "a flat dictionary, not a tree of objects you navigate.");
        Teach.Equal(25, body?.PageSize,
            "Every configuration value is a string; GetValue<int> is what turns \"25\" into "
                + "25. int.Parse on a null would have thrown.");
        Teach.Equal(true, body?.Beta, "…and \"true\" into a bool.");

        using var bare = Configured(root, []);
        using var bareClient = bare.CreateClient();

        var defaults = await bareClient.GetFromJsonAsync<SiteDto>("/d08/site");
        Teach.Equal("(untitled)", defaults?.Title,
            "A key that is not there reads as null, and the fallback has to survive.");
        Teach.Equal(10, defaults?.PageSize, "…the page size falls back to 10…");
        Teach.Equal(false, defaults?.Beta, "…and beta to false.");
    }

    [Fact]
    public async Task Ex2_APartialSectionLeavesTheDefaultsAlone()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D08:Mailer:From"] = "ops@example.com",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/mailer");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/mailer must answer 200 - reread README ex2.");

        var body = await response.Content.ReadFromJsonAsync<MailerDto>();
        Teach.Equal("ops@example.com", body?.From,
            "The one configured key wins over the class default.");
        Teach.Equal(3, body?.Retries,
            "Nothing configures Retries, so the class default has to survive. A 0 means the "
                + "object was rebuilt without its initialisers, or the property was blanked - "
                + "the binder only writes properties it found keys for.");

        using var full = Configured(root, new()
        {
            ["Dojo:D08:Mailer:From"] = "alerts@example.com",
            ["Dojo:D08:Mailer:Retries"] = "7",
        });
        using var fullClient = full.CreateClient();

        var both = await fullClient.GetFromJsonAsync<MailerDto>("/d08/mailer");
        Teach.Equal(7, both?.Retries, "…and a configured Retries wins.");
    }

    [Fact]
    public async Task Ex3_AnArrayIsJustNumberedKeys()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D08:Mirrors:0"] = "eu",
            ["Dojo:D08:Mirrors:1"] = "us",
            ["Dojo:D08:Mirrors:2"] = "ap",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/mirrors");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/mirrors must answer 200 - reread README ex3.");

        var body = await response.Content.ReadFromJsonAsync<MirrorDto>();
        Teach.Equal("eu,us,ap", string.Join(",", body?.Mirrors ?? []),
            "A JSON array becomes keys named 0, 1, 2, and the binder puts them back in that "
                + "order. This is also why a later configuration source cannot remove an item "
                + "from an array - it can only overwrite index by index.");
        Teach.Equal(3, body?.Count, "…three of them.");

        using var bare = Configured(root, []);
        using var bareClient = bare.CreateClient();

        var empty = await bareClient.GetAsync("/d08/mirrors");
        await Teach.Status(HttpStatusCode.OK, empty,
            "No section at all is still a 200 - an application with no mirrors configured is "
                + "not a broken application.");
        var emptyBody = await empty.Content.ReadFromJsonAsync<MirrorDto>();
        Teach.Equal(0, emptyBody?.Count,
            "…with an empty list. Get<List<string>> returns null for a missing section, so "
                + "that null has to become a list somewhere.");
    }

    [Fact]
    public async Task Ex4_ConnectionStringsHaveTheirOwnAccessor()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["ConnectionStrings:catalog"] = "Data Source=catalog.db",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/connections/catalog");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/connections/catalog must answer 200 - reread README ex4.");

        var body = await response.Content.ReadFromJsonAsync<ConnectionDto>();
        Teach.Equal("Data Source=catalog.db", body?.Value,
            "GetConnectionString(name) is GetSection(\"ConnectionStrings\")[name] with a "
                + "shorter spelling - and the convention every hosting provider writes into.");

        var missing = await client.GetAsync("/d08/connections/reporting");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Nothing configures a \"reporting\" connection string, and a null is a 404 rather "
                + "than a 200 with an empty value.");
    }

    [Fact]
    public async Task Ex5_ASectionThatIsNotThereIsNotAnError()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D08:Limits:MaxItems"] = "5",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/limits");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/limits must answer 200 - reread README ex5.");

        var body = await response.Content.ReadFromJsonAsync<LimitsDto>();
        Teach.Equal(true, body?.Section,
            "The section has a child, so it exists. Note GetSection NEVER returns null - it "
                + "hands back an empty section - which is why Exists() has to be asked.");
        Teach.Equal(5, body?.MaxItems, "The configured limit wins…");
        Teach.Equal(30, body?.TimeoutSeconds,
            "…and the one nobody configured falls back to 30 rather than 0.");

        using var bare = Configured(root, []);
        using var bareClient = bare.CreateClient();

        var none = await bareClient.GetFromJsonAsync<LimitsDto>("/d08/limits");
        Teach.Equal(false, none?.Section,
            "With no keys under it at all, the section does not exist - and asking for it "
                + "still did not throw.");
        Teach.Equal(50, none?.MaxItems, "…so both defaults apply.");
    }

    [Fact]
    public async Task Ex6_YouCanWalkASectionWhoseKeysYouDoNotKnow()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D08:Features:alpha"] = "true",
            ["Dojo:D08:Features:beta"] = "false",
            ["Dojo:D08:Features:gamma"] = "true",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/features");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/features must answer 200 - reread README ex6.");

        var body = await response.Content.ReadFromJsonAsync<FeatureDto>();
        Teach.Equal("alpha,gamma", string.Join(",", body?.Enabled ?? []),
            "Only the true ones, sorted A-Z. \"beta\" appearing means the value was read as a "
                + "string and tested for truthiness rather than converted to a bool - and a "
                + "non-empty string is not the same thing as true.");
        Teach.Equal(3, body?.Known,
            "…and all three keys are known, because a feature switched off is still a feature "
                + "the application knows about.");

        using var bare = Configured(root, []);
        using var bareClient = bare.CreateClient();

        var none = await bareClient.GetFromJsonAsync<FeatureDto>("/d08/features");
        Teach.Equal(0, none?.Known,
            "An absent section has no children, and enumerating it is still safe.");
    }

    [Fact]
    public async Task Ex7_OneBindCallConvertsAWholeTree()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D08:Feed:Mode"] = "Push",
            ["Dojo:D08:Feed:Interval"] = "00:01:30",
            ["Dojo:D08:Feed:Endpoints:0:Url"] = "primary",
            ["Dojo:D08:Feed:Endpoints:0:Weight"] = "1",
            ["Dojo:D08:Feed:Endpoints:1:Url"] = "backup",
            ["Dojo:D08:Feed:Endpoints:1:Weight"] = "2",
            ["Dojo:D08:Feed:Retry:Count"] = "5",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d08/feed");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d08/feed must answer 200 - reread README ex7.");

        var body = await response.Content.ReadFromJsonAsync<FeedDto>();
        Teach.Equal("Push", body?.Mode,
            "The binder converts an enum by NAME, case-insensitively - and by number too, "
                + "which is how a typo becomes a silently valid value.");
        Teach.Equal(90, body?.IntervalSeconds,
            "\"00:01:30\" is a TimeSpan, converted by the binder without you writing a parse.");
        Teach.Equal("primary|1,backup|2", string.Join(",", body?.Endpoints ?? []),
            "A list of OBJECTS binds from Endpoints:0:Url, Endpoints:0:Weight and so on - "
                + "index first, then property.");
        Teach.Equal(5, body?.RetryCount, "The nested object binds too…");
        Teach.Equal(2, body?.BackoffSeconds,
            "…and the part of it nobody configured keeps its default of 2 seconds. The binder "
                + "never blanks a property it found no key for, at any depth.");

        using var bare = Configured(root, []);
        using var bareClient = bare.CreateClient();

        var defaults = await bareClient.GetFromJsonAsync<FeedDto>("/d08/feed");
        Teach.Equal("Poll", defaults?.Mode, "With no section at all, every default applies…");
        Teach.Equal(300, defaults?.IntervalSeconds, "…including the five-minute interval.");
    }

    [Fact]
    public async Task Ex8_TheEnvironmentPicksWhichOverrideWins()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Dojo:D08:Overrides:Default:theme"] = "light",
            ["Dojo:D08:Overrides:Default:locale"] = "en",
            ["Dojo:D08:Overrides:Staging:theme"] = "dark",
        };

        using var root = new DojoWebFactory();
        using var staging = Configured(root, settings, "Staging");
        using var client = staging.CreateClient();

        var theme = await client.GetAsync("/d08/effective/theme");
        await Teach.Status(HttpStatusCode.OK, theme,
            "GET /d08/effective/theme must answer 200 - reread README ex8.");

        var body = await theme.Content.ReadFromJsonAsync<EffectiveDto>();
        Teach.Equal("Staging", body?.Environment,
            "The environment name comes from IHostEnvironment, not from a literal.");
        Teach.Equal("dark", body?.Value,
            "Staging has its own theme, and the environment-specific branch is looked at "
                + "first.");
        Teach.Equal("environment", body?.Source, "…and the answer says where it came from.");

        var locale = await client.GetFromJsonAsync<EffectiveDto>("/d08/effective/locale");
        Teach.Equal("en", locale?.Value,
            "Staging says nothing about the locale, so the default branch answers.");
        Teach.Equal("default", locale?.Source, "…and the source reflects that.");

        var unknown = await client.GetFromJsonAsync<EffectiveDto>("/d08/effective/nope");
        Teach.Equal("none", unknown?.Value, "Neither branch has it at all…");
        Teach.Equal("none", unknown?.Source,
            "…and the endpoint says so rather than throwing. A missing key is a normal state "
                + "of the world.");

        using var development = Configured(root, settings, "Development");
        using var developmentClient = development.CreateClient();

        var devTheme = await developmentClient.GetFromJsonAsync<EffectiveDto>("/d08/effective/theme");
        Teach.Equal("light", devTheme?.Value,
            "The SAME configuration, read in a different environment, must fall through to "
                + "the default - there is no Development branch. A \"dark\" here means the "
                + "environment name was hard-coded.");
        Teach.Equal("Development", devTheme?.Environment, "…and the name reported is this one.");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helper is `Configured` — a `WithWebHostBuilder` that adds an
in-memory configuration source and optionally sets the environment — plus eight
`private sealed record` DTOs. That helper is worth reading twice: it is how you
test configuration-dependent code without a file on disk.
