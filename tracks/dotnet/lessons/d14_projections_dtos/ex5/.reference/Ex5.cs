// d14_projections_dtos / ex5 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/films/next-showing", NextShowings);
    }

    private static async Task<IResult> NextShowings(D14Db db)
    {
        // Two correlated subqueries, both evaluated per film by the database.
        // The casts to nullable are what let "no screenings" come back as null
        // instead of the CLR default for int and string.
        var rows = await db.Films
            .OrderBy(f => f.Title)
            .Select(f => new NextShowing(
                f.Id,
                f.Title,
                f.Screenings
                    .OrderBy(s => s.Day).ThenBy(s => s.Id)
                    .Select(s => (int?)s.Day)
                    .FirstOrDefault(),
                f.Screenings
                    .OrderBy(s => s.Day).ThenBy(s => s.Id)
                    .Select(s => (string?)s.Room)
                    .FirstOrDefault()))
            .ToListAsync();

        return TypedResults.Ok(rows);
    }
}
