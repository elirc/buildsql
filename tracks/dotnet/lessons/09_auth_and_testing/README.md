# 09 — Authentication, authorization, and testing them

Everything you have built so far has been open to the world. This lesson closes
it, and it is the capstone: routing, DI, middleware, configuration, EF Core, REST
semantics and ProblemDetails all show up again, now with a caller attached.

Two words that sound alike and mean different things, and this lesson is mostly
about keeping them apart:

- **Authentication** — *who is calling?* A bearer token arrives, the server
  verifies its signature and expiry, and produces a `ClaimsPrincipal`. Failure is
  **401 Unauthorized**, which is badly named: it means "I do not know who you
  are, authenticate and try again".
- **Authorization** — *may this caller do this?* Failure is **403 Forbidden**: "I
  know exactly who you are, and no".

If you send a 401 to someone who is already logged in, you are telling them to do
something that cannot help. If you send a 403 to an anonymous caller, you are
telling them logging in would not help, which is usually false. Interviewers ask
this; the exercises grade it.

Read `src/Api/L09_AuthAndTesting/Notes.cs` first — it is given code, and it holds
the note store plus the signing key the gate's tokens are made with.

## Concept — a JWT, and the two middlewares that read it

A **JSON Web Token** is three base64url chunks separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiJhZGEiLCJleHAiOjE3...} . 4pLzGm-vTn...
└──────── header ────────┘             └──────────── payload ────────┘   └── signature ──┘
```

The header names the algorithm. The payload is the **claims** — `sub` (who),
`exp` (until when), `iss` (who issued it), `aud` (who it is for), plus anything
else, such as `role`. The signature is an HMAC or an RSA signature over the first
two parts.

Three things follow, and all three are exam questions:

- **A JWT is signed, not encrypted.** Anyone holding one can read every claim in
  it — paste one into jwt.io and see. Never put anything secret in a token.
- **The signature is the whole security model.** It proves the payload has not
  been altered since the issuer made it. Skip `ValidateIssuerSigningKey` and any
  caller can mint a token saying `"role": "admin"`.
- **Validation is stateless.** The server needs no session store and no database
  lookup; it checks a signature and some dates. That is why JWTs scale — and why
  you cannot revoke one before it expires, which is why access tokens are
  short-lived and paired with a refresh token.

Registering the scheme looks like this:

```csharp
services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;         // keep the claim names as written
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,            ValidIssuer = JwtSettings.Issuer,
            ValidateAudience = true,          ValidAudience = JwtSettings.Audience,
            ValidateIssuerSigningKey = true,  IssuerSigningKey = JwtSettings.SigningKey,
            ValidateLifetime = true,
            NameClaimType = "sub",
            RoleClaimType = "role",
        };
    });

services.AddAuthorization();
```

Every `Validate…` there is a real attack it stops. No issuer check and you
accept tokens from any system sharing your key; no audience check and a token
minted for a different service of yours works here; no lifetime check and a
stolen token is valid forever.

`NameClaimType` and `RoleClaimType` tell ASP.NET Core which claims to treat as
the caller's name and roles, which is what makes `user.Identity!.Name` and
`user.IsInRole("admin")` work.

You never touch `Program.cs` for any of this: `WebApplication` adds
`UseAuthentication()` and `UseAuthorization()` to the pipeline automatically when
it sees those services registered, in the right order, before your endpoints.

### Requiring it

`.RequireAuthorization()` on an endpoint (or a whole `MapGroup`) means "any
authenticated caller". `.RequireAuthorization("policy-name")` means a **policy**,
registered up front:

```csharp
services.AddAuthorizationBuilder()
    .AddPolicy("admin-only", policy => policy.RequireRole("admin"));
```

Policies are the extension point: `RequireRole`, `RequireClaim`,
`RequireAssertion(ctx => …)`, or a full `IAuthorizationRequirement` with a
handler. Naming the policy rather than repeating a role string across twenty
endpoints is what lets "who may see reports" change in one place.

### Testing it

There is no login page here and no identity provider. The gate **issues its own
tokens** with the same key the application validates against, which is exactly
how you would test a real API: a helper that mints a token for a given user and
role, and every test asking a question in the form "as this person, what
happens?".

## Exercise 1 — who is calling?

Edit `src/Api/L09_AuthAndTesting/Ex1.cs`. Register JWT bearer authentication and
authorization in `Ex1Services`, then implement `WhoAmI` so that
`GET /l09/whoami` answers **200** with `{"name": "<the sub claim>"}`.

The endpoint is already marked `.RequireAuthorization()`. Until you register a
scheme it answers **500**, not 401 — asking for authorization when nothing in the
application can authorize is a configuration error, not a rejected request. That
first failure is worth reading.

The gate then tries four bad tokens: none at all, one signed with a different
key, one that expired two hours ago, and one from the wrong issuer. All four must
be **401**. Each corresponds to one `Validate…` flag.

```
uv run dojo test dotnet 09_auth_and_testing ex1
```

## Exercise 2 — 401 is not 403

Edit `src/Api/L09_AuthAndTesting/Ex2.cs`. Add an authorization policy named
`Ex2Services.AdminOnly` requiring the `admin` role, and apply it to
`GET /l09/admin/reports`.

- no token → **401**
- a valid token whose role is `user` → **403**
- a valid token whose role is `admin` → **200** with the report

You write neither status code. Both come from the framework: the authentication
handler *challenges* (401) when there is no identity, and the authorization
middleware *forbids* (403) when there is one and it fails the policy. Getting the
pair right is a matter of letting the right mechanism handle each case rather
than writing `if`s in your handler.

```
uv run dojo test dotnet 09_auth_and_testing ex2
```

## Exercise 3 — the token decides what you can see

Edit `src/Api/L09_AuthAndTesting/Ex3.cs`. Implement `GET /l09/notes` to answer
**200** with the caller's own notes, id ascending — and nobody else's.

The filter comes from `user.Identity!.Name`, which is the `sub` claim, and *not*
from a query parameter. Three notes are seeded: 1 and 3 are Ada's, 2 is Grace's.
Ada must see `1,3`; Grace must see `2`; a caller with no notes gets `200` and an
empty list.

Returning the whole store here would pass any test that only checks the status
code, and is the most common data-exposure bug there is. Filtering on an
identifier the *client* supplies is the same bug wearing a disguise: the client
can change it.

```
uv run dojo test dotnet 09_auth_and_testing ex3
```

## Exercise 4 — the client does not choose the owner

Edit `src/Api/L09_AuthAndTesting/Ex4.cs`. Implement `POST /l09/notes`:

- blank text → **400** (authentication does not exempt anyone from validation)
- otherwise → **201** with a `Location` of `/l09/notes/{new id}` and the created
  note as the body

`NewNote` has an `Owner` property, and it is a trap. The gate posts as Ada with
`{"text":"not mine","owner":"grace"}` and checks that the created note belongs to
**ada**. The request body is attacker-controlled; the token is signed. Any field
that says who you are, what you may do, or what you are worth must come from the
token, never from the payload.

```
uv run dojo test dotnet 09_auth_and_testing ex4
```

## Challenge — ownership, admin override, and no information leak

Honest difficulty note: five outcomes, and the interesting one is a 404 where
your instinct says 403.

Edit `src/Api/L09_AuthAndTesting/Challenge.cs`. Implement
`PUT /l09/notes/{id}`:

| situation | answer |
|---|---|
| no token | **401** |
| blank text | **400** |
| no such note | **404** |
| someone else's note, ordinary caller | **404** |
| the caller's own note | **204** |
| someone else's note, `admin` role | **204** |

Rows three and four are the exercise. Answering 403 for a note you do not own
*confirms that the note exists*, so an attacker can walk the id space and map
your data without ever reading a byte of it. When the existence of a resource is
itself privileged information, "you may not" and "there is nothing here" have to
look identical. (When it is not privileged — a public document you cannot edit —
403 is friendlier and correct. Knowing which case you are in is the skill.)

Note also that the 400 comes first: a malformed request is malformed whoever sent
it, and checking it before you look anything up keeps the logic honest.

```
uv run dojo test dotnet 09_auth_and_testing challenge
```

## The gate

This is the entire gate class, `tests/Gates/L09_AuthAndTestingTests.cs`:

```csharp
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
```

In plain English: the bottom third of that file is a token factory, and it is the
part worth stealing. `Token("ada", role: "admin")` mints a signed JWT with the
same key the application trusts, which turns "test an authenticated endpoint"
from a problem into a one-liner. Every test then reads as a sentence: *as this
person, doing this, what happens?* — which is exactly how you should think about
an authorization rule in the first place.

## The teaching point

You have now written the four questions every protected endpoint has to answer,
in order: **is the request well formed** (400), **do I know who this is** (401),
**may they do this** (403), and **does the thing exist** (404 — sometimes standing
in for 403 on purpose).

The rule underneath all of them is the one from ex4, and it is the single most
useful security habit on this stack: **trust the token, never the payload.**
Identity, roles, ownership and entitlements come from a signed credential the
caller cannot forge. Anything the client sends in a body or a query string is a
*request*, not a fact — including, especially, the parts that look like facts.

And you now know how to prove any of it, because the gate you just read is not a
teaching device. Minting your own tokens against a `WebApplicationFactory` is how
authorization gets tested in real .NET codebases, and an authorization rule
without a test is an authorization rule nobody has ever verified.

That is the end of the taught curriculum. Next comes **Part 4 — Interview prep**:
`i1_interview_concepts` (a fifty-question bank you can rehearse out loud),
`i2_interview_drills` (the hands-on tasks interviewers actually set), and
`i3_interview_rapidfire`, which the spaced-review scheduler will keep bringing
back until the ⭐⭐⭐ answers are automatic.
