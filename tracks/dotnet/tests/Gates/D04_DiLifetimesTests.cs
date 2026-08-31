using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class D04_DiLifetimesTests
{
    [Fact]
    public async Task Ex1_ThreeRequirementsPickThreeLifetimes()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d04/lifetimes");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d04/lifetimes must answer 200 - reread README ex1.");

        var a = await first.Content.ReadFromJsonAsync<LifetimeDto>();
        var b = await client.GetFromJsonAsync<LifetimeDto>("/d04/lifetimes");

        Teach.Equal(a!.Cache, b!.Cache,
            "Two requests saw two different caches, so the expensive object is being built "
                + "again every time. One instance for the whole application is a singleton.");

        Teach.Equal(a.Correlation[0], a.Correlation[1],
            "The container was asked for ICorrelation twice while handling ONE request and "
                + "handed back two different objects. An id that identifies this request has "
                + "to be one object for the whole request.");

        Teach.True(a.Correlation[0] != b.Correlation[0],
            "…and two different requests shared one correlation id, which is singleton "
                + "behaviour. A scope ends when the request ends.");

        Teach.True(a.Reading[0] != a.Reading[1],
            "Both readings in one request came back with the same value, so the container is "
                + "reusing an instance. A reading that must be fresh at every use is transient.");
    }

    [Fact]
    public async Task Ex2_ASingletonMustNotHoldOntoATransient()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d04/report");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d04/report must answer 200 - reread README ex2.");

        var a = await first.Content.ReadFromJsonAsync<ReportDto>();
        var b = await client.GetFromJsonAsync<ReportDto>("/d04/report");

        Teach.True(a!.First != a.Second,
            "Two builds in ONE request produced the same stamp. The builder took an IStamp in "
                + "its constructor, and because the builder is a singleton it has been holding "
                + "that one object since startup - a captive dependency. The transient "
                + "registration is not wrong; the capture is.");

        Teach.True(a.First != b!.First,
            "…and the stamp did not change between requests either, for the same reason.");

        Teach.Equal(4, new[] { a.First, a.Second, b.First, b.Second }.Distinct().Count(),
            "Four builds, four different stamps. Anything less means an instance is still "
                + "being shared somewhere.");
    }

    [Fact]
    public async Task Ex3_EachRunOfTheJobGetsItsOwnScope()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d04/job");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d04/job must answer 200. A 500 saying a scoped service cannot be resolved "
                + "from the root provider is the whole point of the exercise: the container is "
                + "telling you the singleton has no scope to resolve into. Reread README ex3.");

        var a = await response.Content.ReadFromJsonAsync<JobDto>();

        Teach.True(a!.First != a.Second,
            "Two runs of the job shared one unit of work. Each run is its own piece of work "
                + "and needs its own scope, which means creating one per run rather than one "
                + "per runner.");

        Teach.True(a.First != a.Request && a.Second != a.Request,
            "A run reused the REQUEST's unit of work. The runner is a singleton and knows "
                + "nothing about the request that happened to trigger it - which is exactly "
                + "why it has to open a scope of its own.");

        var b = await client.GetFromJsonAsync<JobDto>("/d04/job");
        Teach.Equal(6, new[] { a.First, a.Second, a.Request, b!.First, b.Second, b.Request }
            .Distinct().Count(),
            "Two requests, six units of work, all different.");
    }

    [Fact]
    public async Task Ex4_TheContainerDisposesWhatItCreated()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d04/leases");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d04/leases must answer 200 - reread README ex4.");

        var a = await first.Content.ReadFromJsonAsync<LeaseDto>();
        Teach.Equal(0, a!.DisposedBefore, "Nothing has been returned before the first request.");
        Teach.True(a.First != a.Second,
            "Both leases in one request are the same object, so each caller is NOT getting its "
                + "own. Two callers sharing one borrowed resource is the bug this lifetime "
                + "exists to prevent.");

        var b = await client.GetFromJsonAsync<LeaseDto>("/d04/leases");
        Teach.Equal(2, b!.DisposedBefore,
            "By the second request, BOTH leases from the first should have been disposed. A 0 "
                + "here means nothing is ever given back: the container only disposes what it "
                + "created inside a scope, and a singleton's scope is the whole process.");

        var c = await client.GetFromJsonAsync<LeaseDto>("/d04/leases");
        Teach.Equal(4, c!.DisposedBefore,
            "Two disposals per finished request. Transient does not mean untracked - a "
                + "transient IDisposable is still owned by the scope that resolved it, which "
                + "is why resolving one from the root provider leaks until shutdown.");
    }

    [Fact]
    public async Task Ex5_AddAppendsTheLastOneWinsAndTryAddGivesUp()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d04/greeters");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d04/greeters must answer 200 - reread README ex5.");

        var body = await response.Content.ReadFromJsonAsync<GreeterDto>();

        Teach.Equal("casual", body?.Single,
            "Asking for ONE IGreeter gives you the LAST registration, not the first. That is "
                + "the whole replacement mechanism: a later Add wins.");

        Teach.Equal("formal,casual", string.Join(",", body?.All ?? []),
            "…and asking for all of them gives you every registration, in the order they were "
                + "added. \"loud\" appearing here means the TryAdd was not a no-op; only "
                + "\"casual\" means the formal registration is missing.");
    }

    [Fact]
    public async Task Ex6_OneUnitOfWorkPerRequestAndEverybodyShares()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d04/unit");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d04/unit must answer 200 - reread README ex6.");

        var a = await first.Content.ReadFromJsonAsync<UnitDto>();

        Teach.Equal(a!.Handler, a.People,
            "The handler and the people repository are working on two different units of "
                + "work. Everything in one request has to share one, or a save in one "
                + "repository cannot see a change made in the other - this is exactly why a "
                + "DbContext is registered scoped.");

        Teach.Equal(a.Handler, a.Orders, "…and the orders repository is a third one.");

        var b = await client.GetFromJsonAsync<UnitDto>("/d04/unit");
        Teach.True(a.Handler != b!.Handler,
            "Two different requests shared one unit of work, which is singleton behaviour: one "
                + "request's uncommitted changes would be visible to another's. The unit has "
                + "to be born and die with the request.");
    }

    [Fact]
    public async Task Ex7_ASingletonCanStillSeeTheCurrentRequest()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var alpha = await client.SendAsync(Traced("alpha"));
        await Teach.Status(HttpStatusCode.OK, alpha,
            "GET /d04/ambient must answer 200 - reread README ex7.");
        Teach.Equal("alpha", (await alpha.Content.ReadFromJsonAsync<AmbientDto>())?.Trace,
            "The reporter has to read the header of the request being handled right now. It "
                + "cannot take an ICorrelation or an HttpContext in its constructor - it is a "
                + "singleton, built once, long before this request existed.");

        var beta = await client.SendAsync(Traced("beta"));
        Teach.Equal("beta", (await beta.Content.ReadFromJsonAsync<AmbientDto>())?.Trace,
            "…and the next request must give a different answer from the same instance.");

        var none = await client.GetFromJsonAsync<AmbientDto>("/d04/ambient");
        Teach.Equal("none", none?.Trace,
            "A request with no X-Trace header reports \"none\" rather than an empty string or "
                + "a crash.");
    }

    [Fact]
    public async Task Ex8_FourRegistrationsAndFourDifferentAnswers()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d04/audit");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d04/audit must answer 200 - reread README ex8.");

        var a = await first.Content.ReadFromJsonAsync<AuditDto>();
        var b = await client.GetFromJsonAsync<AuditDto>("/d04/audit");
        var c = await client.GetFromJsonAsync<AuditDto>("/d04/audit");

        Teach.Equal(1, a!.ParserBuilds, "The parser is built once, on first use.");
        Teach.Equal(1, c!.ParserBuilds,
            "…and never again. A count that climbs with the request number means the "
                + "expensive object is being rebuilt per request or per resolution.");

        Teach.Equal(a.BasketA, a.BasketB,
            "One request asked for a basket twice and got two. Everything in a request has to "
                + "put things in the same basket.");
        Teach.True(a.BasketA != b!.BasketA,
            "…and two requests shared a basket, which is how one customer ends up paying for "
                + "another's shopping.");

        Teach.True(a.TicketA != a.TicketB,
            "Two tickets in one request are the same ticket. A ticket is never reused.");
        Teach.True(a.TicketA != b.TicketA, "…and neither is one from another request.");

        Teach.Equal(1, a.Handled, "The first request handled is number 1…");
        Teach.Equal(2, b.Handled, "…the second is 2…");
        Teach.Equal(3, c.Handled,
            "…and the third is 3. A count stuck at 1 means the tally is rebuilt every request, "
                + "so it counts nothing.");
    }

    // … private helpers and DTO records, listed below …

    private static HttpRequestMessage Traced(string trace)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/d04/ambient");
        request.Headers.Add("X-Trace", trace);

        return request;
    }

    private sealed record LifetimeDto(Guid Cache, List<Guid> Correlation, List<Guid> Reading);

    private sealed record ReportDto(Guid First, Guid Second);

    private sealed record JobDto(Guid First, Guid Second, Guid Request);

    private sealed record LeaseDto(int DisposedBefore, Guid First, Guid Second);

    private sealed record GreeterDto(string? Single, List<string>? All);

    private sealed record UnitDto(Guid Handler, Guid People, Guid Orders);

    private sealed record AmbientDto(string? Trace);

    private sealed record AuditDto(
        string? Parser, int ParserBuilds, Guid BasketA, Guid BasketB,
        Guid TicketA, Guid TicketB, int Handled);
}
