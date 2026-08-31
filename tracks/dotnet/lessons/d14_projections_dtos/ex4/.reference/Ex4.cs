// d14_projections_dtos / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/films/quiet", Quiet);
    }

    private static async Task<IResult> Quiet(D14Db db)
    {
        // !Any() over a navigation is NOT EXISTS - the database answers the
        // absence question without either side being loaded.
        var rows = await db.Films
            .Where(f => !f.Screenings.Any())
            .OrderBy(f => f.Title)
            .Select(f => new QuietFilm(f.Title, f.Year))
            .ToListAsync();

        return TypedResults.Ok(rows);
    }
}
