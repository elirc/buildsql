using System.Net;
using System.Net.Http.Json;
using DotnetDojo.Api.D13_EfcoreTracking;

namespace DotnetDojo.Gates;

public class D13_EfcoreTrackingTests
{
    [Fact]
    public async Task Ex1_TheDisplayFormattingStaysOutOfTheDatabase()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d13/board");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d13/board must answer 200 - reread README ex1.");

        var rows = await response.Content.ReadFromJsonAsync<List<BoardDto>>();
        Teach.Equal("1,2,3,4,5", string.Join(",", (rows ?? []).Select(r => r.Id)),
            "Plates sort KA-101, KA-202, KB-303, KB-404, KC-505 - so the ids come out 1..5.");
        Teach.Equal("READY,REPAIR,READY,RETIRED,READY",
            string.Join(",", (rows ?? []).Select(r => r.Status)),
            "The board shows every status uppercased.");

        Teach.Equal(1, host.Query(db => db.BoardViews.Count()),
            "One view, one audit row - the given audit code must stay.");

        Teach.Equal("ready,repair,ready,retired,ready",
            host.Query(db => string.Join(",", db.Vans.OrderBy(v => v.Plate).Select(v => v.Status))),
            "The DATABASE statuses are uppercase now. The vans were tracked, the display "
                + "assignment counted as a change, and the audit SaveChanges wrote it. A "
                + "read-only query must not track - AsNoTracking, or project before you "
                + "format.");

        await client.GetAsync("/d13/board");
        Teach.Equal(2, host.Query(db => db.BoardViews.Count()),
            "...and a second view records a second audit row.");
        Teach.Equal("ready,repair,ready,retired,ready",
            host.Query(db => string.Join(",", db.Vans.OrderBy(v => v.Plate).Select(v => v.Status))),
            "...still without touching the vans.");
    }

    [Fact]
    public async Task Ex2_LoadAssignSaveAndNothingElseChanges()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var ok = await client.PutAsJsonAsync("/d13/vans/1/mileage", new { mileage = 42750 });
        await Teach.Status(HttpStatusCode.NoContent, ok,
            "A successful mileage update is 204 - reread README ex2.");
        Teach.Equal(2, host.Commands.Count,
            "Two round trips: the SELECT that loads the van and the UPDATE that SaveChanges "
                + "sends. More means extra queries; fewer means you never read the row you "
                + "are changing.");

        var van = host.Query(db => db.Vans.Single(v => v.Id == 1));
        Teach.Equal(42750, van.Mileage, "The mileage really changed.");
        Teach.Equal("KA-101", van.Plate,
            "The plate must survive the update. \"\" here means a fabricated entity was "
                + "Update()d over the real row: every column you did not copy got written "
                + "as its default.");
        Teach.Equal("north", van.Depot, "...and so must the depot.");
        Teach.Equal("ready", van.Status, "...and the status.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PutAsJsonAsync("/d13/vans/1/mileage", new { mileage = 100 }),
            "42750 down to 100 is an odometer running backwards: 400.");
        Teach.Equal(42750, host.Query(db => db.Vans.Single(v => v.Id == 1).Mileage),
            "...and the rejected reading was not written.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PutAsJsonAsync("/d13/vans/99/mileage", new { mileage = 1 }),
            "There is no van 99: 404, not an exception. You can only answer that if you "
                + "looked.");
    }

    [Fact]
    public async Task Ex3_SavingAnUnchangedVanWritesNothing()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var same = await client.PutAsJsonAsync("/d13/vans/3/depot", new { depot = "south" });
        await Teach.Status(HttpStatusCode.OK, same,
            "PUT /d13/vans/3/depot must answer 200 - reread README ex3.");
        Teach.Equal(false, (await same.Content.ReadFromJsonAsync<ChangeDto>())?.Changed,
            "Van 3 is already in \"south\". Change detection compares against the snapshot "
                + "taken at load time and finds nothing to do - Changed must be false. "
                + "Update() would stamp every property modified and report a write that "
                + "changed nothing.");
        Teach.Equal(1, host.Commands.Count,
            "...and the whole no-op move costs ONE round trip: the SELECT. SaveChanges with "
                + "nothing detected sends no UPDATE at all.");

        host.Commands.Reset();
        var moved = await client.PutAsJsonAsync("/d13/vans/3/depot", new { depot = "east" });
        Teach.Equal(true, (await moved.Content.ReadFromJsonAsync<ChangeDto>())?.Changed,
            "A real move reports Changed = true.");
        Teach.Equal(2, host.Commands.Count, "...and costs the SELECT plus one UPDATE.");
        Teach.Equal("east", host.Query(db => db.Vans.Single(v => v.Id == 3).Depot),
            "...which really happened.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PutAsJsonAsync("/d13/vans/99/depot", new { depot = "east" }),
            "No van 99: 404.");
        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PutAsJsonAsync("/d13/vans/3/depot", new { depot = " " }),
            "A blank depot: 400.");
    }

    [Fact]
    public async Task Ex4_TheSecondFetchIsFree()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.GetAsync("/d13/vans/2/recheck");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d13/vans/2/recheck must answer 200 - reread README ex4.");

        var report = await response.Content.ReadFromJsonAsync<RecheckDto>();
        Teach.Equal("KA-202", report?.Plate, "Van 2 is KA-202.");
        Teach.Equal(true, report?.SameInstance,
            "Both fetches must hand back the SAME object. A tracked context keeps an "
                + "identity map keyed on the primary key; two different instances mean the "
                + "second fetch bypassed it (AsNoTracking) or you never let the tracker see "
                + "the first one.");
        Teach.Equal(1, host.Commands.Count,
            "...and the double-check cost exactly ONE query. Find checks the tracker "
                + "before it builds SQL; a second FirstOrDefault always goes to the "
                + "database.");

        host.Commands.Reset();
        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d13/vans/99/recheck"),
            "No van 99: 404.");
        Teach.Equal(1, host.Commands.Count,
            "...and discovering that costs one query, not two.");
    }

    [Fact]
    public async Task Ex5_OneRoundTripReplacesTheWholeVan()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var ok = await client.PutAsJsonAsync("/d13/vans/4",
            new { plate = "KB-440", depot = "west", mileage = 12500, status = "ready" });
        await Teach.Status(HttpStatusCode.NoContent, ok,
            "A successful replacement is 204 - reread README ex5.");
        Teach.Equal(1, host.Commands.Count,
            "ONE round trip: the UPDATE. A count of 2 means you SELECTed first - attach "
                + "the payload as a modified entity instead and let the row count tell you "
                + "whether it existed.");

        var van = host.Query(db => db.Vans.Single(v => v.Id == 4));
        Teach.Equal("KB-440", van.Plate, "The plate was replaced.");
        Teach.Equal("west", van.Depot, "...and the depot.");
        Teach.Equal(12500, van.Mileage, "...and the mileage.");
        Teach.Equal("ready", van.Status, "...and the status.");

        host.Commands.Reset();
        await Teach.Status(HttpStatusCode.NotFound,
            await client.PutAsJsonAsync("/d13/vans/99",
                new { plate = "XX-999", depot = "west", mileage = 1, status = "ready" }),
            "Replacing a van that does not exist is 404. Without a SELECT you learn that "
                + "from SaveChanges itself: zero rows affected surfaces as "
                + "DbUpdateConcurrencyException.");
        Teach.Equal(1, host.Commands.Count,
            "...and the discovery still cost only the one UPDATE attempt.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PutAsJsonAsync("/d13/vans/4",
                new { plate = "", depot = "west", mileage = 1, status = "ready" }),
            "A blank plate is 400.");
        Teach.Equal("KB-440", host.Query(db => db.Vans.Single(v => v.Id == 4).Plate),
            "...and nothing was written.");
    }

    [Fact]
    public async Task Ex6_TheReportShowsTheMileageAfterTheBump()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var response = await client.PostAsJsonAsync("/d13/depots/north/service-bump",
            new { amount = 500 });
        await Teach.Status(HttpStatusCode.OK, response,
            "POST /d13/depots/north/service-bump must answer 200 - reread README ex6.");

        var rows = await response.Content.ReadFromJsonAsync<List<DepotVanDto>>();
        Teach.Equal("1:42500,2:31000", string.Join(",", (rows ?? []).Select(r => $"{r.Id}:{r.Mileage}")),
            "North holds vans 1 (42000) and 2 (30500); after a 500 bump the report must "
                + "say 42500 and 31000. The seeded numbers mean the list you loaded BEFORE "
                + "ExecuteUpdate is still being reported - a bulk update never touches "
                + "objects that are already materialised.");

        Teach.True(host.Commands.Count <= 3,
            $"The bump took {host.Commands.Count} round trips; three is the budget "
                + "(the UPDATE, the fresh read, and at most one existence check).");

        Teach.Equal(42500, host.Query(db => db.Vans.Single(v => v.Id == 1).Mileage),
            "...and the database really was bumped.");

        await Teach.Status(HttpStatusCode.NotFound,
            await client.PostAsJsonAsync("/d13/depots/nowhere/service-bump", new { amount = 10 }),
            "A depot with no vans: 404.");
        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PostAsJsonAsync("/d13/depots/north/service-bump", new { amount = 0 }),
            "A zero bump: 400.");
        Teach.Equal(42500, host.Query(db => db.Vans.Single(v => v.Id == 1).Mileage),
            "...and neither rejection changed anything.");
    }

    [Fact]
    public async Task Ex7_TheTrackerDoesNotSeeWhatWrotePastIt()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d13/vans/5/tuneup");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d13/vans/5/tuneup must answer 200 - reread README ex7.");

        var report = await response.Content.ReadFromJsonAsync<TuneupDto>();
        Teach.Equal(60025, report?.Mileage,
            "Van 5 was seeded at 60000 and the calibration adds 25, so the report must say "
                + "60025. 60000 means the re-query LOOKED fresh but was not: for a row the "
                + "context already tracks, query results are discarded in favour of the "
                + "tracked instance. Read it untracked, or with a projection, or never "
                + "track it in the first place.");

        Teach.Equal(60025, host.Query(db => db.Vans.Single(v => v.Id == 5).Mileage),
            "The calibration itself ran exactly once: the database holds 60025. 60050 "
                + "means Apply was called twice.");

        await Teach.Status(HttpStatusCode.NotFound, await client.GetAsync("/d13/vans/99/tuneup"),
            "No van 99: 404 - and no calibration.");
        Teach.Equal(60025, host.Query(db => db.Vans.Single(v => v.Id == 5).Mileage),
            "...and the 404 path changed nothing.");
    }

    [Fact]
    public async Task Ex8_TheWholeBatchOrNoneOfIt()
    {
        using var host = NewHost();
        using var client = host.CreateClient();

        host.Commands.Reset();
        var ok = await client.PostAsJsonAsync("/d13/sync", new[]
        {
            new { id = 1, mileage = 43000 },
            new { id = 3, mileage = 88500 },
            new { id = 5, mileage = 61000 },
        });
        await Teach.Status(HttpStatusCode.OK, ok,
            "A clean sync is 200 - reread README ex8.");
        Teach.Equal(3, (await ok.Content.ReadFromJsonAsync<SyncResultDto>())?.Updated,
            "Three readings applied.");
        Teach.Equal(4, host.Commands.Count,
            "The whole batch costs ONE read: a single SELECT bringing back every involved "
                + "van (ids.Contains(v.Id)), then three writes - the SQLite provider sends "
                + "one UPDATE per changed row, so 1 + 3 = 4. Six means you fetched per "
                + "item as well; more than six means you also saved per item.");
        Teach.Equal("43000,30500,88500,12000,61000",
            host.Query(db => string.Join(",", db.Vans.OrderBy(v => v.Id).Select(v => v.Mileage))),
            "...and exactly the three synced vans changed.");

        var missing = await client.PostAsJsonAsync("/d13/sync", new[]
        {
            new { id = 1, mileage = 44000 },
            new { id = 99, mileage = 1 },
        });
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "Item 1 names a van that does not exist: 404 for the batch.");
        Teach.Equal(1, (await missing.Content.ReadFromJsonAsync<SyncErrorDto>())?.Index,
            "...and the error names WHICH item.");
        Teach.Equal(43000, host.Query(db => db.Vans.Single(v => v.Id == 1).Mileage),
            "Crucially, van 1's valid reading was NOT applied. Validate the whole batch "
                + "before you assign anything - saving as you go leaves half a bad batch "
                + "behind.");

        var backwards = await client.PostAsJsonAsync("/d13/sync", new[]
        {
            new { id = 3, mileage = 90000 },
            new { id = 5, mileage = 100 },
        });
        await Teach.Status(HttpStatusCode.Conflict, backwards,
            "Item 1 winds van 5 backwards: 409 for the batch.");
        Teach.Equal(1, (await backwards.Content.ReadFromJsonAsync<SyncErrorDto>())?.Index,
            "...naming the offending item.");
        Teach.Equal(88500, host.Query(db => db.Vans.Single(v => v.Id == 3).Mileage),
            "...and van 3's valid reading was not applied either.");

        await Teach.Status(HttpStatusCode.BadRequest,
            await client.PostAsJsonAsync("/d13/sync", Array.Empty<object>()),
            "An empty batch is 400.");
    }

    // ... private helpers and DTO records, listed below ...

    private static SqliteHost<D13Db> NewHost() =>
        new SqliteHost<D13Db>().Seed(db =>
        {
            db.Vans.AddRange(
                new Van { Id = 1, Plate = "KA-101", Depot = "north", Mileage = 42000, Status = "ready" },
                new Van { Id = 2, Plate = "KA-202", Depot = "north", Mileage = 30500, Status = "repair" },
                new Van { Id = 3, Plate = "KB-303", Depot = "south", Mileage = 88000, Status = "ready" },
                new Van { Id = 4, Plate = "KB-404", Depot = "south", Mileage = 12000, Status = "retired" },
                new Van { Id = 5, Plate = "KC-505", Depot = "east", Mileage = 60000, Status = "ready" });
            db.Inspections.Add(new InspectionLog { Id = 1, VanId = 2, Note = "brake pads" });
        });

    private sealed record BoardDto(int Id, string? Plate, string? Status);

    private sealed record ChangeDto(bool Changed);

    private sealed record RecheckDto(string? Plate, bool SameInstance);

    private sealed record DepotVanDto(int Id, int Mileage);

    private sealed record TuneupDto(int Id, int Mileage);

    private sealed record SyncResultDto(int Updated);

    private sealed record SyncErrorDto(int Index, string? Message);
}
