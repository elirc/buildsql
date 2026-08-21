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

    private static SqliteHost<TrackerDb> NewTracker() =>
        new SqliteHost<TrackerDb>().Seed(db =>
        {
            db.Projects.Add(new Project { Id = 1, Name = "Dojo" });
            db.Tasks.AddRange(
                new TaskItem { Id = 1, ProjectId = 1, Title = "sweep", Done = false },
                new TaskItem { Id = 2, ProjectId = 1, Title = "bow", Done = false });
        });

    private static string Token(string subject, string role)
    {
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = I2Jwt.Issuer,
            Audience = I2Jwt.Audience,
            Claims = new Dictionary<string, object> { ["sub"] = subject, ["role"] = role },
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(I2Jwt.SigningKey, SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    private static HttpRequestMessage Bearer(string path, string token)
    {
        var message = new HttpRequestMessage(HttpMethod.Get, path);
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return message;
    }

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private sealed record LifetimeDto(Guid App, Guid Request1, Guid Request2, Guid Call1, Guid Call2);

    private sealed record CompleteDto(int Changes, bool Done);

    private sealed record SecretDto(string? Value);
}
