# d17 - validation drills

Eight problems on saying no usefully: collecting every error instead of the
first, normalising before judging, rules that belong to a combination of fields
rather than to one, indexed and dotted error keys, requirements that only exist
sometimes, and the line between "your request is malformed" and "your request
is impossible". They drill lesson **07_rest_crud** - go back to it if a 400
with the word "invalid" in it still feels like enough.

The domain is a veterinary clinic's booking desk (`src/Api/D17_Validation/Model.cs`):
four species, three vets who each treat some of them, and a day that runs from
08:00 to 18:00. Nothing is stored - every exercise is about the decision and the
shape of the answer. **The gates read the `errors` dictionary key by key**, so
the key you file an error under is graded as strictly as the status code.
Everything is under `/d17/...` and each exercise owns one file.

## Exercise 1 - every problem, in one answer

Edit `src/Api/D17_Validation/Ex1.cs`. `POST /d17/visits` takes a
`VisitRequest`:

- `petName` - 1 to 40 characters once trimmed, key `"petName"`
- `species` - one of `D17Clinic.Species`, key `"species"`
- `durationMinutes` - 10 to 120 inclusive, key `"durationMinutes"`

400 as a validation problem with **every** offending key present, or 200 with a
`VisitAccepted`. The shipped version reports one problem per round trip.

```
uv run dojo test dotnet d17_validation ex1
```

## Exercise 2 - normalise first, then judge

Edit `src/Api/D17_Validation/Ex2.cs`. `POST /d17/owners` takes an
`OwnerRequest`, cleans each field, validates the cleaned form, and echoes the
cleaned form back in an `OwnerAccepted`:

- `name` - trimmed; blank after trimming is an error (`"name"`)
- `email` - trimmed and lowercased; exactly one `@`, with something on each
  side (`"email"`)
- `phone` - spaces, dashes and parentheses removed; 10 to 13 digits must
  remain (`"phone"`)

```
uv run dojo test dotnet d17_validation ex2
```

## Exercise 3 - the rule that belongs to no single field

Edit `src/Api/D17_Validation/Ex3.cs`. `POST /d17/slots` takes a `SlotRequest`.
Per field: `startHour` is 8 to 17 (`"startHour"`), `durationMinutes` is 10 to
120 (`"durationMinutes"`).

Then one more rule, and only when both fields are individually valid: the slot
must end by 18:00, reported under the **form-level key `""`**. 200 with a
`SlotAccepted` otherwise - minutes since midnight, so 17:00 is 1020.

```
uv run dojo test dotnet d17_validation ex3
```

## Exercise 4 - errors that say which item

Edit `src/Api/D17_Validation/Ex4.cs`. `POST /d17/rounds` takes a
`RoundRequest`:

- a missing or empty list - one error keyed `"visits"`
- otherwise every visit gets ex1's rules under `"visits[i].petName"`,
  `"visits[i].species"` and `"visits[i].durationMinutes"`
- and no two visits may name the same pet, compared case-insensitively, with
  the **later** one reported under `"visits[j].petName"`

200 with a `RoundAccepted` when the round is clean.

```
uv run dojo test dotnet d17_validation ex4
```

## Exercise 5 - the keys follow the shape of the body

Edit `src/Api/D17_Validation/Ex5.cs`. `POST /d17/registrations` takes a
`RegistrationRequest`. A missing block is **one** error at the block, not one
per field inside it:

- `"owner"`, then `"owner.name"`, `"owner.address"`,
  `"owner.address.line1"`, `"owner.address.postcode"`
- `"pet"`, then `"pet.name"`, `"pet.species"`

The postcode is trimmed and uppercased before matching
`^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$`, and the normalised form is what
comes back in the `RegistrationAccepted`.

```
uv run dojo test dotnet d17_validation ex5
```

## Exercise 6 - a rule that only exists sometimes

Edit `src/Api/D17_Validation/Ex6.cs`. `POST /d17/exotic-visits` takes an
`ExoticRequest`. `species` must be known (`"species"`), and then:

- species `"exotic"` - `permitNumber` is **required** and must look like
  `EX-1234` (`"permitNumber"`)
- any other species - `permitNumber` must be **absent**; sending one is an
  error (`"permitNumber"`)
- `sedation` true - `sedationNote` is required and non-blank
  (`"sedationNote"`)
- `sedation` false - sending a note is an error (`"sedationNote"`)

The three rules are independent and all fire together.

```
uv run dojo test dotnet d17_validation ex6
```

## Exercise 7 - malformed, or merely impossible

Edit `src/Api/D17_Validation/Ex7.cs`.
`POST /d17/vets/{code}/appointments` takes an `AppointmentRequest`:

- `{code}` names no vet - **404**
- something in the request is wrong - **400** as a validation problem:
  `"species"`, `"startHour"`, `"durationMinutes"`, or `""` for a slot ending
  after 18:00
- the request is entirely well formed and this vet does not treat that species
  - **422** as a `ProblemDetails` with a `detail` saying why
- otherwise 200 with an `AppointmentAccepted` naming the vet

```
uv run dojo test dotnet d17_validation ex7
```

## Exercise 8 - the whole desk, in one request

Edit `src/Api/D17_Validation/Ex8.cs`. `POST /d17/bookings` takes a
`BookingRequest` and applies every layer above at once:

- **400** for a blank or unknown `vetCode` (`"vetCode"` - here the vet is a
  field of the body, not a segment of the URL), a missing owner (`"owner"`) or
  blank owner name (`"owner.name"`), a missing or empty visit list
  (`"visits"`), any visit failing ex1's rules or repeating a pet name
  (`"visits[i]..."`), and a `startHour` outside 8 to 17 (`"startHour"`)
- then, **only when all of those pass**, a round that would run past 18:00,
  under `""`
- then, **only when that passes**, **422** if the chosen vet does not treat one
  of the species asked for
- otherwise **201** with `Location: /d17/bookings/{reference}` and a
  `BookingAccepted`, where the reference is `"{vetCode}-{startHour}"` - for
  example `cy-9`

```
uv run dojo test dotnet d17_validation ex8
```

## The gate

This is the entire gate class, `tests/Gates/D17_ValidationTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text;

namespace DotnetDojo.Gates;

public class D17_ValidationTests
{
    [Fact]
    public async Task Ex1_EveryProblemInOneAnswer()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var good = await client.PostAsJsonAsync("/d17/visits",
            new { petName = "Mango", species = "cat", durationMinutes = 30 });
        await Teach.Status(HttpStatusCode.OK, good,
            "A well-formed visit is accepted - reread README ex1.");
        Teach.Equal("Mango", (await good.Content.ReadFromJsonAsync<VisitDto>())?.PetName,
            "...and echoed back.");

        var bad = await client.PostAsJsonAsync("/d17/visits",
            new { petName = "", species = "llama", durationMinutes = 5 });
        await Teach.Status(HttpStatusCode.BadRequest, bad, "Three things are wrong with this one.");
        var keys = await Keys(bad);
        Teach.Equal("durationMinutes,petName,species", keys,
            "All THREE have to be reported at once. Returning on the first failure costs the "
                + "client a round trip per mistake, and a form that can only highlight one "
                + "field at a time is the visible symptom.");

        var longName = await client.PostAsJsonAsync("/d17/visits",
            new { petName = new string('x', 41), species = "dog", durationMinutes = 30 });
        await Teach.Status(HttpStatusCode.BadRequest, longName, "41 characters is one too many.");
        Teach.Equal("petName", await Keys(longName), "...and that is the only thing wrong.");

        await Teach.Status(HttpStatusCode.OK, await client.PostAsJsonAsync("/d17/visits",
            new { petName = "Mango", species = "dog", durationMinutes = 10 }),
            "Ten minutes is the shortest legal visit - the bound is inclusive.");
        await Teach.Status(HttpStatusCode.OK, await client.PostAsJsonAsync("/d17/visits",
            new { petName = "Mango", species = "dog", durationMinutes = 120 }),
            "...and 120 the longest.");
        await Teach.Status(HttpStatusCode.BadRequest, await client.PostAsJsonAsync("/d17/visits",
            new { petName = "Mango", species = "dog", durationMinutes = 121 }),
            "...so 121 is not.");
    }

    [Fact]
    public async Task Ex2_NormaliseFirstThenJudge()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var good = await client.PostAsJsonAsync("/d17/owners", new
        {
            name = "  Ada Vance  ",
            email = " ADA@Vet.TEST ",
            phone = "(020) 7946-0991",
        });
        await Teach.Status(HttpStatusCode.OK, good,
            "Every one of these three values is acceptable once it has been cleaned up - "
                + "reread README ex2.");

        var owner = await good.Content.ReadFromJsonAsync<OwnerDto>();
        Teach.Equal("Ada Vance", owner?.Name,
            "The echoed name is trimmed. Validating the raw string and then storing the raw "
                + "string means two records that are the same person do not compare equal.");
        Teach.Equal("ada@vet.test", owner?.Email,
            "...and the email is lowercased, so a login lookup can be an equality test.");
        Teach.Equal("02079460991", owner?.Phone,
            "...and the phone keeps only its digits.");

        var blank = await client.PostAsJsonAsync("/d17/owners",
            new { name = "   ", email = "ada@vet.test", phone = "02079460991" });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A name of three spaces is not a name. It is only empty AFTER trimming, which is "
                + "why the order matters: normalise, then judge.");
        Teach.Equal("name", await Keys(blank), "...keyed \"name\".");

        Teach.Equal("email", await Keys(await client.PostAsJsonAsync("/d17/owners",
            new { name = "Ada", email = "ada@@vet.test", phone = "02079460991" })),
            "Two at signs is not one at sign.");
        Teach.Equal("email", await Keys(await client.PostAsJsonAsync("/d17/owners",
            new { name = "Ada", email = "@vet.test", phone = "02079460991" })),
            "...and neither side of the at sign may be empty.");
        Teach.Equal("phone", await Keys(await client.PostAsJsonAsync("/d17/owners",
            new { name = "Ada", email = "ada@vet.test", phone = "12345" })),
            "Five digits is not a phone number.");

        Teach.Equal("email,name,phone", await Keys(await client.PostAsJsonAsync("/d17/owners",
            new { name = " ", email = "nope", phone = "12" })),
            "...and when all three are wrong, all three are reported.");
    }

    [Fact]
    public async Task Ex3_TheRuleThatBelongsToNoSingleField()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var fits = await client.PostAsJsonAsync("/d17/slots", new { startHour = 17, durationMinutes = 60 });
        await Teach.Status(HttpStatusCode.OK, fits,
            "17:00 plus an hour ends exactly at closing, which is fine - reread README ex3.");
        var slot = await fits.Content.ReadFromJsonAsync<SlotDto>();
        Teach.Equal(1020, slot?.StartMinute, "17:00 is minute 1020.");
        Teach.Equal(1080, slot?.EndMinute, "...and 18:00 is 1080.");

        var overruns = await client.PostAsJsonAsync("/d17/slots", new { startHour = 17, durationMinutes = 90 });
        await Teach.Status(HttpStatusCode.BadRequest, overruns,
            "17:00 plus ninety minutes runs half an hour past closing.");
        var keys = await Keys(overruns);
        Teach.Equal("", keys,
            "Neither field is wrong on its own - 17 is a legal start and 90 is a legal "
                + "length - so blaming either one sends the client to fix something that is "
                + "not broken. A rule about a COMBINATION goes under the form-level key, "
                + "which is the empty string.");

        Teach.Equal("startHour", await Keys(await client.PostAsJsonAsync("/d17/slots",
            new { startHour = 7, durationMinutes = 60 })),
            "07:00 is before opening.");
        Teach.Equal("startHour", await Keys(await client.PostAsJsonAsync("/d17/slots",
            new { startHour = 18, durationMinutes = 30 })),
            "...and 18:00 is too late to start anything.");

        Teach.Equal("durationMinutes,startHour", await Keys(await client.PostAsJsonAsync("/d17/slots",
            new { startHour = 7, durationMinutes = 5 })),
            "Both fields are individually wrong, and the cross-field rule does NOT also fire. "
                + "It has nothing to say about values that are already invalid, and a third "
                + "error here would be noise.");

        await Teach.Status(HttpStatusCode.OK, await client.PostAsJsonAsync("/d17/slots",
            new { startHour = 8, durationMinutes = 120 }),
            "Opening time plus the longest visit still fits.");
    }

    [Fact]
    public async Task Ex4_ErrorsThatSayWhichItem()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        Teach.Equal("visits", await Keys(await client.PostAsJsonAsync("/d17/rounds",
            new { visits = (object?)null })),
            "No list at all is one error about the list - reread README ex4.");
        Teach.Equal("visits", await Keys(await client.PostAsJsonAsync("/d17/rounds",
            new { visits = Array.Empty<object>() })),
            "...and so is an empty one. A round of no visits is not a round.");

        var good = await client.PostAsJsonAsync("/d17/rounds", new
        {
            visits = new object[]
            {
                new { petName = "Mango", species = "cat", durationMinutes = 30 },
                new { petName = "Pip", species = "rabbit", durationMinutes = 45 },
                new { petName = "Rune", species = "dog", durationMinutes = 20 },
            },
        });
        await Teach.Status(HttpStatusCode.OK, good, "Three clean visits are accepted.");
        var round = await good.Content.ReadFromJsonAsync<RoundDto>();
        Teach.Equal(3, round?.Visits, "Three of them.");
        Teach.Equal(95, round?.TotalMinutes, "...adding up to 95 minutes.");

        var broken = await client.PostAsJsonAsync("/d17/rounds", new
        {
            visits = new object[]
            {
                new { petName = "Mango", species = "cat", durationMinutes = 30 },
                new { petName = "", species = "llama", durationMinutes = 5 },
            },
        });
        await Teach.Status(HttpStatusCode.BadRequest, broken, "The second visit is unusable.");
        Teach.Equal(
            "visits[1].durationMinutes,visits[1].petName,visits[1].species",
            await Keys(broken),
            "Each key names the INDEX and the field. A single \"visits\" error makes the "
                + "client bisect its own payload; an unindexed \"petName\" makes it guess "
                + "which one. And visit 0 is fine, so nothing about it appears.");

        var twice = await client.PostAsJsonAsync("/d17/rounds", new
        {
            visits = new object[]
            {
                new { petName = "Mango", species = "cat", durationMinutes = 30 },
                new { petName = "mango", species = "dog", durationMinutes = 20 },
            },
        });
        await Teach.Status(HttpStatusCode.BadRequest, twice,
            "The same pet cannot be seen twice in one round, and \"mango\" is \"Mango\".");
        Teach.Equal("visits[1].petName", await Keys(twice),
            "The LATER one is the problem: the first mention was legitimate, so blaming "
                + "index 0 tells the client to delete the wrong row.");
    }

    [Fact]
    public async Task Ex5_TheKeysFollowTheShapeOfTheBody()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var nothing = await client.PostAsJsonAsync("/d17/registrations", new { });
        await Teach.Status(HttpStatusCode.BadRequest, nothing,
            "An empty registration is missing both halves - reread README ex5.");
        Teach.Equal("owner,pet", await Keys(nothing),
            "TWO errors, one per missing object - not one per field inside them. A client "
                + "that forgot the owner block does not need to be told its name, address, "
                + "line 1 and postcode are all missing too.");

        var thin = await client.PostAsJsonAsync("/d17/registrations", new
        {
            owner = new { name = "", address = (object?)null },
            pet = new { name = "", species = "llama" },
        });
        await Teach.Status(HttpStatusCode.BadRequest, thin, "Now the blocks are there and empty.");
        Teach.Equal("owner.address,owner.name,pet.name,pet.species", await Keys(thin),
            "Dotted paths that mirror the body, so a form can bind each message to the field "
                + "that produced it. \"owner.address.line1\" must NOT appear - there is no "
                + "address to have a line 1.");

        var bent = await client.PostAsJsonAsync("/d17/registrations", new
        {
            owner = new { name = "Ada Vance", address = new { line1 = "", postcode = "nope" } },
            pet = new { name = "Mango", species = "cat" },
        });
        await Teach.Status(HttpStatusCode.BadRequest, bent, "The address itself is wrong now.");
        Teach.Equal("owner.address.line1,owner.address.postcode", await Keys(bent),
            "...three levels deep, and only the two fields that are actually wrong.");

        var good = await client.PostAsJsonAsync("/d17/registrations", new
        {
            owner = new { name = "  Ada Vance ", address = new { line1 = "7 Kiln Row", postcode = " ec1a 1bb " } },
            pet = new { name = " Mango ", species = "cat" },
        });
        await Teach.Status(HttpStatusCode.OK, good, "This one is fine once it is cleaned up.");
        var reg = await good.Content.ReadFromJsonAsync<RegistrationDto>();
        Teach.Equal("EC1A 1BB", reg?.Postcode,
            "...and the postcode comes back normalised, which is the only form worth storing.");
        Teach.Equal("Ada Vance", reg?.Owner, "...with the names trimmed.");
        Teach.Equal("Mango", reg?.Pet, "...both of them.");
    }

    [Fact]
    public async Task Ex6_ARuleThatOnlyExistsSometimes()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.OK, await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "exotic", permitNumber = "EX-4417", sedation = false }),
            "An exotic with a well-formed permit is fine - reread README ex6.");

        Teach.Equal("permitNumber", await Keys(await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "exotic", sedation = false })),
            "An exotic with no permit is not. The requirement exists only for this species, "
                + "which is why it cannot be expressed as \"required\" on the field.");

        Teach.Equal("permitNumber", await Keys(await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "exotic", permitNumber = "4417", sedation = false })),
            "...and a permit that is not shaped like EX-1234 is not a permit.");

        Teach.Equal("permitNumber", await Keys(await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "cat", permitNumber = "EX-4417", sedation = false })),
            "The rule runs in the other direction too: a cat has no permit, so sending one "
                + "means the client thinks it is booking something it is not. Silently "
                + "ignoring the field is how that misunderstanding survives to production.");

        Teach.Equal("sedationNote", await Keys(await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "cat", sedation = true })),
            "Sedation requires a note.");
        Teach.Equal("sedationNote", await Keys(await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "cat", sedation = true, sedationNote = "   " })),
            "...and a note of spaces is not a note.");
        Teach.Equal("sedationNote", await Keys(await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "cat", sedation = false, sedationNote = "light" })),
            "...and a note with no sedation is the same mismatch as a permit with no exotic.");

        await Teach.Status(HttpStatusCode.OK, await client.PostAsJsonAsync("/d17/exotic-visits",
            new { species = "cat", sedation = true, sedationNote = "light, pre-dental" }),
            "Sedation plus a note is fine.");

        Teach.Equal("permitNumber,sedationNote,species", await Keys(await client.PostAsJsonAsync(
            "/d17/exotic-visits", new { species = "llama", permitNumber = "EX-1", sedation = true })),
            "All three rules are independent, so all three fire at once. \"llama\" is not "
                + "\"exotic\", so the permit is unwanted; the permit is also malformed, but "
                + "unwanted is the complaint that matters.");
    }

    [Fact]
    public async Task Ex7_MalformedOrMerelyImpossible()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsJsonAsync(
            "/d17/vets/zz/appointments", new { species = "cat", startHour = 9, durationMinutes = 30 }),
            "There is no vet zz, so the resource in the URL does not exist - reread README ex7.");

        var garbage = await client.PostAsync("/d17/vets/ash/appointments",
            new StringContent("{ not json at all", Encoding.UTF8, "application/json"));
        await Teach.Status(HttpStatusCode.BadRequest, garbage,
            "A body the framework cannot even parse is a 400, and you get that for free - "
                + "the handler never runs. Worth confirming, because people write a "
                + "try/catch around the binding that turns it into a 500.");

        Teach.Equal("species", await Keys(await client.PostAsJsonAsync("/d17/vets/ash/appointments",
            new { species = "llama", startHour = 9, durationMinutes = 30 })),
            "\"llama\" is not a species this clinic has, which is a fact about the REQUEST: "
                + "400.");

        Teach.Equal("startHour", await Keys(await client.PostAsJsonAsync("/d17/vets/ash/appointments",
            new { species = "cat", startHour = 7, durationMinutes = 30 })),
            "...and so is a start before opening.");

        Teach.Equal("", await Keys(await client.PostAsJsonAsync("/d17/vets/ash/appointments",
            new { species = "cat", startHour = 17, durationMinutes = 90 })),
            "...and ex3's cross-field rule still applies, under the same form-level key.");

        var wrongVet = await client.PostAsJsonAsync("/d17/vets/ash/appointments",
            new { species = "rabbit", startHour = 9, durationMinutes = 30 });
        await Teach.Status(HttpStatusCode.UnprocessableEntity, wrongVet,
            "Now nothing at all is wrong with the request: rabbit is a species, 09:00 is a "
                + "legal time, thirty minutes is a legal length, and ash is a real vet. The "
                + "server understood every word and still cannot do it, because Ash Merrow "
                + "does not treat rabbits. That is 422, not 400 - there is no field the "
                + "client could fix by looking at its own payload.");
        var problem = await wrongVet.Content.ReadFromJsonAsync<ProblemDto>();
        Teach.Equal(422, problem?.Status,
            "...and the ProblemDetails body repeats the status, so a client that only reads "
                + "the body still knows.");
        Teach.True(!string.IsNullOrWhiteSpace(problem?.Detail),
            "...with a detail saying why. A bare 422 is a shrug.");

        var fine = await client.PostAsJsonAsync("/d17/vets/cy/appointments",
            new { species = "rabbit", startHour = 9, durationMinutes = 30 });
        await Teach.Status(HttpStatusCode.OK, fine, "Cy Okafor does treat rabbits.");
        var made = await fine.Content.ReadFromJsonAsync<AppointmentDto>();
        Teach.Equal("Cy Okafor", made?.Vet, "...and the answer names the vet.");
        Teach.Equal(540, made?.StartMinute, "09:00 is minute 540.");
        Teach.Equal(570, made?.EndMinute, "...and half an hour later is 570.");
    }

    [Fact]
    public async Task Ex8_TheWholeDeskInOneRequest()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var booked = await client.PostAsJsonAsync("/d17/bookings", new
        {
            vetCode = "cy",
            owner = new { name = "Ada Vance" },
            visits = new object[]
            {
                new { petName = "Mango", species = "cat", durationMinutes = 30 },
                new { petName = "Pip", species = "rabbit", durationMinutes = 45 },
            },
            startHour = 9,
        });
        await Teach.Status(HttpStatusCode.Created, booked,
            "A booking that survives every rule is created: 201 - reread README ex8.");
        Teach.Equal("/d17/bookings/cy-9", booked.Headers.Location?.ToString(),
            "...with a Location.");

        var body = await booked.Content.ReadFromJsonAsync<BookingDto>();
        Teach.Equal("cy-9", body?.Reference, "The reference is the vet and the hour.");
        Teach.Equal("Ada Vance", body?.Owner, "...the owner comes back trimmed.");
        Teach.Equal("Mango,Pip", string.Join(",", body?.Pets ?? []), "...with both pets, in order.");
        Teach.Equal(540, body?.StartMinute, "Starting at 09:00.");
        Teach.Equal(615, body?.EndMinute, "...and running 75 minutes, to 10:15.");

        var mess = await client.PostAsJsonAsync("/d17/bookings", new
        {
            vetCode = "zz",
            owner = (object?)null,
            visits = new object[]
            {
                new { petName = "Mango", species = "cat", durationMinutes = 30 },
                new { petName = "mango", species = "llama", durationMinutes = 5 },
            },
            startHour = 20,
        });
        await Teach.Status(HttpStatusCode.BadRequest, mess, "This one is wrong in six ways.");
        Teach.Equal(
            "owner,startHour,vetCode,visits[1].durationMinutes,visits[1].petName,visits[1].species",
            await Keys(mess),
            "Every layer reports at once: the unknown vet, the missing owner block, the "
                + "impossible hour, and the second visit's three problems - including the "
                + "duplicate pet name. And the form-level key is absent, because a round "
                + "built out of invalid parts has no meaningful total length to complain "
                + "about.");

        var overruns = await client.PostAsJsonAsync("/d17/bookings", new
        {
            vetCode = "ash",
            owner = new { name = "Ada Vance" },
            visits = new object[]
            {
                new { petName = "Mango", species = "cat", durationMinutes = 120 },
                new { petName = "Rune", species = "dog", durationMinutes = 120 },
            },
            startHour = 16,
        });
        await Teach.Status(HttpStatusCode.BadRequest, overruns,
            "Four hours of appointments starting at 16:00 does not fit before closing.");
        Teach.Equal("", await Keys(overruns),
            "...and, exactly as in ex3, no single field is to blame: the vet is real, the "
                + "hour is legal and each visit is a legal length. It is the total that does "
                + "not fit.");

        var wrongVet = await client.PostAsJsonAsync("/d17/bookings", new
        {
            vetCode = "ash",
            owner = new { name = "Ada Vance" },
            visits = new object[] { new { petName = "Pip", species = "rabbit", durationMinutes = 30 } },
            startHour = 9,
        });
        await Teach.Status(HttpStatusCode.UnprocessableEntity, wrongVet,
            "And when nothing is malformed at all, the last check is the one that cannot be "
                + "expressed as a bad field: Ash Merrow does not treat rabbits. 422, after "
                + "every 400 has had its chance.");
    }

    // ... private helpers and DTO records, listed below ...
}
```

...where the helper is `Keys` (every error key the response reported, sorted and
comma separated) and there are nine `private sealed record` DTOs.
