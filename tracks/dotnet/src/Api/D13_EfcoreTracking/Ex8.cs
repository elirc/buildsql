// d13_efcore_tracking / ex8 - sync the fleet, all or nothing.
// See lessons/d13_efcore_tracking/README.md, "Exercise 8".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d13/sync", Sync);
    }

    // The nightly odometer sync. 400 when the batch is empty. 404 with a
    // SyncError naming the FIRST offending index when an id does not exist;
    // 409 with a SyncError when a reading is lower than what the database
    // holds. Either way NOTHING is written. On success: apply every reading,
    // one SELECT for the whole batch and one SaveChanges, and answer 200 with
    // a SyncResult counting the items applied.
    private static async Task<IResult> Sync(List<SyncItem>? items, D13Db db)
    {
        if (items is null || items.Count == 0)
        {
            return TypedResults.BadRequest("the batch is empty.");
        }

        // TODO ex8: one round trip PER ITEM, and it saves as it goes - by the
        // time item 3 turns out to be invalid, items 1 and 2 are already in
        // the database. Validate the whole batch against ONE query first;
        // only then assign and save once.
        int updated = 0;
        for (int i = 0; i < items.Count; i++)
        {
            var van = await db.Vans.FindAsync(items[i].Id);
            if (van is null)
            {
                return TypedResults.NotFound(new SyncError(i, $"no van {items[i].Id}"));
            }

            van.Mileage = items[i].Mileage;
            await db.SaveChangesAsync();
            updated++;
        }

        return TypedResults.Ok(new SyncResult(updated));
    }
}
