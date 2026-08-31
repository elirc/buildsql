// d13_efcore_tracking / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d13/board", Board);
    }

    private static async Task<IResult> Board(D13Db db)
    {
        // Untracked: formatting these objects is invisible to SaveChanges.
        var vans = await db.Vans.AsNoTracking().OrderBy(v => v.Plate).ToListAsync();
        foreach (var van in vans)
        {
            van.Status = van.Status.ToUpperInvariant();
        }

        db.BoardViews.Add(new BoardView { Note = "board viewed" });
        await db.SaveChangesAsync();

        return TypedResults.Ok(vans.Select(v => new BoardRow(v.Id, v.Plate, v.Status)).ToList());
    }
}
