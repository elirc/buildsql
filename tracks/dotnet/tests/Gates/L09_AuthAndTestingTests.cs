using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using DotnetDojo.Api.L09_AuthAndTesting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Gates;

public class L09_AuthAndTestingTests
{
    [Fact]
    public async Task Ex1_OnlyAValidTokenGetsIn()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/l09/whoami");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token at all must be 401. A 500 whose body mentions authorization metadata "
                + "means no authentication scheme is registered yet - reread README ex1.");

        var ok = await client.SendAsync(Get("/l09/whoami", Token("ada")));
        await Teach.Status(HttpStatusCode.OK, ok,
            "A valid bearer token must be accepted. Check the issuer, the audience and the "
                + "signing key against JwtSettings.");
        var body = await ok.Content.ReadFromJsonAsync<WhoAmIDto>();
        Teach.Equal("ada", body?.Name,
            "Report the caller's subject - the \"sub\" claim - not a hard-coded name.");

        var other = await client.SendAsync(Get("/l09/whoami", Token("grace")));
        var otherBody = await other.Content.ReadFromJsonAsync<WhoAmIDto>();
        Teach.Equal("grace", otherBody?.Name,
            "…so a different token gives a different answer.");

        var forged = await client.SendAsync(Get("/l09/whoami", Token("ada", key: "an-entirely-different-signing-key-of-sufficient-length")));
        await Teach.Status(HttpStatusCode.Unauthorized, forged,
            "That token is well formed and says sub=ada, but it was signed with the wrong "
                + "key. Accepting it would mean anyone can claim to be anyone: validate the "
                + "signature.");

        var expired = await client.SendAsync(
            Get("/l09/whoami", Token("ada", expires: DateTime.UtcNow.AddHours(-2))));
        await Teach.Status(HttpStatusCode.Unauthorized, expired,
            "That token expired two hours ago. A token with no expiry check is a password "
                + "that never changes.");

        var wrongIssuer = await client.SendAsync(Get("/l09/whoami", Token("ada", issuer: "somebody-else")));
        await Teach.Status(HttpStatusCode.Unauthorized, wrongIssuer,
            "The issuer is not the one this API trusts. Validate it, or you accept tokens "
                + "minted by any system that happens to share your signing key.");
    }

    [Fact]
    public async Task Ex2_AuthenticatedIsNotTheSameAsAllowed()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/l09/admin/reports");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token: 401. The server does not know who this is - reread README ex2.");

        var ordinary = await client.SendAsync(Get("/l09/admin/reports", Token("ada", role: "user")));
        await Teach.Status(HttpStatusCode.Forbidden, ordinary,
            "This caller proved who they are and is not an admin, so the answer is 403, not "
                + "401. 401 would tell them to authenticate, which they already did.");

        var admin = await client.SendAsync(Get("/l09/admin/reports", Token("grace", role: "admin")));
        await Teach.Status(HttpStatusCode.OK, admin,
            "An admin token gets through.");
        var body = await admin.Content.ReadFromJsonAsync<ReportDto>();
        Teach.Equal("Quarterly numbers", body?.Title, "…to the real report.");
    }

    [Fact]
    public async Task Ex3_YouOnlySeeYourOwnNotes()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/l09/notes");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token: 401 - reread README ex3.");

        var ada = await client.SendAsync(Get("/l09/notes", Token("ada")));
        await Teach.Status(HttpStatusCode.OK, ada, "Ada's token gets Ada's notes.");
        Teach.Equal("1,3", await Ids(ada),
            "Notes 1 and 3 are Ada's, id ascending. Getting 1,2,3 means you returned the "
                + "whole store - the most common data-exposure bug there is, and it passes "
                + "every test that only checks the status code.");

        var grace = await client.SendAsync(Get("/l09/notes", Token("grace")));
        Teach.Equal("2", await Ids(grace),
            "Grace owns exactly one note. The filter comes from the token, not from a query "
                + "parameter the client could change.");

        var nobody = await client.SendAsync(Get("/l09/notes", Token("linus")));
        Teach.Equal("", await Ids(nobody),
            "A caller with no notes gets an empty list and a 200 - they exist, they just "
                + "have nothing.");
    }

    [Fact]
    public async Task Ex4_TheOwnerComesFromTheTokenAndNotTheBody()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.PostAsJsonAsync("/l09/notes", new { text = "sneaky" });
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token: 401 - reread README ex4.");

        var created = await client.SendAsync(
            Post("/l09/notes", Token("ada"), new { text = "sharpen the bokken" }));
        await Teach.Status(HttpStatusCode.Created, created,
            "A successful create is 201.");
        Teach.Equal("/l09/notes/4", created.Headers.Location?.ToString(),
            "…with a Location header naming the new note. Three notes are seeded, so this "
                + "one is 4.");

        var note = await created.Content.ReadFromJsonAsync<NoteDto>();
        Teach.Equal("ada", note?.Owner, "The note belongs to the caller.");
        Teach.Equal("sharpen the bokken", note?.Text, "…with the text they sent.");

        var stolen = await client.SendAsync(
            Post("/l09/notes", Token("ada"), new { text = "not mine", owner = "grace" }));
        var stolenNote = await stolen.Content.ReadFromJsonAsync<NoteDto>();
        Teach.Equal("ada", stolenNote?.Owner,
            "The request body said owner=grace and the token said ada. The token wins, "
                + "always. Trusting an owner, a user id or a role from the request body is "
                + "how one account writes into another - the body is attacker-controlled and "
                + "the token is signed.");

        var blank = await client.SendAsync(Post("/l09/notes", Token("ada"), new { text = "   " }));
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A blank note is a 400, and authentication does not exempt anyone from "
                + "validation.");

        var mine = await client.SendAsync(Get("/l09/notes", Token("ada")));
        Teach.Equal("1,3,4,5", await Ids(mine),
            "…and everything Ada created shows up in Ada's list. Note 5 is the one whose "
                + "body tried to claim Grace as its owner.");
    }

    [Fact]
    public async Task Challenge_OwnershipAdminOverrideAndNoInformationLeak()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.PutAsJsonAsync("/l09/notes/1", new { text = "hello" });
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No token: 401 - reread README challenge.");

        var owner = await client.SendAsync(Put("/l09/notes/1", Token("ada"), new { text = "ship it twice" }));
        await Teach.Status(HttpStatusCode.NoContent, owner,
            "Ada owns note 1, so replacing it is a 204.");
        Teach.Equal("ship it twice", Note(host, 1)?.Text,
            "…and the text really changed in the store.");

        var stranger = await client.SendAsync(Put("/l09/notes/2", Token("ada"), new { text = "not yours" }));
        await Teach.Status(HttpStatusCode.NotFound, stranger,
            "Note 2 is Grace's. Answering 403 would confirm to Ada that note 2 exists, which "
                + "is information she is not entitled to - so an ordinary caller gets exactly "
                + "the same answer as for an id that was never used.");

        var missing = await client.SendAsync(Put("/l09/notes/99", Token("ada"), new { text = "ghost" }));
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "…and this is that answer. The two must be indistinguishable.");

        var admin = await client.SendAsync(
            Put("/l09/notes/2", Token("linus", role: "admin"), new { text = "moderated" }));
        await Teach.Status(HttpStatusCode.NoContent, admin,
            "An admin may edit anyone's note, even one they do not own.");

        var blank = await client.SendAsync(Put("/l09/notes/1", Token("ada"), new { text = "" }));
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "An empty text is a 400 - and it is checked before anything else, because a "
                + "malformed request is malformed whoever sent it.");
    }

    /// <summary>Reads a note out of the store directly, to check what an endpoint really wrote.</summary>
    private static Note? Note(DojoWebFactory host, int id) =>
        host.Services.GetRequiredService<INoteStore>().Find(id);

    // -- issuing tokens the way an identity provider would --------------------

    private static string Token(
        string subject,
        string? role = null,
        DateTime? expires = null,
        string? key = null,
        string? issuer = null)
    {
        var claims = new Dictionary<string, object> { ["sub"] = subject };
        if (role is not null)
        {
            claims["role"] = role;
        }

        var signingKey = key is null
            ? JwtSettings.SigningKey
            : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = issuer ?? JwtSettings.Issuer,
            Audience = JwtSettings.Audience,
            Claims = claims,
            Expires = expires ?? DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    private static HttpRequestMessage Get(string path, string token) =>
        Authorized(new HttpRequestMessage(HttpMethod.Get, path), token);

    private static HttpRequestMessage Post(string path, string token, object body) =>
        Authorized(new HttpRequestMessage(HttpMethod.Post, path)
        {
            Content = JsonContent.Create(body),
        }, token);

    private static HttpRequestMessage Put(string path, string token, object body) =>
        Authorized(new HttpRequestMessage(HttpMethod.Put, path)
        {
            Content = JsonContent.Create(body),
        }, token);

    private static HttpRequestMessage Authorized(HttpRequestMessage message, string token)
    {
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return message;
    }

    private static async Task<string> Ids(HttpResponseMessage response)
    {
        var notes = await response.Content.ReadFromJsonAsync<List<NoteDto>>();
        return string.Join(",", (notes ?? []).Select(n => n.Id));
    }

    private sealed record WhoAmIDto(string? Name);

    private sealed record ReportDto(string? Title);

    private sealed record NoteDto(int Id, string? Owner, string? Text);
}
