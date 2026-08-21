# i1 — Interview concepts

This is not a new lesson. It is the ten you have already done, rearranged into
the shape an interview puts them in.

Two things change. First, `reading.md` for this lesson is a **question bank**:
fifty-plus questions with model answers, grouped by topic, each tagged ⭐, ⭐⭐ or
⭐⭐⭐ by how often it actually comes up, and each cross-referenced to the lesson
that teaches it. Second, the exercises here are not "build this" — they are
**"here is some code, find the bug"**, because that is what a technical screen
looks like. Every one of them is a real defect that compiles, runs, and returns
plausible answers.

## How to use the question bank

Read it the way you would rehearse, not the way you would study.

**Cover the answer.** Read the question, say your answer *out loud*, in full
sentences, as if someone were listening — then uncover and compare. Recognising
an answer and being able to produce one under mild social pressure are different
skills, and only the second one is being tested. If you have never said "a
scoped service is one instance per request, and the request scope is created by
the framework" with your mouth, you will not say it well the first time.

**Aim for the shape, not the words.** A good answer is three to six sentences:
what it is, why it exists, one concrete example, and the trade-off. Every model
answer in the bank is written in that shape on purpose. Nobody is checking your
phrasing against a transcript.

**Follow the follow-up.** Each answer names the question an interviewer will ask
next — that is where the conversation actually happens, and where a memorised
answer runs out. If you cannot answer the follow-up, that is the topic to reread.

**Use the stars to budget.** ⭐⭐⭐ means you will almost certainly be asked;
⭐⭐ means expect it in a longer interview; ⭐ means it separates a strong
candidate. Get every ⭐⭐⭐ fluent before you polish anything else. The
`i3_interview_rapidfire` lesson exists to keep exactly those coming back at
spaced intervals.

**When you are weak on something, go back and do the lesson.** The bank
cross-references every topic to the lesson that teaches it by doing. Rereading
an answer you did not understand produces the feeling of knowing something,
which is worse than nothing.

## Exercise 1 — fix the captive dependency

*"This service reports the wrong request id on every request after the first.
Have a look."*

Edit `src/Api/I1_InterviewConcepts/Ex1.cs`. `GET /i1/jobs` returns
`{requestId, echo, totalRuns}`, where `requestId` is what the singleton
`JobRunner` believes the current request is, `echo` is what the container handed
the endpoint, and `totalRuns` counts every job the application has ever run.

Make it so that:

- `totalRuns` counts **1, then 2** across two requests — the runner is a
  singleton and must stay one
- `requestId` **differs** between requests
- `requestId` **equals** `echo` within a request

Two of those three are already true. Finding which one is wrong, and why, is the
exercise; the fix is small and it is not "make the singleton scoped".

```
uv run dojo test dotnet i1_interview_concepts ex1
```

## Exercise 2 — fix the middleware order

*"Our audit log is missing every rejected request. Any idea?"*

Edit `src/Api/I1_InterviewConcepts/Ex2.cs`, method `Configure`. Both
middlewares are given and both work. `GET /i1/pipeline/…` without an
`X-Api-Key` header is a 401; with the header it reaches the terminal. The audit
counter is readable at `GET /i1/audit-count`.

Make the count reach **1 after the rejected request** and **2 after the
successful one**. One line moves.

```
uv run dojo test dotnet i1_interview_concepts ex2
```

## Exercise 3 — fix the N+1

*"This endpoint is fine in staging and takes four seconds in production. Same
code, same query. What is going on?"*

Edit `src/Api/I1_InterviewConcepts/Ex3.cs`. `GET /i1/projects/summary` already
returns exactly the right numbers — a row per project with its name, its task
count and its open-task count. The gate fails it anyway, because it counted the
SQL commands.

Make it one query. The values must not change.

This is the highest-frequency EF Core interview question there is, and the
reason it is worth practising rather than just knowing is that the broken
version looks completely reasonable.

```
uv run dojo test dotnet i1_interview_concepts ex3
```

## Exercise 4 — fix the REST semantics

*"Review this resource for me."*

Edit `src/Api/I1_InterviewConcepts/Ex4.cs`. Two handlers, and between them five
defects. `POST /i1/tickets` must answer **201** with a `Location` header and
**400** for a blank title. `PUT /i1/tickets/{id}` must answer **404** for an
unknown id, **400** for a blank title, and **204** on success — *including when
the same request is sent twice*, because PUT is idempotent and a 409 on the
repeat breaks every client that retries after a timeout.

Nothing here throws. Every one of these bugs ships.

```
uv run dojo test dotnet i1_interview_concepts ex4
```

## Review

`review1` is not part of finishing this lesson; the scheduler brings it back at
3, 7, 21 and 60 days. Edit `src/Api/I1_InterviewConcepts/Review1.cs`: two
independent bugs in one small endpoint — a shopping basket that every customer
in the application is sharing, and a create that answers 200 with no `Location`.
`POST /i1/review/basket/items` must answer **201** with a `Location` of
`/i1/review/basket/items/{itemCount}`, and each request must get its own basket,
so two separate requests both report `itemCount: 1`.

## The gate

This is the entire gate class, `tests/Gates/I1_InterviewConceptsTests.cs`:

```csharp
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
```

In plain English: each of these five is a bug that a reasonable person shipped.
None of them throws, none of them fails a status-code smoke test, and three of
the five would pass a code review by someone who had not read this course. That
is the point — the failures interviewers ask about are the ones that look fine.

## The teaching point

The skill an interview is really testing is not recall, it is **diagnosis**: can
you look at plausible code and say what is wrong with it and why, in a sentence
someone else can act on. All five exercises here are that skill, and the model
answers in `reading.md` are written so that you can hear what a good verbal
answer sounds like.

Next: **i2_interview_drills**, where you build things instead of fixing them —
six tasks in the shape and size interviewers actually set, each with a time-box.
