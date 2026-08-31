# d21 - authorization policy drills

Eight problems on the object that decides: policies as an AND of requirements,
requirements as an OR of handlers, a handler that has to see the request, a
handler that has to see the resource, a veto that beats every success, and a
policy applied where it cannot be forgotten. They drill lesson
**09_auth_and_testing** - go back to it if a policy still means
`RequireAuthenticatedUser()`.

The domain is a hospital shift roster (`src/Api/D21_AuthorizationPolicies/Model.cs`):
four shifts across two wards, one of them locked, a `charge` role, and tokens
carrying `ward` and `grade` claims. The scheme `d21-bearer` is given and
correct - by the time any of these policies run, the token is already valid.
Everything is under `/d21/...` and each exercise owns one file, including its
own policies and handlers.

Note the routing: `/d21/roster/locked` and `/d21/roster/leads` are literal
segments, so they outrank ex2's `/d21/roster/{ward}` and reach ex3 and ex4.

## Exercise 1 - a policy is a list of requirements

Edit `src/Api/D21_AuthorizationPolicies/Ex1.cs`, `Ex1Services` only.
`GET /d21/roster` returns every shift, id ascending - but only for ward staff:

- no token - 401
- a valid token with **no `ward` claim** - **403**
- a token with a `ward` claim - 200

```
uv run dojo test dotnet d21_authorization_policies ex1
```

## Exercise 2 - a requirement that has to look at the request

Edit `src/Api/D21_AuthorizationPolicies/Ex2.cs`, `Ex2Services` only.
`GET /d21/roster/{ward}` returns that ward's shifts - and the caller may read a
ward when it is **their own**, **or** when they are the charge nurse. That is an
OR, and the ward being asked for is a route value.

```
uv run dojo test dotnet d21_authorization_policies ex2
```

## Exercise 3 - a requirement and the handler that decides it

Edit `src/Api/D21_AuthorizationPolicies/Ex3.cs`. `MinimumGradeRequirement` is
given and the policy is wired; the handler agrees with everybody. Make it
succeed only when the caller's `grade` claim is at least
`requirement.Grade` - the bound comes from the requirement, and `D21Claims.GradeOf`
returns 0 for a caller with no grade. Exactly 5 passes a minimum of 5.

`GET /d21/roster/locked` returns the locked shifts.

```
uv run dojo test dotnet d21_authorization_policies ex3
```

## Exercise 4 - two handlers, one requirement

Edit `src/Api/D21_AuthorizationPolicies/Ex4.cs`. A ward lead is somebody at
grade 8 or above **or** the charge nurse. The grade handler is given. Write
`WardLeadByRoleHandler` and register it - as a second handler, not as an extra
clause in the first.

`GET /d21/roster/leads` returns the wards, alphabetically.

```
uv run dojo test dotnet d21_authorization_policies ex4
```

## Exercise 5 - the decision needs the thing being decided about

Edit `src/Api/D21_AuthorizationPolicies/Ex5.cs`.
`PUT /d21/shifts/{id}/day` takes a `DayChange`, in this order:

1. no such shift - 404
2. `D21Policies.EditShift` refuses this caller for **this shift** - 403
3. `day` outside 1 to 7 - 400 validation problem keyed `"day"`
4. otherwise 204, with the day written

Fill in `ShiftOwnerHandler` (the owner or the charge nurse) and call
`IAuthorizationService.AuthorizeAsync(user, shift, policy)` from the endpoint.

```
uv run dojo test dotnet d21_authorization_policies ex5
```

## Exercise 6 - one policy, a whole group

Edit `src/Api/D21_AuthorizationPolicies/Ex6.cs`. `D21Policies.Ops` is correct
and nothing applies it, so `/d21/ops/summary` and `/d21/ops/wards` are wide
open. Apply it to the **group**, once.

```
uv run dojo test dotnet d21_authorization_policies ex6
```

## Exercise 7 - a handler that says no and means it

Edit `src/Api/D21_AuthorizationPolicies/Ex7.cs`. `DELETE /d21/shifts/{id}` is
given and correct: 404 for an unknown shift, 403 when `D21Policies.DeleteShift`
refuses, otherwise 204.

`ShiftRemovalOwnerHandler` is given: the owner or the charge nurse may remove a
shift. Make `ShiftLockHandler` stop a **locked** shift being removed by anybody
at all - including the charge nurse, whose handler has already succeeded on that
same requirement.

```
uv run dojo test dotnet d21_authorization_policies ex7
```

## Exercise 8 - the policy and the handler agree

Edit `src/Api/D21_AuthorizationPolicies/Ex8.cs`. `POST /d21/shifts` needs a
caller who is on a ward **and** is senior (grade 5 or above) - no handler
required. Then:

- `day` outside 1 to 7 - 400 validation problem keyed `"day"`
- otherwise 201 with `Location: /d21/shifts/{newId}` and the created
  `ShiftDto`, whose `doctor` is the caller's subject and whose `ward` is the
  caller's **ward claim**

`NewShift.Ward` is a trap.

```
uv run dojo test dotnet d21_authorization_policies ex8
```

## The gate

This is the entire gate class, `tests/Gates/D21_AuthorizationPoliciesTests.cs`:

```csharp
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
}
```

...where the helpers are `Token` (a signed JWT with whichever subject, role,
ward or grade the case needs), `Get`, `Delete`, `Put`, `Post`, `Authorized` and
`Ids`, followed by three `private sealed record` DTOs.
