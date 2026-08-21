using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.I1_InterviewConcepts;

namespace DotnetDojo.Gates;

public class I1_InterviewConceptsTests
{
    [Fact]
    public async Task Ex1_TheSingletonStopsHoardingOneRequestsId()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/i1/jobs");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /i1/jobs must answer 200 - reread README ex1.");

        var a = await first.Content.ReadFromJsonAsync<JobDto>();
        var b = await (await client.GetAsync("/i1/jobs")).Content.ReadFromJsonAsync<JobDto>();

        Teach.Equal(1, a!.TotalRuns, "The first run through the runner is run number 1.");
        Teach.Equal(2, b!.TotalRuns,
            "The count restarted, so the runner is being rebuilt per request. It is a "
                + "singleton on purpose - the fix for a captive dependency is never to "
                + "shorten the lifetime of the thing that was supposed to be long-lived.");

        Teach.True(a.RequestId != b.RequestId,
            "Both requests were handled under the same request id. The runner captured one "
                + "IRequestId in its constructor and, being a singleton, has held it ever "
                + "since - that is the captive dependency.");

        Teach.Equal(a.RequestId, a.Echo,
            "The id the runner reported is not the one the container gave the handler. The "
                + "runner must work on the current request's id, and that id must be one "
                + "object for the whole request.");
    }

    [Fact]
    public async Task Ex2_TheRejectionIsAuditedToo()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var rejected = await client.GetAsync("/i1/pipeline/anything");
        await Teach.Status(HttpStatusCode.Unauthorized, rejected,
            "Without an API key the gate still rejects the request - that part already "
                + "works.");

        Teach.Equal(1, await Count(client),
            "The rejected request was never audited, because the middleware that audits sits "
                + "downstream of the middleware that short-circuits. Anything that must see "
                + "every request has to be outside anything that can stop one.");

        var allowed = new HttpRequestMessage(HttpMethod.Get, "/i1/pipeline/anything");
        allowed.Headers.Add("X-Api-Key", "dojo-key");
        var ok = await client.SendAsync(allowed);
        await Teach.Status(HttpStatusCode.OK, ok, "With the key, the request gets through.");
        Teach.Equal("ok", await ok.Content.ReadAsStringAsync(),
            "…all the way to the terminal handler.");

        Teach.Equal(2, await Count(client),
            "…and that one is audited as well, so the total is 2.");
    }

    [Fact]
    public async Task Ex3_TheSummaryStopsBeingAnNPlusOne()
    {
        using var host = NewTracker();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/i1/projects/summary");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /i1/projects/summary must answer 200 - reread README ex3.");

        var summary = await response.Content.ReadFromJsonAsync<List<SummaryDto>>() ?? [];
        Teach.Equal("1,2,3", string.Join(",", summary.Select(s => s.ProjectId)),
            "One row per project, id ascending.");
        Teach.Equal("Dojo,Compiler,Garden", string.Join(",", summary.Select(s => s.Name)),
            "…with the project's name.");
        Teach.Equal("2,3,1", string.Join(",", summary.Select(s => s.TaskCount)),
            "Task counts: Dojo 2, Compiler 3, Garden 1.");
        Teach.Equal("1,2,1", string.Join(",", summary.Select(s => s.OpenCount)),
            "Open (not done) counts: 1, 2, 1.");

        Teach.True(commands == 1,
            $"Right answers, {commands} round trips. One query for the projects plus two per "
                + "project is the N+1 an interviewer is listening for. Describe the shape you "
                + "want in a single Select and the database does the counting.");
    }

    [Fact]
    public async Task Ex4_TheTicketResourceUsesTheRightCodes()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/i1/tickets", new { title = "add a metric" });
        await Teach.Status(HttpStatusCode.Created, created,
            "Creating a resource is 201, not 200 - reread README ex4.");
        Teach.Equal("/i1/tickets/2", created.Headers.Location?.ToString(),
            "…and a 201 without a Location header leaves the client with no way to reach "
                + "what it just made. One ticket is seeded, so the new one is 2.");
        var ticket = await created.Content.ReadFromJsonAsync<TicketDto>();
        Teach.Equal("add a metric", ticket?.Title, "The body is the created ticket.");

        var blank = await client.PostAsJsonAsync("/i1/tickets", new { title = "   " });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A blank title is a 400. Accepting it silently is the third bug in that handler.");

        var missing = await client.PutAsJsonAsync("/i1/tickets/99", new { title = "ghost" });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Replacing a ticket that does not exist is a 404, not a cheerful 200.");

        var replaced = await client.PutAsJsonAsync("/i1/tickets/1", new { title = "renamed" });
        await Teach.Status(HttpStatusCode.NoContent, replaced,
            "A successful replace has nothing to say: 204.");

        var again = await client.PutAsJsonAsync("/i1/tickets/1", new { title = "renamed" });
        await Teach.Status(HttpStatusCode.NoContent, again,
            "PUT is idempotent. Sending the identical request twice must leave the same "
                + "state and give the same answer - a 409 on the repeat breaks every "
                + "retry-after-timeout a client might do.");

        var invalid = await client.PutAsJsonAsync("/i1/tickets/1", new { title = "" });
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "The same validation applies on replace.");
    }

    [Fact]
    public async Task Review1_EveryoneGetsTheirOwnBasket()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.PostAsJsonAsync("/i1/review/basket/items", new { name = "bokken" });
        await Teach.Status(HttpStatusCode.Created, first,
            "Adding an item creates one, so the code is 201 - reread README review.");
        Teach.Equal("/i1/review/basket/items/1", first.Headers.Location?.ToString(),
            "…and it says where the new item lives.");

        var a = await first.Content.ReadFromJsonAsync<BasketDto>();
        Teach.Equal(1, a?.ItemCount, "One item in this request's basket.");

        var second = await client.PostAsJsonAsync("/i1/review/basket/items", new { name = "obi" });
        var b = await second.Content.ReadFromJsonAsync<BasketDto>();
        Teach.Equal(1, b?.ItemCount,
            "A different request is a different customer, so the count is 1 again. Getting 2 "
                + "means one basket is shared by the whole application - which is the "
                + "singleton-where-you-wanted-scoped bug, and in a real shop it is somebody "
                + "else's shopping in your cart.");
        Teach.True(a!.BasketId != b!.BasketId,
            "…and the two baskets are genuinely different objects.");

        var blank = await client.PostAsJsonAsync("/i1/review/basket/items", new { name = " " });
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank item name is still a 400.");
    }

    private static SqliteHost<TrackerDb> NewTracker() =>
        new SqliteHost<TrackerDb>().Seed(db =>
        {
            db.Projects.AddRange(
                new Project { Id = 1, Name = "Dojo" },
                new Project { Id = 2, Name = "Compiler" },
                new Project { Id = 3, Name = "Garden" });

            db.Tasks.AddRange(
                new TaskItem { Id = 1, ProjectId = 1, Title = "write lesson", Done = false },
                new TaskItem { Id = 2, ProjectId = 1, Title = "record demo", Done = true },
                new TaskItem { Id = 3, ProjectId = 2, Title = "fix parser", Done = false },
                new TaskItem { Id = 4, ProjectId = 2, Title = "add tests", Done = false },
                new TaskItem { Id = 5, ProjectId = 2, Title = "ship", Done = true },
                new TaskItem { Id = 6, ProjectId = 3, Title = "water", Done = false });
        });

    private static async Task<int> Count(HttpClient client)
    {
        var body = await client.GetFromJsonAsync<AuditDto>("/i1/audit-count");
        return body?.Count ?? -1;
    }

    private sealed record JobDto(Guid RequestId, Guid Echo, int TotalRuns);

    private sealed record AuditDto(int Count);

    private sealed record SummaryDto(int ProjectId, string? Name, int TaskCount, int OpenCount);

    private sealed record TicketDto(int Id, string? Title);

    private sealed record BasketDto(Guid BasketId, int ItemCount);
}
