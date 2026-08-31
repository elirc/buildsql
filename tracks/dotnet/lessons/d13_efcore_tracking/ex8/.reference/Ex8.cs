// d13_efcore_tracking / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d13/sync", Sync);
    }

    private static async Task<IResult> Sync(List<SyncItem>? items, D13Db db)
    {
        if (items is null || items.Count == 0)
        {
            return TypedResults.BadRequest("the batch is empty.");
        }

        // ONE query brings back every van the batch mentions.
        var ids = items.Select(i => i.Id).ToList();
        var vans = await db.Vans
            .Where(v => ids.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id);

        // Validate the whole batch before assigning anything.
        for (int i = 0; i < items.Count; i++)
        {
            if (!vans.ContainsKey(items[i].Id))
            {
                return TypedResults.NotFound(new SyncError(i, $"no van {items[i].Id}"));
            }
        }

        for (int i = 0; i < items.Count; i++)
        {
            if (items[i].Mileage < vans[items[i].Id].Mileage)
            {
                return TypedResults.Conflict(new SyncError(i, "odometers do not run backwards."));
            }
        }

        // Only now touch the tracked entities, and save once.
        foreach (var item in items)
        {
            vans[item.Id].Mileage = item.Mileage;
        }

        await db.SaveChangesAsync();

        return TypedResults.Ok(new SyncResult(items.Count));
    }
}
