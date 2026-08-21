using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L03_MiddlewareTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_TheStampMiddlewareAddsAHeaderAndLetsTheRequestThrough()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l03/stamp");

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l03/stamp must answer 200. A 500 means StampMiddleware still throws - "
                + "reread README ex1.");

        Teach.Equal("l03", Header(response, "X-Dojo-Stamp"),
            "The middleware has to add the response header X-Dojo-Stamp with the value "
                + "\"l03\", and it has to add it BEFORE awaiting next - once the handler has "
                + "written the response, headers can no longer be changed.");

        Teach.Equal("handler", await response.Content.ReadAsStringAsync(),
            "The body should still be \"handler\", which is what the terminal handler writes. "
                + "An empty body means your middleware never called next, so nothing "
                + "downstream ran.");
    }

    [Fact]
    public async Task Ex2_ThePipelineIsAnOnionAndTheOrderIsVisible()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l03/order");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l03/order must answer 200 - reread README ex2.");

        Teach.Equal(
            "correlation>,timing>,auth>,handler,auth<,timing<,correlation<",
            await response.Content.ReadAsStringAsync(),
            "That trace is the shape of your pipeline. Read it as a nesting: everything "
                + "between correlation> and correlation< happened inside the correlation "
                + "middleware. The first middleware you add is the outermost one, and the "
                + "order on the way out is the reverse of the order on the way in.");
    }

    [Fact]
    public async Task Ex3_TheKeyCheckStopsTheRequestDead()
    {
        using var client = factory.CreateClient();

        var anonymous = await client.GetAsync("/l03/secure");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No X-Api-Key header at all must be 401 - reread README ex3.");
        Teach.Equal("", Header(anonymous, "X-Reached-Handler"),
            "Short-circuiting means NOT calling next. The middleware downstream of yours "
                + "still ran and set X-Reached-Handler, so the request carried on past your "
                + "401 - you set the status code and then awaited next anyway.");
        Teach.Equal("", await anonymous.Content.ReadAsStringAsync(),
            "The secret was written to the body of a 401. Return without calling next.");

        var wrong = await client.SendAsync(WithKey("nope"));
        await Teach.Status(HttpStatusCode.Unauthorized, wrong,
            "A present-but-wrong key is still a 401.");

        var allowed = await client.SendAsync(WithKey("dojo-key"));
        await Teach.Status(HttpStatusCode.OK, allowed,
            "With the right key the request must reach the handler: 200.");
        Teach.Equal("yes", Header(allowed, "X-Reached-Handler"),
            "The rest of the pipeline has to run when the key is valid - call next.");
        Teach.Equal("secret", await allowed.Content.ReadAsStringAsync(),
            "…and the terminal handler's body comes back.");

        static HttpRequestMessage WithKey(string key)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, "/l03/secure");
            message.Headers.Add("X-Api-Key", key);
            return message;
        }
    }

    [Fact]
    public async Task Ex4_UseRunsForEveryoneAndTheBranchOnlyForSome()
    {
        using var client = factory.CreateClient();

        var admin = await client.GetAsync("/l03/branch/admin/reports");
        await Teach.Status(HttpStatusCode.OK, admin,
            "GET /l03/branch/admin/reports must answer 200 - reread README ex4.");
        Teach.Equal("admin", await admin.Content.ReadAsStringAsync(),
            "Anything under /l03/branch/admin is handled by the branch, which answers "
                + "\"admin\".");
        Teach.Equal("all", Header(admin, "X-Branch-Seen"),
            "The Use middleware runs for every request, branch or not, because it was added "
                + "before the branch. If this header is missing you added it inside the "
                + "branch or after the terminal.");

        var other = await client.GetAsync("/l03/branch/orders");
        Teach.Equal("default", await other.Content.ReadAsStringAsync(),
            "/l03/branch/orders is not under /admin, so it falls through to the terminal "
                + "Run, which answers \"default\". Getting \"admin\" here means the branch "
                + "predicate matches everything.");
        Teach.Equal("all", Header(other, "X-Branch-Seen"),
            "The shared middleware runs on this path too.");
    }

    [Fact]
    public async Task Challenge_EveryResponseIsCorrelatedEvenTheRejections()
    {
        using var client = factory.CreateClient();

        var anonymous = await client.GetAsync("/l03/challenge/reports");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No API key is a 401 - reread README challenge.");
        Teach.True(Header(anonymous, "X-Correlation-Id").Length > 0,
            "A 401 with no correlation id is an incident nobody can trace. The correlation "
                + "middleware has to run BEFORE the thing that might reject the request, so "
                + "add it first.");

        var tagged = new HttpRequestMessage(HttpMethod.Get, "/l03/challenge/reports");
        tagged.Headers.Add("X-Correlation-Id", "trace-me");
        var taggedResponse = await client.SendAsync(tagged);
        Teach.Equal("trace-me", Header(taggedResponse, "X-Correlation-Id"),
            "A correlation id the client supplied must be echoed, not replaced - that is how "
                + "a request is followed across services.");

        var forbidden = await client.SendAsync(Keyed("/l03/challenge/admin/tools", role: null));
        await Teach.Status(HttpStatusCode.Forbidden, forbidden,
            "A valid key with no admin role, on an admin path, is 403: authenticated but not "
                + "allowed. 401 would mean 'I do not know who you are', which is false here.");

        var admin = await client.SendAsync(Keyed("/l03/challenge/admin/tools", role: "admin"));
        await Teach.Status(HttpStatusCode.OK, admin,
            "Right key, right role: 200.");
        Teach.Equal("ok", await admin.Content.ReadAsStringAsync(),
            "…and the terminal handler runs.");

        var ordinary = await client.SendAsync(Keyed("/l03/challenge/reports", role: null));
        await Teach.Status(HttpStatusCode.OK, ordinary,
            "/l03/challenge/reports is not an admin path, so a valid key is enough. Getting "
                + "403 here means the admin check is not inside a branch - it is running for "
                + "every path.");

        static HttpRequestMessage Keyed(string path, string? role)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, path);
            message.Headers.Add("X-Api-Key", "dojo-key");
            if (role is not null)
            {
                message.Headers.Add("X-Role", role);
            }

            return message;
        }
    }

    [Fact]
    public async Task Review1_TheOutermostMiddlewareSeesTheFinalStatusCode()
    {
        using var client = factory.CreateClient();

        var teapot = await client.GetAsync("/l03/review/pipeline/teapot");
        await Teach.Status((HttpStatusCode)418, teapot,
            "Given code refuses to brew coffee with 418. If this is a 500, "
                + "StatusRecorderMiddleware still throws - reread README review.");

        Teach.Equal(418, await LastStatus(client),
            "The recorder never saw the 418, because the middleware that produced it "
                + "short-circuited first. Whatever wants to observe a response has to be "
                + "OUTSIDE the thing that produces it.");

        await client.GetAsync("/l03/review/pipeline/tea");
        Teach.Equal(200, await LastStatus(client),
            "A request that reaches the terminal handler ends as a 200, and the recorder "
                + "should have seen that too.");
    }

    private static async Task<int> LastStatus(HttpClient client)
    {
        var body = await client.GetFromJsonAsync<LastStatusDto>("/l03/review/last-status");
        return body?.Status ?? -1;
    }

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private sealed record LastStatusDto(int Status);
}
