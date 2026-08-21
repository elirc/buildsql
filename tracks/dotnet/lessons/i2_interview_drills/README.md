# i2 — Interview drills

Six tasks, in the shape and size interviewers actually set, each with a
time-box. Then one that is a whole take-home.

The time-boxes are the point. In an interview you do not get to think for
forty minutes about a rate limiter; you get twenty-five, while someone watches,
and the thing that saves you is having built one before. Set a timer. If it
runs out, stop, take the hint, and note what slowed you down — that note is more
valuable than finishing.

Each drill is written the way an interviewer would say it, in italics. Read the
prompt, then the requirements, then close the README and work from the gate.

## Drill 1 — "Build me a search endpoint." ⏱ 20 minutes

Edit `src/Api/I2_InterviewDrills/Ex1.cs`. `GET /i2/books` over the six books in
`Library.Books`:

- `author` filters, exact but **case-insensitive**
- `sort` is `title` (default) or `year`
- `page` is 1-based, default 1; `size` defaults to 3 and may not exceed 20
- **200** with the page as a JSON array, plus an `X-Total-Count` header holding
  the number of *matches*
- anything outside those rules is a **400** validation problem keyed by the
  offending parameter name

Order of operations: filter, then sort, then page. Get that wrong and the
answers are subtly wrong rather than obviously wrong, which is worse.

```
uv run dojo test dotnet i2_interview_drills ex1
```

## Drill 2 — "Write me a rate limiter." ⏱ 25 minutes

Edit `src/Api/I2_InterviewDrills/Ex2.cs`. A middleware in front of
`/i2/limited/…`:

- no `X-Api-Key` header → **400**, and do not call `next`
- more than **3** requests for a key → **429** with a `Retry-After` header of
  `60`, and do not call `next`
- otherwise → call `next`
- each key is counted separately

`IRequestCounter` does the counting for you; the middleware is the exercise.
The two details people miss under time pressure are the `Retry-After` header —
without it a client backs off for a length of time it invented — and actually
short-circuiting, rather than setting 429 and letting the request through
anyway.

Real services use `builder.Services.AddRateLimiter(...)`, which has been in the
framework since .NET 7 and does sliding windows, token buckets and concurrency
limits properly. Knowing it exists is part of the answer; being able to write
the naive one is the rest.

```
uv run dojo test dotnet i2_interview_drills ex2
```

## Drill 3 — "Make this PUT idempotent." ⏱ 15 minutes

Edit `src/Api/I2_InterviewDrills/Ex3.cs`. `PUT /i2/settings/{key}` with a body
of `{"value": "…"}`:

- blank value → **400** validation problem keyed `value`
- the key did not exist → **201**, with a `Location` of `/i2/settings/{key}`
- the key existed → **204**, and the identical request again is still **204**

This is PUT-as-upsert, and it is the shape most configuration and
key-value APIs actually want: the client names the resource, so it can create it
without a server-generated id. The 201-versus-204 distinction is the only part
that is not free, and `ISettingStore.Set` tells you which happened.

```
uv run dojo test dotnet i2_interview_drills ex3
```

## Drill 4 — "Secure this endpoint, then show me the test." ⏱ 20 minutes

Edit `src/Api/I2_InterviewDrills/Ex4.cs`. `GET /i2/audit/logs` is wide open.
Add an authorization policy called `Ex4Services.AuditorsOnly` that authenticates
on `I2Jwt.Scheme` and requires the `auditor` role, and apply it.

- no token → **401**
- a valid token whose role is `user` → **403**
- a valid token whose role is `auditor` → **200**

The bearer scheme is already registered for you in `Model.cs` — with its own
scheme name, so it cannot collide with lesson 09's. Read the token factory at
the bottom of the gate: minting your own tokens against a
`WebApplicationFactory` *is* the answer to "show me the test".

```
uv run dojo test dotnet i2_interview_drills ex4
```

## Drill 5 — "Give me one place that handles failures." ⏱ 20 minutes

Edit `src/Api/I2_InterviewDrills/Ex5.cs`. One middleware in front of
`/i2/guard/…`:

- every response carries `X-Correlation-Id` — echoed from the request when the
  client sent one, otherwise a fresh `Guid`
- `DrillNotFoundException` → **404** ProblemDetails whose `detail` is the
  exception's message, logged at **Warning**
- anything else → **500** ProblemDetails with a generic title and no detail,
  logged at **Error** with the exception object attached
- both documents carry an extension member `correlationId`, and both log entries
  carry a named property `CorrelationId`

The trap in `DrillTrap` throws an exception whose message contains an API key.
The gate checks it does not reach the client.

```
uv run dojo test dotnet i2_interview_drills ex5
```

## Drill 6 — "This list endpoint is slow. Fix it." ⏱ 15 minutes

Edit `src/Api/I2_InterviewDrills/Ex6.cs`. `GET /i2/tasks/overview` returns every
task with its project's name, id ascending. The values are already right; the
gate counts the SQL commands and there are seven.

Make it one query without changing the output.

```
uv run dojo test dotnet i2_interview_drills ex6
```

## Challenge — the 45-minute take-home

Honest difficulty note: nothing here is new. It is authentication, pagination,
validation, DTO discipline and status codes at the same time, which is exactly
what makes it representative.

Edit `src/Api/I2_InterviewDrills/Challenge.cs`. A private, paged note resource
where both endpoints require an authenticated caller on `I2Jwt.Scheme` — a route
group is the tidy way to say that once.

`GET /i2/challenge/notes`:

- **200** with one page of the **caller's own** notes, id ascending
- `X-Total-Count` holding how many that caller has in total
- `page` 1-based default 1; `size` default 2, maximum 10
- **400** validation problem keyed by parameter otherwise

`POST /i2/challenge/notes`:

- blank text → **400** validation problem keyed `text`
- otherwise **201** with `Location: /i2/challenge/notes/{id}` and the created
  note, owned by the caller

Five notes are seeded; four are Ada's and one is Grace's. If Grace can see note
1, you have shipped the most commonly exploited API vulnerability there is.

```
uv run dojo test dotnet i2_interview_drills challenge
```

## Review

`review1` is not part of finishing this lesson; the scheduler brings it back at
3, 7, 21 and 60 days. Edit `src/Api/I2_InterviewDrills/Review1.cs` and make a
**POST safe to retry**.

`POST /i2/review/orders` with an `Idempotency-Key` header:

- no header → **400** validation problem keyed `Idempotency-Key`
- blank item → **400** keyed `item`
- a key never seen → **201**, `Location: /i2/review/orders/{id}`, the new order
- a key seen before → **200** with the **same order as the first time**, nothing
  new created, *whatever the body says*

This is how Stripe and every serious payments API stop a network timeout from
charging a card twice, and "how would you make a create idempotent?" is the
standard follow-up to the safe-and-idempotent question.

## The gate

This is the entire gate class, `tests/Gates/I2_InterviewDrillsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using DotnetDojo.Api.I1_InterviewConcepts;
using DotnetDojo.Api.I2_InterviewDrills;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Gates;

public class I2_InterviewDrillsTests
{
    [Fact]
    public async Task Ex1_TheSearchEndpointFiltersSortsPagesAndValidates()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var defaults = await client.GetAsync("/i2/books");
        await Teach.Status(HttpStatusCode.OK, defaults,
            "GET /i2/books must answer 200 - reread README drill 1.");
        Teach.Equal("1,2,5", await Ids(defaults),
            "No query string means: every book, sorted by title, page 1 of size 3 - Dune, "
                + "Emma, Foundation.");
        Teach.Equal("6", Header(defaults, "X-Total-Count"),
            "X-Total-Count is how many matched, not how many you returned.");

        var byYear = await client.GetAsync("/i2/books?sort=year");
        Teach.Equal("2,3,5", await Ids(byYear),
            "sort=year is oldest first: Emma 1815, Persuasion 1817, Foundation 1951.");

        var filtered = await client.GetAsync("/i2/books?author=Gibson&sort=year");
        Teach.Equal("4,6", await Ids(filtered),
            "Gibson wrote two of these, and sort=year puts Neuromancer before Idoru. Filter "
                + "first, then sort, then page.");
        Teach.Equal("2", Header(filtered, "X-Total-Count"),
            "…and the total counts the matches, not the whole catalogue.");

        var caseInsensitive = await client.GetAsync("/i2/books?author=austen");
        Teach.Equal("2", Header(caseInsensitive, "X-Total-Count"),
            "Author matching is case-insensitive - a client should not have to guess your "
                + "capitalisation.");

        var page2 = await client.GetAsync("/i2/books?page=2&size=2");
        Teach.Equal("5,6", await Ids(page2),
            "By title, page 2 of size 2 is the third and fourth books: Foundation, Idoru.");

        var badSort = await client.GetAsync("/i2/books?sort=pages");
        await Teach.Status(HttpStatusCode.BadRequest, badSort, "\"pages\" is not a sort.");
        Teach.Equal("sort", await ErrorKeys(badSort), "…and the error names the parameter.");

        var badSize = await client.GetAsync("/i2/books?size=21");
        await Teach.Status(HttpStatusCode.BadRequest, badSize, "The cap is 20.");
        Teach.Equal("size", await ErrorKeys(badSize), "…keyed \"size\".");

        var badPage = await client.GetAsync("/i2/books?page=0");
        await Teach.Status(HttpStatusCode.BadRequest, badPage, "Pages are 1-based.");
        Teach.Equal("page", await ErrorKeys(badPage), "…keyed \"page\".");
    }

    [Fact]
    public async Task Ex2_TheRateLimiterCountsPerKeyAndSaysWhenToComeBack()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        for (int i = 1; i <= 3; i++)
        {
            var allowed = await client.SendAsync(Keyed("/i2/limited/thing", "alpha"));
            await Teach.Status(HttpStatusCode.OK, allowed,
                $"Request {i} of 3 for this key is within the limit and must be a 200 - "
                    + "reread README drill 2.");
        }

        var blocked = await client.SendAsync(Keyed("/i2/limited/thing", "alpha"));
        await Teach.Status((HttpStatusCode)429, blocked,
            "The fourth request for the same key is over the limit: 429 Too Many Requests.");
        Teach.Equal("60", Header(blocked, "Retry-After"),
            "A 429 without Retry-After tells the client to back off but not for how long, so "
                + "it will guess - usually badly, and usually immediately.");
        Teach.Equal("", await blocked.Content.ReadAsStringAsync(),
            "A rate-limited request must not reach the handler at all - do not call next.");

        var otherKey = await client.SendAsync(Keyed("/i2/limited/thing", "beta"));
        await Teach.Status(HttpStatusCode.OK, otherKey,
            "A different key has its own budget. Counting globally would let one noisy "
                + "client lock everyone else out.");

        var anonymous = await client.GetAsync("/i2/limited/thing");
        await Teach.Status(HttpStatusCode.BadRequest, anonymous,
            "With no X-Api-Key there is nothing to count against: 400.");
    }

    [Fact]
    public async Task Ex3_ThePutCreatesOnceAndThenReplaces()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var created = await client.PutAsJsonAsync("/i2/settings/theme", new { value = "dark" });
        await Teach.Status(HttpStatusCode.Created, created,
            "The key did not exist, so this PUT created it: 201 - reread README drill 3.");
        Teach.Equal("/i2/settings/theme", created.Headers.Location?.ToString(),
            "…with a Location naming the resource it created.");

        var replaced = await client.PutAsJsonAsync("/i2/settings/theme", new { value = "light" });
        await Teach.Status(HttpStatusCode.NoContent, replaced,
            "The key existed this time, so it was replaced: 204.");

        var again = await client.PutAsJsonAsync("/i2/settings/theme", new { value = "light" });
        await Teach.Status(HttpStatusCode.NoContent, again,
            "And the identical request again is still a 204. That is idempotency: the end "
                + "state is what the client asked for, so it succeeded.");

        Teach.Equal("light", Settings(host).Get("theme"),
            "…and the stored value is the last one written.");

        var blank = await client.PutAsJsonAsync("/i2/settings/theme", new { value = "  " });
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank value is a 400.");
        Teach.Equal("value", await ErrorKeys(blank), "…keyed \"value\".");
        Teach.Equal("light", Settings(host).Get("theme"),
            "A rejected request must not have changed anything.");
    }

    [Fact]
    public async Task Ex4_OnlyAuditorsReadTheAuditLog()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/i2/audit/logs");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token: 401. A 200 here means the endpoint is still wide open - reread README "
                + "drill 4.");

        var ordinary = await client.SendAsync(Bearer("/i2/audit/logs", Token("ada", "user")));
        await Teach.Status(HttpStatusCode.Forbidden, ordinary,
            "A caller who proved who they are but lacks the role gets 403, not 401.");

        var auditor = await client.SendAsync(Bearer("/i2/audit/logs", Token("grace", "auditor")));
        await Teach.Status(HttpStatusCode.OK, auditor, "An auditor gets in.");
        var entries = await auditor.Content.ReadFromJsonAsync<List<AuditDto>>();
        Teach.Equal("user.created,order.shipped",
            string.Join(",", (entries ?? []).Select(e => e.Action)),
            "…and reads the log.");
    }

    [Fact]
    public async Task Ex5_OneMiddlewareHandlesEveryFailure()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        host.Logs.Clear();
        var missing = await client.GetAsync("/i2/guard/missing");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "DrillNotFoundException is a 404 - reread README drill 5.");
        Teach.True(ContentType(missing).Contains("application/problem+json"),
            $"Answer with ProblemDetails. Got: {ContentType(missing)}");
        Teach.Equal("no such drill", await Field(missing, "detail"),
            "That exception's message is about the caller's request, so it is safe to show.");
        Teach.Equal("Warning", FirstLevel(host),
            "A 404 is the caller's mistake, not an incident: Warning.\n" + host.Logs.Dump());

        host.Logs.Clear();
        var boom = await client.GetAsync("/i2/guard/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "Anything unplanned is a 500.");
        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("sk_live"),
            "The response is carrying the exception's message, which contains a secret.\n"
                + "  body: " + body);
        Teach.Equal("Error", FirstLevel(host),
            "…and this one is an incident: Error.\n" + host.Logs.Dump());

        var entry = host.Logs.FromApi.First();
        Teach.True(entry.Exception is InvalidOperationException,
            "Pass the exception to the logger, or the stack trace is gone.\n  " + entry);

        string correlation = Header(boom, "X-Correlation-Id");
        Teach.True(correlation.Length > 0,
            "Every response needs a correlation id, especially the failures.");
        Teach.Equal(correlation, await Field(boom, "correlationId"),
            "…and the problem document carries the same value as an extension member.");
        Teach.Equal(correlation, entry.Property("CorrelationId")?.ToString(),
            "…and so does the log entry, as a named property.\n  " + entry);

        var tagged = new HttpRequestMessage(HttpMethod.Get, "/i2/guard/boom");
        tagged.Headers.Add("X-Correlation-Id", "given-id");
        var echoed = await client.SendAsync(tagged);
        Teach.Equal("given-id", Header(echoed, "X-Correlation-Id"),
            "A client-supplied id is echoed, not replaced.");

        var fine = await client.GetAsync("/i2/guard/fine");
        await Teach.Status(HttpStatusCode.OK, fine,
            "A request that does not throw passes through untouched.");
    }

    [Fact]
    public async Task Ex6_TheOverviewBecomesOneQuery()
    {
        using var host = NewTracker();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/i2/tasks/overview");
        int commands = host.Commands.Count;

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /i2/tasks/overview must answer 200 - reread README drill 6.");

        var overview = await response.Content.ReadFromJsonAsync<List<OverviewDto>>() ?? [];
        Teach.Equal("1,2,3,4,5,6", string.Join(",", overview.Select(o => o.TaskId)),
            "One row per task, id ascending.");
        Teach.Equal("Dojo,Dojo,Compiler,Compiler,Compiler,Garden",
            string.Join(",", overview.Select(o => o.ProjectName)),
            "…each with the name of the project it belongs to.");

        Teach.True(commands == 1,
            $"{commands} SQL commands for six rows. Every task is one join away from its "
                + "project - say so in the projection and the database does it once.");
    }

    [Fact]
    public async Task Challenge_APagedPrivateResource()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/i2/challenge/notes");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "Both endpoints need an authenticated caller - reread README challenge.");

        var page1 = await client.SendAsync(Bearer("/i2/challenge/notes", Token("ada")));
        await Teach.Status(HttpStatusCode.OK, page1, "Ada's token gets Ada's notes.");
        Teach.Equal("1,2", await NoteIds(page1),
            "Ada owns notes 1, 2, 4 and 5. Page 1 of the default size 2 is 1 and 2 - note 3 "
                + "is Grace's and must never appear.");
        Teach.Equal("4", Header(page1, "X-Total-Count"),
            "The total is how many notes THIS caller has, not how many exist.");

        var page2 = await client.SendAsync(Bearer("/i2/challenge/notes?page=2", Token("ada")));
        Teach.Equal("4,5", await NoteIds(page2), "Page 2 is her other two.");

        var grace = await client.SendAsync(Bearer("/i2/challenge/notes", Token("grace")));
        Teach.Equal("3", await NoteIds(grace), "Grace sees exactly one note.");
        Teach.Equal("1", Header(grace, "X-Total-Count"), "…and her total is 1.");

        var badSize = await client.SendAsync(Bearer("/i2/challenge/notes?size=11", Token("ada")));
        await Teach.Status(HttpStatusCode.BadRequest, badSize, "The size cap is 10.");
        Teach.Equal("size", await ErrorKeys(badSize), "…keyed \"size\".");

        var created = await client.SendAsync(
            BearerPost("/i2/challenge/notes", Token("grace"), new { text = "zeta" }));
        await Teach.Status(HttpStatusCode.Created, created, "A successful create is 201.");
        Teach.Equal("/i2/challenge/notes/6", created.Headers.Location?.ToString(),
            "…with a Location. Five notes are seeded, so this is 6.");
        var note = await created.Content.ReadFromJsonAsync<NoteDto>();
        Teach.Equal("grace", note?.Owner,
            "The owner comes from the token. Nothing in the request body may decide it.");

        var blank = await client.SendAsync(
            BearerPost("/i2/challenge/notes", Token("grace"), new { text = " " }));
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank note is a 400.");
        Teach.Equal("text", await ErrorKeys(blank), "…keyed \"text\".");

        var afterwards = await client.SendAsync(Bearer("/i2/challenge/notes", Token("grace")));
        Teach.Equal("2", Header(afterwards, "X-Total-Count"),
            "…and Grace now has two notes.");
    }

    [Fact]
    public async Task Review1_AnIdempotencyKeyMakesTheRetrySafe()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var noKey = await client.PostAsJsonAsync("/i2/review/orders", new { item = "bokken" });
        await Teach.Status(HttpStatusCode.BadRequest, noKey,
            "Without an Idempotency-Key there is no way to make this safe to retry, so the "
                + "endpoint refuses - reread README review.");
        Teach.Equal("Idempotency-Key", await ErrorKeys(noKey),
            "…and the error names the missing header.");

        var first = await client.SendAsync(WithKey("k-1", new { item = "bokken" }));
        await Teach.Status(HttpStatusCode.Created, first,
            "A key never seen before really places the order: 201.");
        var firstOrder = await first.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal("/i2/review/orders/1", first.Headers.Location?.ToString(),
            "…with a Location naming it.");
        Teach.Equal("bokken", firstOrder?.Item, "…and the order that was placed.");

        var retry = await client.SendAsync(WithKey("k-1", new { item = "something else" }));
        await Teach.Status(HttpStatusCode.OK, retry,
            "The same key again is a replay, not a new order: 200 rather than 201, because "
                + "nothing was created this time.");
        var retried = await retry.Content.ReadFromJsonAsync<OrderDto>();
        Teach.Equal(firstOrder?.Id, retried?.Id,
            "…and it returns the ORIGINAL order. The retry's body is ignored: the key "
                + "identifies the operation, and the operation already happened.");
        Teach.Equal("bokken", retried?.Item,
            "…so the item is still the one from the first call.");

        Teach.Equal(1, Orders(host).Count,
            "One order exists, not two. That is the whole point.");

        var other = await client.SendAsync(WithKey("k-2", new { item = "obi" }));
        await Teach.Status(HttpStatusCode.Created, other,
            "A different key is a different operation.");
        Teach.Equal(2, Orders(host).Count, "…so now there are two orders.");

        var blank = await client.SendAsync(WithKey("k-3", new { item = "" }));
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank item is still a 400.");
        Teach.Equal("item", await ErrorKeys(blank), "…keyed \"item\".");
    }

    // … private helpers and DTO records, listed below …
}
```

…where the helpers are: a `SqliteHost<TrackerDb>` factory, a
`JsonWebTokenHandler`-based token factory for `I2Jwt.Scheme`, and small readers
for `X-Total-Count`, ProblemDetails `errors` keys, and log levels. Read the token
factory in particular — it is thirty lines, it is the answer to "how would you
test an authenticated endpoint", and you can paste the shape of it into any real
project.

## The teaching point

Notice how much of this is the *same five decisions*, over and over: what is the
status code, what does the client learn, what does the log learn, what does the
caller not get to choose, and how many round trips did it cost. Six different
prompts, five decisions each. That is what makes drills work — not the specific
endpoints, but the fact that after the sixth one you stop deriving those
decisions and start recognising them.

The other thing worth taking from the time-boxes: when one runs out, the useful
question is never "what is the answer" but "which part slowed me down". Almost
always it is one of validation plumbing, remembering the exact result helper, or
second-guessing a status code — and all three are fixable by repetition, which is
what `i3_interview_rapidfire` and the review scheduler are for.

Next: **i3_interview_rapidfire** — four short exercises on the ⭐⭐⭐ concepts,
all review-marked, so `dojo review` keeps bringing them back at 3, 7, 21 and 60
days.
