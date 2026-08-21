using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DotnetDojo.Api.L08_ErrorsLogging;
using Microsoft.Extensions.Logging;

namespace DotnetDojo.Gates;

public class L08_ErrorsLoggingTests
{
    [Fact]
    public async Task Ex1_EachExceptionTypeBecomesItsOwnProblemDetails()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        var ok = await client.GetAsync("/l08/mapped/fine");
        await Teach.Status(HttpStatusCode.OK, ok,
            "A request that does not throw must still get through. A 500 here means the "
                + "middleware itself is throwing - reread README ex1.");

        var missing = await client.GetAsync("/l08/mapped/missing");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "NotFoundException means the caller asked for something that is not there: 404.");
        Teach.True(ContentType(missing).Contains("application/problem+json"),
            $"Answer with a ProblemDetails document. Got content type: {ContentType(missing)}");
        Teach.Equal("no such widget", await Field(missing, "detail"),
            "A NotFoundException's message is safe to show - it is about the caller's "
                + "request, not about your internals - so it belongs in \"detail\".");

        var invalid = await client.GetAsync("/l08/mapped/invalid");
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "ValidationFailedException means the caller sent something unusable: 400.");
        Teach.Equal("Name is required.", await Field(invalid, "detail"),
            "…and its message is the detail.");

        var boom = await client.GetAsync("/l08/mapped/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "An exception you did not plan for is a 500: the server is at fault.");
        Teach.Equal("An unexpected error occurred.", await Field(boom, "title"),
            "Unplanned failures get one generic title. The client cannot act on the "
                + "difference between two of your bugs.");

        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("hunter2") && !body.Contains("postgres://"),
            "The response is carrying the exception's message, which in this case contains a "
                + "database password. Never put an unplanned exception's text in a response - "
                + "log it instead.\n  body: " + body);
    }

    [Fact]
    public async Task Ex2_TheDetailIsLoggedAndTheResponseIsGeneric()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var boom = await client.GetAsync("/l08/logged/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "An unhandled exception is a 500 - reread README ex2.");

        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("hunter2"),
            "The secret is in the response body again. The client gets the generic title; "
                + "the operator gets the exception.\n  body: " + body);

        var errors = host.Logs.FromApi.Where(e => e.Level == LogLevel.Error).ToList();
        Teach.True(errors.Count > 0,
            "Nothing was logged at Error level by your code. A 500 that leaves no trace is a "
                + "bug nobody can investigate - and the whole reason the response is allowed "
                + "to be vague is that the log is not.\n" + host.Logs.Dump());

        var entry = errors[0];
        Teach.True(entry.Exception is InvalidOperationException,
            "The log entry has no exception attached. Pass the exception object as the first "
                + "argument - logger.LogError(ex, \"...\") - or you lose the stack trace, "
                + "which is the only part that says where the failure happened.\n  " + entry);
        Teach.True(entry.Exception?.Message.Contains("hunter2") == true,
            "The exception that reached the log is not the one that was thrown.");
        Teach.Equal("/l08/logged/boom", entry.Property("Path")?.ToString(),
            "The entry needs the request path as a named property called Path, so the log can "
                + "be searched by route.\n  " + entry);
    }

    [Fact]
    public async Task Ex3_TheMessageTemplateCarriesNamedProperties()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var response = await client.PostAsync("/l08/orders/42/ship?city=Kyoto", null);
        await Teach.Status(HttpStatusCode.OK, response,
            "POST /l08/orders/42/ship?city=Kyoto must answer 200 - reread README ex3.");

        var body = await response.Content.ReadFromJsonAsync<ShipDto>();
        Teach.Equal(42, body?.OrderId, "The response echoes the order id.");
        Teach.Equal("Kyoto", body?.City, "…and the city.");

        var entries = host.Logs.FromApi.Where(e => e.Level == LogLevel.Information).ToList();
        Teach.True(entries.Count > 0,
            "Nothing was logged at Information by your code.\n" + host.Logs.Dump());

        var entry = entries[0];
        Teach.True(entry.Has("OrderId") && entry.Has("City"),
            "The log entry has no OrderId and City properties, only a finished string. That "
                + "means you interpolated - $\"Order {id} shipped\" - instead of passing a "
                + "template and its arguments. An interpolated log line cannot be searched, "
                + "grouped or alerted on by field.\n  " + entry);
        Teach.Equal("42", entry.Property("OrderId")?.ToString(),
            "OrderId should be 42.");
        Teach.Equal("Kyoto", entry.Property("City")?.ToString(),
            "City should be Kyoto.");
        Teach.True(entry.Message.Contains("42") && entry.Message.Contains("Kyoto"),
            $"The rendered message should still read naturally. Got: {entry.Message}");
    }

    [Fact]
    public async Task Ex4_EveryFailureCarriesACorrelationId()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var generated = await client.GetAsync("/l08/traced/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, generated,
            "An unhandled exception is still a 500 - reread README ex4.");

        string header = Header(generated, "X-Correlation-Id");
        Teach.True(header.Length > 0,
            "Every response needs an X-Correlation-Id header, including the failures - "
                + "especially the failures.");
        Teach.Equal(header, await Field(generated, "correlationId"),
            "The ProblemDetails document has to carry the same id as an extension member "
                + "called \"correlationId\", so a user can read it off the screen and an "
                + "engineer can find it in the log.");

        var errors = host.Logs.FromApi.Where(e => e.Level == LogLevel.Error).ToList();
        Teach.True(errors.Count > 0,
            "Nothing was logged at Error.\n" + host.Logs.Dump());
        Teach.Equal(header, errors[0].Property("CorrelationId")?.ToString(),
            "…and the log entry needs it as a named property called CorrelationId. That is "
                + "the whole point: the id in the client's hand finds the entry in the "
                + "log.\n  " + errors[0]);

        var supplied = new HttpRequestMessage(HttpMethod.Get, "/l08/traced/boom");
        supplied.Headers.Add("X-Correlation-Id", "trace-me");
        var echoed = await client.SendAsync(supplied);
        Teach.Equal("trace-me", Header(echoed, "X-Correlation-Id"),
            "When the client supplies an id, echo it instead of inventing one - that is how "
                + "one request is followed across several services.");
        Teach.Equal("trace-me", await Field(echoed, "correlationId"),
            "…and the body agrees with the header.");

        var fine = await client.GetAsync("/l08/traced/fine");
        await Teach.Status(HttpStatusCode.OK, fine,
            "A request that does not throw still succeeds.");
        Teach.True(Header(fine, "X-Correlation-Id").Length > 0,
            "…and still gets a correlation id. Set it on the way in, not in the catch block.");
    }

    [Fact]
    public async Task Challenge_OneMiddlewareDecidesStatusBodyAndLogLevel()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        host.Logs.Clear();
        var missing = await client.GetAsync("/l08/challenge/missing");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "NotFoundException is a 404 - reread README challenge.");
        Teach.Equal("Warning", LevelOfFirstApiEntry(host),
            "A 404 is the caller's mistake, not an incident. Log it at Warning - logging "
                + "every 404 at Error is how an alerting channel becomes noise everyone "
                + "ignores.\n" + host.Logs.Dump());

        host.Logs.Clear();
        var invalid = await client.GetAsync("/l08/challenge/invalid");
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "ValidationFailedException is a 400.");
        Teach.Equal("name", await ErrorKeys(invalid),
            "The 400 is a validation problem whose \"errors\" object is keyed by the "
                + "exception's Field, so the client can point at the offending input.");
        Teach.Equal("Warning", LevelOfFirstApiEntry(host),
            "A rejected payload is also Warning, not Error.\n" + host.Logs.Dump());

        host.Logs.Clear();
        var boom = await client.GetAsync("/l08/challenge/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "Anything unplanned is a 500.");
        Teach.Equal("Error", LevelOfFirstApiEntry(host),
            "This one really is an incident: Error, with the exception attached.\n"
                + host.Logs.Dump());

        var entry = host.Logs.FromApi.First();
        Teach.True(entry.Exception is InvalidOperationException,
            "Pass the exception to the logger so the stack trace survives.\n  " + entry);
        Teach.Equal("/l08/challenge/boom", entry.Property("Path")?.ToString(),
            "Every entry carries the request path as a named property called Path.\n  " + entry);

        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("hunter2"),
            "…and the client still learns nothing about your internals.\n  body: " + body);

        var fine = await client.GetAsync("/l08/challenge/fine");
        await Teach.Status(HttpStatusCode.OK, fine,
            "A request that does not throw is untouched by any of this.");
    }

    private static string LevelOfFirstApiEntry(CapturingHost host)
    {
        var entries = host.Logs.FromApi;
        return entries.Count == 0 ? "(nothing logged)" : entries[0].Level.ToString();
    }

    private static async Task<string> Field(HttpResponseMessage response, string name)
    {
        string body = await response.Content.ReadAsStringAsync();
        try
        {
            using var document = JsonDocument.Parse(body);
            return document.RootElement.TryGetProperty(name, out var value)
                ? value.ToString()
                : $"(no \"{name}\" in {body})";
        }
        catch (JsonException)
        {
            return $"(not JSON: {body})";
        }
    }

    private static async Task<string> ErrorKeys(HttpResponseMessage response)
    {
        string body = await response.Content.ReadAsStringAsync();
        try
        {
            using var document = JsonDocument.Parse(body);
            if (!document.RootElement.TryGetProperty("errors", out var errors))
            {
                return $"(no \"errors\" property; body was {body})";
            }

            return string.Join(",", errors.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        }
        catch (JsonException)
        {
            return $"(not JSON: {body})";
        }
    }

    private static string ContentType(HttpResponseMessage response) =>
        response.Content.Headers.ContentType?.ToString() ?? "";

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private sealed record ShipDto(int OrderId, string? City);
}
