// d13_efcore_tracking / ex1 - reads must not stick.
// See lessons/d13_efcore_tracking/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d13/board", Board);
    }

    // 200 with every van as a BoardRow - id, plate, STATUS UPPERCASED for the
    // wall display - ordered by plate A-Z. Every view also records one
    // BoardView audit row (that part already works). The uppercase belongs to
    // the response alone: the database must keep its lowercase statuses.
    private static async Task<IResult> Board(D13Db db)
    {
        // TODO ex1: this version leaks the display formatting into the
        // database. The vans are tracked, the uppercase assignment is a
        // change, and the audit SaveChanges below writes it.
        var vans = await db.Vans.OrderBy(v => v.Plate).ToListAsync();
        foreach (var van in vans)
        {
            van.Status = van.Status.ToUpperInvariant();
        }

        db.BoardViews.Add(new BoardView { Note = "board viewed" });
        await db.SaveChangesAsync();

        return TypedResults.Ok(vans.Select(v => new BoardRow(v.Id, v.Plate, v.Status)).ToList());
    }
}
