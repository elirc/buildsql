// d14_projections_dtos / ex3 - the status is computed in the query.
// See lessons/d14_projections_dtos/README.md, "Exercise 3".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/screenings/board", Board);
    }

    // 200 with every screening as a ScreeningBoardRow, id ascending. Status:
    //   sold >= seats             -> "sold out"
    //   sold is 80% or more       -> "filling"   (integer math: sold*10 >= seats*8)
    //   anything else             -> "open"
    // Compute it inside the projection - the database can do this arithmetic.
    private static async Task<IResult> Board(D14Db db)
    {
        // TODO ex3: every screening is reported as "open". Fold the two
        // thresholds into the Select with conditional expressions.
        var rows = await db.Screenings
            .OrderBy(s => s.Id)
            .Select(s => new ScreeningBoardRow(s.Id, s.Film!.Title, s.Room, "open"))
            .ToListAsync();

        return TypedResults.Ok(rows);
    }
}
