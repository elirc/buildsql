using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L02_DependencyInjectionTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_OneServiceIsSharedAndTheOtherIsNot()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/ticket");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/ticket must answer 200. \"Unable to resolve service\" in the body means "
                + "the container was never told about the interface - reread README ex1.");

        var a = await first.Content.ReadFromJsonAsync<TicketDto>();
        var b = await (await client.GetAsync("/l02/ticket")).Content.ReadFromJsonAsync<TicketDto>();

        Teach.True(a!.Ticket != Guid.Empty,
            "\"ticket\" is missing from the response body. Return the ITicketSource's Ticket.");

        Teach.Equal(a.Ticket, b!.Ticket,
            "Two separate requests saw two different tickets, so ITicketSource is being "
                + "built again every time. One value shared by the whole application is a "
                + "singleton.");

        Teach.True(a.First != a.Second,
            "Both IIdGenerator parameters in ONE request came back with the same value, so "
                + "the container is reusing an instance. A fresh object per resolution is "
                + "transient.");

        Teach.True(a.First != b.First,
            "The two requests got the same generated id. Transient means a new instance "
                + "every time anyone asks - across requests as well as within one.");
    }

    [Fact]
    public async Task Ex2_ScopedIsOnePerRequestAndNotOnePerApplication()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/scope");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/scope must answer 200 - reread README ex2.");

        var a = await first.Content.ReadFromJsonAsync<ScopeDto>();
        var b = await (await client.GetAsync("/l02/scope")).Content.ReadFromJsonAsync<ScopeDto>();

        Teach.True(a!.First != Guid.Empty,
            "\"first\" is missing from the response body. Return both parameters' Id.");

        Teach.Equal(a.First, a.Second,
            "The container was asked for IRequestScope twice while handling ONE request and "
                + "handed back two different objects. That is transient behaviour; a request "
                + "scope has to be one instance for the whole request.");

        Teach.True(a.First != b!.First,
            "Two different requests shared one IRequestScope, which is singleton behaviour. "
                + "A scope ends when the request ends.");
    }

    [Fact]
    public async Task Ex3_ARequestScopedIdIsRecordedInAnApplicationWideTrail()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/audit");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/audit must answer 200 - reread README ex3.");

        var a = await first.Content.ReadFromJsonAsync<AuditDto>();
        var b = await (await client.GetAsync("/l02/audit")).Content.ReadFromJsonAsync<AuditDto>();

        Teach.Equal(1, a!.Seen,
            "The first request to reach the trail is the first thing it has ever recorded, "
                + "so Record must give back 1. If you got 0, you are not calling Record; if "
                + "you got something larger, the trail is not fresh.");

        Teach.Equal(2, b!.Seen,
            "The second request pushed the total to 2. Getting 1 again means every request "
                + "builds its own AuditTrail - that is scoped, and an audit trail that "
                + "forgets everything at the end of the request is not an audit trail.");

        Teach.True(a.CorrelationId != b.CorrelationId,
            "Both requests reported the same correlation id, so ICorrelation is shared by "
                + "the whole application. A value that identifies one request has to be born "
                + "and die with that request.");
    }

    [Fact]
    public async Task Ex4_EveryRegisteredRuleGetsAVote()
    {
        using var client = factory.CreateClient();

        var free = await client.GetAsync("/l02/rules?totalCents=0");
        await Teach.Status(HttpStatusCode.OK, free,
            "GET /l02/rules?totalCents=0 must answer 200 - reread README ex4.");
        Teach.Equal("PositiveTotalRule", await Violations(free),
            "A total of 0 breaks exactly one rule: it is not positive.");

        var huge = await client.GetAsync("/l02/rules?totalCents=99999");
        Teach.Equal("MaximumTotalRule,WholeCurrencyRule", await Violations(huge),
            "99999 is over the maximum and is not a whole unit of currency, so two rules "
                + "object - sorted A-Z. Seeing an empty list means those two rules were "
                + "never registered, so IEnumerable<IOrderRule> only ever contained one.");

        var fine = await client.GetAsync("/l02/rules?totalCents=2500");
        Teach.Equal("", await Violations(fine),
            "2500 satisfies all three rules, so the violations list is empty - not null.");
    }

    [Fact]
    public async Task Challenge_TheSingletonReportsThisRequestsToken()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/dispatch");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/dispatch must answer 200 - reread README challenge.");

        var a = await first.Content.ReadFromJsonAsync<DispatchDto>();
        var b = await (await client.GetAsync("/l02/dispatch")).Content.ReadFromJsonAsync<DispatchDto>();

        Teach.Equal(1, a!.Handled,
            "The dispatcher counts every dispatch the application has made, so the first "
                + "one is 1.");
        Teach.Equal(2, b!.Handled,
            "The count went back to 1, so the dispatcher is being rebuilt per request. It "
                + "is meant to be a singleton - fixing the captive dependency must not mean "
                + "making the singleton scoped.");

        Teach.True(a.Token != b.Token,
            "Both requests were dispatched under the same token. The dispatcher captured one "
                + "IRequestToken when it was constructed and has been holding it ever since - "
                + "that is a captive dependency.");

        Teach.Equal(a.Token, a.Echo,
            "The token the dispatcher reported is not the one the container gave this "
                + "handler. The dispatcher must work on the token belonging to the request "
                + "it is handling, and the request's token must be one object for the whole "
                + "request.");
    }

    [Fact]
    public async Task Review1_AScopedServiceIsDisposedWhenTheRequestEnds()
    {
        using var client = factory.CreateClient();

        var first = await client.GetAsync("/l02/review/unit-of-work");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /l02/review/unit-of-work must answer 200 - reread README review.");

        var a = await first.Content.ReadFromJsonAsync<UnitOfWorkDto>();
        var b = await (await client.GetAsync("/l02/review/unit-of-work")).Content
            .ReadFromJsonAsync<UnitOfWorkDto>();
        var c = await (await client.GetAsync("/l02/review/unit-of-work")).Content
            .ReadFromJsonAsync<UnitOfWorkDto>();

        Teach.Equal(0, a!.DisposedBefore,
            "Nothing has been disposed before the very first request.");
        Teach.Equal(1, b!.DisposedBefore,
            "By the second request, the first request's unit of work should have been "
                + "disposed. A count stuck at 0 means the container never owned a "
                + "per-request instance to dispose.");
        Teach.Equal(2, c!.DisposedBefore,
            "One disposal per finished request - the container disposes what it created "
                + "when the scope it created it in ends.");

        Teach.True(a.Id != b.Id,
            "Every request should get its own unit of work; these two shared one.");
    }

    private static async Task<string> Violations(HttpResponseMessage response)
    {
        var body = await response.Content.ReadFromJsonAsync<RuleDto>();
        return string.Join(",", body?.Violations ?? []);
    }

    private sealed record TicketDto(Guid Ticket, Guid First, Guid Second);

    private sealed record ScopeDto(Guid First, Guid Second);

    private sealed record AuditDto(Guid CorrelationId, int Seen);

    private sealed record RuleDto(List<string>? Violations);

    private sealed record DispatchDto(Guid Token, Guid Echo, int Handled);

    private sealed record UnitOfWorkDto(Guid Id, int DisposedBefore);
}
