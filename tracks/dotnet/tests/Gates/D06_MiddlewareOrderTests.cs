using System.Net;

namespace DotnetDojo.Gates;

public class D06_MiddlewareOrderTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_ThePipelineUnwindsInReverse()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/d06/order");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d06/order must answer 200 - reread README ex1.");

        Teach.Equal("timing>,auth>,cache>,handler,cache<,auth<,timing<",
            await response.Content.ReadAsStringAsync(),
            "Timing has to be outermost, because anything it does not wrap it cannot measure; "
                + "auth has to come before the cache, because a cache hit must not be served "
                + "to someone who was never allowed to ask. Marks go in in registration order "
                + "and come out in reverse - that is the whole model.");
    }

    [Fact]
    public async Task Ex2_TheGuardComesBeforeTheWorkItIsGuarding()
    {
        using var client = factory.CreateClient();

        var allowed = await client.SendAsync(Keyed("/d06/guard"));
        await Teach.Status(HttpStatusCode.OK, allowed,
            "GET /d06/guard with the key must answer 200 - reread README ex2.");
        Teach.Equal("guard>,expensive>,handler,expensive<,guard<",
            await allowed.Content.ReadAsStringAsync(),
            "With a valid key everything runs, guard outermost.");

        var refused = await client.GetAsync("/d06/guard");
        await Teach.Status(HttpStatusCode.Unauthorized, refused,
            "Without the key the guard short-circuits: 401.");

        string trace = await refused.Content.ReadAsStringAsync();
        Teach.True(!trace.Contains("expensive"),
            "The expensive work ran anyway. A guard placed after the thing it guards rejects "
                + "the request only once the cost has already been paid - which is the exact "
                + "opposite of the point.\n  trace: " + trace);
        Teach.Equal("guard>", trace, "…so the trace stops at the guard.");
    }

    [Fact]
    public async Task Ex3_NothingRunsAfterTheTerminalDelegate()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/d06/terminal");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d06/terminal must answer 200 - reread README ex3.");

        Teach.Equal("outer>,inner>,handler,inner<,outer<",
            await response.Content.ReadAsStringAsync(),
            "A trace of just \"handler\" means Run came first: Run is TERMINAL - it never "
                + "calls next, so everything registered after it is dead code the compiler "
                + "cannot warn you about. The terminal delegate goes last, always.");
    }

    [Fact]
    public async Task Ex4_UseWhenBranchesAndRejoins()
    {
        using var client = factory.CreateClient();

        var admin = await client.GetAsync("/d06/when/admin/reports");
        await Teach.Status(HttpStatusCode.OK, admin,
            "GET /d06/when/admin/reports must answer 200 - reread README ex4.");
        Teach.Equal("admin>,common>,handler,common<,admin<",
            await admin.Content.ReadAsStringAsync(),
            "An admin path picks up the extra marker AND still goes through everything after "
                + "it. That rejoining is what UseWhen is for.");

        var ordinary = await client.GetAsync("/d06/when/reports");
        Teach.Equal("common>,handler,common<", await ordinary.Content.ReadAsStringAsync(),
            "A path outside the branch skips the marker and is otherwise untouched. Seeing "
                + "\"admin\" here means the predicate matches everything.");
    }

    [Fact]
    public async Task Ex5_MapWhenBranchesAndDoesNotComeBack()
    {
        using var client = factory.CreateClient();

        var beta = await client.GetAsync("/d06/beta/thing?beta=1");
        await Teach.Status(HttpStatusCode.OK, beta,
            "GET /d06/beta/thing?beta=1 must answer 200 - reread README ex5.");
        Teach.Equal("beta>,beta-handler,beta<", await beta.Content.ReadAsStringAsync(),
            "The branch is a whole pipeline of its own and it ends there. \"common\" or "
                + "\"handler\" appearing means the branch rejoined the main pipeline, which is "
                + "UseWhen's behaviour, not MapWhen's.");

        var ordinary = await client.GetAsync("/d06/beta/thing");
        Teach.Equal("common>,handler,common<", await ordinary.Content.ReadAsStringAsync(),
            "Without the query parameter the main pipeline runs as before.");
    }

    [Fact]
    public async Task Ex6_AHeaderThatDependsOnLaterNeedsOnStarting()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/d06/headers");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d06/headers must answer 200 - reread README ex6.");
        Teach.Equal("payload", await response.Content.ReadAsStringAsync(),
            "The handler's body still has to come back untouched.");

        Teach.Equal("work>,handler", Header(response, "X-Marks"),
            "An empty header means it was written before anything happened. The value has to "
                + "be computed at the last moment the headers are still writable - which is "
                + "the instant the response starts, not after the pipeline unwinds. Note what "
                + "it does NOT contain: \"work<\" has not happened yet when the handler writes.");
    }

    [Fact]
    public async Task Ex7_APostNextLineDoesNotRunIfSomethingDownstreamThrows()
    {
        using var client = factory.CreateClient();

        var fine = await client.GetAsync("/d06/errors/fine");
        await Teach.Status(HttpStatusCode.OK, fine,
            "GET /d06/errors/fine must answer 200 - reread README ex7.");
        Teach.Equal("audit>,catch>,risky,handler,catch<,audit<",
            await fine.Content.ReadAsStringAsync(),
            "Nothing throws here, so every layer completes in the usual order.");

        var boom = await client.GetAsync("/d06/errors/boom");
        await Teach.Status(HttpStatusCode.ServiceUnavailable, boom,
            "The risky middleware throws, and the catcher turns that into a 503. A 500 with an "
                + "exception page means the throw happened OUTSIDE the try - a catcher can "
                + "only catch what is downstream of it.");

        Teach.Equal("audit>,catch>,risky,caught,catch<,audit<",
            await boom.Content.ReadAsStringAsync(),
            "\"audit<\" is the interesting mark. Code after `await next(...)` is skipped when "
                + "next throws - so the audit layer only finishes because the catcher below it "
                + "swallowed the exception first. Put audit inside the catcher and its closing "
                + "mark disappears on every failure, which is when you most wanted it.");
    }

    [Fact]
    public async Task Ex8_TheWholePipelineInOneOrder()
    {
        using var client = factory.CreateClient();

        var ok = await client.SendAsync(Keyed("/d06/full/reports"));
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /d06/full/reports with the key must answer 200 - reread README ex8.");
        Teach.Equal("ok", await ok.Content.ReadAsStringAsync(), "…with the handler's body.");
        Teach.Equal("catch>,guard>,handler", Header(ok, "X-Marks"),
            "Header outermost so every response carries it, then the catcher, then the guard. "
                + "The header is written when the response starts, so it holds what had "
                + "happened up to that moment.");

        var admin = await client.SendAsync(Keyed("/d06/full/admin/reports"));
        Teach.Equal("catch>,guard>,admin>,handler", Header(admin, "X-Marks"),
            "An admin path picks up the branch, and the branch sits inside the guard - a "
                + "branch outside it would run for callers who never proved anything.");

        var anonymous = await client.GetAsync("/d06/full/reports");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous, "No key: 401.");
        Teach.Equal("no key", await anonymous.Content.ReadAsStringAsync(),
            "…and the handler never ran.");
        Teach.Equal("catch>,guard>", Header(anonymous, "X-Marks"),
            "A rejected request still carries the header, because the header middleware is "
                + "outside the guard. Put it inside and your 401s and 503s - the responses you "
                + "most want to trace - are the ones missing the trace.");

        var boom = await client.SendAsync(Keyed("/d06/full/boom"));
        await Teach.Status(HttpStatusCode.ServiceUnavailable, boom,
            "The handler throws and the catcher answers 503.");
        Teach.Equal("failed", await boom.Content.ReadAsStringAsync(), "…with its own body.");
        Teach.Equal("catch>,guard>,handler,caught", Header(boom, "X-Marks"),
            "…and the header is still there, because the catcher is inside it.");
    }

    // … private helpers, listed below …

    private static HttpRequestMessage Keyed(string url)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("X-Key", "d06-key");

        return request;
    }

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";
}
