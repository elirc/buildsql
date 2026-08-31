# d09 — Options and validation drills

Eight problems on the options pattern: binding a section, data annotations, a
predicate, a validator class, named instances, `PostConfigure`,
`ValidateOnStart`, and all of it at once. They drill lesson
**04_configuration_options** — go back to it if `IOptions<T>` still feels like
a wrapper for no reason.

Everything is under `/d09/…`. Every endpoint is already written: it resolves the
options and answers with them, or answers **500** with `{"messages": [ … ]}` when
validation refused — see `src/Api/D09_OptionsValidation/Support.cs`. Your work is
in the `IServiceRegistrar` of each file.

The gate boots the application with its own in-memory settings per case, which
is also the answer to "how do I test a configuration-dependent service".

## Exercise 1 — a section, a class, an `IOptions<T>`

Edit `src/Api/D09_OptionsValidation/Ex1.cs`, `Ex1Services` only. Bind
`ArchiveOptions` to `Dojo:D09:Archive`.

`GET /d09/archive` then reports the configured bucket and retention — and the
class defaults when nothing is configured.

```
uv run dojo test dotnet d09_options_validation ex1
```

## Exercise 2 — data annotations

Edit `src/Api/D09_OptionsValidation/Ex2.cs`. Make `Host` required and `Port`
between 1 and 65535, bind `Dojo:D09:Smtp`, and make those attributes actually
run.

Valid settings → **200**. A missing host or an out-of-range port → **500** whose
`messages` name the property.

```
uv run dojo test dotnet d09_options_validation ex2
```

## Exercise 3 — a rule no attribute can express

Edit `src/Api/D09_OptionsValidation/Ex3.cs`, `Ex3Services` only. Bind
`Dojo:D09:Window` and add the rule that `End` must be greater than `Start`, with
exactly this message:

```
End must be after Start.
```

```
uv run dojo test dotnet d09_options_validation ex3
```

## Exercise 4 — a validator class

Edit `src/Api/D09_OptionsValidation/Ex4.cs`. Fill in `QuotaOptionsValidator` so
it returns **every** reason at once, and register it:

- `Daily must be at least 1.` — when `Daily` is below 1
- `Burst must not exceed Daily.` — when it does
- `Tier '…' is not a tier.` — when `Tier` is not one of `QuotaOptionsValidator.Tiers`

```
uv run dojo test dotnet d09_options_validation ex4
```

## Exercise 5 — named instances

Edit `src/Api/D09_OptionsValidation/Ex5.cs`. One named registration per name in
`Ex5Services.Names`, each bound to `Dojo:D09:Feeds:{name}` and each carrying the
rule that `Url` must not be blank, with the message `Url is required.`

Then `GET /d09/feeds/{name}` → **200** with `{"name": …, "url": …,
"timeoutSeconds": …}`, **404** for a name this application does not configure,
and **500** when that named instance fails validation.

```
uv run dojo test dotnet d09_options_validation ex5
```

## Exercise 6 — the pass that runs last

Edit `src/Api/D09_OptionsValidation/Ex6.cs`, `Ex6Services` only. After binding,
fill in the blanks: a blank `FileName` becomes `report.csv`, and `FullPath`
becomes `{Folder}/{FileName}`.

A configured file name must survive.

```
uv run dojo test dotnet d09_options_validation ex6
```

## Exercise 7 — fail at startup, not at 3am

Edit `src/Api/D09_OptionsValidation/Ex7.cs`, `Ex7Services` only. Bind
`Dojo:D09:License`, require that `Seats` is positive with the message
`Seats must be positive.`, and make that check run when the application
**starts**.

The class defaults are deliberately valid, so an unconfigured application still
boots. A configured `Seats` of 0 must stop it dead.

```
uv run dojo test dotnet d09_options_validation ex7
```

## Exercise 8 — bind, derive, validate twice

Edit `src/Api/D09_OptionsValidation/Ex8.cs`. Bind `Dojo:D09:Pipeline`, then:

- `Name` is required and `Workers` must be between 1 and 64 (annotations)
- `Label` is derived as `{Name}:{Mode}:{Workers}` after binding
- `Mode` must be one of `Ex8Services.Modes`, with the message
  `Mode must be batch or stream.`

Both kinds of validation have to be registered: adding one does not imply the
other.

```
uv run dojo test dotnet d09_options_validation ex8
```

## The gate

This is the entire gate class, `tests/Gates/D09_OptionsValidationTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace DotnetDojo.Gates;

public class D09_OptionsValidationTests
{
    [Fact]
    public async Task Ex1_TheSectionArrivesAsAnOptionsObject()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Archive:Bucket"] = "dojo-archive",
            ["Dojo:D09:Archive:RetentionDays"] = "90",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d09/archive");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d09/archive must answer 200 - reread README ex1.");

        var body = await response.Content.ReadFromJsonAsync<ArchiveDto>();
        Teach.Equal("dojo-archive", body?.Bucket,
            "An empty bucket means nothing was bound: IOptions<T> always resolves, even when "
                + "no one told it where to read from, and hands back a default-constructed "
                + "object. That silence is the thing to watch for.");
        Teach.Equal(90, body?.RetentionDays, "…and the configured retention wins over the 30.");

        using var bare = Configured(root, []);
        using var bareClient = bare.CreateClient();

        var defaults = await bareClient.GetFromJsonAsync<ArchiveDto>("/d09/archive");
        Teach.Equal(30, defaults?.RetentionDays,
            "With nothing configured, the class defaults survive - binding never blanks a "
                + "property it found no key for.");
    }

    [Fact]
    public async Task Ex2_DataAnnotationsAreCheckedOnFirstUse()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Smtp:Host"] = "mail.example.com",
            ["Dojo:D09:Smtp:Port"] = "2525",
        });
        using var client = host.CreateClient();

        var ok = await client.GetAsync("/d09/smtp");
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /d09/smtp with valid settings must answer 200 - reread README ex2.");
        var body = await ok.Content.ReadFromJsonAsync<SmtpDto>();
        Teach.Equal("mail.example.com", body?.Host, "…with the configured host…");
        Teach.Equal(2525, body?.Port, "…and port.");

        using var noHost = Configured(root, new() { ["Dojo:D09:Smtp:Port"] = "25" });
        using var noHostClient = noHost.CreateClient();

        var missing = await noHostClient.GetAsync("/d09/smtp");
        await Teach.Status(HttpStatusCode.InternalServerError, missing,
            "Host is required and nothing configured it, so resolving the options has to "
                + "throw. A 200 means ValidateDataAnnotations was never added - the attributes "
                + "on their own do nothing.");
        Teach.True((await Messages(missing)).Contains("Host"),
            "…and the failure names the property that was wrong.");

        using var badPort = Configured(root, new()
        {
            ["Dojo:D09:Smtp:Host"] = "mail.example.com",
            ["Dojo:D09:Smtp:Port"] = "70000",
        });
        using var badPortClient = badPort.CreateClient();

        var range = await badPortClient.GetAsync("/d09/smtp");
        await Teach.Status(HttpStatusCode.InternalServerError, range, "70000 is not a port.");
        Teach.True((await Messages(range)).Contains("Port"), "…and the failure says so.");
    }

    [Fact]
    public async Task Ex3_ARuleThatSpansTwoPropertiesNeedsAPredicate()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Window:Start"] = "9",
            ["Dojo:D09:Window:End"] = "17",
        });
        using var client = host.CreateClient();

        var ok = await client.GetAsync("/d09/window");
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /d09/window with a sensible window must answer 200 - reread README ex3.");
        var body = await ok.Content.ReadFromJsonAsync<WindowDto>();
        Teach.Equal(9, body?.Start, "…with the configured start…");
        Teach.Equal(17, body?.End, "…and end.");

        using var backwards = Configured(root, new()
        {
            ["Dojo:D09:Window:Start"] = "17",
            ["Dojo:D09:Window:End"] = "9",
        });
        using var backwardsClient = backwards.CreateClient();

        var bad = await backwardsClient.GetAsync("/d09/window");
        await Teach.Status(HttpStatusCode.InternalServerError, bad,
            "Both values are individually fine and together they are nonsense, which is "
                + "exactly the class of rule no attribute can express: Validate takes a "
                + "predicate over the WHOLE object.");
        Teach.Equal("End must be after Start.", await Messages(bad),
            "…and the message is the one you passed to Validate. Note it is the only thing "
                + "the operator will see, so it has to say what to change.");
    }

    [Fact]
    public async Task Ex4_AValidatorClassCanGiveEveryReasonAtOnce()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Quota:Daily"] = "1000",
            ["Dojo:D09:Quota:Burst"] = "50",
            ["Dojo:D09:Quota:Tier"] = "pro",
        });
        using var client = host.CreateClient();

        var ok = await client.GetAsync("/d09/quota");
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /d09/quota with a valid quota must answer 200 - reread README ex4.");
        Teach.Equal(1000, (await ok.Content.ReadFromJsonAsync<QuotaDto>())?.Daily,
            "…with the configured daily quota.");

        using var broken = Configured(root, new()
        {
            ["Dojo:D09:Quota:Daily"] = "0",
            ["Dojo:D09:Quota:Burst"] = "5",
            ["Dojo:D09:Quota:Tier"] = "gold",
        });
        using var brokenClient = broken.CreateClient();

        var bad = await brokenClient.GetAsync("/d09/quota");
        await Teach.Status(HttpStatusCode.InternalServerError, bad,
            "Three things are wrong at once. A 200 means the validator was written but never "
                + "registered - an IValidateOptions<T> that is not in the container never runs.");

        var messages = await MessageList(bad);
        Teach.Equal(3, messages.Count,
            "All three reasons, in one answer. Returning on the first failure makes an "
                + "operator fix one thing, redeploy, and discover the next - which is the "
                + "whole reason ValidateOptionsResult.Fail takes a collection.\n  got: "
                + string.Join(" | ", messages));
        Teach.True(messages.Any(m => m.Contains("Daily")), "…one about Daily…");
        Teach.True(messages.Any(m => m.Contains("Burst")), "…one about Burst…");
        Teach.True(messages.Any(m => m.Contains("gold")),
            "…and one naming the tier it did not recognise.");
    }

    [Fact]
    public async Task Ex5_NamedInstancesAreConfiguredAndValidatedSeparately()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Feeds:primary:Url"] = "https://primary.example/feed",
            ["Dojo:D09:Feeds:primary:TimeoutSeconds"] = "5",
            ["Dojo:D09:Feeds:backup:TimeoutSeconds"] = "30",
        });
        using var client = host.CreateClient();

        var primary = await client.GetAsync("/d09/feeds/primary");
        await Teach.Status(HttpStatusCode.OK, primary,
            "GET /d09/feeds/primary must answer 200 - reread README ex5.");
        var body = await primary.Content.ReadFromJsonAsync<FeedDto>();
        Teach.Equal("https://primary.example/feed", body?.Url,
            "The name selects which section this instance binds to.");
        Teach.Equal(5, body?.TimeoutSeconds, "…and its own timeout.");

        var backup = await client.GetAsync("/d09/feeds/backup");
        await Teach.Status(HttpStatusCode.InternalServerError, backup,
            "The backup feed has a timeout and no URL, so ITS validation fails - while "
                + "primary above is perfectly fine. Validation is per named instance, not per "
                + "options class.");
        Teach.Equal("Url is required.", await Messages(backup), "…with your message.");

        var unknown = await client.GetAsync("/d09/feeds/nope");
        await Teach.Status(HttpStatusCode.NotFound, unknown,
            "Nothing registers a \"nope\" feed. Get(name) does NOT throw for an unknown name - "
                + "it cheerfully hands back an unbound object with default values - so the "
                + "endpoint has to know which names exist.");
    }

    [Fact]
    public async Task Ex6_PostConfigureRunsAfterEverythingElse()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Report:Folder"] = "/var/out",
        });
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d09/report");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d09/report must answer 200 - reread README ex6.");

        var body = await response.Content.ReadFromJsonAsync<ReportDto>();
        Teach.Equal("report.csv", body?.FileName,
            "Nothing configured a file name, so the post-configure pass filled it in.");
        Teach.Equal("/var/out/report.csv", body?.FullPath,
            "…and the derived path used the value it had just filled in. That ordering is the "
                + "point: PostConfigure runs after every binding and every Configure, so it "
                + "is the only place that can see the final state.");

        using var named = Configured(root, new()
        {
            ["Dojo:D09:Report:Folder"] = "/var/out",
            ["Dojo:D09:Report:FileName"] = "daily.csv",
        });
        using var namedClient = named.CreateClient();

        var configured = await namedClient.GetFromJsonAsync<ReportDto>("/d09/report");
        Teach.Equal("/var/out/daily.csv", configured?.FullPath,
            "A configured file name has to survive - a PostConfigure that overwrites rather "
                + "than fills in takes the operator's setting away.");
    }

    [Fact]
    public void Ex7_ValidateOnStartTurnsABadSettingIntoAFailedDeploy()
    {
        using var root = new DojoWebFactory();

        using (var good = Configured(root, new() { ["Dojo:D09:License:Seats"] = "20" }))
        {
            var boots = Record.Exception(() => good.CreateClient());
            Teach.True(boots is null,
                "A valid configuration still has to start. If this throws, the rule is "
                    + "rejecting something it should accept - reread README ex7.\n  " + boots);
        }

        using var bad = Configured(root, new() { ["Dojo:D09:License:Seats"] = "0" });

        var failure = Record.Exception(() => bad.CreateClient());

        Teach.True(failure is not null,
            "Zero seats is invalid, and the application must refuse to START rather than "
                + "answer requests until something happens to touch this option. Without "
                + "ValidateOnStart the failure waits for first use, which in production means "
                + "it waits for a user.");
        Teach.True(failure!.ToString().Contains("Seats must be positive"),
            "…and the startup failure carries your message, so whoever is watching the deploy "
                + "knows which setting to fix.\n  " + failure);
    }

    [Fact]
    public async Task Ex8_BindDeriveAndValidateTwice()
    {
        using var root = new DojoWebFactory();
        using var host = Configured(root, new()
        {
            ["Dojo:D09:Pipeline:Name"] = "ingest",
            ["Dojo:D09:Pipeline:Workers"] = "8",
            ["Dojo:D09:Pipeline:Mode"] = "stream",
        });
        using var client = host.CreateClient();

        var ok = await client.GetAsync("/d09/pipeline");
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /d09/pipeline with a valid pipeline must answer 200 - reread README ex8.");

        var body = await ok.Content.ReadFromJsonAsync<PipelineDto>();
        Teach.Equal("ingest:stream:8", body?.Label,
            "The label is derived from all three configured values, which means the derivation "
                + "ran AFTER the binding.");

        using var noName = Configured(root, new() { ["Dojo:D09:Pipeline:Workers"] = "8" });
        using var noNameClient = noName.CreateClient();
        var nameless = await noNameClient.GetAsync("/d09/pipeline");
        await Teach.Status(HttpStatusCode.InternalServerError, nameless,
            "A pipeline with no name is not a pipeline.");
        Teach.True((await Messages(nameless)).Contains("Name"),
            "…and the annotation says which property.");

        using var tooMany = Configured(root, new()
        {
            ["Dojo:D09:Pipeline:Name"] = "ingest",
            ["Dojo:D09:Pipeline:Workers"] = "100",
        });
        using var tooManyClient = tooMany.CreateClient();
        var workers = await tooManyClient.GetAsync("/d09/pipeline");
        await Teach.Status(HttpStatusCode.InternalServerError, workers,
            "100 workers is outside the range the annotation allows.");
        Teach.True((await Messages(workers)).Contains("Workers"), "…and it says so.");

        using var badMode = Configured(root, new()
        {
            ["Dojo:D09:Pipeline:Name"] = "ingest",
            ["Dojo:D09:Pipeline:Mode"] = "banana",
        });
        using var badModeClient = badMode.CreateClient();
        var mode = await badModeClient.GetAsync("/d09/pipeline");
        await Teach.Status(HttpStatusCode.InternalServerError, mode,
            "\"banana\" is not a mode, and no attribute could have said so - that is the "
                + "predicate's job.");
        Teach.True((await Messages(mode)).Contains("Mode must be batch or stream"),
            "…with your message. Both kinds of validation have to be registered: adding one "
                + "does not imply the other.");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helper is `Configured` (a `WithWebHostBuilder` adding an in-memory
configuration source), `MessageList`/`Messages` (readers over the 500 body), and
eight `private sealed record` DTOs.
