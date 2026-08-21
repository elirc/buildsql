using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L00_HelloDojoTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_PingReportsThatTheApiIsUp()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l00/ping");

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l00/ping must answer 200 OK. A 500 here means the handler still throws; "
                + "a 404 means the route was never mapped - reread README ex1.");

        var body = await response.Content.ReadFromJsonAsync<PingDto>();
        Teach.Equal("ok", body?.Status,
            "The JSON body needs a \"status\" property whose value is exactly \"ok\".");
        Teach.Equal("00_hello_dojo", body?.Lesson,
            "The JSON body needs a \"lesson\" property whose value is exactly \"00_hello_dojo\".");
    }

    [Fact]
    public async Task Ex2_EchoReadsTheQueryStringAndRejectsAnEmptyOne()
    {
        using var client = factory.CreateClient();

        var ok = await client.GetAsync("/l00/echo?message=hi");
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /l00/echo?message=hi must answer 200 OK - reread README ex2.");

        var body = await ok.Content.ReadFromJsonAsync<EchoDto>();
        Teach.Equal("hi", body?.Message,
            "Echo the message back unchanged: the value came from the query string, "
                + "so it must not be hard-coded.");
        Teach.Equal(2, body?.Length,
            "\"length\" is the number of characters in the message - \"hi\" is 2.");

        var longer = await client.GetAsync("/l00/echo?message=dojo");
        var longerBody = await longer.Content.ReadFromJsonAsync<EchoDto>();
        Teach.Equal(4, longerBody?.Length,
            "\"dojo\" is 4 characters. A hard-coded 2 passes the first check and fails this one.");

        var missing = await client.GetAsync("/l00/echo");
        await Teach.Status(HttpStatusCode.BadRequest, missing,
            "GET /l00/echo with no message at all is the caller's mistake, so it is a 400, "
                + "not a 200 with an empty string and not a 500.");

        var blank = await client.GetAsync("/l00/echo?message=%20%20");
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A message of two spaces is blank too. Check for whitespace, not just for null.");
    }

    [Fact]
    public async Task Ex3_GreetingsReadsTheJsonRequestBody()
    {
        using var client = factory.CreateClient();

        var ok = await client.PostAsJsonAsync("/l00/greetings", new { name = "Ada" });
        await Teach.Status(HttpStatusCode.OK, ok,
            "POST /l00/greetings with {\"name\":\"Ada\"} must answer 200 OK - reread README ex3.");

        var body = await ok.Content.ReadFromJsonAsync<GreetingDto>();
        Teach.Equal("Hello, Ada!", body?.Greeting,
            "The body needs a \"greeting\" property equal to \"Hello, Ada!\" - comma, "
                + "exclamation mark and all.");

        var other = await client.PostAsJsonAsync("/l00/greetings", new { name = "Grace" });
        var otherBody = await other.Content.ReadFromJsonAsync<GreetingDto>();
        Teach.Equal("Hello, Grace!", otherBody?.Greeting,
            "The name has to come out of the request body, not be hard-coded.");

        var blank = await client.PostAsJsonAsync("/l00/greetings", new { name = "   " });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A whitespace-only name is not a name: answer 400.");
    }

    private sealed record PingDto(string? Status, string? Lesson);

    private sealed record EchoDto(string? Message, int? Length);

    private sealed record GreetingDto(string? Greeting);
}
