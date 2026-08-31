using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;

namespace DotnetDojo.Gates;

public class D19_LoggingTests
{
    [Fact]
    public async Task Ex1_ATemplateNotAString()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var started = await client.PostAsync("/d19/picks/41/start", null);
        await Teach.Status(HttpStatusCode.OK, started,
            "POST /d19/picks/41/start must answer 200 - reread README ex1.");
        var body = await started.Content.ReadFromJsonAsync<StartedDto>();
        Teach.Equal("SO-1001", body?.OrderRef, "Pick 41 is order SO-1001.");

        var entry = Single(host, "Exactly one entry for the start.");
        Teach.Equal(LogLevel.Information, entry.Level, "A pick starting is ordinary news.");

        Teach.Equal("41", Prop(entry, "PickId"),
            "There is no PickId property on this entry. An interpolated string is rendered "
                + "before the logger ever sees it, so the values are baked into one opaque "
                + "sentence and the only query left is a substring search.\n" + host.Logs.Dump());
        Teach.Equal("SO-1001", Prop(entry, "OrderRef"),
            "...and no OrderRef either. \"Show me every start for SO-1001\" has to be a field "
                + "match, or it stops working the day somebody rewords the sentence.");

        Teach.True(entry.Message.Contains("41") && entry.Message.Contains("SO-1001"),
            "The rendered message still reads naturally - a template gives you BOTH the "
                + "sentence a human reads and the fields a query uses.\n  message: "
                + entry.Message);

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsync("/d19/picks/99/start", null),
            "There is no pick 99.");
    }

    [Fact]
    public async Task Ex2_TheLevelIsAClaimAboutWhoseProblemItIs()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        host.Logs.Clear();
        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d19/picks/99/scan", new { sku = "A-100" }),
            "There is no pick 99 - reread README ex2.");
        Teach.Equal(LogLevel.Information, Single(host, "One entry for the 404.").Level,
            "A caller asking for a pick that does not exist is not an incident. It is a "
                + "Tuesday. Logging it at Warning or Error means the alert that fires on "
                + "Errors fires on other people's typos, and within a month nobody reads it.");

        host.Logs.Clear();
        var wrongSku = await client.PostAsJsonAsync("/d19/picks/41/scan", new { sku = "Z-999" });
        await Teach.Status(HttpStatusCode.Conflict, wrongSku,
            "Z-999 is not on pick 41's list: 409.");
        var wrong = Single(host, "One entry for the wrong sku.");
        Teach.Equal(LogLevel.Information, wrong.Level,
            "...and scanning the wrong item is the picker's mistake, not the system's.");
        Teach.Equal("Z-999", Prop(wrong, "Sku"), "...with the sku as a property.");

        host.Logs.Clear();
        var empty = await client.PostAsJsonAsync("/d19/picks/41/scan", new { sku = "B-200" });
        await Teach.Status(HttpStatusCode.Conflict, empty,
            "B-200 is on the list and there are none in stock: also 409.");
        var short_ = Single(host, "One entry for the empty bin.");
        Teach.Equal(LogLevel.Warning, short_.Level,
            "THIS one is a Warning. The same status code, and a completely different meaning: "
                + "an item the system promised is not on the shelf, which somebody in the "
                + "warehouse needs to know about. The level is a claim about whose problem "
                + "it is, not about the HTTP status.");
        Teach.Equal("B-200", Prop(short_, "Sku"), "...naming the sku that is out.");

        host.Logs.Clear();
        var fine = await client.PostAsJsonAsync("/d19/picks/41/scan", new { sku = "A-100" });
        await Teach.Status(HttpStatusCode.OK, fine, "A-100 is on the list and in stock.");
        Teach.Equal(9, (await fine.Content.ReadFromJsonAsync<ScanDto>())?.OnHand, "Nine on hand.");
        Teach.Equal(LogLevel.Information, Single(host, "One entry for the good scan.").Level,
            "...and a successful scan is Information.");

        Teach.Equal(0, host.Logs.Entries.Count(e => e.Level >= LogLevel.Error),
            "Nothing in this endpoint is an Error. An Error means the server failed at "
                + "something it promised to do, and none of these four outcomes is that.\n"
                + host.Logs.Dump());
    }

    [Fact]
    public async Task Ex3_TheExceptionHasItsOwnParameter()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var boom = await client.GetAsync("/d19/picks/41/label");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "The printer always fails, and a caught fault is still a 500 - reread README ex3.");
        Teach.Equal("application/problem+json", boom.Content.Headers.ContentType?.MediaType,
            "...as problem details.");

        string raw = await boom.Content.ReadAsStringAsync();
        Teach.True(!raw.Contains("SPOOL-9f2c1"),
            "The exception message contains a printer spool token, and it is now in the "
                + "response body. The exception is for the log; the client gets a generic "
                + "detail.\n  body: " + raw);

        var entry = Single(host, "Exactly one entry for the failure.");
        Teach.Equal(LogLevel.Error, entry.Level, "A fault the server could not complete IS an Error.");
        Teach.True(entry.Exception is not null,
            "...and the exception has to go in the exception PARAMETER - "
                + "logger.LogError(ex, \"...\", ...) - not be concatenated into the message. "
                + "Flattened into text you lose the type, the stack trace and the inner "
                + "exceptions, which is everything you would actually have wanted.\n"
                + host.Logs.Dump());
        Teach.Equal("InvalidOperationException", entry.Exception?.GetType().Name,
            "...and it is the exception that was thrown, not a new one wrapping its message.");
        Teach.Equal("41", Prop(entry, "PickId"),
            "...with the pick as a named property, so the failure can be joined to the pick.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d19/picks/99/label"),
            "An unknown pick is still a 404, before the printer is ever asked.");
    }

    [Fact]
    public async Task Ex4_TheCategorySaysWhereTheLineCameFrom()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var found = await client.GetAsync("/d19/picks/42");
        await Teach.Status(HttpStatusCode.OK, found,
            "GET /d19/picks/42 must answer 200 - reread README ex4.");
        var pick = await found.Content.ReadFromJsonAsync<PickReadDto>();
        Teach.Equal("SO-1002", pick?.OrderRef, "Pick 42 is order SO-1002.");
        Teach.Equal(1, pick?.Lines, "...with one line.");

        var entry = Single(host, "One entry for the read.");
        Teach.Equal("DotnetDojo.Api.D19_Logging.Ex4", entry.Category,
            "The category is a hand-written string, so it does not follow the class when it "
                + "is renamed or moved, and it cannot be filtered by namespace - which is how "
                + "every logging configuration in .NET turns levels up and down. Inject "
                + "ILogger<Ex4> and the framework derives the category from the type.\n"
                + host.Logs.Dump());
        Teach.Equal("42", Prop(entry, "PickId"), "...still carrying the pick as a property.");

        host.Logs.Clear();
        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d19/picks/99"),
            "An unknown pick is a 404.");
        Teach.Equal("DotnetDojo.Api.D19_Logging.Ex4", Single(host, "One entry for the miss.").Category,
            "...logged under the same category, because it came from the same class.");
    }

    [Fact]
    public async Task Ex5_WhatMustNeverReachTheLog()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        const string Token = "TKN-88ff-secret";

        var sent = await client.PostAsJsonAsync("/d19/dispatch", new
        {
            orderRef = "SO-1001",
            courierCode = "fw",
            courierToken = Token,
        });
        await Teach.Status(HttpStatusCode.OK, sent,
            "POST /d19/dispatch must answer 200 - reread README ex5.");
        var result = await sent.Content.ReadFromJsonAsync<DispatchDto>();
        Teach.Equal("Fleetwing", result?.Courier, "fw is Fleetwing.");

        var entry = Single(host, "One entry for the dispatch.");
        Teach.Equal("SO-1001", Prop(entry, "OrderRef"), "The order goes in the log.");
        Teach.Equal("Fleetwing", Prop(entry, "Courier"),
            "...and the courier by NAME, which is what a human reading the log needs.");

        bool leaked = host.Logs.Entries.Any(e =>
            e.Message.Contains(Token)
            || e.State.Any(p => p.Value?.ToString()?.Contains(Token) == true));
        Teach.True(!leaked,
            "The courier's bearer token is in the log. Logging a whole request object logs "
                + "every field of it, including the ones nobody thought about - and a log "
                + "store is replicated, retained for years, and readable by far more people "
                + "than the database is. Name the fields you mean.\n" + host.Logs.Dump());

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsJsonAsync("/d19/dispatch",
            new { orderRef = "SO-1001", courierCode = "zz", courierToken = Token }),
            "An unknown courier code is a 404.");
    }

    [Fact]
    public async Task Ex6_OneLinePerRequestNotOnePerStep()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var done = await client.PostAsync("/d19/picks/41/complete", null);
        await Teach.Status(HttpStatusCode.OK, done,
            "POST /d19/picks/41/complete must answer 200 - reread README ex6.");
        var body = await done.Content.ReadFromJsonAsync<CompletedDto>();
        Teach.Equal(3, body?.Items, "Pick 41 wants 2 kettles and 1 toaster: 3 items.");

        var entry = Single(host,
            "Six entries to say one thing. Every extra line is a row in the log store, a "
                + "line on the bill, and something between the reader and the entry that "
                + "matters - and \"Entering Complete\" is what a debugger is for. One "
                + "request, one entry, carrying everything worth knowing.");
        Teach.Equal(LogLevel.Information, entry.Level, "...at Information.");
        Teach.Equal("41", Prop(entry, "PickId"), "...naming the pick...");
        Teach.Equal("3", Prop(entry, "Items"),
            "...and the item count, so the fact that was spread over five lines is on one.");

        host.Logs.Clear();
        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsync("/d19/picks/99/complete", null),
            "An unknown pick is a 404.");
        Single(host, "...and the miss is also exactly one entry.");
    }

    [Fact]
    public async Task Ex7_OneLineRightLevelFindableAfterwards()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        host.Logs.Clear();
        var invalid = await client.PostAsJsonAsync("/d19/shipments", new { orderRef = "", weightKg = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "A blank order and a weight of zero: 400 - reread README ex7.");
        var problem = await invalid.Content.ReadFromJsonAsync<ValidationDto>();
        Teach.Equal("orderRef,weightKg",
            string.Join(",", (problem?.Errors ?? []).Keys.OrderBy(k => k, StringComparer.Ordinal)),
            "...naming both fields.");
        var first = Single(host, "One entry for the rejection.");
        Teach.Equal(LogLevel.Information, first.Level,
            "A rejected request is Information: the server did exactly what it should.");
        string firstTrace = Prop(first, "TraceId") ?? "";
        Teach.True(firstTrace.Length > 0,
            "Every entry carries a TraceId property. Without one, an error a user reports "
                + "and a line in your log cannot be joined by anything.\n" + host.Logs.Dump());

        host.Logs.Clear();
        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d19/shipments", new { orderRef = "SO-9999", weightKg = 5 }),
            "No pick has order SO-9999.");
        var missing = Single(host, "One entry for the miss.");
        Teach.Equal(LogLevel.Information, missing.Level, "...also Information.");
        Teach.Equal("SO-9999", Prop(missing, "OrderRef"), "...naming what was asked for.");
        Teach.True((Prop(missing, "TraceId") ?? "") != firstTrace,
            "...and a DIFFERENT trace id, because it is a different request. A constant here "
                + "identifies the endpoint, which is precisely what a trace id must not do.");

        host.Logs.Clear();
        await Teach.Status(HttpStatusCode.Conflict,
            await client.PostAsJsonAsync("/d19/shipments", new { orderRef = "SO-1001", weightKg = 31 }),
            "Thirty-one kilos is over the parcel limit: 409.");
        var heavy = Single(host, "One entry for the overweight parcel.");
        Teach.Equal(LogLevel.Warning, heavy.Level,
            "...and THIS is a Warning: the request was fine, and something about the real "
                + "world is not. Somebody may want to know how often it happens.");
        Teach.Equal("31", Prop(heavy, "WeightKg"), "...with the weight, so \"how often\" is answerable.");

        host.Logs.Clear();
        var cursed = await client.PostAsJsonAsync("/d19/shipments", new { orderRef = "SO-1001", weightKg = 13 });
        await Teach.Status(HttpStatusCode.InternalServerError, cursed,
            "The carrier booking throws at thirteen kilos: a 500 the client can parse.");
        Teach.True(!(await cursed.Content.ReadAsStringAsync()).Contains("KEY-77aa"),
            "...with the carrier's api key nowhere in it.");
        var faulted = Single(host, "One entry for the fault.");
        Teach.Equal(LogLevel.Error, faulted.Level, "...at Error, because the server failed.");
        Teach.True(faulted.Exception is not null, "...with the exception in its own parameter.");
        Teach.True((Prop(faulted, "TraceId") ?? "").Length > 0,
            "...and a trace id, which is the one the user will read out to you.");

        host.Logs.Clear();
        var made = await client.PostAsJsonAsync("/d19/shipments", new { orderRef = "SO-1001", weightKg = 5 });
        await Teach.Status(HttpStatusCode.Created, made, "And a good shipment is created.");
        Teach.Equal("/d19/shipments/SO-1001-5", made.Headers.Location?.ToString(), "...with a Location.");
        Teach.Equal("SO-1001-5", (await made.Content.ReadFromJsonAsync<ShipmentDto>())?.Reference,
            "...and the reference the carrier gave back.");
        Teach.Equal(LogLevel.Information, Single(host, "One entry for the success.").Level,
            "...logged once, at Information.");
    }

    [Fact]
    public async Task Ex8_EverythingThisSetDrillsOnOneEndpoint()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        host.Logs.Clear();
        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsync("/d19/picks/99/pack", null),
            "No pick 99 - reread README ex8.");
        var missing = Single(host, "One entry for the miss.");
        Teach.Equal("DotnetDojo.Api.D19_Logging.Ex8", missing.Category, "...from this class.");
        Teach.Equal(LogLevel.Information, missing.Level, "...at Information.");
        Teach.Equal("99", Prop(missing, "PickId"), "...naming the pick.");
        Teach.True((Prop(missing, "TraceId") ?? "").Length > 0, "...and traced.");

        host.Logs.Clear();
        var short_ = await client.PostAsync("/d19/picks/41/pack", null);
        await Teach.Status(HttpStatusCode.Conflict, short_,
            "Pick 41 wants a toaster and there are none: 409.");
        Teach.Equal("application/problem+json", short_.Content.Headers.ContentType?.MediaType,
            "...as problem details.");
        var warned = Single(host, "One entry for the shortage.");
        Teach.Equal(LogLevel.Warning, warned.Level, "...at Warning, because the shelf is wrong.");
        Teach.Equal("B-200", Prop(warned, "Sku"), "...naming the sku that is short.");
        Teach.True((Prop(warned, "TraceId") ?? "").Length > 0, "...and traced.");

        host.Logs.Clear();
        var jammed = await client.PostAsync("/d19/picks/43/pack", null);
        await Teach.Status(HttpStatusCode.InternalServerError, jammed,
            "Pick 43 jams the carton feeder: a 500.");
        Teach.True(!(await jammed.Content.ReadAsStringAsync()).Contains("FEED-31be"),
            "...with the feeder token nowhere in the body.");
        var faulted = Single(host, "One entry for the jam.");
        Teach.Equal(LogLevel.Error, faulted.Level, "...at Error.");
        Teach.True(faulted.Exception is not null,
            "...with the exception itself, which is the only place the token belongs.");

        host.Logs.Clear();
        var packed = await client.PostAsync("/d19/picks/42/pack", null);
        await Teach.Status(HttpStatusCode.OK, packed, "Pick 42 packs cleanly.");
        var body = await packed.Content.ReadFromJsonAsync<PackedDto>();
        Teach.Equal(2, body?.Cartons, "Three items at two per carton, rounded up, is 2.");
        var done = Single(host, "One entry for the success.");
        Teach.Equal(LogLevel.Information, done.Level, "...at Information.");
        Teach.Equal("42", Prop(done, "PickId"), "...naming the pick...");
        Teach.Equal("2", Prop(done, "Cartons"), "...and the cartons.");
        Teach.True((Prop(done, "TraceId") ?? "").Length > 0,
            "...and the happy path is traced too. By the time you know a request was "
                + "interesting it has already finished.");
    }

    // ... private helpers and DTO records, listed below ...

    /// <summary>The one entry the API wrote, or a failure that prints everything it did write.</summary>
    private static LogEntry Single(CapturingHost host, string because)
    {
        var entries = host.Logs.FromApi;
        Teach.Equal(1, entries.Count, because + "\n" + host.Logs.Dump());
        return entries[0];
    }

    private static string? Prop(LogEntry entry, string name) => entry.Property(name)?.ToString();

    private sealed record StartedDto(int PickId, string? OrderRef);

    private sealed record ScanDto(string? Sku, int OnHand);

    private sealed record PickReadDto(int Id, string? OrderRef, int Lines);

    private sealed record DispatchDto(string? OrderRef, string? Courier);

    private sealed record CompletedDto(int PickId, int Items);

    private sealed record ShipmentDto(string? Reference, string? OrderRef, int WeightKg);

    private sealed record PackedDto(int PickId, int Cartons);

    private sealed record ValidationDto(Dictionary<string, string[]>? Errors);
}
