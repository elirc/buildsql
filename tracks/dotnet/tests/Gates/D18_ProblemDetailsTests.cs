using System.Net;
using System.Net.Http.Json;
using System.Text;
using DotnetDojo.Api.D18_ProblemDetails;

namespace DotnetDojo.Gates;

public class D18_ProblemDetailsTests
{
    [Fact]
    public async Task Ex1_A404ThatExplainsItself()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var found = await client.GetAsync("/d18/sailings/ard-11");
        await Teach.Status(HttpStatusCode.OK, found,
            "GET /d18/sailings/ard-11 must answer 200 - reread README ex1.");
        var sailing = await found.Content.ReadFromJsonAsync<SailingDto2>();
        Teach.Equal("Ardgour to Corran", sailing?.Route, "...with the route.");
        Teach.Equal(48, sailing?.Left, "60 seats, 12 sold, 48 left.");

        var missing = await client.GetAsync("/d18/sailings/zz-99");
        await Teach.Status(HttpStatusCode.NotFound, missing, "There is no sailing zz-99.");
        Teach.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType,
            "A bare NotFound() sends no body and no content type. A problem details response "
                + "sends application/problem+json, which is how a client knows the body is an "
                + "error it can parse rather than the resource it asked for.");

        var problem = await missing.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(404, problem?.Status,
            "The status is repeated INSIDE the body. It is redundant on purpose: logs, "
                + "message queues and error aggregators routinely carry the body without the "
                + "status line.");
        Teach.True(!string.IsNullOrWhiteSpace(problem?.Title),
            "A title says what kind of problem this is, in words, once and for all "
                + "occurrences of it.");
        Teach.True(problem?.Detail?.Contains("zz-99") == true,
            "...and the detail is about THIS occurrence, so it names the code that was asked "
                + "for. A detail identical to the title is a wasted field.\n  detail: "
                + (problem?.Detail ?? "(none)"));
        Teach.Equal("/d18/sailings/zz-99", problem?.Instance,
            "...and instance says which request it was, which is the field that makes a "
                + "screenshot of an error actionable.");
    }

    [Fact]
    public async Task Ex2_TheTypeIsWhatAClientSwitchesOn()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d18/sailings/zz-99/book", new { seats = 1 }),
            "An unknown code is still a 404 here - reread README ex2.");

        var full = await client.PostAsJsonAsync("/d18/sailings/uig-03/book", new { seats = 2 });
        await Teach.Status(HttpStatusCode.Conflict, full,
            "uig-03 has one seat left and two were asked for: 409.");
        Teach.Equal("application/problem+json", full.Content.Headers.ContentType?.MediaType,
            "...as problem details.");

        var problem = await full.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D18Ferry.ProblemBase + "sailing-full", problem?.Type,
            "The type is the ONLY field a client should branch on. Titles get reworded and "
                + "translated, details change per occurrence, and a status of 409 covers a "
                + "dozen different conflicts - the type URI is the stable identity of this "
                + "one.");
        Teach.Equal("uig-03", problem?.SailingCode,
            "Extension members carry the machine-readable specifics. Putting the code in the "
                + "detail sentence instead makes the client parse English.");
        Teach.Equal(1, problem?.SeatsLeft,
            "...and how many are actually left, so the client can offer that instead of "
                + "asking again to find out.");

        await Teach.Status(HttpStatusCode.OK,
            await client.PostAsJsonAsync("/d18/sailings/uig-03/book", new { seats = 1 }),
            "One seat is exactly available, so one seat is fine.");

        var sold = await client.PostAsJsonAsync("/d18/sailings/mor-07/book", new { seats = 1 });
        await Teach.Status(HttpStatusCode.Conflict, sold, "mor-07 is completely sold out.");
        Teach.Equal(0, (await sold.Content.ReadFromJsonAsync<ProblemDto>())?.SeatsLeft,
            "...with zero left, which is a number and not an absent field.");
    }

    [Fact]
    public async Task Ex3_AValidationProblemIsStillAProblem()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var none = await client.PostAsJsonAsync("/d18/sailings/ard-11/hold", new { seats = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, none,
            "Zero seats is not a booking - reread README ex3.");
        Teach.Equal("application/problem+json", none.Content.Headers.ContentType?.MediaType,
            "BadRequest(\"bad seat count\") is text/plain: a sentence, in English, with no "
                + "structure. A validation problem is problem details with one extra member, "
                + "so a client parses errors the same way it parses everything else.");

        var problem = await none.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.True(problem?.Errors?.ContainsKey("seats") == true,
            "...and that extra member is the errors dictionary, keyed by field.");
        Teach.Equal(400, problem?.Status, "...with the status in the body as usual.");
        Teach.Equal(D18Ferry.ProblemBase + "invalid-request", problem?.Type,
            "...and a type, because validation failures deserve a stable identity too.");
        Teach.Equal("/d18/sailings/ard-11/hold", problem?.Instance, "...and an instance.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PostAsJsonAsync("/d18/sailings/ard-11/hold", new { seats = 7 }),
            "Seven is over the six-seat limit.");
        await Teach.Status(HttpStatusCode.OK,
            await client.PostAsJsonAsync("/d18/sailings/ard-11/hold", new { seats = 6 }),
            "...and six is exactly at it.");

        var missing = await client.PostAsJsonAsync("/d18/sailings/zz-99/hold", new { seats = 2 });
        await Teach.Status(HttpStatusCode.NotFound, missing, "An unknown sailing is still a 404.");
        Teach.True((await missing.Content.ReadFromJsonAsync<ProblemDto>())?.Errors is null,
            "...and a 404 has no errors dictionary. Nothing the client SENT was wrong.");
    }

    [Fact]
    public async Task Ex4_TheExceptionNobodyPlannedFor()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var good = await client.GetAsync("/d18/sailings/ard-11/manifest");
        await Teach.Status(HttpStatusCode.OK, good,
            "The happy path still has to work once the handler is wrapped - reread README ex4.");
        Teach.Equal(48, (await good.Content.ReadFromJsonAsync<SailingDto2>())?.Left, "...48 left.");

        var missing = await client.GetAsync("/d18/sailings/zz-99/manifest");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "D18Booking.Manifest throws SailingNotFoundException, and that is a 404 - the "
                + "domain expressed a known failure with an exception, and the edge has to "
                + "translate it rather than let it become a 500.");
        Teach.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType,
            "...as problem details.");

        var boom = await client.GetAsync("/d18/sailings/boom/manifest");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "\"boom\" throws something nobody anticipated. That IS a 500 - but a 500 the "
                + "client can parse, not an unhandled exception escaping the pipeline.");
        Teach.Equal("application/problem+json", boom.Content.Headers.ContentType?.MediaType,
            "...still problem details.");

        string raw = await boom.Content.ReadAsStringAsync();
        Teach.True(!raw.Contains("hunter2") && !raw.Contains("Server=prod-01"),
            "The exception message contains a production connection string and a password, "
                + "and it is now in the response body. Everything you know about the "
                + "exception is for the LOG; the client gets a status, a type and a title.\n"
                + "  body: " + Truncate(raw));
        Teach.True(!raw.Contains("InvalidOperationException") && !raw.Contains("DotnetDojo.Api"),
            "...and neither the exception type nor a stack frame belongs in it either. Both "
                + "are free reconnaissance for anyone probing the API.");
    }

    [Fact]
    public async Task Ex5_OneDomainErrorOneStatusOneType()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var missing = await client.PostAsJsonAsync("/d18/sailings/zz-99/reserve",
            new { seats = 1, card = "4242" });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "SailingNotFoundException is a 404 - reread README ex5.");
        Teach.Equal(D18Ferry.ProblemBase + "sailing-not-found",
            (await missing.Content.ReadFromJsonAsync<ProblemDto>())?.Type,
            "...with its own type.");

        var full = await client.PostAsJsonAsync("/d18/sailings/uig-03/reserve",
            new { seats = 3, card = "4242" });
        await Teach.Status(HttpStatusCode.Conflict, full, "SailingFullException is a 409.");
        var fullProblem = await full.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D18Ferry.ProblemBase + "sailing-full", fullProblem?.Type, "...with its own type.");
        Teach.Equal("uig-03", fullProblem?.SailingCode, "...and the exception's data as extensions.");
        Teach.Equal(1, fullProblem?.SeatsLeft, "...both of them.");

        var declined = await client.PostAsJsonAsync("/d18/sailings/ard-11/reserve",
            new { seats = 2, card = "0000" });
        await Teach.Status(HttpStatusCode.PaymentRequired, declined,
            "A declined card is 402. It is not a 400 - nothing the client sent is malformed - "
                + "and it is not a 500, because the server is working exactly as designed.");
        var declinedProblem = await declined.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D18Ferry.ProblemBase + "payment-declined", declinedProblem?.Type, "...typed.");
        Teach.Equal("insufficient_funds", declinedProblem?.Reason,
            "...and the reason travels as an extension, because a client offering an "
                + "alternative payment method needs to branch on it.");

        var boom = await client.PostAsJsonAsync("/d18/sailings/boom/reserve",
            new { seats = 1, card = "4242" });
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "An exception the mapping does not know about is a 500 - and is CAUGHT, so it "
                + "still comes back as problem details.");
        Teach.Equal(D18Ferry.ProblemBase + "internal",
            (await boom.Content.ReadFromJsonAsync<ProblemDto>())?.Type,
            "...with the catch-all type.");
        Teach.True(!(await boom.Content.ReadAsStringAsync()).Contains("hunter2"),
            "...and nothing about the exception in it.");

        await Teach.Status(HttpStatusCode.OK, await client.PostAsJsonAsync(
            "/d18/sailings/ard-11/reserve", new { seats = 2, card = "4242" }),
            "And a reservation that works is still a 200.");
    }

    [Fact]
    public async Task Ex6_TheNumberTheCallerReadsOutOnThePhone()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var good = await client.GetAsync("/d18/sailings/ard-11/traced");
        await Teach.Status(HttpStatusCode.OK, good, "The happy path still works - reread README ex6.");
        Teach.True(good.Headers.TryGetValues("X-Trace-Id", out _),
            "Every response carries the trace id, not only the failures. The support call "
                + "that starts \"it showed me the wrong number of seats\" needs one too.");

        var missing = await client.GetAsync("/d18/sailings/zz-99/traced");
        await Teach.Status(HttpStatusCode.NotFound, missing, "An unknown code is a 404.");
        string header = missing.Headers.GetValues("X-Trace-Id").Single();
        Teach.True(!string.IsNullOrWhiteSpace(header), "...with a trace id header.");

        var problem = await missing.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(header, problem?.TraceId,
            "...and the SAME value inside the body. A header the user cannot see and a body "
                + "value they can read out have to match, or the number they give you finds "
                + "nothing in the logs.");

        var second = await client.GetAsync("/d18/sailings/zz-99/traced");
        Teach.True(second.Headers.GetValues("X-Trace-Id").Single() != header,
            "Two requests, two ids. A constant here identifies the endpoint rather than the "
                + "occurrence, which is exactly what a trace id must not do.");
    }

    [Fact]
    public async Task Ex7_OneContractForEveryFailure()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var wrongType = await client.PostAsync("/d18/sailings/ard-11/purchase",
            new StringContent("seats=2", Encoding.UTF8, "text/plain"));
        await Teach.Status(HttpStatusCode.UnsupportedMediaType, wrongType,
            "This handler reads the body itself, so the content type is its problem too. A "
                + "client sending form data to a JSON endpoint gets 415 - reread README ex7.");
        Teach.Equal(D18Ferry.ProblemBase + "unsupported-media-type",
            (await wrongType.Content.ReadFromJsonAsync<ProblemDto>())?.Type,
            "...typed, like everything else.");

        var garbage = await client.PostAsync("/d18/sailings/ard-11/purchase",
            new StringContent("{{{ not json", Encoding.UTF8, "application/json"));
        await Teach.Status(HttpStatusCode.BadRequest, garbage,
            "The content type is right and the bytes are not JSON: 400, and NOT a 500. "
                + "ReadFromJsonAsync throws, and that throw is expected input, not a fault.");
        Teach.Equal(D18Ferry.ProblemBase + "malformed-body",
            (await garbage.Content.ReadFromJsonAsync<ProblemDto>())?.Type,
            "...with a type of its own, so a client can tell \"I sent rubbish\" from \"my "
                + "values were rejected\".");

        var badSeats = await Json(client, "/d18/sailings/ard-11/purchase", new { seats = 0, card = "4242" });
        await Teach.Status(HttpStatusCode.BadRequest, badSeats, "Zero seats is a validation failure.");
        Teach.True((await badSeats.Content.ReadFromJsonAsync<ProblemDto>())?.Errors?.ContainsKey("seats") == true,
            "...with an errors dictionary, which the malformed-body 400 above does not have.");

        await Teach.Status(HttpStatusCode.NotFound,
            await Json(client, "/d18/sailings/zz-99/purchase", new { seats = 2, card = "4242" }),
            "Unknown sailing: 404.");
        await Teach.Status(HttpStatusCode.Conflict,
            await Json(client, "/d18/sailings/uig-03/purchase", new { seats = 5, card = "4242" }),
            "Not enough seats: 409.");
        await Teach.Status(HttpStatusCode.PaymentRequired,
            await Json(client, "/d18/sailings/ard-11/purchase", new { seats = 2, card = "0000" }),
            "Declined card: 402.");

        var ok = await Json(client, "/d18/sailings/ard-11/purchase", new { seats = 2, card = "4242" });
        await Teach.Status(HttpStatusCode.OK, ok, "And a good purchase: 200.");
        Teach.Equal("Ardgour to Corran", (await ok.Content.ReadFromJsonAsync<SailingDto2>())?.Route,
            "...with the sailing.");
    }

    [Fact]
    public async Task Ex8_TheWholeErrorContractOnOneEndpoint()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var invalid = await client.PostAsJsonAsync("/d18/orders",
            new { sailingCode = "", seats = 0, card = "4242" });
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "Two things are wrong before the domain is called at all - reread README ex8.");
        var bad = await invalid.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal("sailingCode,seats",
            string.Join(",", (bad?.Errors ?? []).Keys.OrderBy(k => k, StringComparer.Ordinal)),
            "...both of them reported, keyed by field.");
        Teach.True(!string.IsNullOrWhiteSpace(bad?.TraceId),
            "...and the validation problem carries a traceId too. It is the response most "
                + "likely to be screenshotted, so leaving it out is the worst place to.");
        Teach.True(bad?.Type?.StartsWith(D18Ferry.ProblemBase, StringComparison.Ordinal) == true,
            "...and a type off the same base as every other failure.");

        var missing = await client.PostAsJsonAsync("/d18/orders",
            new { sailingCode = "zz-99", seats = 1, card = "4242" });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "\"zz-99\" is a well-formed code for a sailing that does not exist, so it passes "
                + "validation and fails in the domain.");
        var missingProblem = await missing.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(D18Ferry.ProblemBase + "sailing-not-found", missingProblem?.Type, "...typed.");
        Teach.True(!string.IsNullOrWhiteSpace(missingProblem?.TraceId), "...and traced.");

        var full = await client.PostAsJsonAsync("/d18/orders",
            new { sailingCode = "uig-03", seats = 4, card = "4242" });
        await Teach.Status(HttpStatusCode.Conflict, full, "uig-03 cannot take four.");
        var fullProblem = await full.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(1, fullProblem?.SeatsLeft, "...and says how many it can take.");
        Teach.True(!string.IsNullOrWhiteSpace(fullProblem?.Instance), "...and which request this was.");

        await Teach.Status(HttpStatusCode.PaymentRequired, await client.PostAsJsonAsync("/d18/orders",
            new { sailingCode = "ard-11", seats = 2, card = "0000" }),
            "A declined card is still a 402 here.");

        var made = await client.PostAsJsonAsync("/d18/orders",
            new { sailingCode = "ard-11", seats = 2, card = "4242" });
        await Teach.Status(HttpStatusCode.Created, made, "And a good order is created.");
        Teach.Equal("/d18/orders/ard-11-2", made.Headers.Location?.ToString(), "...with a Location.");
        var order = await made.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal("ard-11-2", order?.Reference, "...and the reference in the body.");
        Teach.Equal(2, order?.Seats, "...for two seats.");
    }

    // ... private helpers and DTO records, listed below ...

    private static Task<HttpResponseMessage> Json(HttpClient client, string url, object body) =>
        client.PostAsync(url, JsonContent.Create(body));

    private static string Truncate(string s) => s.Length <= 400 ? s : s[..400] + " ...";

    private sealed record SailingDto2(string? Code, string? Route, int Seats, int Left);

    private sealed record OrderDto(string? Reference, string? SailingCode, int Seats);

    /// <summary>RFC 9457 members plus every extension this set uses - they all sit at the top level.</summary>
    private sealed record ProblemDto(
        string? Type,
        string? Title,
        int? Status,
        string? Detail,
        string? Instance,
        string? TraceId,
        string? SailingCode,
        int? SeatsLeft,
        string? Reason,
        Dictionary<string, string[]>? Errors);
}
