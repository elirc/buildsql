# d16 - REST write drills

Eight problems on the write half of an HTTP API: 201 and where it put it, 204
and nothing else, replace against patch, a retry that must not do the work
twice, a state machine that says no, optimistic concurrency, and a batch that
is one write or none. They drill lesson **07_rest_crud** - go back to it if
"POST creates, PUT updates" is still the whole model.

The domain is a print shop's job queue (`src/Api/D16_RestWrites/Model.cs`) -
five jobs, seeded fresh for every gate. Because every exercise changes state,
the gates read the database back afterwards: a right-looking response over a
wrong row fails, and so does a rejected request that wrote something anyway.
Everything is under `/d16/...` and each exercise owns one file.

## Exercise 1 - a create says 201 and says where it put it

Edit `src/Api/D16_RestWrites/Ex1.cs`. `POST /d16/jobs` takes a `NewJob` and
answers **201** with the created `JobDto`, a `Location` header of
`/d16/jobs/{newId}`, and the row saved. A new job starts `"queued"`.

The shipped version saves correctly and then undersells it.

```
uv run dojo test dotnet d16_rest_writes ex1
```

## Exercise 2 - a delete is either gone or never there

Edit `src/Api/D16_RestWrites/Ex2.cs`. `DELETE /d16/jobs/{id}`:

- the job existed - **204**, with no body, and the row removed
- there was nothing to delete - **404**, including on a second delete of the
  same id

```
uv run dojo test dotnet d16_rest_writes ex2
```

## Exercise 3 - PUT replaces the whole thing

Edit `src/Api/D16_RestWrites/Ex3.cs`. `PUT /d16/jobs/{id}` takes a
`JobReplacement`:

- unknown id - 404
- blank title, `copies` below 1, or a `status` outside `D16Queue.Statuses` -
  **400** as a validation problem keyed `"title"` / `"copies"` / `"status"`,
  and nothing written
- otherwise **204**, having replaced the job - and a body with no `status`
  leaves it `"queued"`, because that is what replacing means

```
uv run dojo test dotnet d16_rest_writes ex3
```

## Exercise 4 - the retry that must not print twice

Edit `src/Api/D16_RestWrites/Ex4.cs`. `POST /d16/rush` creates a job with
status `"printing"`, keyed by the `Idempotency-Key` header:

- no header - **400** as a validation problem keyed `"Idempotency-Key"`, and
  nothing created
- a key never seen - **201** + `Location` + the new `JobDto`
- a key already used - **200** with the *same* `JobDto` and the same
  `Location`, no second row, **whatever this request body says**

```
uv run dojo test dotnet d16_rest_writes ex4
```

## Exercise 5 - PATCH touches only what was sent

Edit `src/Api/D16_RestWrites/Ex5.cs`. `PATCH /d16/jobs/{id}` takes a `JobPatch`
and changes only the fields actually present in the body. Unknown id: 404. A
blank title, `copies` below 1 or an unknown status: 400, keyed as in ex3.
Otherwise **200** with the full updated `JobDto`.

The shipped version treats a missing field as "set it to the default".

```
uv run dojo test dotnet d16_rest_writes ex5
```

## Exercise 6 - an action the state can refuse

Edit `src/Api/D16_RestWrites/Ex6.cs`. `POST /d16/jobs/{id}/cancel`:

- unknown id - 404
- the job's status is one of `D16Queue.Finished` - **409**, with its status
  left exactly as it was
- otherwise **204**, with the status now `"cancelled"`

```
uv run dojo test dotnet d16_rest_writes ex6
```

## Exercise 7 - the write that has to prove it read the current one

Edit `src/Api/D16_RestWrites/Ex7.cs`. Two endpoints:

- `GET /d16/jobs/{id}` - 200 with the `JobDto` and an `ETag` of
  `Tag(job.Version)`, or 404
- `PUT /d16/jobs/{id}/copies` - 404 for an unknown id; **428** when the request
  carries no `If-Match` at all; **412** when it carries one that is not the
  job's current tag, with nothing written; otherwise **204** with `copies`
  updated and `Version` bumped by one

```
uv run dojo test dotnet d16_rest_writes ex7
```

## Exercise 8 - a batch is one write or none of it

Edit `src/Api/D16_RestWrites/Ex8.cs`. `POST /d16/batches` takes a `NewBatch`:

- **400** as a validation problem when the reference is blank
  (`"reference"`), the items list is missing or empty (`"items"`), or any item
  has a blank title (`"items[i].title"`) or `copies` below 1
  (`"items[i].copies"`) - every offending key present at once, and **nothing**
  written
- otherwise **201** with `Location: /d16/batches/{id}` and a `BatchDto`: the
  batch id, its reference, and the ids of the jobs it created, ascending. Each
  job is `"queued"` and carries the batch id.

`GET /d16/batches/{id}` answers 200 with the same `BatchDto`, or 404.

```
uv run dojo test dotnet d16_rest_writes ex8
```

## The gate

This is the entire gate class, `tests/Gates/D16_RestWritesTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D16_RestWrites;

namespace DotnetDojo.Gates;

public class D16_RestWritesTests
{
    [Fact]
    public async Task Ex1_ACreateSays201AndSaysWhereItPutIt()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var created = await client.PostAsJsonAsync("/d16/jobs",
            new { title = "Show programme", copies = 120 });
        await Teach.Status(HttpStatusCode.Created, created,
            "A POST that made a new resource answers 201, not 200. 200 says \"here is the "
                + "result of your request\"; 201 says \"a new thing now exists\" - reread "
                + "README ex1.");

        Teach.Equal("/d16/jobs/6", created.Headers.Location?.ToString(),
            "...and it says WHERE, in the Location header. Without it the client has to "
                + "guess the id out of the body, or refetch the whole collection to find "
                + "what it just made.");

        var job = await created.Content.ReadFromJsonAsync<JobResponse>();
        Teach.Equal(6, job?.Id, "The body carries the server-assigned id.");
        Teach.Equal("Show programme", job?.Title, "...and the title it was given.");
        Teach.Equal(120, job?.Copies, "...and the copy count.");
        Teach.Equal("queued", job?.Status, "A new job starts queued.");

        Teach.Equal(6, host.Query(db => db.Jobs.Count()),
            "Five jobs were seeded and one was created, so six rows exist. A correct "
                + "response with five rows means nothing was saved.");
        Teach.Equal("Show programme:120:queued",
            host.Query(db => db.Jobs.Where(j => j.Id == 6)
                .Select(j => j.Title + ":" + j.Copies + ":" + j.Status).Single()),
            "...and the row holds what the body claimed.");
    }

    [Fact]
    public async Task Ex2_ADeleteIsEitherGoneOrNeverThere()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var gone = await client.DeleteAsync("/d16/jobs/3");
        await Teach.Status(HttpStatusCode.NoContent, gone,
            "A delete that succeeded has nothing to say, so it says it with 204 - reread "
                + "README ex2.");
        Teach.Equal(0, (await gone.Content.ReadAsByteArrayAsync()).Length,
            "...and 204 means NO content. A body here contradicts the status line.");

        Teach.Equal("1,2,4,5",
            host.Query(db => string.Join(",", db.Jobs.OrderBy(j => j.Id).Select(j => j.Id))),
            "Job 3 is gone and the other four are untouched.");

        await Teach.Status(HttpStatusCode.NotFound, await client.DeleteAsync("/d16/jobs/3"),
            "Deleting it a second time is a 404: there is no such job any more. Answering "
                + "204 again is defensible as \"the end state you asked for holds\", but "
                + "this API has chosen to tell the client its id is stale - and the README "
                + "says so, which is the part that matters.");

        await Teach.Status(HttpStatusCode.NotFound, await client.DeleteAsync("/d16/jobs/99"),
            "...and a job that never existed is the same 404.");

        Teach.Equal(4, host.Query(db => db.Jobs.Count()),
            "Neither failed delete removed anything else.");
    }

    [Fact]
    public async Task Ex3_PutReplacesTheWholeThing()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var full = await client.PutAsJsonAsync("/d16/jobs/5",
            new { title = "Badge sheets v2", copies = 80, status = "printing" });
        await Teach.Status(HttpStatusCode.NoContent, full,
            "A successful replace answers 204 - reread README ex3.");
        Teach.Equal("Badge sheets v2:80:printing", Describe(host, 5),
            "...having written all three fields.");

        var partial = await client.PutAsJsonAsync("/d16/jobs/5",
            new { title = "Badge sheets v3", copies = 25 });
        await Teach.Status(HttpStatusCode.NoContent, partial, "The second replace also succeeds.");
        Teach.Equal("Badge sheets v3:25:queued", Describe(host, 5),
            "The status was left out of the body, and PUT REPLACES the resource - so the "
                + "field that was not sent goes back to its default rather than keeping the "
                + "old value. Keeping \"printing\" here is PATCH semantics on a PUT, which "
                + "is how a client that sends a shrinking payload silently stops being able "
                + "to clear a field.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PutAsJsonAsync("/d16/jobs/99", new { title = "Nope", copies = 1 }),
            "There is no job 99 to replace: 404. PUT does not create one here.");

        var blank = await client.PutAsJsonAsync("/d16/jobs/1", new { title = "  ", copies = 10 });
        await Teach.Status(HttpStatusCode.BadRequest, blank, "A blank title is a 400.");
        Teach.True((await blank.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("title") == true,
            "...as a validation problem keyed \"title\".");

        var none = await client.PutAsJsonAsync("/d16/jobs/1", new { title = "Fine", copies = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, none, "Zero copies is a 400.");
        Teach.True((await none.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("copies") == true,
            "...keyed \"copies\".");

        var odd = await client.PutAsJsonAsync("/d16/jobs/1",
            new { title = "Fine", copies = 10, status = "paused" });
        await Teach.Status(HttpStatusCode.BadRequest, odd, "\"paused\" is not a status this queue has.");
        Teach.True((await odd.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("status") == true,
            "...keyed \"status\".");

        Teach.Equal("Poster run:250:queued", Describe(host, 1),
            "None of the three rejected requests wrote anything. Validate before you assign: "
                + "a handler that mutates the tracked entity and then decides to return 400 "
                + "has already changed it, and the next SaveChanges in that request commits "
                + "the damage.");
    }

    [Fact]
    public async Task Ex4_TheSameKeyPrintsTheRunOnce()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var naked = await client.PostAsJsonAsync("/d16/rush", new { title = "Urgent proofs", copies = 5 });
        await Teach.Status(HttpStatusCode.BadRequest, naked,
            "This endpoint cannot be retried safely without a key, so it refuses to run "
                + "without one - reread README ex4.");
        Teach.True((await naked.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("Idempotency-Key") == true,
            "...as a validation problem keyed \"Idempotency-Key\".");
        Teach.Equal(5, host.Query(db => db.Jobs.Count()), "...and nothing was created.");

        var first = await Keyed(client, "k-1", new { title = "Urgent proofs", copies = 5 });
        await Teach.Status(HttpStatusCode.Created, first, "A key never seen before creates: 201.");
        Teach.Equal("/d16/jobs/6", first.Headers.Location?.ToString(), "...with a Location.");
        var made = await first.Content.ReadFromJsonAsync<JobResponse>();
        Teach.Equal(6, made?.Id, "...and the new id.");
        Teach.Equal("printing", made?.Status, "A rush job goes straight to printing.");

        var retry = await Keyed(client, "k-1", new { title = "Different", copies = 99 });
        await Teach.Status(HttpStatusCode.OK, retry,
            "The same key came back - this is the client retrying a request it never saw "
                + "the answer to. Nothing new is created, so the answer is 200, not 201.");
        var replay = await retry.Content.ReadFromJsonAsync<JobResponse>();
        Teach.Equal(6, replay?.Id, "...and it is the SAME job.");
        Teach.Equal("Urgent proofs", replay?.Title,
            "...described exactly as it was created. The retry's body said \"Different\", and "
                + "an idempotency key means the FIRST request is the one that happened - "
                + "replay the stored result, do not apply the new payload.");
        Teach.Equal(5, replay?.Copies, "...including its copy count.");
        Teach.Equal("/d16/jobs/6", retry.Headers.Location?.ToString(),
            "...and the Location still points at it.");
        Teach.Equal(6, host.Query(db => db.Jobs.Count()),
            "Crucially, six rows - not seven. A second row here is a second print run, and "
                + "in a real shop somebody pays for the paper.");

        var other = await Keyed(client, "k-2", new { title = "Second rush", copies = 12 });
        await Teach.Status(HttpStatusCode.Created, other, "A different key is a different request: 201.");
        Teach.Equal(7, (await other.Content.ReadFromJsonAsync<JobResponse>())?.Id, "...and a new job.");
        Teach.Equal(7, host.Query(db => db.Jobs.Count()), "...so now there are seven.");
    }

    [Fact]
    public async Task Ex5_PatchTouchesOnlyWhatWasSent()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var bump = await client.PatchAsJsonAsync("/d16/jobs/1", new { copies = 300 });
        await Teach.Status(HttpStatusCode.OK, bump,
            "A PATCH answers 200 with the new state of the resource - reread README ex5.");
        var after = await bump.Content.ReadFromJsonAsync<JobResponse>();
        Teach.Equal(300, after?.Copies, "The copy count changed.");
        Teach.Equal("Poster run", after?.Title,
            "...and the title did NOT. The body never mentioned it, and \"not mentioned\" is "
                + "not the same as \"set it to empty\" - which is exactly what a null-coalesce "
                + "onto a default does.");
        Teach.Equal("queued", after?.Status, "...nor did the status.");

        await client.PatchAsJsonAsync("/d16/jobs/1", new { status = "printing" });
        Teach.Equal("Poster run:300:printing", Describe(host, 1),
            "The second patch changed only the status, and the 300 from the first one "
                + "survived it.");

        var nothing = await client.PatchAsJsonAsync("/d16/jobs/1", new { });
        await Teach.Status(HttpStatusCode.OK, nothing, "An empty patch is legal.");
        Teach.Equal("Poster run:300:printing", Describe(host, 1), "...and changes nothing.");

        var zero = await client.PatchAsJsonAsync("/d16/jobs/1", new { copies = 0 });
        await Teach.Status(HttpStatusCode.BadRequest, zero, "A copy count of zero is still invalid.");
        Teach.True((await zero.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("copies") == true,
            "...keyed \"copies\". A field that IS present is validated, whatever the verb.");

        var odd = await client.PatchAsJsonAsync("/d16/jobs/1", new { status = "paused" });
        await Teach.Status(HttpStatusCode.BadRequest, odd, "...and so is an unknown status.");

        var blank = await client.PatchAsJsonAsync("/d16/jobs/1", new { title = "  " });
        await Teach.Status(HttpStatusCode.BadRequest, blank, "...and a title of spaces.");

        Teach.Equal("Poster run:300:printing", Describe(host, 1),
            "None of the three rejections wrote anything.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PatchAsJsonAsync("/d16/jobs/99", new { copies = 1 }),
            "There is no job 99 to patch.");
    }

    [Fact]
    public async Task Ex6_CancelIsRefusedOnceTheJobIsFinished()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var stopped = await client.PostAsync("/d16/jobs/1/cancel", null);
        await Teach.Status(HttpStatusCode.NoContent, stopped,
            "Job 1 is queued, so cancelling it works and there is nothing to report: 204 - "
                + "reread README ex6.");
        Teach.Equal("Poster run:250:cancelled", Describe(host, 1), "...and the status changed.");

        var again = await client.PostAsync("/d16/jobs/1/cancel", null);
        await Teach.Status(HttpStatusCode.Conflict, again,
            "Cancelling a cancelled job is a 409: the request is well formed and the id is "
                + "real, but the resource is in a state that will not accept this. That is "
                + "neither a 400 (the client is not wrong about anything it sent) nor a 404 "
                + "(the job is right there).");
        Teach.Equal("Poster run:250:cancelled", Describe(host, 1), "...and nothing moved.");

        var finished = await client.PostAsync("/d16/jobs/3/cancel", null);
        await Teach.Status(HttpStatusCode.Conflict, finished,
            "Job 3 is done. Printed paper cannot be un-printed, so the same 409 applies.");
        Teach.Equal("Ticket books:500:done", Describe(host, 3),
            "...and it is still done, not quietly rewritten to cancelled.");

        await Teach.Status(HttpStatusCode.NoContent, await client.PostAsync("/d16/jobs/2/cancel", null),
            "Job 2 is printing, which is not finished - it can still be pulled.");
        Teach.Equal("Menu cards:60:cancelled", Describe(host, 2), "...and it was.");

        await Teach.Status(HttpStatusCode.NotFound, await client.PostAsync("/d16/jobs/99/cancel", null),
            "No job 99 to cancel.");
    }

    [Fact]
    public async Task Ex7_AWriteMustProveItSawTheCurrentVersion()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var read = await client.GetAsync("/d16/jobs/2");
        await Teach.Status(HttpStatusCode.OK, read,
            "GET /d16/jobs/2 must answer 200 - reread README ex7.");
        Teach.Equal("\"v1\"", read.Headers.ETag?.ToString(),
            "...carrying the job's version as an ETag. Without one, a client has nothing to "
                + "put in If-Match and the rest of this exercise cannot happen.");

        var blind = await client.PutAsJsonAsync("/d16/jobs/2/copies", new { copies = 75 });
        await Teach.Status(HttpStatusCode.PreconditionRequired, blind,
            "This write refuses to run without an If-Match: a client that did not say which "
                + "version it was editing cannot be told it lost a race. 428 asks for the "
                + "precondition rather than guessing.");
        Teach.Equal("Menu cards:60:printing", Describe(host, 2), "...and nothing was written.");

        var stale = await Matching(client, "\"v9\"", 75);
        await Teach.Status(HttpStatusCode.PreconditionFailed, stale,
            "The client named a version that is not the current one, so somebody else has "
                + "written since it read. 412 tells it to re-read and decide - which is the "
                + "whole point: the alternative is silently overwriting the other edit.");
        Teach.Equal("Menu cards:60:printing", Describe(host, 2), "...and, again, nothing written.");

        var good = await Matching(client, "\"v1\"", 75);
        await Teach.Status(HttpStatusCode.NoContent, good,
            "The tag matches, so the write goes through: 204.");
        Teach.Equal("Menu cards:75:printing", Describe(host, 2), "...and the copies changed.");
        Teach.Equal(2, host.Query(db => db.Jobs.Single(j => j.Id == 2).Version),
            "...and the version moved to 2. A version that never changes makes every ETag "
                + "permanently valid, which is the same as having none.");

        var reread = await client.GetAsync("/d16/jobs/2");
        Teach.Equal("\"v2\"", reread.Headers.ETag?.ToString(), "The next read hands out the new tag.");

        var replay = await Matching(client, "\"v1\"", 999);
        await Teach.Status(HttpStatusCode.PreconditionFailed, replay,
            "Replaying the old tag now fails, which is what makes this safe against a "
                + "retried request arriving after somebody else's edit.");
        Teach.Equal(75, host.Query(db => db.Jobs.Single(j => j.Id == 2).Copies),
            "...and 999 was never written.");

        var missing = new HttpRequestMessage(HttpMethod.Put, "/d16/jobs/99/copies")
        {
            Content = JsonContent.Create(new { copies = 5 }),
        };
        missing.Headers.TryAddWithoutValidation("If-Match", "\"v1\"");
        await Teach.Status(HttpStatusCode.NotFound, await client.SendAsync(missing),
            "A precondition on a resource that does not exist is still a 404 - there is "
                + "nothing to have a version.");
    }

    [Fact]
    public async Task Ex8_ABatchIsOneWriteOrNoneOfIt()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var unnamed = await client.PostAsJsonAsync("/d16/batches",
            new { reference = "", items = new[] { new { title = "Programme", copies = 200 } } });
        await Teach.Status(HttpStatusCode.BadRequest, unnamed,
            "A batch with no reference is a 400 - reread README ex8.");
        Teach.True((await unnamed.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("reference") == true,
            "...keyed \"reference\".");

        var empty = await client.PostAsJsonAsync("/d16/batches",
            new { reference = "R-1", items = Array.Empty<object>() });
        await Teach.Status(HttpStatusCode.BadRequest, empty,
            "A batch of nothing is not a batch.");
        Teach.True((await empty.Content.ReadFromJsonAsync<ValidationDto>())?.Errors?.ContainsKey("items") == true,
            "...keyed \"items\".");

        var mixed = await client.PostAsJsonAsync("/d16/batches", new
        {
            reference = "R-1",
            items = new object[]
            {
                new { title = "Programme", copies = 200 },
                new { title = "", copies = 0 },
            },
        });
        await Teach.Status(HttpStatusCode.BadRequest, mixed,
            "One item in the batch is unusable, so the whole batch is rejected.");
        var errors = (await mixed.Content.ReadFromJsonAsync<ValidationDto>())?.Errors;
        Teach.True(errors?.ContainsKey("items[1].title") == true,
            "...and the errors say WHICH item and WHICH field: \"items[1].title\". A single "
                + "\"invalid batch\" message makes the client bisect its own payload.");
        Teach.True(errors?.ContainsKey("items[1].copies") == true,
            "...both problems with that item at once, not just the first one found. "
                + "Collecting every error in one pass is what saves a client four round "
                + "trips.");
        Teach.Equal(5, host.Query(db => db.Jobs.Count()),
            "Item 0 was perfectly valid and must NOT have been created. Validate the whole "
                + "batch before writing any of it - a loop that saves as it goes leaves half "
                + "a batch behind and no way to tell which half.");
        Teach.Equal(0, host.Query(db => db.Batches.Count()), "...and no batch row either.");

        var made = await client.PostAsJsonAsync("/d16/batches", new
        {
            reference = "R-1",
            items = new object[]
            {
                new { title = "Programme", copies = 200 },
                new { title = "Wristbands", copies = 800 },
            },
        });
        await Teach.Status(HttpStatusCode.Created, made, "A valid batch is created: 201.");
        Teach.Equal("/d16/batches/1", made.Headers.Location?.ToString(),
            "...and Location points at the BATCH, which is the resource that was made - not "
                + "at one of the jobs inside it.");

        var body = await made.Content.ReadFromJsonAsync<BatchResponse>();
        Teach.Equal(1, body?.Id, "The batch got id 1.");
        Teach.Equal("R-1", body?.Reference, "...and kept its reference.");
        Teach.Equal("6,7", string.Join(",", body?.JobIds ?? []),
            "...and reports the ids of the two jobs it created, ascending.");

        Teach.Equal(7, host.Query(db => db.Jobs.Count()), "Five seeded plus two created.");
        Teach.Equal("Programme:queued:1,Wristbands:queued:1",
            host.Query(db => string.Join(",", db.Jobs.Where(j => j.BatchId != null)
                .OrderBy(j => j.Id)
                .Select(j => j.Title + ":" + j.Status + ":" + j.BatchId))),
            "...each queued and each stamped with the batch it belongs to.");

        var fetched = await client.GetAsync("/d16/batches/1");
        await Teach.Status(HttpStatusCode.OK, fetched,
            "The Location the create handed out has to actually resolve.");
        Teach.Equal("6,7", string.Join(",",
            (await fetched.Content.ReadFromJsonAsync<BatchResponse>())?.JobIds ?? []),
            "...to the same batch.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d16/batches/99"),
            "And a batch that does not exist is a 404.");
    }

    // ... private helpers and DTO records, listed below ...
}
```

...where the helpers are `NewHost` (a fresh in-memory SQLite database seeded
with five jobs), `Describe`, `Keyed` and `Matching`, followed by three
`private sealed record` DTOs.
