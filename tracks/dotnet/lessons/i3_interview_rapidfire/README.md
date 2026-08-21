# i3 — Rapid fire

Four short exercises and a review, on the five ⭐⭐⭐ concepts from the question
bank. Every one of them should take under ten minutes; if one takes twenty, that
is the topic to go back to.

The point of this lesson is not to teach you anything new. It is to be
**scheduled**. Every exercise here, and the review, is review-marked, so once you
have finished them `dojo review` brings them back at 3, 7, 21 and 60 days —
which is the interval structure that turns "I understood that in July" into "I
can say that in an interview in October". These are the answers you want
automatic.

Run them cold. No reading, no hints, no scrolling back. If you cannot do one from
memory, that is the signal.

```
uv run dojo review          # what is due today, across every track
uv run dojo review run      # work through it
```

## Exercise 1 — lifetimes

Edit `src/Api/I3_InterviewRapidfire/Ex1.cs`. Three interfaces, three lifetimes,
one each. The endpoint is written for you; only the registrations are wrong.

`GET /i3/lifetimes` resolves each service twice in one request and reports the
values. Make it so that:

- `app` is the same across two separate requests
- `request1` and `request2` are equal within a request, and differ between them
- `call1` and `call2` differ within a single request

The names tell you which lifetime each one wants.

```
uv run dojo test dotnet i3_interview_rapidfire ex1
```

## Exercise 2 — order

Edit `src/Api/I3_InterviewRapidfire/Ex2.cs`, method `Configure`. Both
middlewares are given. `RefuseMiddleware` answers **403** for a path ending
`/nope` and does not call `next`; `SeenMiddleware` adds `X-Seen: yes`.

Right now the rejected response has no `X-Seen` header. Fix it, without editing
either middleware.

```
uv run dojo test dotnet i3_interview_rapidfire ex2
```

## Exercise 3 — tracking

Edit `src/Api/I3_InterviewRapidfire/Ex3.cs`. Implement
`POST /i3/tasks/{id}/complete?tracked=true|false`: load the task — tracked or
with `AsNoTracking()` according to the flag — set `Done` to `true`, save, and
answer **200** with `{"changes": …, "done": …}`, or **404** for an unknown id.

With `tracked=false`: `done` is `true` and `changes` is **0**, and the row does
not change. That silence is the whole exercise.

```
uv run dojo test dotnet i3_interview_rapidfire ex3
```

## Exercise 4 — status codes

Edit `src/Api/I3_InterviewRapidfire/Ex4.cs`. Six answers across two handlers,
and no logic worth the name:

- `POST /i3/codes` with a blank value → **400**
- `POST /i3/codes` with a value already in the store → **409**
- otherwise → **201** with `Location: /i3/codes/{id}` and the created code
- `DELETE /i3/codes/{id}` that was there → **204** with no body
- the same `DELETE` again → **404**

If you have to stop and think about 400 versus 409, reread the answer to
question 34 in `i1_interview_concepts`.

```
uv run dojo test dotnet i3_interview_rapidfire ex4
```

## Review

`review1` is the one the scheduler leans on hardest, and it is the 401/403 pair.
Edit `src/Api/I3_InterviewRapidfire/Review1.cs`: add a policy named
`Review1Services.MembersOnly` that authenticates on `I2Jwt.Scheme` and requires
the `member` role, and apply it to `GET /i3/review/secret`.

- no token → **401**
- a token whose role is `guest` → **403**
- a token whose role is `member` → **200**

## The gate

This is the entire gate class, `tests/Gates/I3_InterviewRapidfireTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using DotnetDojo.Api.I1_InterviewConcepts;
using DotnetDojo.Api.I2_InterviewDrills;
using DotnetDojo.Api.I3_InterviewRapidfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Gates;

public class I3_InterviewRapidfireTests
{
    [Fact]
    public async Task Ex1_ThreeLifetimesInOneRequest()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/i3/lifetimes");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /i3/lifetimes must answer 200 - reread README ex1.");

        var a = await first.Content.ReadFromJsonAsync<LifetimeDto>();
        var b = await (await client.GetAsync("/i3/lifetimes")).Content.ReadFromJsonAsync<LifetimeDto>();

        Teach.Equal(a!.App, b!.App,
            "IAppWide is one object for the whole application, so both requests see the same "
                + "value. That is a singleton.");

        Teach.Equal(a.Request1, a.Request2,
            "IPerRequest was resolved twice in ONE request and gave two different objects. "
                + "One instance per request is scoped.");
        Teach.True(a.Request1 != b.Request1,
            "…and two different requests must get two different ones, or it is a singleton.");

        Teach.True(a.Call1 != a.Call2,
            "IPerCall was resolved twice in one request and gave the same object. A new one "
                + "every time anyone asks is transient.");
    }

    [Fact]
    public async Task Ex2_TheOutermostMiddlewareStillRuns()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var refused = await client.GetAsync("/i3/order/nope");
        await Teach.Status(HttpStatusCode.Forbidden, refused,
            "The given middleware refuses this path with 403 - reread README ex2.");
        Teach.Equal("yes", Header(refused, "X-Seen"),
            "The rejected response has no X-Seen header, because the middleware that adds it "
                + "sits downstream of the one that short-circuits. Anything that must touch "
                + "every response has to be added first.");

        var allowed = await client.GetAsync("/i3/order/fine");
        await Teach.Status(HttpStatusCode.OK, allowed, "Any other path gets through.");
        Teach.Equal("ok", await allowed.Content.ReadAsStringAsync(),
            "…all the way to the terminal handler.");
        Teach.Equal("yes", Header(allowed, "X-Seen"), "…and it is stamped too.");
    }

    [Fact]
    public async Task Ex3_NoTrackingSavesNothing()
    {
        using var host = NewTracker();
        using var client = host.CreateClient();

        var untracked = await client.PostAsync("/i3/tasks/1/complete?tracked=false", null);
        await Teach.Status(HttpStatusCode.OK, untracked,
            "POST /i3/tasks/1/complete?tracked=false must answer 200 - reread README ex3.");

        var untrackedBody = await untracked.Content.ReadFromJsonAsync<CompleteDto>();
        Teach.Equal(true, untrackedBody?.Done,
            "The object in memory really was changed - assigning to a property always works.");
        Teach.Equal(0, untrackedBody?.Changes,
            "An AsNoTracking entity is not in the change tracker, so SaveChangesAsync sees "
                + "nothing to write and returns 0.");
        Teach.Equal(false, host.Query(db => db.Tasks.Single(t => t.Id == 1).Done),
            "…and the row is untouched. No exception, no warning, no update.");

        var tracked = await client.PostAsync("/i3/tasks/2/complete?tracked=true", null);
        var trackedBody = await tracked.Content.ReadFromJsonAsync<CompleteDto>();
        Teach.Equal(1, trackedBody?.Changes,
            "A tracked entity you changed produces exactly one write.");
        Teach.Equal(true, host.Query(db => db.Tasks.Single(t => t.Id == 2).Done),
            "…and this time the row really changed.");

        var missing = await client.PostAsync("/i3/tasks/99/complete?tracked=true", null);
        await Teach.Status(HttpStatusCode.NotFound, missing, "There is no task 99: 404.");
    }

    [Fact]
    public async Task Ex4_SixCodesAndOnlyOneIsRight()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/i3/codes", new { value = "beta" });
        await Teach.Status(HttpStatusCode.Created, created,
            "Creating a resource is 201 - reread README ex4.");
        Teach.Equal("/i3/codes/2", created.Headers.Location?.ToString(),
            "…with a Location. One code is seeded, so the new one is 2.");

        var blank = await client.PostAsJsonAsync("/i3/codes", new { value = "  " });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A blank value is malformed input: 400.");

        var duplicate = await client.PostAsJsonAsync("/i3/codes", new { value = "alpha" });
        await Teach.Status(HttpStatusCode.Conflict, duplicate,
            "\"alpha\" is already there. The request is well formed and the current state "
                + "forbids it, which is 409 - not 400.");

        Teach.Equal(2, host.Services.GetRequiredService<ICodeStore>().Count,
            "The two rejected requests must not have added anything.");

        var deleted = await client.DeleteAsync("/i3/codes/1");
        await Teach.Status(HttpStatusCode.NoContent, deleted,
            "A successful delete is 204 with no body.");
        Teach.Equal("", await deleted.Content.ReadAsStringAsync(), "…no body at all.");

        var again = await client.DeleteAsync("/i3/codes/1");
        await Teach.Status(HttpStatusCode.NotFound, again,
            "The second delete finds nothing at that URL: 404.");
    }

    [Fact]
    public async Task Review1_UnauthenticatedIsNotUnauthorized()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/i3/review/secret");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token: 401. A 200 here means the endpoint is still open - reread README "
                + "review.");

        var ordinary = await client.SendAsync(Bearer("/i3/review/secret", Token("ada", "guest")));
        await Teach.Status(HttpStatusCode.Forbidden, ordinary,
            "This caller proved who they are and lacks the role: 403. Sending 401 would tell "
                + "them to authenticate, which they already did.");

        var member = await client.SendAsync(Bearer("/i3/review/secret", Token("ada", "member")));
        await Teach.Status(HttpStatusCode.OK, member, "A member gets in.");
        var body = await member.Content.ReadFromJsonAsync<SecretDto>();
        Teach.Equal("the dojo is closed", body?.Value, "…and reads the secret.");
    }

    // … a SqliteHost<TrackerDb> factory, a token factory for I2Jwt.Scheme,
    //   a header reader, and three DTO records …
}
```

In plain English: five tests, one per ⭐⭐⭐ concept, each of them making the
smallest number of requests that can tell the right answer from the plausible
one. That is deliberately the same standard the rest of the track uses — a gate
that can only be passed by understanding, not by pattern-matching.

## The teaching point

Fluency is not the same as understanding, and interviews sample fluency. The
concepts in this lesson are ones you have already understood — twice, in some
cases — and the reason to do them again cold, and then again in three days, and
then in three weeks, is that recall decays on a schedule and the fix is to
practise on the same schedule.

That is the whole design of this part of the course. `i1` gives you the language,
`i2` gives you the reps, and `i3` gets scheduled. Let the ladder do the work:

```
uv run dojo review
```

That is the end of the ASP.NET Core track. You have built, in ten lessons: an
API with real routing and result types, a container you understand the lifetimes
of, a pipeline you can order from first principles, configuration that differs
per environment, a data layer whose SQL you can predict, a REST resource that
tells the truth in six status codes, failures that teach the operator without
leaking to the client, and an authorization model with a test to prove it. That
is a mid-level .NET backend engineer's working vocabulary — not the whole
language of it, but every word you need to hold a conversation.
