# d20 - JWT and identity drills

Eight problems on what a bearer token proves and what it does not: the four
validation checks a token has to survive, 401 against 403, ownership from the
token and never from the body, a 404 that refuses to admit a resource exists,
scopes as whole words, and authentication that is optional. They drill lesson
**09_auth_and_testing** - go back to it if "the user is logged in" still sounds
like a complete answer.

The domain is an engineering vault (`src/Api/D20_AuthJwt/Model.cs`): four
entries owned by `ada`, `bo` and `cy`, a `keeper` role that may see everything,
and the scopes `entries:read` and `entries:write`. Two authentication schemes
live here: **`d20-bearer`** is given and correct, and every exercise from ex2
onwards uses it; **`d20-strict`** is registered by ex1, badly, and fixing it is
ex1. Everything is under `/d20/...` and each exercise owns one file.

## Exercise 1 - a token you did not check is a claim you believed

Edit `src/Api/D20_AuthJwt/Ex1.cs`, `Ex1Services` only. As shipped, the
`d20-strict` scheme accepts any bearer token whose payload parses. Fix its
`TokenValidationParameters` so `GET /d20/strict/whoami` answers 200 with the
caller's subject for a good token, and **401** for one that is:

- signed with a different key
- expired
- from a different issuer
- for a different audience

```
uv run dojo test dotnet d20_auth_jwt ex1
```

## Exercise 2 - 401 says who, 403 says what

Edit `src/Api/D20_AuthJwt/Ex2.cs`. `GET /d20/vault` returns every entry, id
ascending - but only for a **keeper**:

- no token - 401
- a valid token that is not a keeper - **403**
- a keeper - 200

```
uv run dojo test dotnet d20_auth_jwt ex2
```

## Exercise 3 - the client does not get to choose the owner

Edit `src/Api/D20_AuthJwt/Ex3.cs`. `POST /d20/entries` takes a `NewEntry`:

- blank title - 400 validation problem keyed `"title"`
- otherwise 201 with `Location: /d20/entries/{newId}` and the created
  `EntryDto`, owned by **whoever the token says is calling**

`NewEntry.Owner` is a trap.

```
uv run dojo test dotnet d20_auth_jwt ex3
```

## Exercise 4 - not yours, and you may not know it exists

Edit `src/Api/D20_AuthJwt/Ex4.cs`. `GET /d20/entries/{id}` answers 200 with the
`EntryDto` when the caller owns it or is a keeper - and **404** both when there
is no such entry and when it belongs to somebody else.

```
uv run dojo test dotnet d20_auth_jwt ex4
```

## Exercise 5 - a scope is a whole word

Edit `src/Api/D20_AuthJwt/Ex5.cs`. `POST /d20/entries/{id}/publish`:

- the `scope` claim does not contain `D20Scopes.Write` - **403**, checked
  before anything is looked up
- no such entry, or somebody else's and the caller is not a keeper - 404
- otherwise 204, with `Published` set

`D20Scopes.Has` is given. Use it - `"entries:writer"` must not pass.

```
uv run dojo test dotnet d20_auth_jwt ex5
```

## Exercise 6 - anonymous is allowed, and gets less

Edit `src/Api/D20_AuthJwt/Ex6.cs`. `GET /d20/entries/{id}/preview` is open to
everyone:

- no such entry - 404
- otherwise 200 with a `PreviewDto` carrying the title always, and the **body**
  only when the request presents a valid `d20-bearer` token whose subject owns
  the entry, or who is a keeper
- no token, a forged token, or somebody else's token - 200 with a null body,
  never a 401

```
uv run dojo test dotnet d20_auth_jwt ex6
```

## Exercise 7 - the same endpoint, two different worlds

Edit `src/Api/D20_AuthJwt/Ex7.cs`. `GET /d20/reports`:

- the `scope` claim does not contain `D20Scopes.Read` - 403
- otherwise 200 with `EntryDto`s, id ascending: every entry for a keeper, only
  the caller's own for anybody else
- and the response carries `X-Result-Scope: all` or `X-Result-Scope: own`

```
uv run dojo test dotnet d20_auth_jwt ex7
```

## Exercise 8 - every rule in this set, on one write

Edit `src/Api/D20_AuthJwt/Ex8.cs`. `PUT /d20/entries/{id}`, in this order:

1. no valid token - 401 (the policy does this)
2. no `D20Scopes.Write` in the scope claim - **403**
3. no such entry, or somebody else's and the caller is not a keeper - **404**
4. blank title - **400** validation problem keyed `"title"`
5. otherwise **204**, with the title and body written and the **owner
   unchanged**, whatever the body says

```
uv run dojo test dotnet d20_auth_jwt ex8
```

## The gate

This is the entire gate class, `tests/Gates/D20_AuthJwtTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using DotnetDojo.Api.D20_AuthJwt;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DotnetDojo.Gates;

public class D20_AuthJwtTests
{
    [Fact]
    public async Task Ex1_ATokenYouDidNotCheckIsAClaimYouBelieved()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d20/strict/whoami"),
            "No token at all is a 401 - reread README ex1.");

        var ok = await client.SendAsync(Get("/d20/strict/whoami", Token("ada")));
        await Teach.Status(HttpStatusCode.OK, ok,
            "A token issued by dojo-d20, for dojo-d20-clients, signed with the right key and "
                + "still in date must be accepted. Turning every check ON is not the same as "
                + "turning them on with the right VALUES.");
        Teach.Equal("ada", (await ok.Content.ReadFromJsonAsync<WhoAmIDto>())?.Name,
            "...and the answer is the token's subject.");

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.SendAsync(Get("/d20/strict/whoami",
                Token("ada", key: "an-entirely-different-signing-key-of-sufficient-length"))),
            "This token is well formed and says sub=ada, and it was signed with a key you do "
                + "not know. Accepting it means anybody can be anybody - which is what the "
                + "shipped SignatureValidator does: it parses the token and calls that "
                + "validation.");

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.SendAsync(Get("/d20/strict/whoami",
                Token("ada", expires: DateTime.UtcNow.AddHours(-2)))),
            "This one expired two hours ago. A token whose lifetime is never checked is a "
                + "password that cannot be revoked.");

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.SendAsync(Get("/d20/strict/whoami", Token("ada", issuer: "somebody-else"))),
            "This one was minted by a different issuer. Skipping that check means every "
                + "system that happens to share your signing key can mint tokens for you - "
                + "which is exactly what happens the first time a key is copied between "
                + "environments.");

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.SendAsync(Get("/d20/strict/whoami", Token("ada", audience: "another-api"))),
            "And this one was minted for a different audience: a real token, for somebody "
                + "else's API, replayed at yours. The audience check is what stops that.");
    }

    [Fact]
    public async Task Ex2_401SaysWhoAnd403SaysWhat()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d20/vault"),
            "No token: 401. The server does not know who this is - reread README ex2.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d20/vault", Token("ada", role: "user"))),
            "This caller proved who they are and is not a keeper, so the answer is 403. A 401 "
                + "would tell them to authenticate, which they already did - and a client "
                + "that handles 401 by refreshing its token will loop forever on it.");

        var keeper = await client.SendAsync(Get("/d20/vault", Token("zoe", role: "keeper")));
        await Teach.Status(HttpStatusCode.OK, keeper, "A keeper may read the whole vault.");
        Teach.Equal("1,2,3,4", await Ids(keeper), "...all four entries.");
    }

    [Fact]
    public async Task Ex3_TheClientDoesNotGetToChooseTheOwner()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PostAsJsonAsync("/d20/entries", new { title = "x", body = "y" }),
            "No token: 401 - reread README ex3.");

        var blank = await client.SendAsync(Post("/d20/entries", Token("ada"),
            new { owner = "bo", title = "   ", body = "peak 4.2" }));
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank title is a 400.");
        Teach.True((await blank.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("title") == true,
            "...keyed \"title\".");

        var made = await client.SendAsync(Post("/d20/entries", Token("ada"),
            new { owner = "bo", title = "Vibration log", body = "peak 4.2" }));
        await Teach.Status(HttpStatusCode.Created, made, "A good entry is created: 201.");
        Teach.Equal("/d20/entries/5", made.Headers.Location?.ToString(), "...with a Location.");

        var body = await made.Content.ReadFromJsonAsync<EntryReadDto>();
        Teach.Equal(5, body?.Id, "...and the new id.");
        Teach.Equal("ada", body?.Owner,
            "The body asked for owner \"bo\" and the token says \"ada\". The token wins, "
                + "always. Trusting a client-supplied owner is how one user writes rows that "
                + "belong to another - and it is a one-line change to exploit once anybody "
                + "notices the field is honoured.");

        var stored = host.Services.GetRequiredService<D20Vault>().Find(5);
        Teach.Equal("ada", stored?.Owner, "...and that is what was actually stored.");
        Teach.Equal("Vibration log", stored?.Title, "...with the title from the body.");
    }

    [Fact]
    public async Task Ex4_NotYoursAndYouMayNotKnowItExists()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d20/entries/1"),
            "No token: 401 - reread README ex4.");

        var own = await client.SendAsync(Get("/d20/entries/1", Token("ada")));
        await Teach.Status(HttpStatusCode.OK, own, "Entry 1 belongs to ada.");
        Teach.Equal("Rotor spec", (await own.Content.ReadFromJsonAsync<EntryReadDto>())?.Title,
            "...and she may read it.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Get("/d20/entries/3", Token("ada"))),
            "Entry 3 belongs to bo. A 403 here would confirm that entry 3 exists, which is "
                + "information ada is not entitled to - an attacker can walk the id space and "
                + "map your whole database from nothing but the difference between 403 and "
                + "404. Make the two cases indistinguishable.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Get("/d20/entries/99", Token("ada"))),
            "...exactly as indistinguishable as an id that does not exist at all.");

        var keeper = await client.SendAsync(Get("/d20/entries/3", Token("zoe", role: "keeper")));
        await Teach.Status(HttpStatusCode.OK, keeper, "A keeper may read anybody's entry.");
        Teach.Equal("bo", (await keeper.Content.ReadFromJsonAsync<EntryReadDto>())?.Owner,
            "...and sees who it belongs to.");
    }

    [Fact]
    public async Task Ex5_AScopeIsAWholeWord()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PostAsync("/d20/entries/1/publish", null),
            "No token: 401 - reread README ex5.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Post("/d20/entries/1/publish", Token("ada", scope: "entries:read"), null)),
            "A read-only token may not publish. The caller is who they say they are, so this "
                + "is 403 - and the check has to happen, because the policy only proved the "
                + "token is valid, not that it is allowed to do THIS.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Post("/d20/entries/1/publish", Token("ada", scope: "entries:writer"), null)),
            "\"entries:writer\" is not \"entries:write\". A substring test on the raw scope "
                + "claim says it is, and that is a real privilege escalation - which is why "
                + "D20Scopes.Has splits on spaces and compares whole words.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Post("/d20/entries/3/publish", Token("ada", scope: "entries:read"), null)),
            "The scope is checked BEFORE the entry is looked up, so a read-only token gets "
                + "403 whether or not the entry is one it could have seen.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Post("/d20/entries/3/publish",
                Token("ada", scope: "entries:read entries:write"), null)),
            "With the right scope, entry 3 is bo's - and ex4's rule still holds: 404.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Post("/d20/entries/99/publish",
                Token("ada", scope: "entries:write"), null)),
            "...and so does the one for an id that does not exist.");

        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Post("/d20/entries/1/publish",
                Token("ada", scope: "entries:read entries:write"), null)),
            "Her own entry, with the write scope: 204.");
        Teach.True(host.Services.GetRequiredService<D20Vault>().Find(1)?.Published == true,
            "...and it really was published.");
    }

    [Fact]
    public async Task Ex6_AnonymousIsAllowedAndGetsLess()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/d20/entries/1/preview");
        await Teach.Status(HttpStatusCode.OK, anonymous,
            "This endpoint is open, so no token is NOT a 401 - reread README ex6.");
        var teaser = await anonymous.Content.ReadFromJsonAsync<PreviewReadDto>();
        Teach.Equal("Rotor spec", teaser?.Title, "...everybody sees the title...");
        Teach.Equal(null, teaser?.Body, "...and nobody unauthenticated sees the body.");

        var owner = await client.SendAsync(Get("/d20/entries/1/preview", Token("ada")));
        Teach.Equal("titanium, 12 blades",
            (await owner.Content.ReadFromJsonAsync<PreviewReadDto>())?.Body,
            "The owner's token unlocks the body. Because the endpoint is anonymous, "
                + "ClaimsPrincipal alone is empty here - the token has to be checked "
                + "explicitly, with HttpContext.AuthenticateAsync against the scheme.");

        var stranger = await client.SendAsync(Get("/d20/entries/1/preview", Token("bo")));
        await Teach.Status(HttpStatusCode.OK, stranger, "A stranger with a valid token is still 200.");
        Teach.Equal(null, (await stranger.Content.ReadFromJsonAsync<PreviewReadDto>())?.Body,
            "...and still gets no body. Authenticated is not the same as entitled.");

        var keeper = await client.SendAsync(Get("/d20/entries/1/preview", Token("zoe", role: "keeper")));
        Teach.Equal("titanium, 12 blades",
            (await keeper.Content.ReadFromJsonAsync<PreviewReadDto>())?.Body,
            "A keeper sees it, exactly as in ex4.");

        var forged = await client.SendAsync(Get("/d20/entries/1/preview",
            Token("ada", key: "an-entirely-different-signing-key-of-sufficient-length")));
        await Teach.Status(HttpStatusCode.OK, forged,
            "A token that does not validate is treated as no token at all - 200, not 401. "
                + "That is the contract for an open endpoint, and it is why the result of "
                + "AuthenticateAsync has to be checked rather than assumed.");
        Teach.Equal(null, (await forged.Content.ReadFromJsonAsync<PreviewReadDto>())?.Body,
            "...and, crucially, a forged token unlocks nothing.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d20/entries/99/preview"),
            "An entry that does not exist is still a 404, token or no token.");
    }

    [Fact]
    public async Task Ex7_TheSameEndpointAndTwoDifferentWorlds()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized, await client.GetAsync("/d20/reports"),
            "No token: 401 - reread README ex7.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Get("/d20/reports", Token("ada", scope: "entries:write"))),
            "A write-only token may not read. Scopes are not ordered - having one does not "
                + "imply having another.");

        var own = await client.SendAsync(Get("/d20/reports", Token("ada", scope: "entries:read")));
        await Teach.Status(HttpStatusCode.OK, own, "Ada may read her own.");
        Teach.Equal("1,2", await Ids(own),
            "...and only her own. Filtering by the token's subject in the QUERY is the "
                + "difference between an API that leaks and one that does not - a filter "
                + "applied in the client, or a check applied per row after loading them all, "
                + "is one refactor away from being forgotten.");
        Teach.Equal("own", own.Headers.GetValues("X-Result-Scope").Single(),
            "...and the header says which answer this is.");

        var all = await client.SendAsync(Get("/d20/reports", Token("zoe", role: "keeper", scope: "entries:read")));
        await Teach.Status(HttpStatusCode.OK, all, "A keeper with the read scope sees everything.");
        Teach.Equal("1,2,3,4", await Ids(all), "...all four.");
        Teach.Equal("all", all.Headers.GetValues("X-Result-Scope").Single(), "...and the header says so.");
    }

    [Fact]
    public async Task Ex8_EveryRuleInThisSetOnOneWrite()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.Unauthorized,
            await client.PutAsJsonAsync("/d20/entries/1", new { title = "x", body = "y" }),
            "No token: 401 - reread README ex8.");

        await Teach.Status(HttpStatusCode.Forbidden,
            await client.SendAsync(Put("/d20/entries/1", Token("ada", scope: "entries:read"),
                new { title = "x", body = "y" })),
            "A read-only token may not write: 403, and before anything is looked up.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Put("/d20/entries/3", Token("ada", scope: "entries:write"),
                new { title = "x", body = "y" })),
            "Entry 3 is bo's, so for ada it does not exist: 404.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.SendAsync(Put("/d20/entries/99", Token("ada", scope: "entries:write"),
                new { title = "x", body = "y" })),
            "...and neither does 99.");

        var blank = await client.SendAsync(Put("/d20/entries/1", Token("ada", scope: "entries:write"),
            new { owner = "bo", title = "  ", body = "y" }));
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "Her own entry, with the right scope, and a blank title: 400. The checks that can "
                + "be answered from the token come FIRST, and validation last.");
        Teach.True((await blank.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("title") == true,
            "...keyed \"title\".");

        var vault = host.Services.GetRequiredService<D20Vault>();
        Teach.Equal("Rotor spec", vault.Find(1)?.Title, "...and nothing was written.");

        await Teach.Status(HttpStatusCode.NoContent,
            await client.SendAsync(Put("/d20/entries/1", Token("ada", scope: "entries:write"),
                new { owner = "bo", title = "Rotor spec v2", body = "carbon, 10 blades" })),
            "And a valid replace is a 204.");

        var stored = vault.Find(1);
        Teach.Equal("Rotor spec v2", stored?.Title, "The title was written...");
        Teach.Equal("carbon, 10 blades", stored?.Body, "...and the body...");
        Teach.Equal("ada", stored?.Owner,
            "...and the OWNER was not. The body said \"bo\", and honouring that would let any "
                + "caller hand their own rows to somebody else - or take somebody else's. "
                + "Ownership comes from the token at creation and never from a payload after "
                + "it.");
    }

    // ... private helpers and DTO records, listed below ...
}
```

...where the helpers are `Token` (a signed JWT with whichever subject, role,
scope, expiry, key, issuer or audience the case needs), `Get`, `Post`, `Put`,
`Authorized` and `Ids`, followed by four `private sealed record` DTOs.
