using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using DotnetDojo.Api.D21_AuthorizationPolicies;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Gates;

public class D21_AuthorizationPoliciesTests
{
    [Fact]
    public async Task Ex1_APolicyIsAListOfRequirements()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d21/roster"),
            "No token: 401 - reread README ex1.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/roster", Token("dee"))),
            "This is a perfectly valid token for somebody at head office, with no ward claim "
                + "at all. \"Authenticated\" was never the requirement - being ward staff is, "
                + "and a policy that only asks for a valid token asks nothing about the "
                + "caller.");

        var ok = await client.SendAsync(Get("/d21/roster", Token("ada", ward: "cardio")));
        await Teach.Status(HttpStatusCode.OK, ok, "Ada is on cardio, so she may read the roster.");
        Teach.Equal("1,2,3,4", await Ids(ok), "...all four shifts.");
    }

    [Fact]
    public async Task Ex2_ARequirementThatHasToLookAtTheRequest()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d21/roster/cardio"),
            "No token: 401 - reread README ex2.");

        var own = await client.SendAsync(Get("/d21/roster/cardio", Token("ada", ward: "cardio")));
        await Teach.Status(HttpStatusCode.OK, own, "Ada reading her own ward is fine.");
        Teach.Equal("1,2", await Ids(own), "...two shifts on cardio.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/roster/neuro", Token("ada", ward: "cardio"))),
            "Ada is on cardio and asked for neuro. The requirement is not about the caller "
                + "alone - it is about the caller AND the thing being asked for, which is why "
                + "it has to reach the route value. In an endpoint-routing app the "
                + "authorization context's Resource is the HttpContext.");

        var charge = await client.SendAsync(
            Get("/d21/roster/neuro", Token("zoe", role: "charge", ward: "cardio")));
        await Teach.Status(HttpStatusCode.OK, charge,
            "The charge nurse may read any ward, including one that is not her own - so the "
                + "rule is an OR, not a chain of separate requirements. Two RequireX calls "
                + "would have to BOTH hold.");
        Teach.Equal("3,4", await Ids(charge), "...the two neuro shifts.");
    }

    [Fact]
    public async Task Ex3_ARequirementAndTheHandlerThatDecidesIt()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d21/roster/locked"),
            "No token: 401 - reread README ex3.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/roster/locked", Token("ada", ward: "cardio", grade: 3))),
            "Grade 3 is not senior. As shipped the handler calls Succeed unconditionally, "
                + "which is the same as having no requirement at all - a handler that never "
                + "reads its requirement is a rubber stamp.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/roster/locked", Token("ada", ward: "cardio"))),
            "A caller with no grade claim at all is not senior either. D21Claims.GradeOf "
                + "returns 0 for that, so it needs no special case - which is the point of "
                + "reading the claim through one helper.");

        var senior = await client.SendAsync(
            Get("/d21/roster/locked", Token("ada", ward: "cardio", grade: 7)));
        await Teach.Status(HttpStatusCode.OK, senior, "Grade 7 clears a minimum of 5.");
        Teach.Equal("2", await Ids(senior), "...and shift 2 is the only locked one.");

        await Teach.Status(HttpStatusCode.OK,
            await client.SendAsync(Get("/d21/roster/locked", Token("ada", ward: "cardio", grade: 5))),
            "Exactly 5 is senior - the requirement is a MINIMUM, and off-by-one on it is the "
                + "reason to take the bound from requirement.Grade rather than hard-coding a "
                + "number in the handler.");
    }

    [Fact]
    public async Task Ex4_TwoHandlersAndOneRequirement()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d21/roster/leads"),
            "No token: 401 - reread README ex4.");

        var byGrade = await client.SendAsync(Get("/d21/roster/leads", Token("ada", grade: 9)));
        await Teach.Status(HttpStatusCode.OK, byGrade,
            "Grade 9 is a ward lead, and the given handler already says so.");
        Teach.Equal("cardio,neuro",
            string.Join(",", await byGrade.Content.ReadFromJsonAsync<List<string>>() ?? []),
            "...and sees both wards.");

        await Teach.Status(HttpStatusCode.OK,
            await client.SendAsync(Get("/d21/roster/leads", Token("zoe", role: "charge", grade: 2))),
            "The charge nurse is a ward lead too, at grade 2. A requirement is satisfied when "
                + "ANY handler for it succeeds - so the second way in is a second handler, "
                + "not an extra condition inside the first one. That is what lets a new rule "
                + "arrive without editing the code that implements the old one.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/roster/leads", Token("bo", grade: 2))),
            "Grade 2 and no role: neither handler succeeds, so the requirement is unmet. "
                + "Handlers that stay silent are not a refusal - they are simply not a "
                + "reason to allow it.");
    }

    [Fact]
    public async Task Ex5_TheDecisionNeedsTheThingBeingDecidedAbout()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PutAsJsonAsync("/d21/shifts/1/day", new { day = 2 }),
            "No token: 401 - reread README ex5.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Put("/d21/shifts/99/day", Token("ada", ward: "cardio"), new { day = 2 })),
            "There is no shift 99, and that is answered before any authorization runs - there "
                + "is no resource to authorize against.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Put("/d21/shifts/3/day", Token("ada", ward: "cardio"), new { day = 2 })),
            "Shift 3 is cy's. The endpoint policy could not have caught this: it ran before "
                + "the shift was loaded, and \"may this caller edit THIS shift\" is a question "
                + "about a resource. That is what IAuthorizationService.AuthorizeAsync(user, "
                + "resource, policy) is for.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Put("/d21/shifts/3/day", Token("ada", ward: "cardio"), new { day = 99 })),
            "...and the authorization check comes BEFORE the validation, so a caller with no "
                + "rights is not told which of their fields were malformed.");

        var invalid = await client.SendAsync(
            Put("/d21/shifts/1/day", Token("ada", ward: "cardio"), new { day = 9 }));
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "Her own shift, and day 9 does not exist.");
        Teach.True((await invalid.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("day") == true,
            "...keyed \"day\".");

        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Put("/d21/shifts/1/day", Token("ada", ward: "cardio"), new { day = 2 })),
            "Her own shift, a real day: 204.");
        Teach.Equal(2, host.Services.GetRequiredService<D21Roster>().Find(1)?.Day,
            "...and the day was written.");

        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Put("/d21/shifts/3/day",
                Token("zoe", role: "charge", ward: "cardio"), new { day = 2 })),
            "And the charge nurse may edit anybody's, on any ward.");
    }

    [Fact]
    public async Task Ex6_OnePolicyAndAWholeGroup()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d21/ops/summary"),
            "No token: 401 - reread README ex6.");
        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d21/ops/wards"),
            "...and the same for the other endpoint in the group. Applying a policy per "
                + "endpoint works until somebody adds a ninth one and forgets; applying it to "
                + "the group means the new endpoint is protected the moment it is written.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/ops/summary", Token("ada", ward: "cardio"))),
            "Ada is ward staff and not the charge nurse: 403.");
        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d21/ops/wards", Token("ada", ward: "cardio"))),
            "...on both.");

        var charge = Token("zoe", role: "charge", ward: "cardio");

        var summary = await client.SendAsync(Get("/d21/ops/summary", charge));
        await Teach.Status(HttpStatusCode.OK, summary, "The charge nurse gets in.");
        var body = await summary.Content.ReadFromJsonAsync<SummaryDto>();
        Teach.Equal(4, body?.Shifts, "Four shifts.");
        Teach.Equal(1, body?.Locked, "...one of them locked.");

        var wards = await client.SendAsync(Get("/d21/ops/wards", charge));
        await Teach.Status(HttpStatusCode.OK, wards, "...and to the other endpoint too.");
        Teach.Equal("cardio,neuro",
            string.Join(",", await wards.Content.ReadFromJsonAsync<List<string>>() ?? []),
            "...which still returns what it always did.");
    }

    [Fact]
    public async Task Ex7_AHandlerThatSaysNoAndMeansIt()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();
        var roster = host.Services.GetRequiredService<D21Roster>();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.DeleteAsync("/d21/shifts/1"),
            "No token: 401 - reread README ex7.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Delete("/d21/shifts/99", Token("ada", ward: "cardio"))),
            "No shift 99.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Delete("/d21/shifts/3", Token("ada", ward: "cardio"))),
            "Shift 3 is cy's, and ada is not the charge nurse: neither handler succeeds.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Delete("/d21/shifts/2", Token("zoe", role: "charge", ward: "cardio"))),
            "Shift 2 is LOCKED, and this is the charge nurse - whose handler has already "
                + "called Succeed on this very requirement. Staying silent is not enough to "
                + "stop her: a requirement is met when any handler succeeds. The lock handler "
                + "has to VETO, and a veto beats every success there has ever been.");
        Teach.True(roster.Find(2) is not null, "...and shift 2 is still there.");

        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Delete("/d21/shifts/1", Token("ada", ward: "cardio"))),
            "Her own shift, unlocked: 204.");
        Teach.True(roster.Find(1) is null, "...and it is gone.");

        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Delete("/d21/shifts/3", Token("zoe", role: "charge", ward: "cardio"))),
            "And the charge nurse may remove an unlocked shift that is not hers.");
        Teach.Equal(2, roster.All.Count, "Two shifts left.");
    }

    [Fact]
    public async Task Ex8_ThePolicyAndTheHandlerAgree()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PostAsJsonAsync("/d21/shifts", new { ward = "cardio", day = 2 }),
            "No token: 401 - reread README ex8.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Post("/d21/shifts", Token("ada", ward: "cardio", grade: 3),
                new { ward = "cardio", day = 2 })),
            "Ada is on a ward and is not senior: 403. Both halves of the policy have to hold, "
                + "so this one is an AND - unlike ex2, where the two ways in were an OR.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Post("/d21/shifts", Token("dee", grade: 7),
                new { ward = "cardio", day = 2 })),
            "...and dee is senior with no ward at all, which fails the other half.");

        var senior = Token("ada", ward: "cardio", grade: 7);

        var invalid = await client.SendAsync(Post("/d21/shifts", senior, new { ward = "neuro", day = 9 }));
        await Teach.Status(HttpStatusCode.BadRequest, invalid, "Day 9 does not exist.");
        Teach.True((await invalid.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("day") == true,
            "...keyed \"day\".");

        var made = await client.SendAsync(Post("/d21/shifts", senior, new { ward = "neuro", day = 2 }));
        await Teach.Status(HttpStatusCode.Created, made, "A senior ward member may create a shift.");
        Teach.Equal("/d21/shifts/5", made.Headers.Location?.ToString(), "...with a Location.");

        var shift = await made.Content.ReadFromJsonAsync<ShiftReadDto>();
        Teach.Equal(5, shift?.Id, "...and the new id.");
        Teach.Equal("ada", shift?.Doctor, "The doctor is the caller.");
        Teach.Equal("cardio", shift?.Ward,
            "...and the ward is the caller's WARD CLAIM. The body asked for neuro, which is "
                + "the same trap as an owner field: a caller does not get to place shifts on "
                + "a ward the token does not put them on.");
        Teach.Equal(2, shift?.Day, "...on day 2.");
        Teach.Equal(false, shift?.Locked, "...and a new shift is not locked.");
    }

    // ... private helpers and DTO records, listed below ...

    private static string Token(
        string subject,
        string? role = null,
        string? ward = null,
        int? grade = null)
    {
        var claims = new Dictionary<string, object> { ["sub"] = subject };
        if (role is not null)
        {
            claims["role"] = role;
        }

        if (ward is not null)
        {
            claims["ward"] = ward;
        }

        if (grade is not null)
        {
            claims["grade"] = grade.Value.ToString();
        }

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = D21Jwt.Issuer,
            Audience = D21Jwt.Audience,
            Claims = claims,
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(D21Jwt.SigningKey, SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    private static HttpRequestMessage Get(string path, string token) =>
        Authorized(new HttpRequestMessage(HttpMethod.Get, path), token);

    private static HttpRequestMessage Delete(string path, string token) =>
        Authorized(new HttpRequestMessage(HttpMethod.Delete, path), token);

    private static HttpRequestMessage Put(string path, string token, object body) =>
        Authorized(new HttpRequestMessage(HttpMethod.Put, path)
        {
            Content = JsonContent.Create(body),
        }, token);

    private static HttpRequestMessage Post(string path, string token, object body) =>
        Authorized(new HttpRequestMessage(HttpMethod.Post, path)
        {
            Content = JsonContent.Create(body),
        }, token);

    private static HttpRequestMessage Authorized(HttpRequestMessage message, string token)
    {
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return message;
    }

    private static async Task<string> Ids(HttpResponseMessage response) =>
        string.Join(",",
            (await response.Content.ReadFromJsonAsync<List<ShiftReadDto>>() ?? []).Select(s => s.Id));

    private sealed record ShiftReadDto(int Id, string? Ward, string? Doctor, int Day, bool Locked);

    private sealed record SummaryDto(int Shifts, int Locked);

    private sealed record ValidationDto(Dictionary<string, string[]>? Errors);
}
