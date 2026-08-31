// d14_projections_dtos / ex3 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/screenings/board", Board);
    }

    private static async Task<IResult> Board(D14Db db)
    {
        // The conditional translates to a CASE expression, so the status is
        // computed by the database and never travels as raw seat counts.
        var rows = await db.Screenings
            .OrderBy(s => s.Id)
            .Select(s => new ScreeningBoardRow(
                s.Id,
                s.Film!.Title,
                s.Room,
                s.Sold >= s.Seats
                    ? "sold out"
                    : s.Sold * 10 >= s.Seats * 8
                        ? "filling"
                        : "open"))
            .ToListAsync();

        return TypedResults.Ok(rows);
    }
}
